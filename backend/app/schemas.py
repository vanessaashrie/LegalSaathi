from typing import Literal

from pydantic import BaseModel, Field

# Which topic pack is active. Unknown values are rejected automatically.
DomainId = Literal["general", "rentalDeposit"]

# How much we trust a case-file value:
#   user_stated        - the user said it
#   needs_confirmation - inferred, the user should check it
#   unknown            - not provided
#   edited             - the user changed it but has not submitted yet
#   confirmed          - the user reviewed or submitted it
FieldStatus = Literal[
    "user_stated", "needs_confirmation", "unknown", "edited", "confirmed"
]


class CaseField(BaseModel):
    key: str = Field(max_length=60)
    label: str = Field(max_length=120)
    value: str = Field(default="", max_length=1000)
    status: FieldStatus = "unknown"


class TimelineEvent(BaseModel):
    date: str = Field(max_length=120)
    event: str = Field(max_length=500)
    status: FieldStatus = "user_stated"


class EvidenceItem(BaseModel):
    item: str = Field(max_length=200)
    have: bool = False


class CaseFile(BaseModel):
    fields: list[CaseField] = Field(default_factory=list, max_length=30)
    timeline: list[TimelineEvent] = Field(default_factory=list, max_length=50)
    evidence: list[EvidenceItem] = Field(default_factory=list, max_length=30)
    missing: list[str] = Field(default_factory=list, max_length=30)


class Source(BaseModel):
    """A legal source shown to the user. Every field must come from the
    curated knowledge base, never from the model."""

    id: str
    title: str
    section: str
    jurisdiction: str  # "Central" or a state name
    url: str
    verified_on: str


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    text: str = Field(max_length=4000)


class AssistantReply(BaseModel):
    text: str
    sources: list[Source] = Field(default_factory=list)
    caution: str | None = None
    needs_lawyer: bool = False
    escalation_reasons: list[str] = Field(default_factory=list)


class ChatRequest(BaseModel):
    domain_id: DomainId = "general"
    messages: list[ChatMessage] = Field(min_length=1, max_length=40)
    case_file: CaseFile


class ChatResponse(BaseModel):
    domain_id: DomainId
    reply: AssistantReply
    case_file: CaseFile