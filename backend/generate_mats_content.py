import asyncio
import json
import os
import sys
from datetime import datetime

# Add parent directory to path to import backend modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from sql_models import User, Course, CourseModule, Syllabus, SyllabusSection
from services.openai_service import clients, PRIORITY, MODELS
from services.syllabus_generator import generate_t6_syllabus

# Target User
TARGET_EMAIL = "mats@uid.or.id"


async def generate_module_content(section_title: str, topic: str, context: str, provider="gemini"):
    """
    Generate detailed content for a module based on a syllabus section topic.
    Returns a list of ContentBlocks.
    """
    
    prompt = f"""You are a world-class MIT OpenCourseWare curriculum developer.
    Create a comprehensive, university-level learning module for: "{topic}"
    Course Context: {context}
    Section: {section_title}
    
    Your goal is to create a SINGLE JSON object containing a LIST of content blocks that form a complete lesson.
    
    REQUIRED CONTENT BLOCKS:
    1. [HEADING] "{topic}"
    2. [TEXT] Introduction: Hook the learner with a compelling real-world context (1 paragraph).
    3. [TEXT] Core Concept: A deep dive into the theory (2-3 paragraphs, academic rigor).
    4. [RESOURCE] "Required Reading": A key academic paper or book chapter with a brief summary.
    5. [HEADING] "Practical Application"
    6. [TEXT] Case Study or Example: A concrete example of this concept in action.
    7. [ASSIGNMENT] "Action Item": A mini-project or reflection task.
    
    BLOCK TYPES ALLOWED:
    - "heading": {{"type": "heading", "content": "Title"}}
    - "text": {{"type": "text", "content": "Markdown text..."}}
    - "resource": {{"type": "resource", "content": "Title", "metadata": {{"title": "Title", "link": "url", "description": "summary"}}}}
    - "assignment": {{"type": "assignment", "content": "Instruction", "metadata": {{"title": "Task", "points": 100}}}}
    
    OUTPUT FORMAT:
    {{
        "blocks": [
            {{ "type": "heading", "content": "..." }},
            ...
        ]
    }}
    
    Respond ONLY with valid JSON.
    """

    try:
        content_text = ""
        # Force use of Gemini if keys exist, as OpenAI is out of quota
        if "gemini" in clients:
            response = await clients["gemini"].generate_content_async(prompt)
            content_text = response.text
        elif "openai" in clients:
             response = await clients["openai"].chat.completions.create(
                model=MODELS["openai"],
                messages=[{"role": "system", "content": "You are an educational content generator."}, {"role": "user", "content": prompt}],
                temperature=0.7
            )
             content_text = response.choices[0].message.content
        else:
             print("No AI provider available.")
             return []

        # Parse JSON
        content_text = content_text.replace("```json", "").replace("```", "").strip()
        import re
        match = re.search(r'\{.*\}', content_text, re.DOTALL)
        if match:
            data = json.loads(match.group())
            if "blocks" in data:
                return data["blocks"]
            elif isinstance(data, list):
                return data
        
        return []
    except Exception as e:
        print(f"Error generating content for {topic}: {e}")
        return [
            {"type": "heading", "content": topic, "id": "err_1"},
            {"type": "text", "content": f"Content generation error: {str(e)}", "id": "err_2"}
        ]

