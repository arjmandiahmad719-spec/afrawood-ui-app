const PROJECT_STORAGE_KEY = "afrawood_project";
const CHAT_HISTORY_STORAGE_KEY = "afrawood_chat_history";
const UI_STATE_STORAGE_KEY = "afrawood_ui_state";

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeObject(value, fallback = {}) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : fallback;
}

function safeText(value, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function safeNumber(value, fallback = null) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function makeId(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function clone(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function removeKey(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function normalizeCharacter(character, index = 0) {
  const item = safeObject(character);

  return {
    id: safeText(item.id, `character-${index + 1}`) || makeId("character"),
    name: safeText(item.name),
    prompt: safeText(item.prompt),
    appearance: safeText(item.appearance),
    wardrobe: safeText(item.wardrobe),
    facePrompt: safeText(item.facePrompt),
    referenceImage: safeText(item.referenceImage),
    negativePrompt: safeText(item.negativePrompt),
    consistencyPrompt: safeText(item.consistencyPrompt),
    lockPrompt: safeText(item.lockPrompt),
    referenceMode: safeText(item.referenceMode, "auto"),
    lockStrength: safeNumber(item.lockStrength, 0.88),
    seed: safeNumber(item.seed),
    createdAt: safeText(item.createdAt),
    updatedAt: safeText(item.updatedAt),
  };
}

function normalizeImageRecord(record, shotId = "") {
  const item = safeObject(record);

  return {
    shotId: safeText(item.shotId, shotId),
    sceneId: safeText(item.sceneId),
    imageUrl: safeText(item.imageUrl),
    prompt: safeText(item.prompt),
    negativePrompt: safeText(item.negativePrompt),
    provider: safeText(item.provider),
    seed: safeNumber(item.seed),
    width: safeNumber(item.width),
    height: safeNumber(item.height),
    characterIds: safeArray(item.characterIds),
    characterNames: safeArray(item.characterNames),
    primaryCharacterId: safeText(item.primaryCharacterId),
    primaryCharacterName: safeText(item.primaryCharacterName),
    consistencyLocked: Boolean(item.consistencyLocked),
    usedReferenceImage: Boolean(item.usedReferenceImage),
    referenceMode: safeText(item.referenceMode),
    lockStrength: safeNumber(item.lockStrength),
    lockPrompt: safeText(item.lockPrompt),
    createdAt: safeText(item.createdAt),
  };
}

function normalizeShot(shot, sceneId = "") {
  const item = safeObject(shot);

  return {
    id: safeText(item.id) || makeId("shot"),
    sceneId: safeText(item.sceneId, sceneId),
    title: safeText(item.title || item.name),
    name: safeText(item.name || item.title),
    description: safeText(item.description),
    prompt: safeText(item.prompt),
    action: safeText(item.action),
    camera: safeText(item.camera),
    cameraStyle: safeText(item.cameraStyle),
    lighting: safeText(item.lighting),
    mood: safeText(item.mood),
    location: safeText(item.location),
    timeOfDay: safeText(item.timeOfDay),
    visualStyle: safeText(item.visualStyle || item.style),
    notes: safeText(item.notes),
    negativePrompt: safeText(item.negativePrompt),
    imageWidth: safeNumber(item.imageWidth, 1024),
    imageHeight: safeNumber(item.imageHeight, 576),
    steps: safeNumber(item.steps, 28),
    cfgScale: safeNumber(item.cfgScale, 7),
    sampler: safeText(item.sampler),
    seed: safeNumber(item.seed),
    characters: safeArray(item.characters),
  };
}

function normalizeScene(scene, index = 0) {
  const item = safeObject(scene);
  const sceneId = safeText(item.id) || makeId(`scene-${index + 1}`);

  return {
    id: sceneId,
    title: safeText(item.title || item.name),
    name: safeText(item.name || item.title),
    description: safeText(item.description),
    location: safeText(item.location),
    setting: safeText(item.setting),
    time: safeText(item.time),
    timeOfDay: safeText(item.timeOfDay),
    mood: safeText(item.mood),
    tone: safeText(item.tone),
    lighting: safeText(item.lighting),
    visualStyle: safeText(item.visualStyle || item.style),
    cameraStyle: safeText(item.cameraStyle),
    imageWidth: safeNumber(item.imageWidth, 1024),
    imageHeight: safeNumber(item.imageHeight, 576),
    steps: safeNumber(item.steps, 28),
    cfgScale: safeNumber(item.cfgScale, 7),
    sampler: safeText(item.sampler),
    characters: safeArray(item.characters),
    shots: safeArray(item.shots).map((shot) => normalizeShot(shot, sceneId)),
  };
}

export function createEmptyProject() {
  return {
    id: makeId("project"),
    title: "Afrawood Project",
    name: "Afrawood Project",
    type: "cinema",
    language: "fa",
    synopsis: "",
    notes: "",
    scenes: [],
    characters: [],
    images: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function normalizeProject(project) {
  const base = createEmptyProject();
  const source = safeObject(project);

  const normalizedImages = Object.entries(safeObject(source.images)).reduce(
    (acc, [shotId, record]) => {
      acc[shotId] = normalizeImageRecord(record, shotId);
      return acc;
    },
    {}
  );

  return {
    ...base,
    ...source,
    id: safeText(source.id, base.id),
    title: safeText(source.title || source.name, base.title),
    name: safeText(source.name || source.title, base.name),
    type: safeText(source.type, base.type),
    language: safeText(source.language, base.language),
    synopsis: safeText(source.synopsis),
    notes: safeText(source.notes),
    scenes: safeArray(source.scenes).map((scene, index) =>
      normalizeScene(scene, index)
    ),
    characters: safeArray(source.characters).map((character, index) =>
      normalizeCharacter(character, index)
    ),
    images: normalizedImages,
    createdAt: safeText(source.createdAt, base.createdAt),
    updatedAt: safeText(source.updatedAt, new Date().toISOString()),
  };
}

export function saveProjectToStorage(project) {
  const normalized = normalizeProject({
    ...clone(project),
    updatedAt: new Date().toISOString(),
  });

  writeJson(PROJECT_STORAGE_KEY, normalized);
  return normalized;
}

export function loadProjectFromStorage() {
  const stored = readJson(PROJECT_STORAGE_KEY, null);
  if (!stored) return createEmptyProject();
  return normalizeProject(stored);
}

export function clearProjectStorage() {
  removeKey(PROJECT_STORAGE_KEY);
}

export function saveChatHistoryToStorage(history) {
  const normalized = safeArray(history).map((item, index) => {
    const row = safeObject(item);

    return {
      id: safeText(row.id) || makeId(`chat-${index + 1}`),
      role: safeText(row.role, "assistant"),
      content: safeText(row.content),
      createdAt: safeText(row.createdAt, new Date().toISOString()),
      ...row,
    };
  });

  writeJson(CHAT_HISTORY_STORAGE_KEY, normalized);
  return normalized;
}

export function loadChatHistoryFromStorage() {
  return safeArray(readJson(CHAT_HISTORY_STORAGE_KEY, []));
}

export function clearChatHistoryStorage() {
  removeKey(CHAT_HISTORY_STORAGE_KEY);
}

export function saveUiStateToStorage(uiState) {
  const normalized = {
    selectedSceneId: safeText(uiState?.selectedSceneId),
    selectedShotId: safeText(uiState?.selectedShotId),
    activePanel: safeText(uiState?.activePanel, "director"),
  };

  writeJson(UI_STATE_STORAGE_KEY, normalized);
  return normalized;
}

export function loadUiStateFromStorage() {
  return safeObject(readJson(UI_STATE_STORAGE_KEY, {}), {
    selectedSceneId: "",
    selectedShotId: "",
    activePanel: "director",
  });
}

export function clearUiStateStorage() {
  removeKey(UI_STATE_STORAGE_KEY);
}

export function clearAllAfrawoodStorage() {
  clearProjectStorage();
  clearChatHistoryStorage();
  clearUiStateStorage();
}

export function buildProjectSnapshot(project, chatHistory = [], uiState = {}) {
  const normalizedProject = normalizeProject(project);

  return {
    project: normalizedProject,
    chatHistory: saveChatHistoryToStorage(chatHistory),
    uiState: saveUiStateToStorage(uiState),
    savedAt: new Date().toISOString(),
  };
}

export function exportProjectSnapshot(project, chatHistory = [], uiState = {}) {
  const snapshot = {
    project: normalizeProject(project),
    chatHistory: safeArray(chatHistory),
    uiState: safeObject(uiState),
    exportedAt: new Date().toISOString(),
    version: "5.0-auto-image-phase",
  };

  const json = JSON.stringify(snapshot, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const fileName = `${
    safeText(project?.title || project?.name, "afrawood-project")
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "") || "afrawood-project"
  }-snapshot.json`;

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);

  return snapshot;
}

export {
  PROJECT_STORAGE_KEY,
  CHAT_HISTORY_STORAGE_KEY,
  UI_STATE_STORAGE_KEY,
};