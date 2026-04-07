"""
Alexandria AI Syllabus Generator
International-Standard Curriculum Generation for T6 Learning Operating System

Generates syllabi aligned with:
- MIT OpenCourseWare structure
- CDIO Framework (Conceive-Design-Implement-Operate)  
- IRIS Framework (Immerse-Realize-Iterate-Scale)
- Bloom's Taxonomy learning objectives
- ABET Engineering Criteria (where applicable)
"""

import json
import asyncio
from typing import Dict, List, Optional
from datetime import datetime
from .openai_service import clients, MODELS, PRIORITY

# Bloom's Taxonomy Levels
BLOOMS_TAXONOMY = {
    "remember": {"verbs": ["define", "list", "identify", "recall", "name"], "level": 1},
    "understand": {"verbs": ["explain", "describe", "summarize", "compare"], "level": 2},
    "apply": {"verbs": ["implement", "execute", "use", "demonstrate"], "level": 3},
    "analyze": {"verbs": ["analyze", "differentiate", "examine", "evaluate"], "level": 4},
    "evaluate": {"verbs": ["assess", "critique", "justify", "recommend"], "level": 5},
    "create": {"verbs": ["design", "develop", "construct", "produce"], "level": 6}
}

# IRIS Phase Descriptions
IRIS_PHASES = {
    "immerse": {
        "description": "Deep understanding of context, stakeholders, and problem space",
        "activities": ["Research", "Interviews", "Literature Review", "Case Studies"],
        "outcomes": ["Problem definition", "Stakeholder map", "Context analysis"]
    },
    "realize": {
        "description": "Design and planning of solutions based on insights",
        "activities": ["Ideation", "Prototyping", "Architecture Design", "Planning"],
        "outcomes": ["Solution design", "Technical architecture", "Project plan"]
    },
    "iterate": {
        "description": "Building, testing, and refining the solution",
        "activities": ["Development", "Testing", "User Feedback", "Refinement"],
        "outcomes": ["Working prototype", "Test results", "Iteration cycles"]
    },
    "scale": {
        "description": "Deployment, measurement, and sustainable growth",
        "activities": ["Deployment", "Monitoring", "Optimization", "Documentation"],
        "outcomes": ["Deployed solution", "Impact metrics", "Sustainability plan"]
    }
}

# CDIO Phase Mapping
CDIO_TO_IRIS = {
    "conceive": "immerse",
    "design": "realize", 
    "implement": "iterate",
    "operate": "scale"
}


