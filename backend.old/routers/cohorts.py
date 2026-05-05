"""
Beta Cohort & Payment Router
============================
Handles the beta scholarship funnel:

GET  /api/v1/cohorts                       — list active cohorts (public)
GET  /api/v1/cohorts/{slug}                — cohort detail + current seat/price (public)
POST /api/v1/cohorts/{slug}/initiate       — create Midtrans Snap token for the current tier price
POST /api/v1/cohorts/{slug}/confirm        — Midtrans payment notification webhook
POST /api/v1/admin/cohorts                 — create / update cohort (admin only)

Pricing logic (tiered, based on seats_sold at time of request):
  seats  1-100  → $1
  seats 101-200 → $2
  ...
  seats 901-1000→ $10

USD→IDR conversion: 1 USD = IDR_RATE (env: IDR_RATE, default 16000)
Midtrans Snap API: https://snap-docs.midtrans.com/
"""

from __future__ import annotations

import hashlib
import hmac
import json
import logging
import os
import uuid
from datetime import datetime
from typing import List, Optional

import httpx
from fastapi import APIRouter, BackgroundTasks, Depends, Header, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

import sql_models as models
from database import get_db
from routers.auth_utils import require_self_or_admin, resolve_auth_context
from services.email_service import send_transactional_email
from services.payment_service import collect_order_state, expire_stale_pending_payments, set_payment_expiry

logger = logging.getLogger("cohorts")
router = APIRouter(prefix="/api/v1", tags=["cohorts"])
limiter = Limiter(key_func=get_remote_address)

# ── Config ───────────────────────────────────────────────────────────────────

_IDR_RATE = int(os.getenv("IDR_RATE", "16000"))
_FF_HYBRID_ONBOARDING = os.getenv("FF_HYBRID_ONBOARDING", "true").lower() != "false"
_FF_EMAIL_EVENTS = os.getenv("FF_EMAIL_EVENTS", "true").lower() != "false"

DEFAULT_PRICING_TIERS = [
    {"max_seat": 100,  "price_usd": 1},
    {"max_seat": 200,  "price_usd": 2},
    {"max_seat": 300,  "price_usd": 3},
    {"max_seat": 400,  "price_usd": 4},
    {"max_seat": 500,  "price_usd": 5},
    {"max_seat": 600,  "price_usd": 6},
    {"max_seat": 700,  "price_usd": 7},
    {"max_seat": 800,  "price_usd": 8},
    {"max_seat": 900,  "price_usd": 9},
    {"max_seat": 1000, "price_usd": 10},
]


# ── Helpers ──────────────────────────────────────────────────────────────────

def _current_price_usd(cohort: models.BetaCohort) -> float:
    tiers = cohort.pricing_tiers or DEFAULT_PRICING_TIERS
    seats = cohort.seats_sold
    for tier in sorted(tiers, key=lambda t: t["max_seat"]):
        if seats < tier["max_seat"]:
            return float(tier["price_usd"])
    return float(tiers[-1]["price_usd"])


def _seats_remaining(cohort: models.BetaCohort) -> int:
    return max(0, cohort.seat_cap - cohort.seats_sold)


def _require_admin(authorization: Optional[str], db: Session) -> None:
    from routers.admin_settings import _require_admin as _ra
    _ra(authorization, db)


def _read_admin_secret(db: Session, key_name: str) -> Optional[str]:
    """Read encrypted admin secret if available, else None."""
    try:
        from routers.admin_settings import AdminSecret, _decrypt
    except Exception:
        return None

    row = db.query(AdminSecret).filter(AdminSecret.key_name == key_name).first()
    if not row:
        return None
    try:
        return _decrypt(row.encrypted_value)
    except Exception as e:
        logger.warning("Failed to decrypt admin secret %s: %s", key_name, e)
        return None


def _midtrans_config(db: Session) -> dict:
    server_key = _read_admin_secret(db, "MIDTRANS_SERVER_KEY") or os.getenv("MIDTRANS_SERVER_KEY", "")
    client_key = _read_admin_secret(db, "MIDTRANS_CLIENT_KEY") or os.getenv("MIDTRANS_CLIENT_KEY", "")
    env = (
        _read_admin_secret(db, "MIDTRANS_ENV")
        or os.getenv("MIDTRANS_ENV", "sandbox")
    ).lower()
    is_prod = env == "production"
    snap_url = (
        "https://app.midtrans.com/snap/v1/transactions"
        if is_prod
        else "https://app.sandbox.midtrans.com/snap/v1/transactions"
    )
    return {
        "server_key": server_key,
        "client_key": client_key,
        "env": env,
        "is_prod": is_prod,
        "snap_url": snap_url,
    }


