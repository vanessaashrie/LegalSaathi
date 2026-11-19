// Default pack: general consultation for any legal problem.
// No verified legal sources: it organises facts and drafts from facts only.
// The app switches to a verified pack when it recognises a covered topic.

export default {
  id: "general",
  name: "General consultation",
  tier: "general",
  tierLabel: "General mode: no legal citations",
  tagline: "Any legal problem",
  greeting:
    "Hello, I'm LegalSaathi. Tell me about your legal problem in your own words: a deposit, a refund, unpaid salary, a notice you received, or anything else. I will ask about anything that is missing. For some topics I have verified legal sources and will show them. For others I will tell you clearly that I don't, and I will not quote laws or sections from memory.",
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
  mockReply: {
    role: "assistant",
    text: "Thanks. To organise your case I need the basics: who is the problem with, what happened and when, how much money is involved, and what outcome you want. I don't have verified legal sources for this topic, so I can't tell you which law applies.",
    sources: [],
  },
};