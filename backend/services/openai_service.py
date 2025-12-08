"""
AI Service Layer for TSEA-X CDIO Framework
Supports: OpenAI (GPT-4), Google (Gemini), and Mock (Simulation) modes.
"""

import os
import json
import asyncio
import random
from typing import Dict, List, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
# Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Initialize Clients
clients = {}

if OPENAI_API_KEY:
    from openai import AsyncOpenAI
    clients["openai"] = AsyncOpenAI(api_key=OPENAI_API_KEY)

if OPENROUTER_API_KEY:
    from openai import AsyncOpenAI
    clients["openrouter"] = AsyncOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=OPENROUTER_API_KEY,
    )

if GEMINI_API_KEY:
    import google.generativeai as genai
    genai.configure(api_key=GEMINI_API_KEY)
    clients["gemini"] = genai.GenerativeModel('gemini-2.0-flash')

# Provider priority
PRIORITY = ["openai", "openrouter", "gemini", "mock"]

# Models Configuration
MODELS = {
    "openai": os.getenv("OPENAI_MODEL", "gpt-3.5-turbo"),
    "openrouter": os.getenv("OPENROUTER_MODEL", "google/gemini-2.0-flash-exp:free"),
    "gemini": "gemini-2.0-flash"
}

print(f"[AI Service] Initialized providers: {list(clients.keys())}")

# Course metadata for context
COURSE_METADATA = {
    9: {
        "name": "AI Agents for Small Businesses",
        "level": "Intermediate",
        "tech_stack": ["Python", "OpenAI API", "LangChain", "FastAPI"],
        "domain": "AI/ML"
    },
    11: {
        "name": "Cybersecurity Fundamentals",
        "level": "Intermediate",
        "tech_stack": ["Security Tools", "Penetration Testing", "Encryption"],
        "domain": "Security"
    },
    1: {
        "name": "Sustainability and Green Technology",
        "level": "Beginner",
        "tech_stack": ["Frameworks", "Carbon Accounting", "Lifecycle Analysis"],
        "domain": "Sustainability"
    }
}

async def generate_charter_suggestions(
    problem_statement: str,
    success_metrics: str,
    course_id: int,
    target_outcome: Optional[str] = None
) -> Dict:
    """Generate intelligent charter suggestions"""
    
    course_info = COURSE_METADATA.get(course_id, {"name": "General", "level": "Intermediate", "domain": "General"})
    
    prompt = f"""You are an expert technical advisor for the course: "{course_info['name']}".
    
STUDENT PROJECT:
Problem: {problem_statement}
Metrics: {success_metrics}
Target: {target_outcome or 'Not specified'}

TASK:
Provide a JSON object with:
1. "suggested_tools": List of 3-5 tools suitable for {course_info['level']} level in {course_info['domain']}.
2. "estimated_duration": e.g. "2-3 weeks".
3. "difficulty_level": "Beginner", "Intermediate", or "Advanced".
4. "reasoning": A brief explanation.

Respond ONLY with valid JSON."""

    errors = []
    for provider in PRIORITY:
        if provider == "mock":
            await asyncio.sleep(1.5)
            return {
                "suggested_tools": ["Mock Tool A", "Mock Tool B", "Python"],
                "reasoning": f"Simulated response. Errors: {errors}",
                "estimated_duration": "2 weeks",
                "difficulty_level": "Intermediate"
            }

        if provider not in clients:
            continue

        try:
            content = ""
            if provider == "gemini":
                response = await clients[provider].generate_content_async(prompt)
                content = response.text
            else: # openai, openrouter
                response = await clients[provider].chat.completions.create(
                    model=MODELS[provider],
                    messages=[{"role": "system", "content": "You are a JSON generator."}, {"role": "user", "content": prompt}],
                    temperature=0.7
                )
                content = response.choices[0].message.content

            # Parse JSON
            try:
                content = content.replace("```json", "").replace("```", "").strip()
                return json.loads(content)
            except:
                import re
                match = re.search(r'\{.*\}', content, re.DOTALL)
                if match:
                    return json.loads(match.group())
                # If parsing fails, try next provider? Or just fail? 
                # Usually parsing fail is model issue, so try next provider is good.
                raise ValueError("Failed to parse JSON")

        except Exception as e:
            print(f"[{provider}] Charter AI Error: {e}")
            errors.append(f"{provider}: {str(e)}")
            continue

    return {
        "suggested_tools": ["Error-Fallback Tool"],
        "reasoning": f"All AI Services Unavailable: {errors}",
        "estimated_duration": "Unknown",
        "difficulty_level": "Unknown"
    }

