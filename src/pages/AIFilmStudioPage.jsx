import React from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const PANEL =
  "rounded-[30px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.35)]";
const PRIMARY_BUTTON =
  "inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-amber-300 px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.02] active:scale-[0.99]";
const SECONDARY_BUTTON =
  "inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-400/40 hover:bg-white/10";
const CHIP =
  "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80";

function FeatureCard({ title, desc, status }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span className={CHIP}>{status}</span>
      </div>
      <p className="text-sm leading-6 text-white/58">{desc}</p>
    </div>
  );
}

export default function AIFilmStudioPage({ onBackHome }) {
  const { t } = useLanguage();

  return (
    <div className="min-h-[calc(100vh-110px)] bg-black text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        <div className={`${PANEL} overflow-hidden`}>
          <div className="border-b border-white/10 bg-gradient-to-r from-cyan-400/10 via-transparent to-amber-300/10 px-5 py-6 md:px-6">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className={CHIP}>{t("modules.filmStudio", "Afrawood Full Studio")}</span>
              <span className={CHIP}>{t("common.comingSoon", "Coming Soon")}</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {t("filmStudio.title", "Full Studio is under construction")}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60 md:text-base">
              {t(
                "filmStudio.desc",
                "This section remains intentionally inactive for now so the core revenue tools stay stable."
              )}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {typeof onBackHome === "function" ? (
                <button type="button" className={PRIMARY_BUTTON} onClick={onBackHome}>
                  {t("common.backHome", "Back Home")}
                </button>
              ) : null}

              <button type="button" className={SECONDARY_BUTTON}>
                {t("common.comingSoon", "Coming Soon")}
              </button>
            </div>
          </div>

          <div className="grid gap-5 px-5 py-6 md:grid-cols-2 md:px-6 xl:grid-cols-3">
            <FeatureCard
              title={t("filmStudio.card1Title", "Unified Production Pipeline")}
              status={t("filmStudio.planned", "Planned")}
              desc={t("filmStudio.card1Desc", "Connect all stages from idea to final output in one environment.")}
            />
            <FeatureCard
              title={t("filmStudio.card2Title", "Scene-Level Direction")}
              status={t("filmStudio.later", "Later")}
              desc={t("filmStudio.card2Desc", "Manage scene, shot, style, dialogue, and directing decisions.")}
            />
            <FeatureCard
              title={t("filmStudio.card3Title", "Character Consistency")}
              status={t("filmStudio.later", "Later")}
              desc={t("filmStudio.card3Desc", "Keep characters consistent across image, video, voice, and episodic projects.")}
            />
            <FeatureCard
              title={t("filmStudio.card4Title", "Long-form Workflow")}
              status={t("filmStudio.later", "Later")}
              desc={t("filmStudio.card4Desc", "Better support for long-form and episodic projects.")}
            />
            <FeatureCard
              title={t("filmStudio.card5Title", "Team Collaboration")}
              status={t("filmStudio.planned", "Planned")}
              desc={t("filmStudio.card5Desc", "Enable multiple roles to collaborate on the same project in future versions.")}
            />
            <FeatureCard
              title={t("filmStudio.card6Title", "Studio Automation")}
              status={t("filmStudio.planned", "Planned")}
              desc={t("filmStudio.card6Desc", "Professional automated pipelines for faster production.")}
            />
          </div>

          <div className="border-t border-white/10 px-5 py-6 md:px-6">
            <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5">
              <div className="mb-2 text-sm font-semibold text-cyan-100">
                {t("landing.howTitle", "Current Phase Focus")}
              </div>
              <p className="text-sm leading-7 text-cyan-50/90">
                {t(
                  "filmStudio.focus",
                  "Current priority remains Image / Video / Merge / Subtitle / Voice / Music / Export."
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}