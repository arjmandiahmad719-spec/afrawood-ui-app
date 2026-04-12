const EXPORT_HISTORY_KEY = "afrawood_export_history";

function safeParse(val, fallback = []) {
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

export function getExportHistory() {
  if (typeof window === "undefined") return [];
  return safeParse(localStorage.getItem(EXPORT_HISTORY_KEY), []);
}

export function saveExportHistory(item) {
  if (typeof window === "undefined") return;
  const current = getExportHistory();
  const next = [item, ...current].slice(0, 20);
  localStorage.setItem(EXPORT_HISTORY_KEY, JSON.stringify(next));
}

export function clearExportHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(EXPORT_HISTORY_KEY);
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export async function exportVideo({
  images = [],
  audioUrl = "",
  fps = 1,
  durationPerImage = 2,
}) {
  if (!images.length) {
    throw new Error("No images to export");
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const firstImg = await loadImage(images[0]);
  canvas.width = firstImg.width;
  canvas.height = firstImg.height;

  const stream = canvas.captureStream(fps);
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: "video/webm",
  });

  let chunks = [];

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  mediaRecorder.start();

  for (let i = 0; i < images.length; i++) {
    const img = await loadImage(images[i]);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    await new Promise((r) =>
      setTimeout(r, durationPerImage * 1000)
    );
  }

  mediaRecorder.stop();

  await new Promise((resolve) => {
    mediaRecorder.onstop = resolve;
  });

  const blob = new Blob(chunks, { type: "video/webm" });
  const url = URL.createObjectURL(blob);

  const record = {
    id: Date.now(),
    images,
    audioUrl,
    url,
    createdAt: Date.now(),
  };

  saveExportHistory(record);

  return {
    url,
    record,
  };
}

export function downloadVideo(url) {
  const a = document.createElement("a");
  a.href = url;
  a.download = "afrawood-final-video.webm";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}