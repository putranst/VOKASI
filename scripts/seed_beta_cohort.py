#!/usr/bin/env python3
"""
Seed beta cohort for scholarship campaign.

Run from repo root:
  python scripts/seed_beta_cohort.py
"""

import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from database import SessionLocal, engine  # noqa: E402
import sql_models as models  # noqa: E402

DEFAULT_NAME = "VOKASI Beta 2026"
DEFAULT_SLUG = "beta-2026"
DEFAULT_SEAT_CAP = 1000


def _default_pricing_tiers():
    return [
        {"max_seat": 100, "price_usd": 1},
        {"max_seat": 200, "price_usd": 2},
        {"max_seat": 300, "price_usd": 3},
        {"max_seat": 400, "price_usd": 4},
        {"max_seat": 500, "price_usd": 5},
        {"max_seat": 600, "price_usd": 6},
        {"max_seat": 700, "price_usd": 7},
        {"max_seat": 800, "price_usd": 8},
        {"max_seat": 900, "price_usd": 9},
        {"max_seat": 1000, "price_usd": 10},
    ]


def seed():
    models.Base.metadata.create_all(bind=engine)

    slug = os.getenv("BETA_COHORT_SLUG", DEFAULT_SLUG)
    name = os.getenv("BETA_COHORT_NAME", DEFAULT_NAME)

    db = SessionLocal()
    try:
        cohort = db.query(models.BetaCohort).filter(models.BetaCohort.slug == slug).first()

        if cohort:
            cohort.name = name
            cohort.description = "Beta scholarship campaign: pick 2 courses, capstone-based completion."
            cohort.seat_cap = DEFAULT_SEAT_CAP
            cohort.is_active = True
            cohort.pricing_tiers = _default_pricing_tiers()
            cohort.updated_at = datetime.utcnow()
            db.commit()
            print(f"⏭  Updated existing cohort: {cohort.slug} (id={cohort.id})")
        else:
            cohort = models.BetaCohort(
                name=name,
                slug=slug,
                description="Beta scholarship campaign: pick 2 courses, capstone-based completion.",
                seat_cap=DEFAULT_SEAT_CAP,
                seats_sold=0,
                is_active=True,
                pricing_tiers=_default_pricing_tiers(),
                fixed_course_ids=None,
                midtrans_merchant_id=os.getenv("MIDTRANS_MERCHANT_ID"),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(cohort)
            db.commit()
            db.refresh(cohort)
            print(f"✅ Created cohort: {cohort.slug} (id={cohort.id})")

        print("\n🎉 Beta cohort seeding complete.")
        print(f"   Name       : {cohort.name}")
        print(f"   Slug       : {cohort.slug}")
        print(f"   Seat cap   : {cohort.seat_cap}")
        print(f"   Seats sold : {cohort.seats_sold}")
        print(f"   Active     : {cohort.is_active}")

    except Exception as e:
        db.rollback()
        print(f"❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
