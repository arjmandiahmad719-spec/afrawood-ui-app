import React, { useMemo, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const PANEL =
  "rounded-[30px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.35)] md:p-6";
const INPUT =
  "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20";
const LABEL = "mb-2 block text-sm font-medium text-white/80";
const PRIMARY_BUTTON =
  "inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-amber-300 px-4 py-3 text-sm font-semibold text-black transition hover:scale-[1.02] active:scale-[0.99]";
const SECONDARY_BUTTON =
  "inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-cyan-400/40 hover:bg-white/10";
const CHIP =
  "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80";

function SectionTitle({ title, desc }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {desc ? <p className="mt-1 text-sm text-white/55">{desc}</p> : null}
    </div>
  );
}

function buildScript({ title, genre, tone, language, duration, topic, idea }) {
  const cleanTitle = title || "Untitled Project";
  const cleanIdea = idea || "A character faces a meaningful turning point.";
  const cleanTopic = topic || "human transformation";

  return `TITLE: ${cleanTitle}

FORMAT
- Genre: ${genre}
- Tone: ${tone}
- Language: ${language}
- Duration: ${duration}
- Topic: ${cleanTopic}

LOGLINE
${cleanIdea}

STORY SUMMARY
A focused cinematic story built around ${cleanTopic}. The protagonist enters a difficult situation, faces emotional pressure, and finds a new direction through action and consequence.

SCENE 1
The world is introduced with a strong visual hook. The protagonist is placed in a setting that reflects the conflict.

SCENE 2
The problem becomes clear. Stakes rise. The protagonist must make a choice.

SCENE 3
The emotional core deepens. Conflict becomes personal and harder to avoid.

SCENE 4
The protagonist takes decisive action. Consequences unfold quickly.

SCENE 5
A final beat resolves the dramatic question and leaves a memorable closing image.

SAMPLE DIALOGUE
PROTAGONIST:
I thought I had more time.

SECOND CHARACTER:
You never had time. You only had a choice.

PROTAGONIST:
Then this is the moment.

DIRECTOR NOTE
Keep the pacing visually strong, emotionally direct, and production-friendly.`;
}

export default function AIScriptPage({ onBackHome }) {
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("Drama");
  const [tone, setTone] = useState("Cinematic");
  const [language, setLanguage] = useState("English");
  const [duration, setDuration] = useState("5 min");
  const [topic, setTopic] = useState("");
  const [idea, setIdea] = useState("");
  const [status, setStatus] = useState(t("common.ready", "Ready"));
  const [script, setScript] = useState("");

  const stats = useMemo(() => {
    const words = script.trim() ? script.trim().split(/\s+/).length : 0;
    return { words };
  }, [script]);

  function generateScript() {
    const result = buildScript({ title, genre, tone, language, duration, topic, idea });
    setScript(result);
    setStatus(t("script.generated", "Script generated."));
  }

  function downloadScript() {
    if (!script.trim()) return;
    const blob = new Blob([script], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(title || "afrawood_script").replace(/[^\w\-]+/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-[calc(100vh-110px)] text-white">
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className={PANEL}>
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className={CHIP}>{t("modules.script", "AI Script")}</span>
            <span className={CHIP}>{t("common.ready", "Ready")}</span>
          </div>

          <SectionTitle
            title={t("script.setupTitle", "Script Setup")}
            desc={t("script.setupDesc", "Set your script parameters and generate a clean draft.")}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={LABEL}>{t("common.projectTitle", "Project Title")}</label>
              <input className={INPUT} value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div>
              <label className={LABEL}>{t("script.genre", "Genre")}</label>
              <select className={INPUT} value={genre} onChange={(e) => setGenre(e.target.value)}>
                <option>Drama</option>
                <option>Thriller</option>
                <option>Romance</option>
                <option>Action</option>
                <option>Sci-Fi</option>
              </select>
            </div>

            <div>
              <label className={LABEL}>{t("script.tone", "Tone")}</label>
              <select className={INPUT} value={tone} onChange={(e) => setTone(e.target.value)}>
                <option>Cinematic</option>
                <option>Dark</option>
                <option>Emotional</option>
                <option>Epic</option>
                <option>Minimal</option>
              </select>
            </div>

            <div>
              <label className={LABEL}>{t("common.language", "Language")}</label>
              <select className={INPUT} value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option>English</option>
                <option>Türkçe</option>
                <option>فارسی</option>
                <option>Français</option>
                <option>العربية</option>
                <option>Português</option>
                <option>中文</option>
              </select>
            </div>

            <div>
              <label className={LABEL}>{t("script.duration", "Duration")}</label>
              <select className={INPUT} value={duration} onChange={(e) => setDuration(e.target.value)}>
                <option>1 min</option>
                <option>3 min</option>
                <option>5 min</option>
                <option>10 min</option>
                <option>20 min</option>
              </select>
            </div>

            <div>
              <label className={LABEL}>{t("script.topic", "Topic")}</label>
              <input className={INPUT} value={topic} onChange={(e) => setTopic(e.target.value)} />
            </div>
          </div>

          <div className="mt-4">
            <label className={LABEL}>{t("script.idea", "Core Idea")}</label>
            <textarea
              className={`${INPUT} min-h-[180px] resize-y`}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder={t("script.ideaPlaceholder", "Write the main story idea here...")}
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" className={PRIMARY_BUTTON} onClick={generateScript}>
              {t("script.generate", "Generate Script")}
            </button>
            <button type="button" className={SECONDARY_BUTTON} onClick={downloadScript} disabled={!script}>
              {t("script.download", "Download Script")}
            </button>
            {typeof onBackHome === "function" ? (
              <button type="button" className={SECONDARY_BUTTON} onClick={onBackHome}>
                {t("common.home", "Home")}
              </button>
            ) : null}
          </div>
        </section>

        <section className={PANEL}>
          <SectionTitle
            title={t("common.preview", "Preview")}
            desc={t("script.previewDesc", "Generated script draft appears here.")}
          />

          <div className="mb-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-4 text-sm text-cyan-100">
            {status}
          </div>

          <div className="mb-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">
            {t("script.wordCount", "Word count")}: {stats.words}
          </div>

          <pre className="min-h-[560px] overflow-auto rounded-2xl bg-black/40 p-4 text-sm leading-7 text-white/85 whitespace-pre-wrap">
{script || t("script.empty", "No script yet.")}
          </pre>
        </section>
      </div>
    </div>
  );
}