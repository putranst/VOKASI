from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Any, Optional, Dict, List
from services.openai_service import clients, PRIORITY, MODELS, CLIENT_TYPES, _create_chat_completion
import asyncio
import json

router = APIRouter(
    prefix="/api/v1/ai",
    tags=["ai"]
)

class TextAssistRequest(BaseModel):
    text: str
    action: str
    context: Optional[str] = None


class ProviderProbe(BaseModel):
    active: bool
    message: str
    latency_ms: Optional[float] = None


class ProviderStatusResponse(BaseModel):
    providers: Dict[str, ProviderProbe]

@router.post("/text-assist")
async def text_assist(request: TextAssistRequest):
    """
    AI Text Assistant for Course Editor
    Actions: improve, shorter, longer, simplify, summarize, complete, paraphrase
    """
    text = request.text
    action = request.action
    
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")
        
    # Construct prompt based on action
    prompts = {
        "improve": f"Rewrite the following text to improve clarity, flow, and professionalism while maintaining the original meaning:\n\n{text}",
        "shorter": f"Condense the following text to be more concise without losing key information:\n\n{text}",
        "longer": f"Expand on the following text with more details and explanation suitable for an educational context:\n\n{text}",
        "simplify": f"Rewrite the following text using simpler language and concepts (ELI5 style):\n\n{text}",
        "summarize": f"Create a brief bullet-point summary of the following text:\n\n{text}",
        "complete": f"Complete the following text naturally, continuing the thought or paragraph:\n\n{text}",
        "paraphrase": f"Paraphrase the following text using different words and sentence structure:\n\n{text}"
    }
    
    prompt = prompts.get(action)
    if not prompt:
        raise HTTPException(status_code=400, detail=f"Invalid action: {action}")
        
    # Add system context
    system_prompt = "You are an expert educational content editor. Output ONLY the transformed text. Do not add conversational filler like 'Here is the improved text:'."
    
    errors = []
    
    # Try available providers
    for provider in PRIORITY:
        if provider == "mock":
            # Mock fallback
            await asyncio.sleep(1)
            prefixes = {
                "improve": "(Improved) ",
                "shorter": "(Concise) ",
                "longer": "(Expanded) ",
                "simplify": "(Simplified) ",
                "summarize": "Summary:\n- ",
                "complete": " ...[completed by AI]",
                "paraphrase": "(Rewritten) "
            }
            return {
                "original": text,
                "result": f"{prefixes.get(action, '')}{text}",
                "action": action,
                "provider": "mock"
            }
            
        if provider not in clients:
            continue
            
        try:
            content = ""
            if provider == "gemini":
                # For Gemini
                response = await clients[provider].generate_content_async(
                    f"{system_prompt}\n\nTask: {prompt}"
                )
                content = response.text.strip()
            else:
                # For OpenAI / OpenRouter
                model_name = "" if provider == "openrouter" else MODELS.get(provider, "")
                response = await _create_chat_completion(
                    clients[provider],
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    model=model_name,
                    temperature=0.7
                )
                content = response.choices[0].message.content.strip()
                
            return {
                "original": text,
                "result": content,
                "action": action,
                "provider": provider
            }
            
        except Exception as e:
            print(f"[{provider}] Text Assist Error: {e}")
            errors.append(f"{provider}: {str(e)}")
            continue
            
    # If all fail
    raise HTTPException(status_code=500, detail=f"AI processing failed: {errors}")


RUBRICS: Dict[str, Dict[str, int]] = {
    "charter":        {"problem_clarity": 25, "success_metrics": 25, "feasibility": 20, "stakeholder_analysis": 15, "constraints_realism": 15},
    "design":         {"architecture_quality": 30, "component_breakdown": 25, "data_flow_clarity": 20, "scalability": 15, "documentation": 10},
    "implementation": {"code_quality": 30, "functionality": 25, "test_coverage": 20, "best_practices": 15, "documentation": 10},
    "deployment":     {"deployment_success": 40, "documentation": 20, "monitoring": 20, "security": 20},
    "immerse":        {"problem_context": 30, "stakeholder_depth": 25, "empathy": 20, "institutional_anchor": 25},
    "realize":        {"gap_analysis": 35, "sfia_mapping": 30, "learning_plan": 35},
    "iterate":        {"hypothesis_quality": 25, "build_description": 25, "learnings": 30, "next_steps": 20},
    "scale":          {"deployment_readiness": 30, "handoff_quality": 30, "impact_metrics": 20, "sfia_evidence": 20},
}

class GradeRequest(BaseModel):
    phase: str
    submission: Dict[str, Any]
    context: Optional[str] = None

