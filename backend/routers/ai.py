from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict
from services.openai_service import clients, PRIORITY, MODELS
import asyncio

router = APIRouter(
    prefix="/api/v1/ai",
    tags=["ai"]
)

class TextAssistRequest(BaseModel):
    text: str
    action: str
    context: Optional[str] = None

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
                response = await clients[provider].chat.completions.create(
                    model=MODELS[provider],
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
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
