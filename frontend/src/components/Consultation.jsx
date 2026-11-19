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
    setMessages((prev) => [...prev, { role: "user", text, sources: [] }]);

    // Mock topic detection: only move from general to a more specific pack
    const detected = detectDomain(text);
    let active = domain;
    if (domain.id === "general" && detected.id !== "general") {
      active = detected;
      onSwitchDomain(detected);
    }

    setThinking(true);
    // Fake delay and fake reply. Replaced by a backend call in Phase 5.
    setTimeout(() => {
      setMessages((prev) => [...prev, active.mockReply]);
      setThinking(false);
    }, 800);
  }

  function handleEditField(key, value) {
    setCaseFile((prev) => ({
      ...prev,
      fields: prev.fields.map((f) =>
        f.key === key
          ? { ...f, value, status: value.trim() === "" ? "unknown" : "confirmed" }
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
        />
      </main>
    </div>
  );
}