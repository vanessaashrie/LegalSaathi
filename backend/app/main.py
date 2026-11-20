from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.domains import detect_domain
from app.llm import LLMError, get_provider
from app.pipeline import run_turn
from app.schemas import ChatRequest, ChatResponse

app = FastAPI(title="LegalSaathi API", version="0.3.0")

# Only our own frontend may call this API from a browser
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.allowed_origin],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unexpected_error(request: Request, exc: Exception):
    # Generic message only. We never log request bodies: they contain
    # the user's private legal story.
    return JSONResponse(
        status_code=500,
        content={"detail": "Something went wrong on our side. Please try again."},
    )


@app.get("/health")
def health():
    """Simple check that the server is alive and configured."""
    return {
        "status": "ok",
        "llm_provider": settings.llm_provider,
        # Report whether a key exists, never the key itself
        "llm_key_configured": bool(settings.llm_api_key)
        and settings.llm_api_key != "paste-your-key-here-later",
    }


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    """One chat turn. The browser sends the whole conversation and case file;
    the server keeps nothing between requests (stateless)."""
    last_user = next((m for m in reversed(req.messages) if m.role == "user"), None)
    if last_user is None:
        raise HTTPException(status_code=422, detail="At least one user message is required.")

    # Only move from general to a more specific topic, never back
    domain_id = req.domain_id
    if domain_id == "general":
        domain_id = detect_domain(last_user.text)

    try:
        reply, case_file = run_turn(req, domain_id, get_provider())
    except LLMError as e:
        # LLMError messages are written to be safe to show the user
        raise HTTPException(status_code=503, detail=str(e))

    return ChatResponse(domain_id=domain_id, reply=reply, case_file=case_file)