from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from database import get_db
import sql_models as models
import json
from datetime import datetime
from services.openai_service import (
    parse_course_material, 
    generate_course_structure
)

router = APIRouter(
    prefix="/api/v1/courses",
    tags=["courses"]
)

# --- Pydantic Models ---

class ParseRequest(BaseModel):
    file_base64: str
    file_name: str
    mime_type: str

class AgendaRequest(BaseModel):
    parsed_content: Dict
    target_audience: str
    duration_weeks: int

class CreateCourseRequest(BaseModel):
    title: str
    description: str
    level: str
    duration: str
    tag: str
    image: str
    category: str
    instructor: str
    org: str
    instructor_id: Optional[int] = None
    approval_status: Optional[str] = "approved"

class UpdateCourseRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    level: Optional[str] = None
    duration: Optional[str] = None
    tag: Optional[str] = None
    image: Optional[str] = None
    category: Optional[str] = None
    approval_status: Optional[str] = None

class ContentBlock(BaseModel):
    id: str
    type: str
    content: str
    metadata: Optional[Dict] = {}

class CourseModuleSchema(BaseModel):
    title: str
    order: int
    content_blocks: List[ContentBlock]
    status: str

# --- Endpoints ---

@router.post("/smart-create/parse")
async def parse_material(request: ParseRequest):
    """
    Step 1: Parse uploaded file (PDF/Image/PPT) using AI
    """
    result = await parse_course_material(
        request.file_base64, 
        request.file_name, 
        request.mime_type
    )
    
    if not result.get("success"):
        return {"success": False, "error": result.get("error", "Unknown parsing error")}
        
    return {"success": True, "data": result.get("data")}

@router.post("/smart-create/agenda")
async def create_agenda(request: AgendaRequest):
    """
    Step 2: Generate Teaching Agenda from parsed content
    """
    # 1. Generate Course Structure
    # Map parsed content to material_content string
    material_summary = f"""
    Title: {request.parsed_content.get('title')}
    Summary: {request.parsed_content.get('summary')}
    Topics: {json.dumps(request.parsed_content.get('main_topics'))}
    Concepts: {json.dumps(request.parsed_content.get('key_concepts'))}
    """
    
    structure = await generate_course_structure(
        topic=request.parsed_content.get('title', 'New Course'),
        target_audience=request.target_audience,
        material_content=material_summary
    )
    
    # 2. Transform to Frontend "TeachingAgenda" format
    # structure['modules'] has { phase, title, content, activities... }
    # Frontend expects { week, phase, title, teaching_actions... }
    
    agenda_modules = []
    for i, mod in enumerate(structure.get("modules", [])):
        # Map activities to teaching_actions
        actions = []
        for activity in mod.get("activities", []):
            # Map activity type to teaching action type
            act_type = activity.get("type", "lecture").upper()
            if act_type not in ['EXPLAIN', 'DISCUSS', 'PRACTICE', 'QUIZ', 'DEMO', 'REFLECT', 'COLLABORATE']:
                # Fallback mapping
                if "lecture" in act_type: act_type = "EXPLAIN"
                elif "discussion" in act_type: act_type = "DISCUSS"
                elif "exercise" in act_type: act_type = "PRACTICE"
                elif "quiz" in act_type: act_type = "QUIZ"
                else: act_type = "EXPLAIN"
            
            actions.append({
                "type": act_type,
                "title": activity.get("title"),
                "content": activity.get("description", ""), # AI might not return desc for activity
                "duration_minutes": activity.get("duration_minutes", 30)
            })
            
        agenda_modules.append({
            "week": i + 1,
            "phase": mod.get("iris_phase", "Immerse").lower(), # IRIS phase
            "title": mod.get("title"),
            "learning_goals": mod.get("learning_goals", []),
            "teaching_actions": actions,
            "assignments": [],
            "resources": []
        })
        
    agenda = {
        "course_title": structure.get("title"),
        "tagline": structure.get("description"),
        "modules": agenda_modules,
        "capstone_project": {
            "title": "Capstone Project",
            "description": structure.get("capstone_project", ""),
            "deliverables": ["Project Report", "Prototype"],
            "rubric_summary": "Graded on innovation and implementation."
        }
    }
    
    return {"success": True, "agenda": agenda}


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_course(course_data: CreateCourseRequest, db: Session = Depends(get_db)):
    """
    Create a new course (Metadata only)
    """
    new_course = models.Course(
        title=course_data.title,
        description=course_data.description,
        level=course_data.level,
        category=course_data.category,
        image=course_data.image,
        instructor=course_data.instructor,
        instructor_id=course_data.instructor_id,
        institution_id=None, # Default for now
        rating=0.0,
        approval_status=course_data.approval_status
    )
    
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    
    return new_course


@router.post("/{course_id}/modules")
def save_modules_bulk(
    course_id: int, 
    modules: List[CourseModuleSchema], 
    db: Session = Depends(get_db)
):
    """
    Bulk save modules for a course (Delete existing and recreate)
    """
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    # Delete existing modules for simplicity (Full Sync)
    db.query(models.CourseModule).filter(models.CourseModule.course_id == course_id).delete()
    
    new_modules = []
    for i, mod_data in enumerate(modules):
        blocks_dict = [b.dict() for b in mod_data.content_blocks]
        new_mod = models.CourseModule(
            course_id=course_id,
            title=mod_data.title,
            order=mod_data.order,
            content_blocks=blocks_dict,
            status=mod_data.status
        )
        new_modules.append(new_mod)
        
    db.add_all(new_modules)
    db.commit()
    
    return {"message": "Modules saved", "count": len(new_modules)}

@router.post("/{course_id}/syllabus")
def save_syllabus(course_id: int, syllabus: Dict[str, Any], db: Session = Depends(get_db)):
    """
    Save/Update Syllabus (Mock implementation as Syllabus table might be complex)
    For now, we just acknowledge receipt. To implement fully, we'd need a Syllabus model.
    """
    return {"message": "Syllabus saved (mock)", "course_id": course_id}

@router.put("/{course_id}")
def update_course(course_id: int, course_update: UpdateCourseRequest, db: Session = Depends(get_db)):
    """
    Update course details (Metadata, Status)
    """
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    update_data = course_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(course, key, value)
        
    db.commit()
    db.refresh(course)
    return course

# --- GET Accessors (Moved from main.py) ---

@router.get("/{course_id}")
def get_course_details(course_id: int, db: Session = Depends(get_db)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return {
        "id": course.id,
        "title": course.title,
        "description": course.description,
        "instructor": course.instructor,
        "approval_status": course.approval_status
    }

@router.get("/{course_id}/modules")
def get_course_modules(course_id: int, db: Session = Depends(get_db)):
    modules = db.query(models.CourseModule).filter(
        models.CourseModule.course_id == course_id
    ).order_by(models.CourseModule.order).all()
    
    return [
        {
            "id": m.id,
            "title": m.title,
            "order": m.order,
            "content_blocks": m.content_blocks,
            "status": m.status
        }
        for m in modules
    ]
