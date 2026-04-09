const normalizeText = (value) => {
  if (value == null) return "";
  return String(value).trim();
};

const safeArray = (value) => (Array.isArray(value) ? value : []);

const hasAfraBridge = () =>
  typeof window !== "undefined" &&
  window.afraAI &&
  typeof window.afraAI.chat === "function";

const localConfigCache = {
  loaded: false,
  value: {
    enabled: false,
    provider: "",
    baseUrl: "",
    apiKey: "",
    model: "",
    temperature: 0.7,
    maxTokens: 1800,
  },
};

const buildSystemPrompt = ({ mode = "general" } = {}) => {
  const commonRules = [
    "You are Afrawood AI Studio copilot.",
    "You help with cinematic writing, directing, dialogue, storyboard planning, and scene design.",
    "Return practical, clean, production-friendly output.",
    "If the user asks in Persian, answer in fluent Persian.",
    "Keep responses structured and useful.",
  ].join(" ");

  if (mode === "storyboard") {
    return `${commonRules} Focus on shot design, camera language, lighting, composition, blocking, and director notes.`;
  }

  if (mode === "dialogue") {
    return `${commonRules} Focus on dramatic dialogue, subtext, emotional logic, and scene tension.`;
  }

  if (mode === "scene") {
    return `${commonRules} Focus on scene construction, beat design, conflict, and dramatic progression.`;
  }

  return commonRules;
};

export const getAiClientConfig = async () => {
  if (localConfigCache.loaded) {
    return { ...localConfigCache.value };
  }

  if (!hasAfraBridge()) {
    localConfigCache.loaded = true;
    localConfigCache.value = {
      enabled: false,
      provider: "",
      baseUrl: "",
      apiKey: "",
      model: "",
      temperature: 0.7,
      maxTokens: 1800,
    };
    return { ...localConfigCache.value };
  }

  try {
    const result = await window.afraAI.getConfig();
    const config = result?.ok
      ? {
          enabled: Boolean(result.enabled),
          provider: normalizeText(result.provider),
          baseUrl: normalizeText(result.baseUrl),
          apiKey: normalizeText(result.apiKey),
          model: normalizeText(result.model),
          temperature:
            typeof result.temperature === "number" ? result.temperature : 0.7,
          maxTokens:
            typeof result.maxTokens === "number" ? result.maxTokens : 1800,
        }
      : {
          enabled: false,
          provider: "",
          baseUrl: "",
          apiKey: "",
          model: "",
          temperature: 0.7,
          maxTokens: 1800,
        };

    localConfigCache.loaded = true;
    localConfigCache.value = config;
    return { ...config };
  } catch {
    localConfigCache.loaded = true;
    localConfigCache.value = {
      enabled: false,
      provider: "",
      baseUrl: "",
      apiKey: "",
      model: "",
      temperature: 0.7,
      maxTokens: 1800,
    };
    return { ...localConfigCache.value };
  }
};

export const isAiEnabled = async () => {
  const config = await getAiClientConfig();
  return Boolean(config.enabled && hasAfraBridge());
};

