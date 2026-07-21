import sys
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app import config
from app.routes.governance import router as governance_router
from app.vector_store import warm_all_indexes

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[TGS] Warming vector indexes for all registered companies...")
    try:
        warm_all_indexes()
        print("[TGS] Indexes ready.")
    except Exception as err:
        print(f"[TGS] Failed to warm indexes at startup — will build lazily per request: {err}")
    yield

app = FastAPI(
    title="Trust & Governance Service (TGS)",
    description="RAG + LLM governance decisioning over CAS inputs (Python Backend)",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS if config.CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(governance_router)

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "TGS Backend (Python)",
        "model": config.GROQ_MODEL,
    }

@app.exception_handler(404)
def custom_404_handler(request, exc):
    return JSONResponse(status_code=404, content={"error": "Not found"})

if __name__ == "__main__":
    print(f"[TGS] Trust & Governance Service listening on http://localhost:{config.PORT}")
    print(f"[TGS] Groq model: {config.GROQ_MODEL}")
    if not config.GROQ_API_KEY:
        print("[TGS] WARNING: GROQ_API_KEY is not set. Requests to /api/governance will fail until configured in .env")
    
    uvicorn.run("main:app", host="0.0.0.0", port=config.PORT, reload=True)
