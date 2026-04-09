// src/ai/core/scriptToShots.js

function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function text(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  const v = value.trim();
  return v || fallback;
}

function shortText(value, max = 220) {
  const v = text(value);
  if (!v) return "";
  if (v.length <= max) return v;
  return `${v.slice(0, max).trim()}...`;
}

function uniqueCharacters(dialogue = []) {
  const seen = new Set();
  const result = [];

  for (const item of dialogue) {
    const name = text(item?.character);
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(name);
  }

  return result;
}

function buildSceneBase(scene) {
  return {
    heading: text(scene?.heading),
    location: text(scene?.location, "Unknown location"),
    timeOfDay: text(scene?.timeOfDay, "Unknown time"),
    action: text(scene?.action),
    characters: uniqueCharacters(scene?.dialogue || []),
  };
}

function buildPrompt(parts) {
  return parts.filter(Boolean).join(", ");
}

function createCinematicShot({
  sceneId,
  sceneNumber,
  shotNumber,
  type,
  title,
  description,
  prompt,
}) {
  return {
    id: `scene-${sceneNumber}-shot-${shotNumber}-${slugify(type)}`,
    sceneId,
    shotNumber,

    title,
    description,

    shotType: type,
    shotSize:
      type === "establishing" ? "WS" :
      type === "dialogue" ? "CU" : "MCU",

    cameraAngle: "Eye Level",
    cameraMove: type === "establishing" ? "Static" : "Dolly Soft",

    lighting: "Cinematic lighting",
    composition: "Rule of thirds",

    directorNote:
      type === "establishing"
        ? "فضای صحنه را تعریف کن"
        : type === "dialogue"
        ? "تمرکز روی احساس"
        : "پیشبرد روایت",

    storyboardPrompt: prompt,

    location: "",
    timeOfDay: "",

    status: "draft",
  };
}

export function convertStructuredScriptToShotList(script) {
  const scenes = Array.isArray(script?.scenes) ? script.scenes : [];
  const genre = text(script?.genre);
  const tone = text(script?.tone);
  const title = text(script?.title, "Untitled");

  const shots = [];

  for (const scene of scenes) {
    const sceneNumber = Number(scene?.sceneNumber || shots.length + 1);
    const sceneId = `scene-${sceneNumber}`;

    const base = buildSceneBase(scene);
    let shotNumber = 1;

    // 🎬 Establishing
    shots.push(
      createCinematicShot({
        sceneId,
        sceneNumber,
        shotNumber: shotNumber++,
        type: "establishing",
        title: `Scene ${sceneNumber} - Establishing`,
        description: `${base.location} | ${base.timeOfDay}`,
        prompt: buildPrompt([
          "cinematic establishing shot",
          title,
          base.location,
          base.timeOfDay,
          genre,
          tone,
        ]),
      })
    );

    // 🎬 Action
    shots.push(
      createCinematicShot({
        sceneId,
        sceneNumber,
        shotNumber: shotNumber++,
        type: "action",
        title: `Scene ${sceneNumber} - Action`,
        description: shortText(base.action, 180),
        prompt: buildPrompt([
          "cinematic medium shot",
          base.action,
          base.characters.join(", "),
          genre,
          tone,
        ]),
      })
    );

    // 🎭 Dialogue shots
    const dialogue = Array.isArray(scene?.dialogue) ? scene.dialogue.slice(0, 3) : [];

    for (const line of dialogue) {
      shots.push(
        createCinematicShot({
          sceneId,
          sceneNumber,
          shotNumber: shotNumber++,
          type: "dialogue",
          title: `${line.character} Close-up`,
          description: shortText(line.line, 140),
          prompt: buildPrompt([
            "cinematic close-up",
            line.character,
            line.line,
            tone,
          ]),
        })
      );
    }
  }

  return shots;
}