# ── Schemas ──────────────────────────────────────────────────────────────────

class CohortPublic(BaseModel):
    id: int
    slug: str
    name: str
    description: Optional[str]
    seat_cap: int
    seats_sold: int
    seats_remaining: int
    current_price_usd: float
    current_price_idr: int
    is_active: bool
    pricing_tiers: list

    class Config:
        from_attributes = True


class InitiatePaymentRequest(BaseModel):
    user_id: int
    email: str
    full_name: str
    course_ids: List[int]   # learner's chosen 2 course IDs


class InitiatePaymentResponse(BaseModel):
    order_id: str
    snap_token: str
    snap_redirect_url: str
    amount_usd: float
    amount_idr: int


class OrderStatusResponse(BaseModel):
    order_id: str
    count: int
    statuses: list


class ResendLifecycleEmailRequest(BaseModel):
    user_id: int
    template_key: str


class CohortCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    seat_cap: int = 1000
    pricing_tiers: Optional[list] = None
    fixed_course_ids: Optional[List[int]] = None
    midtrans_merchant_id: Optional[str] = None


class MidtransPublicConfig(BaseModel):
    client_key: str
    env: str


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/integrations/midtrans-public", response_model=MidtransPublicConfig)
def get_midtrans_public_config(db: Session = Depends(get_db)):
    """Public-safe Midtrans config for frontend checkout (client key only)."""
    mt = _midtrans_config(db)
    return MidtransPublicConfig(
        client_key=mt.get("client_key", "") or "",
        env=mt.get("env", "sandbox") or "sandbox",
    )

@router.get("/cohorts", response_model=List[CohortPublic])
def list_cohorts(db: Session = Depends(get_db)):
    cohorts = db.query(models.BetaCohort).filter(models.BetaCohort.is_active == True).all()
    result = []
    for c in cohorts:
        result.append(CohortPublic(
            id=c.id, slug=c.slug, name=c.name, description=c.description,
            seat_cap=c.seat_cap, seats_sold=c.seats_sold,
            seats_remaining=_seats_remaining(c),
            current_price_usd=_current_price_usd(c),
            current_price_idr=int(_current_price_usd(c) * _IDR_RATE),
            is_active=c.is_active,
            pricing_tiers=c.pricing_tiers or DEFAULT_PRICING_TIERS,
        ))
    return result


@router.get("/cohorts/{slug}", response_model=CohortPublic)
def get_cohort(slug: str, db: Session = Depends(get_db)):
    c = db.query(models.BetaCohort).filter(models.BetaCohort.slug == slug).first()
    if not c:
        raise HTTPException(status_code=404, detail="Cohort not found")
    return CohortPublic(
        id=c.id, slug=c.slug, name=c.name, description=c.description,
        seat_cap=c.seat_cap, seats_sold=c.seats_sold,
        seats_remaining=_seats_remaining(c),
        current_price_usd=_current_price_usd(c),
        current_price_idr=int(_current_price_usd(c) * _IDR_RATE),
        is_active=c.is_active,
        pricing_tiers=c.pricing_tiers or DEFAULT_PRICING_TIERS,
    )


@router.get("/cohorts/{slug}/payment-config")
def get_cohort_payment_config(slug: str, db: Session = Depends(get_db)):
    """Returns Midtrans config and current cohort pricing for payment page."""
    c = db.query(models.BetaCohort).filter(models.BetaCohort.slug == slug).first()
    if not c:
        raise HTTPException(status_code=404, detail="Cohort not found")
    
    mt = _midtrans_config(db)
    return {
        "client_key": mt.get("client_key", "") or "",
        "env": mt.get("env", "sandbox") or "sandbox",
        "cohort_slug": c.slug,
        "current_price_usd": _current_price_usd(c),
        "current_price_idr": int(_current_price_usd(c) * _IDR_RATE),
        "seats_remaining": _seats_remaining(c),
    }


