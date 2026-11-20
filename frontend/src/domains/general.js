// Default pack: general consultation for any legal problem.
// No verified legal sources: it organises facts and drafts from facts only.
// The app switches to a verified pack when it recognises a covered topic.

const CAUTION =
  "I have no verified legal sources for this topic, so I cannot say which law applies or what a court would decide. Check official sources such as India Code, and speak to a lawyer before acting on a legal point.";

export default {
  id: "general",
  name: "General consultation",
  tier: "general",
  tierLabel: "General mode: no legal citations",
  tagline: "Any legal problem",
  greeting:
    "Hello, I'm LegalSaathi. Tell me about your legal problem in your own words.",
  suggestions: [
    "My landlord won't return my deposit",
    "A company has not refunded my money",
    "My employer has not paid my salary",
    "I received a legal notice",
  ],
  initialCase: {
    fields: [
      { key: "problemType", label: "What kind of problem is this?", value: "", status: "unknown" },
      { key: "otherParty", label: "Who is the problem with?", value: "", status: "unknown" },
      { key: "location", label: "City / state", value: "", status: "unknown" },
      { key: "amount", label: "Amount involved", value: "", status: "unknown" },
      { key: "keyDates", label: "Key dates", value: "", status: "unknown" },
      { key: "triedSoFar", label: "What you have tried so far", value: "", status: "unknown" },
      { key: "outcome", label: "Outcome you want", value: "", status: "unknown" },
    ],
    timeline: [],
    evidence: [
      { item: "Contract, agreement or terms you accepted", have: false },
      { item: "Proof of payment or transaction", have: false },
      { item: "Messages, emails or call records", have: false },
      { item: "Photos, documents or witnesses", have: false },
    ],
    missing: [],
  },
  // Placeholder follow-up questions used until the backend is connected.
  mockReplies: [
    {
      role: "assistant",
      text: "Thanks. To organise your case I need the basics: who is the problem with, what happened and when, and how much money is involved?",
      sources: [],
      caution: CAUTION,
    },
    {
      role: "assistant",
      text: "Understood. What outcome do you want, and what have you already tried, for example messages, calls or a complaint?",
      sources: [],
      caution: CAUTION,
    },
    {
      role: "assistant",
      text: "Thank you. What documents or proof do you have, such as a contract, receipts, emails or messages? Tick them in the evidence checklist. If you received a notice or there is a deadline, tell me the date.",
      sources: [],
      caution: CAUTION,
    },
  ],
};