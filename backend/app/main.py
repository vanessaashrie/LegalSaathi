from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings

app = FastAPI(title="LegalSaathi API", version="0.1.0")

# Only our own frontend may call this API from a browser
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.allowed_origin],
    allow_methods=["*"],
    allow_headers=["*"],
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
