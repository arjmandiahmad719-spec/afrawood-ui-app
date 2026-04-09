const USERS_KEY = "afrawood_users_v3";
const SESSION_KEY = "afrawood_auth_user_v3";

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function normalizeEmail(email = "") {
  return String(email).trim().toLowerCase();
}

export function getAllUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  return safeJsonParse(raw, []);
}

export function saveAllUsers(users = []) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function findUserByEmail(email = "") {
  const normalized = normalizeEmail(email);
  return getAllUsers().find((user) => normalizeEmail(user.email) === normalized) || null;
}

export function findUserById(userId = "") {
  return getAllUsers().find((user) => user.id === userId) || null;
}

export function createUserRecord({
  fullName = "",
  email = "",
  password = "",
  provider = "email",
  avatar = "",
} = {}) {
  const now = new Date().toISOString();
  const nextResetAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  return {
    id: `user_${Math.random().toString(36).slice(2, 10)}`,
    fullName: String(fullName).trim(),
    email: normalizeEmail(email),
    password: String(password),
    provider,
    avatar,
    createdAt: now,
    updatedAt: now,

    planId: "free",
    walletAddress: "",
    usage: {},
    watermark: true,

    freeCredits: 100,
    paidCredits: 0,
    nextCreditResetAt: nextResetAt,
  };
}

export function insertUser(user) {
  const users = getAllUsers();
  users.push(user);
  saveAllUsers(users);
  return user;
}

export function updateUser(userId, patch = {}) {
  const users = getAllUsers();
  const index = users.findIndex((item) => item.id === userId);

  if (index === -1) return null;

  users[index] = {
    ...users[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  saveAllUsers(users);
  return users[index];
}

export function persistSession(user) {
  if (!user) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getPersistedSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return safeJsonParse(raw, null);
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function refreshSessionFromStore() {
  const session = getPersistedSession();
  if (!session?.id) return null;

  const fresh = findUserById(session.id);
  if (!fresh) {
    clearSession();
    return null;
  }

  persistSession(fresh);
  return fresh;
}

export function updateCurrentSessionUser(patch = {}) {
  const session = getPersistedSession();
  if (!session?.id) return null;

  const updated = updateUser(session.id, patch);
  if (updated) {
    persistSession(updated);
  }
  return updated;
}