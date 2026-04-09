/* =========================================
   Afrawood Script AI
   Phase 4 - Improved Local Script Engine
   Safe, deterministic, UI-friendly
========================================= */

const SUPPORTED_LANGUAGES = ["fa", "en", "tr", "fr"];
const SUPPORTED_PLATFORMS = ["youtube", "instagram", "tiktok", "twitter"];
const SUPPORTED_FORMATS = ["short_film", "feature_film", "series"];

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function safeNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(Math.max(n, min), max);
}

function slugify(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function chooseLanguage(language) {
  const lang = normalizeText(language).toLowerCase();
  return SUPPORTED_LANGUAGES.includes(lang) ? lang : "en";
}

function choosePlatform(platform) {
  const p = normalizeText(platform).toLowerCase();
  return SUPPORTED_PLATFORMS.includes(p) ? p : "youtube";
}

function chooseFormat(format, duration) {
  const f = normalizeText(format).toLowerCase();

  if (SUPPORTED_FORMATS.includes(f)) return f;

  const d = safeNumber(duration, 5);
  if (d <= 20) return "short_film";
  if (d <= 120) return "feature_film";
  return "series";
}

function getDurationProfile(format, duration) {
  const d = clamp(safeNumber(duration, 5), 1, 180);

  if (format === "short_film") {
    return {
      durationMinutes: d,
      sceneCount: d <= 3 ? 3 : d <= 10 ? 5 : 7,
      shotsPerScene: d <= 3 ? 3 : 4,
      dialogueDensity: d <= 3 ? "low" : "medium",
    };
  }

  if (format === "feature_film") {
    return {
      durationMinutes: d,
      sceneCount: d <= 70 ? 8 : d <= 100 ? 10 : 12,
      shotsPerScene: 4,
      dialogueDensity: "medium",
    };
  }

  return {
    durationMinutes: d,
    sceneCount: 10,
    shotsPerScene: 4,
    dialogueDensity: "medium",
  };
}

function getLexicon(language) {
  const fa = {
    engineName: "Afrawood Local Script Engine",
    untitled: "پروژه بدون عنوان",
    loglineLabel: "لاگ‌لاین",
    synopsisLabel: "خلاصه داستان",
    themeLabel: "تم",
    visualStyleLabel: "سبک بصری",
    endingLabel: "نوع پایان",
    characterGoal: "هدف شخصیت",
    characterFear: "ترس شخصیت",
    characterChange: "مسیر تحول",
    scene: "صحنه",
    shot: "شات",
    dialogue: "دیالوگ",
    conflict: "تعارض",
    climax: "اوج",
    resolution: "جمع‌بندی",
    opening: "آغاز",
    midpoint: "میانه",
    ending: "پایان",
    narration: "روایت",
    cinematic: "سینمایی",
    dramatic: "دراماتیک",
    emotional: "احساسی",
    suspenseful: "تعلیق‌آمیز",
    intimate: "صمیمی",
    atmospheric: "اتمسفریک",
    voicePrompt:
      "You are Afrawood AI Studio copilot. Help with cinematic writing, directing, dialogue, storyboard planning, scene design. Return practical, clean, production-friendly output. If Persian input, respond in fluent Persian. Keep responses structured and useful.",
    templates: {
      title: ({ topic, genre }) => `${topic} | ${genre}`,
      logline: ({ protagonist, desire, obstacle, stakes }) =>
        `${protagonist} باید ${desire} را به دست بیاورد، اما ${obstacle} او را متوقف می‌کند و اگر شکست بخورد، ${stakes}.`,
      synopsis: ({ protagonist, inciting, escalation, climax, ending }) =>
        `${protagonist} با ${inciting} وارد بحران می‌شود. سپس ${escalation}. در نقطه اوج، ${climax}. در پایان، ${ending}.`,
      sceneTitle: (i, beat) => `صحنه ${i}: ${beat}`,
      sceneSummary: ({ location, time, action, tension }) =>
        `در ${location} و ${time}، ${action}. تنش اصلی: ${tension}.`,
      shotDescription: ({ shotType, cameraAngle, action, mood }) =>
        `${shotType} با زاویه ${cameraAngle}. ${action}. حال‌وهوا: ${mood}.`,
      dialogueLineA: ({ name, goal }) => `${name}: من فقط می‌خوام ${goal}.`,
      dialogueLineB: ({ name, obstacle }) => `${name}: مشکل اینه که ${obstacle}.`,
      endingClosed: "قهرمان به پاسخ مشخصی می‌رسد و مسیر روشن می‌شود",
      endingOpen: "پایان باز می‌ماند و پرسش اصلی در ذهن مخاطب ادامه پیدا می‌کند",
      endingBittersweet: "قهرمان چیزی را به دست می‌آورد اما هزینه احساسی آن را می‌پردازد",
    },
  };

  const en = {
    engineName: "Afrawood Local Script Engine",
    untitled: "Untitled Project",
    loglineLabel: "Logline",
    synopsisLabel: "Synopsis",
    themeLabel: "Theme",
    visualStyleLabel: "Visual Style",
    endingLabel: "Ending Type",
    characterGoal: "Goal",
    characterFear: "Fear",
    characterChange: "Arc",
    scene: "Scene",
    shot: "Shot",
    dialogue: "Dialogue",
    conflict: "Conflict",
    climax: "Climax",
    resolution: "Resolution",
    opening: "Opening",
    midpoint: "Midpoint",
    ending: "Ending",
    narration: "Narration",
    cinematic: "cinematic",
    dramatic: "dramatic",
    emotional: "emotional",
    suspenseful: "suspenseful",
    intimate: "intimate",
    atmospheric: "atmospheric",
    voicePrompt:
      "You are Afrawood AI Studio copilot. Help with cinematic writing, directing, dialogue, storyboard planning, scene design. Return practical, clean, production-friendly output.",
    templates: {
      title: ({ topic, genre }) => `${topic} | ${genre}`,
      logline: ({ protagonist, desire, obstacle, stakes }) =>
        `${protagonist} must ${desire}, but ${obstacle} stands in the way, and if they fail, ${stakes}.`,
      synopsis: ({ protagonist, inciting, escalation, climax, ending }) =>
        `${protagonist} is pulled into crisis by ${inciting}. Then ${escalation}. At the climax, ${climax}. In the end, ${ending}.`,
      sceneTitle: (i, beat) => `Scene ${i}: ${beat}`,
      sceneSummary: ({ location, time, action, tension }) =>
        `At ${location}, ${time}, ${action}. Core tension: ${tension}.`,
      shotDescription: ({ shotType, cameraAngle, action, mood }) =>
        `${shotType} with ${cameraAngle} angle. ${action}. Mood: ${mood}.`,
      dialogueLineA: ({ name, goal }) => `${name}: I just need to ${goal}.`,
      dialogueLineB: ({ name, obstacle }) => `${name}: The problem is ${obstacle}.`,
      endingClosed: "the protagonist reaches a clear answer and the path becomes visible",
      endingOpen: "the ending remains open and the central question lingers",
      endingBittersweet: "the protagonist gains something valuable but pays an emotional price",
    },
  };

  const tr = {
    ...en,
    untitled: "İsimsiz Proje",
    loglineLabel: "Logline",
    synopsisLabel: "Özet",
    themeLabel: "Tema",
    visualStyleLabel: "Görsel Stil",
    endingLabel: "Bitiş Türü",
    characterGoal: "Hedef",
    characterFear: "Korku",
    characterChange: "Dönüşüm",
  };

  const fr = {
    ...en,
    untitled: "Projet sans titre",
    synopsisLabel: "Synopsis",
    themeLabel: "Thème",
    visualStyleLabel: "Style visuel",
    endingLabel: "Type de fin",
    characterGoal: "Objectif",
    characterFear: "Peur",
    characterChange: "Arc",
  };

  if (language === "fa") return fa;
  if (language === "tr") return tr;
  if (language === "fr") return fr;
  return en;
}

function inferTonePack(tone, language) {
  const t = normalizeText(tone).toLowerCase();
  const lx = getLexicon(language);

  if (t.includes("dark") || t.includes("noir")) {
    return {
      mood: lx.suspenseful,
      lighting: "low-key lighting",
      palette: "deep shadows, cold highlights",
      camera: "slow controlled movement",
    };
  }

  if (t.includes("romantic") || t.includes("love")) {
    return {
      mood: lx.emotional,
      lighting: "soft diffused lighting",
      palette: "warm skin tones, gentle contrast",
      camera: "intimate close-ups",
    };
  }

  if (t.includes("thriller") || t.includes("suspense")) {
    return {
      mood: lx.suspenseful,
      lighting: "hard contrast lighting",
      palette: "muted colors, sharp contrast",
      camera: "tense framing and gradual push-ins",
    };
  }

  return {
    mood: lx.cinematic,
    lighting: "cinematic natural lighting",
    palette: "controlled cinematic palette",
    camera: "balanced cinematic coverage",
  };
}

function inferGenrePack(genre) {
  const g = normalizeText(genre).toLowerCase();

  if (g.includes("drama")) {
    return {
      protagonistRole: "a wounded but determined protagonist",
      desire: "save what still matters",
      obstacle: "their own past and a growing external pressure",
      stakes: "they lose the last meaningful connection in their life",
      theme: "healing through difficult truth",
      visualStyle: "realistic, intimate, performance-driven",
    };
  }

  if (g.includes("thriller")) {
    return {
      protagonistRole: "an alert but vulnerable protagonist",
      desire: "uncover the truth before it is too late",
      obstacle: "misdirection, fear, and an unseen threat",
      stakes: "the danger reaches someone they love",
      theme: "truth has a personal cost",
      visualStyle: "tense, controlled, high-contrast",
    };
  }

  if (g.includes("horror")) {
    return {
      protagonistRole: "a fragile protagonist trying to stay rational",
      desire: "survive the night and protect another person",
      obstacle: "a force they cannot fully understand",
      stakes: "their identity and safety collapse",
      theme: "fear reveals hidden guilt",
      visualStyle: "atmospheric, shadow-heavy, sensory",
    };
  }

  if (g.includes("comedy")) {
    return {
      protagonistRole: "a lovable but impulsive protagonist",
      desire: "fix a problem before it becomes public",
      obstacle: "their own bad decisions multiply the chaos",
      stakes: "they lose face, trust, and opportunity",
      theme: "honesty is easier than performance",
      visualStyle: "light, rhythmic, character-driven",
    };
  }

  if (g.includes("sci") || g.includes("science")) {
    return {
      protagonistRole: "a curious protagonist facing a world-changing anomaly",
      desire: "understand the anomaly and control its consequences",
      obstacle: "limited time, unstable technology, and moral doubt",
      stakes: "a private choice affects many lives",
      theme: "progress without wisdom is dangerous",
      visualStyle: "clean, immersive, futuristic realism",
    };
  }

  return {
    protagonistRole: "a conflicted protagonist",
    desire: "make a difficult but necessary choice",
    obstacle: "internal doubt and external resistance",
    stakes: "something deeply personal is lost forever",
    theme: "identity is formed under pressure",
    visualStyle: "cinematic, emotional, character-centered",
  };
}

function inferPlatformPack(platform) {
  if (platform === "instagram" || platform === "tiktok") {
    return {
      ratio: "9:16",
      rhythm: "fast",
      recommendation: "Keep scenes punchy, clear, and emotionally direct.",
    };
  }

  if (platform === "twitter") {
    return {
      ratio: "1:1",
      rhythm: "compact",
      recommendation: "Use concise beats and quick visual hooks.",
    };
  }

  return {
    ratio: "16:9",
    rhythm: "balanced",
    recommendation: "Allow stronger visual development and smoother scene transitions.",
  };
}

function inferEnding(endingType, language) {
  const lx = getLexicon(language);
  const e = normalizeText(endingType).toLowerCase();

  if (e.includes("open")) return { type: "open", text: lx.templates.endingOpen };
  if (e.includes("bitter")) return { type: "bittersweet", text: lx.templates.endingBittersweet };
  return { type: "closed", text: lx.templates.endingClosed };
}

function buildCharacters(topic, genrePack, language) {
  const lang = chooseLanguage(language);

  if (lang === "fa") {
    return [
      {
        id: "char-1",
        name: "آرمان",
        role: "قهرمان",
        goal: "حقیقت را پیدا کند و چیزی ارزشمند را نجات دهد",
        fear: "دیر فهمیدن و از دست دادن آخرین فرصت",
        arc: "از تردید به تصمیم",
      },
      {
        id: "char-2",
        name: "رها",
        role: "نیروی مقابل / آینه احساسی",
        goal: "قهرمان را وادار به مواجهه با واقعیت کند",
        fear: "تکرار گذشته",
        arc: "از کنترل به آسیب‌پذیری",
      },
      {
        id: "char-3",
        name: "سایه",
        role: "فشار بیرونی",
        goal: `بر بحران مرتبط با ${topic} سلطه پیدا کند`,
        fear: "از دست دادن قدرت",
        arc: "از اطمینان به فروپاشی",
      },
    ];
  }

  return [
    {
      id: "char-1",
      name: "Arman",
      role: "Protagonist",
      goal: "find the truth and save something valuable",
      fear: "understanding too late and losing the last chance",
      arc: "from hesitation to decision",
    },
    {
      id: "char-2",
      name: "Raha",
      role: "Emotional counterforce",
      goal: "force the protagonist to face reality",
      fear: "repeating the past",
      arc: "from control to vulnerability",
    },
    {
      id: "char-3",
      name: "Shadow",
      role: "External pressure",
      goal: `gain control over the crisis around ${topic}`,
      fear: "losing power",
      arc: "from certainty to collapse",
    },
  ];
}

function buildBeats(sceneCount, language) {
  const lx = getLexicon(language);

  const base = [
    lx.opening,
    "Inciting Incident",
    "Rising Pressure",
    lx.midpoint,
    "Reversal",
    "Moral Choice",
    lx.climax,
    lx.resolution,
    lx.ending,
  ];

  const beats = [];
  for (let i = 0; i < sceneCount; i += 1) {
    beats.push(base[i] || `Beat ${i + 1}`);
  }
  return beats;
}

function buildLocations(topic, language) {
  if (language === "fa") {
    return [
      `یک فضای شهری مرتبط با ${topic}`,
      "داخل خانه‌ای قدیمی و ساکت",
      "خیابانی خلوت در شب",
      "پشت‌بام با دید باز به شهر",
      "راهرویی باریک و پرتنش",
      "ماشین در حال حرکت",
      "اتاقی با نور کنترل‌شده",
    ];
  }

  return [
    `an urban space tied to ${topic}`,
    "an old quiet house interior",
    "a nearly empty street at night",
    "a rooftop overlooking the city",
    "a narrow high-tension corridor",
    "a moving car interior",
    "a room with controlled lighting",
  ];
}

function buildActionLine({ beat, topic, protagonistName, antagonistName, language }) {
  if (language === "fa") {
    const map = {
      آغاز: `${protagonistName} در وضعیت عادی معرفی می‌شود اما نشانه‌ای از شکاف درونی او دیده می‌شود.`,
      "Inciting Incident": `یک اتفاق غیرمنتظره درباره ${topic} تعادل را می‌شکند و ${protagonistName} را وارد مسیر اصلی می‌کند.`,
      "Rising Pressure": `${antagonistName} یا نیروی فشار بیرونی، انتخاب‌ها را محدودتر می‌کند.`,
      میانه: `${protagonistName} تصور می‌کند پاسخ را پیدا کرده اما بهای آن بیشتر از انتظار است.`,
      Reversal: `اطلاعات تازه همه چیز را برعکس می‌کند.`,
      "Moral Choice": `${protagonistName} بین امنیت و حقیقت مجبور به انتخاب می‌شود.`,
      اوج: `تقابل نهایی شکل می‌گیرد و تصمیم غیرقابل بازگشت گرفته می‌شود.`,
      جمع‌بندی: `پیامد تصمیم آشکار می‌شود و زخم اصلی داستان دیده می‌شود.`,
      پایان: `نتیجه احساسی داستان روی چهره شخصیت می‌ماند.`,
    };
    return map[beat] || `${protagonistName} درگیر مرحله تازه‌ای از بحران مربوط به ${topic} می‌شود.`;
  }

  const map = {
    Opening: `${protagonistName} is introduced in a fragile normal state, with a visible internal crack.`,
    "Inciting Incident": `An unexpected event around ${topic} breaks the balance and launches the central journey.`,
    "Rising Pressure": `${antagonistName} or the outside pressure makes every option narrower.`,
    Midpoint: `${protagonistName} believes the answer is close, but the cost is greater than expected.`,
    Reversal: `New information turns the meaning of prior events upside down.`,
    "Moral Choice": `${protagonistName} must choose between safety and truth.`,
    Climax: `The final confrontation arrives and an irreversible choice is made.`,
    Resolution: `The consequence of that choice becomes visible.`,
    Ending: `The emotional result settles on the character's face and body.`,
  };
  return map[beat] || `${protagonistName} enters a new stage of the crisis around ${topic}.`;
}

function buildTensionLine({ beat, topic, language }) {
  if (language === "fa") {
    if (beat === "اوج") return `اگر این لحظه شکست بخورد، پیامد بحران ${topic} غیرقابل جبران می‌شود.`;
    if (beat === "میانه") return `قهرمان می‌فهمد بحران ${topic} شخصی‌تر از چیزی است که فکر می‌کرد.`;
    return `فشار بیرونی و درونی هر دو شدیدتر می‌شوند و ${topic} هزینه بیشتری پیدا می‌کند.`;
  }

  if (beat === "Climax") return `If this moment fails, the crisis around ${topic} becomes irreversible.`;
  if (beat === "Midpoint") return `The protagonist realizes the ${topic} crisis is far more personal than expected.`;
  return `Outer and inner pressure intensify, making ${topic} more costly.`;
}

function buildScene({
  index,
  beat,
  topic,
  genre,
  tone,
  language,
  protagonist,
  counterpart,
  location,
  profile,
}) {
  const lx = getLexicon(language);
  const tonePack = inferTonePack(tone, language);
  const action = buildActionLine({
    beat,
    topic,
    protagonistName: protagonist.name,
    antagonistName: counterpart.name,
    language,
  });
  const tension = buildTensionLine({ beat, topic, language });

  const time = index % 2 === 0 ? "night" : "day";
  const localizedTime =
    language === "fa" ? (time === "night" ? "شب" : "روز") : time;

  const title = lx.templates.sceneTitle(index, beat);
  const description = lx.templates.sceneSummary({
    location,
    time: localizedTime,
    action,
    tension,
  });

  const shots = buildShots({
    sceneIndex: index,
    beat,
    topic,
    language,
    protagonist,
    counterpart,
    location,
    tonePack,
    shotCount: profile.shotsPerScene,
  });

  const dialogue = buildDialogue({
    beat,
    topic,
    language,
    protagonist,
    counterpart,
    density: profile.dialogueDensity,
  });

  return {
    id: `scene-${index}`,
    index,
    title,
    beat,
    description,
    summary: description,
    location,
    time: localizedTime,
    genre,
    tone,
    mood: tonePack.mood,
    lighting: tonePack.lighting,
    palette: tonePack.palette,
    cameraStyle: tonePack.camera,
    tension,
    shots,
    dialogue,
  };
}

function buildShots({
  sceneIndex,
  beat,
  topic,
  language,
  protagonist,
  counterpart,
  location,
  tonePack,
  shotCount,
}) {
  const lx = getLexicon(language);
  const templates = [
    {
      shotType: "wide",
      cameraAngle: "eye level",
      action:
        language === "fa"
          ? `${location} و موقعیت شخصیت‌ها را معرفی می‌کند`
          : `introduces ${location} and the character positions`,
    },
    {
      shotType: "medium",
      cameraAngle: "slight low angle",
      action:
        language === "fa"
          ? `${protagonist.name} را در لحظه تصمیم یا تردید دنبال می‌کند`
          : `tracks ${protagonist.name} at a point of decision or hesitation`,
    },
    {
      shotType: "close-up",
      cameraAngle: "frontal",
      action:
        language === "fa"
          ? `واکنش احساسی ${counterpart.name} را ثبت می‌کند`
          : `captures the emotional reaction of ${counterpart.name}`,
    },
    {
      shotType: "insert",
      cameraAngle: "detail",
      action:
        language === "fa"
          ? `جزئیاتی را نشان می‌دهد که بحران ${topic} را تشدید می‌کند`
          : `reveals a detail that intensifies the ${topic} crisis`,
    },
  ];

  const list = [];
  for (let i = 0; i < shotCount; i += 1) {
    const t = templates[i % templates.length];
    const description = lx.templates.shotDescription({
      shotType: t.shotType,
      cameraAngle: t.cameraAngle,
      action: t.action,
      mood: tonePack.mood,
    });

    list.push({
      id: `scene-${sceneIndex}-shot-${i + 1}`,
      index: i + 1,
      title: `${lx.shot} ${i + 1}`,
      description,
      prompt: [
        description,
        tonePack.lighting,
        tonePack.palette,
        tonePack.camera,
        language === "fa" ? "cinematic composition" : "cinematic composition",
        beat,
        topic,
      ]
        .filter(Boolean)
        .join(", "),
      negativePrompt: "low quality, blurry, deformed, watermark, text, logo",
      shotType: t.shotType,
      cameraAngle: t.cameraAngle,
      mood: tonePack.mood,
      lighting: tonePack.lighting,
      environment: location,
      style: tonePack.palette,
      referenceImage: null,
      referenceStrength: 0.6,
      seed: "",
      seedLocked: false,
      ratio: "16:9",
    });
  }

  return list;
}

function buildDialogue({ beat, topic, language, protagonist, counterpart, density }) {
  const lx = getLexicon(language);
  const lines = [
    lx.templates.dialogueLineA({
      name: protagonist.name,
      goal: protagonist.goal,
    }),
    lx.templates.dialogueLineB({
      name: counterpart.name,
      obstacle:
        language === "fa"
          ? `ما هنوز بهای واقعی بحران ${topic} را نمی‌دانیم`
          : `we still do not understand the real cost of the ${topic} crisis`,
    }),
  ];

  if (density === "medium") {
    lines.push(
      language === "fa"
        ? `${protagonist.name}: اگر الان عقب‌نشینی کنم، همه‌چیز بی‌معنا می‌شود.`
        : `${protagonist.name}: If I step back now, everything loses meaning.`
    );
  }

  return lines.map((line, index) => {
    const [character, ...rest] = line.split(":");
    return {
      id: `dialogue-${slugify(beat)}-${index + 1}`,
      index: index + 1,
      character: normalizeText(character),
      line: normalizeText(rest.join(":")),
      beat,
    };
  });
}

function buildOutline({ sceneCount, topic, language, protagonist, counterpart }) {
  const beats = buildBeats(sceneCount, language);
  return beats.map((beat, index) => ({
    id: `outline-${index + 1}`,
    index: index + 1,
    beat,
    summary:
      language === "fa"
        ? `${protagonist.name} در مرحله «${beat}» با فشاری تازه از سوی ${counterpart.name} روبه‌رو می‌شود.`
        : `${protagonist.name} faces a new level of pressure from ${counterpart.name} during "${beat}".`,
    topic,
  }));
}

function buildSynopsisData({ topic, protagonist, genrePack, endingText, language }) {
  if (language === "fa") {
    return {
      protagonist: `${protagonist.name}، ${genrePack.protagonistRole}`,
      inciting: `یک رخداد مهم درباره ${topic}`,
      escalation: `فشارها بیشتر می‌شود و روابط شخصی درگیر بحران می‌شوند`,
      climax: `${protagonist.name} باید تصمیمی بگیرد که راه بازگشت ندارد`,
      ending: endingText,
    };
  }

  return {
    protagonist: `${protagonist.name}, ${genrePack.protagonistRole}`,
    inciting: `a destabilizing event around ${topic}`,
    escalation: `pressure grows and personal relationships are drawn into the crisis`,
    climax: `${protagonist.name} must make a choice with no way back`,
    ending: endingText,
  };
}

function buildNarration({ synopsis, language }) {
  if (language === "fa") {
    return `روایت: ${synopsis}`;
  }
  return `Narration: ${synopsis}`;
}

function createScriptPackage(options = {}) {
  const topic = normalizeText(options.topic || options.idea || "Untitled Story");
  const genre = normalizeText(options.genre || "drama");
  const tone = normalizeText(options.tone || "cinematic");
  const duration = safeNumber(options.duration, 5);
  const language = chooseLanguage(options.language);
  const platform = choosePlatform(options.platform);
  const format = chooseFormat(options.format, duration);

  const lx = getLexicon(language);
  const genrePack = inferGenrePack(genre);
  const platformPack = inferPlatformPack(platform);
  const ending = inferEnding(options.endingType || "closed", language);
  const profile = getDurationProfile(format, duration);
  const characters = buildCharacters(topic, genrePack, language);
  const protagonist = characters[0];
  const counterpart = characters[1];
  const locations = buildLocations(topic, language);
  const outline = buildOutline({
    sceneCount: profile.sceneCount,
    topic,
    language,
    protagonist,
    counterpart,
  });

  const logline = lx.templates.logline({
    protagonist:
      language === "fa"
        ? `${protagonist.name}، ${genrePack.protagonistRole}`
        : `${protagonist.name}, ${genrePack.protagonistRole}`,
    desire: genrePack.desire,
    obstacle: genrePack.obstacle,
    stakes: genrePack.stakes,
  });

  const synopsisData = buildSynopsisData({
    topic,
    protagonist,
    genrePack,
    endingText: ending.text,
    language,
  });

  const synopsis = lx.templates.synopsis(synopsisData);

  const scenes = outline.map((item, i) =>
    buildScene({
      index: i + 1,
      beat: item.beat,
      topic,
      genre,
      tone,
      language,
      protagonist,
      counterpart,
      location: locations[i % locations.length],
      profile,
    })
  );

  const flatShots = scenes.flatMap((scene) => scene.shots);
  const flatDialogue = scenes.flatMap((scene) => scene.dialogue);

  const title = normalizeText(options.title) || lx.templates.title({ topic, genre });
  const narration = buildNarration({ synopsis, language });

  return {
    ok: true,
    title,
    topic,
    genre,
    tone,
    language,
    platform,
    format,
    duration,
    ratio: platformPack.ratio,
    logline,
    synopsis,
    theme: genrePack.theme,
    visualStyle: genrePack.visualStyle,
    endingType: ending.type,
    endingText: ending.text,
    narration,
    recommendation: platformPack.recommendation,
    outline,
    characters,
    scenes,
    shots: flatShots,
    dialogue: flatDialogue,
    meta: {
      engine: lx.engineName,
      mode: "local_rule_plus_structure",
      platform,
      format,
      ratio: platformPack.ratio,
      estimatedSceneCount: scenes.length,
      estimatedShotCount: flatShots.length,
      estimatedDialogueCount: flatDialogue.length,
      voicePrompt: lx.voicePrompt,
    },
  };
}

/* =========================================
   Public API
========================================= */

export function getScriptEngineInfo() {
  return {
    engine: "Afrawood Local Script Engine",
    local: true,
    apiRequired: false,
    supportsIdea: true,
    supportsStory: true,
    supportsSceneBreakdown: true,
    supportsShotList: true,
    supportsDialogue: true,
    supportedLanguages: [...SUPPORTED_LANGUAGES],
    supportedPlatforms: [...SUPPORTED_PLATFORMS],
    supportedFormats: [...SUPPORTED_FORMATS],
  };
}

export function buildSystemPrompt(options = {}) {
  const language = chooseLanguage(options.language);
  return getLexicon(language).voicePrompt;
}

export function generateScript(options = {}) {
  return createScriptPackage(options);
}

export function generateIdea(options = {}) {
  const result = createScriptPackage(options);
  return {
    ok: true,
    title: result.title,
    idea: result.logline,
    logline: result.logline,
    theme: result.theme,
    visualStyle: result.visualStyle,
    meta: result.meta,
  };
}

export function generateStory(options = {}) {
  const result = createScriptPackage(options);
  return {
    ok: true,
    title: result.title,
    idea: result.logline,
    story: result.synopsis,
    synopsis: result.synopsis,
    narration: result.narration,
    theme: result.theme,
    visualStyle: result.visualStyle,
    characters: result.characters,
    outline: result.outline,
    meta: result.meta,
  };
}

export function generateSceneBreakdown(options = {}) {
  const result = createScriptPackage(options);
  return {
    ok: true,
    title: result.title,
    scenes: result.scenes,
    outline: result.outline,
    characters: result.characters,
    meta: result.meta,
  };
}

export function generateShotList(options = {}) {
  const result = createScriptPackage(options);
  return {
    ok: true,
    title: result.title,
    shots: result.shots,
    scenes: result.scenes,
    meta: result.meta,
  };
}

export function generateDialogue(options = {}) {
  const result = createScriptPackage(options);
  return {
    ok: true,
    title: result.title,
    dialogue: result.dialogue,
    scenes: result.scenes.map((scene) => ({
      id: scene.id,
      title: scene.title,
      dialogue: scene.dialogue,
    })),
    meta: result.meta,
  };
}

export function generateShortFilmScript(options = {}) {
  return createScriptPackage({
    ...options,
    format: "short_film",
  });
}

export function generateFeatureFilmScript(options = {}) {
  return createScriptPackage({
    ...options,
    format: "feature_film",
  });
}

export function generateSeriesScript(options = {}) {
  const episodes = clamp(safeNumber(options.episodes, 3), 1, 24);
  const base = createScriptPackage({
    ...options,
    format: "series",
  });

  const episodeList = Array.from({ length: episodes }, (_, index) => ({
    id: `episode-${index + 1}`,
    index: index + 1,
    title:
      base.language === "fa"
        ? `اپیزود ${index + 1}`
        : `Episode ${index + 1}`,
    logline: base.logline,
    synopsis: base.synopsis,
  }));

  return {
    ...base,
    episodes,
    episodeList,
  };
}

const scriptAI = {
  getScriptEngineInfo,
  buildSystemPrompt,
  generateIdea,
  generateStory,
  generateSceneBreakdown,
  generateShotList,
  generateDialogue,
  generateScript,
  generateShortFilmScript,
  generateFeatureFilmScript,
  generateSeriesScript,
};

export default scriptAI;