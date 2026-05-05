from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from database import get_db
import sql_models as models
import models as schemas
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
    org: Optional[str] = None
    rating: Optional[float] = None
    students_count: Optional[str] = None

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


def _course_to_dict(course: models.Course) -> dict:
    """Convert SQLAlchemy Course to serializable dict."""
    return {
        "id": course.id,
        "title": course.title,
        "instructor": course.instructor,
        "org": course.org,
        "rating": course.rating,
        "students_count": course.students_count,
        "image": course.image,
        "tag": course.tag,
        "level": course.level,
        "category": course.category,
        "description": course.description,
        "duration": course.duration,
        "approval_status": course.approval_status,
        "instructor_id": course.instructor_id,
        "institution_id": course.institution_id,
    }


@router.get("/")
def get_courses(
    category: Optional[str] = None,
    q: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
):
    """
    List courses with optional category filter, full-text search, and pagination.
    Returns: { items, total, page, page_size, pages }
    """
    query = db.query(models.Course)
    if category:
        query = query.filter(models.Course.category == category)
    if q:
        like = f"%{q}%"
        query = query.filter(
            models.Course.title.ilike(like) | models.Course.description.ilike(like)
        )
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return {
        "items": [_course_to_dict(c) for c in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": max(1, (total + page_size - 1) // page_size),
    }


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
    Save/Update Syllabus for a course. Upserts: updates existing or creates new.
    """
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    existing = db.query(models.Syllabus).filter(models.Syllabus.course_id == course_id).first()
    if existing:
        existing.title = syllabus.get("title", existing.title)
        existing.overview = syllabus.get("overview", existing.overview)
        existing.learning_outcomes = syllabus.get("learning_outcomes", existing.learning_outcomes)
        existing.assessment_strategy = syllabus.get("assessment_strategy", existing.assessment_strategy)
        existing.resources = syllabus.get("resources", existing.resources)
        existing.hexahelix_sectors = syllabus.get("hexahelix_sectors", existing.hexahelix_sectors)
        existing.duration_weeks = syllabus.get("duration_weeks", existing.duration_weeks)
        existing.status = syllabus.get("status", existing.status)
        existing.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        syl_id = existing.id
    else:
        new_syl = models.Syllabus(
            course_id=course_id,
            title=syllabus.get("title", course.title),
            overview=syllabus.get("overview"),
            learning_outcomes=syllabus.get("learning_outcomes"),
            assessment_strategy=syllabus.get("assessment_strategy"),
            resources=syllabus.get("resources"),
            hexahelix_sectors=syllabus.get("hexahelix_sectors"),
            duration_weeks=syllabus.get("duration_weeks", 4),
            status=syllabus.get("status", "draft"),
        )
        db.add(new_syl)
        db.commit()
        db.refresh(new_syl)
        syl_id = new_syl.id

    return {"message": "Syllabus saved", "course_id": course_id, "syllabus_id": syl_id}


@router.get("/{course_id}/syllabus")
def get_syllabus(course_id: int, db: Session = Depends(get_db)):
    """Retrieve the syllabus for a course."""
    syl = db.query(models.Syllabus).filter(models.Syllabus.course_id == course_id).first()
    if not syl:
        raise HTTPException(status_code=404, detail="Syllabus not found")
    return {
        "id": syl.id,
        "course_id": syl.course_id,
        "title": syl.title,
        "overview": syl.overview,
        "learning_outcomes": syl.learning_outcomes,
        "assessment_strategy": syl.assessment_strategy,
        "resources": syl.resources,
        "hexahelix_sectors": syl.hexahelix_sectors,
        "duration_weeks": syl.duration_weeks,
        "status": syl.status,
        "version": syl.version,
    }

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

@router.get("/{course_id}", response_model=schemas.Course)
def get_course_details(course_id: int, db: Session = Depends(get_db)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

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


@router.get("/{course_id}/progress")
def get_course_progress(course_id: int, user_id: int, db: Session = Depends(get_db)):
    """Return completed module IDs and overall percentage for a user in a course."""
    modules = db.query(models.CourseModule).filter(
        models.CourseModule.course_id == course_id
    ).all()
    total = len(modules)
    if total == 0:
        return {"completed_module_ids": [], "percentage": 0, "total_modules": 0}

    completed_rows = db.query(models.LessonProgress).filter(
        models.LessonProgress.user_id == user_id,
        models.LessonProgress.course_id == course_id,
        models.LessonProgress.completed == True
    ).all()
    completed_ids = [r.module_id for r in completed_rows]
    percentage = int(len(completed_ids) / total * 100)
    return {
        "completed_module_ids": completed_ids,
        "percentage": percentage,
        "total_modules": total
    }


@router.post("/{course_id}/modules/{module_id}/complete")
def mark_module_complete(course_id: int, module_id: int, user_id: int, db: Session = Depends(get_db)):
    """Mark a module as completed for a user. Idempotent."""
    from datetime import datetime as dt
    existing = db.query(models.LessonProgress).filter(
        models.LessonProgress.user_id == user_id,
        models.LessonProgress.course_id == course_id,
        models.LessonProgress.module_id == module_id
    ).first()

    if existing:
        if not existing.completed:
            existing.completed = True
            existing.completed_at = dt.utcnow()
            existing.updated_at = dt.utcnow()
            db.commit()
        return {"status": "ok", "completed": True, "module_id": module_id}

    row = models.LessonProgress(
        user_id=user_id,
        course_id=course_id,
        module_id=module_id,
        completed=True,
        completed_at=dt.utcnow()
    )
    db.add(row)
    db.commit()
    return {"status": "created", "completed": True, "module_id": module_id}
