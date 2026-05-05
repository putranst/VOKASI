#!/usr/bin/env python3
"""
Phase 5: Seed script for pilot institutions.
Run from the repo root: python scripts/seed_pilot_institutions.py

Creates 10 sample Indonesian SMK/BLK/Politeknik institution rows
and one superadmin user (if not already present).
"""

import os
import sys
import hashlib

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from database import SessionLocal, engine
from sql_models import Base, Institution, User

Base.metadata.create_all(bind=engine)

PILOT_INSTITUTIONS = [
    {"name": "SMK Negeri 1 Bandung",         "short_name": "SMKN1 Bandung",   "type": "SMK",       "country": "Indonesia"},
    {"name": "SMK Negeri 2 Jakarta",          "short_name": "SMKN2 Jakarta",   "type": "SMK",       "country": "Indonesia"},
    {"name": "SMK Negeri 3 Surabaya",         "short_name": "SMKN3 Surabaya",  "type": "SMK",       "country": "Indonesia"},
    {"name": "Politeknik Negeri Bandung",     "short_name": "Polban",          "type": "Politeknik","country": "Indonesia"},
    {"name": "Politeknik Elektronika Negeri Surabaya", "short_name": "PENS",   "type": "Politeknik","country": "Indonesia"},
    {"name": "BLK Komunitas Yogyakarta",      "short_name": "BLK Yogya",       "type": "BLK",       "country": "Indonesia"},
    {"name": "BLK Dinas Ketenagakerjaan Medan","short_name": "BLK Medan",      "type": "BLK",       "country": "Indonesia"},
    {"name": "SMK Muhammadiyah 1 Malang",     "short_name": "SMK Muhammadiyah Malang","type": "SMK","country": "Indonesia"},
    {"name": "Universitas Vocational Nusantara","short_name": "UVN",           "type": "Universitas","country": "Indonesia"},
    {"name": "Balai Besar Vokasi Semarang",   "short_name": "BBV Semarang",    "type": "BLK",       "country": "Indonesia"},
]

PILOT_ADMIN = {
    "name": "VOKASI Admin",
    "email": "admin@vokasi.id",
    "password": "VokasiAdmin2026!",
    "role": "admin",
}


def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def seed():
    db = SessionLocal()
    try:
        created_institutions = 0
        for data in PILOT_INSTITUTIONS:
            existing = db.query(Institution).filter(Institution.name == data["name"]).first()
            if not existing:
                inst = Institution(**data)
                db.add(inst)
                created_institutions += 1
                print(f"  ✅ Institution: {data['name']}")
            else:
                print(f"  ⏭  Already exists: {data['name']}")

        existing_admin = db.query(User).filter(User.email == PILOT_ADMIN["email"]).first()
        if not existing_admin:
            admin = User(
                name=PILOT_ADMIN["name"],
                email=PILOT_ADMIN["email"],
                password_hash=_hash_password(PILOT_ADMIN["password"]),
                role=PILOT_ADMIN["role"],
            )
            db.add(admin)
            print(f"  ✅ Admin user: {PILOT_ADMIN['email']}")
        else:
            print(f"  ⏭  Admin already exists: {PILOT_ADMIN['email']}")

        db.commit()
        print(f"\n🎉 Seeded {created_institutions} new institution(s).")
        print("   Default admin: admin@vokasi.id / VokasiAdmin2026!")
        print("   ⚠️  Change the admin password immediately after first login.")
    except Exception as e:
        db.rollback()
        print(f"❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("🌱 Seeding VOKASI pilot institutions…\n")
    seed()
