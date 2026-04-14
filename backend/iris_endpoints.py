# ===== IRIS Phase Endpoints =====
# These endpoints map to the new NUSA Framework IRIS Cycle:
# - Immerse → Problem context observation
# - Realize → Gap analysis & SFIA mapping  
# - Iterate → Build-Measure-Learn cycles
# - Scale → Institutional handoff & credential

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Pydantic Schemas
class ImmersionDataCreate(BaseModel):
    """Immersion phase - observing authentic problem context"""
    observation_notes: str
    stakeholder_interviews: Optional[List[str]] = []
    field_photos: Optional[List[str]] = []  # URLs to uploaded images
    problem_context: str
    target_sfia_level: int = 3  # Default SFIA level target

class ImmersionData(ImmersionDataCreate):
    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ReflectionDataCreate(BaseModel):
    """Reflection phase - Q/P analysis and SFIA gap mapping"""
    q_what_i_know: List[str]  # What learner already knows
    p_what_i_need: List[str]  # What learner needs to learn
    sfia_current_level: int
    sfia_target_level: int
    skill_gaps: List[str]
    learning_resources: Optional[List[str]] = []

class ReflectionData(ReflectionDataCreate):
    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class IterationCycleCreate(BaseModel):
    """Single Build-Measure-Learn iteration"""
    cycle_number: int
    hypothesis: str
    build_description: str
    measurement_data: Optional[str] = None
    learnings: Optional[str] = None
    pivot_or_persevere: Optional[str] = None  # 'pivot' or 'persevere'
    next_steps: Optional[str] = None

class IterationCycle(IterationCycleCreate):
    id: int
    project_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ScaleDataCreate(BaseModel):
    """Scale phase - institutional handoff and credential issuance"""
    deployment_url: Optional[str] = None
    handoff_documentation: str
    institution_partner: Optional[str] = None
    adoption_metrics: Optional[str] = None
    presentation_url: Optional[str] = None  # Video or slide deck
    sfia_achieved_level: int
    ready_for_credential: bool = False

class ScaleData(ScaleDataCreate):
    id: int
    project_id: int
    created_at: datetime
    credential_issued: bool = False
    credential_id: Optional[int] = None
    
    class Config:
        from_attributes = True


# ===== Endpoint Implementation Template =====
# These would be added to main.py alongside existing CDIO endpoints

"""
# In main.py, add these imports at the top:
from iris_endpoints import (
    ImmersionDataCreate, ImmersionData,
    ReflectionDataCreate, ReflectionData,
    IterationCycleCreate, IterationCycle,
    ScaleDataCreate, ScaleData
)

# ===== IRIS Phase Endpoints =====

@app.post("/api/v1/iris/immersion", response_model=ImmersionData)
def create_immersion(
    data: ImmersionDataCreate, 
    project_id: int = Query(...), 
    db: Session = Depends(get_db)
):
    '''Save Immersion phase data (replaces Conceive charter)'''
    project = db.query(models.CDIOProject).filter(models.CDIOProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # For now, store in existing ProjectCharter with adapted fields
    # In production, you'd create new ImmersionData table
    immersion = {
        "id": 0,  # Will be set by DB
        "project_id": project_id,
        "observation_notes": data.observation_notes,
        "problem_context": data.problem_context,
        "target_sfia_level": data.target_sfia_level,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Update project phase
    project.current_phase = "realize"  # IRIS phase
    project.conceive_completed = True  # Backward compat
    project.overall_status = "in_progress"
    project.last_activity_at = datetime.utcnow()
    db.commit()
    
    return immersion

@app.post("/api/v1/iris/reflection", response_model=ReflectionData)
def create_reflection(
    data: ReflectionDataCreate,
    project_id: int = Query(...),
    db: Session = Depends(get_db)
):
    '''Save Reflection phase data (Q/P analysis)'''
    project = db.query(models.CDIOProject).filter(models.CDIOProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project.current_phase = "iterate"
    project.design_completed = True
    project.last_activity_at = datetime.utcnow()
    db.commit()
    
    return {
        "id": 0,
        "project_id": project_id,
        **data.dict(),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

@app.post("/api/v1/iris/iteration", response_model=IterationCycle)
def create_iteration_cycle(
    data: IterationCycleCreate,
    project_id: int = Query(...),
    db: Session = Depends(get_db)
):
    '''Save a single Build-Measure-Learn iteration'''
    project = db.query(models.CDIOProject).filter(models.CDIOProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Allow multiple iterations
    project.current_phase = "iterate"
    project.implement_completed = data.cycle_number >= 3  # After 3 cycles
    project.last_activity_at = datetime.utcnow()
    db.commit()
    
    return {
        "id": 0,
        "project_id": project_id,
        **data.dict(),
        "created_at": datetime.utcnow()
    }

@app.post("/api/v1/iris/scale", response_model=ScaleData) 
def create_scale(
    data: ScaleDataCreate,
    project_id: int = Query(...),
    db: Session = Depends(get_db)
):
    '''Save Scale phase data and optionally issue credential'''
    project = db.query(models.CDIOProject).filter(models.CDIOProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    credential_id = None
    if data.ready_for_credential:
        # Issue blockchain credential
        # This would call the existing credential issuance logic
        pass
    
    project.current_phase = "completed"
    project.operate_completed = True
    project.overall_status = "completed"
    project.completion_percentage = 100
    project.last_activity_at = datetime.utcnow()
    db.commit()
    
    return {
        "id": 0,
        "project_id": project_id,
        **data.dict(),
        "created_at": datetime.utcnow(),
        "credential_issued": data.ready_for_credential,
        "credential_id": credential_id
    }

# GET endpoints for retrieving phase data
@app.get("/api/v1/iris/project/{project_id}/status")
def get_iris_status(project_id: int, db: Session = Depends(get_db)):
    '''Get current IRIS phase status for a project'''
    project = db.query(models.CDIOProject).filter(models.CDIOProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Map CDIO phases to IRIS
    phase_mapping = {
        'conceive': 'immerse',
        'design': 'realize', 
        'implement': 'iterate',
        'operate': 'scale',
        'completed': 'completed'
    }
    
    return {
        "project_id": project_id,
        "current_phase": phase_mapping.get(project.current_phase, project.current_phase),
        "immerse_completed": project.conceive_completed,
        "realize_completed": project.design_completed,
        "iterate_completed": project.implement_completed,
        "scale_completed": project.operate_completed,
        "completion_percentage": project.completion_percentage,
        "sfia_target_level": 3,  # Would come from immerse data
        "last_activity": project.last_activity_at
    }
"""
