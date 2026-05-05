from __future__ import annotations

import time
from datetime import datetime, timedelta

from fastapi.testclient import TestClient

from main import app
from database import SessionLocal
import sql_models as models

client = TestClient(app)


def _seed_user_course_cohort():
    db = SessionLocal()
    try:
        suffix = str(int(time.time() * 1000))
        institution = db.query(models.Institution).filter(models.Institution.id == 1).first()
        if not institution:
            institution = models.Institution(
                id=1,
                name="Test Institution",
                short_name="TI",
                type="university",
                description="test",
                logo_url="https://example.com/logo.png",
                country="ID",
            )
            db.add(institution)
            db.commit()
        user = models.User(
            email=f"funnel-{suffix}@example.com",
            full_name="Funnel Test",
            name="Funnel Test",
            role="student",
            registration_status="registered",
            funnel_status="registered",
            onboarding_phase="none",
        )
        course = models.Course(
            title=f"Course {suffix}",
            instructor="Instr",
            org="VOKASI",
            institution_id=institution.id,
            rating=0.0,
            students_count="0",
            image="https://example.com/course.png",
            level="Beginner",
            category="General",
            description="desc",
            duration="4 weeks",
        )
        cohort = models.BetaCohort(
            name=f"Cohort {suffix}",
            slug=f"cohort-{suffix}",
            description="test cohort",
            seat_cap=1000,
            seats_sold=0,
            is_active=True,
            pricing_tiers=[{"max_seat": 100, "price_usd": 1}],
        )
        db.add(user)
        db.add(course)
        db.add(cohort)
        db.commit()
        db.refresh(user)
        db.refresh(course)
        db.refresh(cohort)
        return user.id, course.id, cohort.id, cohort.slug
    finally:
        db.close()


def test_postpay_onboarding_requires_paid_enrollment():
    user_id, _, _, _ = _seed_user_course_cohort()
    token = f"devtoken:{user_id}:student"
    res = client.post(
        "/api/v1/onboarding/postpay/complete",
        json={"user_id": user_id, "consent_completed": True},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 409


def test_reconcile_expires_stale_pending_enrollment():
    user_id, course_id, cohort_id, _ = _seed_user_course_cohort()
    db = SessionLocal()
    try:
        enr = models.Enrollment(
            user_id=user_id,
            course_id=course_id,
            cohort_id=cohort_id,
            status="pending_payment",
            payment_status="pending",
            payment_reference=f"ORDER-{user_id}",
            payment_expires_at=datetime.utcnow() - timedelta(minutes=5),
            payment_attempt_status="pending",
        )
        db.add(enr)
        db.commit()
    finally:
        db.close()

    admin_token = "devtoken:1:admin"
    res = client.post(
        "/api/v1/admin/cohorts/reconcile-payments",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res.status_code == 200
    assert res.json()["expired_count"] >= 1


def test_order_status_returns_paid_after_confirm():
    user_id, course_id, cohort_id, slug = _seed_user_course_cohort()
    order_id = f"VOKASI-TEST-{user_id}"
    db = SessionLocal()
    try:
        enr = models.Enrollment(
            user_id=user_id,
            course_id=course_id,
            cohort_id=cohort_id,
            status="pending_payment",
            payment_status="pending",
            payment_reference=order_id,
            payment_attempt_status="pending",
            payment_expires_at=datetime.utcnow() + timedelta(minutes=30),
        )
        db.add(enr)
        db.commit()
    finally:
        db.close()

    confirm = client.post(
        f"/api/v1/cohorts/{slug}/confirm",
        json={
            "order_id": order_id,
            "transaction_status": "settlement",
            "fraud_status": "accept",
            "gross_amount": "16000",
            "status_code": "200",
        },
    )
    assert confirm.status_code == 200

    token = f"devtoken:{user_id}:student"
    res = client.get(
        f"/api/v1/cohorts/{slug}/orders/{order_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    statuses = res.json()["statuses"]
    assert ("active", "paid") in [tuple(x) for x in statuses]
