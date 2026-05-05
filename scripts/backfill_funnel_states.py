from __future__ import annotations

from datetime import datetime
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(ROOT, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from database import SessionLocal
import sql_models as models


def run() -> None:
    db = SessionLocal()
    try:
        users = db.query(models.User).all()
        for user in users:
            if not user.registration_status:
                user.registration_status = "registered"
            if not user.onboarding_phase:
                if user.onboarding_completed:
                    user.onboarding_phase = "postpay_complete"
                    user.onboarding_prepay_completed = True
                    user.onboarding_postpay_completed = True
                    user.funnel_status = user.funnel_status or "active"
                else:
                    user.onboarding_phase = "none"
                    user.funnel_status = user.funnel_status or "registered"
            if not user.funnel_status:
                user.funnel_status = "registered"

        enrollments = db.query(models.Enrollment).all()
        now = datetime.utcnow()
        for enr in enrollments:
            if enr.payment_status == "pending" and not enr.payment_expires_at:
                enr.payment_expires_at = now
            if enr.payment_status == "paid" and not enr.payment_confirmed_at:
                enr.payment_confirmed_at = enr.enrolled_at or now
                enr.payment_attempt_status = "paid"
            if not enr.payment_attempt_status:
                enr.payment_attempt_status = "initiated"

        db.commit()
        print(f"Backfilled {len(users)} users and {len(enrollments)} enrollments")
    finally:
        db.close()


if __name__ == "__main__":
    run()
