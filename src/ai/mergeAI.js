function safeText(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  return value.trim();
}

function safeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function normalizeTimelineItem(item = {}, index = 0) {
  const duration = safeNumber(item.duration, 0);
  const trimStart = Math.max(0, safeNumber(item.trimStart, 0));
  const rawTrimEnd =
    item.trimEnd === "" || item.trimEnd === null || typeof item.trimEnd === "undefined"
      ? duration
      : safeNumber(item.trimEnd, duration);

  const trimEnd = Math.max(trimStart, Math.min(duration || rawTrimEnd, rawTrimEnd));
  const effectiveDuration = Math.max(
    0,
    safeNumber(item.effectiveDuration, trimEnd - trimStart)
  );

  return {
    id: item.id || `timeline_${index + 1}`,
    index,
    kind: safeText(item.kind, "video"),
    name: safeText(item.name, `item_${index + 1}`),
    type: safeText(item.type),
    size: safeNumber(item.size, 0),
    label: safeText(item.label),
    duration,
    trimStart,
    trimEnd,
    effectiveDuration,
  };
}

function summarizeTimeline(timeline = []) {
  const summary = {
    itemCount: timeline.length,
    totalSize: 0,
    totalDuration: 0,
    videoCount: 0,
    audioCount: 0,
  };

  for (const item of timeline) {
    summary.totalSize += safeNumber(item.size, 0);
    summary.totalDuration += safeNumber(item.effectiveDuration, 0);

    if (item.kind === "video") summary.videoCount += 1;
    if (item.kind === "audio") summary.audioCount += 1;
  }

  summary.totalDuration = Number(summary.totalDuration.toFixed(2));
  return summary;
}

function buildMusicConfig(selectedMusic, input = {}) {
  if (!selectedMusic) {
    return {
      enabled: false,
      mode: safeText(input.musicMode, "none"),
      duckingEnabled: Boolean(input.duckingEnabled),
      volume: safeNumber(input.musicVolume, 65),
      track: null,
    };
  }

  return {
    enabled: true,
    mode: safeText(input.musicMode, "custom_track"),
    duckingEnabled: Boolean(input.duckingEnabled),
    volume: safeNumber(input.musicVolume, 65),
    track: {
      id: selectedMusic.id || "music_1",
      name: safeText(selectedMusic.name, "background_music"),
      type: safeText(selectedMusic.type),
      size: safeNumber(selectedMusic.size, 0),
      duration: safeNumber(selectedMusic.duration, 0),
    },
  };
}

function buildAudioConfig(input = {}, selectedMusic) {
  return {
    mode: safeText(input.audioMode, "keep_main_audio"),
    normalizeAudio: Boolean(input.normalizeAudio),
    backgroundMusic: buildMusicConfig(selectedMusic, input),
  };
}

function buildOutputConfig(input = {}) {
  return {
    format: safeText(input.outputFormat, "mp4"),
    ratio: safeText(input.outputRatio, "16:9"),
    resolution: safeText(input.outputResolution, "1080p"),
    fps: safeNumber(input.fps, 24),
    transition: safeText(input.transition, "crossfade"),
    transitionMs: safeNumber(input.transitionMs, 300),
  };
}

export function buildMergePayload(input = {}) {
  const timeline = Array.isArray(input.timeline)
    ? input.timeline.map((item, index) => normalizeTimelineItem(item, index))
    : [];

  const selectedMusic = input.selectedMusic || null;
  const summary = summarizeTimeline(timeline);

  return {
    app: "Afrawood",
    feature: "video_merge",
    version: 1,
    createdAt: new Date().toISOString(),

    project: {
      title: safeText(input.title, "Untitled Merge"),
      notes: safeText(input.notes),
    },

    timeline,
    summary,

    audio: buildAudioConfig(input, selectedMusic),
    output: buildOutputConfig(input),

    backend: {
      ffmpegRequired: true,
      renderReady: false,
      providerReady: true,
      reason:
        "Merge payload is ready. Real merge render should be connected later via ffmpeg/backend.",
    },

    exportHint: {
      recommendedNextPage: "export",
      readyForExport: true,
    },
  };
}

export async function prepareMergePayload(input = {}) {
  return buildMergePayload(input);
}

export async function createMergePayload(input = {}) {
  return buildMergePayload(input);
}

export default buildMergePayload;