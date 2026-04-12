const STORAGE_KEY = "afrawood_transactions";

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getTransactions() {
  return readAll();
}

export function getTransactionById(id) {
  return readAll().find((item) => item.id === id) || null;
}

export function addTransaction(transaction) {
  const items = readAll();
  items.unshift(transaction);
  writeAll(items);
  return transaction;
}

export function updateTransaction(id, patch) {
  const items = readAll();
  const next = items.map((item) =>
    item.id === id ? { ...item, ...patch, updatedAt: Date.now() } : item
  );
  writeAll(next);
  return next.find((item) => item.id === id) || null;
}

export function removeTransaction(id) {
  const items = readAll().filter((item) => item.id !== id);
  writeAll(items);
}

export function clearTransactions() {
  localStorage.removeItem(STORAGE_KEY);
}