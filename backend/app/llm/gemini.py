import time

import httpx

from app.config import settings
from app.llm.base import LLMError, LLMProvider

BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"


def _google_detail(r: httpx.Response) -> str:
    """Google's own error text. It describes the request or the service, not
    the user's story, so it is safe to show."""
    try:
        return str(r.json().get("error", {}).get("message", ""))[:200]
    except (ValueError, AttributeError):
        return ""


class GeminiProvider(LLMProvider):
    def __init__(self, api_key: str, model: str, timeout: float = 40.0):
        self.api_key = api_key
        self.model = model
        self.timeout = timeout

    def complete_json(self, *, system: str, messages: list[dict], json_schema: dict) -> str:
        if not self.api_key or self.api_key == "paste-your-key-here-later":
            raise LLMError("No API key is configured on the server.")

        body = {
            "system_instruction": {"parts": [{"text": system}]},
            "contents": [
                {
                    "role": "user" if m["role"] == "user" else "model",
                    "parts": [{"text": m["text"]}],
                }
                for m in messages
            ],
            "generationConfig": {
                "temperature": 0.2,
                "responseFormat": {
                    "text": {"mimeType": "APPLICATION_JSON", "schema": json_schema}
                },
            },
        }
        if settings.llm_thinking_level:
            body["generationConfig"]["thinkingConfig"] = {
                "thinkingLevel": settings.llm_thinking_level
            }

        r = None
        for attempt in range(3):
            try:
                r = httpx.post(
                    f"{BASE_URL}/{self.model}:generateContent",
                    headers={"x-goog-api-key": self.api_key},
                    json=body,
                    timeout=self.timeout,
                )
            except httpx.TimeoutException:
                raise LLMError("The AI service took too long to respond.")
            except httpx.HTTPError:
                raise LLMError("Could not reach the AI service.")

            # Busy or overloaded: wait a moment and try again
            if r.status_code in (429, 503) and attempt < 2:
                time.sleep(2 * (attempt + 1))
                continue
            break

        if r.status_code == 429:
            raise LLMError(f"The AI service is busy or out of free quota. {_google_detail(r)}".strip())
        if r.status_code in (401, 403):
            raise LLMError("The AI service rejected the API key, or this model is not available for it.")
        if r.status_code == 404:
            raise LLMError("The model name was not found. Check LLM_MODEL in the server settings.")
        if r.status_code != 200:
            raise LLMError(
                f"The AI service returned an error ({r.status_code}). {_google_detail(r)}".strip()
            )

        try:
            parts = r.json()["candidates"][0]["content"]["parts"]
            text = "".join(p["text"] for p in parts if "text" in p and not p.get("thought"))
        except (KeyError, IndexError, TypeError, ValueError):
            raise LLMError("The AI service returned an unexpected response (it may have been blocked).")

        if not text:
            raise LLMError("The AI service returned an empty answer.")
        return text