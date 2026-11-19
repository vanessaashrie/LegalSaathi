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
      title: "Understand your options",
      body: "Get a plain-language explanation, with the sources it comes from.",
    },
    {
      title: "Get a draft notice",
      body: "Generate an editable refund-demand notice using your facts. Missing details are flagged.",
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
            Landlord not returning your security deposit?
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            LegalSaathi helps you turn your story into an organised case,
            understand where you stand, and prepare a formal notice, in plain
            language.
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
                <p className="text-sm font-medium text-indigo-600">
                  Step {i + 1}
                </p>
                <h3 className="mt-1 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="grid gap-4 py-8 sm:grid-cols-2">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="font-semibold">What it covers</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
              <li>Residential rental security deposit disputes</li>
              <li>Building a case from your description</li>
              <li>Plain-language options, with cited sources</li>
              <li>A draft refund-demand notice</li>
            </ul>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="font-semibold">What it does not cover</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
              <li>Commercial leases, eviction, or criminal matters</li>
              <li>Consumer and employment disputes (not yet)</li>
              <li>Predicting court outcomes</li>
              <li>Every state's rules: law varies by state and agreement</li>
            </ul>
          </div>
        </section>

        <section
          className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900"
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