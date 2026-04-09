// src/ai/core/scriptShotBridge.js

const STORAGE_KEY = "afrawood_bridge_shotlist";
const EVENT_NAME = "afrawood:bridge-shotlist-updated";

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function normalizeShot(shot, index = 0) {
  return {
    id: shot?.id || `bridge-shot-${index + 1}`,
    title: shot?.title || `Shot ${index + 1}`,
    prompt: shot?.prompt || "",
    description: shot?.description || "",
    type: shot?.type || "draft",
    sceneNumber: Number(shot?.sceneNumber || 1),
    shotNumber: Number(shot?.shotNumber || index + 1),
    location: shot?.location || "",
    timeOfDay: shot?.timeOfDay || "",
    heading: shot?.heading || "",
    characters: Array.isArray(shot?.characters) ? shot.characters : [],
    status: shot?.status || "draft",
    importedFromScript: true,
  };
}

export function saveBridgeShotList(shots = []) {
  const normalized = Array.isArray(shots)
    ? shots.map((shot, index) => normalizeShot(shot, index))
    : [];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));

  window.dispatchEvent(
    new CustomEvent(EVENT_NAME, {
      detail: {
        count: normalized.length,
      },
    })
  );

  return normalized;
}

export function loadBridgeShotList() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  const parsed = safeParse(raw);
  if (!Array.isArray(parsed)) return [];

  return parsed.map((shot, index) => normalizeShot(shot, index));
}

export function clearBridgeShotList() {
  localStorage.removeItem(STORAGE_KEY);

  window.dispatchEvent(
    new CustomEvent(EVENT_NAME, {
      detail: {
        count: 0,
      },
    })
  );
}

export function getBridgeEventName() {
  return EVENT_NAME;
}

export function getBridgeStorageKey() {
  return STORAGE_KEY;
}