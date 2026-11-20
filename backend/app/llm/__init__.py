from app.config import settings
from app.llm.base import LLMError, LLMProvider, generate_structured
from app.llm.fake import FakeProvider
from app.llm.gemini import GeminiProvider

__all__ = [
    "LLMError",
    "LLMProvider",
    "FakeProvider",
    "GeminiProvider",
    "generate_structured",
    "get_provider",
]


def get_provider() -> LLMProvider:
    """Choose the model provider from settings (LLM_PROVIDER in .env).
    To add another provider: write one adapter file and add one line here."""
    name = settings.llm_provider.lower()
    if name == "gemini":
        return GeminiProvider(settings.llm_api_key, settings.llm_model)
    if name == "fake":
        return FakeProvider([])
    raise LLMError(f"Unknown LLM_PROVIDER: {name}")