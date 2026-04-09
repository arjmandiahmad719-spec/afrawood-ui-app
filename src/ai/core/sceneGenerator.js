export function parseSceneFromAI(text) {
  return {
    id: Date.now(),
    title: extract(text, "عنوان") || "Scene جدید",
    location: extract(text, "لوکیشن") || "نامشخص",
    time: extract(text, "زمان") || "نامشخص",
    mood: extract(text, "حس") || "دراماتیک",
    description: text,
    shots: [],
  };
}

function extract(text, key) {
  const regex = new RegExp(`${key}\\s*:\\s*(.*)`);
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}