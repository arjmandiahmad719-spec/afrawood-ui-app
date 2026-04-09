import {
  isAiEnabled,
  buildAfraPromptContext,
  requestAiText,
  requestStoryboardText,
  requestDialogueText,
} from "./aiClient";

const normalizeText = (value) => {
  if (value == null) return "";
  return String(value).trim();
};

const safeArray = (value) => (Array.isArray(value) ? value : []);

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const createLocalId = (prefix = "afra") => {
  const random = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${prefix}_${time}_${random}`;
};

const includesOneOf = (text, words) => {
  const source = normalizeText(text).toLowerCase();
  return safeArray(words).some((word) =>
    source.includes(normalizeText(word).toLowerCase())
  );
};

const getActiveScene = (state, sceneId = "") => {
  const targetId =
    normalizeText(sceneId) ||
    normalizeText(state?.ui?.activeSceneId) ||
    normalizeText(state?.memory?.references?.lastSceneId);

  if (!targetId) return null;

  return safeArray(state?.entities?.scenes).find((scene) => scene.id === targetId) || null;
};

const getActiveShot = (state, shotId = "") => {
  const targetId =
    normalizeText(shotId) ||
    normalizeText(state?.ui?.activeShotId) ||
    normalizeText(state?.memory?.references?.lastShotId);

  if (!targetId) return null;

  return safeArray(state?.entities?.shots).find((shot) => shot.id === targetId) || null;
};

const getSceneCharacters = (state, scene) => {
  if (!scene) return [];
  return safeArray(scene.characterIds)
    .map((characterId) =>
      safeArray(state?.entities?.characters).find((item) => item.id === characterId) || null
    )
    .filter(Boolean);
};

const detectDirectorIntent = (command = "") => {
  const text = normalizeText(command).toLowerCase();

  if (!text) return "general";

  if (
    includesOneOf(text, [
      "storyboard",
      "shot",
      "shots",
      "شات",
      "استوری‌بورد",
      "استوری بورد",
      "پلان",
    ])
  ) {
    return "storyboard";
  }

  if (includesOneOf(text, ["dialogue", "دیالوگ"])) return "dialogue";
  if (includesOneOf(text, ["خلاصه وضعیت", "وضعیت", "summary", "state", "status"])) {
    return "summary";
  }

  return "general";
};

const extractRequestedShotCount = (command = "") => {
  const text = normalizeText(command);
  const match = text.match(/\d+/);
  if (!match) return null;
  const count = Number(match[0]);
  if (!Number.isFinite(count)) return null;
  return clamp(count, 3, 8);
};

const inferSceneMoodFromCommand = (command = "") => {
  const text = normalizeText(command).toLowerCase();

  if (includesOneOf(text, ["عاشقانه", "love", "romance"])) return "عاشقانه";
  if (includesOneOf(text, ["ترس", "وحشت", "horror"])) return "ترسناک";
  if (includesOneOf(text, ["اکشن", "fight", "action"])) return "پرانرژی";
  if (includesOneOf(text, ["غم", "اندوه", "sad"])) return "اندوهگین";
  return "دراماتیک";
};

const inferSceneGenreFromCommand = (command = "") => {
  const text = normalizeText(command).toLowerCase();

  if (includesOneOf(text, ["عاشقانه"])) return "عاشقانه";
  if (includesOneOf(text, ["اکشن"])) return "اکشن";
  if (includesOneOf(text, ["ترس", "وحشت"])) return "وحشت";
  if (includesOneOf(text, ["کمدی"])) return "کمدی";
  return "درام";
};

const inferSceneLocationFromCommand = (command = "") => {
  const text = normalizeText(command).toLowerCase();

  if (includesOneOf(text, ["کافه", "cafe"])) return "کافه";
  if (includesOneOf(text, ["خیابان", "street"])) return "خیابان";
  if (includesOneOf(text, ["خانه", "home"])) return "خانه";
  if (includesOneOf(text, ["ماشین", "car"])) return "داخل ماشین";
  if (includesOneOf(text, ["بیمارستان", "hospital"])) return "بیمارستان";
  return "لوکیشن نامشخص";
};

const inferSceneTimeOfDayFromCommand = (command = "") => {
  const text = normalizeText(command).toLowerCase();

  if (includesOneOf(text, ["شب", "night"])) return "شب";
  if (includesOneOf(text, ["صبح", "morning"])) return "صبح";
  if (includesOneOf(text, ["غروب", "sunset", "عصر"])) return "غروب";
  if (includesOneOf(text, ["ظهر", "noon"])) return "ظهر";
  return "نامشخص";
};

const buildAutoSceneFromCommand = (state, command = "") => {
  const currentCount = safeArray(state?.entities?.scenes).length;
  const cleanSummary =
    normalizeText(command) || "یک صحنه اولیه برای شروع روند خودکار ساخته شده است.";

  return {
    id: createLocalId("scene"),
    title: `صحنه خودکار ${currentCount + 1}`,
    sceneNumber: currentCount + 1,
    location: inferSceneLocationFromCommand(command),
    timeOfDay: inferSceneTimeOfDayFromCommand(command),
    mood: inferSceneMoodFromCommand(command),
    genre: inferSceneGenreFromCommand(command),
    purpose: "آغاز خودکار روند ساخت صحنه از روی پیام کاربر",
    conflict: "تنش اصلی صحنه در ادامه توسعه پیدا می‌کند.",
    summary: cleanSummary,
    beatOutline: [
      "معرفی فضای اولیه",
      "ورود کنش اصلی",
      "شروع تنش یا سوال دراماتیک",
      "حرکت به سمت ضربه احساسی یا روایی",
    ],
    characterIds: [],
    dialogueIds: [],
    shotIds: [],
    status: "draft",
    metadata: {
      source: "auto-scene-from-chat",
      sourceCommand: normalizeText(command),
    },
  };
};

const buildSceneShotPlan = (scene, options = {}) => {
  const requestedCount = clamp(Number(options.shotCount) || 4, 3, 8);

  const beats = safeArray(scene?.beatOutline).length
    ? safeArray(scene.beatOutline)
    : [
        "معرفی فضای صحنه",
        "پیشروی کنش اصلی",
        "افزایش تنش",
        "ضربه یا پایان احساسی",
      ];

  const finalBeats = [];
  while (finalBeats.length < requestedCount) {
    finalBeats.push(beats[finalBeats.length] || beats[beats.length - 1] || "پیشروی صحنه");
  }

  return finalBeats.map((beat, index) => ({
    id: createLocalId("shot"),
    sceneId: normalizeText(scene?.id),
    shotNumber: index + 1,
    title:
      index === 0
        ? "استقرار فضا"
        : index === finalBeats.length - 1
        ? "ضربه احساسی"
        : `پلان ${index + 1}`,
    description:
      index === 0
        ? `نمای معرفی برای ${normalizeText(scene?.title) || "صحنه"}`
        : normalizeText(beat) || "پیشروی روایی صحنه",
    purpose:
      index === 0
        ? "معرفی فضا"
        : index === finalBeats.length - 1
        ? "پایان احساسی"
        : "پیشبرد روایت",
    shotType: index === 0 ? "Establishing" : index === finalBeats.length - 1 ? "Emotional Close" : "Narrative Coverage",
    shotSize: index === 0 ? "WS" : index === finalBeats.length - 1 ? "CU" : "MCU",
    lens: index === 0 ? "24mm" : index === finalBeats.length - 1 ? "85mm" : "50mm",
    cameraAngle: index === 0 ? "Eye Level Wide" : "Eye Level",
    cameraMove: index === 0 ? "Static" : "Dolly Soft",
    cameraHeight: "Character Eye Line",
    framing: index === 0 ? "Wide Establishing Frame" : "Subject-driven Framing",
    composition: index === 0 ? "Rule of Thirds Wide" : "Rule of Thirds",
    subject: normalizeText(beat) || normalizeText(scene?.title),
    subjectFocus: index === 0 ? "فضا و موقعیت صحنه" : "کنش اصلی صحنه",
    blocking: "چیدمان کاراکترها براساس مرکز تنش صحنه",
    action: normalizeText(beat) || "پیشروی کنش",
    lighting:
      normalizeText(scene?.timeOfDay) === "شب"
        ? "Low Key با کنتراست کنترل‌شده"
        : "نور سینمایی متعادل",
    colorTone:
      normalizeText(scene?.mood) === "عاشقانه" ? "گرم و طلایی" : "سینمایی و متناسب با صحنه",
    visualMood: normalizeText(scene?.mood) || "سینمایی و کنترل‌شده",
    atmosphere: "کنترل‌شده و سینمایی",
    soundNote: index === 0 ? "اتمسفر محیط" : "صدای کنش و فضای صحنه",
    transition: index === finalBeats.length - 1 ? "Cut on emotion" : "Straight Cut",
    durationEstimate: index === 0 ? "3-5s" : "3-4s",
    continuityNotes: "رعایت تداوم حرکت و خط فرضی",
    directorNote:
      index === 0
        ? "اول هندسه صحنه را روشن کن"
        : index === finalBeats.length - 1
        ? "روی احساس نهایی مکث کن"
        : "شات باید اطلاعات تازه بدهد",
    storyboardPrompt: `Cinematic storyboard frame, scene: ${
      scene?.title || "scene"
    }, location: ${scene?.location || ""}, mood: ${scene?.mood || ""}, shot size: ${
      index === 0 ? "WS" : index === finalBeats.length - 1 ? "CU" : "MCU"
    }`,
    tags: [normalizeText(scene?.mood), normalizeText(scene?.genre)].filter(Boolean),
    metadata: {
      source: "afra-copilot-storyboard",
    },
    status: "draft",
  }));
};

const buildStoryboardDraftText = (scene, shots = []) => {
  return [
    "Storyboard / Shot Plan",
    `صحنه: ${normalizeText(scene?.title) || "صحنه بدون عنوان"}`,
    ...safeArray(shots).flatMap((shot) => [
      `#${shot.shotNumber} | ${shot.title} | ${shot.shotSize} | ${shot.cameraAngle} | ${shot.cameraMove}`,
      `توضیح: ${shot.description}`,
      `هدف: ${shot.purpose}`,
      `نکته کارگردانی: ${shot.directorNote}`,
      "",
    ]),
  ].join("\n");
};

