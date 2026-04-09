import {
  clearSession,
  createUserRecord,
  findUserByEmail,
  getPersistedSession,
  insertUser,
  normalizeEmail,
  persistSession,
  refreshSessionFromStore,
} from "./userStore.js";

function wait(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function restoreSession() {
  await wait(100);

  const refreshed = refreshSessionFromStore();
  if (refreshed) {
    return {
      ok: true,
      user: refreshed,
    };
  }

  const session = getPersistedSession();

  return {
    ok: Boolean(session),
    user: session,
  };
}

export async function signupWithEmail({
  fullName = "",
  email = "",
  password = "",
} = {}) {
  await wait();

  const normalized = normalizeEmail(email);

  if (!String(fullName).trim()) {
    return { ok: false, message: "Full name is required." };
  }

  if (!normalized) {
    return { ok: false, message: "Email is required." };
  }

  if (!String(password)) {
    return { ok: false, message: "Password is required." };
  }

  if (String(password).length < 6) {
    return { ok: false, message: "Password must be at least 6 characters." };
  }

  const exists = findUserByEmail(normalized);
  if (exists) {
    return { ok: false, message: "This email is already registered." };
  }

  const user = createUserRecord({
    fullName,
    email: normalized,
    password,
    provider: "email",
  });

  insertUser(user);
  persistSession(user);

  return {
    ok: true,
    user,
  };
}

export async function loginWithEmail({
  email = "",
  password = "",
} = {}) {
  await wait();

  const normalized = normalizeEmail(email);

  if (!normalized || !String(password)) {
    return { ok: false, message: "Email and password are required." };
  }

  const user = findUserByEmail(normalized);

  if (!user) {
    return { ok: false, message: "User not found." };
  }

  if (String(user.password) !== String(password)) {
    return { ok: false, message: "Password is incorrect." };
  }

  persistSession(user);

  return {
    ok: true,
    user,
  };
}

export async function loginWithGoogleMock() {
  await wait(300);

  const token = Math.random().toString(36).slice(2, 7);
  const email = `google_user_${token}@gmail.com`;

  const existing = findUserByEmail(email);
  if (existing) {
    persistSession(existing);
    return { ok: true, user: existing };
  }

  const user = createUserRecord({
    fullName: "Afrawood Google User",
    email,
    password: "",
    provider: "google",
    avatar: "",
  });

  insertUser(user);
  persistSession(user);

  return {
    ok: true,
    user,
  };
}

export async function logoutUser() {
  await wait(100);
  clearSession();
  return { ok: true };
}