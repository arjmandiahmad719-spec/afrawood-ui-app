const REPLICATE_API_KEY = import.meta.env.VITE_REPLICATE_API_KEY;
const REPLICATE_API_URL = "https://api.replicate.com/v1/predictions";
const MUSIC_HISTORY_KEY = "afrawood_music_history";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeParse(val, fallback = []) {
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

function getHeaders() {
  if (!REPLICATE_API_KEY) {
    throw new Error("Missing Replicate API Key");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Token ${REPLICATE_API_KEY}`,
  };
}

export function getMusicHistory() {
  if (typeof window === "undefined") return [];
  return safeParse(localStorage.getItem(MUSIC_HISTORY_KEY), []);
}

export function saveMusicHistory(item) {
  if (typeof window === "undefined") return;
  const current = getMusicHistory();
  const next = [item, ...current].slice(0, 30);
  localStorage.setItem(MUSIC_HISTORY_KEY, JSON.stringify(next));
}

export function removeMusicHistory(id) {
  if (typeof window === "undefined") return;
  const current = getMusicHistory();
  const next = current.filter((i) => i.id !== id);
  localStorage.setItem(MUSIC_HISTORY_KEY, JSON.stringify(next));
}

export function clearMusicHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(MUSIC_HISTORY_KEY);
}

export async function generateMusic(prompt) {
  if (!prompt || !prompt.trim()) {
    throw new Error("Prompt is required");
  }

  const res = await fetch(REPLICATE_API_URL, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      version: "musicgen", // ساده و عمومی
      input: {
        prompt: prompt.trim(),
      },
    }),
  });

  if (!res.ok) {
    throw new Error("Music request failed");
  }

  const data = await res.json();
  const id = data.id;

  if (!id) {
    throw new Error("No prediction id");
  }

  // polling
  let outputUrl = null;

  for (let i = 0; i < 120; i++) {
    await sleep(3000);

    const poll = await fetch(`${REPLICATE_API_URL}/${id}`, {
      headers: getHeaders(),
    });

    const pollData = await poll.json();

    if (pollData.status === "succeeded") {
      outputUrl = Array.isArray(pollData.output)
        ? pollData.output[0]
        : pollData.output;
      break;
    }

    if (pollData.status === "failed") {
      throw new Error("Music generation failed");
    }
  }

  if (!outputUrl) {
    throw new Error("Timeout");
  }

  const record = {
    id: `${id}-${Date.now()}`,
    prompt,
    url: outputUrl,
    createdAt: Date.now(),
  };

  saveMusicHistory(record);

  return {
    url: outputUrl,
    record,
  };
}

export function downloadMusic(url) {
  const a = document.createElement("a");
  a.href = url;
  a.download = "afrawood-music.mp3";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}