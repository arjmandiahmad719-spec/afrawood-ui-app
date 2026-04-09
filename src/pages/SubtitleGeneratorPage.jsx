import React, { useEffect, useMemo, useRef, useState } from "react";
import { buildSubtitlePayload } from "../ai/subtitleAI.js";
import {
  CREDIT_ACTIONS,
  canSpendCredits,
  getCreditSummary,
  spendCredits,
} from "../ai/creditSystem.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const PANEL =
  "rounded-[30px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.35)] md:p-6";
const INPUT =
  "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20";
const LABEL = "mb-2 block text-sm font-medium text-white/80";
const PRIMARY_BUTTON =
  "inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-amber-300 px-4 py-3 text-sm font-semibold text-black transition hover:scale-[1.02] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50";
const SECONDARY_BUTTON =
  "inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-cyan-400/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50";
const CHIP =
  "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80";

function uid(prefix = "item") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function formatSeconds(sec = 0) {
  if (!Number.isFinite(sec) || sec <= 0) return "00:00";
  const total = Math.round(sec);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function detectKind(file) {
  const type = file?.type || "";
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "audio";
  return "unknown";
}

function parseSrt(text) {
  const normalized = String(text || "").replace(/\r/g, "").trim();
  if (!normalized) return [];
  const blocks = normalized.split(/\n{2,}/);
  const items = [];

  for (const block of blocks) {
    const lines = block.split("\n").filter(Boolean);
    if (lines.length < 2) continue;

    let indexLine = lines[0].trim();
    let timeLine = lines[1]?.trim() || "";
    let textLines = lines.slice(2);

    if (!/^\d+$/.test(indexLine) && lines[0].includes("-->")) {
      indexLine = String(items.length + 1);
      timeLine = lines[0].trim();
      textLines = lines.slice(1);
    }

    if (!timeLine.includes("-->")) continue;
    const [start, end] = timeLine.split("-->").map((part) => part.trim());

    items.push({
      id: uid("cue"),
      index: Number(indexLine) || items.length + 1,
      start,
      end,
      text: textLines.join("\n").trim(),
    });
  }

  return items;
}

function serializeSrt(cues) {
  return cues
    .map((cue, i) => `${i + 1}\n${cue.start} --> ${cue.end}\n${cue.text}`.trim())
    .join("\n\n");
}

function SectionTitle({ title, desc }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {desc ? <p className="mt-1 text-sm text-white/55">{desc}</p> : null}
    </div>
  );
}

function CueRow({ cue, onChange, onRemove, labels }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={CHIP}>#{cue.index}</span>
          <span className={CHIP}>{cue.start}</span>
          <span className={CHIP}>{cue.end}</span>
        </div>

        <button type="button" className={SECONDARY_BUTTON} onClick={onRemove}>
          {labels.remove}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={LABEL}>{labels.start}</label>
          <input
            className={INPUT}
            value={cue.start}
            onChange={(e) => onChange({ ...cue, start: e.target.value })}
          />
        </div>

        <div>
          <label className={LABEL}>{labels.end}</label>
          <input
            className={INPUT}
            value={cue.end}
            onChange={(e) => onChange({ ...cue, end: e.target.value })}
          />
        </div>
      </div>

      <div className="mt-4">
        <label className={LABEL}>{labels.text}</label>
        <textarea
          className={`${INPUT} min-h-[96px] resize-y`}
          value={cue.text}
          onChange={(e) => onChange({ ...cue, text: e.target.value })}
        />
      </div>
    </div>
  );
}

