function safeText(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  return value.trim();
}

function safeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function estimateMusicDuration(prompt = "", bars = 16, bpm = 100) {
  const promptWeight = Math.min(18, Math.max(0, safeText(prompt).length / 18));
  const musicalBars = safeNumber(bars, 16);
  const tempo = Math.max(60, safeNumber(bpm, 100));
  const secFromBars = (musicalBars * 4 * 60) / tempo;
  return Math.max(8, Math.round(secFromBars + promptWeight));
}

function buildInstrumentConfig(input = {}) {
  return {
    percussion: Boolean(input.includePercussion),
    bass: Boolean(input.includeBass),
    pads: Boolean(input.includePads),
    piano: Boolean(input.includePiano),
    strings: Boolean(input.includeStrings),
  };
}

function buildProviderConfig(providerValue = "mock_ready") {
  const provider = safeText(providerValue, "mock_ready");

  return {
    provider,
    mode:
      provider === "api_later"
        ? "remote_api"
        : provider === "local_later"
          ? "local_engine"
          : "mock_preview",
    connected: false,
    readyForIntegration: true,
  };
}

function detectStructure(genre, energy, bars) {
  const g = safeText(genre).toLowerCase();
  const e = safeText(energy).toLowerCase();
  const totalBars = safeNumber(bars, 16);

  if (g.includes("hybrid") || e === "high") {
    return {
      introBars: Math.max(2, Math.round(totalBars * 0.2)),
      mainBars: Math.max(4, Math.round(totalBars * 0.55)),
      outroBars: Math.max(2, totalBars - Math.round(totalBars * 0.75)),
      shape: "rise_hit_release",
    };
  }

  if (g.includes("ambient")) {
    return {
      introBars: Math.max(2, Math.round(totalBars * 0.3)),
      mainBars: Math.max(4, Math.round(totalBars * 0.5)),
      outroBars: Math.max(2, totalBars - Math.round(totalBars * 0.8)),
      shape: "slow_bloom",
    };
  }

  return {
    introBars: Math.max(2, Math.round(totalBars * 0.25)),
    mainBars: Math.max(4, Math.round(totalBars * 0.5)),
    outroBars: Math.max(2, totalBars - Math.round(totalBars * 0.75)),
    shape: "balanced_arc",
  };
}

export function buildMusicPayload(input = {}) {
  const projectTitle = safeText(input.projectTitle, "Untitled Music Project");
  const prompt = safeText(input.prompt);
  const provider = buildProviderConfig(input.provider);

  const genre = safeText(input.genre, "cinematic");
  const mood = safeText(input.mood, "emotional");
  const energy = safeText(input.energy, "medium");
  const bpm = safeNumber(input.bpm, 92);
  const keySignature = safeText(input.keySignature, "D minor");
  const bars = safeNumber(input.bars, 16);
  const loopable = Boolean(input.loopable);

  const outputFormat = safeText(input.outputFormat, "wav");
  const sampleRate = safeNumber(input.sampleRate, 22050);
  const normalizeAudio = Boolean(input.normalizeAudio);
  const useForBackgroundMusic = Boolean(input.useForBackgroundMusic);

  const estimatedDurationSec = estimateMusicDuration(prompt, bars, bpm);
  const structure = detectStructure(genre, energy, bars);
  const instruments = buildInstrumentConfig(input);

  return {
    app: "Afrawood",
    feature: "music",
    version: 1,
    createdAt: new Date().toISOString(),

    project: {
      title: projectTitle,
    },

    input: {
      prompt,
      promptLength: prompt.length,
      promptWordCount: prompt ? prompt.split(/\s+/).filter(Boolean).length : 0,
    },

    provider,

    music: {
      genre,
      mood,
      energy,
      bpm,
      keySignature,
      bars,
      loopable,
      structure,
      instruments,
    },

    audio: {
      format: outputFormat,
      sampleRate,
      channels: 2,
      bitDepth: 16,
      normalizeAudio,
      estimatedDurationSec,
    },

    output: {
      mockPreviewAvailable: true,
      realProviderReady: true,
      backgroundMusicReady: useForBackgroundMusic,
      mergeReady: true,
      exportReady: true,
    },

    exportHint: {
      recommendedNextPage: useForBackgroundMusic ? "merge" : "export",
      recommendedUse: useForBackgroundMusic ? "background_music" : "standalone_music",
    },

    notes: {
      status:
        "Music payload آماده است. اتصال واقعی provider بعداً باید به این لایه وصل شود.",
    },
  };
}

export async function prepareMusicPayload(input = {}) {
  return buildMusicPayload(input);
}

export async function createMusicPayload(input = {}) {
  return buildMusicPayload(input);
}

export default buildMusicPayload;