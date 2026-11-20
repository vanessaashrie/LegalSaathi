from abc import ABC, abstractmethod
from typing import TypeVar

from pydantic import BaseModel, ValidationError

T = TypeVar("T", bound=BaseModel)


class LLMError(Exception):
    """A problem talking to the model. The message is safe to show the user:
    it never contains the user's text or the model's raw output."""


class LLMProvider(ABC):
    """Every model provider implements this one method. The rest of the app
    only knows this interface, never a specific vendor."""

    @abstractmethod
    def complete_json(self, *, system: str, messages: list[dict], json_schema: dict) -> str:
        """Send the conversation and return the model's raw JSON text.

        messages: [{"role": "user" | "assistant", "text": "..."}]
        """


def generate_structured(
    provider: LLMProvider,
    *,
    system: str,
    messages: list[dict],
    model_cls: type[T],
    retries: int = 1,
) -> T:
    """Ask for JSON that fits `model_cls`, validate it, retry once if it does not.
    The model's output is never used until it passes validation."""
    schema = model_cls.model_json_schema()
    convo = list(messages)

    for _ in range(retries + 1):
        raw = provider.complete_json(system=system, messages=convo, json_schema=schema)
        try:
            return model_cls.model_validate_json(raw)
        except ValidationError:
            convo = convo + [
                {"role": "assistant", "text": raw[:2000]},
                {
                    "role": "user",
                    "text": "That reply did not match the required JSON format. "
                    "Reply again with only valid JSON that matches the schema.",
                },
            ]

    raise LLMError("The AI returned an answer in the wrong format. Please try again.")