def generate_syllabus_prompt(
    course_title: str,
    course_description: str,
    duration_weeks: int,
    level: str,
    material_content: str = "",
    learning_style: str = "project-based"
) -> str:
    """Generate the AI prompt for syllabus creation"""
    
    material_context = ""
    if material_content:
        material_context = f"""
INSTRUCTOR MATERIALS (incorporate these themes and concepts):
--- MATERIAL START ---
{material_content[:15000]}
--- MATERIAL END ---
"""
    
    weeks_per_phase = max(1, duration_weeks // 4)
    
    return f"""You are Alexandria AI, an expert curriculum designer creating international-standard syllabi.

COURSE DETAILS:
- Title: {course_title}
- Description: {course_description}
- Duration: {duration_weeks} weeks
- Level: {level}
- Learning Style: {learning_style}

{material_context}

REQUIREMENTS:
1. Create a syllabus aligned with MIT OpenCourseWare and CDIO/IRIS frameworks
2. Each module MUST map to a learning phase (IRIS: Immerse→Realize→Iterate→Scale)
3. Learning objectives MUST use Bloom's Taxonomy verbs appropriately for the level:
   - Beginner: Focus on Remember, Understand, Apply
   - Intermediate: Focus on Apply, Analyze, Evaluate
   - Advanced: Focus on Analyze, Evaluate, Create
4. Include practical assessments and hands-on projects
5. Generate {duration_weeks} weeks of content ({weeks_per_phase} weeks per IRIS phase)

OUTPUT FORMAT (valid JSON only):
{{
    "course_code": "T6-{{generated_code}}",
    "title": "{course_title}",
    "tagline": "Compelling one-line description",
    "description": "2-3 paragraph course description",
    "level": "{level}",
    "duration_weeks": {duration_weeks},
    "credits": {{suggested credits}},
    "prerequisites": ["Prerequisite 1", "Prerequisite 2"],
    
    "learning_outcomes": [
        {{
            "id": "LO1",
            "objective": "By the end of this course, students will be able to...",
            "blooms_level": "apply",
            "assessment_method": "Project/Quiz/Assignment"
        }}
    ],
    
    "modules": [
        {{
            "week": 1,
            "iris_phase": "immerse",
            "cdio_phase": "conceive",
            "title": "Module Title",
            "description": "What students will learn",
            "learning_goals": ["Goal 1", "Goal 2"],
            "topics": [
                {{
                    "name": "Topic Name",
                    "description": "Topic description",
                    "duration_minutes": 60,
                    "activities": [
                        {{"type": "lecture", "title": "...", "content": "..."}},
                        {{"type": "discussion", "prompt": "..."}},
                        {{"type": "exercise", "instructions": "..."}}
                    ]
                }}
            ],
            "readings": ["Reading 1", "Reading 2"],
            "assignments": [
                {{
                    "title": "Assignment Title",
                    "description": "What students will do",
                    "deliverables": ["Deliverable 1"],
                    "due_week": 1,
                    "weight_percent": 10
                }}
            ]
        }}
    ],
    
    "assessment_strategy": {{
        "breakdown": {{
            "participation": 10,
            "assignments": 30,
            "quizzes": 20,
            "capstone_project": 40
        }},
        "grading_scale": {{
            "A": "90-100",
            "B": "80-89",
            "C": "70-79",
            "D": "60-69",
            "F": "0-59"
        }}
    }},
    
    "capstone_project": {{
        "title": "Capstone Project Title",
        "description": "Comprehensive description of the final project",
        "learning_outcomes_addressed": ["LO1", "LO2", "LO3"],
        "deliverables": [
            {{"name": "Project Proposal", "due_week": 2, "weight": 15}},
            {{"name": "Working Prototype", "due_week": {duration_weeks - 1}, "weight": 50}},
            {{"name": "Final Presentation", "due_week": {duration_weeks}, "weight": 35}}
        ],
        "rubric": {{
            "technical_excellence": 30,
            "innovation": 25,
            "presentation": 20,
            "documentation": 15,
            "teamwork": 10
        }}
    }},
    
    "resources": {{
        "required_textbooks": [],
        "recommended_readings": [],
        "online_resources": [],
        "software_tools": []
    }},
    
    "instructor_notes": {{
        "teaching_tips": ["Tip 1", "Tip 2"],
        "common_challenges": ["Challenge 1"],
        "differentiation_strategies": ["Strategy 1"]
    }}
}}

Generate a complete, detailed syllabus. Be specific with content, not generic placeholders.
Respond ONLY with valid JSON."""


async def generate_international_syllabus(
    course_title: str,
    course_description: str,
    duration_weeks: int = 4,
    level: str = "Intermediate",
    material_content: str = "",
    ai_client = None,
    provider: str = "gemini"
) -> Dict:
    """
    Generate an international-standard syllabus using AI.
    
    Args:
        course_title: Title of the course
        course_description: Brief description
        duration_weeks: Number of weeks
        level: Beginner/Intermediate/Advanced/Executive
        material_content: Optional instructor materials
        ai_client: AI client (Gemini/OpenAI)
        provider: Which AI provider to use
    
    Returns:
        Complete syllabus dictionary
    """
    
    prompt = generate_syllabus_prompt(
        course_title=course_title,
        course_description=course_description,
        duration_weeks=duration_weeks,
        level=level,
        material_content=material_content
    )
    
    try:
        if provider == "gemini" and ai_client:
            response = await ai_client.generate_content_async(prompt)
            content = response.text
        elif provider in ["openai", "openrouter"] and ai_client:
            response = await ai_client.chat.completions.create(
                model="gpt-4o" if provider == "openai" else "google/gemini-2.0-flash-exp:free",
                messages=[
                    {"role": "system", "content": "You are Alexandria AI, an expert curriculum designer."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=8000
            )
            content = response.choices[0].message.content
        else:
            # Fallback: Generate structured mock
            return generate_fallback_syllabus(course_title, course_description, duration_weeks, level)
        
        # Parse JSON response
        content = content.replace("```json", "").replace("```", "").strip()
        
        try:
            syllabus = json.loads(content)
        except json.JSONDecodeError:
            # Try to extract JSON from response
            import re
            match = re.search(r'\{.*\}', content, re.DOTALL)
            if match:
                syllabus = json.loads(match.group())
            else:
                raise ValueError("Could not parse AI response as JSON")
        
        # Validate and enhance
        syllabus = validate_and_enhance_syllabus(syllabus)
        
        return {
            "success": True,
            "syllabus": syllabus,
            "provider": provider,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"[Syllabus Generator] Error: {e}")
        return {
            "success": False,
            "error": str(e),
            "syllabus": generate_fallback_syllabus(course_title, course_description, duration_weeks, level)
        }


def validate_and_enhance_syllabus(syllabus: Dict) -> Dict:
    """Validate syllabus structure and enhance with missing elements"""
    
    # Ensure required fields exist
    required_fields = ["title", "modules", "learning_outcomes", "assessment_strategy"]
    for field in required_fields:
        if field not in syllabus:
            if field == "modules":
                syllabus["modules"] = []
            elif field == "learning_outcomes":
                syllabus["learning_outcomes"] = []
            elif field == "assessment_strategy":
                syllabus["assessment_strategy"] = {
                    "breakdown": {"assignments": 40, "quizzes": 20, "capstone_project": 40}
                }
            else:
                syllabus[field] = ""
    
    # Validate learning outcomes have Bloom's taxonomy levels
    for lo in syllabus.get("learning_outcomes", []):
        if "blooms_level" not in lo:
            lo["blooms_level"] = "apply"
    
    # Ensure modules have IRIS phases
    phases = ["immerse", "realize", "iterate", "scale"]
    for i, module in enumerate(syllabus.get("modules", [])):
        if "iris_phase" not in module:
            module["iris_phase"] = phases[i % 4]
        if "cdio_phase" not in module:
            cdio_phases = ["conceive", "design", "implement", "operate"]
            module["cdio_phase"] = cdio_phases[i % 4]
    
    # Add metadata
    syllabus["_metadata"] = {
        "framework": "IRIS + CDIO",
        "standard": "MIT OCW Compatible",
        "validated": True,
        "version": "1.0"
    }
    
    return syllabus


def generate_fallback_syllabus(
    course_title: str,
    course_description: str,
    duration_weeks: int,
    level: str
) -> Dict:
    """Generate a structured fallback syllabus when AI fails"""
    
    weeks_per_phase = max(1, duration_weeks // 4)
    modules = []
    
    phase_info = [
        ("immerse", "conceive", "Understanding & Research", 
         "Deep dive into the problem space and context"),
        ("realize", "design", "Planning & Design",
         "Architecting solutions and creating plans"),
        ("iterate", "implement", "Building & Testing",
         "Hands-on development and iterative refinement"),
        ("scale", "operate", "Deployment & Growth",
         "Launching, monitoring, and scaling")
    ]
    
    week = 1
    for phase_idx, (iris, cdio, title, desc) in enumerate(phase_info):
        for phase_week in range(weeks_per_phase):
            modules.append({
                "week": week,
                "iris_phase": iris,
                "cdio_phase": cdio,
                "title": f"Week {week}: {title}" + (f" (Part {phase_week + 1})" if weeks_per_phase > 1 else ""),
                "description": desc,
                "learning_goals": [
                    f"Understand key concepts of {iris} phase",
                    f"Apply {cdio} methodologies"
                ],
                "topics": [
                    {
                        "name": f"{title} Fundamentals",
                        "description": f"Core concepts for {iris} phase",
                        "duration_minutes": 90,
                        "activities": [
                            {"type": "lecture", "title": f"Introduction to {title}", "duration": 30},
                            {"type": "discussion", "prompt": f"How does {iris} apply to your project?", "duration": 20},
                            {"type": "exercise", "instructions": "Apply today's concepts to your project", "duration": 40}
                        ]
                    }
                ],
                "readings": [f"Chapter {week}: {title}"],
                "assignments": [
                    {
                        "title": f"Week {week} Deliverable",
                        "description": f"Apply {iris} concepts to your capstone project",
                        "due_week": week,
                        "weight_percent": 100 // duration_weeks
                    }
                ]
            })
            week += 1
    
    return {
        "course_code": f"T6-{course_title[:3].upper()}-001",
        "title": course_title,
        "tagline": f"Master {course_title.lower()} through hands-on, project-based learning",
        "description": course_description or f"A {duration_weeks}-week intensive course on {course_title}.",
        "level": level,
        "duration_weeks": duration_weeks,
        "credits": 3,
        "prerequisites": [],
        "learning_outcomes": [
            {"id": "LO1", "objective": f"Understand fundamental concepts of {course_title}", "blooms_level": "understand"},
            {"id": "LO2", "objective": "Apply methodologies to solve real-world problems", "blooms_level": "apply"},
            {"id": "LO3", "objective": "Design and implement practical solutions", "blooms_level": "create"},
            {"id": "LO4", "objective": "Evaluate and iterate on solutions", "blooms_level": "evaluate"}
        ],
        "modules": modules,
        "assessment_strategy": {
            "breakdown": {
                "participation": 10,
                "assignments": 30,
                "quizzes": 20,
                "capstone_project": 40
            }
        },
        "capstone_project": {
            "title": f"{course_title} Capstone Project",
            "description": f"Apply all course concepts to build a real-world solution",
            "deliverables": [
                {"name": "Project Proposal", "due_week": 2, "weight": 20},
                {"name": "Working Prototype", "due_week": duration_weeks - 1, "weight": 50},
                {"name": "Final Presentation", "due_week": duration_weeks, "weight": 30}
            ]
        },
        "resources": {
            "required_textbooks": [],
            "recommended_readings": [],
            "online_resources": [],
            "software_tools": []
        },
        "_metadata": {
            "framework": "IRIS + CDIO",
            "standard": "MIT OCW Compatible",
            "fallback": True,
            "version": "1.0"
        }
    }


async def generate_t6_syllabus(
    course_title: str,
    course_description: str,
    duration_weeks: int,
    level: str,
    material_content: str = "",
    hexahelix_sectors: list = None
) -> Dict:
    """Generate T6-format syllabus (MIT OCW + TSEA-X CDIO Hybrid)"""
    
    # Calculate sections per CDIO phase based on duration
    sections_per_phase = max(1, duration_weeks // 4)
    total_sections = sections_per_phase * 4
    
    context_prompt = ""
    if material_content:
        context_prompt = f"""
        INSTRUCTOR MATERIALS (incorporate these into the syllabus):
        --- MATERIAL START ---
        {material_content[:15000]}
        --- MATERIAL END ---
        """
    
    sectors_str = ", ".join(hexahelix_sectors) if hexahelix_sectors else "Technology, Education"
    
    prompt = f"""You are an academic curriculum designer creating a T6 Syllabus (MIT OCW + TSEA-X CDIO Hybrid).

COURSE DETAILS:
- Title: {course_title}
- Description: {course_description}
- Duration: {duration_weeks} weeks
- Level: {level}
- Hexahelix Sectors: {sectors_str}

{context_prompt}

REQUIREMENTS:
1. Create EXACTLY {total_sections} sections ({sections_per_phase} per CDIO phase)
2. Each section = 1 week of content
3. Align sections to CDIO phases in order: Conceive -> Design -> Implement -> Operate
4. Include 3-5 specific topics per section
5. Include practical activities aligned to phase
6. Specify assessment types (Quiz, Assignment, Project, Presentation)

OUTPUT (valid JSON only):
{{
    "title": "Syllabus title",
    "overview": "Brief overview paragraph",
    "learning_outcomes": ["Outcome 1", "Outcome 2"],
    "assessment_strategy": {{
        "quizzes": 20,
        "assignments": 30,
        "project": 30,
        "capstone": 20
    }},
    "resources": ["Textbook 1", "Online resource"],
    "sections": [
        {{
            "order": 1,
            "title": "Section title",
            "cdio_phase": "conceive",
            "week_number": 1,
            "topics": ["Topic 1", "Topic 2", "Topic 3"],
            "activities": ["Activity 1", "Activity 2"],
            "assessment": "Quiz",
            "duration_hours": 3.0
        }}
    ]
}}

Respond ONLY with valid JSON."""

    errors = []
    for provider in PRIORITY:
        if provider == "mock":
            await asyncio.sleep(2)
            # Generate mock sections
            mock_sections = []
            phases = ["conceive", "design", "implement", "operate"]
            phase_names = {
                "conceive": "Understanding & Analysis",
                "design": "Planning & Architecture", 
                "implement": "Building & Development",
                "operate": "Deployment & Iteration"
            }
            for i in range(total_sections):
                phase_idx = i // sections_per_phase
                phase = phases[min(phase_idx, 3)]
                mock_sections.append({
                    "order": i + 1,
                    "title": f"Week {i+1}: {phase_names[phase]}",
                    "cdio_phase": phase,
                    "week_number": i + 1,
                    "topics": [f"Topic {i+1}.1", f"Topic {i+1}.2", f"Topic {i+1}.3"],
                    "activities": [f"Activity for week {i+1}"],
                    "assessment": ["Quiz", "Assignment", "Project", "Presentation"][phase_idx % 4],
                    "duration_hours": 3.0
                })
            
            return {
                "title": f"T6 Syllabus: {course_title}",
                "overview": f"A {duration_weeks}-week comprehensive course on {course_title} using the CDIO framework.",
                "learning_outcomes": [
                    "Analyze and define complex problems",
                    "Design scalable solutions",
                    "Implement working prototypes",
                    "Deploy and iterate on solutions",
                    "Apply critical thinking skills"
                ],
                "assessment_strategy": {"quizzes": 20, "assignments": 30, "project": 30, "capstone": 20},
                "resources": ["Course textbook", "Online documentation", "Supplementary readings"],
                "sections": mock_sections
            }

        if provider not in clients:
            continue

        try:
            content = ""
            if provider == "gemini":
                response = await clients[provider].generate_content_async(prompt)
                content = response.text
            else:
                response = await clients[provider].chat.completions.create(
                    model=MODELS[provider],
                    messages=[{"role": "system", "content": "You are a JSON curriculum designer."}, {"role": "user", "content": prompt}],
                    temperature=0.7
                )
                content = response.choices[0].message.content

            try:
                content = content.replace("```json", "").replace("```", "").strip()
                import re
                match = re.search(r'\{.*\}', content, re.DOTALL)
                if match:
                    return json.loads(match.group())
                
                # Check directly if valid json
                return json.loads(content)
            except:
                raise ValueError("Failed to parse JSON")

        except Exception as e:
            print(f"[{provider}] Syllabus Gen Error: {e}")
            errors.append(f"{provider}: {str(e)}")
            continue

    return {
        "title": f"Syllabus for {course_title}",
        "overview": f"Generation failed. Errors: {errors}",
        "learning_outcomes": [],
        "assessment_strategy": {},
        "resources": [],
        "sections": []
    }


# Export functions
__all__ = [
    'generate_international_syllabus',
    'generate_fallback_syllabus',
    'validate_and_enhance_syllabus',
    'generate_t6_syllabus',
    'BLOOMS_TAXONOMY',
    'IRIS_PHASES',
    'CDIO_TO_IRIS'
]
