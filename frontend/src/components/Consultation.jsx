
import { useState } from "react";
import ChatPanel from "./ChatPanel";
import CasePanel from "./CasePanel";
import { sendChat } from "../api";
import { domains, detectDomain } from "../domains";

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

  async function handleSend(text, updatedCaseFile = caseFile) {
    if (thinking || !text.trim()) return;

    // STEP 1: Detect the specific domain BEFORE sending the request.
    let activeDomain = domain;

    if (domain.id === "general") {
      const detected = detectDomain(text);

      if (detected && detected.id !== "general") {
        activeDomain = detected;
        onSwitchDomain(detected);
      }
    }

    // STEP 2: Prepare the correct domain-specific case file.
    // This ensures rental fields exist even on the first message.
    const initialCase = activeDomain.initialCase;

    const existingFields = new Map(
      (updatedCaseFile.fields || []).map((field) => [
        field.key,
        field,
      ])
    );

    const existingEvidence = new Map(
      (updatedCaseFile.evidence || []).map((item) => [
        item.item,
        item,
      ])
    );

    const requestCaseFile = {
      ...initialCase,
      ...updatedCaseFile,

      fields: initialCase.fields.map((field) => {
        const existing = existingFields.get(field.key);
        return existing || field;
      }),

      // Preserve manually checked evidence.
      evidence: initialCase.evidence.map((item) => {
        const existing = existingEvidence.get(item.item);
        return existing || item;
      }),

      timeline: updatedCaseFile.timeline || [],
      missing: updatedCaseFile.missing || [],
    };

    // STEP 3: Add the user's message to the conversation.
    const updatedMessages = [
      ...messages,
      { role: "user", text, sources: [] },
    ];

    setMessages(updatedMessages);
    setThinking(true);

    try {
      // STEP 4: Send the detected domain and correct case file.
      const data = await sendChat({
        domainId: activeDomain.id,
        messages: updatedMessages,
        caseFile: requestCaseFile,
      });

      // STEP 5: Use the domain returned by the backend.
      const detectedDomain = domains[data.domain_id];

      if (detectedDomain && detectedDomain.id !== activeDomain.id) {
        activeDomain = detectedDomain;
        onSwitchDomain(detectedDomain);
      }

      // STEP 6: Apply the backend's updated case file.
      // Never overwrite locally edited or confirmed fields.
      if (data.case_file) {
        setCaseFile((previous) => {
          const localFields = new Map(
            previous.fields.map((field) => [
              field.key,
              field,
            ])
          );

          const returnedFields = (
            data.case_file.fields || []
          ).map((field) => {
            const local = localFields.get(field.key);

            if (
              local &&
              (local.status === "edited" ||
                local.status === "confirmed")
            ) {
              return local;
            }

            return field;
          });

          const returnedKeys = new Set(
            returnedFields.map((field) => field.key)
          );

          const extraLocalFields = previous.fields.filter(
            (field) => !returnedKeys.has(field.key)
          );

          // Preserve locally checked evidence.
          const localEvidence = new Map(
            previous.evidence.map((item) => [
              item.item,
              item,
            ])
          );

          const returnedEvidence = (
            data.case_file.evidence || []
          ).map((item) => {
            const local = localEvidence.get(item.item);
            return local?.have ? local : item;
          });

          const evidenceNames = new Set(
            returnedEvidence.map((item) => item.item)
          );

          const extraEvidence = previous.evidence.filter(
            (item) => !evidenceNames.has(item.item)
          );

          return {
            ...data.case_file,
            fields: [
              ...returnedFields,
              ...extraLocalFields,
            ],
            evidence: [
              ...returnedEvidence,
              ...extraEvidence,
            ],
          };
        });
      }

      // STEP 7: Display the actual Gemini response.
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          ...data.reply,
        },
      ]);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: `I couldn't process your message. ${error.message}`,
          sources: [],
          caution:
            "Please try again. Your message has not been successfully processed.",
        },
      ]);
    } finally {
      setThinking(false);
    }
  }

  // Typing marks a field as edited.
  // Clearing it makes the field unknown.
  function handleEditField(key, value) {
    setCaseFile((prev) => ({
      ...prev,
      fields: prev.fields.map((field) =>
        field.key === key
          ? {
              ...field,
              value,
              status:
                value.trim() === "" ? "unknown" : "edited",
            }
          : field
      ),
    }));
  }

  // Allow users to manually check or uncheck evidence.
  function handleToggleEvidence(index) {
    setCaseFile((prev) => ({
      ...prev,
      evidence: prev.evidence.map((item, i) =>
        i === index
          ? { ...item, have: !item.have }
          : item
      ),
    }));
  }

  // Confirm edited fields and send the details to Gemini.
  function handleSubmitCase() {
    const edited = caseFile.fields.filter(
      (field) => field.status === "edited"
    );

    if (edited.length === 0 || thinking) return;

    const lines = edited.map(
      (field) => `- ${field.label}: ${field.value}`
    );

    const have = caseFile.evidence
      .filter((item) => item.have)
      .map((item) => item.item);

    let text =
      "I have updated my case details:\n" +
      lines.join("\n");

    if (have.length > 0) {
      text += "\nEvidence I have: " + have.join("; ");
    }

    const confirmedCaseFile = {
      ...caseFile,
      fields: caseFile.fields.map((field) =>
        field.status === "edited"
          ? { ...field, status: "confirmed" }
          : field
      ),
    };

    setCaseFile(confirmedCaseFile);
    handleSend(text, confirmedCaseFile);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <button
          onClick={onBack}
          className="text-sm text-indigo-700 underline"
        >
          Back to home
        </button>

        <div className="text-center">
          <p className="text-lg font-semibold">LegalSaathi</p>
          <p className="text-xs text-slate-600">
            Topic: {domain.name}
          </p>
        </div>

        <button
          onClick={onDocument}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Draft a notice
        </button>
      </header>

      <div className="mx-auto max-w-6xl px-4 pb-3">
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
          {domain.tierLabel}
        </span>

        <span className="ml-3 text-xs text-green-700">
          AI-powered consultation
        </span>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-3">
        <details className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          <summary className="cursor-pointer font-medium">
            Legal sources and caution
          </summary>

          <div className="mt-2 space-y-2">
            <p>
              LegalSaathi is an AI tool, not a lawyer. It can be
              wrong, and it cannot guarantee any outcome.
            </p>

            <p>
              <span className="font-semibold">Sources:</span>{" "}
              Legal sources are not connected yet. No legal
              claim should be treated as verified until a
              source is provided and checked.
            </p>

            <p>
              <span className="font-semibold">
                Check for yourself:
              </span>{" "}
              India Code publishes central legislation at{" "}
              <a
                href="https://www.indiacode.nic.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                indiacode.nic.in
              </a>
              . State laws and rules are published by each
              state government.
            </p>

            <p>
              <span className="font-semibold">
                Talk to a lawyer
              </span>{" "}
              if you have received a court notice, there is a
              deadline, the amount is large, or there is any
              risk of arrest or violence. Free legal aid may
              be available through your District Legal
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