def raise_error():
    raise ValueError("Failed to parse JSON")

async def socratic_response(
    user_message: str,
    design_context: Dict,
    conversation_history: List[Dict],
    project_id: int,
    phase: str = "conceive"
) -> Dict:
    """Generate Socratic tutor response with phase-specific guidance"""
    
    # Phase-specific system prompts
    PHASE_PROMPTS = {
        "conceive": """You are a Socratic Tutor for the CONCEIVE phase. 
        Focus on helping students:
        - Clarify the problem statement and scope
        - Identify stakeholders and their needs
        - Define success metrics and constraints
        - Understand the business context
        
        NEVER give direct answers. ONLY ask guiding questions.
        Keep responses short (under 50 words). Be encouraging.
        Help them think critically about WHAT they're solving and WHY.""",
        
        "design": """You are a Socratic Tutor for the DESIGN phase.
        Focus on helping students:
        - Think through architecture decisions
        - Consider scalability and maintainability
        - Evaluate different design patterns
        - Plan data flow and component interactions
        
        NEVER give direct answers. ONLY ask guiding questions.
        Keep responses short (under 50 words). Be encouraging.
        Help them think critically about HOW to structure their solution.""",
        
        "implement": """You are a Socratic Tutor for the IMPLEMENT phase.
        Focus on helping students:
        - Debug code issues through reasoning
        - Apply best practices and clean code principles
        - Think about edge cases and error handling
        - Consider code quality and testing
        
        NEVER give direct answers. ONLY ask guiding questions.
        Keep responses short (under 50 words). Be encouraging.
        Help them think critically about code quality and implementation details.""",
        
        "operate": """You are a Socratic Tutor for the OPERATE phase.
        Focus on helping students:
        - Plan deployment strategies
        - Think about monitoring and logging
        - Consider user feedback and iteration
        - Understand maintenance and scalability
        
        NEVER give direct answers. ONLY ask guiding questions.
        Keep responses short (under 50 words). Be encouraging.
        Help them think critically about deployment, operations, and continuous improvement."""
    }
    
    # Get phase-specific prompt, default to conceive
    system_prompt = PHASE_PROMPTS.get(phase.lower(), PHASE_PROMPTS["conceive"])
    
    context_str = f"Design Context: {json.dumps(design_context)}"
    full_prompt = f"{system_prompt}\n\n{context_str}\n\nStudent: {user_message}"

    errors = []
    for provider in PRIORITY:
        if provider == "mock":
            await asyncio.sleep(1)
            phase_examples = {
                "conceive": "That's an interesting problem. Have you considered who the primary stakeholders are and what their specific needs might be?",
                "design": "Good thinking! How would this architecture handle increased load? What are the potential bottlenecks?",
                "implement": "I see you're working on that feature. What edge cases should you consider? How will you handle errors?",
                "operate": "Interesting deployment approach. How will you monitor the system's health? What metrics matter most?"
            }
            return {
                "ai_response": phase_examples.get(phase.lower(), phase_examples["conceive"]) + " (Simulated AI)",
                "followup_questions": []
            }

        if provider not in clients:
            continue

        try:
            if provider == "gemini":
                chat = clients[provider].start_chat(history=[])
                response = await chat.send_message_async(full_prompt)
                return {"ai_response": response.text, "followup_questions": []}
            else:
                messages = [{"role": "system", "content": system_prompt}]
                messages.append({"role": "user", "content": f"Context: {context_str}\nStudent: {user_message}"})
                
                response = await clients[provider].chat.completions.create(model=MODELS[provider], messages=messages, max_tokens=150)
                return {"ai_response": response.choices[0].message.content, "followup_questions": []}

        except Exception as e:
            print(f"[{provider}] Socratic AI Error: {e}")
            errors.append(f"{provider}: {str(e)}")
            continue

    return {"ai_response": f"I'm pondering that... (All services failed: {errors})", "followup_questions": []}

