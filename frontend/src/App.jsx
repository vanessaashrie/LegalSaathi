import { useState } from "react";
import Landing from "./components/Landing";
import Consultation from "./components/Consultation";
import { domains } from "./domains";

export default function App() {
  // Which screen is showing: "landing" | "consult" | "document"
  const [view, setView] = useState("landing");
  // Shared state lives here so it survives switching screens
  const [domain, setDomain] = useState(domains.general);
  const [messages, setMessages] = useState([]);
  const [caseFile, setCaseFile] = useState(domains.general.initialCase);

  function startConsultation() {
    const d = domains.general;
    setDomain(d);
    setMessages([{ role: "assistant", text: d.greeting, sources: [] }]);
    setCaseFile(d.initialCase);
    setView("consult");
  }

  // Switch to a more specific pack without losing anything the user entered
  function switchDomain(newDomain) {
    setDomain(newDomain);
    setCaseFile((prev) => {
      const prevByKey = Object.fromEntries(prev.fields.map((f) => [f.key, f]));
      const newKeys = new Set(newDomain.initialCase.fields.map((f) => f.key));

      const merged = newDomain.initialCase.fields.map((f) => {
        const old = prevByKey[f.key];
        return old && old.value ? { ...f, value: old.value, status: old.status } : f;
      });
      const extras = prev.fields.filter((f) => f.value && !newKeys.has(f.key));

      return {
        ...newDomain.initialCase,
        fields: [...merged, ...extras],
        timeline: prev.timeline,
        missing: prev.missing,
      };
    });
  }

  if (view === "landing") {
    return <Landing onStart={startConsultation} />;
  }

  if (view === "consult") {
    return (
      <Consultation
        domain={domain}
        messages={messages}
        setMessages={setMessages}
        caseFile={caseFile}
        setCaseFile={setCaseFile}
        onSwitchDomain={switchDomain}
        onBack={() => setView("landing")}
        onDocument={() => setView("document")}
      />
    );
  }

  // Placeholder until we build the document screen
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="rounded-xl bg-white p-6 shadow">
        <p className="text-slate-700">Document screen coming soon.</p>
        <button
          onClick={() => setView("consult")}
          className="mt-3 text-sm text-indigo-600 underline"
        >
          Back to consultation
        </button>
      </div>
    </main>
  );
}