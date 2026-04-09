import React, { createContext, useContext, useState } from "react";

/**
 * AfraFlow Context
 * Central state for:
 * Idea → Story → Scene → Shot → Dialogue → Image → Video
 */

const AfraFlowContext = createContext(null);

export function AfraFlowProvider({ children }) {
  const [project, setProject] = useState({
    title: "",
    topic: "",
    genre: "drama",
    tone: "cinematic",
    language: "en",
    platform: "youtube",
    format: "short_film",
    duration: 5,

    logline: "",
    synopsis: "",
    recommendation: "",

    scenes: [],
  });

  // 🔥 USER STATE (NEW - SAFE)
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("afrawood_user")) || {
        plan: "free",
        credits: 0,
      };
    } catch {
      return { plan: "free", credits: 0 };
    }
  });

  /* =========================
     USER / CREDIT SYSTEM (NEW)
  ========================= */

  const updateUser = (data = {}) => {
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem("afrawood_user", JSON.stringify(updated));
    return updated;
  };

  const addCredits = (amount = 0) => {
    if (!amount || amount <= 0) return user;

    const updated = {
      ...user,
      credits: (user.credits || 0) + amount,
    };

    setUser(updated);
    localStorage.setItem("afrawood_user", JSON.stringify(updated));

    return updated;
  };

  /* =========================
     Script Loader
  ========================= */
  const loadScriptResult = (result) => {
    if (!result) return;

    setProject((prev) => ({
      ...prev,
      title: result.title || prev.title,
      topic: result.topic || prev.topic,
      genre: result.genre || prev.genre,
      tone: result.tone || prev.tone,
      language: result.language || prev.language,
      platform: result.platform || prev.platform,
      format: result.format || prev.format,
      duration: result.duration || prev.duration,

      logline: result.logline || "",
      synopsis: result.synopsis || "",
      recommendation: result.recommendation || "",

      scenes: Array.isArray(result.scenes) ? result.scenes : [],
    }));
  };

  /* =========================
     Scene Management
  ========================= */
  const replaceScenes = (scenes) => {
    setProject((prev) => ({
      ...prev,
      scenes: Array.isArray(scenes) ? scenes : [],
    }));
  };

  const addScene = (scene) => {
    setProject((prev) => ({
      ...prev,
      scenes: [...(prev.scenes || []), scene],
    }));
  };

  const removeScene = (sceneId) => {
    setProject((prev) => ({
      ...prev,
      scenes: (prev.scenes || []).filter((s) => s.id !== sceneId),
    }));
  };

  const updateScene = (sceneId, data) => {
    setProject((prev) => ({
      ...prev,
      scenes: (prev.scenes || []).map((scene) =>
        scene.id === sceneId ? { ...scene, ...data } : scene
      ),
    }));
  };

  /* =========================
     Shot Management
  ========================= */
  const updateShot = (shotId, data) => {
    setProject((prev) => ({
      ...prev,
      scenes: (prev.scenes || []).map((scene) => ({
        ...scene,
        shots: (scene.shots || []).map((shot) =>
          shot.id === shotId ? { ...shot, ...data } : shot
        ),
      })),
    }));
  };

  const addShotToScene = (sceneId, shot) => {
    setProject((prev) => ({
      ...prev,
      scenes: (prev.scenes || []).map((scene) =>
        scene.id === sceneId
          ? {
              ...scene,
              shots: [...(scene.shots || []), shot],
            }
          : scene
      ),
    }));
  };

  const removeShotFromScene = (sceneId, shotId) => {
    setProject((prev) => ({
      ...prev,
      scenes: (prev.scenes || []).map((scene) =>
        scene.id === sceneId
          ? {
              ...scene,
              shots: (scene.shots || []).filter((s) => s.id !== shotId),
            }
          : scene
      ),
    }));
  };

  /* =========================
     Values
  ========================= */
  const value = {
    ...project,

    // user
    user,
    updateUser,
    addCredits,

    // script
    loadScriptResult,

    // scenes
    replaceScenes,
    addScene,
    removeScene,
    updateScene,

    // shots
    updateShot,
    addShotToScene,
    removeShotFromScene,
  };

  return (
    <AfraFlowContext.Provider value={value}>
      {children}
    </AfraFlowContext.Provider>
  );
}

export function useAfraFlow() {
  const ctx = useContext(AfraFlowContext);
  if (!ctx) {
    throw new Error("useAfraFlow must be used inside AfraFlowProvider");
  }
  return ctx;
}