const buildSummaryResult = (state, command = "") => {
  const activeScene = getActiveScene(state);
  const activeShot = getActiveShot(state);

  const sceneShotCount = activeScene
    ? safeArray(state?.entities?.shots).filter((item) => item.sceneId === activeScene.id).length
    : 0;

  const sceneDialogueCount = activeScene
    ? safeArray(state?.entities?.dialogues).filter((item) => item.sceneId === activeScene.id).length
    : 0;

  return {
    ok: true,
    type: "summary",
    intent: "summary",
    command: normalizeText(command),
    sceneId: normalizeText(activeScene?.id),
    sceneTitle: normalizeText(activeScene?.title),
    assistantText: [
      activeScene ? `صحنه فعال: ${activeScene.title}` : "صحنه فعال: ندارد",
      activeShot ? `شات فعال: ${activeShot.title}` : "شات فعال: ندارد",
      activeScene ? `تعداد شات‌ها: ${sceneShotCount}` : "",
      activeScene ? `تعداد دیالوگ‌ها: ${sceneDialogueCount}` : "",
    ]
      .filter(Boolean)
      .join(" | "),
    draftText: "",
    shots: [],
    metadata: {},
    topics: ["summary"],
  };
};

const applyAutoScene = (actions, state, scene, command) => {
  if (!actions || !scene) return;

  if (typeof actions.addScene === "function") {
    actions.addScene(scene);
  }

  if (typeof actions.setUi === "function") {
    actions.setUi({
      activeSceneId: scene.id,
      activePanel: "chat",
    });
  }

  if (typeof actions.appendChatMessage === "function") {
    actions.appendChatMessage({
      role: "assistant",
      type: "scene-auto-create",
      text: `صحنه «${scene.title}» به‌صورت خودکار از روی پیام تو ساخته و فعال شد.`,
      meta: {
        resultType: "scene-auto-create",
        sceneId: scene.id,
        sourceCommand: normalizeText(command),
      },
    });
  }
};

