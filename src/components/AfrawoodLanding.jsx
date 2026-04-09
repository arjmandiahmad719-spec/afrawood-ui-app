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
const MODAL_BACKDROP =
  "fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm";
const MODAL_PANEL =
  "w-full max-w-3xl rounded-[32px] border border-white/10 bg-[#070707] p-5 text-white shadow-[0_30px_120px_rgba(0,0,0,0.55)] md:p-7";
const MODAL_TITLE = "text-2xl font-black tracking-tight text-white";
const MODAL_TEXT = "text-sm leading-7 text-white/70";
const CHIP =
  "inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70";

function Modal({ title, closeText, children, onClose }) {
  return (
    <div className={MODAL_BACKDROP} onClick={onClose}>
      <div className={MODAL_PANEL} onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className={MODAL_TITLE}>{title}</h2>
          <button type="button" className={BUTTON} onClick={onClose}>
            {closeText}
          </button>
        </div>
        <div className="max-h-[75vh] overflow-auto pr-1">{children}</div>
      </div>
    </div>
  );
}

export default function AfrawoodLanding({ onNavigate }) {
  const [query, setQuery] = useState("");
  const [activeModal, setActiveModal] = useState("");
  const videoRef = useRef(null);
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated, openAuth, logout } = useAuth();
  const creditSummary = getCreditSummary();

  const detectedMode = useMemo(() => {
    const q = query.toLowerCase();

    if (
      q.includes("script") ||
      q.includes("screenplay") ||
      q.includes("story") ||
      q.includes("dialogue") ||
      q.includes("فیلمنامه") ||
      q.includes("داستان")
    ) {
      return "script";
    }

    if (
      q.includes("image") ||
      q.includes("photo") ||
      q.includes("poster") ||
      q.includes("cinematic image") ||
      q.includes("عکس") ||
      q.includes("تصویر")
    ) {
      return "image";
    }

    if (
      q.includes("video") ||
      q.includes("animation") ||
      q.includes("text to video") ||
      q.includes("image to video") ||
      q.includes("ویدیو")
    ) {
      return "video";
    }

    if (
      q.includes("merge") ||
      q.includes("combine") ||
      q.includes("montage") ||
      q.includes("edit") ||
      q.includes("ادغام") ||
      q.includes("مونتاژ")
    ) {
      return "merge";
    }

    if (
      q.includes("subtitle") ||
      q.includes("caption") ||
      q.includes("زیرنویس")
    ) {
      return "subtitle";
    }

    if (
      q.includes("voice") ||
      q.includes("narration") ||
      q.includes("speaker") ||
      q.includes("صدا") ||
      q.includes("گوینده")
    ) {
      return "voice";
    }

    if (
      q.includes("music") ||
      q.includes("soundtrack") ||
      q.includes("song") ||
      q.includes("موسیقی")
    ) {
      return "music";
    }

    if (
      q.includes("export") ||
      q.includes("render") ||
      q.includes("output") ||
      q.includes("خروجی")
    ) {
      return "export";
    }

    if (
      q.includes("price") ||
      q.includes("pricing") ||
      q.includes("plan") ||
      q.includes("pro") ||
      q.includes("upgrade") ||
      q.includes("اشتراک") ||
      q.includes("قیمت")
    ) {
      return "pricing";
    }

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

  function handleVideoEnded() {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = video.duration || video.currentTime;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,200,90,0.06),transparent_35%)]" />

      <div className="absolute left-8 top-8 z-20 flex flex-wrap items-center gap-6">
        <button
          type="button"
          className={TOP_LINK}
          onClick={() => setActiveModal("about")}
        >
          {t("common.about", "About")}
        </button>
        <button
          type="button"
          className={TOP_LINK}
          onClick={() => setActiveModal("contact")}
        >
          {t("common.contactUs", "Contact Us")}
        </button>
      </div>

      <div className="absolute right-8 top-8 z-20 flex flex-wrap items-center gap-4">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
        >
          {SUPPORTED_LANGUAGES.map((item) => (
            <option key={item.code} value={item.code} className="bg-black">
              {item.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          className={TOP_LINK}
          onClick={() => navigate("pricing")}
        >
          {t("common.pricing", "Pricing")}
        </button>

        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm text-white/85">
                {user?.fullName || user?.email || "User"}
              </div>
              <div className="text-xs text-white/50">
                {creditSummary.plan?.name || "Free"} •{" "}
                {creditSummary.creditsRemaining}
              </div>
            </div>
            <button type="button" className={TOP_LINK} onClick={logout}>
              {t("auth.logout", "Logout")}
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={TOP_LINK}
            onClick={() => openAuth("login")}
          >
            {t("common.signUpLogin", "Sign Up / Login")}
          </button>
        )}
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1600px] grid-cols-1 xl:grid-cols-[1.08fr_0.92fr] px-6 py-8">
        <section className="flex flex-col items-center justify-center xl:items-start xl:pl-10">
          <img
            src={logoImg}
            alt="Afrawood"
            className="mb-10 w-[920px] max-w-[98%] object-contain"
            loading="eager"
          />

          <div className="w-full max-w-[760px]">
            <div className="mb-4 text-center text-lg font-medium text-white/90 xl:text-left">
              {t("landing.help", "How can I help?")}
            </div>

            <form onSubmit={handleSubmit} className={CHAT_WRAP}>
              <div className="flex flex-col gap-3 md:flex-row">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t(
                    "landing.placeholder",
                    "Describe what you want to create..."
                  )}
                  className={CHAT_INPUT}
                />

                <button type="submit" className={OPEN_BUTTON}>
                  {t("common.open", "Open")}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className={CHIP}>{creditSummary.plan?.name || "Free"}</span>
            <span className={CHIP}>
              {t("pricing.currentCredits", "Current credits:")}{" "}
              {creditSummary.creditsRemaining}
            </span>
            <span className={CHIP}>
              {t("pricing.watermark", "Watermark:")}{" "}
              {creditSummary.watermark
                ? t("pricing.on", "On")
                : t("pricing.off", "Off")}
            </span>
          </div>

          <div className="mt-10 flex max-w-[1100px] flex-wrap justify-center gap-4 xl:justify-start">
            <button className={BUTTON} onClick={() => navigate("script")}>
              {t("modules.script", "AI Script")}
            </button>
            <button className={BUTTON} onClick={() => navigate("image")}>
              {t("modules.image", "Cinematic Image")}
            </button>
            <button className={BUTTON} onClick={() => navigate("video")}>
              {t("modules.video", "Video Generator")}
            </button>
            <button className={BUTTON} onClick={() => navigate("merge")}>
              {t("modules.merge", "Video Merge")}
            </button>
            <button className={BUTTON} onClick={() => navigate("subtitle")}>
              {t("modules.subtitle", "Subtitle Generator")}
            </button>
            <button className={BUTTON} onClick={() => navigate("voice")}>
              {t("modules.voice", "Voice Generator")}
            </button>
            <button className={BUTTON} onClick={() => navigate("music")}>
              {t("modules.music", "Music Generator")}
            </button>
            <button className={BUTTON} onClick={() => navigate("export")}>
              {t("modules.export", "Export")}
            </button>
          </div>
        </section>

        <section className="mt-10 flex items-end justify-center xl:mt-0 xl:justify-end xl:pr-6">
          <video
            ref={videoRef}
            src={welcomeVideo}
            autoPlay
            muted
            controls={false}
            playsInline
            preload="auto"
            loop={false}
            onEnded={handleVideoEnded}
            className="h-[92vh] max-h-[920px] object-contain"
          />
        </section>
      </div>

      {activeModal === "contact" ? (
        <Modal
          title={t("landing.contactTitle", "Contact Us")}
          closeText={t("common.close", "Close")}
          onClose={() => setActiveModal("")}
        >
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <span className={CHIP}>Afrawood</span>
              <span className={CHIP}>{t("landing.support", "Support")}</span>
              <span className={CHIP}>
                {t("landing.partnership", "Partnership")}
              </span>
            </div>

            <p className={MODAL_TEXT}>
              {t(
                "landing.contactIntro",
                "Users can contact Afrawood through this email:"
              )}
            </p>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="mb-2 text-sm font-bold text-white">Email</div>
              <div className={MODAL_TEXT}>afrawoodfilm@gmail.com</div>
            </div>
          </div>
        </Modal>
      ) : null}

      {activeModal === "about" ? (
        <Modal
          title={t("landing.aboutTitle", "About Afrawood")}
          closeText={t("common.close", "Close")}
          onClose={() => setActiveModal("")}
        >
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <span className={CHIP}>
                {t("landing.aiFilmStudio", "AI Film Studio")}
              </span>
              <span className={CHIP}>
                {t("landing.creatorEconomy", "Creator Economy")}
              </span>
              <span className={CHIP}>
                {t("landing.revenueTools", "Revenue Tools")}
              </span>
            </div>

            <div>
              <div className="mb-2 text-base font-bold text-white">
                {t("landing.whyTitle", "Why Afrawood was created")}
              </div>
              <p className={MODAL_TEXT}>{t("landing.whyText")}</p>
            </div>

            <div>
              <div className="mb-2 text-base font-bold text-white">
                {t("landing.whatTitle", "What the app does")}
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <div className="mb-2 font-semibold text-white">
                    {t("modules.script", "AI Script")}
                  </div>
                  <div className={MODAL_TEXT}>
                    {t(
                      "landing.how2Text",
                      "Build text, images, video, voice, and music."
                    )}
                  </div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <div className="mb-2 font-semibold text-white">
                    {t("modules.image", "Cinematic Image")}
                  </div>
                  <div className={MODAL_TEXT}>
                    {t(
                      "landing.how2Text",
                      "Build text, images, video, voice, and music."
                    )}
                  </div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <div className="mb-2 font-semibold text-white">
                    {t("modules.video", "Video Generator")}
                  </div>
                  <div className={MODAL_TEXT}>
                    {t(
                      "landing.how2Text",
                      "Build text, images, video, voice, and music."
                    )}
                  </div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <div className="mb-2 font-semibold text-white">
                    {t("modules.voice", "Voice Generator")}
                  </div>
                  <div className={MODAL_TEXT}>
                    {t(
                      "landing.how2Text",
                      "Build text, images, video, voice, and music."
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2 text-base font-bold text-white">
                {t("landing.howTitle", "How to use Afrawood")}
              </div>
              <div className="space-y-3">
                <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <div className="font-semibold text-white">
                    {t("landing.how1Title")}
                  </div>
                  <div className={MODAL_TEXT}>{t("landing.how1Text")}</div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <div className="font-semibold text-white">
                    {t("landing.how2Title")}
                  </div>
                  <div className={MODAL_TEXT}>{t("landing.how2Text")}</div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <div className="font-semibold text-white">
                    {t("landing.how3Title")}
                  </div>
                  <div className={MODAL_TEXT}>{t("landing.how3Text")}</div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <div className="font-semibold text-white">
                    {t("landing.how4Title")}
                  </div>
                  <div className={MODAL_TEXT}>{t("landing.how4Text")}</div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}