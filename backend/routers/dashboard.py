from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel
from typing import Optional

import sql_models as models
from database import get_db

router = APIRouter(prefix="/api/v1", tags=["dashboard"])

PHASE_MAP = {
    "conceive": "immerse", "design": "realize", "implement": "iterate",
    "operate": "scale", "immerse": "immerse", "realize": "realize",
    "iterate": "iterate", "scale": "scale", "completed": "completed",
    "immersion": "immerse", "reflection": "realize", "iteration": "iterate",
}


@router.get("/student/dashboard")
def get_student_dashboard(user_id: int, db: Session = Depends(get_db)):
    """Aggregated student dashboard: courses, credentials, IRIS projects, streak, recommendations."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Enrolled courses + progress
    enrollments = db.query(models.Enrollment).filter(models.Enrollment.user_id == user_id).all()
    enrolled_courses = []
    for e in enrollments:
        course = db.query(models.Course).filter(models.Course.id == e.course_id).first()
        if course:
            project = db.query(models.CDIOProject).filter(
                models.CDIOProject.course_id == e.course_id,
                models.CDIOProject.user_id == user_id,
            ).first()
            enrolled_courses.append({
                "course_id": course.id,
                "title": course.title,
                "instructor": course.instructor,
                "progress": project.completion_percentage if project else 0,
                "status": e.status,
                "image": course.image,
                "category": course.category,
            })

    # Credentials
    credentials = db.query(models.Credential).filter(models.Credential.user_id == user_id).all()
    creds_list = [
        {
            "id": c.id,
            "title": c.title,
            "type": c.credential_type,
            "status": c.status,
            "issued_at": c.issued_at.isoformat() if c.issued_at else None,
        }
        for c in credentials
    ]

    # IRIS projects
    projects = db.query(models.CDIOProject).filter(models.CDIOProject.user_id == user_id).all()
    iris_projects = []
    for p in projects:
        course = db.query(models.Course).filter(models.Course.id == p.course_id).first()
        iris_projects.append({
            "project_id": p.id,
            "course_id": p.course_id,
            "project_title": p.title or (f"{course.title} Project" if course else "Untitled"),
            "current_phase": PHASE_MAP.get(p.current_phase, p.current_phase),
            "completion_percentage": p.completion_percentage,
            "sfia_target_level": 3,
        })

    # Gamification streak
    streak = db.query(models.LearningStreak).filter(models.LearningStreak.user_id == user_id).first()
    learning_streak = None
    if streak:
        learning_streak = {
            "current_streak": streak.current_streak,
            "longest_streak": streak.longest_streak,
            "this_week": streak.week_activity or [False] * 7,
            "total_xp": streak.total_xp,
        }

    # Recommended courses (published, not yet enrolled)
    enrolled_ids = {e.course_id for e in enrollments}
    rec_all = (
        db.query(models.Course)
        .filter(
            ~models.Course.id.in_(enrolled_ids),
            models.Course.approval_status.in_(["published", "approved"]),
        )
        .all()
    )
    rec_all.sort(key=lambda c: 1 if c.tag == "Coming Soon" else 0)
    recommended_courses = [
        {
            "id": c.id,
            "title": c.title,
            "instructor": c.instructor or "",
            "org": c.org or "",
            "rating": c.rating or 0.0,
            "students_count": c.students_count or "0",
            "image": c.image or "",
            "tag": c.tag,
            "level": c.level or "Beginner",
            "category": c.category,
        }
        for c in rec_all[:4]
    ]

    avg_progress = (
        sum(c["progress"] for c in enrolled_courses) / len(enrolled_courses)
        if enrolled_courses
        else 0
    )

    return {
        "enrolled_courses": enrolled_courses,
        "credentials": creds_list,
        "total_learning_hours": len(enrolled_courses) * 8,
        "average_progress": round(avg_progress, 1),
        "recommended_courses": recommended_courses,
        "upcoming_deadlines": [],
        "career_pathway_id": user.career_pathway_id,
        "iris_projects": iris_projects,
        "learning_streak": learning_streak,
    }


@router.get("/users/{user_id}/profile")
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    """
    AM-004: Full student profile — account info, Puck course progress,
    certificates, reflection count, quiz block completions, and streak.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # -- Puck course progress -------------------------------------------------
    from collections import defaultdict
    puck_progress_rows = (
        db.query(models.PuckBlockProgress)
        .filter(models.PuckBlockProgress.user_id == user_id)
        .all()
    )

    # Group by course_id
    progress_by_course: dict = defaultdict(list)
    for row in puck_progress_rows:
        progress_by_course[row.course_id].append(row)

    puck_summary = []
    for course_id_key, rows in progress_by_course.items():
        course_obj = db.query(models.Course).filter(models.Course.id == course_id_key).first()
        if not course_obj:
            continue
        # puck_data lives in the root module (order=0)
        module = (
            db.query(models.CourseModule)
            .filter(
                models.CourseModule.course_id == course_id_key,
                models.CourseModule.order == 0,
            )
            .first()
        )
        puck_data = (module.content_blocks or {}) if module else {}
        total = len(puck_data.get("content", [])) if isinstance(puck_data, dict) else 0
        completed = len([r for r in rows if r.status == "completed"])
        puck_summary.append({
            "course_id": course_obj.id,
            "course_title": course_obj.title,
            "total_blocks": total,
            "completed_blocks": completed,
            "pct": round(completed / total * 100) if total > 0 else 0,
            "last_activity": (lambda dt: dt.isoformat() if dt else None)(
                max((r.completed_at for r in rows if r.completed_at), default=None)
            ),
        })

    puck_summary.sort(key=lambda x: x["pct"], reverse=True)

    # -- Certificates ---------------------------------------------------------
    certs = (
        db.query(models.CourseCertificate)
        .filter(models.CourseCertificate.user_id == user_id)
        .order_by(models.CourseCertificate.issued_at.desc())
        .all()
    )
    cert_list = [
        {
            "cert_code": c.cert_code,
            "course_title": c.course_title,
            "issued_at": c.issued_at.isoformat() if c.issued_at else None,
        }
        for c in certs
    ]

    # -- Reflections ----------------------------------------------------------
    reflection_count = (
        db.query(models.ReflectionEntry)
        .filter(models.ReflectionEntry.user_id == user_id)
        .count()
    )

    # -- Streak ---------------------------------------------------------------
    streak = db.query(models.LearningStreak).filter(models.LearningStreak.user_id == user_id).first()
    streak_data = None
    if streak:
        streak_data = {
            "current_streak": streak.current_streak,
            "longest_streak": streak.longest_streak,
            "total_xp": streak.total_xp,
            "this_week": streak.week_activity or [False] * 7,
        }

    # -- Legacy credentials ---------------------------------------------------
    credentials = db.query(models.Credential).filter(models.Credential.user_id == user_id).all()

    return {
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "career_pathway_id": getattr(user, "career_pathway_id", None),
            "joined_at": user.created_at.isoformat() if getattr(user, "created_at", None) else None,
        },
        "puck_courses": puck_summary,
        "certificates": cert_list,
        "reflection_count": reflection_count,
        "credentials": [
            {
                "id": c.id,
                "title": c.title,
                "type": c.credential_type,
                "status": c.status,
                "issued_at": c.issued_at.isoformat() if c.issued_at else None,
            }
            for c in credentials
        ],
        "streak": streak_data,
        "stats": {
            "courses_in_progress": len([p for p in puck_summary if 0 < p["pct"] < 100]),
            "courses_completed": len([p for p in puck_summary if p["pct"] == 100]),
            "certificates_earned": len(cert_list),
            "reflections_written": reflection_count,
        },
    }