@router.post("/grade")
async def grade_submission(request: GradeRequest):
    """
    Grade a student submission for any IRIS/CDIO phase using a real LLM.
    Falls back to heuristic scoring if all LLM providers fail.
    """
    rubric = RUBRICS.get(request.phase)
    if not rubric:
        raise HTTPException(status_code=400, detail=f"Unknown phase: {request.phase}. Valid: {list(RUBRICS.keys())}")

    max_score = sum(rubric.values())
    rubric_desc = "\n".join(f"- {k} (max {v} pts)" for k, v in rubric.items())
    submission_text = json.dumps(request.submission, indent=2, ensure_ascii=False)

    system_prompt = (
        "You are a senior educational assessor for a professional development platform. "
        "Grade the student submission strictly according to the rubric. "
        "Return ONLY a valid JSON object — no prose, no markdown fences."
    )
    user_prompt = f"""Phase: {request.phase}
Context: {request.context or 'IRIS/NUSA Framework course project'}

Rubric criteria (total {max_score} pts):
{rubric_desc}

Student submission:
{submission_text}

Return JSON with this exact structure:
{{
  "scores": {{"criterion_name": <integer score>, ...}},
  "feedback": {{"criterion_name": "<specific feedback>", ...}},
  "overall_feedback": "<2-3 sentence summary>",
  "grade": "<A|B|C|D|F>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"]
}}
Scores must not exceed each criterion's max. Be constructive but honest."""

    errors: List[str] = []

    for provider in PRIORITY:
        if provider == "mock":
            break  # fall through to heuristic
        if provider not in clients:
            continue
        try:
            raw = ""
            if CLIENT_TYPES.get(provider) == "gemini" or provider == "gemini":
                resp = await clients[provider].generate_content_async(
                    f"{system_prompt}\n\n{user_prompt}"
                )
                raw = resp.text.strip()
            else:
                model_name = "" if provider == "openrouter" else MODELS.get(provider, "")
                resp = await _create_chat_completion(
                    clients[provider],
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    model=model_name,
                    temperature=0.3
                )
                raw = resp.choices[0].message.content.strip()

            # Strip markdown fences if present
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            parsed = json.loads(raw)

            scores = parsed.get("scores", {})
            total = sum(scores.values())
            percentage = int(total / max_score * 100) if max_score else 0
            return {
                "phase": request.phase,
                "total_score": total,
                "max_score": max_score,
                "percentage": percentage,
                "grade": parsed.get("grade", "B"),
                "scores": scores,
                "feedback": parsed.get("feedback", {}),
                "overall_feedback": parsed.get("overall_feedback", ""),
                "strengths": parsed.get("strengths", []),
                "improvements": parsed.get("improvements", []),
                "rubric": rubric,
                "provider": provider,
            }
        except Exception as e:
            errors.append(f"{provider}: {str(e)[:120]}")
            continue

    # Heuristic fallback
    scores = {k: int(v * 0.75) for k, v in rubric.items()}
    total = sum(scores.values())
    percentage = int(total / max_score * 100)
    return {
        "phase": request.phase,
        "total_score": total,
        "max_score": max_score,
        "percentage": percentage,
        "grade": "B",
        "scores": scores,
        "feedback": {k: "Good effort — add more specific detail." for k in rubric},
        "overall_feedback": "Submission received and reviewed. For richer AI feedback, configure an LLM provider.",
        "strengths": ["Submission completed", "Core structure present"],
        "improvements": ["Add more quantitative evidence", "Expand stakeholder analysis"],
        "rubric": rubric,
        "provider": "heuristic",
        "errors": errors,
    }


async def _probe_provider(name: str, client: Any) -> ProviderProbe:
    prompt = "Say 'ok' and nothing else."
    try:
        client_type = CLIENT_TYPES.get(name)
        if client_type == "gemini" or name == "gemini":
            import google.generativeai as genai

            model = client
            await model.generate_content_async(
                prompt,
                generation_config=genai.GenerationConfig(max_output_tokens=5),
            )
            return ProviderProbe(active=True, message="OK")

        if name == "openrouter":
            # Validate API key / client wiring without forcing a model.
            await client.models.list()
            return ProviderProbe(active=True, message="OK")

        model_name = MODELS.get(name, "")
        response = await _create_chat_completion(
            client,
            messages=[{"role": "user", "content": prompt}],
            model=model_name,
            max_tokens=5,
        )
        if response and response.choices:
            return ProviderProbe(active=True, message="OK")
        return ProviderProbe(active=False, message="Empty response")
    except Exception as e:  # noqa: BLE001
        return ProviderProbe(active=False, message=str(e)[:200])


@router.get("/provider-status", response_model=ProviderStatusResponse)
async def provider_status() -> ProviderStatusResponse:
    probes: Dict[str, ProviderProbe] = {}

    for provider in PRIORITY:
        if provider == "mock":
            probes[provider] = ProviderProbe(active=True, message="Mock provider available")
            continue

        client = clients.get(provider)
        if not client:
            probes[provider] = ProviderProbe(active=False, message="Client not configured")
            continue

        probes[provider] = await _probe_provider(provider, client)

    for name, client in clients.items():
        if name in probes or name.endswith("_vision"):
            continue
        probes[name] = await _probe_provider(name, client)

    return ProviderStatusResponse(providers=probes)
