
import re

from app.llm import LLMError, LLMProvider, generate_structured
from app.prompts import build_system_prompt
from app.schemas import (
    AssistantReply,
    CaseFile,
    ChatRequest,
    TimelineEvent,
)
from app.stub_replies import _CAUTION_DEPOSIT, _CAUTION_GENERAL
from app.turn_schema import LLMTurn

CAUTIONS = {
    "general": _CAUTION_GENERAL,
    "rentalDeposit": _CAUTION_DEPOSIT,
}

MAX_HISTORY = 20


def _norm(text: str) -> str:
    """Normalize text for conservative number matching."""
    return re.sub(r"[,\s]", "", text.lower())


def _numbers_supported(value: str, user_norm: str) -> bool:
    """True if every number in value appears in the user's text."""
    numbers = re.findall(r"\d+", _norm(value))
    return all(number in user_norm for number in numbers)


def _explicitly_supported(value: str, user_text: str) -> bool:
    """
    Check that the model's proposed value is supported by the user's
    actual message history.

    Numeric values must pass number matching. This is a conservative
    safeguard, not a complete natural-language fact verifier.
    """
    user_norm = _norm(user_text)
    value_norm = _norm(value)

    if not _numbers_supported(value, user_norm):
        return False

    # For values without numbers, require meaningful text overlap.
    words = [
        word.lower()
        for word in re.findall(r"[a-zA-Z]+", value)
        if len(word) > 2
    ]

    if not words:
        return True

    user_lower = user_text.lower()
    return any(word in user_lower for word in words)



def _explicit_evidence_claims(user_text: str) -> set[str]:
    """
    Identify checklist evidence the user explicitly says they possess.
    This is deliberately conservative: a possession verb and a matching
    evidence description must appear in the same clause.
    """
    clauses = re.split(
        r"[.!?;\n]+|\bbut\b|\bhowever\b|\balthough\b",
        user_text.lower().replace("?", "'")
    )

    possession = re.compile(
        r"\b(?:i|we)\s+(?:(?:do|really)\s+)?(?:have|got|possess)\b"
        r"|\b(?:i've|we've)\s+got\b"
    )

    negative = re.compile(
        r"\b(?:don't|dont|do not|haven't|have not|never)\s+"
        r"(?:really\s+)?(?:have|got|possess)\b"
    )

    evidence_phrases = {
        "Rental agreement": (
            r"\brental agreement\b",
            r"\brent agreement\b",
            r"\btenancy agreement\b",
            r"\blease agreement\b",
        ),
        "Proof of deposit payment (bank transfer, receipt)": (
            r"\bpayment screenshot\b",
            r"\bdeposit screenshot\b",
            r"\bbank transfer\b",
            r"\btransfer receipt\b",
            r"\bdeposit receipt\b",
            r"\bpayment receipt\b",
            r"\bproof of payment\b",
            r"\bpayment proof\b",
        ),
        "Messages or call records with the landlord": (
            r"\bmessages? with (?:the )?landlord\b",
            r"\bwhatsapp chats?\b",
            r"\bchat records?\b",
            r"\bcall records?\b",
            r"\bcall logs?\b",
            r"\bemails? with (?:the )?landlord\b",
        ),
        "Move-out photos or handover proof": (
            r"\bmove[- ]out photos?\b",
            r"\bvacating photos?\b",
            r"\bhandover proof\b",
            r"\bhandover receipt\b",
            r"\bkey handover\b",
            r"\bmove[- ]out proof\b",
        ),
    }

    found = set()

    for clause in clauses:
        if not possession.search(clause):
            continue

        if negative.search(clause):
            continue

        for item_name, patterns in evidence_phrases.items():
            if any(re.search(pattern, clause) for pattern in patterns):
                found.add(item_name)

    return found


