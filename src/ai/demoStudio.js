const STORAGE_PREFIX = "afrawood_demo_";

function storageKey(name) {
  return `${STORAGE_PREFIX}${name}`;
}

export function readList(name) {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(name));
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeList(name, items) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(name), JSON.stringify(items || []));
}

export function addListItem(name, item, limit = 12) {
  const items = readList(name);
  const next = [item, ...items].slice(0, limit);
  writeList(name, next);
  return next;
}

export function removeListItem(name, id) {
  const items = readList(name).filter((item) => item.id !== id);
  writeList(name, items);
  return items;
}

export function clearList(name) {
  writeList(name, []);
  return [];
}

export function makeJobId(prefix = "job") {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

export function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function buildPlaceholderImage({
  prompt = "Afrawood cinematic frame",
  style = "Cinematic",
  ratio = "16:9",
}) {
  const text = encodeURIComponent(`${style} | ${ratio} | ${prompt}`);
  return `https://placehold.co/1280x720/111111/E8D58B?text=${text}`;
}

export function downloadTextFile(filename, content, mimeType = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatTimestamp() {
  return new Date().toLocaleString();
}