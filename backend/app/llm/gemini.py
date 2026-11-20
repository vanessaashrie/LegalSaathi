import httpx

from app.llm.base import LLMError, LLMProvider

BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"


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

        if r.status_code == 429:
            raise LLMError("The AI service is busy (rate limit). Please try again shortly.")
        if r.status_code in (401, 403):
            raise LLMError("The AI service rejected the API key, or this model is not available for it.")
        if r.status_code == 404:
            raise LLMError("The model name was not found. Check LLM_MODEL in the server settings.")
        if r.status_code == 400:
            # Google's own error text describes the request, not the user's story
            try:
                detail = str(r.json().get("error", {}).get("message", ""))[:200]
            except ValueError:
                detail = ""
            raise LLMError(f"The AI service rejected the request. {detail}".strip())
        if r.status_code != 200:
            raise LLMError(f"The AI service returned an error ({r.status_code}).")

        try:
            parts = r.json()["candidates"][0]["content"]["parts"]
            text = "".join(p["text"] for p in parts if "text" in p and not p.get("thought"))
        except (KeyError, IndexError, TypeError, ValueError):
            raise LLMError("The AI service returned an unexpected response (it may have been blocked).")

        if not text:
            raise LLMError("The AI service returned an empty answer.")
        return text