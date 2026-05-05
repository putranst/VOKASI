from __future__ import annotations

from datetime import datetime, timedelta
from typing import Dict, List

from sqlalchemy.orm import Session

import sql_models as models


PAYMENT_EXPIRY_MINUTES = 30


def mark_funnel(user: models.User, *, payment_status: str | None = None, onboarding_phase: str | None = None, funnel_status: str | None = None) -> None:
    if payment_status:
        user.registration_status = user.registration_status or "registered"
    if onboarding_phase:
        user.onboarding_phase = onboarding_phase
    if funnel_status:
        user.funnel_status = funnel_status


def expire_stale_pending_payments(db: Session) -> int:
    now = datetime.utcnow()
    pending = db.query(models.Enrollment).filter(
        models.Enrollment.payment_status == "pending",
        models.Enrollment.payment_expires_at.isnot(None),
        models.Enrollment.payment_expires_at < now,
    ).all()
    affected_orders = set()
    for enr in pending:
        enr.payment_status = "expired"
        enr.payment_attempt_status = "expired"
        enr.status = "dropped"
        affected_orders.add(enr.payment_reference)
    for order_id in [x for x in affected_orders if x]:
        db.add(models.PaymentEvent(order_id=order_id, event_type="expired", provider="midtrans"))
    if pending:
        db.commit()
    return len(pending)


def collect_order_state(db: Session, order_id: str) -> Dict[str, object]:
    enrollments = db.query(models.Enrollment).filter(models.Enrollment.payment_reference == order_id).all()
    return {
        "order_id": order_id,
        "count": len(enrollments),
        "statuses": sorted(list({(e.status, e.payment_status) for e in enrollments})),
    }


def set_payment_expiry(enrollments: List[models.Enrollment]) -> None:
    expires_at = datetime.utcnow() + timedelta(minutes=PAYMENT_EXPIRY_MINUTES)
    for e in enrollments:
        e.payment_expires_at = expires_at
        e.payment_attempt_status = "pending"
