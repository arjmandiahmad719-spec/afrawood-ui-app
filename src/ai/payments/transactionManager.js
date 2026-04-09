// src/ai/payments/transactionManager.js

const STORAGE_KEY = "afrawood_transactions";

export function getTransactions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function save(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function addTransaction(tx) {
  const list = getTransactions();
  list.push(tx);
  save(list);
  return tx;
}

export function updateTransaction(id, updates) {
  const list = getTransactions().map((t) =>
    t.id === id ? { ...t, ...updates } : t
  );
  save(list);
  return list.find((t) => t.id === id);
}

export function approveTransaction(id) {
  return updateTransaction(id, {
    status: "approved",
    approvedAt: Date.now(),
  });
}