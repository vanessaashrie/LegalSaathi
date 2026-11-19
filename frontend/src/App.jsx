import { useState } from "react";

// Where the backend lives. Later, deployment will override this with an env variable.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function App() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function checkBackend() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/health`);
      if (!res.ok) throw new Error(`Server replied ${res.status}`);
      setResult(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-semibold text-slate-900">LegalSaathi</h1>
        <p className="mt-1 text-sm text-slate-600">
          Frontend to backend connection test
        </p>

        <button
          onClick={checkBackend}
          disabled={loading}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Checking..." : "Check backend"}
        </button>

        {result && (
          <pre className="mt-4 overflow-x-auto rounded bg-green-50 p-3 text-sm text-green-900">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
        {error && (
          <p className="mt-4 rounded bg-red-50 p-3 text-sm text-red-800">
            Could not reach the backend: {error}
          </p>
        )}
      </div>
    </main>
  );
}