const applyStoryboardResult = (actions, state, scene, result) => {
  if (!actions || !scene || !result?.ok) return;

  if (typeof actions.clearSceneShots === "function") {
    actions.clearSceneShots(scene.id);
  }

  if (typeof actions.addShots === "function") {
    actions.addShots(result.shots);
  } else if (typeof actions.addShot === "function") {
    result.shots.forEach((shot) => actions.addShot(shot));
  }

  if (typeof actions.setOutputs === "function") {
    actions.setOutputs({
      generatedStoryboardDraft: result.draftText,
      lastIntentResult: {
        type: "storyboard",
        sceneId: scene.id,
        sceneTitle: scene.title,
        shotCount: result.shots.length,
        command: result.command,
      },
    });
  }

  if (typeof actions.setAssistantState === "function") {
    actions.setAssistantState({
      activeIntent: "storyboard",
      activeTask: "shot-planning",
      lastCommand: result.command,
    });
  }

  if (typeof actions.setUi === "function") {
    actions.setUi({
      activeSceneId: scene.id,
      activeShotId: result.shots[0]?.id || "",
    });
  }

  if (typeof actions.appendChatMessage === "function") {
    actions.appendChatMessage({
      role: "assistant",
      type: "copilot-result",
      text: result.assistantText,
      meta: {
        resultType: "storyboard",
        sceneId: scene.id,
      },
    });
  }
};

