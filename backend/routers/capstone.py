"""
Capstone Submission Router
==========================
Beta funnel: simplified capstone (no full IRIS/CDIO cycle).

POST /api/v1/capstone                          — student submits capstone
GET  /api/v1/capstone/{submission_id}          — get submission detail
GET  /api/v1/users/{user_id}/capstone          — student's own submission(s)
POST /api/v1/capstone/{submission_id}/ai-grade — trigger AI pre-grade (background)
GET  /api/v1/instructor/capstone               — list all submissions (instructor/admin)
POST /api/v1/capstone/{submission_id}/review   — instructor approves / rejects
"""

from __future__ import annotations

import logging
import os
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, Header, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

import sql_models as models
from database import get_db
from routers.auth_utils import require_roles, require_self_or_admin, resolve_auth_context

logger = logging.getLogger("capstone")
router = APIRouter(prefix="/api/v1", tags=["capstone"])

API_BASE = os.getenv("NEXT_PUBLIC_API_URL", "http://localhost:8000")


# ── Schemas ──────────────────────────────────────────────────────────────────

class CapstoneSubmitRequest(BaseModel):
    user_id: int
    cohort_id: Optional[int] = None
    title: str
    description: str
    artifact_url: Optional[str] = None
    github_url: Optional[str] = None
    additional_notes: Optional[str] = None


class InstructorReviewRequest(BaseModel):
    decision: str           # "approved" | "rejected" | "revision_requested"
    instructor_score: Optional[int] = None
    instructor_feedback: Optional[str] = None
    reviewer_id: int


class CapstoneOut(BaseModel):
    id: int
    user_id: int
    cohort_id: Optional[int]
    title: str
    description: str
    artifact_url: Optional[str]
    github_url: Optional[str]
    additional_notes: Optional[str]
    status: str
    ai_score: Optional[int]
    ai_feedback: Optional[str]
    ai_graded_at: Optional[datetime]
    instructor_score: Optional[int]
    instructor_feedback: Optional[str]
    reviewed_by: Optional[int]
    reviewed_at: Optional[datetime]
    submitted_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── AI grading helper ─────────────────────────────────────────────────────────

