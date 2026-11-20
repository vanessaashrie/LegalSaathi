import { useState } from "react";
import ChatPanel from "./ChatPanel";
import CasePanel from "./CasePanel";
import { detectDomain } from "../domains";

export default function Consultation({
  domain,
  messages,
  setMessages,
  caseFile,
  setCaseFile,
  onSwitchDomain,
  onBack,
  onDocument,
}) {
  const [thinking, setThinking] = useState(false);

  function handleSend(text) {
    // How many user messages came before this one: picks the next placeholder reply
    const userCount = messages.filter((m) => m.role === "user").length;

    setMessages((prev) => [...prev, { role: "user", text, sources: [] }]);

    // Mock topic detection: only move from general to a more specific pack
    const detected = detectDomain(text);
    let active = domain;
    if (domain.id === "general" && detected.id !== "general") {
      active = detected;
      onSwitchDomain(detected);
    }

    const reply = active.mockReplies[userCount % active.mockReplies.length];

    setThinking(true);
    // Fake delay and fake reply. Replaced by a backend call in Phase 5.
    setTimeout(() => {
      setMessages((prev) => [...prev, reply]);
      setThinking(false);
    }, 800);
  }

  // Typing marks a field "edited" (not yet submitted); clearing it makes it "unknown"
  function handleEditField(key, value) {
    setCaseFile((prev) => ({
      ...prev,
      fields: prev.fields.map((f) =>
        f.key === key
          ? { ...f, value, status: value.trim() === "" ? "unknown" : "edited" }
          : f
      ),
    }));
  }

  function handleToggleEvidence(index) {
    setCaseFile((prev) => ({
      ...prev,
      evidence: prev.evidence.map((e, i) =>
        i === index ? { ...e, have: !e.have } : e
      ),
    }));
  }

  // Confirm the edited fields and tell the assistant about them
  function handleSubmitCase() {
    const edited = caseFile.fields.filter((f) => f.status === "edited");
    if (edited.length === 0 || thinking) return;

    const lines = edited.map((f) => `- ${f.label}: ${f.value}`);
    const have = caseFile.evidence.filter((e) => e.have).map((e) => e.item);
    let text = "I have updated my case details:\n" + lines.join("\n");
    if (have.length > 0) {
      text += "\nEvidence I have: " + have.join("; ");
    }

    setCaseFile((prev) => ({
      ...prev,
      fields: prev.fields.map((f) =>
        f.status === "edited" ? { ...f, status: "confirmed" } : f
      ),
    }));
    handleSend(text);
  }

  const isVerified = domain.tier === "verified";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <button onClick={onBack} className="text-sm text-indigo-700 underline">
          Back to home
        </button>
        <div className="text-center">
          <p className="text-lg font-semibold">LegalSaathi</p>
          <p className="text-xs text-slate-600">Topic: {domain.name}</p>
        </div>
        <button
          onClick={onDocument}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Draft a notice
        </button>
      </header>

      <div className="mx-auto max-w-6xl px-4 pb-3">
        <span
          className={
            isVerified
              ? "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
              : "rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700"
          }
        >
          {domain.tierLabel}
        </span>
        <span className="ml-3 text-xs text-amber-800">
          Mock data: replies are placeholders until the AI is connected.
        </span>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-3">
        <details className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          <summary className="cursor-pointer font-medium">
            Legal sources and caution
          </summary>
          <div className="mt-2 space-y-2">
            <p>
              LegalSaathi is an AI tool, not a lawyer. It can be wrong, and it
              cannot guarantee any outcome.
            </p>
            <p>
              <span className="font-semibold">How sources will appear:</span>{" "}
              each legal point is shown with its source: title, section,
              whether it is central or state law, a link, and the date we last
              checked it. A point with no verified source is labelled
              unverified. Right now no sources are connected.
            </p>
            <p>
              <span className="font-semibold">Check for yourself:</span> India
              Code publishes central legislation at{" "}
              <a
                href="https://www.indiacode.nic.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                indiacode.nic.in
              </a>
              . State laws and rules are published by each state government.
              Laws change, so confirm the current version.
            </p>
            <p>
              <span className="font-semibold">Talk to a lawyer</span> if you
              have received a court notice, there is a deadline, the amount is
              large, or there is any risk of arrest or violence. If cost is a
              problem, free legal aid is available through your District Legal
              Services Authority.
            </p>
          </div>
        </details>
      </div>

      <main className="mx-auto grid max-w-6xl gap-4 px-4 pb-8 lg:grid-cols-2">
        <ChatPanel
          messages={messages}
          onSend={handleSend}
          thinking={thinking}
          suggestions={domain.suggestions}
        />
        <CasePanel
          caseFile={caseFile}
          onEditField={handleEditField}
          onToggleEvidence={handleToggleEvidence}
          onSubmit={handleSubmitCase}
          disabled={thinking}
        />
      </main>
    </div>
  );
}