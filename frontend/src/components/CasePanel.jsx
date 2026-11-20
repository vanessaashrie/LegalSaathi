const STATUS = {
  user_stated: { label: "From your story", style: "bg-blue-100 text-blue-800" },
  needs_confirmation: { label: "Please confirm", style: "bg-amber-100 text-amber-900" },
  unknown: { label: "Not provided", style: "bg-slate-200 text-slate-700" },
  edited: { label: "Edited: not submitted", style: "bg-indigo-100 text-indigo-800" },
  confirmed: { label: "Confirmed by you", style: "bg-green-100 text-green-800" },
};

function Badge({ status }) {
  const s = STATUS[status] || STATUS.unknown;
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.style}`}>
      {s.label}
    </span>
  );
}

export default function CasePanel({
  caseFile,
  onEditField,
  onToggleEvidence,
  onSubmit,
  disabled,
}) {
  const editedCount = caseFile.fields.filter((f) => f.status === "edited").length;

  return (
    <section
      className="h-[75vh] space-y-6 overflow-y-auto rounded-xl bg-white p-4 shadow-sm"
      aria-label="Case file"
    >
      <div>
        <h2 className="text-lg font-semibold">Your case file</h2>
        <p className="text-sm text-slate-600">
          This fills in as you talk. Edit anything that is wrong or missing,
          then press Submit details so the assistant uses it.
        </p>
      </div>

      <div className="space-y-3">
        {caseFile.fields.map((f) => (
          <div key={f.key}>
            <div className="flex items-center justify-between gap-2">
              <label htmlFor={f.key} className="text-sm font-medium">
                {f.label}
              </label>
              <Badge status={f.status} />
            </div>
            <input
              id={f.key}
              value={f.value}
              onChange={(e) => onEditField(f.key, e.target.value)}
              placeholder="Not provided yet"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-semibold">Timeline</h3>
        {caseFile.timeline.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            No events yet. They appear as you describe what happened.
          </p>
        ) : (
          <ol className="mt-2 space-y-2">
            {caseFile.timeline.map((t, i) => (
              <li key={i} className="rounded-lg border border-slate-200 p-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{t.date}</span>
                  <Badge status={t.status} />
                </div>
                <p className="mt-1 text-slate-700">{t.event}</p>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div>
        <h3 className="font-semibold">Evidence checklist</h3>
        <ul className="mt-2 space-y-1">
          {caseFile.evidence.map((e, i) => (
            <li key={i}>
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={e.have}
                  onChange={() => onToggleEvidence(i)}
                  className="mt-1"
                />
                <span>{e.item}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold">Still missing</h3>
        {caseFile.missing.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            Nothing flagged yet. Missing details are listed here as you chat.
          </p>
        ) : (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {caseFile.missing.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="sticky bottom-0 -mx-4 -mb-4 border-t border-slate-200 bg-white p-3">
        <button
          onClick={onSubmit}
          disabled={editedCount === 0 || disabled}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {editedCount > 0 ? `Submit details (${editedCount})` : "Submit details"}
        </button>
        <p className="mt-1 text-xs text-slate-500">
          {editedCount > 0
            ? "Submitting marks these as confirmed by you and sends them to the assistant."
            : "Edit a field above to enable this."}
        </p>
      </div>
    </section>
  );
}