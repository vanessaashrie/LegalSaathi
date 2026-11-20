import { useState } from "react";
import Landing from "./components/Landing";
import Consultation from "./components/Consultation";
import DocumentScreen from "./components/DocumentScreen";
import { domains } from "./domains";
import { generateNotice } from "./documents/templates";

export default function App() {
  // Which screen is showing: "landing" | "consult" | "document"
  const [view, setView] = useState("landing");
  // Shared state lives here so it survives switching screens
  const [domain, setDomain] = useState(domains.general);
  const [messages, setMessages] = useState([]);
  const [caseFile, setCaseFile] = useState(domains.general.initialCase);
  const [draft, setDraft] = useState("");

  function startConsultation() {
    const d = domains.general;
    setDomain(d);
    setMessages([{ role: "assistant", text: d.greeting, sources: [] }]);
    setCaseFile(d.initialCase);
    setDraft("");
    setView("consult");
  }

  // Switch to a more specific pack without losing anything the user entered
  function switchDomain(newDomain) {
    setDomain(newDomain);
    setDraft(""); // an old draft would use the wrong template
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

  function openDocument() {
    // Build the first draft once; later edits are kept in `draft`
    if (!draft) setDraft(generateNotice(domain, caseFile));
    setView("document");
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
        onDocument={openDocument}
      />
    );
  }

  return (
    <DocumentScreen
      domain={domain}
      caseFile={caseFile}
      draft={draft}
      setDraft={setDraft}
      onBack={() => setView("consult")}
    />
  );
}