def apply_turn(
    case_file: CaseFile,
    turn: LLMTurn,
    user_text: str,
) -> CaseFile:
    """Apply model proposals using application-side trust checks."""

    case = case_file.model_copy(deep=True)
    user_norm = _norm(user_text)

    by_key = {field.key: field for field in case.fields}

    # 1. Apply case-field updates.
    for update in turn.field_updates[:12]:
        field = by_key.get(update.key)
        value = update.value.strip()[:500]

        if field is None or not value:
            continue

        # Never overwrite values the user edited or confirmed.
        if field.status in ("confirmed", "edited") and field.value.strip():
            continue

        verified = (
            update.stated_by_user
            and _numbers_supported(value, user_norm)
            and _explicitly_supported(value, user_text)
        )

        field.value = value
        field.status = (
            "user_stated" if verified else "needs_confirmation"
        )

    # 2. Apply timeline additions.
    seen = {
        (event.date, event.event)
        for event in case.timeline
    }

    for addition in turn.timeline_additions[:5]:
        raw_date = addition.date.strip()[:120]
        event = addition.event.strip()[:500]

        # Do not add undated events to the timeline.
        # Undated facts belong in the case fields instead.
        if raw_date.lower() in {
            "", "unknown", "date unknown", "not specified", "n/a"
        }:
            continue

        date = raw_date

        if (
            not event
            or (date, event) in seen
            or len(case.timeline) >= 50
        ):
            continue

        supported = (
            _numbers_supported(date + " " + event, user_norm)
            and _explicitly_supported(date + " " + event, user_text)
        )

        case.timeline.append(
            TimelineEvent(
                date=date,
                event=event,
                status=(
                    "user_stated" if supported else "needs_confirmation"
                ),
            )
        )

        seen.add((date, event))

    # 3. Apply evidence updates.
    evidence_by_name = {
        item.item.strip().lower(): item
        for item in case.evidence
    }

    for update in turn.evidence_updates[:20]:
        item_name = update.item.strip().lower()

        if not item_name:
            continue

        evidence = evidence_by_name.get(item_name)

        # Ignore evidence names not present in the case file.
        if evidence is None:
            continue

        # Only accept an affirmative claim when the user explicitly
        # said they possess that evidence.
        if update.have and update.stated_by_user:
            evidence.have = True

        # Never automatically uncheck evidence already marked as present.
        # The user can manually uncheck it in the frontend.

    # Also apply explicit evidence claims directly from the user's text.
    # This does not depend on Gemini returning evidence_updates.
    explicitly_have = _explicit_evidence_claims(user_text)

    for item in case.evidence:
        if item.item in explicitly_have:
            item.have = True

    # 4. Update missing information.
    case.missing = [
        item.strip()[:200]
        for item in turn.missing
        if item.strip()
    ][:6]

    return case


def run_turn(
    req: ChatRequest,
    domain_id: str,
    provider: LLMProvider,
) -> tuple[AssistantReply, CaseFile]:

    system = build_system_prompt(domain_id, req.case_file)

    messages = [
        {"role": message.role, "text": message.text}
        for message in req.messages[-MAX_HISTORY:]
    ]

    while messages and messages[0]["role"] == "assistant":
        messages.pop(0)

    turn = generate_structured(
        provider,
        system=system,
        messages=messages,
        model_cls=LLMTurn,
    )

    reply_text = turn.reply.strip()[:3000]

    if not reply_text:
        raise LLMError(
            "The AI returned an empty reply. Please try again."
        )

    # Include the complete user message history so previously stated
    # details remain available for conservative verification.
    user_text = " ".join(
        message.text
        for message in req.messages
        if message.role == "user"
    )

    case = apply_turn(
        req.case_file,
        turn,
        user_text,
    )

    escalation_reasons = [
        reason.strip()[:200]
        for reason in turn.escalation_reasons
        if reason.strip()
    ][:5]

    reply = AssistantReply(
        text=reply_text,
        caution=CAUTIONS.get(domain_id, _CAUTION_GENERAL),
        needs_lawyer=turn.needs_lawyer,
        escalation_reasons=escalation_reasons,
    )

    return reply, case
