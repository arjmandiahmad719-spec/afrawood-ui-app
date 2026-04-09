function safeText(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  return value.trim();
}

function safeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function detectProviderMode(providerName = "hybrid_ready") {
  const provider = safeText(providerName, "hybrid_ready");

  if (provider === "api_later") {
    return {
      id: "api_later",
      label: "Remote API Provider",
      type: "remote_api",
      enabled: false,
      reason: "API provider is planned but not connected yet.",
    };
  }

  if (provider === "local_later") {
    return {
      id: "local_later",
      label: "Local Video Engine",
      type: "local_engine",
      enabled: false,
      reason: "Local provider is planned but not connected yet.",
    };
  }

  return {
    id: "hybrid_ready",
    label: "Hybrid Mock Provider",
    type: "hybrid_mock",
    enabled: true,
    reason: "Fallback provider for current UI/logic phase.",
  };
}

function buildMockVideoResult(payload = {}) {
  const output = payload.output || {};
  const durationSec = safeNumber(output.durationSec, 5);
  const fps = safeNumber(output.fps, 24);
  const width = safeNumber(output.width, 1280);
  const height = safeNumber(output.height, 720);
  const format = safeText(output.format, "mp4");

  return {
    ok: true,
    jobId: uid("video_job"),
    provider: payload?.provider?.provider || "hybrid_ready",
    providerMode: payload?.provider?.mode || "hybrid_mock",
    status: "mock_ready",
    title: payload?.project?.title || "Untitled Video Project",
    preview: {
      kind: "mock_video",
      url: "",
      posterUrl: "",
      format,
      width,
      height,
      fps,
      durationSec,
      estimatedSizeMb: Number((durationSec * width * height / 2000000).toFixed(2)),
    },
    render: {
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      backendRequired: true,
      realFileReady: false,
    },
    message:
      "Mock video result prepared. Connect a real local/API video engine later for actual rendering.",
  };
}

export function getVideoProviderInfo(providerName = "hybrid_ready") {
  const provider = detectProviderMode(providerName);

  return {
    ...provider,
    supportsTextToVideo: true,
    supportsImageToVideo: true,
    supportsPromptPlusImage: true,
    supportsMockPreview: true,
    supportsRealRender: false,
  };
}

export function listVideoProviders() {
  return [
    getVideoProviderInfo("hybrid_ready"),
    getVideoProviderInfo("local_later"),
    getVideoProviderInfo("api_later"),
  ];
}

export async function runVideoProvider(payload = {}) {
  await wait(250);

  const providerName = payload?.provider?.provider || "hybrid_ready";
  const provider = detectProviderMode(providerName);

  if (!provider.enabled) {
    return {
      ok: false,
      jobId: uid("video_job"),
      provider: provider.id,
      status: "not_connected",
      message: provider.reason,
    };
  }

  return buildMockVideoResult(payload);
}

export async function createVideoJob(payload = {}) {
  return runVideoProvider(payload);
}

export async function renderVideoWithProvider(payload = {}) {
  return runVideoProvider(payload);
}

export default {
  getVideoProviderInfo,
  listVideoProviders,
  runVideoProvider,
  createVideoJob,
  renderVideoWithProvider,
};