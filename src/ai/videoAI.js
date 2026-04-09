function safeText(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  return value.trim();
}

function safeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function normalizeImageSource(image) {
  if (!image) return null;

  return {
    id: image.id || "image_source_1",
    name: safeText(image.name, "reference_image"),
    type: safeText(image.type),
    size: safeNumber(image.size, 0),
    kind: image.kind || "image",
  };
}

function inferAspectResolution(aspectRatio, quality) {
  const ratio = safeText(aspectRatio, "16:9");
  const q = safeText(quality, "high");

  if (ratio === "9:16") {
    if (q === "ultra") return { width: 1440, height: 2560 };
    if (q === "high") return { width: 1080, height: 1920 };
    return { width: 720, height: 1280 };
  }

  if (ratio === "1:1") {
    if (q === "ultra") return { width: 1440, height: 1440 };
    if (q === "high") return { width: 1080, height: 1080 };
    return { width: 768, height: 768 };
  }

  if (q === "ultra") return { width: 2560, height: 1440 };
  if (q === "high") return { width: 1920, height: 1080 };
  return { width: 1280, height: 720 };
}

function detectGenerationMode(input = {}) {
  const hasPrompt = Boolean(safeText(input.prompt));
  const hasImage = Boolean(input.referenceImage);

  if (hasPrompt && hasImage) return "image_plus_prompt_to_video";
  if (hasImage) return "image_to_video";
  return "text_to_video";
}

function buildProviderConfig(input = {}) {
  const provider = safeText(input.provider, "hybrid_ready");
  const mode =
    provider === "api_later"
      ? "remote_api"
      : provider === "local_later"
        ? "local_engine"
        : "hybrid_mock";

  return {
    provider,
    mode,
    connected: false,
    localReady: true,
    apiReady: true,
  };
}

function buildMotionConfig(input = {}) {
  return {
    motionStrength: safeNumber(input.motionStrength, 0.7),
    cameraMovement: safeText(input.cameraMovement, "subtle"),
    shotStyle: safeText(input.shotStyle, "cinematic"),
    loopable: Boolean(input.loopable),
    stabilizeFaces: Boolean(input.stabilizeFaces),
  };
}

function buildOutputConfig(input = {}) {
  const aspectRatio = safeText(input.aspectRatio, "16:9");
  const quality = safeText(input.quality, "high");
  const size = inferAspectResolution(aspectRatio, quality);

  return {
    durationSec: safeNumber(input.durationSec, 5),
    fps: safeNumber(input.fps, 24),
    aspectRatio,
    quality,
    width: size.width,
    height: size.height,
    format: safeText(input.format, "mp4"),
  };
}

export function buildVideoPayload(input = {}) {
  const prompt = safeText(input.prompt);
  const negativePrompt = safeText(input.negativePrompt);
  const title = safeText(input.projectTitle, "Untitled Video Project");
  const provider = buildProviderConfig(input);
  const referenceImage = normalizeImageSource(input.referenceImage);
  const output = buildOutputConfig(input);
  const motion = buildMotionConfig(input);
  const generationMode = detectGenerationMode({
    prompt,
    referenceImage,
  });

  return {
    app: "Afrawood",
    feature: "video",
    version: 1,
    createdAt: new Date().toISOString(),

    project: {
      title,
    },

    input: {
      prompt,
      negativePrompt,
      generationMode,
      referenceImage,
    },

    provider,
    motion,
    output,

    render: {
      backendRequired: true,
      providerConnected: false,
      mockPreviewSupported: true,
      realVideoReady: false,
      reason:
        "Video payload is ready. Real render should be connected later to local engine or API provider.",
    },

    exportHint: {
      recommendedNextPage: "export",
      mergeReady: true,
      exportReady: true,
    },

    notes: {
      status:
        "Video payload آماده است. معماری hybrid local + API حفظ شده و اتصال واقعی بعداً کامل می‌شود.",
    },
  };
}

export function getVideoEngineInfo() {
  return {
    engine: "Afrawood Video",
    mode: "hybrid",
    supportsTextToVideo: true,
    supportsImageToVideo: true,
    supportsPromptPlusImage: true,
    supportsMockPreview: true,
  };
}

export async function generateMockVideoPreview(payload = {}) {
  const output = payload.output || {};
  return {
    ok: true,
    posterUrl: "",
    duration: output.durationSec || 5,
    width: output.width || 1280,
    height: output.height || 720,
    fps: output.fps || 24,
  };
}

export async function prepareVideoPayload(input = {}) {
  return buildVideoPayload(input);
}

export async function createVideoPayload(input = {}) {
  return buildVideoPayload(input);
}

export default buildVideoPayload;