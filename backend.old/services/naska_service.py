import os
from typing import List, Optional
from sqlalchemy import make_url

try:
    from llama_index import (
        VectorStoreIndex,
        SimpleDirectoryReader,
        ServiceContext,
        StorageContext
    )
    from llama_index.vector_stores import PGVectorStore
    from llama_index.llms import Gemini
    from llama_index.embeddings import GoogleGenerativeAIEmbedding
    import google.generativeai as genai
    
    HAS_DEPS = True
except ImportError:
    HAS_DEPS = False

# Configure Google Gemini
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if HAS_DEPS and GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

class PKCManager:
    """
    Manages the Personal Knowledge Container (PKC) using LlamaIndex and PGVector.
    """
    def __init__(self, request_user_id: str):
        self.user_id = request_user_id
        if not HAS_DEPS:
            print("WARNING: Naska dependencies missing. functionality limited.")
            return

        self.db_url = make_url(os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/tsea_x"))
        
        # Initialize LlamaIndex Service Context with Gemini
        if GOOGLE_API_KEY:
            self.vector_store = self._init_vector_store()
            self.llm = Gemini(model="models/gemini-1.5-pro-latest", api_key=GOOGLE_API_KEY)
            self.embed_model = GoogleGenerativeAIEmbedding(model="models/embedding-001", api_key=GOOGLE_API_KEY)
            self.service_context = ServiceContext.from_defaults(llm=self.llm, embed_model=self.embed_model)
        else:
            print("WARNING: GOOGLE_API_KEY missing.")

    def _init_vector_store(self):
        return PGVectorStore.from_params(
            database=self.db_url.database,
            host=self.db_url.host,
            password=self.db_url.password,
            port=self.db_url.port,
            user=self.db_url.username,
            table_name=f"pkc_{self.user_id}", # Isolated namespace per user
            embed_dim=768 # Gemini embedding dimension
        )

    async def ingest_document(self, file_path: str):
        if not HAS_DEPS: return {"status": "error", "detail": "Missing dependencies"}
        
        documents = SimpleDirectoryReader(input_files=[file_path]).load_data()
        storage_context = StorageContext.from_defaults(vector_store=self.vector_store)
        VectorStoreIndex.from_documents(
            documents, 
            storage_context=storage_context, 
            service_context=self.service_context
        )
        return {"status": "ingested", "docs": len(documents)}

    async def query(self, query_text: str):
        if not HAS_DEPS: return "Naska is offline (Missing Deps)."
        if not GOOGLE_API_KEY: return "Naska is offline (Missing API Key)."
        
        index = VectorStoreIndex.from_vector_store(
            vector_store=self.vector_store,
            service_context=self.service_context
        )
        query_engine = index.as_query_engine(streaming=True)
        response = query_engine.query(query_text)
        return response

class LogicEngine:
    def __init__(self, pkc_manager: PKCManager):
        self.pkc = pkc_manager

    async def detect_gaps(self, draft_text: str):
        if not HAS_DEPS or not GOOGLE_API_KEY:
            # Fallback for verification if deps/key missing
            return {
                "gaps": [
                    {
                        "severity": "high",
                        "text": "Logic Gap Detected", 
                        "suggestion": "The draft claims X but evidence suggests Y.",
                        "citation": "Iris_Cycle.pdf"
                    }
                ],
                "analysis": "Simulated Analysis: Dependencies unavailable. Returning mock gap for testing."
            }
            
        # 1. Retrieve relevant context from PKC
        retrieval = await self.pkc.query(f"Find evidence related to: {draft_text[:200]}")
        
        # 2. Ask LLM to compare Draft vs Evidence 
        prompt = f"""
        Analyze this draft text for logic gaps based on the evidence provided.
        DRAFT: {draft_text}
        EVIDENCE: {retrieval}
        
        If the draft contradicts the evidence, return a JSON with 'gaps' list.
        """
        response = self.pkc.llm.complete(prompt)
        return response.text
