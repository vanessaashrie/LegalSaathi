from app.schemas import AssistantReply

# PLACEHOLDER replies used until the real pipeline exists (Phase 5).
# This file is the only part that gets replaced.

_CAUTION_GENERAL = (
    "I have no verified legal sources for this topic, so I cannot say which "
    "law applies or what a court would decide. Check official sources such "
    "as India Code, and speak to a lawyer before acting on a legal point."
)

_CAUTION_DEPOSIT = (
    "No verified legal source is connected yet, so nothing in this reply is "
    "checked. In the finished system every legal point will show its source "
    "(title, section, central or state law, link, date checked), and points "
    "without a verified source will be labelled unverified."
)

REPLIES: dict[str, list[AssistantReply]] = {
    "general": [
        AssistantReply(
            text="Thanks. To organise your case I need the basics: who is the problem with, what happened and when, and how much money is involved?",
            caution=_CAUTION_GENERAL,
        ),
        AssistantReply(
            text="Understood. What outcome do you want, and what have you already tried, for example messages, calls or a complaint?",
            caution=_CAUTION_GENERAL,
        ),
        AssistantReply(
            text="Thank you. What documents or proof do you have, such as a contract, receipts, emails or messages? If you received a notice or there is a deadline, tell me the date.",
            caution=_CAUTION_GENERAL,
        ),
    ],
    "rentalDeposit": [
        AssistantReply(
            text="Thanks. I need a few details before I can say where you stand. Do you have a written rental agreement, and what does it say about returning the deposit?",
            caution=_CAUTION_DEPOSIT,
        ),
        AssistantReply(
            text="Understood. When exactly did you move out, and did you give your landlord notice before leaving? Has the landlord given any reason for keeping the money?",
            caution=_CAUTION_DEPOSIT,
        ),
        AssistantReply(
            text="Thank you. What proof do you have? For example the payment record for the deposit, messages with the landlord, or photos from move-out.",
            caution=_CAUTION_DEPOSIT,
        ),
    ],
}