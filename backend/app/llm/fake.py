from app.llm.base import LLMError, LLMProvider


class FakeProvider(LLMProvider):
    """Returns canned replies in order. Used to test our own code (validation,
    retries, safety checks) without calling a real model."""

    def __init__(self, responses: list[str]):
        self.responses = list(responses)
        self.calls = 0

    def complete_json(self, *, system: str, messages: list[dict], json_schema: dict) -> str:
        if self.calls >= len(self.responses):
            raise LLMError("Fake provider has no more canned responses.")
        reply = self.responses[self.calls]
        self.calls += 1
        return reply