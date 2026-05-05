"""
Puck Visual Course Builder — FastAPI Router
===========================================
VB-001 … VB-007 (vokasi2.prd §5.3)

Endpoints
---------
GET  /api/v1/puck/courses/{course_id}          → return course metadata + puck_data
PUT  /api/v1/puck/courses/{course_id}          → save puck_data (auto-save / draft)
POST /api/v1/puck/courses/{course_id}/publish  → snapshot + mark published
GET  /api/v1/puck/courses/{course_id}/versions → list version snapshots (VB-007)

Storage strategy
----------------
Reuses CourseModule.content_blocks (JSON) as puck_data store.
Each course gets a single "root" module (order=0) whose content_blocks
holds the raw Puck Data JSON blob.  A separate `CourseVersion` table
(created here via SQLAlchemy) stores publish-time snapshots.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, ForeignKey, DateTime, JSON, String
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
from datetime import datetime
import io
import zipfile
import json as _json
import html as _html

from database import get_db, Base
import sql_models as models

# ── AM-002: lightweight role dependency (mirrors app/dependencies/auth.py) ──

from fastapi import Header

def require_roles(*allowed: str):
    """
    Dependency factory: validates the devtoken and checks role membership.
    Usage: Depends(require_roles("instructor", "admin"))
    """
    def _check(authorization: Optional[str] = Header(default=None)):
        if not authorization or not authorization.lower().startswith("bearer "):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
        token = authorization.split(" ", 1)[1].strip()
        if not token.startswith("devtoken:"):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token format")
        parts = token.split(":")
        if len(parts) != 3:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Malformed token")
        role = parts[2]
        if allowed and role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{role}' is not permitted. Required: {list(allowed)}",
            )
        return {"user_id": parts[1], "role": role}
    return _check

# ---------------------------------------------------------------------------
# Supplementary ORM model — CourseVersion (VB-007)
# ---------------------------------------------------------------------------

class CourseVersion(Base):
    __tablename__ = "course_versions"
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), index=True)
    version_number = Column(Integer, default=1)
    puck_data = Column(JSON)
    published_at = Column(DateTime, default=datetime.utcnow)
    published_by = Column(String, nullable=True)  # instructor name / user email

# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

class PuckDataPayload(BaseModel):
    puck_data: Dict[str, Any]

class PublishPayload(BaseModel):
    puck_data: Dict[str, Any]
    published_by: Optional[str] = None

class GeneratePayload(BaseModel):
    prompt: str
    target_audience: str = "Beginner"
    approved_outline: Optional[List[str]] = None  # AI-006: user-confirmed block list


class OutlinePayload(BaseModel):
    prompt: str
    target_audience: str = "Beginner"

class RegenerateBlockPayload(BaseModel):
    block_type: str
    block_props: Dict[str, Any]
    prompt: str
    block_index: int = 0

# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------

router = APIRouter(
    prefix="/api/v1/puck",
    tags=["puck-builder"],
)

# ── helpers ────────────────────────────────────────────────────────────────

def _get_or_create_root_module(course_id: int, db: Session) -> models.CourseModule:
    """Return the single root module used as puck_data store, creating if absent."""
    module = (
        db.query(models.CourseModule)
        .filter(
            models.CourseModule.course_id == course_id,
            models.CourseModule.order == 0,
        )
        .first()
    )
    if not module:
        module = models.CourseModule(
            course_id=course_id,
            title="Root",
            order=0,
            content_blocks={},
            status="draft",
        )
        db.add(module)
        db.commit()
        db.refresh(module)
    return module


def _course_or_404(course_id: int, db: Session) -> models.Course:
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

# ── GET /api/v1/puck/courses/{course_id} ──────────────────────────────────

@router.get("/courses/{course_id}")
def get_puck_course(course_id: int, db: Session = Depends(get_db)):
    """
    VB-001: Return course metadata + stored Puck JSON.
    Returns empty puck_data dict when no content has been saved yet.
    """
    course = _course_or_404(course_id, db)
    module = _get_or_create_root_module(course_id, db)

    return {
        "id": course.id,
        "title": course.title,
        "description": course.description,
        "instructor": course.instructor,
        "approval_status": course.approval_status,
        "puck_data": module.content_blocks or {},
        "updated_at": module.updated_at.isoformat() if module.updated_at else None,
    }

# ── PUT /api/v1/puck/courses/{course_id} ──────────────────────────────────

@router.put("/courses/{course_id}")
def save_puck_data(
    course_id: int,
    payload: PuckDataPayload,
    db: Session = Depends(get_db),
    _actor: dict = Depends(require_roles("instructor", "admin")),
):
    """
    VB-004/VB-005: Auto-save or explicit save of Puck JSON.
    Writes to the root CourseModule; does NOT change approval_status.
    """
    _course_or_404(course_id, db)
    module = _get_or_create_root_module(course_id, db)

    module.content_blocks = payload.puck_data
    module.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(module)

    return {
        "success": True,
        "updated_at": module.updated_at.isoformat(),
    }

# ── POST /api/v1/puck/courses/{course_id}/publish ─────────────────────────

@router.post("/courses/{course_id}/publish", status_code=status.HTTP_200_OK)
def publish_course(
    course_id: int,
    payload: PublishPayload,
    _actor: dict = Depends(require_roles("instructor", "admin")),
    db: Session = Depends(get_db),
):
    """
    VB-005/VB-007: Atomic publish — saves puck_data, sets status='published',
    and stores a version snapshot.  Rolls back on any error.
    """
    course = _course_or_404(course_id, db)
    module = _get_or_create_root_module(course_id, db)

    try:
        # 1. Persist latest puck_data
        module.content_blocks = payload.puck_data
        module.updated_at = datetime.utcnow()
        module.status = "published"

        # 2. Mark course published
        course.approval_status = "approved"

        # 3. Snapshot version
        last_version = (
            db.query(CourseVersion)
            .filter(CourseVersion.course_id == course_id)
            .order_by(CourseVersion.version_number.desc())
            .first()
        )
        next_version_number = (last_version.version_number + 1) if last_version else 1

        snapshot = CourseVersion(
            course_id=course_id,
            version_number=next_version_number,
            puck_data=payload.puck_data,
            published_at=datetime.utcnow(),
            published_by=payload.published_by,
        )
        db.add(snapshot)
        db.commit()
        db.refresh(course)

        return {
            "success": True,
            "version": next_version_number,
            "published_at": snapshot.published_at.isoformat(),
        }

    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Publish failed — transaction rolled back: {str(exc)}",
        )

# ── GET /api/v1/puck/courses/{course_id}/versions ─────────────────────────

@router.get("/courses/{course_id}/versions")
def get_versions(course_id: int, db: Session = Depends(get_db)):
    """
    VB-007: List all published version snapshots for a course.
    """
    _course_or_404(course_id, db)
    versions = (
        db.query(CourseVersion)
        .filter(CourseVersion.course_id == course_id)
        .order_by(CourseVersion.version_number.desc())
        .all()
    )
    return [
        {
            "id": v.id,
            "version_number": v.version_number,
            "published_at": v.published_at.isoformat() if v.published_at else None,
            "published_by": v.published_by,
        }
        for v in versions
    ]

# ── POST /api/v1/puck/courses/{course_id}/outline ──────────────────────────

# Available block types the instructor can choose from
_OUTLINE_BLOCK_TYPES = [
    ("ModuleHeader",     "Header modul — judul, deskripsi, dan tujuan pembelajaran"),
    ("RichContent",      "Teks & gambar — materi penjelasan kaya format"),
    ("VideoBlock",       "Video — embed video YouTube atau URL langsung"),
    ("QuizBuilder",      "Kuis — soal pilihan ganda dengan penilaian otomatis"),
    ("SocraticChat",     "AI Tutor — percakapan Socratic adaptif dengan AI"),
    ("ReflectionJournal","Jurnal Refleksi — siswa menulis dan mendapat umpan balik AI"),
    ("CodeSandbox",      "Sandbox Kode — latihan koding interaktif"),
    ("Assignment",       "Tugas — instruksi tugas dengan kriteria penilaian"),
    ("DiscussionSeed",   "Diskusi — pertanyaan pemantik diskusi forum"),
    ("PeerReviewRubric", "Rubrik Sejawat — tinjauan berbasis rubrik antar siswa"),
]

_OUTLINE_SYSTEM = """
You are a vocational curriculum designer for Indonesian SMK schools (Kurikulum Merdeka).
Given a course topic and audience, suggest an ordered list of learning blocks for one module.
Each block must be one of these types (use exact names): \
{types}.
Return ONLY a valid JSON array like:
[{{"type":"ModuleHeader","reason":"..."}}, ...]
up to 10 items. No markdown, no explanation.
"""


@router.post("/courses/{course_id}/outline")
async def suggest_outline(
    course_id: int,
    payload: OutlinePayload,
    db: Session = Depends(get_db),
    _actor: dict = Depends(require_roles("instructor", "admin")),
):
    """
    AI-006: Suggest an ordered list of block types for a course module
    given the instructor's prompt and target audience.
    Returns [{type, reason, description}] — fast, cheap AI call.
    """
    _course_or_404(course_id, db)
    type_names = ", ".join(t for t, _ in _OUTLINE_BLOCK_TYPES)
    type_map = {t: d for t, d in _OUTLINE_BLOCK_TYPES}

    user_msg = (
        f"Topic: {payload.prompt}\n"
        f"Audience: {payload.target_audience}\n"
        f"Suggest the best block sequence for ONE module of this course."
    )

    import json as _json

    try:
        import sys as _sys, os as _os
        _sys.path.insert(0, _os.path.dirname(_os.path.dirname(__file__)))
        from services import openai_service

        provider = openai_service._pick_provider()
        client_type = openai_service._client_type(provider)
        system_prompt = _OUTLINE_SYSTEM.format(types=type_names)
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_msg},
        ]
        if client_type == "gemini":
            flat = f"{system_prompt}\n\n{user_msg}"
            resp = await openai_service.clients[provider].generate_content_async(flat)
            raw = resp.text.strip()
        else:
            resp = await openai_service._create_chat_completion(
                provider=provider,
                messages=messages,
                temperature=0.4,
                max_tokens=600,
            )
            raw = resp.choices[0].message.content.strip()

        # Extract JSON array from response
        start = raw.find("[")
        end = raw.rfind("]") + 1
        blocks = _json.loads(raw[start:end]) if start != -1 else []

    except Exception:
        # Fallback: heuristic default outline
        blocks = [
            {"type": "ModuleHeader", "reason": "Memperkenalkan modul"},
            {"type": "RichContent",  "reason": "Materi utama"},
            {"type": "VideoBlock",   "reason": "Demonstrasi visual"},
            {"type": "QuizBuilder",  "reason": "Evaluasi pemahaman"},
            {"type": "ReflectionJournal", "reason": "Refleksi pembelajaran"},
        ]

    # Enrich with description from local map
    result = []
    for b in blocks:
        btype = b.get("type", "")
        if btype in type_map:
            result.append({
                "type": btype,
                "reason": b.get("reason", ""),
                "description": type_map[btype],
            })

    return {"outline": result}


# ── POST /api/v1/puck/courses/{course_id}/generate ─────────────────────────

@router.post("/courses/{course_id}/generate")
async def generate_puck_content(
    course_id: int,
    payload: GeneratePayload,
    db: Session = Depends(get_db),
    _actor: dict = Depends(require_roles("instructor", "admin")),
):
    """
    AI-004: Generate a Puck-compatible course document from a natural language prompt.
    Calls the existing generate pipeline, transforms the agenda JSON into Puck blocks,
    persists as puck_data, and returns the resulting Data object.
    """
    import sys
    import os
    sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

    course = _course_or_404(course_id, db)

    try:
        from services import openai_service

        key_concepts = [
            w.strip().title()
            for w in payload.prompt.replace("/", " ").replace("-", " ").split()
            if len(w.strip()) > 2
        ][:6]

        parsed_content = {
            "title": payload.prompt.title(),
            "summary": f"A {payload.target_audience.lower()} course on {payload.prompt}, "
                       "generated by VOKASI AI aligned with Kurikulum Merdeka and Indonesian vocational standards.",
            "main_topics": [
                {
                    "name": key_concepts[0] if key_concepts else payload.prompt.title(),
                    "description": f"Core foundations and practical applications of {payload.prompt}.",
                    "subtopics": key_concepts[1:4],
                }
            ],
            "learning_objectives": [
                f"Memahami konsep dasar {payload.prompt}",
                f"Menerapkan {payload.prompt} dalam konteks praktis",
                f"Mengevaluasi praktik terbaik dalam {payload.prompt}",
            ],
            "key_concepts": key_concepts,
            "difficulty_level": payload.target_audience,
            "estimated_duration": "4 weeks",
            "target_audience": payload.target_audience,
            "prerequisites": [],
            "approved_block_sequence": payload.approved_outline or [],
        }

        agenda_result = await openai_service.generate_teaching_agenda(
            parsed_content=parsed_content,
            target_audience=payload.target_audience,
            duration_weeks=4,
        )

        agenda = agenda_result.get("agenda") if isinstance(agenda_result, dict) else None

        generate_response = {
            "title": (agenda or {}).get("course_title", payload.prompt.title()),
            "description": (agenda or {}).get("description") or parsed_content["summary"],
            "level": payload.target_audience,
            "duration": f"{(agenda or {}).get('duration_weeks', 4)} weeks",
            "modules": (agenda or {}).get("modules", []),
            "agenda": agenda,
            "parsed_content": parsed_content,
        }

    except Exception as exc:
        generate_response = {
            "title": payload.prompt.title(),
            "description": f"Course about {payload.prompt}",
            "level": payload.target_audience,
            "duration": "4 weeks",
            "modules": [],
            "agenda": None,
            "parsed_content": {},
            "_error": str(exc),
        }

    puck_data = _ai_response_to_puck(generate_response)

    module = _get_or_create_root_module(course_id, db)
    module.content_blocks = puck_data
    module.updated_at = datetime.utcnow()

    if not course.title or course.title == "Untitled Course":
        course.title = generate_response.get("title", course.title)
    if not course.description:
        course.description = generate_response.get("description", "")

    db.commit()
    db.refresh(module)

    return {
        "success": True,
        "puck_data": puck_data,
        "course_title": generate_response.get("title"),
        "provider": (agenda_result.get("provider") if isinstance(agenda_result, dict) else None)
                    if "agenda_result" in dir() else None,
    }


# ── POST /api/v1/puck/courses/{course_id}/regenerate-block ─────────────────

@router.post("/courses/{course_id}/regenerate-block")
async def regenerate_block(
    course_id: int,
    payload: RegenerateBlockPayload,
    db: Session = Depends(get_db),
    _actor: dict = Depends(require_roles("instructor", "admin")),
):
    """
    AI-005: Rewrite a single Puck block using AI based on an instructor prompt.
    Returns only the new props for that block — siblings are untouched.
    """
    import sys, os
    sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
    _course_or_404(course_id, db)

    block_type = payload.block_type
    current_props = payload.block_props
    instruction = payload.prompt

    try:
        from services import openai_service

        regen_result = await openai_service.rewrite_block(
            block_type=block_type,
            current_props=current_props,
            instruction=instruction,
        )
        new_props = regen_result if isinstance(regen_result, dict) else {}

    except Exception:
        new_props = _fallback_regen(block_type, current_props, instruction)

    return {"success": True, "props": new_props, "block_type": block_type}


def _fallback_regen(block_type: str, props: Dict[str, Any], instruction: str) -> Dict[str, Any]:
    """Heuristic fallback when AI service is unavailable."""
    import random, string

    def uid() -> str:
        return "".join(random.choices(string.ascii_lowercase + string.digits, k=6))

    if block_type == "RichContent":
        return {"html": f"<p><em>[Rewritten]</em> {instruction}</p><p>{props.get('html', '')}</p>"}
    if block_type == "ModuleHeader":
        return {
            "title": props.get("title", ""),
            "subtitle": f"{props.get('subtitle', '')} — {instruction[:80]}",
            "learningObjectives": props.get("learningObjectives", ""),
            "estimatedMinutes": props.get("estimatedMinutes", 30),
        }
    if block_type == "QuizBuilder":
        existing = props.get("questions") or []
        return {
            "quizTitle": props.get("quizTitle", "Quiz"),
            "questions": existing,
            "passingScore": props.get("passingScore", 70),
        }
    if block_type == "SocraticChat":
        return {
            "seedQuestion": instruction,
            "persona": props.get("persona", "VOKASI Tutor"),
            "maxTurns": props.get("maxTurns", 8),
        }
    if block_type == "Assignment":
        return {
            "title": props.get("title", "Assignment"),
            "description": instruction,
            "dueLabel": props.get("dueLabel", ""),
            "submissionType": props.get("submissionType", "file"),
            "maxScore": props.get("maxScore", 100),
        }
    return props


def _ai_response_to_puck(response: Dict[str, Any]) -> Dict[str, Any]:
    """Server-side AI→Puck transformer (mirrors frontend aiToPuck.ts logic)."""
    import random
    import string

    def uid() -> str:
        return "".join(random.choices(string.ascii_lowercase + string.digits, k=6))

    def block(btype: str, props: Dict[str, Any]) -> Dict[str, Any]:
        return {"type": btype, "props": {"id": f"{btype}-{uid()}", **props}}

    agenda = response.get("agenda") or {}
    modules: List[Dict] = agenda.get("modules") or response.get("modules") or []
    course_title = agenda.get("course_title") or response.get("title") or "Untitled Course"
    course_desc = agenda.get("description") or response.get("description") or ""
    level = response.get("level", "Beginner")
    duration = response.get("duration", "4 weeks")
    parsed = response.get("parsed_content") or {}
    global_objectives: List[str] = parsed.get("learning_objectives") or []

    content: List[Dict] = []

    content.append(block("ModuleHeader", {
        "title": course_title,
        "subtitle": course_desc,
        "learningObjectives": "\n".join(global_objectives[:5]),
        "estimatedMinutes": 0,
    }))

    for idx, mod in enumerate(modules):
        mod_title = mod.get("title") or f"Module {idx + 1}"
        raw_objectives = mod.get("learning_objectives") or []
        objectives: List[str] = []
        for lo in raw_objectives:
            if isinstance(lo, str):
                objectives.append(lo)
            elif isinstance(lo, dict):
                t = lo.get("text") or lo.get("objective") or ""
                if t:
                    objectives.append(t)
        goals: List[str] = mod.get("learning_goals") or []

        content.append(block("ModuleHeader", {
            "title": mod_title,
            "subtitle": mod.get("subtitle") or "",
            "learningObjectives": "\n".join((objectives + goals)[:4]),
            "estimatedMinutes": 30,
        }))

        sessions = mod.get("session_schedule") or mod.get("teaching_actions") or []
        body_parts = []
        for s in sessions[:6]:
            if not isinstance(s, dict):
                continue
            title = s.get("title") or s.get("description") or s.get("type") or ""
            desc = s.get("description") or ""
            if title and desc and title != desc:
                body_parts.append(f"<h3>{title}</h3><p>{desc}</p>")
            elif title:
                body_parts.append(f"<p>{title}</p>")
        if body_parts:
            content.append(block("RichContent", {"html": "\n".join(body_parts)}))
        elif mod.get("subtitle"):
            content.append(block("RichContent", {"html": f"<p>{mod['subtitle']}</p>"}))

        if mod.get("video_url"):
            content.append(block("VideoBlock", {
                "videoUrl": mod["video_url"],
                "caption": f"{mod_title} — Video",
                "transcriptUrl": "",
            }))

        if objectives:
            content.append(block("SocraticChat", {
                "seedQuestion": objectives[0],
                "persona": "VOKASI Tutor",
                "maxTurns": 8,
            }))

        if mod.get("discussion_prompt"):
            content.append(block("DiscussionSeed", {
                "topic": mod_title,
                "seedPost": mod["discussion_prompt"],
                "requiredReplies": 2,
                "gradingNotes": "",
            }))

        if mod.get("reflection_prompt"):
            content.append(block("ReflectionJournal", {
                "prompt": mod["reflection_prompt"],
                "minWords": 100,
                "tags": mod_title,
            }))

        quiz_qs = mod.get("quiz_questions") or []
        if quiz_qs:
            questions = []
            for q in quiz_qs[:5]:
                if not isinstance(q, dict):
                    continue
                questions.append({
                    "question": q.get("question") or "",
                    "options": "\n".join(q.get("options") or []),
                    "correctIndex": q.get("correct_answer") or 0,
                })
            if questions:
                content.append(block("QuizBuilder", {
                    "quizTitle": f"{mod_title} — Quiz",
                    "questions": questions,
                    "passingScore": 70,
                    "timeLimit": 10,
                }))
        elif len(objectives) >= 2:
            content.append(block("QuizBuilder", {
                "quizTitle": f"{mod_title} — Formative Assessment",
                "questions": [{
                    "question": f"Manakah yang paling tepat menggambarkan: {objectives[0]}?",
                    "options": "\n".join([objectives[0], f"Kebalikan dari {objectives[0]}", "Tidak ada yang benar", "A dan B"]),
                    "correctIndex": 0,
                }],
                "passingScore": 70,
            }))

        if idx % 2 == 1 and objectives:
            content.append(block("Assignment", {
                "title": f"{mod_title} — Tugas Proyek",
                "description": ". ".join(objectives[:3]) + ".",
                "dueLabel": "",
                "submissionType": "file",
                "maxScore": 100,
            }))

    capstone = agenda.get("capstone_project")
    if capstone:
        cap_desc = capstone if isinstance(capstone, str) else (capstone.get("description") or "")
        if cap_desc:
            content.append(block("Assignment", {
                "title": "Proyek Kapstone",
                "description": cap_desc,
                "dueLabel": "Akhir kursus",
                "submissionType": "file",
                "maxScore": 100,
            }))

    return {
        "content": content,
        "root": {"props": {"title": course_title, "level": level, "duration": duration}},
    }


# ── Block progress (LE-002) ───────────────────────────────────────────────────

class BlockProgressPayload(BaseModel):
    block_id: str
    status: str = "completed"
    user_id: Optional[int] = None

@router.get("/courses/{course_id}/progress")
def get_course_progress(
    course_id: int,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """
    LE-002: Return per-block completion status for a student.
    Keyed by user_id query param (or session cookie fallback in future).
    """
    _course_or_404(course_id, db)
    query = db.query(models.PuckBlockProgress).filter(
        models.PuckBlockProgress.course_id == course_id
    )
    if user_id:
        query = query.filter(models.PuckBlockProgress.user_id == user_id)
    records = query.all()
    return [
        {
            "blockId": r.block_id,
            "status": r.status or "completed",
            "completedAt": r.completed_at.isoformat() if r.completed_at else None,
        }
        for r in records
    ]


@router.post("/courses/{course_id}/progress", status_code=status.HTTP_200_OK)
def save_block_progress(
    course_id: int,
    payload: BlockProgressPayload,
    db: Session = Depends(get_db),
):
    """
    LE-002: Mark a puck block as completed for a student.
    Upserts into puck_block_progress.
    """
    _course_or_404(course_id, db)
    user_id = payload.user_id or 0

    existing = (
        db.query(models.PuckBlockProgress)
        .filter(
            models.PuckBlockProgress.user_id == user_id,
            models.PuckBlockProgress.course_id == course_id,
            models.PuckBlockProgress.block_id == payload.block_id,
        )
        .first()
    )

    if existing:
        existing.status = payload.status
        existing.completed_at = datetime.utcnow()
    else:
        record = models.PuckBlockProgress(
            user_id=user_id,
            course_id=course_id,
            block_id=payload.block_id,
            status=payload.status,
            completed_at=datetime.utcnow(),
        )
        db.add(record)

    db.commit()
    return {"success": True, "block_id": payload.block_id, "status": payload.status}


# ── POST /api/v1/puck/courses/{course_id}/socratic-chat ───────────────────

class SocraticChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str

class SocraticChatPayload(BaseModel):
    block_id: str
    message: str
    seed_question: str = ""
    persona: str = "VOKASI AI Tutor"
    max_turns: int = 8
    history: List[SocraticChatMessage] = []
    lesson_context: str = ""  # RichContent html stripped to plain text, passed by client


@router.post("/courses/{course_id}/socratic-chat")
async def socratic_chat(
    course_id: int,
    payload: SocraticChatPayload,
    db: Session = Depends(get_db),
):
    """
    LE-003: SocraticChat RAG endpoint.
    Grounds the AI tutor in the lesson's own RichContent context so
    responses stay on-topic and accurate.  Never reveals answers directly.
    """
    import sys, os, re
    sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

    _course_or_404(course_id, db)

    # -- Build RAG system prompt grounded in lesson context ------------------
    lesson_ctx = payload.lesson_context.strip()
    ctx_block = f"\n\nLESSON CONTENT (ground your responses in this):\n---\n{lesson_ctx[:4000]}\n---" if lesson_ctx else ""

    system_prompt = f"""You are {payload.persona}, a Socratic AI tutor embedded in a VOKASI lesson.

