// Notice templates. They only use facts from the case file.
// They contain no legal sections, acts or case citations on purpose.

const HEADER =
  "DRAFT - AI-generated. Have a qualified lawyer check this before you send it. Delete this line when final.";

const missing = (label) => `[MISSING: ${label}]`;

// Read a case-file field; show a visible placeholder if it is empty
function get(caseFile, key, label) {
  const f = caseFile.fields.find((x) => x.key === key);
  const value = f && f.value ? f.value.trim() : "";
  return value || missing(label);
}

function enclosures(caseFile) {
  const have = caseFile.evidence
    .filter((e) => e.have)
    .map((e, i) => `${i + 1}. ${e.item}`);
  return have.length > 0
    ? have.join("\n")
    : missing("list of documents you are enclosing, if any");
}

function today() {
  return new Date().toLocaleDateString("en-IN");
}

function rentalDepositNotice(c) {
  const deposit = get(c, "deposit", "deposit amount");
  return `${HEADER}

Date: ${today()}
Place: ${get(c, "location", "city")}

To,
${missing("landlord's name and address")}

From,
${missing("your name and address")}

Subject: Request for refund of security deposit of ${deposit}

Dear ${missing("landlord's name")},

I was a tenant at ${missing("property address")}. My tenancy began on ${get(c, "tenancyStart", "tenancy start date")}. Rental agreement: ${get(c, "agreement", "whether you have a written agreement")}.

I paid a security deposit of ${deposit}. I vacated the property on ${get(c, "moveOut", "move-out date")}.

Since then: ${get(c, "response", "landlord's response")}.

Deductions claimed by you: ${get(c, "deductions", "deductions claimed by landlord, if any")}.

I request you to refund the security deposit of ${deposit} within ${missing("number of days, for example 15")} days of receiving this letter, to ${missing("your bank account or payment details for the refund")}.

If the deposit is not refunded, I may take further steps available to me.

Yours sincerely,
${missing("your name")}
${missing("phone number or email")}

Enclosures:
${enclosures(c)}
`;
}

function generalNotice(c) {
  const other = get(c, "otherParty", "who the problem is with");
  return `${HEADER}

Date: ${today()}
Place: ${get(c, "location", "city")}

To,
${other}
${missing("their address")}

From,
${missing("your name and address")}

Subject: Notice regarding ${get(c, "problemType", "kind of problem")}

Dear ${other},

I am writing about the following matter: ${get(c, "problemType", "kind of problem")}.

Amount involved: ${get(c, "amount", "amount involved")}.
Key dates: ${get(c, "keyDates", "key dates")}.
Steps I have already taken: ${get(c, "triedSoFar", "what you have tried so far")}.

What I am asking for: ${get(c, "outcome", "outcome you want")}.

Please resolve this within ${missing("number of days, for example 15")} days of receiving this letter.

If this is not resolved, I may take further steps available to me.

Yours sincerely,
${missing("your name")}
${missing("phone number or email")}

Enclosures:
${enclosures(c)}
`;
}

const templates = {
  rentalDeposit: rentalDepositNotice,
  general: generalNotice,
};

export function generateNotice(domain, caseFile) {
  const build = templates[domain.id] || generalNotice;
  return build(caseFile);
}