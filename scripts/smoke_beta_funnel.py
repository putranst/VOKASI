#!/usr/bin/env python3
"""
One-command smoke test for beta funnel backend APIs.

Usage:
  python scripts/smoke_beta_funnel.py

Optional env:
  API_BASE=http://127.0.0.1:8001
  DATABASE_URL=sqlite:///./backend/tsea.db
"""

from __future__ import annotations

import json
import os
import sys
from datetime import datetime

import requests

ROOT = os.path.dirname(os.path.dirname(__file__))
sys.path.insert(0, os.path.join(ROOT, "backend"))

from database import SessionLocal  # noqa: E402
import sql_models as models  # noqa: E402

API_BASE = os.getenv("API_BASE", "http://127.0.0.1:8001")
COHORT_SLUG = "beta-2026"


def _ensure_test_data():
    db = SessionLocal()
    try:
        inst = db.query(models.Institution).filter(models.Institution.name == "VOKASI Smoke Institute").first()
        if not inst:
            inst = models.Institution(
                name="VOKASI Smoke Institute",
                short_name="VSI",
                type="SMK",
                description="Smoke test institution",
                logo_url="https://example.com/logo.png",
                country="Indonesia",
            )
            db.add(inst)
            db.commit()
            db.refresh(inst)

        user = db.query(models.User).filter(models.User.email == "beta.smoke@test.local").first()
        if not user:
            user = models.User(
                email="beta.smoke@test.local",
                full_name="Beta Smoke Student",
                name="Beta Smoke Student",
                role="student",
                password_hash="x",
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        course_a = db.query(models.Course).filter(models.Course.title == "Beta Smoke Course A").first()
        if not course_a:
            course_a = models.Course(
                title="Beta Smoke Course A",
                instructor="Smoke Instructor",
                instructor_id=None,
                org="VOKASI",
                institution_id=inst.id,
                rating=5.0,
                students_count="0",
                image="https://example.com/a.png",
                tag="Smoke",
                level="Beginner",
                category="Data & AI",
                description="Smoke A",
                duration="2 Weeks",
                approval_status="published",
            )
            db.add(course_a)

        course_b = db.query(models.Course).filter(models.Course.title == "Beta Smoke Course B").first()
        if not course_b:
            course_b = models.Course(
                title="Beta Smoke Course B",
                instructor="Smoke Instructor",
                instructor_id=None,
                org="VOKASI",
                institution_id=inst.id,
                rating=5.0,
                students_count="0",
                image="https://example.com/b.png",
                tag="Smoke",
                level="Beginner",
                category="Data & AI",
                description="Smoke B",
                duration="2 Weeks",
                approval_status="published",
            )
            db.add(course_b)

        db.commit()
        db.refresh(user)
        db.refresh(course_a)
        db.refresh(course_b)

        return user.id, [course_a.id, course_b.id]
    finally:
        db.close()


def _assert(status: bool, message: str):
    if not status:
        raise RuntimeError(message)


def main():
    print(f"API_BASE={API_BASE}")
    user_id, course_ids = _ensure_test_data()
    print(f"using user_id={user_id}, course_ids={course_ids}")

    student_headers = {
        "Authorization": f"Bearer devtoken:{user_id}:student",
        "Content-Type": "application/json",
    }
    instructor_headers = {
        "Authorization": f"Bearer devtoken:{user_id}:instructor",
        "Content-Type": "application/json",
    }

    # 1) Initiate payment
    r = requests.post(
        f"{API_BASE}/api/v1/cohorts/{COHORT_SLUG}/initiate",
        headers=student_headers,
        json={
            "user_id": user_id,
            "email": "beta.smoke@test.local",
            "full_name": "Beta Smoke Student",
            "course_ids": course_ids,
        },
        timeout=20,
    )
    _assert(r.status_code == 200, f"initiate failed: {r.status_code} {r.text}")
    data = r.json()
    order_id = data["order_id"]
    print(f"✓ initiate: order_id={order_id}")

    # 2) Confirm payment webhook
    r = requests.post(
        f"{API_BASE}/api/v1/cohorts/{COHORT_SLUG}/confirm",
        headers={"Content-Type": "application/json"},
        json={
            "order_id": order_id,
            "transaction_status": "settlement",
            "fraud_status": "accept",
            "gross_amount": str(data["amount_idr"]),
            "status_code": "200",
        },
        timeout=20,
    )
    _assert(r.status_code == 200, f"confirm failed: {r.status_code} {r.text}")
    confirmed = r.json()
    _assert(confirmed.get("status") == "ok", f"confirm unexpected: {confirmed}")
    print(f"✓ confirm: {confirmed}")

    # 3) Submit capstone
    title = f"Smoke Capstone {datetime.utcnow().isoformat()}"
    r = requests.post(
        f"{API_BASE}/api/v1/capstone",
        headers=student_headers,
        json={
            "user_id": user_id,
            "cohort_id": 1,
            "title": title,
            "description": "Build an AI-assisted tool for vocational use.",
            "artifact_url": "https://example.com/smoke",
            "github_url": "https://github.com/example/smoke",
        },
        timeout=20,
    )
    _assert(r.status_code == 201, f"capstone submit failed: {r.status_code} {r.text}")
    capstone = r.json()
    submission_id = capstone["id"]
    print(f"✓ capstone submit: id={submission_id}")

    # 4) Instructor review approve
    r = requests.post(
        f"{API_BASE}/api/v1/capstone/{submission_id}/review",
        headers=instructor_headers,
        json={
            "decision": "approved",
            "instructor_score": 90,
            "instructor_feedback": "Smoke test approved.",
            "reviewer_id": user_id,
        },
        timeout=20,
    )
    _assert(r.status_code == 200, f"capstone review failed: {r.status_code} {r.text}")
    review = r.json()
    _assert(review.get("certificate_issued") is True, f"certificate not issued: {review}")
    print(f"✓ capstone review: certs={review.get('cert_codes')}")

    # 5) Alumni list/get/toggle
    r = requests.get(f"{API_BASE}/api/v1/alumni", headers=student_headers, timeout=20)
    _assert(r.status_code == 200, f"alumni list failed: {r.status_code} {r.text}")
    print(f"✓ alumni list count={len(r.json())}")

    r = requests.get(f"{API_BASE}/api/v1/alumni/{user_id}", headers=student_headers, timeout=20)
    _assert(r.status_code == 200, f"alumni get failed: {r.status_code} {r.text}")
    print("✓ alumni get")

    r = requests.post(f"{API_BASE}/api/v1/alumni/{user_id}/visibility", headers=student_headers, timeout=20)
    _assert(r.status_code == 200, f"alumni toggle failed: {r.status_code} {r.text}")
    print(f"✓ alumni toggle -> {r.json()}")

    # toggle back to visible
    requests.post(f"{API_BASE}/api/v1/alumni/{user_id}/visibility", headers=student_headers, timeout=20)

    print("\n✅ Beta funnel smoke test PASSED")


if __name__ == "__main__":
    main()