async def companion_response(
    user_message: str,
    current_page: str,
    user_context: Dict,
    conversation_history: List[Dict]
) -> Dict:
    """Global AI Companion"""
    
    persona = "Guide"
    if "conceive" in current_page: persona = "Business Analyst"
    elif "design" in current_page: persona = "Architect"
    elif "implement" in current_page: persona = "Pair Programmer"
    elif "operate" in current_page: persona = "DevOps"
    
    prompt = f"""Role: {persona}. Context: User is on {current_page}.
    User says: "{user_message}".
    Reply helpfully and concisely (max 2 sentences)."""

    errors = []
    for provider in PRIORITY:
        if provider == "mock":
            await asyncio.sleep(0.5)
            return {
                "ai_response": f"[{persona} Mode] I see you're working on {current_page}. That's great! (Simulated Response)",
                "role_played": persona
            }

        if provider not in clients:
            continue

        try:
            if provider == "gemini":
                response = await clients[provider].generate_content_async(prompt)
                return {"ai_response": response.text, "role_played": persona}
            else:
                response = await clients[provider].chat.completions.create(
                    model=MODELS[provider],
                    messages=[{"role": "system", "content": f"You are a {persona}."}, {"role": "user", "content": user_message}],
                    max_tokens=100
                )
                return {"ai_response": response.choices[0].message.content, "role_played": persona}
                
        except Exception as e:
            print(f"[{provider}] AI Companion Error: {e}")
            errors.append(f"{provider}: {str(e)}")
            continue

    return {"ai_response": f"I'm here to help, but my brain is offline momentarily. (Errors: {errors})", "role_played": "System"}

async def validate_design(blueprint: Dict) -> Dict:
    return {"validation_score": 0, "suggestions": []}

async def generate_course_structure(topic: str, target_audience: str = "Beginner", material_content: str = "") -> Dict:
    """Generate a CDIO-based course structure, optionally using provided materials"""
    
    context_prompt = ""
    if material_content:
        context_prompt = f"""
        CONTEXT FROM INSTRUCTOR MATERIALS:
        The instructor has provided the following content. You MUST incorporate the key concepts, terminology, and themes from this material into the course structure.
        
        --- MATERIAL START ---
        {material_content[:10000]} 
        --- MATERIAL END ---
        (Note: Material truncated to first 10000 chars)
        """

    prompt = f"""You are an expert curriculum designer. Create a course structure for "{topic}" targeting {target_audience}s.
    The course MUST follow the CDIO (Conceive, Design, Implement, Operate) framework.
    {context_prompt}
    
    Output a JSON object with:
    1. "title": Catchy course title.
    2. "description": Brief summary.
    3. "modules": A list of 4 modules, one for each CDIO phase.
       Each module should have:
       - "phase": "Conceive", "Design", "Implement", or "Operate"
       - "title": Module title
       - "topics": List of 3-4 key topics/lessons
    4. "capstone_project": A description of the main project students will build.
    
    Respond ONLY with valid JSON."""

    errors = []
    for provider in PRIORITY:
        if provider == "mock":
            await asyncio.sleep(2)
            return {
                "title": f"Mastering {topic}",
                "description": f"A comprehensive guide to {topic} using CDIO.",
                "modules": [
                    {"phase": "Conceive", "title": "Understanding the Problem", "topics": ["Market Analysis", "User Needs", "Requirement Gathering"]},
                    {"phase": "Design", "title": "Architecting the Solution", "topics": ["System Design", "Prototyping", "Tech Stack Selection"]},
                    {"phase": "Implement", "title": "Building the Product", "topics": ["Coding Best Practices", "Core Features", "Testing"]},
                    {"phase": "Operate", "title": "Deployment & Maintenance", "topics": ["CI/CD", "Monitoring", "User Feedback"]}
                ],
                "capstone_project": f"Build a fully functional {topic} application."
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
                    messages=[{"role": "system", "content": "You are a JSON generator."}, {"role": "user", "content": prompt}],
                    temperature=0.7
                )
                content = response.choices[0].message.content

            # Parse JSON
            try:
                content = content.replace("```json", "").replace("```", "").strip()
                return json.loads(content)
            except:
                import re
                match = re.search(r'\{.*\}', content, re.DOTALL)
                if match:
                    return json.loads(match.group())
                raise ValueError("Failed to parse JSON")

        except Exception as e:
            print(f"[{provider}] Course Gen Error: {e}")
            errors.append(f"{provider}: {str(e)}")
            continue

    return {
        "title": f"Course on {topic}",
        "description": f"Content generation failed. Errors: {errors}",
        "modules": [],
        "capstone_project": "Error generating project."
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
    "learning_outcomes": ["Outcome 1", "Outcome 2", ... (5-8 outcomes)],
    "assessment_strategy": {{
        "quizzes": 20,
        "assignments": 30,
        "project": 30,
        "capstone": 20
    }},
    "resources": ["Textbook 1", "Online resource", ...],
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
        }},
        ... (repeat for all {total_sections} sections)
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
                return json.loads(content)
            except:
                import re
                match = re.search(r'\{.*\}', content, re.DOTALL)
                if match:
                    return json.loads(match.group())
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

