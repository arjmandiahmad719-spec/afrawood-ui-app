import { askAfraLocalAI } from "../localAI";

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeObject(value, fallback = {}) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : fallback;
}

function safeText(value, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
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

function uniqueList(items) {
  return [...new Set(safeArray(items).map((item) => safeText(item)).filter(Boolean))];
}

function normalizeCharacter(character) {
  const source = safeObject(character, {});
  return {
    id: safeText(source.id, makeId("character")),
    name: safeText(source.name, "Character"),
    prompt: safeText(source.prompt),
    appearance: safeText(source.appearance),
    wardrobe: safeText(source.wardrobe),
    facePrompt: safeText(source.facePrompt),
    referenceImage: safeText(source.referenceImage),
    negativePrompt: safeText(source.negativePrompt),
    consistencyPrompt: safeText(source.consistencyPrompt),
    lockPrompt: safeText(source.lockPrompt),
    referenceMode: safeText(source.referenceMode, "auto"),
    lockStrength: safeNumber(source.lockStrength, 0.88),
    seed: safeNumber(source.seed),
  };
}

function normalizeShot(shot, sceneId = "") {
  const source = safeObject(shot, {});
  return {
    id: safeText(source.id, makeId("shot")),
    sceneId: safeText(source.sceneId, sceneId),
    title: safeText(source.title || source.name, "Shot"),
    name: safeText(source.name || source.title, "Shot"),
    description: safeText(source.description),
    prompt: safeText(source.prompt),
    action: safeText(source.action),
    camera: safeText(source.camera),
    cameraStyle: safeText(source.cameraStyle),
    lighting: safeText(source.lighting),
    mood: safeText(source.mood),
    location: safeText(source.location),
    timeOfDay: safeText(source.timeOfDay),
    visualStyle: safeText(source.visualStyle || source.style),
    notes: safeText(source.notes),
    negativePrompt: safeText(source.negativePrompt),
    imageWidth: safeNumber(source.imageWidth, 1024),
    imageHeight: safeNumber(source.imageHeight, 576),
    steps: safeNumber(source.steps, 28),
    cfgScale: safeNumber(source.cfgScale, 7),
    sampler: safeText(source.sampler),
    seed: safeNumber(source.seed),
    characters: safeArray(source.characters),
  };
}

function normalizeScene(scene) {
  const source = safeObject(scene, {});
  const sceneId = safeText(source.id, makeId("scene"));

  return {
    id: sceneId,
    title: safeText(source.title || source.name, "Scene"),
    name: safeText(source.name || source.title, "Scene"),
    description: safeText(source.description),
    location: safeText(source.location),
    setting: safeText(source.setting),
    time: safeText(source.time),
    timeOfDay: safeText(source.timeOfDay),
    mood: safeText(source.mood),
    tone: safeText(source.tone),
    lighting: safeText(source.lighting),
    visualStyle: safeText(source.visualStyle || source.style),
    cameraStyle: safeText(source.cameraStyle),
    imageWidth: safeNumber(source.imageWidth, 1024),
    imageHeight: safeNumber(source.imageHeight, 576),
    steps: safeNumber(source.steps, 28),
    cfgScale: safeNumber(source.cfgScale, 7),
    sampler: safeText(source.sampler),
    characters: safeArray(source.characters),
    shots: safeArray(source.shots).map((shot) => normalizeShot(shot, sceneId)),
  };
}

function normalizeProject(project) {
  const source = safeObject(project, {});
  return {
    id: safeText(source.id, makeId("project")),
    title: safeText(source.title || source.name, "Afrawood Project"),
    name: safeText(source.name || source.title, "Afrawood Project"),
    type: safeText(source.type, "cinema"),
    language: safeText(source.language, "fa"),
    synopsis: safeText(source.synopsis),
    notes: safeText(source.notes),
    scenes: safeArray(source.scenes).map(normalizeScene),
    characters: safeArray(source.characters).map(normalizeCharacter),
    images: safeObject(source.images, {}),
    createdAt: safeText(source.createdAt, new Date().toISOString()),
    updatedAt: safeText(source.updatedAt, new Date().toISOString()),
  };
}

function firstSentence(text) {
  const source = safeText(text);
  if (!source) return "";
  const parts = source
    .split(/[\n.!؟]/)
    .map((item) => item.trim())
    .filter(Boolean);
  return parts[0] || source;
}

function inferMood(text) {
  const source = safeText(text).toLowerCase();

  if (
    source.includes("عاشقانه") ||
    source.includes("romantic") ||
    source.includes("love")
  ) {
    return "romantic";
  }

  if (
    source.includes("حماسی") ||
    source.includes("epic") ||
    source.includes("battle")
  ) {
    return "epic";
  }

  if (
    source.includes("غمگین") ||
    source.includes("sad") ||
    source.includes("tragic")
  ) {
    return "tragic";
  }

  if (
    source.includes("ترسناک") ||
    source.includes("horror") ||
    source.includes("dark")
  ) {
    return "dark";
  }

  return "cinematic";
}

function inferLighting(text) {
  const source = safeText(text).toLowerCase();

  if (source.includes("غروب") || source.includes("sunset") || source.includes("golden")) {
    return "golden hour cinematic light";
  }

  if (source.includes("شب") || source.includes("night")) {
    return "cinematic moonlight";
  }

  if (source.includes("صبح") || source.includes("morning")) {
    return "soft morning cinematic light";
  }

  if (source.includes("روز") || source.includes("day")) {
    return "natural daylight cinematic light";
  }

  return "cinematic dramatic light";
}

function inferTime(text) {
  const source = safeText(text).toLowerCase();

  if (source.includes("غروب") || source.includes("sunset")) return "sunset";
  if (source.includes("شب") || source.includes("night")) return "night";
  if (source.includes("صبح") || source.includes("morning")) return "morning";
  if (source.includes("روز") || source.includes("day")) return "day";

  return "";
}

function inferLocation(text) {
  const source = safeText(text).toLowerCase();

  const presets = [
    "باغ سلطنتی",
    "باغ",
    "قصر",
    "کاخ",
    "بیابان",
    "جنگل",
    "روستا",
    "شهر",
    "بازار",
    "دریا",
    "قلعه",
    "خیابان",
    "royal garden",
    "garden",
    "palace",
    "castle",
    "desert",
    "forest",
    "village",
    "city",
    "market",
    "sea",
    "street",
  ];

  const found = presets.find((item) => source.includes(item.toLowerCase()));
  return found || "";
}

function inferVisualStyle(text) {
  const source = safeText(text).toLowerCase();

  if (source.includes("historical") || source.includes("تاریخی")) {
    return "cinematic realistic historical film still";
  }

  if (
    source.includes("science fiction") ||
    source.includes("sci-fi") ||
    source.includes("علمی")
  ) {
    return "cinematic realistic science fiction film still";
  }

  if (source.includes("fantasy") || source.includes("فانتزی")) {
    return "cinematic realistic fantasy film still";
  }

  return "cinematic realistic film still";
}

function inferCamera(text) {
  const source = safeText(text).toLowerCase();

  if (
    source.includes("قدم") ||
    source.includes("walk") ||
    source.includes("walking") ||
    source.includes("حرکت")
  ) {
    return "cinematic tracking shot";
  }

  if (
    source.includes("close") ||
    source.includes("کلوز") ||
    source.includes("صورت")
  ) {
    return "cinematic close-up shot";
  }

  if (
    source.includes("wide") ||
    source.includes("لانگ") ||
    source.includes("محیط")
  ) {
    return "cinematic wide shot";
  }

  return "cinematic medium shot";
}

function extractCharacterCandidates(text) {
  const source = safeText(text);
  if (!source) return [];

  const candidates = [];
  const presets = [
    "Khosrow",
    "Shirin",
    "Farhad",
    "Romeo",
    "Juliet",
    "Majnun",
    "Layla",
    "خسرو",
    "شیرین",
    "فرهاد",
    "رومئو",
    "ژولیت",
    "مجنون",
    "لیلی",
  ];

  presets.forEach((name) => {
    if (source.toLowerCase().includes(name.toLowerCase())) {
      candidates.push(name);
    }
  });

  return uniqueList(candidates);
}

function createCharacterFromName(name) {
  const normalizedName = safeText(name, "Character");
  return normalizeCharacter({
    id: makeId("character"),
    name: normalizedName,
    prompt: `${normalizedName}, cinematic character, realistic face, same identity across shots`,
    appearance: "",
    wardrobe: "",
    facePrompt: normalizedName,
    consistencyPrompt: `same face in every shot, same identity, same character: ${normalizedName}`,
    lockPrompt: `locked face, locked identity, same actor, same character ${normalizedName}`,
    referenceMode: "auto",
    lockStrength: 0.88,
  });
}

function ensureCharacters(project, names = []) {
  const normalizedProject = normalizeProject(project);
  const currentCharacters = safeArray(normalizedProject.characters);
  const currentNames = currentCharacters.map((item) => safeText(item.name).toLowerCase());

  const nextCharacters = [...currentCharacters];

  uniqueList(names).forEach((name) => {
    if (!currentNames.includes(safeText(name).toLowerCase())) {
      nextCharacters.push(createCharacterFromName(name));
    }
  });

  return {
    ...normalizedProject,
    characters: nextCharacters,
  };
}

function findCharacterIdsByNames(project, names = []) {
  const lookup = safeArray(project.characters);
  const loweredNames = uniqueList(names).map((item) => item.toLowerCase());

  return lookup
    .filter((item) => loweredNames.includes(safeText(item.name).toLowerCase()))
    .map((item) => item.id);
}

function buildSceneTitle(text, index) {
  const title = firstSentence(text);
  return title || `Scene ${index}`;
}

function buildSceneFromIdea(idea, project) {
  const sceneTitle = buildSceneTitle(idea, safeArray(project.scenes).length + 1);
  const mood = inferMood(idea);
  const lighting = inferLighting(idea);
  const timeOfDay = inferTime(idea);
  const location = inferLocation(idea);
  const visualStyle = inferVisualStyle(idea);
  const candidateNames = extractCharacterCandidates(idea);
  const characterIds = findCharacterIdsByNames(project, candidateNames);

  return normalizeScene({
    id: makeId("scene"),
    title: sceneTitle,
    description: safeText(idea),
    location,
    timeOfDay,
    mood,
    lighting,
    visualStyle,
    cameraStyle: "cinematic controlled camera",
    characters: characterIds,
    shots: [],
  });
}

function buildShotSetFromIdea(idea, scene) {
  const characterIds = safeArray(scene.characters);
  const common = {
    sceneId: scene.id,
    lighting: scene.lighting,
    mood: scene.mood,
    location: scene.location,
    timeOfDay: scene.timeOfDay,
    visualStyle: scene.visualStyle,
    characters: characterIds,
  };

  const shot1 = normalizeShot(
    {
      id: makeId("shot"),
      ...common,
      title: "Shot 1",
      description: safeText(idea),
      prompt: safeText(idea),
      camera: inferCamera(idea),
    },
    scene.id
  );

  const shot2 = normalizeShot(
    {
      id: makeId("shot"),
      ...common,
      title: "Shot 2",
      description: `${firstSentence(idea)} - alternate cinematic angle`,
      prompt: `${safeText(idea)}, alternate cinematic angle, emotional detail`,
      camera: "cinematic medium shot",
    },
    scene.id
  );

  return [shot1, shot2];
}

function attachShotsToScene(scene, shots = []) {
  return normalizeScene({
    ...scene,
    shots: safeArray(shots).map((shot) => normalizeShot(shot, scene.id)),
  });
}

function mergeProjectWithScene(project, scene) {
  const normalizedProject = normalizeProject(project);
  return {
    ...normalizedProject,
    scenes: [...safeArray(normalizedProject.scenes), normalizeScene(scene)],
    updatedAt: new Date().toISOString(),
  };
}

function buildAssistantReply(input, pack) {
  const sceneTitle = safeText(pack?.scene?.title, "Scene");
  const shotCount = safeArray(pack?.shots).length;
  const characterNames = safeArray(pack?.characters)
    .map((item) => safeText(item.name))
    .filter(Boolean)
    .join("، ");

  return [
    "دستور انجام شد.",
    `Scene ساخته شد: ${sceneTitle}`,
    `تعداد Shot: ${shotCount}`,
    characterNames ? `کاراکترها: ${characterNames}` : "",
    safeText(input) ? `ایده: ${safeText(input)}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

async function askLocalAIText(prompt) {
  try {
    const response = await askAfraLocalAI(prompt);
    if (typeof response === "string") return response;
    if (response && typeof response.text === "string") return response.text;
    if (response && typeof response.message === "string") return response.message;
    return "";
  } catch {
    return "";
  }
}

function createScenePackFromIdea(idea, project) {
  const projectWithCharacters = ensureCharacters(project, extractCharacterCandidates(idea));
  const scene = buildSceneFromIdea(idea, projectWithCharacters);
  const shots = buildShotSetFromIdea(idea, scene);
  const completedScene = attachShotsToScene(scene, shots);
  const updatedProject = mergeProjectWithScene(projectWithCharacters, completedScene);

  return {
    project: updatedProject,
    scene: completedScene,
    shots,
    characters: safeArray(projectWithCharacters.characters),
  };
}

export async function runDirectorCommand(command, project = {}) {
  const normalizedProject = normalizeProject(project);
  const prompt = safeText(command);

  const localAIText = await askLocalAIText(prompt);
  const effectiveIdea = prompt || localAIText || "یک صحنه سینمایی بساز";

  const pack = createScenePackFromIdea(effectiveIdea, normalizedProject);

  return {
    ok: true,
    type: "director-command",
    input: prompt,
    localAIText,
    reply: buildAssistantReply(effectiveIdea, pack),
    project: pack.project,
    createdScene: pack.scene,
    createdShots: pack.shots,
    createdCharacters: pack.characters,
  };
}

export async function runDirectorCommandEngine(command, project = {}) {
  return runDirectorCommand(command, project);
}

export async function executeDirectorCommand(command, project = {}) {
  return runDirectorCommand(command, project);
}

export async function applyDirectorCommand(command, project = {}) {
  return runDirectorCommand(command, project);
}

export async function processDirectorCommand(command, project = {}) {
  return runDirectorCommand(command, project);
}

export function buildDirectorPlanFromText(text, project = {}) {
  const normalizedProject = normalizeProject(project);
  const pack = createScenePackFromIdea(text, normalizedProject);

  return {
    input: safeText(text),
    project: pack.project,
    scene: pack.scene,
    shots: pack.shots,
    characters: pack.characters,
    reply: buildAssistantReply(text, pack),
  };
}

export function createSceneFromDirectorIdea(text, project = {}) {
  const normalizedProject = normalizeProject(project);
  const pack = createScenePackFromIdea(text, normalizedProject);

  return {
    scene: pack.scene,
    shots: pack.shots,
    characters: pack.characters,
    project: pack.project,
  };
}

export function applyDirectorResultToProject(project = {}, result = {}) {
  const normalizedProject = normalizeProject(project);
  const nextProject = normalizeProject(result?.project || normalizedProject);

  return {
    ...clone(nextProject),
    updatedAt: new Date().toISOString(),
  };
}

export default runDirectorCommand;