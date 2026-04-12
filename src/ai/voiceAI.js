const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const DEFAULT_VOICE_ID =
  import.meta.env.VITE_ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
const DEFAULT_MODEL_ID =
  import.meta.env.VITE_ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";

const ELEVENLABS_API_BASE = "https://api.elevenlabs.io/v1";
const VOICE_HISTORY_STORAGE_KEY = "afrawood_voice_history";

function safeJsonParse(value, fallback = null) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeText(text = "") {
  return String(text || "").trim();
}

function normalizeLanguageCode(value = "") {
  const code = String(value || "").trim().toLowerCase();
  if (!code) return "";
  return code.slice(0, 2);
}

function normalizeVoiceSettings(settings = {}) {
  const similarityBoost = Number(settings.similarity_boost);
  const stability = Number(settings.stability);
  const style = Number(settings.style);
  const useSpeakerBoost = Boolean(settings.use_speaker_boost);

  return {
    stability: Number.isFinite(stability) ? Math.min(1, Math.max(0, stability)) : 0.5,
    similarity_boost: Number.isFinite(similarityBoost)
      ? Math.min(1, Math.max(0, similarityBoost))
      : 0.75,
    style: Number.isFinite(style) ? Math.min(1, Math.max(0, style)) : 0.2,
    use_speaker_boost: useSpeakerBoost,
  };
}

function getHeaders() {
  if (!ELEVENLABS_API_KEY) {
    throw new Error("Missing ElevenLabs API Key");
  }

  return {
    "Content-Type": "application/json",
    "xi-api-key": ELEVENLABS_API_KEY,
    Accept: "audio/mpeg",
  };
}

export function getVoiceHistory() {
  if (typeof window === "undefined") return [];
  return safeJsonParse(window.localStorage.getItem(VOICE_HISTORY_STORAGE_KEY), []);
}

export function saveVoiceHistoryItem(item) {
  if (typeof window === "undefined") return;

  const current = getVoiceHistory();
  const next = [item, ...current].slice(0, 40);
  window.localStorage.setItem(VOICE_HISTORY_STORAGE_KEY, JSON.stringify(next));
}

export function removeVoiceHistoryItem(id) {
  if (typeof window === "undefined") return;

  const current = getVoiceHistory();
  const next = current.filter((item) => item.id !== id);
  window.localStorage.setItem(VOICE_HISTORY_STORAGE_KEY, JSON.stringify(next));
}

export function clearVoiceHistory() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(VOICE_HISTORY_STORAGE_KEY);
}

export async function getVoiceEngineInfo() {
  return {
    name: "ElevenLabs",
    voiceId: DEFAULT_VOICE_ID,
    modelId: DEFAULT_MODEL_ID,
    endpoint: `${ELEVENLABS_API_BASE}/text-to-speech/${DEFAULT_VOICE_ID}`,
  };
}

export async function checkVoiceEngineHealth() {
  try {
    getHeaders();

    return {
      ok: true,
      status: "ready",
      message: "ElevenLabs API key is configured",
    };
  } catch (error) {
    return {
      ok: false,
      status: "not_configured",
      message: error?.message || "ElevenLabs API is not configured",
    };
  }
}

export async function generateVoice({
  text,
  voiceId = DEFAULT_VOICE_ID,
  modelId = DEFAULT_MODEL_ID,
  languageCode = "",
  outputFormat = "mp3_44100_128",
  voiceSettings = {},
} = {}) {
  const cleanText = normalizeText(text);

  if (!cleanText) {
    throw new Error("Text is required");
  }

  const payload = {
    text: cleanText,
    model_id: modelId,
    output_format: outputFormat,
    voice_settings: normalizeVoiceSettings(voiceSettings),
  };

  const cleanLanguageCode = normalizeLanguageCode(languageCode);
  if (cleanLanguageCode) {
    payload.language_code = cleanLanguageCode;
  }

  const res = await fetch(
    `${ELEVENLABS_API_BASE}/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    let message = "Voice generation failed";

    try {
      const data = await res.json();
      message = data?.detail?.message || data?.message || message;
    } catch {
      const textResponse = await res.text();
      message = textResponse || message;
    }

    throw new Error(message);
  }

  const blob = await res.blob();
  const audioUrl = URL.createObjectURL(blob);

  const historyRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text: cleanText,
    voiceId,
    modelId,
    languageCode: cleanLanguageCode || "auto",
    audioUrl,
    createdAt: Date.now(),
  };

  saveVoiceHistoryItem(historyRecord);

  return {
    ok: true,
    audioUrl,
    blob,
    historyRecord,
  };
}

export async function downloadVoiceFile(audioUrl, fileName = "afrawood-voice.mp3") {
  if (!audioUrl) {
    throw new Error("Audio URL is required");
  }

  const link = document.createElement("a");
  link.href = audioUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const voiceAI = {
  getVoiceEngineInfo,
  checkVoiceEngineHealth,
  generateVoice,
  getVoiceHistory,
  saveVoiceHistoryItem,
  removeVoiceHistoryItem,
  clearVoiceHistory,
  downloadVoiceFile,
};

export default voiceAI;