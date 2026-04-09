function makeJobId() {
  return `runway_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function getHeaders() {
  const apiKey = import.meta.env.VITE_RUNWAY_API_KEY;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
}

function getBaseUrl() {
  return import.meta.env.VITE_RUNWAY_BASE_URL || "";
}

export async function createRunwayJob(request = {}) {
  const baseUrl = getBaseUrl();
  const apiKey = import.meta.env.VITE_RUNWAY_API_KEY;

  if (!baseUrl || !apiKey) {
    return {
      id: makeJobId(),
      provider: "runway",
      status: "failed",
      mode: request.mode,
      prompt: request.prompt,
      inputImage: request.image || "",
      outputVideoUrl: "",
      thumbnail: "",
      duration: request.duration,
      aspectRatio: request.aspectRatio,
      hasAudio: false,
      error: "Runway config is missing.",
    };
  }

  try {
    const response = await fetch(`${baseUrl}/video/jobs`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        prompt: request.prompt,
        image: request.image || undefined,
        mode: request.mode,
        aspectRatio: request.aspectRatio,
        duration: request.duration,
        quality: request.quality,
      }),
    });

    const data = await response.json();

    return {
      id: data.id || makeJobId(),
      provider: "runway",
      status: data.status || "queued",
      mode: request.mode,
      prompt: request.prompt,
      inputImage: request.image || "",
      outputVideoUrl: data.outputVideoUrl || "",
      thumbnail: data.thumbnail || "",
      duration: request.duration,
      aspectRatio: request.aspectRatio,
      hasAudio: !!data.hasAudio,
      raw: data,
    };
  } catch (error) {
    return {
      id: makeJobId(),
      provider: "runway",
      status: "failed",
      mode: request.mode,
      prompt: request.prompt,
      inputImage: request.image || "",
      outputVideoUrl: "",
      thumbnail: "",
      duration: request.duration,
      aspectRatio: request.aspectRatio,
      hasAudio: false,
      error: error?.message || "Runway request failed.",
    };
  }
}

export async function getRunwayJobStatus(job) {
  const baseUrl = getBaseUrl();
  const apiKey = import.meta.env.VITE_RUNWAY_API_KEY;

  if (!baseUrl || !apiKey) {
    return {
      ...job,
      status: "failed",
      error: "Runway config is missing.",
    };
  }

  try {
    const response = await fetch(`${baseUrl}/video/jobs/${job.id}`, {
      method: "GET",
      headers: getHeaders(),
    });

    const data = await response.json();

    return {
      ...job,
      status: data.status || job.status,
      outputVideoUrl: data.outputVideoUrl || job.outputVideoUrl || "",
      thumbnail: data.thumbnail || job.thumbnail || "",
      hasAudio: typeof data.hasAudio === "boolean" ? data.hasAudio : job.hasAudio,
      raw: data,
    };
  } catch (error) {
    return {
      ...job,
      status: "failed",
      error: error?.message || "Failed to fetch Runway status.",
    };
  }
}