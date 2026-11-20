
from pydantic import BaseModel, Field


class FieldUpdate(BaseModel):
    key: str = Field(
        description="Exactly one of the field keys listed in the case file."
    )
    value: str = Field(
        description="Short value, in English."
    )
    stated_by_user: bool = Field(
        description="True only if the user explicitly said this. False if inferred."
    )


class TimelineAdd(BaseModel):
    date: str = Field(
        description="Date or time phrase as the user gave it, or 'Date unknown'."
    )
    event: str = Field(
        description="One short sentence about what happened."
    )


class EvidenceUpdate(BaseModel):
    item: str = Field(
        description="The exact evidence item name from the case file."
    )
    have: bool = Field(
        description="True only if the user explicitly says they possess this evidence. Never infer possession."
    )
    stated_by_user: bool = Field(
        description="True only if the user explicitly said they possess this evidence."
    )


class LLMTurn(BaseModel):
    reply: str = Field(
        description="Message to the user, in plain language, in the user's language."
    )

    field_updates: list[FieldUpdate] = Field(default_factory=list)

    timeline_additions: list[TimelineAdd] = Field(default_factory=list)

    evidence_updates: list[EvidenceUpdate] = Field(
        default_factory=list,
        description="Update evidence only when the user explicitly says they have it."
    )

    missing: list[str] = Field(
        default_factory=list,
        description="Up to 6 short items of important information still missing."
    )

    needs_lawyer: bool = False

    escalation_reasons: list[str] = Field(default_factory=list)
