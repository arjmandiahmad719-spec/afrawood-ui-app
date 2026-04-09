const OLLAMA_BASE_URL =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_OLLAMA_BASE_URL) ||
  "http://127.0.0.1:11434";

const OLLAMA_MODEL =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_OLLAMA_MODEL) ||
  "tinyllama";

function safeText(value, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

async function parseJsonResponse(response, label) {
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`${label} ${response.status}${text ? `: ${text}` : ""}`);
  }

  return response.json();
}

function buildFallbackResponse(prompt) {
  const text = safeText(prompt);

  return {
    success: true,
    provider: "fallback-mock",
    model: OLLAMA_MODEL,
    text: text || "No prompt provided.",
    raw: {
      message: {
        content: text || "No prompt provided.",
      },
    },
  };
}

export async function askAfraLocalAI(prompt) {
  const userPrompt = safeText(prompt);

  if (!userPrompt) {
    return {
      success: false,
      provider: "local-ai",
      model: OLLAMA_MODEL,
      text: "Prompt is empty.",
      raw: null,
    };
  }

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        messages: [
          {
            role: "system",
            content:
              "You are Afrawood local AI. Reply clearly and briefly. Help create scenes, shots, and cinematic ideas.",
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
      }),
    });

    const data = await parseJsonResponse(response, "Ollama API error");
    const content =
      safeText(data?.message?.content) ||
      safeText(data?.response) ||
      userPrompt;

    return {
      success: true,
      provider: "ollama",
      model: OLLAMA_MODEL,
      text: content,
      raw: data,
    };
  } catch {
    return buildFallbackResponse(userPrompt);
  }
}

export async function checkAfraLocalAI() {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: "GET",
    });

    const data = await parseJsonResponse(response, "Ollama health check failed");
    const models = Array.isArray(data?.models) ? data.models : [];
    const hasModel = models.some(
      (item) => safeText(item?.name).toLowerCase() === OLLAMA_MODEL.toLowerCase()
    );

    return {
      success: true,
      provider: "ollama",
      model: OLLAMA_MODEL,
      available: true,
      hasModel,
      raw: data,
    };
  } catch {
    return {
      success: false,
      provider: "ollama",
      model: OLLAMA_MODEL,
      available: false,
      hasModel: false,
      raw: null,
    };
  }
}

export default askAfraLocalAI;