@limiter.limit("10/minute")
@router.post("/cohorts/{slug}/initiate")
async def initiate_payment(
    slug: str,
    payload: "InitiatePaymentRequest",
    request: Request,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    """
    Creates Midtrans Snap token for the current tiered price.
    Also creates pending Enrollment rows (2 courses) locked at this price.
    Does NOT auto-create CDIO projects (beta tier is decoupled from IRIS).
    """
    auth = resolve_auth_context(authorization, db)
    require_self_or_admin(auth, payload.user_id)
    expire_stale_pending_payments(db)
    mt = _midtrans_config(db)

    cohort = db.execute(
        select(models.BetaCohort).where(models.BetaCohort.slug == slug).with_for_update()
    ).scalar_one_or_none()
    if not cohort or not cohort.is_active:
        raise HTTPException(status_code=404, detail="Cohort not found or inactive")
    if _seats_remaining(cohort) <= 0:
        raise HTTPException(status_code=409, detail="Cohort is full")

    if len(payload.course_ids) != 2:
        raise HTTPException(status_code=400, detail="Exactly 2 course IDs required")
    if len(set(payload.course_ids)) != 2:
        raise HTTPException(status_code=400, detail="Course IDs must be unique")

    # Validate selected courses exist
    for cid in payload.course_ids:
        exists = db.query(models.Course.id).filter(models.Course.id == cid).first()
        if not exists:
            raise HTTPException(status_code=404, detail=f"Course not found: {cid}")

    # Reuse existing pending transaction if one exists for this user+cohort
    existing_pending = db.query(models.Enrollment).filter(
        models.Enrollment.user_id == payload.user_id,
        models.Enrollment.cohort_id == cohort.id,
        models.Enrollment.payment_status == "pending",
    ).order_by(models.Enrollment.enrolled_at.desc()).with_for_update().first()
    if existing_pending and existing_pending.payment_reference:
        if not existing_pending.payment_expires_at or existing_pending.payment_expires_at > datetime.utcnow():
            raise HTTPException(
                status_code=409,
                detail={
                    "message": "Existing pending payment found",
                    "order_id": existing_pending.payment_reference,
                },
            )
        existing_pending.payment_status = "expired"
        existing_pending.payment_attempt_status = "expired"
        existing_pending.status = "dropped"

    price_usd = _current_price_usd(cohort)
    price_idr = int(price_usd * _IDR_RATE)
    order_id = f"VOKASI-BETA-{payload.user_id}-{uuid.uuid4().hex[:8].upper()}"

    created_enrollments = []
    # Create pending enrollment rows
    for cid in payload.course_ids:
        existing = db.query(models.Enrollment).filter(
            models.Enrollment.user_id == payload.user_id,
            models.Enrollment.course_id == cid,
            models.Enrollment.cohort_id == cohort.id,
        ).first()
        if not existing:
            enr = models.Enrollment(
                user_id=payload.user_id,
                course_id=cid,
                cohort_id=cohort.id,
                status="pending_payment",
                payment_status="pending",
                payment_reference=order_id,
                amount_usd=price_usd,
                enrolled_at=datetime.utcnow(),
            )
            db.add(enr)
            created_enrollments.append(enr)

    if not created_enrollments:
        raise HTTPException(status_code=409, detail="No enrollments created for payment")
    set_payment_expiry(created_enrollments)
    user = db.query(models.User).filter(models.User.id == payload.user_id).first()
    if user:
        user.funnel_status = "payment_pending"
        user.onboarding_phase = user.onboarding_phase or "prepay_complete"
    db.add(models.PaymentEvent(order_id=order_id, cohort_slug=slug, user_id=payload.user_id, event_type="initiated", provider="midtrans"))

    db.commit()
    if _FF_EMAIL_EVENTS:
        try:
            send_transactional_email(
                db,
                template_key="payment_initiated",
                to_email=payload.email,
                context={"order_id": order_id},
            )
        except Exception:
            logger.warning("payment initiation email failed for user_id=%s", payload.user_id)

    # Call Midtrans Snap API
    snap_payload = {
        "transaction_details": {
            "order_id": order_id,
            "gross_amount": price_idr,
        },
        "customer_details": {
            "first_name": payload.full_name,
            "email": payload.email,
        },
        "item_details": [
            {
                "id": f"BETA-BUNDLE",
                "price": int(price_idr),
                "quantity": 1,
                "name": (f"Beta Scholarship — {cohort.name}"[:50]),
            }
        ],
        "callbacks": {
            "finish": f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/payment/beasiswa/finish",
            "error": f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/payment/beasiswa/error",
            "pending": f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/payment/beasiswa/pending",
        },
    }

    if not mt["server_key"]:
        # Dev mode — return mock token
        logger.warning("MIDTRANS_SERVER_KEY not set — returning mock Snap token")
        return InitiatePaymentResponse(
            order_id=order_id,
            snap_token=f"mock-snap-token-{order_id}",
            snap_redirect_url=f"https://app.sandbox.midtrans.com/snap/v2/vtweb/mock",
            amount_usd=price_usd,
            amount_idr=price_idr,
        )

    import base64
    mt_auth = base64.b64encode(f"{mt['server_key']}:".encode()).decode()
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(
            mt["snap_url"],
            json=snap_payload,
            headers={"Authorization": f"Basic {mt_auth}", "Content-Type": "application/json"},
        )
    if resp.status_code not in (200, 201):
        logger.error("Midtrans error: %s", resp.text)
        rows = db.query(models.Enrollment).filter(models.Enrollment.payment_reference == order_id).all()
        for r in rows:
            r.payment_status = "failed"
            r.payment_attempt_status = "failed"
            r.status = "dropped"
        db.add(models.PaymentEvent(order_id=order_id, cohort_slug=slug, user_id=payload.user_id, event_type="failed", provider="midtrans", payload={"reason": resp.text[:200]}))
        db.commit()
        raise HTTPException(status_code=502, detail=f"Midtrans error: {resp.text[:200]}")

    data = resp.json()
    return InitiatePaymentResponse(
        order_id=order_id,
        snap_token=data["token"],
        snap_redirect_url=data["redirect_url"],
        amount_usd=price_usd,
        amount_idr=price_idr,
    )


@router.post("/cohorts/{slug}/confirm")
async def midtrans_webhook(
    slug: str,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Midtrans payment notification webhook.
    Verifies signature, activates enrollments, increments seats_sold.
    """
    body = await request.json()
    mt = _midtrans_config(db)
    order_id = body.get("order_id", "")
    transaction_status = body.get("transaction_status", "")
    fraud_status = body.get("fraud_status", "")
    gross_amount = body.get("gross_amount", "0")
    status_code = body.get("status_code", "")

    # Verify Midtrans signature
    if mt["server_key"]:
        expected_sig = hashlib.sha512(
            f"{order_id}{status_code}{gross_amount}{mt['server_key']}".encode()
        ).hexdigest()
        if body.get("signature_key") != expected_sig:
            raise HTTPException(status_code=403, detail="Invalid signature")

    is_paid = (
        transaction_status in ("capture", "settlement")
        and fraud_status in ("accept", "")
    ) or transaction_status == "settlement"

    if not is_paid:
        event_type = "webhook_pending"
        if transaction_status in ("deny", "cancel", "expire", "failure"):
            event_type = "failed"
            rows = db.query(models.Enrollment).filter(
                models.Enrollment.payment_reference == order_id,
                models.Enrollment.payment_status == "pending",
            ).all()
            for r in rows:
                r.payment_status = "failed" if transaction_status != "expire" else "expired"
                r.payment_attempt_status = r.payment_status
                r.status = "dropped"
            db.commit()
        db.add(models.PaymentEvent(order_id=order_id, cohort_slug=slug, event_type=event_type, provider="midtrans", payload=body))
        db.commit()
        return {"status": "ignored", "transaction_status": transaction_status}

    # Activate enrollments matching this order_id
    enrollments = db.query(models.Enrollment).filter(
        models.Enrollment.payment_reference == order_id,
        models.Enrollment.payment_status == "pending",
    ).all()

    if not enrollments:
        return {"status": "no_pending_enrollments"}

    cohort = db.query(models.BetaCohort).filter(models.BetaCohort.slug == slug).first()

    for enr in enrollments:
        enr.status = "active"
        enr.payment_status = "paid"
        enr.payment_attempt_status = "paid"
        enr.payment_confirmed_at = datetime.utcnow()

    if cohort:
        cohort.seats_sold = min(cohort.seats_sold + 1, cohort.seat_cap)
        cohort.updated_at = datetime.utcnow()
    user = db.query(models.User).filter(models.User.id == enrollments[0].user_id).first()
    if user:
        user.funnel_status = "paid"
        if user.onboarding_phase != "postpay_complete":
            user.onboarding_phase = "postpay_in_progress"

    db.add(models.PaymentEvent(order_id=order_id, cohort_slug=slug, user_id=enrollments[0].user_id, event_type="webhook_paid", provider="midtrans", payload=body))
    db.commit()
    if user and _FF_EMAIL_EVENTS:
        try:
            send_transactional_email(
                db,
                template_key="payment_success",
                to_email=user.email,
                context={"order_id": order_id},
            )
        except Exception:
            logger.warning("payment success email failed for order %s", order_id)
    logger.info("Payment confirmed for order %s — %d enrollments activated", order_id, len(enrollments))
    return {"status": "ok", "activated": len(enrollments)}


@router.get("/cohorts/{slug}/orders/{order_id}", response_model=OrderStatusResponse)
def get_order_status(
    slug: str,
    order_id: str,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    auth = resolve_auth_context(authorization, db)
    enrollment = db.query(models.Enrollment).filter(
        models.Enrollment.payment_reference == order_id,
    ).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Order not found")
    require_self_or_admin(auth, enrollment.user_id)
    return OrderStatusResponse(**collect_order_state(db, order_id))


@router.post("/admin/cohorts")
def create_or_update_cohort(
    payload: CohortCreate,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    """Admin: create or update a beta cohort."""
    _require_admin(authorization, db)
    existing = db.query(models.BetaCohort).filter(models.BetaCohort.slug == payload.slug).first()
    if existing:
        existing.name = payload.name
        existing.description = payload.description
        existing.seat_cap = payload.seat_cap
        existing.pricing_tiers = payload.pricing_tiers or DEFAULT_PRICING_TIERS
        existing.fixed_course_ids = payload.fixed_course_ids
        existing.midtrans_merchant_id = payload.midtrans_merchant_id
        existing.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return {"action": "updated", "id": existing.id}

    cohort = models.BetaCohort(
        name=payload.name,
        slug=payload.slug,
        description=payload.description,
        seat_cap=payload.seat_cap,
        seats_sold=0,
        is_active=True,
        pricing_tiers=payload.pricing_tiers or DEFAULT_PRICING_TIERS,
        fixed_course_ids=payload.fixed_course_ids,
        midtrans_merchant_id=payload.midtrans_merchant_id,
    )
    db.add(cohort)
    db.commit()
    db.refresh(cohort)
    return {"action": "created", "id": cohort.id}


@router.post("/admin/cohorts/reconcile-payments")
def reconcile_payments(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    _require_admin(authorization, db)
    expired_count = expire_stale_pending_payments(db)
    return {"status": "ok", "expired_count": expired_count}


@router.post("/admin/cohorts/reconcile/{order_id}")
def reconcile_order(
    order_id: str,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    _require_admin(authorization, db)
    state = collect_order_state(db, order_id)
    if state["count"] == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    db.add(models.PaymentEvent(order_id=order_id, event_type="reconciled", provider="midtrans", payload=state))
    db.commit()
    return {"status": "ok", "order": state}


@router.post("/admin/cohorts/resend-lifecycle-email")
def resend_lifecycle_email(
    payload: ResendLifecycleEmailRequest,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    _require_admin(authorization, db)
    user = db.query(models.User).filter(models.User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    send_transactional_email(
        db,
        template_key=payload.template_key,
        to_email=user.email,
        context={"full_name": user.full_name or user.name or "Learner"},
    )
    return {"status": "ok"}


@router.get("/admin/cohorts/funnel-metrics")
def funnel_metrics(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    _require_admin(authorization, db)
    return {
        "registered_users": db.query(models.User).filter(models.User.registration_status == "registered").count(),
        "payment_pending_users": db.query(models.User).filter(models.User.funnel_status == "payment_pending").count(),
        "paid_users": db.query(models.User).filter(models.User.funnel_status == "paid").count(),
        "active_users": db.query(models.User).filter(models.User.funnel_status == "active").count(),
        "stale_pending_enrollments": db.query(models.Enrollment).filter(models.Enrollment.payment_status == "pending").count(),
        "email_sent_count": db.query(models.EmailDeliveryLog).filter(models.EmailDeliveryLog.status == "sent").count(),
        "email_failed_count": db.query(models.EmailDeliveryLog).filter(models.EmailDeliveryLog.status == "failed").count(),
        "email_events_enabled": _FF_EMAIL_EVENTS,
        "hybrid_onboarding_enabled": _FF_HYBRID_ONBOARDING,
    }
