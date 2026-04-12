const RUNWAY_API_KEY = import.meta.env.VITE_RUNWAY_API_KEY;
const RUNWAY_API_BASE = "https://api.dev.runwayml.com/v1";
const RUNWAY_API_VERSION = "2024-11-06";
const DEFAULT_MODEL = "gen4.5";
const VIDEO_HISTORY_STORAGE_KEY = "afrawood_video_history";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeJsonParse(value, fallback = null) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function getHeaders() {
  if (!RUNWAY_API_KEY) {
    throw new Error("Missing Runway API Key");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${RUNWAY_API_KEY}`,
    "X-Runway-Version": RUNWAY_API_VERSION,
  };
}

function normalizeRatio(ratio = "1280:720") {
  const allowed = new Set([
    "1280:720",
    "720:1280",
    "1024:1024",
    "1104:832",
    "832:1104",
    "1584:672",
  ]);

  return allowed.has(ratio) ? ratio : "1280:720";
}

function normalizeDuration(duration = 5) {
  const value = Number(duration);
  if (!Number.isFinite(value)) return 5;
  return Math.min(10, Math.max(2, Math.round(value)));
}

function normalizePromptText(promptText = "") {
  return String(promptText || "").trim();
}

function fileToDataUri(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result || "");
      if (!result.startsWith("data:")) {
        reject(new Error("Invalid image data"));
        return;
      }
      resolve(result);
    };

    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}

async function imageUrlToDataUri(url) {
  if (!url) return "";

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to load image URL");
  }

  const blob = await res.blob();

  return await new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const result = String(reader.result || "");
      if (!result.startsWith("data:")) {
        reject(new Error("Failed to convert image URL to data URI"));
        return;
      }
      resolve(result);
    };

    reader.onerror = () => reject(new Error("Failed to convert image blob"));
    reader.readAsDataURL(blob);
  });
}

async function resolvePromptImage({ imageFile = null, imageUrl = "" } = {}) {
  if (imageFile) {
    return await fileToDataUri(imageFile);
  }

  if (imageUrl) {
    return await imageUrlToDataUri(imageUrl);
  }

  return "";
}

function mapTaskError(task) {
  const reason =
    task?.failure ||
    task?.error ||
    task?.message ||
    "Video generation failed";

  return String(reason);
}

export function getVideoHistory() {
  if (typeof window === "undefined") return [];
  return safeJsonParse(window.localStorage.getItem(VIDEO_HISTORY_STORAGE_KEY), []);
}

export function saveVideoHistoryItem(item) {
  if (typeof window === "undefined") return;

  const current = getVideoHistory();
  const next = [item, ...current].slice(0, 30);
  window.localStorage.setItem(VIDEO_HISTORY_STORAGE_KEY, JSON.stringify(next));
}

export function removeVideoHistoryItem(id) {
  if (typeof window === "undefined") return;

  const current = getVideoHistory();
  const next = current.filter((item) => item.id !== id);
  window.localStorage.setItem(VIDEO_HISTORY_STORAGE_KEY, JSON.stringify(next));
}

export function clearVideoHistory() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(VIDEO_HISTORY_STORAGE_KEY);
}

export async function getVideoEngineInfo() {
  return {
    name: "Runway API",
    model: DEFAULT_MODEL,
    endpoint: `${RUNWAY_API_BASE}/image_to_video`,
    version: RUNWAY_API_VERSION,
  };
}

export async function checkVideoEngineHealth() {
  try {
    getHeaders();

    return {
      ok: true,
      status: "ready",
      message: "Runway API key is configured",
    };
  } catch (error) {
    return {
      ok: false,
      status: "not_configured",
      message: error?.message || "Runway API is not configured",
    };
  }
}

export async function createVideoTask({
  promptText,
  ratio = "1280:720",
  duration = 5,
  imageFile = null,
  imageUrl = "",
  model = DEFAULT_MODEL,
} = {}) {
  const cleanPrompt = normalizePromptText(promptText);

  if (!cleanPrompt) {
    throw new Error("Prompt is required");
  }

  const payload = {
    model,
    promptText: cleanPrompt,
    ratio: normalizeRatio(ratio),
    duration: normalizeDuration(duration),
  };

  const promptImage = await resolvePromptImage({ imageFile, imageUrl });
  if (promptImage) {
    payload.promptImage = promptImage;
  }

  const res = await fetch(`${RUNWAY_API_BASE}/image_to_video`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = "Runway request failed";
    try {
      const data = await res.json();
      message = data?.error || data?.message || message;
    } catch {
      const text = await res.text();
      message = text || message;
    }
    throw new Error(message);
  }

  const data = await res.json();

  if (!data?.id) {
    throw new Error("Runway did not return a task id");
  }

  return data.id;
}

export async function getVideoTask(taskId) {
  if (!taskId) {
    throw new Error("Task id is required");
  }

  const res = await fetch(`${RUNWAY_API_BASE}/tasks/${taskId}`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!res.ok) {
    let message = "Failed to fetch task";
    try {
      const data = await res.json();
      message = data?.error || data?.message || message;
    } catch {
      const text = await res.text();
      message = text || message;
    }
    throw new Error(message);
  }

  return await res.json();
}

export async function waitForVideoTask(taskId, options = {}) {
  const {
    timeoutMs = 10 * 60 * 1000,
    pollIntervalMs = 4000,
  } = options;

  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const task = await getVideoTask(taskId);
    const status = String(task?.status || "").toUpperCase();

    if (status === "SUCCEEDED") {
      return task;
    }

    if (status === "FAILED" || status === "CANCELLED") {
      throw new Error(mapTaskError(task));
    }

    await sleep(pollIntervalMs);
  }

  throw new Error("Video generation timed out");
}

export async function generateVideo({
  promptText,
  ratio = "1280:720",
  duration = 5,
  imageFile = null,
  imageUrl = "",
  model = DEFAULT_MODEL,
} = {}) {
  const taskId = await createVideoTask({
    promptText,
    ratio,
    duration,
    imageFile,
    imageUrl,
    model,
  });

  const task = await waitForVideoTask(taskId);

  const videoUrl = Array.isArray(task?.output) ? task.output[0] : "";

  if (!videoUrl) {
    throw new Error("No video URL returned from Runway");
  }

  const historyRecord = {
    id: `${taskId}-${Date.now()}`,
    taskId,
    promptText: normalizePromptText(promptText),
    ratio: normalizeRatio(ratio),
    duration: normalizeDuration(duration),
    model,
    videoUrl,
    createdAt: Date.now(),
  };

  saveVideoHistoryItem(historyRecord);

  return {
    ok: true,
    taskId,
    status: task.status,
    videoUrl,
    historyRecord,
    rawTask: task,
  };
}

export async function downloadVideoFile(videoUrl, fileName = "afrawood-video.mp4") {
  if (!videoUrl) {
    throw new Error("Video URL is required");
  }

  const res = await fetch(videoUrl);
  if (!res.ok) {
    throw new Error("Failed to download video");
  }

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(objectUrl);
}

const videoAI = {
  getVideoEngineInfo,
  checkVideoEngineHealth,
  createVideoTask,
  getVideoTask,
  waitForVideoTask,
  generateVideo,
  getVideoHistory,
  saveVideoHistoryItem,
  removeVideoHistoryItem,
  clearVideoHistory,
  downloadVideoFile,
};

export default videoAI;