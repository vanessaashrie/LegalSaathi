import { useState } from "react";
import ChatPanel from "./ChatPanel";
import CasePanel from "./CasePanel";
import { initialCase, initialMessages, mockReply } from "../mockData";

export default function Consultation({ onBack, onDocument }) {
  // Shared state: both panels read and change this
  const [messages, setMessages] = useState(initialMessages);
  const [caseFile, setCaseFile] = useState(initialCase);
  const [thinking, setThinking] = useState(false);

  function handleSend(text) {
    setMessages((prev) => [...prev, { role: "user", text, sources: [] }]);
    setThinking(true);
    // Fake delay and fake reply. Replaced by a backend call in Phase 5.
    setTimeout(() => {
      setMessages((prev) => [...prev, mockReply]);
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <button onClick={onBack} className="text-sm text-indigo-700 underline">
          Back to home
        </button>
        <span className="text-lg font-semibold">LegalSaathi</span>
        <button
          onClick={onDocument}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Draft a notice
        </button>
      </header>

      <p className="mx-auto max-w-6xl px-4 pb-3 text-xs text-amber-800">
        Mock data: replies and case details below are placeholders until the AI
        is connected.
      </p>

      <main className="mx-auto grid max-w-6xl gap-4 px-4 pb-8 lg:grid-cols-2">
        <ChatPanel messages={messages} onSend={handleSend} thinking={thinking} />
        <CasePanel
          caseFile={caseFile}
          onEditField={handleEditField}
          onToggleEvidence={handleToggleEvidence}
        />
      </main>
    </div>
  );
}