export const buildAfraPromptContext = ({
  project = null,
  scene = null,
  shot = null,
  characters = [],
  dialogueMode = "",
  customPrompt = "",
  directorNote = "",
  userCommand = "",
} = {}) => {
  const lines = [
    project?.title ? `Project: ${project.title}` : "",
    project?.genre ? `Project Genre: ${project.genre}` : "",
    project?.tone ? `Project Tone: ${project.tone}` : "",
    project?.language ? `Project Language: ${project.language}` : "",
    scene?.title ? `Scene Title: ${scene.title}` : "",
    scene?.sceneNumber != null ? `Scene Number: ${scene.sceneNumber}` : "",
    scene?.location ? `Location: ${scene.location}` : "",
    scene?.timeOfDay ? `Time Of Day: ${scene.timeOfDay}` : "",
    scene?.mood ? `Scene Mood: ${scene.mood}` : "",
    scene?.genre ? `Scene Genre: ${scene.genre}` : "",
    scene?.purpose ? `Scene Purpose: ${scene.purpose}` : "",
    scene?.conflict ? `Scene Conflict: ${scene.conflict}` : "",
    scene?.summary ? `Scene Summary: ${scene.summary}` : "",
    safeArray(scene?.beatOutline).length
      ? `Scene Beats:\n- ${safeArray(scene.beatOutline).join("\n- ")}`
      : "",
    safeArray(characters).length
      ? `Characters In Scene:\n- ${safeArray(characters)
          .map((item) => {
            const parts = [
              normalizeText(item?.name),
              normalizeText(item?.role),
              normalizeText(item?.archetype),
            ].filter(Boolean);
            return parts.join(" | ");
          })
          .filter(Boolean)
          .join("\n- ")}`
      : "",
    shot?.title ? `Active Shot: ${shot.title}` : "",
    shot?.description ? `Active Shot Description: ${shot.description}` : "",
    shot?.shotSize ? `Active Shot Size: ${shot.shotSize}` : "",
    shot?.cameraAngle ? `Active Shot Angle: ${shot.cameraAngle}` : "",
    shot?.cameraMove ? `Active Shot Move: ${shot.cameraMove}` : "",
    normalizeText(dialogueMode) ? `Dialogue Mode: ${dialogueMode}` : "",
    normalizeText(directorNote) ? `Director Note: ${directorNote}` : "",
    normalizeText(customPrompt) ? `Additional Instruction: ${customPrompt}` : "",
    normalizeText(userCommand) ? `User Command: ${userCommand}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return lines.trim();
};

export const requestAiText = async ({
  mode = "general",
  systemPrompt = "",
  userPrompt = "",
  history = [],
  temperature,
  maxTokens,
  model = "",
} = {}) => {
  if (!hasAfraBridge()) {
    throw new Error("Electron AI bridge در دسترس نیست.");
  }

  const config = await getAiClientConfig();

  if (!config.enabled) {
    throw new Error("AI هنوز فعال نشده.");
  }

  const result = await window.afraAI.chat({
    mode: normalizeText(mode) || "general",
    model: normalizeText(model),
    userPrompt: normalizeText(userPrompt),
    history: safeArray(history),
    systemPrompt: normalizeText(systemPrompt) || buildSystemPrompt({ mode }),
    temperature:
      typeof temperature === "number" && Number.isFinite(temperature)
        ? temperature
        : config.temperature,
    maxTokens:
      typeof maxTokens === "number" && Number.isFinite(maxTokens)
        ? maxTokens
        : config.maxTokens,
  });

  if (!result?.ok) {
    throw new Error(normalizeText(result?.error) || "AI request failed.");
  }

  return {
    text: normalizeText(result.text),
    raw: result.raw || null,
    model: normalizeText(result.model) || config.model,
    provider: normalizeText(result.provider) || config.provider,
  };
};

export const requestStoryboardText = async ({
  contextText = "",
  userCommand = "",
  history = [],
} = {}) => {
  const prompt = [
    "Generate a cinematic storyboard plan for the scene below.",
    "Return clean Persian output.",
    "For each shot include:",
    "1. shot number",
    "2. title",
    "3. description",
    "4. purpose",
    "5. shot type",
    "6. shot size",
    "7. lens",
    "8. camera angle",
    "9. camera movement",
    "10. lighting",
    "11. composition",
    "12. blocking",
    "13. director note",
    "",
    "Scene Context:",
    normalizeText(contextText),
    "",
    "User Command:",
    normalizeText(userCommand) || "برای این صحنه شات‌لیست حرفه‌ای بساز.",
  ]
    .filter(Boolean)
    .join("\n");

  return requestAiText({
    mode: "storyboard",
    userPrompt: prompt,
    history,
    temperature: 0.7,
    maxTokens: 2200,
  });
};

export const requestDialogueText = async ({
  contextText = "",
  userCommand = "",
  history = [],
  dialogueMode = "full",
} = {}) => {
  const prompt = [
    "Generate cinematic Persian dialogue for the scene below.",
    `Dialogue mode: ${normalizeText(dialogueMode) || "full"}`,
    "Keep emotional logic, subtext, and dramatic tension strong.",
    "Return usable dialogue text, not explanations.",
    "",
    "Scene Context:",
    normalizeText(contextText),
    "",
    "User Command:",
    normalizeText(userCommand) || "برای این صحنه دیالوگ حرفه‌ای بساز.",
  ]
    .filter(Boolean)
    .join("\n");

  return requestAiText({
    mode: "dialogue",
    userPrompt: prompt,
    history,
    temperature: 0.85,
    maxTokens: 1800,
  });
};

export default {
  getAiClientConfig,
  isAiEnabled,
  buildAfraPromptContext,
  requestAiText,
  requestStoryboardText,
  requestDialogueText,
};