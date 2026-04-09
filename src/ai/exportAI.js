function safeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function safeText(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  return value.trim();
}

function normalizeList(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(Boolean);
}

function inferResolution(resolution, ratio) {
  const map = {
    "1080p": { width: 1920, height: 1080 },
    "2k": { width: 2560, height: 1440 },
    "4k": { width: 3840, height: 2160 },
  };

  if (ratio === "9:16") return { width: 1080, height: 1920 };
  if (ratio === "1:1") return { width: 1080, height: 1080 };

  return map[resolution] || { width: 1920, height: 1080 };
}

function normalizeSourceItem(item, type, index) {
  return {
    id: item?.id || `${type}_${index + 1}`,
    type,
    name: item?.name || `${type}_${index + 1}`,
    mimeType: item?.type || "",
    size: safeNumber(item?.size, 0),
    kind: item?.kind || type,
  };
}

function buildFileSummary(list = []) {
  return {
    count: list.length,
    totalSize: list.reduce((sum, item) => sum + safeNumber(item?.size, 0), 0),
  };
}

export function buildExportPayload(input = {}) {
  const title = safeText(input.projectTitle, "Untitled Project");
  const description = safeText(input.description);
  const tags = normalizeList(input.tags).map((tag) => safeText(tag)).filter(Boolean);

  const sourceVideos = normalizeList(input.sourceVideos).map((item, index) =>
    normalizeSourceItem(item, "video", index)
  );
  const sourceAudios = normalizeList(input.sourceAudios).map((item, index) =>
    normalizeSourceItem(item, "audio", index)
  );
  const sourceSubtitles = normalizeList(input.sourceSubtitles).map((item, index) =>
    normalizeSourceItem(item, "subtitle", index)
  );
  const sourceImages = normalizeList(input.sourceImages).map((item, index) =>
    normalizeSourceItem(item, "image", index)
  );

  const output = input.output || {};
  const timeline = input.timeline || {};

  const ratio = safeText(output.ratio, "16:9");
  const resolution = safeText(output.resolution, "1080p");
  const frameSize = inferResolution(resolution, ratio);

  const payload = {
    app: "Afrawood",
    feature: "export",
    version: 1,
    createdAt: new Date().toISOString(),

    project: {
      title,
      description,
      tags,
    },

    sources: {
      videos: sourceVideos,
      audios: sourceAudios,
      subtitles: sourceSubtitles,
      images: sourceImages,
      summary: {
        videos: buildFileSummary(sourceVideos),
        audios: buildFileSummary(sourceAudios),
        subtitles: buildFileSummary(sourceSubtitles),
        images: buildFileSummary(sourceImages),
        totalFiles:
          sourceVideos.length +
          sourceAudios.length +
          sourceSubtitles.length +
          sourceImages.length,
        totalSize:
          buildFileSummary(sourceVideos).totalSize +
          buildFileSummary(sourceAudios).totalSize +
          buildFileSummary(sourceSubtitles).totalSize +
          buildFileSummary(sourceImages).totalSize,
      },
    },

    output: {
      format: safeText(output.format, "mp4"),
      ratio,
      resolution,
      width: frameSize.width,
      height: frameSize.height,
      fps: safeNumber(output.fps, 24),
      quality: safeText(output.quality, "high"),
      videoCodec: safeText(output.videoCodec, "h264"),
      audioCodec: safeText(output.audioCodec, "aac"),
      includeBurnedSubtitles: Boolean(output.includeBurnedSubtitles),
      includeSoftSubtitles: Boolean(output.includeSoftSubtitles),
      includePosterFrame: Boolean(output.includePosterFrame),
      normalizeAudio: Boolean(output.normalizeAudio),
      trimSilence: Boolean(output.trimSilence),
      loudnessTarget: safeText(output.loudnessTarget, "-14 LUFS"),
      watermarkText: safeText(output.watermarkText),
      fileName: safeText(output.fileName),
    },

    timeline: {
      strategy: safeText(timeline.strategy, "keep_order"),
      transition: safeText(timeline.transition, "crossfade"),
      crossfadeMs: safeNumber(timeline.crossfadeMs, 300),
      gapMode: safeText(timeline.gapMode, "none"),
      outroSeconds: safeNumber(timeline.outroSeconds, 1.5),
    },

    backend: {
      ffmpegRequired: true,
      providerReady: true,
      renderReady: false,
      reason:
        "UI payload is ready. Real export render should be connected later via ffmpeg/backend.",
    },

    notes: safeText(input.notes),
  };

  return payload;
}

export async function prepareExportPayload(input = {}) {
  return buildExportPayload(input);
}

export async function createExportPayload(input = {}) {
  return buildExportPayload(input);
}

export default buildExportPayload;