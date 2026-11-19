import { useState } from "react";
import Landing from "./components/Landing";

export default function App() {
  // Which screen is showing: "landing" | "consult" | "document"
  const [view, setView] = useState("landing");

  if (view === "landing") {
    return <Landing onStart={() => setView("consult")} />;
  }

  // Placeholder until we build the consultation screen in the next step
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="rounded-xl bg-white p-6 shadow">
        <p className="text-slate-700">Consultation screen coming next.</p>
        <button
          onClick={() => setView("landing")}
          className="mt-3 text-sm text-indigo-600 underline"
        >
          Back to home
        </button>
      </div>
    </main>
  );
}