Your role is to guide the student to understanding through probing questions — NEVER give direct answers.
Keep each response under 60 words. Be warm, encouraging, and precise.{ctx_block}

The seed question that opened this conversation: "{payload.seed_question}"

Rules:
1. Stay strictly within the lesson topic above.
2. If the student is correct, affirm briefly and ask a deeper follow-up.
3. If the student is wrong, gently redirect with a hint question.
4. After {payload.max_turns} student turns, wrap up with a short synthesis."""

    # -- Build messages list -------------------------------------------------
    messages: List[Dict[str, Any]] = [{"role": "system", "content": system_prompt}]
    for h in payload.history:
        if h.role in ("user", "assistant"):
            messages.append({"role": h.role, "content": h.content})
    messages.append({"role": "user", "content": payload.message})

    # -- Call AI service -----------------------------------------------------
    try:
        from services import openai_service

        errors: List[str] = []
        reply = ""

        for provider in openai_service.PRIORITY:
            if provider == "mock":
                turn_count = len([m for m in payload.history if m.role == "user"])
                if turn_count >= payload.max_turns - 1:
                    reply = f"Bagus sekali! Kamu sudah mengeksplorasi topik ini dengan baik. Apa satu hal paling penting yang kamu pelajari hari ini?"
                else:
                    reply = f"Pertanyaan yang menarik! Kalau kita lihat dari konteks materi — apa yang kamu pahami sejauh ini tentang konsep tersebut?"
                break

            if provider not in openai_service.clients:
                continue

            try:
                client_type = openai_service.CLIENT_TYPES.get(provider, "openai_compatible")
                model = openai_service.MODELS.get(provider, "")

                if client_type == "gemini":
                    # Flatten to single prompt for Gemini
                    flat = "\n".join(f"{m['role'].upper()}: {m['content']}" for m in messages)
                    response = await openai_service.clients[provider].generate_content_async(flat)
                    reply = response.text.strip()
                else:
                    response = await openai_service._create_chat_completion(
                        openai_service.clients[provider],
                        messages=messages,
                        model=model,
                        temperature=0.7,
                        max_tokens=120,
                    )
                    reply = response.choices[0].message.content.strip()
                break

            except Exception as e:
                errors.append(f"{provider}: {e}")
                continue

        if not reply:
            reply = "Hmm, beri aku waktu sejenak… Coba ceritakan lebih lanjut apa yang kamu pikirkan?"

    except Exception:
        reply = "Maaf, ada kendala teknis. Coba lagi dalam sesaat!"

    return {
        "reply": reply,
        "turn": len(payload.history) + 1,
        "done": len(payload.history) + 1 >= payload.max_turns,
    }


# ── Instructor dashboard: all courses summary (AM-006) ───────────────────

@router.get("/courses")
def list_all_puck_courses(db: Session = Depends(get_db)):
    """
    AM-006: List all courses with Puck content, enriched with learner count,
    avg completion pct, and certificate count. Used by the instructor dashboard.
    """
    courses = db.query(models.Course).all()
    result = []
    for course in courses:
        module = (
            db.query(models.CourseModule)
            .filter(
                models.CourseModule.course_id == course.id,
                models.CourseModule.order == 0,
            )
            .first()
        )
        if not module:
            continue
        puck_data = module.content_blocks or {}
        total_blocks = len(puck_data.get("content", [])) if isinstance(puck_data, dict) else 0
        if total_blocks == 0:
            continue  # skip courses without any puck content

        from collections import defaultdict
        progress_rows = (
            db.query(models.PuckBlockProgress)
            .filter(models.PuckBlockProgress.course_id == course.id)
            .all()
        )
        unique_learners = len({r.user_id for r in progress_rows})
        learners_by_block: dict = defaultdict(set)
        for r in progress_rows:
            if r.status == "completed":
                learners_by_block[r.block_id].add(r.user_id)

        avg_pct = 0
        if unique_learners > 0 and total_blocks > 0:
            total_events = sum(len(v) for v in learners_by_block.values())
            avg_pct = round(total_events / (unique_learners * total_blocks) * 100)

        cert_count = (
            db.query(models.CourseCertificate)
            .filter(models.CourseCertificate.course_id == course.id)
            .count()
        )
        reflection_count = (
            db.query(models.ReflectionEntry)
            .filter(models.ReflectionEntry.course_id == course.id)
            .count()
        )

        result.append({
            "course_id": course.id,
            "title": course.title,
            "approval_status": getattr(course, "approval_status", "draft"),
            "total_blocks": total_blocks,
            "unique_learners": unique_learners,
            "avg_completion_pct": avg_pct,
            "certificates_issued": cert_count,
            "reflections_submitted": reflection_count,
        })

    return result


# ── Course Analytics endpoint (AM-005) ───────────────────────────────────

@router.get("/courses/{course_id}/analytics")
def get_course_analytics(
    course_id: int,
    db: Session = Depends(get_db),
):
    """
    AM-005: Instructor analytics for a single course.
    Returns per-block completion rates, unique learner count,
    reflection submission count, certificate count, and summary stats.
    """
    course = _course_or_404(course_id, db)

    # -- Puck block list -------------------------------------------------------
    module = (
        db.query(models.CourseModule)
        .filter(
            models.CourseModule.course_id == course_id,
            models.CourseModule.order == 0,
        )
        .first()
    )
    puck_data = (module.content_blocks or {}) if module else {}
    blocks = puck_data.get("content", []) if isinstance(puck_data, dict) else []
    total_blocks = len(blocks)

    # -- Block progress rows ---------------------------------------------------
    all_progress = (
        db.query(models.PuckBlockProgress)
        .filter(models.PuckBlockProgress.course_id == course_id)
        .all()
    )

    unique_learners = len({r.user_id for r in all_progress})

    # completions per block_id
    from collections import defaultdict
    completions_by_block: dict = defaultdict(int)
    learners_by_block: dict = defaultdict(set)
    for r in all_progress:
        if r.status == "completed":
            completions_by_block[r.block_id] += 1
            learners_by_block[r.block_id].add(r.user_id)

    # -- Per-block enriched list -----------------------------------------------
    block_analytics = []
    for i, block in enumerate(blocks):
        block_id = (block.get("props") or {}).get("id") or f"block-{i}"
        block_type = block.get("type", "Unknown")
        completed_count = len(learners_by_block.get(block_id, set()))
        completion_rate = round(completed_count / unique_learners * 100) if unique_learners > 0 else 0

        block_analytics.append({
            "index": i + 1,
            "block_id": block_id,
            "block_type": block_type,
            "completed_learners": completed_count,
            "completion_rate": completion_rate,
        })

    # -- Reflections -----------------------------------------------------------
    reflection_count = (
        db.query(models.ReflectionEntry)
        .filter(models.ReflectionEntry.course_id == course_id)
        .count()
    )
    unique_reflectors = len({
        r.user_id for r in
        db.query(models.ReflectionEntry.user_id)
        .filter(models.ReflectionEntry.course_id == course_id)
        .all()
    })

    # -- Certificates ----------------------------------------------------------
    cert_count = (
        db.query(models.CourseCertificate)
        .filter(models.CourseCertificate.course_id == course_id)
        .count()
    )

    # -- Avg completion pct across all learners --------------------------------
    if unique_learners > 0 and total_blocks > 0:
        total_completed_block_events = sum(
            len(v) for v in learners_by_block.values()
        )
        # Each learner can complete each block once; avg = total / (learners * blocks)
        avg_completion_pct = round(
            total_completed_block_events / (unique_learners * total_blocks) * 100
        )
    else:
        avg_completion_pct = 0

    return {
        "course_id": course_id,
        "course_title": course.title,
        "total_blocks": total_blocks,
        "unique_learners": unique_learners,
        "certificates_issued": cert_count,
        "reflections_submitted": reflection_count,
        "unique_reflectors": unique_reflectors,
        "avg_completion_pct": avg_completion_pct,
        "block_analytics": block_analytics,
    }


# ── Reflection Journal endpoints (LE-007) ────────────────────────────────

class ReflectionPayload(BaseModel):
    user_id: int = 0
    block_id: str
    text: str
    prompt: str = ""
    min_words: int = 0
    lesson_context: str = ""


@router.post("/courses/{course_id}/reflection", status_code=status.HTTP_200_OK)
async def submit_reflection(
    course_id: int,
    payload: ReflectionPayload,
    db: Session = Depends(get_db),
):
    """
    LE-007: Save a student's reflection and generate AI feedback.
    Upserts by (user_id, course_id, block_id) — students can revise.
    """
    _course_or_404(course_id, db)

    word_count = len(payload.text.split())

    # -- Generate AI feedback ------------------------------------------------
    ai_feedback = ""
    try:
        import sys as _sys, os as _os
        _sys.path.insert(0, _os.path.dirname(_os.path.dirname(__file__)))
        from services import openai_service

        ctx_snippet = payload.lesson_context[:2000] if payload.lesson_context else ""
        ctx_block = f"\n\nLesson context:\n---\n{ctx_snippet}\n---" if ctx_snippet else ""

        system_prompt = f"""You are a warm, constructive learning coach reviewing a student's reflection journal.

