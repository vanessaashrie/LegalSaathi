// Domain pack: residential rental security deposit disputes (tier 1, verified).
// Legal sources for this pack are added in Phase 5 after checking official text.

export default {
  id: "rentalDeposit",
  name: "Rental security deposit",
  tier: "verified",
  tierLabel: "Verified sources",
  tagline: "Landlord not returning your deposit",
  greeting:
    "Hello, I'm LegalSaathi. Tell me what happened with your rental security deposit, in your own words. I will ask about anything that is missing.",
  suggestions: [
    "My landlord won't return my deposit",
    "I have no written agreement",
    "What can I do next?",
  ],
  initialCase: {
    // status: "user_stated" | "needs_confirmation" | "unknown" | "confirmed"
    fields: [
      { key: "location", label: "City / state", value: "", status: "unknown" },
      { key: "deposit", label: "Deposit amount", value: "", status: "unknown" },
      { key: "tenancyStart", label: "Tenancy start date", value: "", status: "unknown" },
      { key: "moveOut", label: "Move-out date", value: "", status: "unknown" },
      { key: "agreement", label: "Written rental agreement", value: "", status: "unknown" },
      { key: "response", label: "Landlord's response", value: "", status: "unknown" },
      { key: "deductions", label: "Deductions claimed by landlord", value: "", status: "unknown" },
    ],
    timeline: [],
    evidence: [
      { item: "Rental agreement", have: false },
      { item: "Proof of deposit payment (bank transfer, receipt)", have: false },
      { item: "Messages or call records with the landlord", have: false },
      { item: "Move-out photos or handover proof", have: false },
    ],
    missing: [],
  },
  // Fake reply used until the backend is connected. Source is a PLACEHOLDER.
  mockReply: {
    role: "assistant",
    text: "Thanks. To understand your position I need a few details. Do you have a written rental agreement, and what does it say about returning the deposit? Also, has the landlord given any reason for keeping it?",
    sources: [
      {
        id: "MOCK-1",
        title: "Placeholder source (mock data)",
        section: "n/a",
        jurisdiction: "n/a",
        url: "#",
        verified_on: "not verified",
      },
    ],
  },
};