const applyDialogueResult = (actions, state, scene, result) => {
  if (!actions || !scene || !result?.ok) return;

  if (typeof actions.setOutputs === "function") {
    actions.setOutputs({
      generatedDialogueDraft: result.draftText,
      lastIntentResult: {
        type: "dialogue",
        sceneId: scene.id,
        sceneTitle: scene.title,
        command: result.command,
      },
    });
  }

  if (typeof actions.setAssistantState === "function") {
    actions.setAssistantState({
      activeIntent: "dialogue",
      activeTask: "dialogue-generation",
      lastCommand: result.command,
    });
  }

  if (typeof actions.appendChatMessage === "function") {
    actions.appendChatMessage({
      role: "assistant",
      type: "copilot-result",
      text: result.assistantText,
      meta: {
        resultType: "dialogue",
        sceneId: scene.id,
      },
    });

    actions.appendChatMessage({
      role: "assistant",
      type: "dialogue-draft",
      text: result.draftText,
      meta: {
        resultType: "dialogue-draft",
        sceneId: scene.id,
      },
    });
  }
};

const applyGeneralResult = (actions, result) => {
  if (!actions || !result?.ok) return;

  if (typeof actions.appendChatMessage === "function") {
    actions.appendChatMessage({
      role: "assistant",
      type: "copilot-result",
      text: result.assistantText,
      meta: {
        resultType: result.type || "general",
      },
    });
  }
};

const buildHistoryFromChat = (state) => {
  return safeArray(state?.chat?.messages)
    .slice(-10)
    .map((item) => ({
      role: item?.role,
      content: item?.text,
    }))
    .filter((item) => normalizeText(item.content));
};

const buildRuleBasedResponse = (state, command = "") => {
  const intent = detectDirectorIntent(command);
  const scene = getActiveScene(state);

  if (intent === "storyboard") {
    const shots = buildSceneShotPlan(scene, {
      shotCount: extractRequestedShotCount(command),
    });

    return {
      ok: true,
      type: "storyboard",
      intent: "storyboard",
      command: normalizeText(command),
      sceneId: normalizeText(scene?.id),
      sceneTitle: normalizeText(scene?.title),
      shots,
      draftText: buildStoryboardDraftText(scene, shots),
      assistantText: `برای صحنه «${scene?.title || "صحنه"}» تعداد ${shots.length} شات ساخته شد.`,
      metadata: {
        source: "rule-based",
      },
      topics: ["storyboard", normalizeText(scene?.title)],
    };
  }

  if (intent === "dialogue") {
    return {
      ok: true,
      type: "dialogue",
      intent: "dialogue",
      command: normalizeText(command),
      sceneId: normalizeText(scene?.id),
      sceneTitle: normalizeText(scene?.title),
      shots: [],
      draftText: "AI در دسترس نیست. برای دیالوگ حرفه‌ای، AI واقعی را فعال کن.",
      assistantText: `برای صحنه «${scene?.title || "صحنه"}» حالت دیالوگ آماده شد.`,
      metadata: {
        source: "rule-based",
      },
      topics: ["dialogue", normalizeText(scene?.title)],
    };
  }

  if (intent === "summary") {
    return buildSummaryResult(state, command);
  }

  return {
    ok: true,
    type: "general",
    intent: "general",
    command: normalizeText(command),
    sceneId: normalizeText(scene?.id),
    sceneTitle: normalizeText(scene?.title),
    shots: [],
    draftText: "",
    assistantText: "دستور دریافت شد.",
    metadata: {
      source: "rule-based",
    },
    topics: ["general"],
  };
};

