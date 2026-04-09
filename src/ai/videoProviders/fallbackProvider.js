const fallbackJobs = new Map();

function makeJobId() {
  return `fallback_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function createFakeVideoUrl() {
  return "";
}

export async function createFallbackJob(request = {}) {
  const id = makeJobId();

  const job = {
    id,
    provider: "fallback",
    status: "processing",
    mode: request.mode,
    prompt: request.prompt,
    inputImage: request.image || "",
    outputVideoUrl: "",
    thumbnail: request.image || "",
    duration: request.duration,
    aspectRatio: request.aspectRatio,
    hasAudio: false,
    progress: 0,
  };

  fallbackJobs.set(id, {
    ...job,
    createdAt: Date.now(),
  });

  return job;
}

export async function getFallbackJobStatus(job) {
  const stored = fallbackJobs.get(job.id);

  if (!stored) {
    return {
      ...job,
      status: "failed",
      error: "Fallback job not found.",
    };
  }

  const elapsed = Date.now() - stored.createdAt;
  const progress = Math.min(100, Math.floor(elapsed / 80));

  if (progress >= 100) {
    const completed = {
      ...stored,
      status: "completed",
      progress: 100,
      outputVideoUrl: createFakeVideoUrl(),
    };
    fallbackJobs.set(job.id, completed);
    return completed;
  }

  const updated = {
    ...stored,
    status: "processing",
    progress,
  };

  fallbackJobs.set(job.id, updated);
  return updated;
}