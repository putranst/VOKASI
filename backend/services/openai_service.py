"""
AI Service Layer for TSEA-X CDIO Framework
Supports: OpenAI (GPT-4), Google (Gemini), and Mock (Simulation) modes.
"""

import os
import json
import asyncio
import random
import base64
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
    # Vision model for multi-modal parsing (slides, images, PDFs)
    clients["gemini_vision"] = genai.GenerativeModel('gemini-2.0-flash')

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
    """
    Generate a CDIO/IRIS-based course structure with detailed module content.
    Optionally uses provided instructor materials to personalize content.
    """
    
    context_prompt = ""
    if material_content:
        context_prompt = f"""
        CONTEXT FROM INSTRUCTOR MATERIALS:
        The instructor has provided the following content. You MUST incorporate the key concepts, terminology, and themes from this material into the course structure.
        
        --- MATERIAL START ---
        {material_content[:12000]} 
        --- MATERIAL END ---
        """

    prompt = f"""You are Alexandria AI, an expert curriculum designer. Create a comprehensive course structure for "{topic}" targeting {target_audience} learners.
    
The course MUST follow both CDIO (Conceive, Design, Implement, Operate) and IRIS (Immerse, Realize, Iterate, Scale) frameworks.
{context_prompt}

OUTPUT FORMAT (valid JSON only):
{{
    "title": "Compelling course title that captures the essence of {topic}",
    "description": "2-3 sentence course description highlighting key learning outcomes and value proposition",
    "level": "{target_audience}",
    "duration": "4 weeks",
    "category": "Category based on topic",
    "image": "https://images.unsplash.com/photo-RELEVANT-IMAGE?w=800",
    "modules": [
        {{
            "phase": "Conceive",
            "iris_phase": "Immerse", 
            "title": "Module 1: Understanding & Context",
            "content": "Detailed 2-3 sentence description of what students will learn in this module, including specific skills and knowledge they will gain.",
            "topics": ["Topic 1: Specific topic name", "Topic 2: Another topic", "Topic 3: Third topic"],
            "learning_goals": ["Students will be able to...", "Students will understand..."],
            "activities": [
                {{"type": "lecture", "title": "Introduction to {topic}", "duration_minutes": 30}},
                {{"type": "discussion", "title": "Real-world applications", "duration_minutes": 20}},
                {{"type": "exercise", "title": "Hands-on exploration", "duration_minutes": 40}}
            ]
        }},
        {{
            "phase": "Design",
            "iris_phase": "Realize",
            "title": "Module 2: Planning & Architecture",
            "content": "Detailed description of design phase content...",
            "topics": ["Topic 1", "Topic 2", "Topic 3"],
            "learning_goals": ["..."],
            "activities": [...]
        }},
        {{
            "phase": "Implement",
            "iris_phase": "Iterate",
            "title": "Module 3: Building & Testing",
            "content": "Detailed description of implementation phase content...",
            "topics": ["Topic 1", "Topic 2", "Topic 3"],
            "learning_goals": ["..."],
            "activities": [...]
        }},
        {{
            "phase": "Operate",
            "iris_phase": "Scale",
            "title": "Module 4: Deployment & Growth",
            "content": "Detailed description of operations phase content...",
            "topics": ["Topic 1", "Topic 2", "Topic 3"],
            "learning_goals": ["..."],
            "activities": [...]
        }}
    ],
    "capstone_project": "Comprehensive description of the capstone project that ties together all modules. Describe what students will build, the skills they'll apply, and the expected deliverables."
}}

IMPORTANT: 
- Make the content SPECIFIC to {topic}, not generic
- Include real, actionable learning activities
- The 'content' field for each module should be 2-3 detailed sentences
- Topics should be specific and relevant to {topic}

Respond ONLY with valid JSON."""

    errors = []
    for provider in PRIORITY:
        if provider == "mock":
            await asyncio.sleep(2)
            # Generate intelligent mock based on topic
            words = topic.split()
            key_word = words[0] if words else "Course"
            
            return {
                "title": f"Mastering {topic}: From Concept to Scale",
                "description": f"A comprehensive {target_audience.lower()}-level course on {topic}. Learn to understand, design, implement, and deploy real-world solutions through hands-on projects and expert guidance.",
                "level": target_audience,
                "duration": "4 weeks",
                "category": topic.split()[0] if topic.split() else "General",
                "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
                "modules": [
                    {
                        "phase": "Conceive", 
                        "iris_phase": "Immerse",
                        "title": f"Understanding {key_word} Fundamentals",
                        "content": f"Immerse yourself in the world of {topic}. Understand the landscape, key players, and fundamental concepts that drive innovation in this field. Build a solid foundation for practical application.",
                        "topics": [f"{key_word} Fundamentals", "Market & Landscape Analysis", "Core Concepts & Terminology", "Real-World Case Studies"],
                        "learning_goals": [f"Understand the core principles of {topic}", "Analyze the current market landscape", "Identify key stakeholders and use cases"],
                        "activities": [
                            {"type": "lecture", "title": f"Introduction to {topic}", "duration_minutes": 45},
                            {"type": "discussion", "title": "Industry trends and opportunities", "duration_minutes": 30},
                            {"type": "exercise", "title": "Stakeholder mapping exercise", "duration_minutes": 45}
                        ]
                    },
                    {
                        "phase": "Design",
                        "iris_phase": "Realize",
                        "title": f"Designing {key_word} Solutions",
                        "content": f"Transform your understanding into actionable plans. Learn to architect solutions, create prototypes, and develop implementation roadmaps for {topic} projects.",
                        "topics": ["Solution Architecture", "Prototype Development", "Technical Planning", "Resource Allocation"],
                        "learning_goals": ["Design scalable solution architectures", "Create functional prototypes", "Develop project implementation plans"],
                        "activities": [
                            {"type": "lecture", "title": "Architecture patterns and best practices", "duration_minutes": 40},
                            {"type": "exercise", "title": "Design your solution", "duration_minutes": 60},
                            {"type": "quiz", "title": "Design principles check", "duration_minutes": 15}
                        ]
                    },
                    {
                        "phase": "Implement",
                        "iris_phase": "Iterate",
                        "title": f"Building & Testing {key_word} Projects",
                        "content": f"Get hands-on with implementation. Build functional solutions, conduct rigorous testing, and iterate based on feedback. Apply industry best practices throughout development.",
                        "topics": ["Implementation Best Practices", "Quality Assurance & Testing", "Iteration & Refinement", "Performance Optimization"],
                        "learning_goals": ["Implement solutions using best practices", "Conduct comprehensive testing", "Iterate based on feedback"],
                        "activities": [
                            {"type": "lecture", "title": "Implementation strategies", "duration_minutes": 30},
                            {"type": "exercise", "title": "Build your solution", "duration_minutes": 90},
                            {"type": "demo", "title": "Peer review and feedback", "duration_minutes": 30}
                        ]
                    },
                    {
                        "phase": "Operate",
                        "iris_phase": "Scale",
                        "title": f"Deploying & Scaling {key_word} Solutions",
                        "content": f"Launch your solution to the real world. Learn deployment strategies, monitoring, and optimization techniques. Prepare for growth and sustainable operation.",
                        "topics": ["Deployment Strategies", "Monitoring & Analytics", "Scaling & Growth", "Sustainability Planning"],
                        "learning_goals": ["Deploy solutions effectively", "Set up monitoring and analytics", "Plan for scale and sustainability"],
                        "activities": [
                            {"type": "lecture", "title": "Deployment and DevOps", "duration_minutes": 35},
                            {"type": "exercise", "title": "Deploy your project", "duration_minutes": 50},
                            {"type": "reflect", "title": "Lessons learned & next steps", "duration_minutes": 25}
                        ]
                    }
                ],
                "capstone_project": f"Build and deploy a complete {topic} solution that addresses a real-world problem. Your project will demonstrate mastery of all four CDIO phases: from initial concept through to operational deployment. Final deliverables include a working prototype, technical documentation, and a presentation showcasing your solution's impact."
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
                    messages=[
                        {"role": "system", "content": "You are Alexandria AI, an expert curriculum designer. Output only valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    max_tokens=4000
                )
                content = response.choices[0].message.content

            # Parse JSON
            try:
                content = content.replace("```json", "").replace("```", "").strip()
                result = json.loads(content)
                # Ensure required fields
                if "modules" not in result:
                    result["modules"] = []
                return result
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


# ===== SMART COURSE CREATION (Alexandria AI Engine) =====

async def parse_materials_multimodal(
    file_base64: str,
    file_name: str,
    mime_type: str = "application/pdf"
) -> Dict:
    """
    Parse uploaded materials (slides, PDFs, images) using Gemini Vision.
    Extracts structured content for intelligent course creation.
    
    Powered by Alexandria AI Engine for intelligent content extraction.
    """
    
    prompt = """You are an expert curriculum designer analyzing educational materials.
    
Analyze this document/slide and extract the following in JSON format:

{
    "title": "Suggested course title based on content",
    "summary": "2-3 sentence overview of the material",
    "main_topics": [
        {"name": "Topic name", "description": "Brief description", "subtopics": ["subtopic1", "subtopic2"]}
    ],
    "learning_objectives": ["What students will learn - list 4-6 objectives"],
    "key_concepts": ["List of key terms/concepts that should be taught"],
    "visual_elements": ["Description of any diagrams, charts, or images and their educational purpose"],
    "suggested_structure": {
        "immerse": {"title": "Phase title", "focus": "What to cover in Immerse phase"},
        "realize": {"title": "Phase title", "focus": "What to cover in Realize phase"},
        "iterate": {"title": "Phase title", "focus": "What to cover in Iterate phase"},
        "scale": {"title": "Phase title", "focus": "What to cover in Scale phase"}
    },
    "difficulty_level": "Beginner/Intermediate/Advanced",
    "estimated_duration": "e.g., 4 weeks",
    "target_audience": "Who this content is best suited for",
    "prerequisites": ["Any required prior knowledge"]
}

Respond ONLY with valid JSON. Be thorough in extracting educational value."""

    errors = []
    
    # Try Gemini Vision first (best for multi-modal)
    if "gemini_vision" in clients:
        try:
            import google.generativeai as genai
            from google.generativeai.types import content_types
            
            print(f"[AI Service] Parsing with Gemini Vision: {file_name}")
            
            # Gemini expects inline data in specific format
            # Use Part with inline_data for multimodal content
            file_part = {
                "inline_data": {
                    "mime_type": mime_type,
                    "data": file_base64
                }
            }
            
            # Send both the prompt and file data
            response = await clients["gemini_vision"].generate_content_async([
                prompt,
                file_part
            ])
            
            content = response.text
            print(f"[AI Service] Gemini Vision response length: {len(content)} chars")
            
            # Parse JSON
            try:
                content = content.replace("```json", "").replace("```", "").strip()
                return {"success": True, "data": json.loads(content), "provider": "gemini_vision"}
            except:
                import re
                match = re.search(r'\{.*\}', content, re.DOTALL)
                if match:
                    return {"success": True, "data": json.loads(match.group()), "provider": "gemini_vision"}
                raise ValueError("Failed to parse JSON from Gemini Vision response")
                
        except Exception as e:
            print(f"[gemini_vision] Parse Error: {e}")
            import traceback
            traceback.print_exc()
            errors.append(f"gemini_vision: {str(e)}")
    
    # Fallback to OpenAI GPT-4 Vision if available
    if "openai" in clients and mime_type.startswith("image/"):
        try:
            print(f"[AI Service] Fallback to OpenAI Vision: {file_name}")
            
            response = await clients["openai"].chat.completions.create(
                model="gpt-4o",  # GPT-4o has vision capabilities
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{mime_type};base64,{file_base64}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=4096
            )
            
            content = response.choices[0].message.content
            print(f"[AI Service] OpenAI Vision response length: {len(content)} chars")
            
            # Parse JSON
            try:
                content = content.replace("```json", "").replace("```", "").strip()
                return {"success": True, "data": json.loads(content), "provider": "openai_vision"}
            except:
                import re
                match = re.search(r'\{.*\}', content, re.DOTALL)
                if match:
                    return {"success": True, "data": json.loads(match.group()), "provider": "openai_vision"}
                raise ValueError("Failed to parse JSON from OpenAI Vision response")
                
        except Exception as e:
            print(f"[openai_vision] Parse Error: {e}")
            errors.append(f"openai_vision: {str(e)}")
    
    # Fallback to text-only parsing if vision fails
    for provider in PRIORITY:
        if provider == "mock":
            await asyncio.sleep(2)
            
            # Extract intelligent content from filename
            import re
            base_name = file_name.rsplit('.', 1)[0] if '.' in file_name else file_name
            # Clean up filename: replace hyphens/underscores with spaces, title case
            clean_title = re.sub(r'[-_]', ' ', base_name).strip()
            # Extract key themes from the filename
            words = clean_title.split()
            key_themes = [w.title() for w in words if len(w) > 3][:5]
            
            # Generate intelligent topics based on themes
            if len(key_themes) >= 2:
                main_topic = ' '.join(key_themes[:3])
                topics = [
                    {"name": f"Foundations of {key_themes[0]}", "description": f"Core principles and fundamentals of {key_themes[0].lower()}", "subtopics": ["Key Principles", "Historical Context", "Core Terminology"]},
                    {"name": f"{key_themes[1] if len(key_themes) > 1 else main_topic} Fundamentals", "description": f"Essential concepts and frameworks", "subtopics": ["Conceptual Framework", "Best Practices", "Industry Standards"]},
                    {"name": f"Applied {main_topic}", "description": f"Practical applications and real-world scenarios", "subtopics": ["Case Studies", "Implementation Strategies", "Tools & Techniques"]},
                    {"name": f"Advanced {key_themes[0]} Strategies", "description": f"Deep dive into advanced concepts and mastery", "subtopics": ["Advanced Methods", "Optimization", "Future Trends"]}
                ]
            else:
                main_topic = clean_title or "Course Content"
                topics = [
                    {"name": "Introduction & Overview", "description": "Getting started with foundational knowledge", "subtopics": ["Overview", "Key Terms", "Learning Goals"]},
                    {"name": "Core Concepts & Theories", "description": "Essential frameworks and theoretical foundations", "subtopics": ["Main Theory", "Supporting Concepts", "Practical Framework"]},
                    {"name": "Practical Applications", "description": "Hands-on application of concepts", "subtopics": ["Real-World Examples", "Implementation Guide", "Best Practices"]},
                    {"name": "Advanced Topics & Mastery", "description": "Deep expertise and leadership-level content", "subtopics": ["Expert Techniques", "Innovation", "Future Directions"]}
                ]
            
            return {
                "success": True,
                "provider": "mock",
                "data": {
                    "title": f"{main_topic}",
                    "summary": f"A comprehensive curriculum covering {main_topic.lower()}, designed to take participants from foundational understanding to practical mastery through structured learning experiences.",
                    "main_topics": topics,
                    "learning_objectives": [
                        f"Understand the fundamental principles of {main_topic.lower()}",
                        f"Apply theoretical knowledge to real-world {key_themes[0].lower() if key_themes else 'professional'} challenges",
                        "Develop critical analysis and problem-solving skills",
                        f"Create implementation strategies for {key_themes[1].lower() if len(key_themes) > 1 else 'organizational'} contexts",
                        "Evaluate and optimize solutions based on industry best practices"
                    ],
                    "key_concepts": key_themes if key_themes else ["Strategy", "Framework", "Implementation", "Analysis"],
                    "visual_elements": ["Framework diagrams", "Process flowcharts", "Case study illustrations"],
                    "suggested_structure": {
                        "immerse": {"title": "Understanding the Landscape", "focus": f"Context, stakeholder analysis, and {main_topic.lower()} foundations"},
                        "realize": {"title": "Designing Solutions", "focus": "Strategic planning, architecture, and roadmap development"},
                        "iterate": {"title": "Building & Testing", "focus": "Implementation, feedback loops, and continuous improvement"},
                        "scale": {"title": "Deployment & Impact", "focus": "Launch strategies, measurement, and sustainable growth"}
                    },
                    "difficulty_level": "Intermediate",
                    "estimated_duration": "4 weeks",
                    "target_audience": "Professionals and emerging leaders",
                    "prerequisites": [f"Basic understanding of {key_themes[0].lower() if key_themes else 'the domain'}"]
                }
            }
        
        if provider not in clients:
            continue
    
    return {
        "success": False,
        "error": f"All providers failed: {errors}",
        "data": None
    }


async def generate_teaching_agenda(
    parsed_content: Dict,
    target_audience: str = "Intermediate",
    duration_weeks: int = 4
) -> Dict:
    """
    Generate Alexandria AI Engine teaching agenda with heterogeneous teaching actions.
    
    Teaching action types:
    - EXPLAIN: Lecture/presentation content
    - DISCUSS: Discussion prompts and activities
    - PRACTICE: Hands-on exercises
    - QUIZ: Knowledge checks
    - DEMO: Live demonstrations
    - REFLECT: Reflection questions
    - COLLABORATE: Group activities
    """
    
    content_json = json.dumps(parsed_content, indent=2)
    
    prompt = f"""You are an expert instructional designer creating an Alexandria AI Engine teaching agenda.

EXTRACTED CONTENT:
{content_json}

TARGET: {target_audience} level students
DURATION: {duration_weeks} weeks

Create a detailed teaching agenda with HETEROGENEOUS TEACHING ACTIONS for each module.

Teaching Action Types:
1. EXPLAIN - Lecture content with key points
2. DISCUSS - Discussion prompts for engagement
3. PRACTICE - Hands-on exercises
4. QUIZ - Knowledge check questions
5. DEMO - Demonstration activities
6. REFLECT - Reflection prompts
7. COLLABORATE - Group activities

Output JSON:
{{
    "course_title": "Final course title",
    "tagline": "Catchy one-line description",
    "modules": [
        {{
            "week": 1,
            "phase": "immerse",
            "title": "Module title",
            "learning_goals": ["Goal 1", "Goal 2"],
            "teaching_actions": [
                {{"type": "EXPLAIN", "title": "Action title", "content": "What to cover", "duration_minutes": 30}},
                {{"type": "DISCUSS", "title": "Discussion title", "prompt": "Discussion question", "duration_minutes": 15}},
                {{"type": "PRACTICE", "title": "Exercise title", "instructions": "What students do", "duration_minutes": 45}},
                {{"type": "QUIZ", "title": "Knowledge Check", "questions": ["Q1", "Q2", "Q3"], "duration_minutes": 10}}
            ],
            "assignments": ["Assignment description"],
            "resources": ["Resource 1", "Resource 2"]
        }}
    ],
    "capstone_project": {{
        "title": "Project title",
        "description": "What students will build",
        "deliverables": ["Deliverable 1", "Deliverable 2"],
        "rubric_summary": "How it will be graded"
    }},
    "auto_generated_quizzes": [
        {{
            "module": 1,
            "questions": [
                {{"question": "Question text", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "Why this is correct"}}
            ]
        }}
    ]
}}

Create {duration_weeks} modules (one per week), with ~4-6 teaching actions per module.
Balance action types across modules. Make content specific to the extracted material.

Respond ONLY with valid JSON."""

    errors = []
    for provider in PRIORITY:
        if provider == "mock":
            await asyncio.sleep(2)
            modules = []
            phases = ["immerse", "realize", "iterate", "scale"]
            phase_titles = {
                "immerse": "Understanding & Exploration",
                "realize": "Planning & Design",
                "iterate": "Building & Testing",
                "scale": "Deployment & Iteration"
            }
            
            for week in range(1, duration_weeks + 1):
                phase_idx = (week - 1) % 4
                phase = phases[phase_idx]
                modules.append({
                    "week": week,
                    "phase": phase,
                    "title": f"Week {week}: {phase_titles[phase]}",
                    "learning_goals": [f"Goal {week}.1", f"Goal {week}.2"],
                    "teaching_actions": [
                        {"type": "EXPLAIN", "title": f"Introduction to Week {week}", "content": "Core concepts overview", "duration_minutes": 30},
                        {"type": "DISCUSS", "title": "Discussion: Key Questions", "prompt": f"What challenges do you see in {phase}?", "duration_minutes": 20},
                        {"type": "PRACTICE", "title": "Hands-on Exercise", "instructions": f"Apply {phase} concepts", "duration_minutes": 45},
                        {"type": "QUIZ", "title": "Knowledge Check", "questions": ["Q1", "Q2", "Q3"], "duration_minutes": 10},
                        {"type": "REFLECT", "title": "Weekly Reflection", "prompt": "What did you learn this week?", "duration_minutes": 10}
                    ],
                    "assignments": [f"Week {week} Assignment"],
                    "resources": ["Module readings", "Video tutorials"]
                })
            
            return {
                "success": True,
                "provider": "mock",
                "agenda": {
                    "course_title": parsed_content.get("title", "AI-Generated Course"),
                    "tagline": "Transform your skills with structured learning",
                    "modules": modules,
                    "capstone_project": {
                        "title": "Capstone: Real-World Application",
                        "description": "Apply all course concepts to solve a real problem",
                        "deliverables": ["Project proposal", "Working prototype", "Final presentation"],
                        "rubric_summary": "Graded on creativity, technical execution, and impact"
                    },
                    "auto_generated_quizzes": [
                        {
                            "module": 1,
                            "questions": [
                                {"question": "What is the main goal of the Immerse phase?", "options": ["Understanding context", "Writing code", "Deploying", "Testing"], "correct": 0, "explanation": "Immerse focuses on understanding the problem context."}
                            ]
                        }
                    ]
                }
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
                    messages=[{"role": "system", "content": "You are a JSON instructional designer."}, {"role": "user", "content": prompt}],
                    temperature=0.7
                )
                content = response.choices[0].message.content

            try:
                content = content.replace("```json", "").replace("```", "").strip()
                return {"success": True, "agenda": json.loads(content), "provider": provider}
            except:
                import re
                match = re.search(r'\{.*\}', content, re.DOTALL)
                if match:
                    return {"success": True, "agenda": json.loads(match.group()), "provider": provider}
                raise ValueError("Failed to parse JSON")

        except Exception as e:
            print(f"[{provider}] Teaching Agenda Error: {e}")
            errors.append(f"{provider}: {str(e)}")
            continue

    return {
        "success": False,
        "error": f"All providers failed: {errors}",
        "agenda": None
    }


async def extract_knowledge_points(content: str) -> Dict:
    """
    Extract knowledge points for knowledge graph visualization.
    Returns nodes and edges for graph display.
    """
    
    prompt = f"""Analyze this educational content and extract a knowledge graph.

CONTENT:
{content[:8000]}

OUTPUT JSON:
{{
    "nodes": [
        {{"id": "node1", "label": "Concept Name", "type": "concept|skill|topic", "importance": "high|medium|low"}}
    ],
    "edges": [
        {{"source": "node1", "target": "node2", "relationship": "requires|enables|relates_to"}}
    ],
    "clusters": [
        {{"name": "Cluster Name", "nodes": ["node1", "node2"], "description": "What this cluster represents"}}
    ]
}}

Extract 10-20 key concepts with meaningful relationships. Respond ONLY with valid JSON."""

    errors = []
    for provider in PRIORITY:
        if provider == "mock":
            await asyncio.sleep(1)
            return {
                "success": True,
                "provider": "mock",
                "graph": {
                    "nodes": [
                        {"id": "n1", "label": "Core Concept", "type": "concept", "importance": "high"},
                        {"id": "n2", "label": "Foundation", "type": "topic", "importance": "high"},
                        {"id": "n3", "label": "Application", "type": "skill", "importance": "medium"},
                        {"id": "n4", "label": "Advanced Topic", "type": "topic", "importance": "medium"},
                        {"id": "n5", "label": "Practice", "type": "skill", "importance": "low"}
                    ],
                    "edges": [
                        {"source": "n2", "target": "n1", "relationship": "enables"},
                        {"source": "n1", "target": "n3", "relationship": "enables"},
                        {"source": "n1", "target": "n4", "relationship": "relates_to"},
                        {"source": "n3", "target": "n5", "relationship": "requires"}
                    ],
                    "clusters": [
                        {"name": "Fundamentals", "nodes": ["n1", "n2"], "description": "Core building blocks"}
                    ]
                }
            }

        if provider not in clients:
            continue

        try:
            response_content = ""
            if provider == "gemini":
                response = await clients[provider].generate_content_async(prompt)
                response_content = response.text
            else:
                response = await clients[provider].chat.completions.create(
                    model=MODELS[provider],
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.5
                )
                response_content = response.choices[0].message.content

            try:
                response_content = response_content.replace("```json", "").replace("```", "").strip()
                return {"success": True, "graph": json.loads(response_content), "provider": provider}
            except:
                import re
                match = re.search(r'\{.*\}', response_content, re.DOTALL)
                if match:
                    return {"success": True, "graph": json.loads(match.group()), "provider": provider}
                raise ValueError("Failed to parse JSON")

        except Exception as e:
            print(f"[{provider}] Knowledge Graph Error: {e}")
            errors.append(f"{provider}: {str(e)}")
            continue

    return {"success": False, "error": f"All providers failed: {errors}", "graph": None}
