import re

from app.schemas import DomainId

# MOCK topic detector (keyword matching). In Phase 5 the decision also
# depends on whether a verified source was actually retrieved.
_RULES: list[tuple[DomainId, re.Pattern]] = [
    (
        "rentalDeposit",
        re.compile(r"\b(deposit|landlord|tenant|tenancy|rented|rental|lease)\b", re.I),
    ),
]


def detect_domain(text: str) -> DomainId:
    for domain_id, pattern in _RULES:
        if pattern.search(text):
            return domain_id
    return "general"