import React, { createContext, useContext, useMemo, useState } from "react";

const STORAGE_KEY = "afrawood_auth_user";
const AuthContext = createContext(null);

function readStoredUser() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeStoredUser(user) {
  if (typeof window === "undefined") return;
  if (!user) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function goToRoute(route) {
  const finalRoute = route.startsWith("/") ? route : `/${route}`;
  window.history.pushState({}, "", finalRoute);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function detectOwnerMode() {
  if (typeof window === "undefined") return false;

  const host = String(window.location.hostname || "").toLowerCase();

  return (
    host === "localhost" ||
    host === "127.0.0.1"
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const value = useMemo(() => {
    const ownerMode = detectOwnerMode();
    const isAuthenticated = Boolean(user);
    const canAccessApp = ownerMode || isAuthenticated;

    async function signup({ fullName, email, password }) {
      const res = await fetch("http://127.0.0.1:4242/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Signup failed");
      }

      setUser(data.user);
      writeStoredUser(data.user);
      return data.user;
    }

    async function login({ email, password }) {
      const res = await fetch("http://127.0.0.1:4242/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Login failed");
      }

      setUser(data.user);
      writeStoredUser(data.user);
      return data.user;
    }

    function logout() {
      setUser(null);
      writeStoredUser(null);

      if (!ownerMode) {
        goToRoute("/signup");
      } else {
        goToRoute("/");
      }
    }

    function openAuth(mode = "signup") {
      goToRoute(mode === "login" ? "/login" : "/signup");
    }

    function requireAuth() {
      if (ownerMode) return true;

      if (!user) {
        goToRoute("/signup");
        return false;
      }

      return true;
    }

    function refreshUserFromPatch(patch = {}) {
      setUser((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...patch };
        writeStoredUser(next);
        return next;
      });
    }

    return {
      user,
      isAuthenticated,
      ownerMode,
      canAccessApp,
      signup,
      login,
      logout,
      openAuth,
      requireAuth,
      refreshUserFromPatch,
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}