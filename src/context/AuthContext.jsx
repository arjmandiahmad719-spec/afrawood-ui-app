import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  loginWithEmail as loginWithEmailService,
  loginWithGoogleMock as loginWithGoogleMockService,
  logoutUser,
  restoreSession,
  signupWithEmail as signupWithEmailService,
} from "../ai/authService.js";
import { updateCurrentSessionUser } from "../ai/userStore.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      setIsLoading(true);
      const result = await restoreSession();

      if (!active) return;

      if (result.ok && result.user) {
        setUser(result.user);
      }

      setIsLoading(false);
    }

    bootstrap();

    return () => {
      active = false;
    };
  }, []);

  function openAuth(mode = "login") {
    setAuthMode(mode === "signup" ? "signup" : "login");
    setIsAuthOpen(true);
  }

  function closeAuth() {
    if (isSubmitting) return;
    setIsAuthOpen(false);
  }

  function switchAuthMode(mode = "login") {
    setAuthMode(mode === "signup" ? "signup" : "login");
  }

  async function loginWithEmail(payload) {
    setIsSubmitting(true);
    try {
      const result = await loginWithEmailService(payload);
      if (result.ok) {
        setUser(result.user);
        setIsAuthOpen(false);
      }
      return result;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function signupWithEmail(payload) {
    setIsSubmitting(true);
    try {
      const result = await signupWithEmailService(payload);
      if (result.ok) {
        setUser(result.user);
        setIsAuthOpen(false);
      }
      return result;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function loginWithGoogleMock() {
    setIsSubmitting(true);
    try {
      const result = await loginWithGoogleMockService();
      if (result.ok) {
        setUser(result.user);
        setIsAuthOpen(false);
      }
      return result;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function logout() {
    setIsSubmitting(true);
    try {
      await logoutUser();
      setUser(null);
      return { ok: true };
    } finally {
      setIsSubmitting(false);
    }
  }

  function requireAuth(mode = "login") {
    if (user) {
      return true;
    }
    openAuth(mode);
    return false;
  }

  function refreshUserFromPatch(patch = {}) {
    const updated = updateCurrentSessionUser(patch);
    if (updated) {
      setUser(updated);
    }
    return updated;
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAuthOpen,
      authMode,
      isLoading,
      isSubmitting,
      openAuth,
      closeAuth,
      switchAuthMode,
      loginWithEmail,
      signupWithEmail,
      loginWithGoogleMock,
      logout,
      requireAuth,
      refreshUserFromPatch,
    }),
    [user, isAuthOpen, authMode, isLoading, isSubmitting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}