Prompt the student was responding to: "{payload.prompt}"{ctx_block}

Your task:
1. Acknowledge 1-2 specific strengths in their reflection.
2. Ask 1 deepening question to push their thinking further.
3. Suggest 1 concrete next step or connection to the lesson.

Keep your response under 120 words. Be encouraging, specific, and Socratic.
Do NOT repeat the student's words back at length — synthesize and elevate."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": payload.text},
        ]

        reply = ""
        for provider in openai_service.PRIORITY:
            if provider == "mock":
                reply = (
                    "Refleksimu menunjukkan pemahaman yang baik tentang konsep inti! "
                    "Kamu berhasil menghubungkan materi dengan pengalaman nyata — itu tanda berpikir kritis. "
                    "Pertanyaan untuk diperdalam: bagaimana kamu akan menerapkan ide ini dalam proyek yang sedang kamu kerjakan? "
                    "Langkah berikutnya: coba tuliskan satu contoh konkret dari kehidupan sehari-hari yang mencerminkan konsep ini."
                )
                break
            if provider not in openai_service.clients:
                continue
            try:
                client_type = openai_service.CLIENT_TYPES.get(provider, "openai_compatible")
                model = openai_service.MODELS.get(provider, "")
                if client_type == "gemini":
                    flat = f"SYSTEM: {system_prompt}\n\nSTUDENT REFLECTION:\n{payload.text}"
                    response = await openai_service.clients[provider].generate_content_async(flat)
                    reply = response.text.strip()
                else:
                    response = await openai_service._create_chat_completion(
                        openai_service.clients[provider],
                        messages=messages,
                        model=model,
                        temperature=0.7,
                        max_tokens=160,
                    )
                    reply = response.choices[0].message.content.strip()
                break
            except Exception as e:
                continue

        ai_feedback = reply or "Refleksimu sudah diterima! Terus semangat belajar."

    except Exception:
        ai_feedback = "Refleksimu sudah tersimpan. Terima kasih telah berbagi pemikiranmu!"

    # -- Upsert reflection entry ---------------------------------------------
    existing = (
        db.query(models.ReflectionEntry)
        .filter(
            models.ReflectionEntry.user_id == payload.user_id,
            models.ReflectionEntry.course_id == course_id,
            models.ReflectionEntry.block_id == payload.block_id,
        )
        .first()
    )
    if existing:
        existing.text = payload.text
        existing.word_count = word_count
        existing.ai_feedback = ai_feedback
        existing.updated_at = datetime.utcnow()
    else:
        entry = models.ReflectionEntry(
            user_id=payload.user_id,
            course_id=course_id,
            block_id=payload.block_id,
            text=payload.text,
            word_count=word_count,
            ai_feedback=ai_feedback,
        )
        db.add(entry)

    db.commit()
    return {
        "success": True,
        "word_count": word_count,
        "ai_feedback": ai_feedback,
    }


