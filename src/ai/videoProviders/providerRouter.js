import { createVeoJob, getVeoJobStatus } from "./veoProvider";
import { createRunwayJob, getRunwayJobStatus } from "./runwayProvider";
import { createFallbackJob, getFallbackJobStatus } from "./fallbackProvider";

const PROVIDERS = {
  veo: {
    id: "veo",
    label: "Google Veo",
    createJob: createVeoJob,
    getStatus: getVeoJobStatus,
  },
  runway: {
    id: "runway",
    label: "Runway",
    createJob: createRunwayJob,
    getStatus: getRunwayJobStatus,
  },
  fallback: {
    id: "fallback",
    label: "Afrawood Fallback",
    createJob: createFallbackJob,
    getStatus: getFallbackJobStatus,
  },
};

function hasVeoConfig() {
  return !!(
    import.meta.env.VITE_VEO_API_KEY &&
    import.meta.env.VITE_VEO_BASE_URL
  );
}

function hasRunwayConfig() {
  return !!(
    import.meta.env.VITE_RUNWAY_API_KEY &&
    import.meta.env.VITE_RUNWAY_BASE_URL
  );
}

export function getAvailableVideoProviders() {
  return [
    {
      id: "veo",
      enabled: hasVeoConfig(),
      label: "Google Veo",
    },
    {
      id: "runway",
      enabled: hasRunwayConfig(),
      label: "Runway",
    },
    {
      id: "fallback",
      enabled: true,
      label: "Afrawood Fallback",
    },
  ];
}

export function resolveProvider(request = {}) {
  if (request.provider && request.provider !== "auto") {
    if (PROVIDERS[request.provider]) return request.provider;
    return "fallback";
  }

  if (hasVeoConfig()) return "veo";
  if (hasRunwayConfig()) return "runway";
  return "fallback";
}

export async function createVideoJob(request = {}) {
  const providerId = resolveProvider(request);
  const provider = PROVIDERS[providerId];

  if (!provider) {
    throw new Error("No valid video provider found.");
  }

  const job = await provider.createJob({
    ...request,
    provider: providerId,
  });

  return {
    ...job,
    provider: providerId,
  };
}

export async function getVideoJobStatus(job) {
  const providerId = job?.provider || "fallback";
  const provider = PROVIDERS[providerId];

  if (!provider) {
    return {
      ...job,
      status: "failed",
      error: `Unknown provider: ${providerId}`,
    };
  }

  return provider.getStatus(job);
}