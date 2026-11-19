export default function Landing({ onStart }) {
  const steps = [
    {
      title: "Tell your story",
      body: "Describe what happened in your own words. The assistant asks only for what is missing.",
    },
    {
      title: "Review your case file",
      body: "Your story becomes a structured case: dates, amounts, evidence. You can correct anything.",
    },
    {
      title: "Understand where you stand",
      body: "Plain-language explanation. Legal sources are shown only where we have verified ones.",
    },
    {
      title: "Get a draft notice",
      body: "Generate an editable notice from your facts. Missing details are flagged.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <span className="text-xl font-semibold">LegalSaathi</span>
        <span className="text-sm text-slate-500">Prototype</span>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-16">
        <section className="py-10">
          <h1 className="max-w-3xl text-4xl font-bold leading-tight">
            Got a legal problem and not sure what to do next?
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            LegalSaathi helps you turn your story into an organised case,
            understand where you stand, and prepare a formal notice, in plain
            language. Describe any problem: a deposit, a refund, unpaid salary,
            a notice you received.
          </p>
          <button
            onClick={onStart}
            className="mt-6 rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            Start consultation
          </button>
        </section>

        <section className="py-8">
          <h2 className="text-2xl font-semibold">How it works</h2>
          <ol className="mt-4 grid gap-4 sm:grid-cols-2">
            {steps.map((s, i) => (
              <li key={s.title} className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-indigo-600">Step {i + 1}</p>
                <h3 className="mt-1 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="grid gap-4 py-4 sm:grid-cols-2">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
              Verified sources
            </span>
            <p className="mt-2 text-sm text-slate-600">
              For topics we have checked against official text (currently
              rental security deposits), explanations cite their sources and the
              date they were checked.
            </p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
              General mode
            </span>
            <p className="mt-2 text-sm text-slate-600">
              For every other problem we organise your facts, ask what is
              missing and draft a notice from your facts. We do not quote laws,
              because we have no verified sources for those topics. A lawyer is
              always recommended.
            </p>
          </div>
        </section>

        <section className="py-4 text-sm text-slate-600">
          <h2 className="font-semibold text-slate-900">Not covered</h2>
          <p className="mt-1">
            Predicting court outcomes, criminal matters, and urgent situations
            involving arrest, violence or court deadlines. For those, contact a
            lawyer or your District Legal Services Authority right away.
          </p>
        </section>

        <section
          className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900"
          role="note"
        >
          <h2 className="font-semibold">Please read</h2>
          <p className="mt-1">
            LegalSaathi is an AI tool, not a lawyer, and it does not give legal
            advice. It can make mistakes. Anything it drafts should be checked
            by a qualified lawyer before you rely on it, especially if a court
            notice, a deadline, or a large amount is involved. This prototype
            does not store your conversation on a server, but do not enter
            sensitive identity numbers.
          </p>
        </section>
      </main>
    </div>
  );
}