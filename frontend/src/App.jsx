import { useState } from "react";
import Landing from "./components/Landing";
import Consultation from "./components/Consultation";

export default function App() {
  // Which screen is showing: "landing" | "consult" | "document"
  const [view, setView] = useState("landing");

  if (view === "landing") {
    return <Landing onStart={() => setView("consult")} />;
  }

  if (view === "consult") {
    return (
      <Consultation
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