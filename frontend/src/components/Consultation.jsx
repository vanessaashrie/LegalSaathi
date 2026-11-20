
import { useState } from "react";
import ChatPanel from "./ChatPanel";
import CasePanel from "./CasePanel";
import { sendChat } from "../api";
import { domains } from "../domains";
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
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState("");
  const [lastUserMessage, setLastUserMessage] = useState("");

  // Always use the string ID, never the complete domain object.
  const domainId = domain?.id || "general";

  const currentDomain = domains[domainId] || domains.general;

  function mergeCaseFiles(current, incoming) {
    if (!incoming) return current;

    const currentFields = current?.fields || [];

    const fields = (incoming.fields || []).map((newField) => {
      const existing = currentFields.find(
        (field) => field.key === newField.key
      );

      if (
        existing &&
        ["edited", "confirmed"].includes(existing.status)
      ) {
        return existing;
      }

      return newField;
    });

    const currentEvidence = current?.evidence || [];

    const evidence = (incoming.evidence || []).map((newItem) => {
      const existing = currentEvidence.find(
        (item) => item.item === newItem.item
      );

      return existing?.have ? existing : newItem;
    });

    return {
      ...incoming,
      fields,
      evidence,
      timeline: incoming.timeline || current?.timeline || [],
      missing: incoming.missing || [],
    };
  }

  async function handleSend(text) {
    const clean = text.trim();

    if (!clean || thinking) return;

    setError("");
    setLastUserMessage(clean);
    setThinking(true);
    setSlow(false);

    const updatedMessages = [
      ...messages,
      { role: "user", text: clean },
    ];

    setMessages(updatedMessages);

    // Domain detection: general can become specific.
    let nextDomainId = domainId;

    if (domainId === "general") {
      const detected = detectDomain(clean);

      if (
        detected &&
        detected !== "general" &&
        domains[detected]
      ) {
        nextDomainId = detected;
        onSwitchDomain(domains[detected]);
      }
    }

    const selectedDomain =
      domains[nextDomainId] || domains.general;

    const initialCase = selectedDomain.initialCase || {};

    // Build the request case file while preserving existing data.
    const requestCaseFile = {
      ...initialCase,
      ...caseFile,

      fields: (initialCase.fields || []).map((initialField) => {
        const existing = (caseFile?.fields || []).find(
          (field) => field.key === initialField.key
        );

        return existing || initialField;
      }),

      timeline:
        caseFile?.timeline || initialCase.timeline || [],

      evidence: (initialCase.evidence || []).map((initialItem) => {
        const existing = (caseFile?.evidence || []).find(
          (item) => item.item === initialItem.item
        );

        return existing || initialItem;
      }),

      missing: caseFile?.missing || [],
    };

    setCaseFile(requestCaseFile);

    try {
      const response = await sendChat({
        domain_id: nextDomainId,
        messages: updatedMessages.slice(-40),
        case_file: requestCaseFile,
      });

      if (
        response.domain_id &&
        response.domain_id !== nextDomainId &&
        domains[response.domain_id]
      ) {
        onSwitchDomain(domains[response.domain_id]);
      }

      setCaseFile((current) =>
        mergeCaseFiles(current, response.case_file)
      );

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text:
            response.reply?.text ||
            "I couldn't generate a response. Please try again.",
          sources: response.reply?.sources || [],
          caution: response.reply?.caution || "",
          needs_lawyer: response.reply?.needs_lawyer || false,
          escalation_reasons:
            response.reply?.escalation_reasons || [],
        },
      ]);
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong while contacting LegalSaathi."
      );
    } finally {
      setThinking(false);
      setSlow(false);
    }
  }

  function handleRetry() {
    if (!lastUserMessage || thinking) return;

    const messageToRetry = lastUserMessage;

    setMessages((current) => {
      const updated = [...current];

      if (updated[updated.length - 1]?.role === "user") {
        updated.pop();
      }

      return updated;
    });

    handleSend(messageToRetry);
  }

  function handleSubmitDetails() {
    const editedFields = (caseFile?.fields || []).filter(
      (field) => field.status === "edited"
    );

    if (editedFields.length === 0) return;

    const confirmedFields = (caseFile.fields || []).map((field) =>
      field.status === "edited"
        ? { ...field, status: "confirmed" }
        : field
    );

    setCaseFile((current) => ({
      ...current,
      fields: confirmedFields,
    }));

    const summary = editedFields
      .map((field) => `${field.label}: ${field.value}`)
      .join("\n");

    handleSend(
      `I have reviewed and confirmed these case details:\n${summary}`
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-indigo-700">
              LegalSaathi
            </h1>
            <p className="text-xs text-slate-500">
              Your legal problem, organised.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onBack}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Back
            </button>

            <button
              onClick={onDocument}
              className="rounded-lg border border-indigo-200 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
            >
              Draft a notice
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-3">
        <p className="text-sm font-semibold text-slate-700">
          {currentDomain.name}
        </p>
        <p className="text-xs text-slate-500">
          AI-powered legal problem organisation
        </p>
      </div>

      {/* Persistent legal disclaimer */}
      <div className="mx-auto max-w-6xl px-4 pb-3">
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          <p className="mb-1 font-semibold">
            Important: Please read before proceeding
          </p>

          <p>
            LegalSaathi is an AI assistant, not a lawyer.
            Its responses may be incomplete or inaccurate
            and are not a substitute for professional legal
            advice. Verify legal information with official
            sources and consult a qualified lawyer before
            taking legal action.
          </p>

          <p className="mt-2">
            Legal sources are not currently connected. You
            can check central legislation at{" "}
            <a
              href="https://www.indiacode.nic.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline"
            >
              India Code
            </a>.
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 pb-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChatPanel
            messages={messages}
            onSend={handleSend}
            thinking={thinking}
            slow={slow}
            error={error}
            onRetry={handleRetry}
            suggestions={currentDomain.suggestions}
          />
        </div>

        <div className="lg:col-span-1">
          <CasePanel
            caseFile={caseFile}
            setCaseFile={setCaseFile}
            onSubmit={handleSubmitDetails}
          />
        </div>
      </div>
    </main>
  );
}