async def main():
    print(f"=== Starting FULL Content Generation for {TARGET_EMAIL} ===")
    print("Using provider: GEMINI (forced)")
    
    db = SessionLocal()
    
    # 1. Get User
    user = db.query(User).filter(User.email == TARGET_EMAIL).first()
    if not user:
        print(f"User {TARGET_EMAIL} not found!")
        return
    
    # 2. Get Courses
    courses = db.query(Course).filter(Course.instructor == user.full_name).all()
    print(f"Found {len(courses)} courses.")
    
    for course in courses:
        print(f"\nProcessing Course: {course.title} (ID: {course.id})")
        
        # 3. Check/Generate Syllabus
        syllabus = db.query(Syllabus).filter(Syllabus.course_id == course.id).first()
        
        if not syllabus:
            print("  > Generating T6 Syllabus...")
            import re
            d_weeks = 4
            if course.duration:
                 matches = re.findall(r'\d+', course.duration)
                 if matches:
                     d_weeks = int(matches[0])
            
            try:
                syl_data = await generate_t6_syllabus(
                    course_title=course.title,
                    course_description=course.description or f"Course on {course.title}",
                    duration_weeks=d_weeks,
                    level=course.level,
                    hexahelix_sectors=["Technology", "Education"]
                )
                
                syllabus = Syllabus(
                    course_id=course.id,
                    title=syl_data.get("title", course.title),
                    overview=syl_data.get("overview"),
                    learning_outcomes=syl_data.get("learning_outcomes"),
                    assessment_strategy=syl_data.get("assessment_strategy"),
                    resources=syl_data.get("resources"),
                    duration_weeks=len(syl_data.get("sections", [])),
                    status="published"
                )
                db.add(syllabus)
                db.commit()
                db.refresh(syllabus)
                
                for sec in syl_data.get("sections", []):
                    new_sec = SyllabusSection(
                        syllabus_id=syllabus.id,
                        order=sec.get("order"),
                        title=sec.get("title"),
                        cdio_phase=sec.get("cdio_phase"),
                        week_number=sec.get("week_number"),
                        topics=sec.get("topics"),
                        activities=sec.get("activities"),
                        assessment=sec.get("assessment")
                    )
                    db.add(new_sec)
                db.commit()
                print("  > Syllabus saved.")
            except Exception as e:
                print(f"Failed to generate syllabus: {e}")
                continue
        else:
            print(f"  > Using existing syllabus ({len(syllabus.sections)} sections).")

        # 4. Generate Course Modules (Force Update)
        db.refresh(syllabus)
        
        for section in syllabus.sections:
            print(f"    > Generating Week {section.week_number}: {section.title}...")
            
            # Find existing module
            existing_mod = db.query(CourseModule).filter(
                CourseModule.course_id == course.id,
                CourseModule.title == section.title
            ).first()
            
            # Force regeneration even if exists, to ensure quality
            if existing_mod and len(existing_mod.content_blocks) > 5:
                 # If it looks like we already did a "full blown" generation (many blocks), maybe skip?
                 # But user said it's empty. Let's regenerate to be safe if it's small.
                 # Actually, let's just regenerate everything for this user as requested.
                 pass 
            
            # Generate detailed block content
            blocks = []
            
            # 1. Intro Block
            blocks.append({
                "id": f"intro_{section.id}",
                "type": "text",
                "content": f"# {section.title}\n\n**Phase**: {section.cdio_phase.upper()}\n\nThis week we focus on {section.topics[0] if section.topics else 'core concepts'}."
            })
            
            # 2. Deep Content for Topics
            if section.topics:
                # Generate for at least 2 topics per week for "full blown" feel
                topics_to_cover = section.topics[:2] 
                
                for i, topic in enumerate(topics_to_cover):
                    print(f"      - Generating AI content for topic: {topic}")
                    generated_blocks = await generate_module_content(section.title, topic, f"Course: {course.title}", "gemini")
                    
                    # Add unique IDs
                    for j, b in enumerate(generated_blocks):
                        b["id"] = f"gen_{section.id}_{i}_{j}"
                        blocks.append(b)
            
            # 3. Add Design Block (Visual Editor)
            blocks.append({
                "id": f"design_{section.id}",
                "type": "design",
                "content": "Visual Summary",
                "metadata": {"title": "Concept Map"}
            })

            if existing_mod:
                existing_mod.content_blocks = blocks
                existing_mod.updated_at = datetime.utcnow()
            else:
                new_mod = CourseModule(
                    course_id=course.id,
                    title=section.title,
                    order=section.order,
                    content_blocks=blocks,
                    status="published"
                )
                db.add(new_mod)
            
            db.commit()
            print("      - Module saved.")
            
    print("\n=== Generation Complete ===")
    db.close()

if __name__ == "__main__":
    asyncio.run(main())
