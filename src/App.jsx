import React, { useMemo, useState } from "react";
import AfrawoodLanding from "./components/AfrawoodLanding.jsx";
import AIScriptPage from "./pages/AIScriptPage.jsx";
import CinematicImagePage from "./pages/CinematicImagePage.jsx";
import VideoGeneratorPage from "./pages/VideoGeneratorPage.jsx";
import VideoMergePage from "./pages/VideoMergePage.jsx";
import SubtitleGeneratorPage from "./pages/SubtitleGeneratorPage.jsx";
import VoiceGeneratorPage from "./pages/VoiceGeneratorPage.jsx";
import MusicGeneratorPage from "./pages/MusicGeneratorPage.jsx";
import AIFilmStudioPage from "./pages/AIFilmStudioPage.jsx";
import ExportPage from "./pages/ExportPage.jsx";
import PricingPage from "./pages/PricingPage.jsx";
import { useLanguage } from "./i18n/LanguageContext.jsx";
import { SUPPORTED_LANGUAGES } from "./i18n/translations.js";
import { AuthProvider } from "./context/AuthContext.jsx";
import AuthModal from "./components/auth/AuthModal.jsx";

const APP_SHELL =
  "min-h-screen bg-black text-white selection:bg-cyan-400/30 selection:text-white";
const PAGE_WRAP =
  "mx-auto w-full max-w-[1600px] px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-5 xl:px-8";
const TOPBAR =
  "sticky top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur-xl";
const TOPBAR_INNER =
  "mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3 px-3 py-3 sm:px-4 md:px-6 xl:px-8";
const HOME_BUTTON =
  "inline-flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-left text-white transition hover:border-cyan-400/40 hover:bg-white/10";
const LOGO_BADGE =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-amber-300 text-base font-black text-black";
const NAV_LINK =
  "rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/75 transition hover:border-cyan-400/40 hover:bg-white/10 hover:text-white";
const MOBILE_SELECT =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none md:hidden";
const DESKTOP_NAV = "hidden items-center gap-2 lg:flex";
const LANG_SELECT =
  "rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none";

function AppShell() {
  const [mode, setMode] = useState("home");
  const { language, setLanguage, t } = useLanguage();

  const isHome = mode === "home";

  const pageTitle = useMemo(() => {
    return t(`pageTitles.${mode}`, t("pageTitles.home", "Afrawood"));
  }, [mode, t]);

  const pageProps = {
    onBackHome: () => setMode("home"),
  };

  function handleNavigate(nextMode) {
    const allowed = new Set([
      "home",
      "script",
      "image",
      "video",
      "merge",
      "subtitle",
      "voice",
      "music",
      "export",
      "pricing",
      "film_studio",
    ]);
    setMode(allowed.has(nextMode) ? nextMode : "home");
  }

  function renderPage() {
    switch (mode) {
      case "script":
        return <AIScriptPage {...pageProps} />;
      case "image":
        return <CinematicImagePage {...pageProps} />;
      case "video":
        return <VideoGeneratorPage {...pageProps} />;
      case "merge":
        return <VideoMergePage {...pageProps} />;
      case "subtitle":
        return <SubtitleGeneratorPage {...pageProps} />;
      case "voice":
        return <VoiceGeneratorPage {...pageProps} />;
      case "music":
        return <MusicGeneratorPage {...pageProps} />;
      case "export":
        return <ExportPage {...pageProps} />;
      case "pricing":
        return <PricingPage {...pageProps} />;
      case "film_studio":
        return <AIFilmStudioPage {...pageProps} />;
      case "home":
      default:
        return <AfrawoodLanding onNavigate={handleNavigate} />;
    }
  }

  return (
    <div className={APP_SHELL}>
      <AuthModal />

      {!isHome ? (
        <header className={TOPBAR}>
          <div className={TOPBAR_INNER}>
            <button type="button" className={HOME_BUTTON} onClick={() => setMode("home")}>
              <span className={LOGO_BADGE}>A</span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold tracking-[0.18em] text-white">
                  AFRAWOOD
                </span>
                <span className="block truncate text-[11px] text-white/45">{pageTitle}</span>
              </span>
            </button>

            <div className="flex items-center gap-2">
              <nav className={DESKTOP_NAV}>
                <button type="button" className={NAV_LINK} onClick={() => setMode("image")}>
                  {t("nav.image", "Image")}
                </button>
                <button type="button" className={NAV_LINK} onClick={() => setMode("video")}>
                  {t("nav.video", "Video")}
                </button>
                <button type="button" className={NAV_LINK} onClick={() => setMode("merge")}>
                  {t("nav.merge", "Merge")}
                </button>
                <button type="button" className={NAV_LINK} onClick={() => setMode("subtitle")}>
                  {t("nav.subtitle", "Subtitle")}
                </button>
                <button type="button" className={NAV_LINK} onClick={() => setMode("voice")}>
                  {t("nav.voice", "Voice")}
                </button>
                <button type="button" className={NAV_LINK} onClick={() => setMode("music")}>
                  {t("nav.music", "Music")}
                </button>
                <button type="button" className={NAV_LINK} onClick={() => setMode("export")}>
                  {t("nav.export", "Export")}
                </button>
                <button type="button" className={NAV_LINK} onClick={() => setMode("pricing")}>
                  {t("nav.pricing", "Pricing")}
                </button>
              </nav>

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={LANG_SELECT}
              >
                {SUPPORTED_LANGUAGES.map((item) => (
                  <option key={item.code} value={item.code} className="bg-black">
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[1600px] px-3 pb-3 sm:px-4 md:px-6 lg:hidden xl:px-8">
            <div className="flex gap-3">
              <select
                className={`${MOBILE_SELECT} flex-1`}
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <option value="image">{t("modules.image", "Cinematic Image")}</option>
                <option value="video">{t("modules.video", "Video Generator")}</option>
                <option value="merge">{t("modules.merge", "Video Merge")}</option>
                <option value="subtitle">{t("modules.subtitle", "Subtitle Generator")}</option>
                <option value="voice">{t("modules.voice", "Voice Generator")}</option>
                <option value="music">{t("modules.music", "Music Generator")}</option>
                <option value="export">{t("modules.export", "Export")}</option>
                <option value="pricing">{t("common.pricing", "Pricing")}</option>
                <option value="film_studio">{t("modules.filmStudio", "Afrawood Full Studio")}</option>
              </select>

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={LANG_SELECT}
              >
                {SUPPORTED_LANGUAGES.map((item) => (
                  <option key={item.code} value={item.code} className="bg-black">
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>
      ) : null}

      <main className={isHome ? "" : PAGE_WRAP}>{renderPage()}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}