@router.get("/courses/{course_id}/reflection")
def get_reflection(
    course_id: int,
    user_id: int = 0,
    block_id: str = "",
    db: Session = Depends(get_db),
):
    """LE-007: Retrieve a student's saved reflection for a specific block."""
    _course_or_404(course_id, db)
    q = db.query(models.ReflectionEntry).filter(
        models.ReflectionEntry.course_id == course_id,
        models.ReflectionEntry.user_id == user_id,
    )
    if block_id:
        q = q.filter(models.ReflectionEntry.block_id == block_id)
    entry = q.first()
    if not entry:
        return {"text": "", "word_count": 0, "ai_feedback": None, "submitted_at": None}
    return {
        "text": entry.text,
        "word_count": entry.word_count,
        "ai_feedback": entry.ai_feedback,
        "submitted_at": entry.submitted_at.isoformat() if entry.submitted_at else None,
    }


# ── Certificate endpoints (LE-006) ────────────────────────────────────────

class CertificatePayload(BaseModel):
    user_id: int = 0
    student_name: str = ""


@router.post("/courses/{course_id}/certificate", status_code=status.HTTP_200_OK)
def issue_certificate(
    course_id: int,
    payload: CertificatePayload,
    db: Session = Depends(get_db),
):
    """
    LE-006: Issue a completion certificate for a student.
    Idempotent — returns existing cert if already issued.
    Validates that the student has completed all blocks in this course.
    """
    import uuid as _uuid
    course = _course_or_404(course_id, db)

    # Count total blocks from puck_data
    module = (
        db.query(models.CourseModule)
        .filter(models.CourseModule.course_id == course_id, models.CourseModule.order == 0)
        .first()
    )
    puck_data = (module.content_blocks or {}) if module else {}
    total_blocks = len(puck_data.get("content", [])) if isinstance(puck_data, dict) else 0

    # Count completed blocks for this user
    completed = (
        db.query(models.PuckBlockProgress)
        .filter(
            models.PuckBlockProgress.course_id == course_id,
            models.PuckBlockProgress.user_id == payload.user_id,
            models.PuckBlockProgress.status == "completed",
        )
        .count()
    )

    if total_blocks > 0 and completed < total_blocks:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Course not yet completed ({completed}/{total_blocks} blocks done)",
        )

    # Idempotent: return existing cert
    existing = (
        db.query(models.CourseCertificate)
        .filter(
            models.CourseCertificate.user_id == payload.user_id,
            models.CourseCertificate.course_id == course_id,
        )
        .first()
    )
    if existing:
        return {
            "cert_code": existing.cert_code,
            "issued_at": existing.issued_at.isoformat(),
            "student_name": existing.student_name,
            "course_title": existing.course_title,
            "already_issued": True,
        }

    cert_code = str(_uuid.uuid4())
    course_title = getattr(course, "title", "Course")
    cert = models.CourseCertificate(
        user_id=payload.user_id,
        course_id=course_id,
        cert_code=cert_code,
        student_name=payload.student_name or f"Student #{payload.user_id}",
        course_title=course_title,
    )
    db.add(cert)
    db.commit()
    db.refresh(cert)

    return {
        "cert_code": cert.cert_code,
        "issued_at": cert.issued_at.isoformat(),
        "student_name": cert.student_name,
        "course_title": cert.course_title,
        "already_issued": False,
    }


