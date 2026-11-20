import sys
from typing import Literal

from pydantic import BaseModel

from app.llm import FakeProvider, LLMError, generate_structured, get_provider


class TopicCheck(BaseModel):
    topic: Literal["rental_deposit", "consumer_refund", "employment_salary", "other"]
    reason: str


SYSTEM = "You classify a person's legal problem into one topic. Reply only with JSON."
MESSAGES = [
    {"role": "user", "text": "My landlord in Pune has not returned my deposit after I moved out."}
]

if len(sys.argv) > 1 and sys.argv[1] == "fake":
    # First reply is deliberately broken, to show validation + retry working
    provider = FakeProvider(["this is not json", '{"topic": "rental_deposit", "reason": "Demo."}'])
else:
    provider = get_provider()

try:
    result = generate_structured(provider, system=SYSTEM, messages=MESSAGES, model_cls=TopicCheck)
    print("RESULT:", result)
except LLMError as e:
    print("LLM ERROR:", e)

print("model calls made:", getattr(provider, "calls", "n/a"))