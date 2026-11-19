import { useEffect, useRef, useState } from "react";

const SUGGESTIONS = [
  "My landlord won't return my deposit",
  "I have no written agreement",
  "What can I do next?",
];

export default function ChatPanel({ messages, onSend, thinking }) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef(null);

  // Keep the newest message in view
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  function send(text) {
    const clean = text.trim();
    if (!clean || thinking) return;
    onSend(clean);
    setDraft("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    send(draft);
  }

  return (
    <section
      className="flex h-[75vh] flex-col rounded-xl bg-white shadow-sm"
      aria-label="Conversation"
    >
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={
                m.role === "user"
                  ? "max-w-[85%] rounded-2xl bg-indigo-600 px-4 py-2 text-white"
                  : "max-w-[85%] rounded-2xl bg-slate-100 px-4 py-2 text-slate-900"
              }
            >
              <p className="whitespace-pre-wrap text-sm">{m.text}</p>

              {m.sources && m.sources.length > 0 && (
                <div className="mt-2 border-t border-slate-300 pt-2">
                  <p className="text-xs font-semibold text-slate-600">Sources</p>
                  <ul className="mt-1 space-y-1">
                    {m.sources.map((s) => (
                      <li key={s.id} className="text-xs text-slate-600">
                        {s.title} | {s.section} | {s.jurisdiction} | verified:{" "}
                        {s.verified_on}{" "}
                        <a href={s.url} className="text-indigo-700 underline">
                          link
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        {thinking && (
          <p className="text-sm text-slate-500" role="status">
            LegalSaathi is thinking...
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-slate-200 p-3">
        <div className="mb-2 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
            >
              {s}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Describe what happened..."
            aria-label="Your message"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            disabled={thinking}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </section>
  );
}