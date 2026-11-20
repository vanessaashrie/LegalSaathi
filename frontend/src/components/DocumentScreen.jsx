import { useState } from "react";
import { generateNotice } from "../documents/templates";

export default function DocumentScreen({ domain, caseFile, draft, setDraft, onBack }) {
  const [status, setStatus] = useState("");

  const missingCount = (draft.match(/\[MISSING:/g) || []).length;

  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(draft);
      setStatus("Copied to clipboard.");
    } catch {
      setStatus("Could not copy automatically. Select the text and copy it.");
    }
  }

  function downloadDraft() {
    const blob = new Blob([draft], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "legalsaathi-draft-notice.txt";
    a.click();
    URL.revokeObjectURL(url);
    setStatus("Downloaded as legalsaathi-draft-notice.txt.");
  }

  function regenerate() {
    const ok = window.confirm(
      "This replaces your edits with a fresh draft from the case file. Continue?"
    );
    if (ok) {
      setDraft(generateNotice(domain, caseFile));
      setStatus("Draft regenerated from your case file.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <button onClick={onBack} className="text-sm text-indigo-700 underline">
          Back to consultation
        </button>
        <div className="text-center">
          <p className="text-lg font-semibold">LegalSaathi</p>
          <p className="text-xs text-slate-600">Draft notice: {domain.name}</p>
        </div>
        <span className="w-32" />
      </header>

      <main className="mx-auto max-w-4xl space-y-4 px-4 pb-10">
        <div
          className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
          role="note"
        >
          <p className="font-semibold">AI-generated draft, not legal advice</p>
          <p className="mt-1">
            This draft only uses the facts in your case file. It can be wrong or
            incomplete. Fill in every [MISSING] item, check the facts, and have
            a qualified lawyer review it before you send it, especially if a
            court notice, a deadline or a large amount is involved.
          </p>
        </div>

        <div className="rounded-xl bg-white p-4 text-sm shadow-sm">
          <p>
            <span className="font-semibold">Legal references used in this draft:</span>{" "}
            none. It names no laws, sections or court cases. If you want to
            add any, check them against official sources such as{" "}
            <a
              href="https://www.indiacode.nic.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-700 underline"
            >
              India Code
            </a>{" "}
            or ask a lawyer.
          </p>
        </div>

        <p
          className={
            missingCount > 0
              ? "text-sm font-medium text-amber-800"
              : "text-sm font-medium text-green-800"
          }
          role="status"
        >
          {missingCount > 0
            ? `${missingCount} detail(s) still missing. Replace each [MISSING: ...] before sending.`
            : "No [MISSING] markers left. Still check every fact before sending."}
        </p>

        <label htmlFor="draft" className="sr-only">
          Draft notice text
        </label>
        <textarea
          id="draft"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="min-h-[60vh] w-full rounded-xl border border-slate-300 bg-white p-4 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={copyDraft}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Copy
          </button>
          <button
            onClick={downloadDraft}
            className="rounded-lg border border-indigo-600 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
          >
            Download (.txt)
          </button>
          <button
            onClick={regenerate}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Regenerate from case file
          </button>
          <span className="text-sm text-slate-600" role="status">
            {status}
          </span>
        </div>
      </main>
    </div>
  );
}