@router.get("/courses/{course_id}/certificate")
def get_my_certificate(
    course_id: int,
    user_id: int = 0,
    db: Session = Depends(get_db),
):
    """LE-006: Get the certificate for a specific user+course, if it exists."""
    _course_or_404(course_id, db)
    cert = (
        db.query(models.CourseCertificate)
        .filter(
            models.CourseCertificate.course_id == course_id,
            models.CourseCertificate.user_id == user_id,
        )
        .first()
    )
    if not cert:
        return {"cert_code": None}
    return {
        "cert_code": cert.cert_code,
        "issued_at": cert.issued_at.isoformat(),
        "student_name": cert.student_name,
        "course_title": cert.course_title,
    }


@router.get("/certificate/{cert_code}")
def verify_certificate(cert_code: str, db: Session = Depends(get_db)):
    """LE-006: Public endpoint — verify a certificate by its unique code."""
    cert = (
        db.query(models.CourseCertificate)
        .filter(models.CourseCertificate.cert_code == cert_code)
        .first()
    )
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return {
        "valid": True,
        "cert_code": cert.cert_code,
        "student_name": cert.student_name,
        "course_title": cert.course_title,
        "issued_at": cert.issued_at.isoformat(),
        "course_id": cert.course_id,
    }


# ── LE-008: DiscussionSeed live forum ─────────────────────────────────────────

