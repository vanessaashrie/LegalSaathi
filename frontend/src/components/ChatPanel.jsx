
import { useEffect, useRef, useState } from "react";

export default function ChatPanel({
  messages,
  onSend,
  thinking,
  slow,
  error,
  onRetry,
  suggestions,
}) {
  const [draft, setDraft] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceReplies, setVoiceReplies] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("");

  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);
  const lastSpokenRef = useRef("");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking, error]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Speak new assistant responses when voice replies are enabled.
  useEffect(() => {
    if (!voiceReplies || !("speechSynthesis" in window)) return;

    const lastMessage = messages[messages.length - 1];

    if (
      !lastMessage ||
      lastMessage.role !== "assistant" ||
      !lastMessage.text ||
      lastMessage.text === lastSpokenRef.current
    ) {
      return;
    }

    lastSpokenRef.current = lastMessage.text;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(
      lastMessage.text
    );

    utterance.lang = "en-IN";
    utterance.rate = 1;

    window.speechSynthesis.speak(utterance);
  }, [messages, voiceReplies]);

  function send(text) {
    const clean = text.trim();

    if (!clean || thinking) return;

    recognitionRef.current?.stop();
    setListening(false);
    setVoiceStatus("");

    onSend(clean);
    setDraft("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    send(draft);
  }

  function toggleListening() {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceStatus(
        "Voice input is not supported in this browser. Please try Chrome."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
      setVoiceStatus("Listening... Speak now.");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;

      setDraft((previous) =>
        previous
          ? `${previous} ${transcript}`
          : transcript
      );

      setVoiceStatus(
        "Voice captured. Review your message and press Send."
      );
    };

    recognition.onerror = () => {
      setVoiceStatus(
        "Could not capture speech. Please check microphone permission and try again."
      );

      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setListening(false);
      setVoiceStatus(
        "Unable to start the microphone. Please try again."
      );
    }
  }

  function toggleVoiceReplies() {
    if (!("speechSynthesis" in window)) {
      setVoiceStatus(
        "Spoken replies are not supported in this browser."
      );
      return;
    }

    setVoiceReplies((previous) => {
      const next = !previous;

      if (!next) {
        window.speechSynthesis.cancel();
      }

      return next;
    });
  }

  return (
    <section
      className="flex h-[75vh] flex-col rounded-xl bg-white shadow-sm"
      aria-label="Conversation"
    >
      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={
              message.role === "user"
                ? "flex justify-end"
                : "flex justify-start"
            }
          >
            <div
              className={
                message.role === "user"
                  ? "max-w-[85%] rounded-2xl bg-indigo-600 px-4 py-2 text-white"
                  : "max-w-[85%] rounded-2xl bg-slate-100 px-4 py-2 text-slate-900"
              }
            >
              <p className="whitespace-pre-wrap text-sm">
                {message.text}
              </p>

              {message.sources &&
                message.sources.length > 0 && (
                  <div className="mt-2 border-t border-slate-300 pt-2">
                    <p className="text-xs font-semibold text-slate-600">
                      Sources
                    </p>

                    <ul className="mt-1 space-y-1">
                      {message.sources.map((source) => (
                        <li
                          key={source.id}
                          className="text-xs text-slate-600"
                        >
                          {source.title} | {source.section} |{" "}
                          {source.jurisdiction} | verified:{" "}
                          {source.verified_on}{" "}
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-700 underline"
                          >
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
            {slow
              ? "The server may be waking up. This can take up to 30 seconds..."
              : "LegalSaathi is thinking..."}
          </p>
        )}

        {error && (
          <div
            className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800"
            role="alert"
          >
            <p>{error}</p>

            <button
              type="button"
              onClick={onRetry}
              disabled={thinking}
              className="mt-2 rounded bg-red-700 px-3 py-1 text-xs font-medium text-white hover:bg-red-800 disabled:opacity-50"
            >
              Retry
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input and voice controls */}
      <div className="border-t border-slate-200 p-3">
        <div className="mb-2 flex flex-wrap gap-2">
          {(suggestions || []).map((suggestion) => (
            <button
              type="button"
              key={suggestion}
              onClick={() => send(suggestion)}
              disabled={thinking}
              className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Voice controls */}
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={toggleListening}
            disabled={thinking}
            aria-pressed={listening}
            className={`rounded-lg px-3 py-2 text-xs font-medium ${
              listening
                ? "bg-red-100 text-red-700"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {listening
              ? "\u23F9\uFE0F Stop listening"
              : "\uD83C\uDFA4 Speak"}
          </button>

          <button
            type="button"
            onClick={toggleVoiceReplies}
            aria-pressed={voiceReplies}
            className={`rounded-lg px-3 py-2 text-xs font-medium ${
              voiceReplies
                ? "bg-indigo-100 text-indigo-700"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {voiceReplies
              ? "\uD83D\uDD0A Voice replies: On"
              : "\uD83D\uDD07 Voice replies: Off"}
          </button>
        </div>

        {voiceStatus && (
          <p
            className="mb-2 text-xs text-slate-500"
            role="status"
          >
            {voiceStatus}
          </p>
        )}

        {/* Message input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Describe what happened..."
            aria-label="Your message"
            maxLength={4000}
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <button
            type="submit"
            disabled={thinking || !draft.trim()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </section>
  );
}
