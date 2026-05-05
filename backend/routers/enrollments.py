from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

import sql_models as models
import models as schemas
from database import get_db

router = APIRouter(prefix="/api/v1", tags=["enrollments"])


@router.post("/enrollments", response_model=schemas.Enrollment, status_code=201)
def create_enrollment(enrollment_data: schemas.EnrollmentCreate, db: Session = Depends(get_db)):
    """Enroll a student in a course"""
    course = db.query(models.Course).filter(models.Course.id == enrollment_data.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    existing = db.query(models.Enrollment).filter(
        models.Enrollment.user_id == enrollment_data.user_id,
        models.Enrollment.course_id == enrollment_data.course_id
    ).first()
    if existing:
        if existing.status == "active":
            raise HTTPException(status_code=400, detail="User already enrolled in this course")
        # Re-activate dropped enrollment
        existing.status = "active"
        existing.enrolled_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing

    try:
        new_enrollment = models.Enrollment(
            user_id=enrollment_data.user_id,
            course_id=enrollment_data.course_id,
            status="active",
            enrolled_at=datetime.utcnow()
        )
        db.add(new_enrollment)
        db.commit()
        db.refresh(new_enrollment)

        # Auto-create IRIS project only for non-beta (non-cohort) enrollments
        is_beta = getattr(enrollment_data, "cohort_id", None) is not None
        existing_project = db.query(models.CDIOProject).filter(
            models.CDIOProject.user_id == enrollment_data.user_id,
            models.CDIOProject.course_id == enrollment_data.course_id
        ).first()
        if not existing_project and not is_beta:
            now = datetime.utcnow()
            new_project = models.CDIOProject(
                course_id=enrollment_data.course_id,
                user_id=enrollment_data.user_id,
                title=f"{course.title} — My Project",
                current_phase="conceive",
                overall_status="in_progress",
                completion_percentage=0,
                created_at=now,
                updated_at=now,
                started_at=now,
                last_activity_at=now,
            )
            db.add(new_project)
            db.commit()

        return new_enrollment
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/enrollments/{enrollment_id}", status_code=204)
def delete_enrollment(enrollment_id: int, db: Session = Depends(get_db)):
    """Soft-delete (drop) an enrollment"""
    enrollment = db.query(models.Enrollment).filter(models.Enrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    enrollment.status = "dropped"
    db.commit()
    return None


@router.get("/enrollments/check")
def check_enrollment(user_id: int, course_id: int, db: Session = Depends(get_db)):
    """Check if a user is actively enrolled in a course"""
    enrollment = db.query(models.Enrollment).filter(
        models.Enrollment.user_id == user_id,
        models.Enrollment.course_id == course_id,
        models.Enrollment.status == "active"
    ).first()
    return {"enrolled": enrollment is not None, "enrollment": enrollment}


@router.get("/users/{user_id}/enrollments", response_model=List[schemas.Enrollment])
def get_user_enrollments(user_id: int, status_filter: Optional[str] = None, db: Session = Depends(get_db)):
    """Get all enrollments for a user"""
    query = db.query(models.Enrollment).filter(models.Enrollment.user_id == user_id)
    if status_filter:
        query = query.filter(models.Enrollment.status == status_filter)
    return query.all()


@router.get("/courses/{course_id}/enrollments")
def get_course_enrollments(course_id: int, db: Session = Depends(get_db)):
    """Enrollment count and list for a course"""
    enrollments = db.query(models.Enrollment).filter(
        models.Enrollment.course_id == course_id,
        models.Enrollment.status == "active"
    ).all()
    return {"course_id": course_id, "total_enrolled": len(enrollments), "enrollments": enrollments}