const tryAiStoryboard = async (state, command) => {
  const scene = getActiveScene(state);
  const activeShot = getActiveShot(state);
  const characters = getSceneCharacters(state, scene);

  const shots = buildSceneShotPlan(scene, {
    shotCount: extractRequestedShotCount(command),
  });

  const contextText = buildAfraPromptContext({
    project: state?.project?.current || null,
    scene,
    shot: activeShot,
    characters,
    userCommand: command,
  });

  const aiResponse = await requestStoryboardText({
    contextText,
    userCommand: command,
    history: buildHistoryFromChat(state),
  });

  return {
    ok: true,
    type: "storyboard",
    intent: "storyboard",
    command: normalizeText(command),
    sceneId: normalizeText(scene?.id),
    sceneTitle: normalizeText(scene?.title),
    shots,
    draftText: normalizeText(aiResponse.text) || buildStoryboardDraftText(scene, shots),
    assistantText: `برای صحنه «${scene?.title || "صحنه"}» تعداد ${shots.length} شات ساخته شد.`,
    metadata: {
      source: "ai",
    },
    topics: ["storyboard", normalizeText(scene?.title)],
  };
};

const tryAiDialogue = async (state, command) => {
  const scene = getActiveScene(state);
  const activeShot = getActiveShot(state);
  const characters = getSceneCharacters(state, scene);

  const dialogueMode = includesOneOf(command, ["بدون دیالوگ", "silent"])
    ? "none"
    : includesOneOf(command, ["کم‌دیالوگ", "کم دیالوگ", "minimal"])
    ? "low"
    : "full";

  const contextText = buildAfraPromptContext({
    project: state?.project?.current || null,
    scene,
    shot: activeShot,
    characters,
    dialogueMode,
    userCommand: command,
  });

  const aiResponse = await requestDialogueText({
    contextText,
    userCommand: command,
    history: buildHistoryFromChat(state),
    dialogueMode,
  });

  return {
    ok: true,
    type: "dialogue",
    intent: "dialogue",
    command: normalizeText(command),
    sceneId: normalizeText(scene?.id),
    sceneTitle: normalizeText(scene?.title),
    shots: [],
    draftText: normalizeText(aiResponse.text),
    assistantText: `دیالوگ برای صحنه «${scene?.title || "صحنه"}» ساخته شد.`,
    metadata: {
      source: "ai",
    },
    topics: ["dialogue", normalizeText(scene?.title)],
  };
};

const tryAiGeneral = async (state, command) => {
  const scene = getActiveScene(state);
  const shot = getActiveShot(state);
  const characters = getSceneCharacters(state, scene);

  const contextText = buildAfraPromptContext({
    project: state?.project?.current || null,
    scene,
    shot,
    characters,
    userCommand: command,
  });

  const aiResponse = await requestAiText({
    mode: "general",
    userPrompt: [
      "Respond in fluent Persian.",
      "Be concise, practical, and cinematic.",
      "",
      "Context:",
      contextText,
      "",
      "User Command:",
      normalizeText(command),
    ].join("\n"),
    history: buildHistoryFromChat(state),
    temperature: 0.7,
    maxTokens: 1000,
  });

  return {
    ok: true,
    type: "general",
    intent: "general",
    command: normalizeText(command),
    sceneId: normalizeText(scene?.id),
    sceneTitle: normalizeText(scene?.title),
    shots: [],
    draftText: "",
    assistantText: normalizeText(aiResponse.text),
    metadata: {
      source: "ai",
    },
    topics: ["general"],
  };
};

export const buildStoryboardFromScene = (scene, options = {}) => {
  const shots = buildSceneShotPlan(scene, options);
  return {
    ok: true,
    type: "storyboard",
    intent: "storyboard",
    command: "manual-storyboard-build",
    sceneId: normalizeText(scene?.id),
    sceneTitle: normalizeText(scene?.title),
    shots,
    draftText: buildStoryboardDraftText(scene, shots),
    assistantText: `برای صحنه «${scene?.title || "صحنه"}» تعداد ${shots.length} شات ساخته شد.`,
    metadata: {
      source: "rule-based",
    },
    topics: ["storyboard"],
  };
};

