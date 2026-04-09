import React, { useMemo, useRef, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { SUPPORTED_LANGUAGES } from "../i18n/translations.js";
import { useAuth } from "../context/AuthContext.jsx";
import { getCreditSummary } from "../ai/creditSystem.js";

const logoImg = "/logo.png";
const welcomeVideo = "/afra-welcome-avatar.mp4";

const NAV_MODES = new Set([
  "script",
  "image",
  "video",
  "merge",
  "subtitle",
  "voice",
  "music",
  "export",
  "pricing",
]);

const BUTTON =
  "px-5 py-3 rounded-2xl border border-white/10 bg-white/5 text-white text-sm font-semibold transition hover:bg-white/10 hover:border-white/20";
const TOP_LINK = "text-sm text-white/80 transition hover:text-white";
const CHAT_WRAP =
  "rounded-[28px] border border-white/10 bg-white/5 p-3 backdrop-blur-xl";
const CHAT_INPUT =
  "flex-1 h-14 rounded-2xl bg-black/40 px-5 text-white outline-none placeholder:text-white/35 border border-white/10";
const OPEN_BUTTON =
  "h-14 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 to-amber-300 text-black font-bold transition hover:scale-[1.02]";

export default function AfrawoodLanding({ onNavigate }) {
  const [query, setQuery] = useState("");
  const videoRef = useRef(null);

  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated, openAuth, logout } = useAuth();
  const creditSummary = getCreditSummary();

  const detectedMode = useMemo(() => {
    const q = query.toLowerCase();

    if (q.includes("script") || q.includes("داستان")) return "script";
    if (q.includes("image") || q.includes("عکس")) return "image";
    if (q.includes("video") || q.includes("ویدیو")) return "video";
    if (q.includes("merge") || q.includes("مونتاژ")) return "merge";
    if (q.includes("subtitle") || q.includes("زیرنویس")) return "subtitle";
    if (q.includes("voice") || q.includes("صدا")) return "voice";
    if (q.includes("music") || q.includes("موسیقی")) return "music";
    if (q.includes("export") || q.includes("خروجی")) return "export";
    if (q.includes("price") || q.includes("قیمت")) return "pricing";

    return "image";
  }, [query]);

  function navigate(mode) {
    if (!NAV_MODES.has(mode)) return;
    onNavigate?.(mode);
  }

  function handleSubmit(e) {
    e.preventDefault();
    navigate(detectedMode);
  }

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">

      {/* Top Right */}
      <div className="absolute right-8 top-8 flex items-center gap-4 z-20">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-black border border-white/10 px-3 py-2 rounded-xl"
        >
          {SUPPORTED_LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>

        {isAuthenticated ? (
          <>
            <span className="text-sm">{user?.email}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <button onClick={() => openAuth("login")}>
            Login
          </button>
        )}
      </div>

      {/* Main */}
      <div className="grid xl:grid-cols-2 min-h-screen items-center px-10">

        {/* LEFT */}
        <div>

          <img
            src={logoImg}
            alt="Afrawood"
            className="w-[600px] max-w-full mb-10"
          />

          <form onSubmit={handleSubmit} className={CHAT_WRAP}>
            <div className="flex gap-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe what you want to create..."
                className={CHAT_INPUT}
              />
              <button type="submit" className={OPEN_BUTTON}>
                Open
              </button>
            </div>
          </form>

          <div className="mt-6 text-sm text-white/60">
            Credits: {creditSummary.creditsRemaining}
          </div>

        </div>

        {/* RIGHT (VIDEO) */}
        <div className="flex justify-end">

          <video
            ref={videoRef}
            src={welcomeVideo}
            controls
            playsInline
            preload="auto"
            className="h-[90vh] object-contain"
          />

        </div>

      </div>
    </div>
  );
}