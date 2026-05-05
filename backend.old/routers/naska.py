from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import shutil
import os
from services.naska_service import PKCManager, LogicEngine

router = APIRouter(prefix="/api/v1/naska", tags=["naska"])

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None
    user_id: str

class LogicCheckRequest(BaseModel):
    draft_text: str
    user_id: str

@router.post("/ingest")
async def ingest_document(user_id: str, file: UploadFile = File(...)):
    """Uploads and indexes a PDF/Text file into the user's PKC."""
    temp_path = f"temp_{file.filename}"
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        pkc = PKCManager(user_id)
        result = await pkc.ingest_document(temp_path)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@router.post("/chat")
async def chat_with_naska(request: ChatRequest):
    """Chat endpoint with RAG context."""
    try:
        pkc = PKCManager(request.user_id)
        # Simple RAG query for now
        response = await pkc.query(request.message)
        return {"response": str(response)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze")
async def analyze_logic_gaps(request: LogicCheckRequest):
    """Detects logic gaps in the draft."""
    try:
        pkc = PKCManager(request.user_id)
        logic = LogicEngine(pkc)
        gaps = await logic.detect_gaps(request.draft_text)
        return {"analysis": gaps}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
