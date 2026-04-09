function safeText(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  return value.trim();
}

function safeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function normalizeCue(cue = {}, index = 0) {
  return {
    id: cue.id || `cue_${index + 1}`,
    index: index + 1,
    start: safeText(cue.start, "00:00:00,000"),
    end: safeText(cue.end, "00:00:03,000"),
    text: safeText(cue.text),
  };
}

function detectMediaKind(file) {
  const type = file?.type || "";
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "audio";
  return "unknown";
}

function buildCueStats(cues = []) {
  const text = cues.map((cue) => cue.text || "").join(" ").trim();
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const chars = text.length;

  return {
    count: cues.length,
    wordCount: words,
    charCount: chars,
  };
}

function inferFormats(mode, burnInRecommended) {
  const formats = ["srt", "vtt"];
  if (mode === "manual" || burnInRecommended) {
    formats.push("burned_video_track");
  }
  return formats;
}

export function buildSubtitlePayload(input = {}) {
  const projectTitle = safeText(input.projectTitle, "Untitled Subtitle Project");
  const mode = safeText(input.mode, "transcribe");
  const sourceLanguage = safeText(input.sourceLanguage, "en");
  const targetLanguage = safeText(input.targetLanguage, "none");
  const style = safeText(input.style, "standard");
  const maxCharsPerLine = safeNumber(input.maxCharsPerLine, 42);
  const maxLinesPerCue = safeNumber(input.maxLinesPerCue, 2);
  const burnInRecommended = Boolean(input.burnInRecommended);

  const cues = Array.isArray(input.cues)
    ? input.cues.map((cue, index) => normalizeCue(cue, index))
    : [];

  const stats = buildCueStats(cues);

  const sourceFile = input.sourceFile || null;
  const source = sourceFile
    ? {
        name: sourceFile.name || "source_media",
        type: sourceFile.type || "",
        size: safeNumber(sourceFile.size, 0),
        duration: safeNumber(input.sourceDuration, 0),
        mediaKind: detectMediaKind(sourceFile),
      }
    : null;

  return {
    app: "Afrawood",
    feature: "subtitle",
    version: 1,
    createdAt: new Date().toISOString(),

    project: {
      title: projectTitle,
    },

    source,

    subtitle: {
      mode,
      style,
      sourceLanguage,
      targetLanguage,
      maxCharsPerLine,
      maxLinesPerCue,
      burnInRecommended,
      formats: inferFormats(mode, burnInRecommended),
      cues,
      stats,
    },

    rawInput: {
      rawTextLength: safeText(input.rawText).length,
    },

    output: {
      editorReady: true,
      mergeReady: true,
      exportReady: true,
    },

    exportHint: {
      recommendedNextPage: "export",
      recommendedUse: "subtitle_track_or_burned_subtitles",
    },

    notes: {
      status:
        "Subtitle payload آماده است. اتصال واقعی transcription/translation provider بعداً باید به این لایه وصل شود.",
    },
  };
}

export async function prepareSubtitlePayload(input = {}) {
  return buildSubtitlePayload(input);
}

export async function createSubtitlePayload(input = {}) {
  return buildSubtitlePayload(input);
}

export default buildSubtitlePayload;