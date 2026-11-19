// Mock data used until the backend is connected.
// The shape of initialCase is the shape the backend will return later.

export const initialMessages = [
  {
    role: "assistant",
    text: "Hello, I'm LegalSaathi. Tell me what happened with your security deposit, in your own words. I will ask about anything that is missing.",
    sources: [],
  },
];

export const initialCase = {
  // status: "user_stated" | "needs_confirmation" | "unknown" | "confirmed"
  fields: [
    { key: "location", label: "City / state", value: "Bengaluru, Karnataka", status: "user_stated" },
    { key: "deposit", label: "Deposit amount", value: "Rs. 30,000", status: "user_stated" },
    { key: "moveOut", label: "Move-out date", value: "About two weeks ago", status: "needs_confirmation" },
    { key: "agreement", label: "Written rental agreement", value: "", status: "unknown" },
    { key: "response", label: "Landlord's response", value: "Not returning deposit, not answering calls", status: "user_stated" },
    { key: "deductions", label: "Deductions claimed by landlord", value: "", status: "unknown" },
  ],
  timeline: [
    { date: "Date unknown", event: "Paid Rs. 30,000 security deposit", status: "user_stated" },
    { date: "About 2 weeks ago", event: "Vacated the apartment", status: "needs_confirmation" },
    { date: "Since then", event: "Landlord refuses to return deposit and does not respond to calls", status: "user_stated" },
  ],
  evidence: [
    { item: "Rental agreement", have: false },
    { item: "Proof of deposit payment (bank transfer, receipt)", have: false },
    { item: "Messages or call records with the landlord", have: false },
    { item: "Move-out photos or handover proof", have: false },
  ],
  missing: [
    "Exact move-out date",
    "Whether a written agreement exists and what it says about the deposit",
    "Whether the landlord gave any reason or claimed deductions",
    "Whether you gave notice before leaving",
  ],
};

// A fake assistant reply. Source details are PLACEHOLDERS, not real citations.
export const mockReply = {
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
};