export const generateSceneStoryboard = (scene, options = {}) => {
  const shots = buildSceneShotPlan(scene, options);
  return {
    scene,
    shots,
    draftText: buildStoryboardDraftText(scene, shots),
  };
};

export const createStoryboardPrompt = (scene, shot) =>
  `Cinematic storyboard frame, scene: ${normalizeText(scene?.title)}, shot: ${normalizeText(
    shot?.title
  )}`;

export const getActiveSceneSnapshot = (state, sceneId = "") => {
  const scene = getActiveScene(state, sceneId);
  if (!scene) return null;

  return {
    id: scene.id,
    title: scene.title,
    location: scene.location,
    timeOfDay: scene.timeOfDay,
    mood: scene.mood,
    summary: scene.summary,
    conflict: scene.conflict,
    beatOutline: safeArray(scene.beatOutline),
    characterIds: safeArray(scene.characterIds),
    dialogueIds: safeArray(scene.dialogueIds),
    shotIds: safeArray(scene.shotIds),
  };
};

export const runCopilotDirectorCommand = async (contextOrParams, commandInput = "") => {
  const hasStateShape =
    contextOrParams &&
    typeof contextOrParams === "object" &&
    Object.prototype.hasOwnProperty.call(contextOrParams, "state");

  const rawState = hasStateShape ? contextOrParams.state : contextOrParams?.state;
  const actions = hasStateShape ? contextOrParams.actions : contextOrParams?.actions;

  const command =
    typeof commandInput === "string" && commandInput.trim()
      ? commandInput
      : normalizeText(contextOrParams?.command) ||
        normalizeText(contextOrParams?.userInput) ||
        normalizeText(contextOrParams?.prompt);

  let workingState = rawState || {};
  let workingScene = getActiveScene(workingState);
  let result;

  try {
    const needsScene = detectDirectorIntent(command) !== "summary";

    if (!workingScene && needsScene) {
      const autoScene = buildAutoSceneFromCommand(workingState, command);
      applyAutoScene(actions, workingState, autoScene, command);

      workingState = {
        ...workingState,
        entities: {
          ...workingState.entities,
          scenes: [...safeArray(workingState?.entities?.scenes), autoScene],
        },
        ui: {
          ...workingState.ui,
          activeSceneId: autoScene.id,
        },
      };

      workingScene = autoScene;
    }

    if (await isAiEnabled()) {
      const intent = detectDirectorIntent(command);

      if (intent === "storyboard") {
        result = await tryAiStoryboard(workingState, command);
      } else if (intent === "dialogue") {
        result = await tryAiDialogue(workingState, command);
      } else if (intent === "summary") {
        result = buildSummaryResult(workingState, command);
      } else {
        result = await tryAiGeneral(workingState, command);
      }
    } else {
      result = buildRuleBasedResponse(workingState, command);
    }
  } catch (error) {
    if (typeof actions?.appendChatMessage === "function") {
      actions.appendChatMessage({
        role: "assistant",
        type: "copilot-error",
        text:
          error instanceof Error
            ? `AI در دسترس نبود، از موتور داخلی استفاده شد. ${error.message}`
            : "AI در دسترس نبود، از موتور داخلی استفاده شد.",
        meta: {
          source: "ai-fallback",
        },
      });
    }

    result = buildRuleBasedResponse(workingState, command);
  }

  if (result?.type === "storyboard" && result.ok) {
    const scene = getActiveScene(workingState, result.sceneId);
    applyStoryboardResult(actions, workingState, scene, result);
  } else if (result?.type === "dialogue" && result.ok) {
    const scene = getActiveScene(workingState, result.sceneId);
    applyDialogueResult(actions, workingState, scene, result);
  } else if (result?.ok) {
    applyGeneralResult(actions, result);
  }

  return result;
};

export const runCopilotCommand = runCopilotDirectorCommand;

export default {
  detectDirectorIntent,
  buildStoryboardFromScene,
  generateSceneStoryboard,
  runCopilotDirectorCommand,
  runCopilotCommand,
  createStoryboardPrompt,
  getActiveSceneSnapshot,
};