class DiscussionPostPayload(BaseModel):
    user_id: int
    author_name: Optional[str] = "Anonymous"
    body: str
    parent_id: Optional[int] = None  # None = top-level post, int = reply


def _serialize_post(p: models.DiscussionPost) -> dict:
    return {
        "id": p.id,
        "course_id": p.course_id,
        "block_id": p.block_id,
        "parent_id": p.parent_id,
        "user_id": p.user_id,
        "author_name": p.author_name or "Anonymous",
        "body": p.body,
        "upvotes": p.upvotes,
        "upvoters": p.upvoters or [],
        "created_at": p.created_at.isoformat() if p.created_at else None,
        "replies": [_serialize_post(r) for r in (p.replies or [])],
    }


@router.get("/courses/{course_id}/discussion/{block_id}")
def list_discussion_posts(
    course_id: int,
    block_id: str,
    db: Session = Depends(get_db),
):
    """LE-008: Return all top-level posts (with nested replies) for a block."""
    _course_or_404(course_id, db)
    posts = (
        db.query(models.DiscussionPost)
        .filter(
            models.DiscussionPost.course_id == course_id,
            models.DiscussionPost.block_id == block_id,
            models.DiscussionPost.parent_id.is_(None),
        )
        .order_by(models.DiscussionPost.created_at.asc())
        .all()
    )
    return {"posts": [_serialize_post(p) for p in posts]}