def _run_ai_grade(submission_id: int) -> None:
    """Background task: calls OpenRouter to pre-grade the capstone."""
    import sys
    sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

    from database import SessionLocal
    db = SessionLocal()
    try:
        sub = db.query(models.CapstoneSubmission).filter(
            models.CapstoneSubmission.id == submission_id
        ).first()
        if not sub:
            return

        try:
            from services import openai_service
            client = openai_service.get_client()
            model = openai_service.get_model()
        except Exception:
            logger.warning("AI service unavailable for capstone grading")
            return

        prompt = f"""You are a vocational education capstone assessor for VOKASI.

Evaluate the following student capstone project submission and return a JSON object with two keys:
- "score": integer 0-100
- "feedback": constructive feedback paragraph in Bahasa Indonesia (max 200 words)

Scoring rubric:
- Problem clarity & relevance (25 pts): Is the problem statement clear and relevant to vocational skills?
- Solution quality (25 pts): Is the solution technically sound and appropriately scoped?
- Documentation (25 pts): Is the description detailed and well-structured?
- Artifact/deliverable (25 pts): Does the project have a working artifact or GitHub repository?

Student submission:
Title: {sub.title}
Description: {sub.description}
Artifact URL: {sub.artifact_url or "Not provided"}
GitHub URL: {sub.github_url or "Not provided"}
Additional notes: {sub.additional_notes or "None"}

Respond ONLY with valid JSON. No markdown, no explanation outside the JSON.
"""

        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=400,
            temperature=0.3,
        )
        raw = response.choices[0].message.content.strip()

        import json
        # Strip markdown fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        data = json.loads(raw)

        sub.ai_score = max(0, min(100, int(data.get("score", 50))))
        sub.ai_feedback = str(data.get("feedback", ""))[:2000]
        sub.ai_graded_at = datetime.utcnow()
        sub.status = "ai_graded"
        sub.updated_at = datetime.utcnow()
        db.commit()
        logger.info("AI graded capstone %d: score=%d", submission_id, sub.ai_score)

    except Exception as e:
        logger.error("AI grading failed for capstone %d: %s", submission_id, e)
    finally:
        db.close()


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/capstone", response_model=CapstoneOut, status_code=201)
def submit_capstone(
    payload: CapstoneSubmitRequest,
    background_tasks: BackgroundTasks,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    """Student submits capstone. Triggers AI pre-grading in background."""
    auth = resolve_auth_context(authorization, db)
    require_self_or_admin(auth, payload.user_id)

    # Check learner has at least one active beta enrollment
    enr = db.query(models.Enrollment).filter(
        models.Enrollment.user_id == payload.user_id,
        models.Enrollment.status == "active",
    ).first()
    if not enr:
        raise HTTPException(status_code=403, detail="No active enrollment found for this user")

    # Prevent duplicate submissions for same cohort
    if payload.cohort_id:
        existing = db.query(models.CapstoneSubmission).filter(
            models.CapstoneSubmission.user_id == payload.user_id,
            models.CapstoneSubmission.cohort_id == payload.cohort_id,
            models.CapstoneSubmission.status.notin_(["rejected"]),
        ).first()
        if existing:
            raise HTTPException(
                status_code=409,
                detail=f"Capstone already submitted (id={existing.id}, status={existing.status})"
            )

    sub = models.CapstoneSubmission(
        user_id=payload.user_id,
        cohort_id=payload.cohort_id,
        title=payload.title,
        description=payload.description,
        artifact_url=payload.artifact_url,
        github_url=payload.github_url,
        additional_notes=payload.additional_notes,
        status="pending",
        submitted_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)

    # Fire AI grading in background
    background_tasks.add_task(_run_ai_grade, sub.id)

    return sub


@router.get("/capstone/{submission_id}", response_model=CapstoneOut)
def get_submission(
    submission_id: int,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    auth = resolve_auth_context(authorization, db)
    sub = db.query(models.CapstoneSubmission).filter(
        models.CapstoneSubmission.id == submission_id
    ).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    if auth.user_id != sub.user_id and auth.role not in ("admin", "instructor"):
        raise HTTPException(status_code=403, detail="Not authorized to view this submission")

    return sub


@router.get("/users/{user_id}/capstone", response_model=List[CapstoneOut])
def get_user_capstone(
    user_id: int,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    auth = resolve_auth_context(authorization, db)
    require_self_or_admin(auth, user_id)
    return db.query(models.CapstoneSubmission).filter(
        models.CapstoneSubmission.user_id == user_id
    ).order_by(models.CapstoneSubmission.submitted_at.desc()).all()


@router.post("/capstone/{submission_id}/ai-grade")
def trigger_ai_grade(
    submission_id: int,
    background_tasks: BackgroundTasks,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    """Re-trigger AI grading (e.g. after student edits submission)."""
    auth = resolve_auth_context(authorization, db)

    sub = db.query(models.CapstoneSubmission).filter(
        models.CapstoneSubmission.id == submission_id
    ).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    if auth.user_id != sub.user_id and auth.role not in ("admin", "instructor"):
        raise HTTPException(status_code=403, detail="Not authorized to re-grade this submission")

    sub.status = "pending"
    sub.ai_score = None
    sub.ai_feedback = None
    sub.ai_graded_at = None
    db.commit()
    background_tasks.add_task(_run_ai_grade, submission_id)
    return {"status": "grading_queued"}


@router.get("/instructor/capstone", response_model=List[CapstoneOut])
def list_all_submissions(
    status_filter: Optional[str] = None,
    cohort_id: Optional[int] = None,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    """Instructor/admin: list capstone submissions for review."""
    auth = resolve_auth_context(authorization, db)
    require_roles(auth, {"instructor", "admin"})

    query = db.query(models.CapstoneSubmission)
    if status_filter:
        query = query.filter(models.CapstoneSubmission.status == status_filter)
    if cohort_id:
        query = query.filter(models.CapstoneSubmission.cohort_id == cohort_id)
    return query.order_by(models.CapstoneSubmission.submitted_at.desc()).all()


@router.post("/capstone/{submission_id}/review")
def review_capstone(
    submission_id: int,
    payload: InstructorReviewRequest,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    """
    Instructor approves / rejects / requests revision.
    On 'approved': issues a CourseCertificate and creates AlumniProfile stub.
    """
    auth = resolve_auth_context(authorization, db)
    require_roles(auth, {"instructor", "admin"})

    if payload.decision not in ("approved", "rejected", "revision_requested"):
        raise HTTPException(status_code=400, detail="Invalid decision")

    sub = db.query(models.CapstoneSubmission).filter(
        models.CapstoneSubmission.id == submission_id
    ).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    sub.status = payload.decision
    sub.instructor_score = payload.instructor_score
    sub.instructor_feedback = payload.instructor_feedback
    sub.reviewed_by = auth.user_id
    sub.reviewed_at = datetime.utcnow()
    sub.updated_at = datetime.utcnow()
    db.commit()

    if payload.decision != "approved":
        return {"status": payload.decision, "certificate_issued": False}

    # ── Issue certificate for each enrolled course ─────────────────────────
    import uuid as _uuid
    user = db.query(models.User).filter(models.User.id == sub.user_id).first()
    student_name = (user.full_name or user.name or f"Student {sub.user_id}") if user else f"Student {sub.user_id}"

    enrollments = db.query(models.Enrollment).filter(
        models.Enrollment.user_id == sub.user_id,
        models.Enrollment.cohort_id == sub.cohort_id,
        models.Enrollment.status == "active",
    ).all()

    cert_codes = []
    for enr in enrollments:
        existing_cert = db.query(models.CourseCertificate).filter(
            models.CourseCertificate.user_id == sub.user_id,
            models.CourseCertificate.course_id == enr.course_id,
        ).first()
        if existing_cert:
            cert_codes.append(existing_cert.cert_code)
            continue

        course = db.query(models.Course).filter(models.Course.id == enr.course_id).first()
        cert_code = f"VOKASI-BETA-{_uuid.uuid4().hex[:12].upper()}"
        cert = models.CourseCertificate(
            user_id=sub.user_id,
            course_id=enr.course_id,
            capstone_id=sub.id,
            cert_code=cert_code,
            issued_at=datetime.utcnow(),
            student_name=student_name,
            course_title=course.title if course else f"Course {enr.course_id}",
        )
        db.add(cert)
        enr.status = "completed"
        cert_codes.append(cert_code)

    # ── Create / update AlumniProfile ─────────────────────────────────────
    alumni = db.query(models.AlumniProfile).filter(
        models.AlumniProfile.user_id == sub.user_id
    ).first()
    if not alumni:
        alumni = models.AlumniProfile(
            user_id=sub.user_id,
            cohort_id=sub.cohort_id,
            display_name=student_name,
            bio=user.bio if user else None,
            linkedin_url=user.linkedin_url if user else None,
            github_url=user.github_url if user else None,
            capstone_title=sub.title,
            capstone_url=sub.artifact_url or sub.github_url,
            cert_code=cert_codes[0] if cert_codes else None,
            is_visible=True,
        )
        db.add(alumni)
    else:
        alumni.capstone_title = sub.title
        alumni.capstone_url = sub.artifact_url or sub.github_url
        if cert_codes:
            alumni.cert_code = cert_codes[0]
        alumni.updated_at = datetime.utcnow()

    db.commit()

    return {
        "status": "approved",
        "certificate_issued": True,
        "cert_codes": cert_codes,
    }
