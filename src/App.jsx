import React, { useEffect, useMemo, useState } from "react";
import AfrawoodLanding from "./components/AfrawoodLanding";
import { AfraFlowProvider } from "./ai/core/AfraFlowContext";
import { LanguageProvider } from "./i18n/LanguageContext.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";

import AboutPage from "./pages/AboutPage.jsx";
import AIScriptPage from "./pages/AIScriptPage";
import CancelPage from "./pages/CancelPage";
import ContactPage from "./pages/ContactPage.jsx";
import CinematicImagePage from "./pages/CinematicImagePage";
import ExportPage from "./pages/ExportPage";
import MusicGeneratorPage from "./pages/MusicGeneratorPage";
import PricingPage from "./pages/PricingPage";
import SignUpPage from "./pages/SignUpPage.jsx";
import SubtitleGeneratorPage from "./pages/SubtitleGeneratorPage";
import SuccessPage from "./pages/SuccessPage";
import VideoGeneratorPage from "./pages/VideoGeneratorPage";
import VideoMergePage from "./pages/VideoMergePage";
import VoiceGeneratorPage from "./pages/VoiceGeneratorPage";

const APP_STYLE = {
  minHeight: "100vh",
  width: "100%",
  background: "#000",
  color: "#fff",
};

const PAGE_SHELL_STYLE = {
  minHeight: "100vh",
  width: "100%",
  background:
    "radial-gradient(circle at top center, rgba(16,190,194,0.10), transparent 28%), radial-gradient(circle at bottom left, rgba(241,196,67,0.10), transparent 24%), #000",
  color: "#fff",
  position: "relative",
};

const HOME_BUTTON_STYLE = {
  position: "fixed",
  top: 20,
  left: 20,
  zIndex: 999,
  height: 46,
  padding: "0 18px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(10,10,10,0.88)",
  color: "#fff",
  cursor: "pointer",
  fontSize: 15,
  fontWeight: 600,
};

const PROTECTED_ROUTES = new Set([
  "script",
  "ai-script",
  "screenplay",
  "image",
  "cinematic-image",
  "poster",
  "video",
  "video-generator",
  "text-to-video",
  "image-to-video",
  "merge",
  "video-merge",
  "montage",
  "subtitle",
  "subtitle-generator",
  "voice",
  "voice-generator",
  "music",
  "music-generator",
  "export",
  "export-page",
  "pricing",
  "monetization",
  "update",
  "plans",
  "success",
]);

function normalizeTarget(target) {
  if (!target) return "landing";
  if (typeof target !== "string") return "landing";
  return target.trim().toLowerCase();
}

function pathToRoute(pathname) {
  const clean = String(pathname || "/").trim().toLowerCase();
  if (clean === "/" || clean === "") return "landing";
  const route = clean.replace(/^\/+/, "").replace(/\/+$/, "");
  return normalizeTarget(route || "landing");
}

function routeToPath(route) {
  const normalized = normalizeTarget(route);
  if (normalized === "landing") return "/";
  return `/${normalized}`;
}

function AppRouter() {
  const { canAccessApp } = useAuth();
  const [route, setRoute] = useState(() => pathToRoute(window.location.pathname));

  const pageMap = useMemo(
    () => ({
      landing: null,
      script: AIScriptPage,
      "ai-script": AIScriptPage,
      screenplay: AIScriptPage,
      image: CinematicImagePage,
      "cinematic-image": CinematicImagePage,
      poster: CinematicImagePage,
      video: VideoGeneratorPage,
      "video-generator": VideoGeneratorPage,
      "text-to-video": VideoGeneratorPage,
      "image-to-video": VideoGeneratorPage,
      merge: VideoMergePage,
      "video-merge": VideoMergePage,
      montage: VideoMergePage,
      subtitle: SubtitleGeneratorPage,
      "subtitle-generator": SubtitleGeneratorPage,
      voice: VoiceGeneratorPage,
      "voice-generator": VoiceGeneratorPage,
      music: MusicGeneratorPage,
      "music-generator": MusicGeneratorPage,
      export: ExportPage,
      "export-page": ExportPage,
      about: AboutPage,
      studio: AboutPage,
      signup: SignUpPage,
      login: SignUpPage,
      auth: SignUpPage,
      pricing: PricingPage,
      monetization: PricingPage,
      update: PricingPage,
      plans: PricingPage,
      contact: ContactPage,
      success: SuccessPage,
      cancel: CancelPage,
    }),
    []
  );

  useEffect(() => {
    function handlePopState() {
      setRoute(pathToRoute(window.location.pathname));
    }

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    const normalized = normalizeTarget(route);
    const protectedRoute = PROTECTED_ROUTES.has(normalized);

    if (protectedRoute && !canAccessApp) {
      if (window.location.pathname !== "/signup") {
        window.history.pushState({}, "", "/signup");
      }
      setRoute("signup");
      return;
    }

    const nextPath = routeToPath(normalized);
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
  }, [route, canAccessApp]);

  function handleNavigate(target) {
    const normalized = normalizeTarget(target);

    if (PROTECTED_ROUTES.has(normalized) && !canAccessApp) {
      setRoute("signup");
      return;
    }

    if (pageMap[normalized] !== undefined) {
      setRoute(normalized);
      return;
    }

    setRoute("landing");
  }

  function handleOpenScript() {
    if (!canAccessApp) {
      setRoute("signup");
      return;
    }
    setRoute("script");
  }

  const normalizedRoute = pageMap[route] !== undefined ? route : "landing";
  const ActivePage = pageMap[normalizedRoute];

  if (!ActivePage) {
    return (
      <AfrawoodLanding
        onOpenScript={handleOpenScript}
        onNavigate={handleNavigate}
      />
    );
  }

  return (
    <div style={PAGE_SHELL_STYLE}>
      <button
        type="button"
        style={HOME_BUTTON_STYLE}
        onClick={() => setRoute("landing")}
      >
        Back Home
      </button>
      <ActivePage />
    </div>
  );
}

export default function App() {
  return (
    <div style={APP_STYLE}>
      <LanguageProvider>
        <AuthProvider>
          <AfraFlowProvider>
            <AppRouter />
          </AfraFlowProvider>
        </AuthProvider>
      </LanguageProvider>
    </div>
  );
}