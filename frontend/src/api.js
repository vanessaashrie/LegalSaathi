
// All communication with the backend lives here.

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

const TIMEOUT_MS = 45000;
const MAX_MESSAGES = 40;
const MAX_TEXT = 4000;

export async function sendChat({
  domain_id,
  messages,
  case_file,
}) {
  const payload = {
    domain_id: domain_id || "general",

    messages: messages.slice(-MAX_MESSAGES).map((m) => ({
      role: m.role,
      text: m.text,
    })),

    case_file: case_file,
  };

  if (!payload.case_file) {
    throw new Error(
      "Case information is missing. Please refresh and try again."
    );
  }

  if (
    payload.messages.some(
      (m) => m.text.length > MAX_TEXT
    )
  ) {
    throw new Error(
      `A message is too long (limit ${MAX_TEXT} characters). Please shorten it.`
    );
  }

  const controller = new AbortController();

  const timer = setTimeout(
    () => controller.abort(),
    TIMEOUT_MS
  );

  try {
    const res = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) {
      if (res.status === 422) {
        const details = await res.json().catch(() => null);

        console.error("Backend validation error:", details);

        throw new Error(
          "The request format was rejected by the server. Please check the application data."
        );
      }

      throw new Error(
        `The server returned an error (${res.status}). Please try again.`
      );
    }

    return await res.json();

  } catch (e) {
    if (e.name === "AbortError") {
      throw new Error(
        "The server took too long to respond. It may be waking up. Please try again."
      );
    }

    if (e instanceof TypeError) {
      throw new Error(
        "Could not reach the server. Check that it is running, then try again."
      );
    }

    throw e;

  } finally {
    clearTimeout(timer);
  }
}