async def test_ai_connection() -> Dict:
    """Test the AI connection and return a simple response"""
    errors = []
    for provider in PRIORITY:
        if provider == "mock":
            return {"status": "success", "provider": "mock", "message": "This is a simulated response."}
        
        if provider not in clients:
            continue
            
        try:
            prompt = "Say 'Hello from AI!' and mention which model you are."
            if provider == "gemini":
                response = await clients[provider].generate_content_async(prompt)
                return {"status": "success", "provider": "gemini", "message": response.text}
            else:
                response = await clients[provider].chat.completions.create(
                    model=MODELS[provider],
                    messages=[{"role": "user", "content": prompt}]
                )
                return {"status": "success", "provider": "openai" if provider == "openai" else "openrouter", "message": response.choices[0].message.content}
        except Exception as e:
            errors.append(f"{provider}: {str(e)}")
            continue
            
    return {"status": "error", "provider": "none", "message": f"All providers failed: {errors}"}

async def generate_embedding(text: str) -> List[float]:
    """Generate vector embedding for text"""
    
    # Mock fallback for development without keys
    if "mock" in PRIORITY or not any(k in clients for k in ["openai", "openrouter"]):
        # Return random 1536-dim vector for testing
        return [random.uniform(-0.1, 0.1) for _ in range(1536)]

    for provider in PRIORITY:
        if provider not in clients or provider == "mock":
            continue
            
        try:
            if provider == "openai" or provider == "openrouter":
                response = await clients[provider].embeddings.create(
                    model="text-embedding-3-small", # or text-embedding-ada-002
                    input=text
                )
                return response.data[0].embedding
            elif provider == "gemini":
                # Gemini embedding implementation
                result = genai.embed_content(
                    model="models/embedding-001",
                    content=text,
                    task_type="retrieval_document",
                    title="Embedding of text"
                )
                return result['embedding']
                
        except Exception as e:
            print(f"[{provider}] Embedding Error: {e}")
            continue
            
    # Fallback if all fail
    print("All embedding providers failed, returning random vector")
    return [random.uniform(-0.1, 0.1) for _ in range(1536)]

async def generate_grading_feedback(
    submission_type: str,
    project_title: str,
    student_name: str,
    submission_content: Dict
) -> Dict:
    """Generate grading feedback and score for a student submission"""
    
    prompt = f"""You are an expert instructor grading a student project.
    
    PROJECT DETAILS:
    Title: {project_title}
    Student: {student_name}
    Type: {submission_type}
    
    SUBMISSION CONTENT:
    {json.dumps(submission_content, indent=2)}
    
    TASK:
    Evaluate the submission based on:
    1. Clarity and completeness
    2. Feasibility (for Charters/Designs) or Code Quality (for Implementation)
    3. Alignment with CDIO principles
    
    Provide a JSON object with:
    1. "grade": A letter grade (A, B, C, D, F)
    2. "score": A numeric score (0-100)
    3. "feedback": A paragraph of constructive feedback (max 100 words)
    4. "strengths": List of 2-3 strong points
    5. "weaknesses": List of 2-3 areas for improvement
    
    Respond ONLY with valid JSON."""

    errors = []
    for provider in PRIORITY:
        if provider == "mock":
            await asyncio.sleep(1.5)
            return {
                "grade": "B+",
                "score": 88,
                "feedback": f"Good effort on the {submission_type}. The core concepts are there, but some details could be refined. (Simulated AI Feedback)",
                "strengths": ["Clear problem definition", "Good structure"],
                "weaknesses": ["Needs more specific metrics", "Consider edge cases"]
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
                    messages=[{"role": "system", "content": "You are a JSON grading assistant."}, {"role": "user", "content": prompt}],
                    temperature=0.3
                )
                content = response.choices[0].message.content

            # Parse JSON
            try:
                content = content.replace("```json", "").replace("```", "").strip()
                return json.loads(content)
            except:
                import re
                match = re.search(r'\{.*\}', content, re.DOTALL)
                if match:
                    return json.loads(match.group())
                raise ValueError("Failed to parse JSON")

        except Exception as e:
            print(f"[{provider}] Grading AI Error: {e}")
            errors.append(f"{provider}: {str(e)}")
            continue

    return {
        "grade": "N/A",
        "score": 0,
        "feedback": f"AI Grading Unavailable. Errors: {errors}",
        "strengths": [],
        "weaknesses": []
    }
