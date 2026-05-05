from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

import sql_models as models
import models as schemas
from database import get_db

router = APIRouter(prefix="/api/v1", tags=["projects"])


# ── Project CRUD ──────────────────────────────────────────────────────────────

@router.post("/projects", response_model=schemas.CDIOProject, status_code=201)
def create_project(project_data: schemas.IRISProjectCreate, db: Session = Depends(get_db)):
    """Create a new IRIS/CDIO project for a user in a course."""
    now = datetime.utcnow()

    # If course_id supplied, verify it exists
    if project_data.course_id:
        course = db.query(models.Course).filter(models.Course.id == project_data.course_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        title = project_data.project_title or f"{course.title} — My Project"
    else:
        title = project_data.project_title or "My Project"

    # Idempotent: return existing if already there
    existing = db.query(models.CDIOProject).filter(
        models.CDIOProject.user_id == project_data.user_id,
        models.CDIOProject.course_id == project_data.course_id,
    ).first()
    if existing:
        return existing

    project = models.CDIOProject(
        course_id=project_data.course_id,
        user_id=project_data.user_id,
        title=title,
        current_phase="conceive",
        overall_status="in_progress",
        completion_percentage=0,
        created_at=now,
        updated_at=now,
        started_at=now,
        last_activity_at=now,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("/projects/{project_id}", response_model=schemas.CDIOProjectDetail)
def get_project(project_id: int, db: Session = Depends(get_db)):
    """Get full project details including all phase artifacts."""
    project = db.query(models.CDIOProject).filter(models.CDIOProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return schemas.CDIOProjectDetail(
        project=project,
        charter=project.charter,
        blueprint=project.blueprint,
        implementation=project.implementation,
        deployment=project.deployment,
    )


@router.get("/courses/{course_id}/projects", response_model=List[schemas.CDIOProject])
def get_course_projects(
    course_id: int,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """List projects for a course, optionally filtered by user."""
    query = db.query(models.CDIOProject).filter(models.CDIOProject.course_id == course_id)
    if user_id:
        query = query.filter(models.CDIOProject.user_id == user_id)
    return query.all()


@router.get("/users/{user_id}/projects", response_model=List[schemas.CDIOProject])
def get_user_projects(user_id: int, db: Session = Depends(get_db)):
    """List all projects belonging to a user."""
    return db.query(models.CDIOProject).filter(models.CDIOProject.user_id == user_id).all()


# ── Phase artifacts ────────────────────────────────────────────────────────────

@router.get("/projects/{project_id}/charter", response_model=schemas.ProjectCharter)
def get_charter(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.CDIOProject).filter(models.CDIOProject.id == project_id).first()
    if not project or not project.charter:
        raise HTTPException(status_code=404, detail="Charter not found")
    return project.charter


@router.get("/projects/{project_id}/blueprint", response_model=schemas.DesignBlueprint)
def get_blueprint(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.CDIOProject).filter(models.CDIOProject.id == project_id).first()
    if not project or not project.blueprint:
        raise HTTPException(status_code=404, detail="Blueprint not found")
    return project.blueprint


@router.get("/projects/{project_id}/implementation", response_model=schemas.Implementation)
def get_implementation(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.CDIOProject).filter(models.CDIOProject.id == project_id).first()
    if not project or not project.implementation:
        raise HTTPException(status_code=404, detail="Implementation not found")
    return project.implementation


@router.get("/projects/{project_id}/deployment", response_model=schemas.Deployment)
def get_deployment(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.CDIOProject).filter(models.CDIOProject.id == project_id).first()
    if not project or not project.deployment:
        raise HTTPException(status_code=404, detail="Deployment not found")
    return project.deployment


@router.get("/projects/{project_id}/snapshots", response_model=List[schemas.CodeSnapshot])
def get_snapshots(project_id: int, db: Session = Depends(get_db)):
    """Code version history for a project."""
    return (
        db.query(models.CodeSnapshot)
        .filter(models.CodeSnapshot.project_id == project_id)
        .order_by(models.CodeSnapshot.timestamp.desc())
        .limit(50)
        .all()
    )


# ── Issue credential ───────────────────────────────────────────────────────────

@router.post("/projects/{project_id}/issue-credential")
def issue_project_credential(project_id: int, db: Session = Depends(get_db)):
    """Issue an SBT credential when a project is fully completed."""
    project = db.query(models.CDIOProject).filter(models.CDIOProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not project.operate_completed:
        raise HTTPException(
            status_code=400,
            detail="Project must complete the Operate/Scale phase before a credential can be issued",
        )

    existing = db.query(models.Credential).filter(
        models.Credential.user_id == project.user_id,
        models.Credential.course_id == project.course_id,
    ).first()
    if existing:
        return {"success": True, "message": "Credential already issued", "credential": existing}

    course = db.query(models.Course).filter(models.Course.id == project.course_id).first()
    course_title = course.title if course else "Unknown Course"
    now = datetime.utcnow()

    cred = models.Credential(
        user_id=project.user_id,
        course_id=project.course_id,
        title=f"Certified: {course_title}",
        description=f"Successfully completed IRIS project: {project.title}",
        issuer_name="VOKASI Institute",
        credential_type="Soulbound Token (SBT)",
        status="issued",
        issued_at=now,
    )
    db.add(cred)
    db.commit()
    db.refresh(cred)
    return {"success": True, "message": "Credential issued successfully", "credential": cred}


# ── Feedback / grade ───────────────────────────────────────────────────────────

class FeedbackRequest(BaseModel):
    feedback: str
    grade: Optional[str] = None
    instructor_id: Optional[int] = None


@router.post("/projects/{project_id}/feedback")
def submit_feedback(project_id: int, req: FeedbackRequest, db: Session = Depends(get_db)):
    """Instructor submits feedback on a project."""
    project = db.query(models.CDIOProject).filter(models.CDIOProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    project.instructor_feedback = req.feedback
    project.instructor_grade = req.grade
    project.updated_at = datetime.utcnow()
    db.commit()
    return {"success": True, "project_id": project_id}
