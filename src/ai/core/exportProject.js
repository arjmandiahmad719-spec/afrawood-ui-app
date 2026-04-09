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

function clone(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
}

function slugify(value) {
  return safeText(value)
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
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

function normalizeCharacter(character, index = 0) {
  const item = safeObject(character);

  return {
    id: safeText(item.id, `character-${index + 1}`),
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
  };
}

function buildCharacterMap(characters) {
  return safeArray(characters).reduce((acc, character, index) => {
    const normalized = normalizeCharacter(character, index);
    acc[normalized.id] = normalized;
    return acc;
  }, {});
}

function mapCharacterIdsToObjects(ids, characterMap) {
  return safeArray(ids)
    .map((id) => characterMap[id])
    .filter(Boolean)
    .map((character) => ({
      id: character.id,
      name: character.name,
      prompt: character.prompt,
      appearance: character.appearance,
      wardrobe: character.wardrobe,
      facePrompt: character.facePrompt,
      referenceImage: character.referenceImage,
      negativePrompt: character.negativePrompt,
      consistencyPrompt: character.consistencyPrompt,
      lockPrompt: character.lockPrompt,
      referenceMode: character.referenceMode,
      lockStrength: character.lockStrength,
      seed: character.seed,
    }));
}

function normalizeShot(shot, imagesMap = {}, characterMap = {}) {
  const item = safeObject(shot);
  const shotId = safeText(item.id);
  const characterIds = safeArray(item.characters);
  const image = shotId ? imagesMap[shotId] || null : null;

  return {
    id: shotId,
    sceneId: safeText(item.sceneId),
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
    imageWidth: safeNumber(item.imageWidth),
    imageHeight: safeNumber(item.imageHeight),
    steps: safeNumber(item.steps),
    cfgScale: safeNumber(item.cfgScale),
    sampler: safeText(item.sampler),
    seed: safeNumber(item.seed),
    characterIds,
    characters: mapCharacterIdsToObjects(characterIds, characterMap),
    image,
  };
}

function normalizeScene(scene, imagesMap = {}, characterMap = {}) {
  const item = safeObject(scene);
  const characterIds = safeArray(item.characters);

  return {
    id: safeText(item.id),
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
    imageWidth: safeNumber(item.imageWidth),
    imageHeight: safeNumber(item.imageHeight),
    steps: safeNumber(item.steps),
    cfgScale: safeNumber(item.cfgScale),
    sampler: safeText(item.sampler),
    characterIds,
    characters: mapCharacterIdsToObjects(characterIds, characterMap),
    shots: safeArray(item.shots).map((shot) =>
      normalizeShot(shot, imagesMap, characterMap)
    ),
  };
}

function normalizeImages(images) {
  const source = safeObject(images);
  const entries = Object.entries(source);

  return entries.reduce((acc, [shotId, record]) => {
    acc[shotId] = normalizeImageRecord(record, shotId);
    return acc;
  }, {});
}

export function buildExportProject(project) {
  const source = clone(project || {});
  const images = normalizeImages(source.images);
  const characters = safeArray(source.characters).map(normalizeCharacter);
  const characterMap = buildCharacterMap(characters);
  const scenes = safeArray(source.scenes).map((scene) =>
    normalizeScene(scene, images, characterMap)
  );

  const totalShots = scenes.reduce(
    (sum, scene) => sum + safeArray(scene.shots).length,
    0
  );

  const totalSceneCharacterLinks = scenes.reduce(
    (sum, scene) => sum + safeArray(scene.characterIds).length,
    0
  );

  const totalShotCharacterLinks = scenes.reduce(
    (sum, scene) =>
      sum +
      safeArray(scene.shots).reduce(
        (shotSum, shot) => shotSum + safeArray(shot.characterIds).length,
        0
      ),
    0
  );

  const totalLockedShots = scenes.reduce(
    (sum, scene) =>
      sum +
      safeArray(scene.shots).filter((shot) => Boolean(shot?.image?.consistencyLocked)).length,
    0
  );

  const totalReferenceShots = scenes.reduce(
    (sum, scene) =>
      sum +
      safeArray(scene.shots).filter((shot) => Boolean(shot?.image?.usedReferenceImage)).length,
    0
  );

  return {
    id: safeText(source.id),
    title: safeText(source.title || source.name, "Afrawood Project"),
    name: safeText(source.name || source.title, "Afrawood Project"),
    type: safeText(source.type),
    language: safeText(source.language),
    synopsis: safeText(source.synopsis),
    notes: safeText(source.notes),
    createdAt: safeText(source.createdAt),
    updatedAt: safeText(source.updatedAt),
    characters,
    images,
    scenes,
    meta: {
      totalScenes: scenes.length,
      totalShots,
      totalImages: Object.keys(images).length,
      totalCharacters: characters.length,
      totalSceneCharacterLinks,
      totalShotCharacterLinks,
      totalLockedShots,
      totalReferenceShots,
      exportedAt: new Date().toISOString(),
      exportVersion: "5.0-auto-image-phase",
    },
  };
}

export function exportProjectAsJson(project, fileName = "") {
  const exportData = buildExportProject(project);
  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const safeFileName =
    safeText(fileName) ||
    `${
      slugify(safeText(project?.title || project?.name, "afrawood-project")) ||
      "afrawood-project"
    }.json`;

  const link = document.createElement("a");
  link.href = url;
  link.download = safeFileName.endsWith(".json")
    ? safeFileName
    : `${safeFileName}.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);

  return exportData;
}

export function buildProjectPreviewData(project) {
  const exportData = buildExportProject(project);

  return {
    ...exportData,
    scenes: exportData.scenes.map((scene) => ({
      ...scene,
      shots: safeArray(scene.shots).map((shot) => ({
        ...shot,
        hasImage: Boolean(shot.image?.imageUrl),
        consistencyLocked: Boolean(shot.image?.consistencyLocked),
        usedReferenceImage: Boolean(shot.image?.usedReferenceImage),
      })),
    })),
  };
}

export default exportProjectAsJson;