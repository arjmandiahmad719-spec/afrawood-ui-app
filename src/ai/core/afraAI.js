import {
  getAfraAIConfig,
  getAfraAIEngineInfo,
  isAfraAIEnabled,
  hasOpenAIConfig,
  hasLocalAIConfig,
  getActiveAIModel,
} from "./afraAIConfig";

export {
  getAfraAIConfig as getAIConfig,
  getAfraAIEngineInfo as getAIEngineInfo,
  isAfraAIEnabled as isAIEnabled,
  hasOpenAIConfig,
  hasLocalAIConfig,
  getActiveAIModel as getActiveModel,
};

export function hasAIBridge() {
  return true;
}

export function buildSystemPrompt(mode = "default") {
  const normalizedMode = String(mode || "default").trim().toLowerCase();

  const basePrompt = [
    "You are Afrawood AI Studio copilot.",
    "Help with cinematic writing, directing, dialogue, storyboard planning, scene design, and practical creative decisions.",
    "Return practical, clean, production-friendly output.",
    "Respect the user's language.",
    "If the user writes in Persian, reply in fluent Persian.",
    "If the user writes in Turkish, reply in Turkish.",
    "Otherwise reply in the user's language when possible.",
    "Keep responses structured, useful, and direct."
  ].join(" ");

  if (normalizedMode === "storyboard") {
    return [
      basePrompt,
      "Prioritize visual storytelling, camera framing, composition, cinematic continuity, action clarity, and mood."
    ].join(" ");
  }

  if (normalizedMode === "script") {
    return [
      basePrompt,
      "Prioritize screenplay structure, scene logic, character motivation, dialogue quality, pacing, and cinematic writing."
    ].join(" ");
  }

  if (normalizedMode === "director") {
    return [
      basePrompt,
      "Prioritize directing choices, shot suggestions, blocking, emotional beats, performance guidance, and production practicality."
    ].join(" ");
  }

  return basePrompt;
}

function normalizeMessageRole(role) {
  if (role === "system") return "system";
  if (role === "assistant") return "assistant";
  return "user";
}

function normalizeMessages(messages = []) {
  if (!Array.isArray(messages)) return [];

  return messages
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      role: normalizeMessageRole(item.role),
      content: typeof item.content === "string" ? item.content : String(item.content ?? ""),
    }))
    .filter((item) => item.content.trim().length > 0);
}

async function parseJsonSafe(response) {
  const rawText = await response.text();

  try {
    return rawText ? JSON.parse(rawText) : {};
  } catch {
    throw new Error(rawText || "Invalid JSON response from AI server.");
  }
}

function extractOpenAIText(data) {
  const content = data?.choices?.[0]?.message?.content;

  if (typeof content === "string" && content.trim()) {
    return content.trim();
  }

  if (Array.isArray(content)) {
    const text = content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part?.type === "text" && typeof part?.text === "string") return part.text;
        return "";
      })
      .join("")
      .trim();

    if (text) return text;
  }

  throw new Error("No valid response returned from OpenAI.");
}

function extractLocalText(data) {
  if (typeof data?.message?.content === "string" && data.message.content.trim()) {
    return data.message.content.trim();
  }

  if (typeof data?.response === "string" && data.response.trim()) {
    return data.response.trim();
  }

  throw new Error("No valid response returned from local AI.");
}

async function callOpenAI({ messages, signal }) {
  const config = getAfraAIConfig();

  if (!config.openai.apiKey) {
    throw new Error("OpenAI API key is missing.");
  }

  const response = await fetch(`${config.openai.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.openai.apiKey}`,
    },
    body: JSON.stringify({
      model: config.openai.model,
      messages,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    }),
    signal,
  });

  const data = await parseJsonSafe(response);

  if (!response.ok) {
    const message =
      data?.error?.message ||
      data?.message ||
      "OpenAI request failed.";
    throw new Error(message);
  }

  return extractOpenAIText(data);
}

async function callLocalAI({ messages, signal }) {
  const config = getAfraAIConfig();

  const response = await fetch(`${config.local.baseUrl}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.local.model,
      messages,
      stream: false,
      options: {
        temperature: config.temperature,
        num_predict: config.maxTokens,
      },
    }),
    signal,
  });

  const data = await parseJsonSafe(response);

  if (!response.ok) {
    const message =
      data?.error ||
      data?.message ||
      "Local AI request failed.";
    throw new Error(message);
  }

  return extractLocalText(data);
}

export async function runAfraAIChat({
  mode = "default",
  prompt = "",
  messages = [],
  systemPrompt = "",
  signal,
} = {}) {
  const config = getAfraAIConfig();

  if (!config.enabled) {
    throw new Error("AI is disabled.");
  }

  const normalizedMessages = normalizeMessages(messages);
  const normalizedPrompt = String(prompt || "").trim();

  if (normalizedMessages.length === 0 && !normalizedPrompt) {
    throw new Error("Prompt is empty.");
  }

  const finalSystemPrompt =
    typeof systemPrompt === "string" && systemPrompt.trim()
      ? systemPrompt.trim()
      : buildSystemPrompt(mode);

  const payloadMessages =
    normalizedMessages.length > 0
      ? [{ role: "system", content: finalSystemPrompt }, ...normalizedMessages]
      : [
          { role: "system", content: finalSystemPrompt },
          { role: "user", content: normalizedPrompt },
        ];

  if (config.provider === "openai") {
    return callOpenAI({
      messages: payloadMessages,
      signal,
    });
  }

  return callLocalAI({
    messages: payloadMessages,
    signal,
  });
}

export async function runCopilotDirectorCommand(input, options = {}) {
  return runAfraAIChat({
    mode: "director",
    prompt: input,
    ...options,
  });
}

export async function runStoryboardCommand(input, options = {}) {
  return runAfraAIChat({
    mode: "storyboard",
    prompt: input,
    ...options,
  });
}

export async function runScriptCommand(input, options = {}) {
  return runAfraAIChat({
    mode: "script",
    prompt: input,
    ...options,
  });
}