export default function SubtitleGeneratorPage({ onBackHome }) {
  const [sourceFile, setSourceFile] = useState(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceDuration, setSourceDuration] = useState(0);
  const [projectTitle, setProjectTitle] = useState("");
  const [language, setLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("none");
  const [mode, setMode] = useState("transcribe");
  const [style, setStyle] = useState("standard");
  const [maxCharsPerLine, setMaxCharsPerLine] = useState("42");
  const [maxLinesPerCue, setMaxLinesPerCue] = useState("2");
  const [burnInRecommended, setBurnInRecommended] = useState(true);
  const [cues, setCues] = useState([]);
  const [rawText, setRawText] = useState("");
  const [status, setStatus] = useState("Ready");
  const [payload, setPayload] = useState(null);
  const [creditState, setCreditState] = useState(() => getCreditSummary());
  const inputRef = useRef(null);
  const { t } = useLanguage();

  useEffect(() => {
    return () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    };
  }, [sourceUrl]);

  const createPreview = useMemo(
    () => canSpendCredits(CREDIT_ACTIONS.SUBTITLE_CREATE, { seconds: sourceDuration || 30 }),
    [creditState, sourceDuration]
  );

  const editPreview = useMemo(
    () => canSpendCredits(CREDIT_ACTIONS.SUBTITLE_EDIT),
    [creditState]
  );

  function refreshCredits() {
    setCreditState(getCreditSummary());
  }

  function readDuration(file, url) {
    return new Promise((resolve) => {
      const kind = detectKind(file);
      const media = document.createElement(kind === "video" ? "video" : "audio");
      media.preload = "metadata";
      media.src = url;
      media.onloadedmetadata = () => resolve(Number.isFinite(media.duration) ? media.duration : 0);
      media.onerror = () => resolve(0);
    });
  }

  async function handleSourceSelect(fileList) {
    const file = Array.from(fileList || [])[0];
    if (!file) return;

    const kind = detectKind(file);
    if (kind === "unknown") {
      setStatus(t("subtitle.onlyMedia", "Only video/audio files are supported."));
      return;
    }

    if (sourceUrl) URL.revokeObjectURL(sourceUrl);

    const url = URL.createObjectURL(file);
    const duration = await readDuration(file, url);

    setSourceFile(file);
    setSourceUrl(url);
    setSourceDuration(duration);
    setStatus(t("subtitle.sourceAdded", "Source media added."));
  }

  function addCue() {
    setCues((prev) => [
      ...prev,
      {
        id: uid("cue"),
        index: prev.length + 1,
        start: "00:00:00,000",
        end: "00:00:03,000",
        text: "",
      },
    ]);
  }

  function updateCue(id, nextCue) {
    setCues((prev) =>
      prev.map((cue) => (cue.id === id ? { ...nextCue, id: cue.id, index: cue.index } : cue))
    );
  }

  function removeCue(id) {
    setCues((prev) =>
      prev.filter((cue) => cue.id !== id).map((cue, idx) => ({ ...cue, index: idx + 1 }))
    );
  }

  function importSrtFromText() {
    const parsed = parseSrt(rawText);
    if (!parsed.length) {
      setStatus(t("subtitle.noValidSrt", "No valid SRT content found."));
      return;
    }
    setCues(parsed);
    setStatus(t("subtitle.srtImported", "SRT imported."));
  }

  function preparePayload(nextStatus = "Subtitle payload is ready.") {
    const currentCues = cues.length ? cues : parseSrt(rawText);

    const built = buildSubtitlePayload({
      projectTitle,
      sourceFile,
      sourceDuration,
      mode,
      sourceLanguage: language,
      targetLanguage,
      style,
      maxCharsPerLine: Number(maxCharsPerLine) || 42,
      maxLinesPerCue: Number(maxLinesPerCue) || 2,
      burnInRecommended,
      cues: currentCues,
      rawText,
    });

    setPayload(built);
    if (!cues.length && currentCues.length) setCues(currentCues);
    setStatus(nextStatus);
  }

  function runSubtitleCreate() {
    if (!sourceFile && !cues.length && !rawText.trim()) {
      setStatus(t("subtitle.needInput", "Add source media or subtitle content first."));
      return;
    }

    const access = canSpendCredits(CREDIT_ACTIONS.SUBTITLE_CREATE, {
      seconds: sourceDuration || 30,
    });

    if (!access.ok) {
      setStatus(access.message || t("subtitle.notEnough", "Not enough credits."));
      refreshCredits();
      return;
    }

    const spent = spendCredits(CREDIT_ACTIONS.SUBTITLE_CREATE, {
      seconds: sourceDuration || 30,
    });

    refreshCredits();

    if (!spent.ok) {
      setStatus(spent.message || t("subtitle.creditFailed", "Credit spend failed."));
      return;
    }

    preparePayload(
      `${t("subtitle.created", "Subtitle ready.")} ${spent.creditsSpent} ${t("subtitle.creditsUsed", "credits used.")}`
    );
  }

  function runSubtitleEdit() {
    const access = canSpendCredits(CREDIT_ACTIONS.SUBTITLE_EDIT);

    if (!access.ok) {
      setStatus(access.message || t("subtitle.editLocked", "Subtitle edit locked."));
      refreshCredits();
      return;
    }

    const spent = spendCredits(CREDIT_ACTIONS.SUBTITLE_EDIT);
    refreshCredits();

    if (!spent.ok) {
      setStatus(spent.message || t("subtitle.editFailed", "Subtitle edit failed."));
      return;
    }

    preparePayload(
      `${t("subtitle.edited", "Subtitle edited.")} ${spent.creditsSpent} ${t("subtitle.creditsUsed", "credits used.")}`
    );
  }

  function downloadSrt() {
    const content = serializeSrt(cues);
    if (!content.trim()) return;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(projectTitle || "afrawood_subtitles").replace(/[^\w\-]+/g, "_")}.srt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function downloadPayload() {
    if (!payload) return;

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(projectTitle || "afrawood_subtitle").replace(/[^\w\-]+/g, "_")}_payload.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const cueLabels = {
    remove: t("subtitle.remove", "Remove"),
    start: t("subtitle.start", "Start"),
    end: t("subtitle.end", "End"),
    text: t("subtitle.text", "Text"),
  };

  return (
    <div className="min-h-[calc(100vh-110px)] text-white">
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <section className={PANEL}>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className={CHIP}>{t("modules.subtitle", "Subtitle Generator")}</span>
              <span className={CHIP}>{creditState.plan?.name || t("common.free", "Free")}</span>
            </div>

            <SectionTitle
              title={t("subtitle.sourceMedia", "Source Media")}
              desc={t("subtitle.sourceDesc", "Select video or audio for subtitle generation.")}
            />

            <div className="rounded-3xl border border-dashed border-cyan-400/35 bg-cyan-400/5 p-6 text-center">
              <button
                type="button"
                className={PRIMARY_BUTTON}
                onClick={() => inputRef.current?.click()}
              >
                {t("subtitle.selectSource", "Select Source")}
              </button>

              <input
                ref={inputRef}
                type="file"
                accept="video/*,audio/*"
                className="hidden"
                onChange={(e) => {
                  handleSourceSelect(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>

            {sourceFile ? (
              <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className={CHIP}>{detectKind(sourceFile)}</span>
                  <span className={CHIP}>{formatSeconds(sourceDuration || 0)}</span>
                </div>

                {detectKind(sourceFile) === "video" ? (
                  <video src={sourceUrl} controls className="w-full rounded-2xl bg-black" />
                ) : (
                  <audio src={sourceUrl} controls className="w-full" />
                )}
              </div>
            ) : null}
          </section>

          <section className={PANEL}>
            <SectionTitle
              title={t("subtitle.setup", "Subtitle Setup")}
              desc={t("subtitle.setupDesc", "Adjust subtitle settings before creation.")}
            />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <label className={LABEL}>{t("common.projectTitle", "Project Title")}</label>
                <input className={INPUT} value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} />
              </div>

              <div>
                <label className={LABEL}>{t("subtitle.mode", "Mode")}</label>
                <select className={INPUT} value={mode} onChange={(e) => setMode(e.target.value)}>
                  <option value="transcribe">Transcribe</option>
                  <option value="translate">Translate</option>
                  <option value="manual">Manual</option>
                </select>
              </div>

              <div>
                <label className={LABEL}>{t("subtitle.style", "Style")}</label>
                <select className={INPUT} value={style} onChange={(e) => setStyle(e.target.value)}>
                  <option value="standard">Standard</option>
                  <option value="cinematic">Cinematic</option>
                  <option value="social_short">Social Short</option>
                </select>
              </div>

              <div>
                <label className={LABEL}>{t("subtitle.sourceLanguage", "Source Language")}</label>
                <select className={INPUT} value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option value="en">English</option>
                  <option value="tr">Turkish</option>
                  <option value="fa">Persian</option>
                  <option value="fr">French</option>
                </select>
              </div>

              <div>
                <label className={LABEL}>{t("subtitle.targetLanguage", "Target Language")}</label>
                <select
                  className={INPUT}
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                >
                  <option value="none">None</option>
                  <option value="en">English</option>
                  <option value="tr">Turkish</option>
                  <option value="fa">Persian</option>
                  <option value="fr">French</option>
                </select>
              </div>

              <div>
                <label className={LABEL}>{t("subtitle.maxChars", "Max Chars Per Line")}</label>
                <input className={INPUT} type="number" value={maxCharsPerLine} onChange={(e) => setMaxCharsPerLine(e.target.value)} />
              </div>

              <div>
                <label className={LABEL}>{t("subtitle.maxLines", "Max Lines Per Cue")}</label>
                <input className={INPUT} type="number" value={maxLinesPerCue} onChange={(e) => setMaxLinesPerCue(e.target.value)} />
              </div>

              <label className="flex items-end gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <input
                  type="checkbox"
                  checked={burnInRecommended}
                  onChange={(e) => setBurnInRecommended(e.target.checked)}
                />
                <span className="text-sm text-white/85">
                  {t("subtitle.burnIn", "Burn-in Recommended")}
                </span>
              </label>
            </div>
          </section>

          <section className={PANEL}>
            <SectionTitle
              title={t("subtitle.editor", "SRT Import / Editor")}
              desc={t("subtitle.editorDesc", "Paste SRT content or add cues manually.")}
            />

            <textarea
              className={`${INPUT} min-h-[180px] resize-y`}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />

            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" className={SECONDARY_BUTTON} onClick={importSrtFromText}>
                {t("subtitle.importSrt", "Import SRT")}
              </button>

              <button type="button" className={PRIMARY_BUTTON} onClick={addCue}>
                {t("subtitle.addCue", "Add Cue")}
              </button>
            </div>

            <div className="mt-4 rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
              <div>{t("subtitle.createCost", "Create cost")}: {createPreview.requiredCredits ?? 0}</div>
              <div>{t("subtitle.editCost", "Edit cost")}: {editPreview.requiredCredits ?? 0}</div>
              <div>{t("subtitle.remaining", "Credits remaining")}: {creditState.creditsRemaining}</div>
              <div>
                {t("subtitle.editStatus", "Subtitle edit status")}:{" "}
                {editPreview.ok
                  ? t("subtitle.allowed", "Allowed")
                  : t("subtitle.locked", "Locked")}
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {cues.map((cue) => (
                <CueRow
                  key={cue.id}
                  cue={cue}
                  onChange={(nextCue) => updateCue(cue.id, nextCue)}
                  onRemove={() => removeCue(cue.id)}
                  labels={cueLabels}
                />
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className={PANEL}>
            <SectionTitle
              title={t("common.status", "Status")}
              desc={t("subtitle.statusDesc", "Subtitle generation status.")}
            />

            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-4 text-sm leading-6 text-cyan-100">
              {status}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" className={PRIMARY_BUTTON} onClick={runSubtitleCreate}>
                {t("subtitle.create", "Create Subtitle")}
              </button>

              <button type="button" className={SECONDARY_BUTTON} onClick={runSubtitleEdit}>
                {t("subtitle.edit", "Edit Subtitle")}
              </button>

              <button type="button" className={SECONDARY_BUTTON} onClick={downloadSrt}>
                {t("subtitle.downloadSrt", "Download SRT")}
              </button>

              <button type="button" className={SECONDARY_BUTTON} onClick={downloadPayload} disabled={!payload}>
                {t("common.downloadPayload", "Download Payload")}
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
              title={t("common.payloadPreview", "Payload Preview")}
              desc={t("subtitle.payloadDesc", "JSON preview for subtitle payload.")}
            />

            <pre className="max-h-[460px] overflow-auto rounded-2xl bg-black/40 p-4 text-xs leading-6 text-cyan-100">
{JSON.stringify(payload || { app: "Afrawood", feature: "subtitle" }, null, 2)}
            </pre>
          </section>
        </aside>
      </div>
    </div>
  );
}