@router.get("/institution/analytics")
def get_institution_analytics(db: Session = Depends(get_db)):
    """
    AM-003: Institution-wide analytics dashboard.
    Aggregates across ALL Puck courses:
    - Platform totals
    - Block-type popularity histogram
    - Per-course completion rate + learner count (top 10 by learners)
    - Learner leaderboard (top 10 by completed blocks)
    """
    from collections import defaultdict, Counter

    # ── 1. Totals ─────────────────────────────────────────────────────────────
    all_puck_modules = (
        db.query(models.CourseModule)
        .filter(models.CourseModule.order == 0)
        .all()
    )
    total_courses = len(all_puck_modules)

    all_progress = db.query(models.PuckBlockProgress).all()
    total_block_completions = len(all_progress)
    unique_learners = len({r.user_id for r in all_progress})

    total_reflections = db.query(models.ReflectionEntry).count()
    total_certificates = db.query(models.CourseCertificate).count()
    total_discussion_posts = db.query(models.DiscussionPost).count()

    # ── 2. Block-type popularity histogram ────────────────────────────────────
    block_type_counter: Counter = Counter()
    for module in all_puck_modules:
        puck_data = module.content_blocks or {}
        if isinstance(puck_data, dict):
            for block in puck_data.get("content", []):
                bt = block.get("type", "Unknown")
                block_type_counter[bt] += 1

    block_type_histogram = [
        {"block_type": bt, "count": cnt}
        for bt, cnt in block_type_counter.most_common(10)
    ]

    # ── 3. Per-course stats ────────────────────────────────────────────────────
    learners_by_course: dict = defaultdict(set)
    completions_by_course: dict = defaultdict(int)
    for row in all_progress:
        learners_by_course[row.course_id].add(row.user_id)
        if row.status == "completed":
            completions_by_course[row.course_id] += 1

    total_blocks_by_course: dict = {}
    for module in all_puck_modules:
        puck_data = module.content_blocks or {}
        total_blocks_by_course[module.course_id] = (
            len(puck_data.get("content", [])) if isinstance(puck_data, dict) else 0
        )

    course_rows = db.query(models.Course).all()
    course_id_to_title = {c.id: c.title for c in course_rows}

    per_course = []
    for course_id, learner_set in learners_by_course.items():
        n_learners = len(learner_set)
        n_completed = completions_by_course.get(course_id, 0)
        n_blocks = total_blocks_by_course.get(course_id, 0)
        completion_rate = round(n_completed / (n_blocks * n_learners) * 100) if (n_blocks > 0 and n_learners > 0) else 0
        per_course.append({
            "course_id": course_id,
            "course_title": course_id_to_title.get(course_id, f"Course {course_id}"),
            "learner_count": n_learners,
            "completed_blocks": n_completed,
            "total_blocks": n_blocks,
            "completion_rate": min(completion_rate, 100),
        })

    per_course.sort(key=lambda x: x["learner_count"], reverse=True)

    # ── 4. Learner leaderboard ─────────────────────────────────────────────────
    completions_by_user: Counter = Counter()
    for row in all_progress:
        if row.status == "completed":
            completions_by_user[row.user_id] += 1

    user_ids_top = [uid for uid, _ in completions_by_user.most_common(10)]
    user_rows = db.query(models.User).filter(models.User.id.in_(user_ids_top)).all()
    user_name_map = {u.id: (u.name or u.email or f"User {u.id}") for u in user_rows}

    leaderboard = [
        {
            "rank": i + 1,
            "user_id": uid,
            "name": user_name_map.get(uid, f"User {uid}"),
            "completed_blocks": completions_by_user[uid],
        }
        for i, uid in enumerate(user_ids_top)
    ]

    return {
        "totals": {
            "courses": total_courses,
            "unique_learners": unique_learners,
            "block_completions": total_block_completions,
            "reflections": total_reflections,
            "certificates": total_certificates,
            "discussion_posts": total_discussion_posts,
        },
        "block_type_histogram": block_type_histogram,
        "per_course": per_course[:10],
        "leaderboard": leaderboard,
    }


class CareerPathwayUpdate(BaseModel):
    career_pathway_id: Optional[str] = None


@router.put("/users/{user_id}/career-pathway")
def update_career_pathway(user_id: int, data: CareerPathwayUpdate, db: Session = Depends(get_db)):
    """Update a user's selected career pathway."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.career_pathway_id = data.career_pathway_id
    db.commit()
    db.refresh(user)
    return {
        "success": True,
        "user_id": user.id,
        "career_pathway_id": user.career_pathway_id,
    }