@router.post("/courses/{course_id}/discussion/{block_id}")
def create_discussion_post(
    course_id: int,
    block_id: str,
    payload: DiscussionPostPayload,
    db: Session = Depends(get_db),
):
    """LE-008: Create a top-level post or reply to an existing post."""
    _course_or_404(course_id, db)

    if payload.parent_id is not None:
        parent = db.query(models.DiscussionPost).filter(
            models.DiscussionPost.id == payload.parent_id,
            models.DiscussionPost.course_id == course_id,
        ).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent post not found")

    post = models.DiscussionPost(
        course_id=course_id,
        block_id=block_id,
        parent_id=payload.parent_id,
        user_id=payload.user_id,
        author_name=payload.author_name or "Anonymous",
        body=payload.body.strip(),
        upvotes=0,
        upvoters=[],
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return _serialize_post(post)


@router.post("/courses/{course_id}/discussion/posts/{post_id}/upvote")
def toggle_upvote(
    course_id: int,
    post_id: int,
    user_id: int,
    db: Session = Depends(get_db),
):
    """LE-008: Toggle upvote for a discussion post (idempotent)."""
    _course_or_404(course_id, db)
    post = db.query(models.DiscussionPost).filter(
        models.DiscussionPost.id == post_id,
        models.DiscussionPost.course_id == course_id,
    ).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    voters: list = list(post.upvoters or [])
    if user_id in voters:
        voters.remove(user_id)
    else:
        voters.append(user_id)
    post.upvoters = voters
    post.upvotes = len(voters)
    post.updated_at = datetime.utcnow()
    db.commit()
    return {"upvotes": post.upvotes, "upvoters": post.upvoters}


@router.get("/courses/{course_id}/versions/{version_number}")
def get_version_data(
    course_id: int,
    version_number: int,
    db: Session = Depends(get_db),
):
    """
    VB-007: Retrieve full puck_data for a specific version snapshot.
    """
    _course_or_404(course_id, db)
    version = (
        db.query(CourseVersion)
        .filter(
            CourseVersion.course_id == course_id,
            CourseVersion.version_number == version_number,
        )
        .first()
    )
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    return {
        "version_number": version.version_number,
        "published_at": version.published_at.isoformat() if version.published_at else None,
        "published_by": version.published_by,
        "puck_data": version.puck_data,
    }


# ── AM-004: SCORM 1.2 Export ──────────────────────────────────────────────────

def _block_to_html(block: dict) -> str:
    """Convert a single Puck block to simple HTML for SCORM package."""
    btype = block.get("type", "")
    props = block.get("props") or {}

    def esc(v) -> str:
        return _html.escape(str(v)) if v else ""

    if btype == "ModuleHeader":
        objectives = props.get("objectives", "")
        objs_html = "".join(
            f"<li>{esc(o)}</li>" for o in (objectives.split("\n") if objectives else [])
        )
        return (
            f'<div class="block module-header">'
            f'<h1>{esc(props.get("title", "Module"))}</h1>'
            f'<p class="desc">{esc(props.get("description", ""))}</p>'
            f'<p class="meta">⏱ {esc(props.get("duration", ""))} &nbsp;|&nbsp; 📊 {esc(props.get("level", ""))}</p>'
            f'<ul class="objectives">{objs_html}</ul>'
            f'</div>'
        )
    elif btype == "RichContent":
        return (
            f'<div class="block rich-content">'
            f'{props.get("html", esc(props.get("body", "")))}'
            f'</div>'
        )
    elif btype == "VideoBlock":
        url = esc(props.get("url", ""))
        transcript = esc(props.get("transcript", ""))
        return (
            f'<div class="block video-block">'
            f'<p>🎬 <a href="{url}" target="_blank">{url}</a></p>'
            f'{"<blockquote>" + transcript + "</blockquote>" if transcript else ""}'
            f'</div>'
        )
    elif btype == "QuizBuilder":
        questions = props.get("questions") or []
        q_html = ""
        for qi, q in enumerate(questions):
            opts = (q.get("options") or "").split("\n")
            opts_html = "".join(f'<li><label><input type="radio" name="q{qi}"> {esc(o)}</label></li>' for o in opts if o.strip())
            q_html += f'<div class="question"><p><strong>Q{qi+1}.</strong> {esc(q.get("question",""))}</p><ul>{opts_html}</ul></div>'
        return (
            f'<div class="block quiz-builder">'
            f'<h3>Quiz: {esc(props.get("quizTitle","Quiz"))}</h3>'
            f'{q_html}'
            f'<p class="meta">Passing score: {esc(props.get("passingScore", 70))}%</p>'
            f'</div>'
        )
    elif btype == "ReflectionJournal":
        return (
            f'<div class="block reflection">'
            f'<h3>📔 Reflection Journal</h3>'
            f'<p class="prompt">{esc(props.get("prompt", ""))}</p>'
            f'<textarea rows="6" placeholder="Write your reflection here…" style="width:100%;"></textarea>'
            f'</div>'
        )
    elif btype == "SocraticChat":
        return (
            f'<div class="block socratic">'
            f'<h3>🤖 AI Discussion</h3>'
            f'<blockquote>{esc(props.get("seedQuestion", ""))}</blockquote>'
            f'<p class="meta"><em>Live AI interaction requires the VOKASI platform.</em></p>'
            f'</div>'
        )
    elif btype == "DiscussionSeed":
        return (
            f'<div class="block discussion">'
            f'<h3>💬 Discussion</h3>'
            f'<blockquote>{esc(props.get("seedPost", props.get("topic", "")))}</blockquote>'
            f'<p class="meta"><em>Live discussion requires the VOKASI platform.</em></p>'
            f'</div>'
        )
    elif btype == "Assignment":
        return (
            f'<div class="block assignment">'
            f'<h3>📋 Assignment</h3>'
            f'<p>{esc(props.get("description", props.get("instructions", "")))}</p>'
            f'<p class="meta">Due: {esc(props.get("dueDate",""))} &nbsp;|&nbsp; Points: {esc(props.get("maxPoints",""))}</p>'
            f'</div>'
        )
    else:
        return f'<div class="block generic"><p><em>[{esc(btype)}]</em></p></div>'


_SCORM_CSS = """
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 860px; margin: 0 auto; padding: 24px; color: #1f2937; background: #fafaf9; }
.block { margin-bottom: 32px; padding: 24px; border-radius: 16px; border: 1px solid #e5e7eb; background: white; }
.module-header { background: #064e3b; color: white; border: none; }
.module-header h1 { margin: 0 0 8px; font-size: 1.6rem; }
.module-header .meta { opacity: 0.8; font-size: 0.85rem; }
.module-header .objectives { margin-top: 12px; }
.rich-content h2, .rich-content h3 { color: #064e3b; }
.quiz-builder { background: #fffbeb; border-color: #fde68a; }
.quiz-builder .question { margin-bottom: 16px; }
.reflection { background: #f0fdfa; border-color: #99f6e4; }
.reflection textarea { border: 1px solid #99f6e4; border-radius: 8px; padding: 8px; resize: vertical; }
.socratic { background: #eef2ff; border-color: #c7d2fe; }
.discussion { background: #f5f3ff; border-color: #ddd6fe; }
.assignment { background: #fff7ed; border-color: #fed7aa; }
.prompt { font-style: italic; color: #0f766e; }
h1,h2,h3 { margin-top: 0; }
blockquote { border-left: 4px solid #6366f1; margin: 0; padding-left: 16px; font-style: italic; color: #4338ca; }
.meta { font-size: 0.8rem; color: #6b7280; }
"""

_IMSMANIFEST_TEMPLATE = """\
<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="VOKASI_COURSE_{course_id}" version="1.2"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2
    imscp_rootv1p1p2.xsd
    http://www.adlnet.org/xsd/adlcp_rootv1p2
    adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="ORG_{course_id}">
    <organization identifier="ORG_{course_id}">
      <title>{course_title}</title>
      <item identifier="ITEM_1" identifierref="RES_1">
        <title>{course_title}</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES_1" type="webcontent"
      adlcp:scormtype="sco"
      href="index.html">
      <file href="index.html"/>
      <file href="scorm_api.js"/>
    </resource>
  </resources>
</manifest>"""

_SCORM_API_JS = """\
// Minimal SCORM 1.2 API stub
var API = {
  _status: "not attempted",
  LMSInitialize: function() { this._status = "incomplete"; return "true"; },
  LMSFinish: function() { return "true"; },
  LMSGetValue: function(k) {
    if (k === "cmi.core.lesson_status") return this._status;
    return "";
  },
  LMSSetValue: function(k, v) {
    if (k === "cmi.core.lesson_status") this._status = v;
    if (k === "cmi.core.score.raw") document.title = "Score: " + v;
    return "true";
  },
  LMSCommit: function() { return "true"; },
  LMSGetLastError: function() { return "0"; },
  LMSGetErrorString: function() { return "No error"; },
  LMSGetDiagnostic: function() { return ""; }
};
window.API = API;
window.onload = function() { API.LMSInitialize(""); };
window.onunload = function() { API.LMSSetValue("cmi.core.lesson_status","completed"); API.LMSFinish(""); };
"""


@router.get("/courses/{course_id}/scorm-export")
def export_scorm(
    course_id: int,
    db: Session = Depends(get_db),
):
    """
    AM-004: Generate a SCORM 1.2 ZIP package from the published Puck course.
    Returns a downloadable .zip file with imsmanifest.xml, index.html, scorm_api.js.
    """
    course = _course_or_404(course_id, db)
    module = (
        db.query(models.CourseModule)
        .filter(models.CourseModule.course_id == course_id, models.CourseModule.order == 0)
        .first()
    )
    puck_data = (module.content_blocks or {}) if module else {}
    blocks = puck_data.get("content", []) if isinstance(puck_data, dict) else []

    course_title = _html.escape(course.title or f"Course {course_id}")

    # Build index.html body
    blocks_html = "\n".join(_block_to_html(b) for b in blocks)
    index_html = f"""<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{course_title}</title>
  <script src="scorm_api.js"></script>
  <style>{_SCORM_CSS}</style>
</head>
<body>
  <header style="margin-bottom:32px;">
    <p style="font-size:0.75rem;color:#9ca3af;">VOKASI — SCORM 1.2 Export</p>
  </header>
  {blocks_html}
  <footer style="margin-top:48px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:0.75rem;color:#9ca3af;text-align:center;">
    Exported from VOKASI Platform &middot; Course ID: {course_id}
  </footer>
</body>
</html>"""

    manifest = _IMSMANIFEST_TEMPLATE.format(
        course_id=course_id,
        course_title=course_title,
    )

    # Build ZIP in memory
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("imsmanifest.xml", manifest)
        zf.writestr("index.html", index_html)
        zf.writestr("scorm_api.js", _SCORM_API_JS)

    buf.seek(0)
    safe_title = "".join(c if c.isalnum() or c in "-_" else "_" for c in (course.title or f"course_{course_id}"))
    filename = f"VOKASI_SCORM_{safe_title}_{course_id}.zip"

    return StreamingResponse(
        buf,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
