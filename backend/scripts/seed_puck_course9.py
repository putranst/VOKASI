"""
Seed script: convert course 9 (AI Fundamentals) existing content_blocks
into Puck Data format and store as the root module (order=0).

Run from backend/:
    python3 scripts/seed_puck_course9.py
"""

import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
import sql_models as models
from datetime import datetime

COURSE_ID = 9

def block_to_puck_component(block: dict, module_title: str, is_first: bool):
    """Convert a legacy content_block dict to a Puck component entry."""
    btype = block.get("type", "text")
    content = block.get("content", "")
    bid = block.get("id", "")

    if btype == "heading":
        return {
            "type": "ModuleHeader",
            "props": {
                "id": f"puck-{bid}",
                "title": content,
                "subtitle": module_title if is_first else "",
                "learningObjectives": "",
                "estimatedMinutes": 0,
            },
        }
    elif btype in ("text", "paragraph"):
        # Convert **bold** markers to <strong> for HTML rendering
        html = content.replace("**", "<strong>", 1)
        while "**" in html:
            html = html.replace("**", "</strong>", 1)
            if "**" in html:
                html = html.replace("**", "<strong>", 1)
        html = html.replace("\n\n", "</p><p>").replace("\n", "<br/>")
        html = f"<p>{html}</p>"
        return {
            "type": "RichContent",
            "props": {
                "id": f"puck-{bid}",
                "html": html,
            },
        }
    elif btype in ("video", "youtube"):
        return {
            "type": "VideoBlock",
            "props": {
                "id": f"puck-{bid}",
                "videoUrl": block.get("metadata", {}).get("url", ""),
                "caption": content,
                "transcriptUrl": "",
            },
        }
    elif btype == "quiz":
        return {
            "type": "QuizBuilder",
            "props": {
                "id": f"puck-{bid}",
                "quizTitle": content or "Knowledge Check",
                "questions": [],
                "passingScore": 70,
            },
        }
    else:
        # Fallback → RichContent
        return {
            "type": "RichContent",
            "props": {
                "id": f"puck-{bid}",
                "html": f"<p>{content}</p>",
            },
        }


def build_puck_data(modules: list) -> dict:
    """Build a valid Puck Data object from legacy modules."""
    components = []
    for mod in modules:
        raw_cb = mod.content_blocks
        if isinstance(raw_cb, str):
            try:
                blocks = json.loads(raw_cb)
            except Exception:
                blocks = []
        elif isinstance(raw_cb, list):
            blocks = raw_cb
        else:
            blocks = []

        for i, block in enumerate(blocks):
            comp = block_to_puck_component(block, mod.title, i == 0)
            components.append(comp)

    return {
        "content": components,
        "root": {"props": {}},
    }


def main():
    db = SessionLocal()
    try:
        course = db.query(models.Course).filter(models.Course.id == COURSE_ID).first()
        if not course:
            print(f"Course {COURSE_ID} not found.")
            return

        # Fetch all existing content modules (order > 0, non-root)
        existing_modules = (
            db.query(models.CourseModule)
            .filter(
                models.CourseModule.course_id == COURSE_ID,
                models.CourseModule.order > 0,
            )
            .order_by(models.CourseModule.order)
            .all()
        )

        if not existing_modules:
            # Fallback: grab any modules
            existing_modules = (
                db.query(models.CourseModule)
                .filter(models.CourseModule.course_id == COURSE_ID)
                .order_by(models.CourseModule.order)
                .all()
            )

        print(f"Found {len(existing_modules)} existing modules for course {COURSE_ID}: {course.title!r}")

        puck_data = build_puck_data(existing_modules)
        print(f"  → Built {len(puck_data['content'])} Puck components")

        # Upsert root module (order=0)
        root_mod = (
            db.query(models.CourseModule)
            .filter(
                models.CourseModule.course_id == COURSE_ID,
                models.CourseModule.order == 0,
            )
            .first()
        )

        if root_mod:
            root_mod.content_blocks = puck_data
            root_mod.updated_at = datetime.utcnow()
            root_mod.status = "draft"
            print("  → Updated existing root module (order=0)")
        else:
            root_mod = models.CourseModule(
                course_id=COURSE_ID,
                title="Root",
                order=0,
                content_blocks=puck_data,
                status="draft",
            )
            db.add(root_mod)
            print("  → Created new root module (order=0)")

        db.commit()
        print(f"Done. Open: http://localhost:3000/instructor/builder/{COURSE_ID}")

    finally:
        db.close()


if __name__ == "__main__":
    main()
