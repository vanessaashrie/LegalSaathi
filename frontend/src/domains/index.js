import rentalDeposit from "./rentalDeposit";
import general from "./general";

// Registry: add a new pack here and the app can switch to it.
export const domains = { rentalDeposit, general };

// MOCK topic detector (keyword matching), used until the backend is connected.
// The real version (Phase 5) uses rules + the LLM + whether a verified
// source was actually retrieved.
const RULES = [
  {
    id: "rentalDeposit",
    pattern: /\b(deposit|landlord|tenant|tenancy|rented|rental|lease)\b/i,
  },
];

export function detectDomain(text) {
  for (const rule of RULES) {
    if (rule.pattern.test(text)) return domains[rule.id];
  }
  return domains.general;
}