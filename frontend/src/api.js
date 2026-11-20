// All communication with the backend lives here.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Free hosting can take ~30s to wake up, so allow a generous timeout
const TIMEOUT_MS = 45000;
const MAX_MESSAGES = 40;
const MAX_TEXT = 4000;

export async function sendChat({ domainId, messages, caseFile }) {
  const payload = {
    domain_id: domainId,
    // Send only the most recent messages, and only what the API accepts
    messages: messages.slice(-MAX_MESSAGES).map((m) => ({
      role: m.role,
      text: m.text,
    })),
    case_file: caseFile,
  };

  if (payload.messages.some((m) => m.text.length > MAX_TEXT)) {
    throw new Error(
      `A message is too long (limit ${MAX_TEXT} characters). Please shorten it.`
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) {
      if (res.status === 422) {
        throw new Error(
          "The server could not accept that request. Please check your details and try again."
        );
      }
      throw new Error("The server had a problem. Please try again.");
    }
    return await res.json();
  } catch (e) {
    if (e.name === "AbortError") {
      throw new Error(
        "The server took too long to respond. It may be waking up. Please try again."
      );
    }
    if (e instanceof TypeError) {
      throw new Error("Could not reach the server. Check that it is running, then try again.");
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}