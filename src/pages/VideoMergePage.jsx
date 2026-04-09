import React, { useEffect, useMemo, useRef, useState } from "react";
import buildMergePayload from "../ai/mergeAI.js";
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

function formatBytes(bytes = 0) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** i;
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatSeconds(sec = 0) {
  if (!Number.isFinite(sec) || sec <= 0) return "00:00";
  const total = Math.round(sec);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function detectKind(file) {
  const type = file?.type || "";
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "audio";
  return "unknown";
}

function SectionTitle({ title, desc }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {desc ? <p className="mt-1 text-sm text-white/55">{desc}</p> : null}
    </div>
  );
}

export default function VideoMergePage({ onBackHome }) {
  const [timeline, setTimeline] = useState([]);
  const [mergeTitle, setMergeTitle] = useState("");
  const [mergeNotes, setMergeNotes] = useState("");
  const [transition, setTransition] = useState("crossfade");
  const [transitionMs, setTransitionMs] = useState("300");
  const [outputFormat, setOutputFormat] = useState("mp4");
  const [outputRatio, setOutputRatio] = useState("16:9");
  const [outputResolution, setOutputResolution] = useState("1080p");
  const [fps, setFps] = useState("24");
  const [audioMode, setAudioMode] = useState("keep_main_audio");
  const [musicMode, setMusicMode] = useState("none");
  const [musicVolume, setMusicVolume] = useState("65");
  const [duckingEnabled, setDuckingEnabled] = useState(true);
  const [normalizeAudio, setNormalizeAudio] = useState(true);
  const [status, setStatus] = useState("Ready");
  const [payload, setPayload] = useState(null);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [creditState, setCreditState] = useState(() => getCreditSummary());

  const inputRef = useRef(null);
  const musicInputRef = useRef(null);
  const { t } = useLanguage();

  useEffect(() => {
    return () => {
      timeline.forEach((item) => item?.url && URL.revokeObjectURL(item.url));
      if (selectedMusic?.url) URL.revokeObjectURL(selectedMusic.url);
    };
  }, [timeline, selectedMusic]);

  const totalDuration = useMemo(
    () => timeline.reduce((sum, item) => sum + (Number(item.duration) || 0), 0),
    [timeline]
  );

  const mergePreview = useMemo(
    () => canSpendCredits(CREDIT_ACTIONS.MERGE_CREATE, { seconds: totalDuration || 30 }),
    [creditState, totalDuration]
  );

  function refreshCredits() {
    setCreditState(getCreditSummary());
  }

  async function getMediaDuration(url, kind) {
    return new Promise((resolve) => {
      const media = document.createElement(kind === "video" ? "video" : "audio");
      media.preload = "metadata";
      media.src = url;
      media.onloadedmetadata = () => resolve(Number.isFinite(media.duration) ? media.duration : 0);
      media.onerror = () => resolve(0);
    });
  }

  async function addFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const items = [];
    for (const file of files) {
      const kind = detectKind(file);
      if (kind === "unknown") continue;
      const url = URL.createObjectURL(file);
      const duration = await getMediaDuration(url, kind);

      items.push({
        id: uid(kind),
        kind,
        file,
        url,
        name: file.name,
        size: file.size || 0,
        type: file.type || "",
        duration,
        label: "",
      });
    }

    setTimeline((prev) => [...prev, ...items]);
    setStatus(`${items.length} ${t("merge.filesAdded", "file(s) added.")}`);
  }

  async function addMusicFile(fileList) {
    const file = Array.from(fileList || [])[0];
    if (!file) return;

    if (selectedMusic?.url) URL.revokeObjectURL(selectedMusic.url);

    const kind = detectKind(file);
    if (kind !== "audio") {
      setStatus(t("merge.needAudio", "Background music must be audio."));
      return;
    }

    const url = URL.createObjectURL(file);
    const duration = await getMediaDuration(url, kind);

    setSelectedMusic({
      id: uid("music"),
      file,
      url,
      name: file.name,
      size: file.size,
      type: file.type,
      duration,
    });
    setMusicMode("custom_track");
    setStatus(t("merge.musicAdded", "Background music added."));
  }

  function removeItem(id) {
    setTimeline((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target?.url) URL.revokeObjectURL(target.url);
      return prev.filter((i) => i.id !== id);
    });
  }

  function prepareMergePayload(nextStatus = "Merge payload is ready.") {
    if (!timeline.length) {
      setStatus(t("merge.addTimeline", "Add timeline files first."));
      return;
    }

    const built = buildMergePayload({
      title: mergeTitle,
      notes: mergeNotes,
      timeline,
      transition,
      transitionMs: Number(transitionMs) || 0,
      outputFormat,
      outputRatio,
      outputResolution,
      fps: Number(fps) || 24,
      audioMode,
      musicMode,
      musicVolume: Number(musicVolume) || 0,
      duckingEnabled,
      normalizeAudio,
      selectedMusic,
    });

    setPayload(built);
    setStatus(nextStatus);
  }

  function runMerge() {
    if (!timeline.length) {
      setStatus(t("merge.addTimeline", "Add timeline files first."));
      return;
    }

    const access = canSpendCredits(CREDIT_ACTIONS.MERGE_CREATE, {
      seconds: totalDuration || 30,
    });

    if (!access.ok) {
      setStatus(access.message || t("merge.notEnough", "Not enough credits."));
      refreshCredits();
      return;
    }

    const spent = spendCredits(CREDIT_ACTIONS.MERGE_CREATE, {
      seconds: totalDuration || 30,
    });

    refreshCredits();

    if (!spent.ok) {
      setStatus(spent.message || t("merge.creditFailed", "Credit spend failed."));
      return;
    }

    prepareMergePayload(
      `${t("merge.ready", "Merge ready.")} ${spent.creditsSpent} ${t("merge.creditsUsed", "credits used.")}`
    );
  }

  function downloadPayload() {
    if (!payload) return;

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(mergeTitle || "afrawood_merge").replace(/[^\w\-]+/g, "_")}_payload.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-[calc(100vh-110px)] text-white">
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <section className={PANEL}>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className={CHIP}>{t("modules.merge", "Video Merge")}</span>
              <span className={CHIP}>{creditState.plan?.name || t("common.free", "Free")}</span>
            </div>

            <SectionTitle
              title={t("merge.projectSetup", "Project Setup")}
              desc={t("merge.projectDesc", "Configure merge settings.")}
            />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div><label className={LABEL}>{t("common.projectTitle", "Project Title")}</label><input className={INPUT} value={mergeTitle} onChange={(e) => setMergeTitle(e.target.value)} /></div>
              <div><label className={LABEL}>{t("merge.transition", "Transition")}</label><select className={INPUT} value={transition} onChange={(e) => setTransition(e.target.value)}><option value="crossfade">Crossfade</option><option value="cut">Cut</option><option value="fade_black">Fade To Black</option></select></div>
              <div><label className={LABEL}>{t("merge.transitionMs", "Transition (ms)")}</label><input className={INPUT} type="number" value={transitionMs} onChange={(e) => setTransitionMs(e.target.value)} /></div>
              <div><label className={LABEL}>{t("common.format", "Format")}</label><select className={INPUT} value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)}><option value="mp4">MP4</option><option value="mov">MOV</option></select></div>
              <div><label className={LABEL}>{t("common.ratio", "Ratio")}</label><select className={INPUT} value={outputRatio} onChange={(e) => setOutputRatio(e.target.value)}><option value="16:9">16:9</option><option value="9:16">9:16</option><option value="1:1">1:1</option></select></div>
              <div><label className={LABEL}>{t("common.resolution", "Resolution")}</label><select className={INPUT} value={outputResolution} onChange={(e) => setOutputResolution(e.target.value)}><option value="1080p">1080p</option><option value="2k">2K</option><option value="4k">4K</option></select></div>
              <div><label className={LABEL}>FPS</label><select className={INPUT} value={fps} onChange={(e) => setFps(e.target.value)}><option value="24">24</option><option value="25">25</option><option value="30">30</option></select></div>
              <div><label className={LABEL}>{t("merge.notes", "Notes")}</label><input className={INPUT} value={mergeNotes} onChange={(e) => setMergeNotes(e.target.value)} /></div>
            </div>
          </section>

          <section className={PANEL}>
            <SectionTitle
              title={t("merge.timelineSources", "Timeline Sources")}
              desc={t("merge.timelineDesc", "Select files for the timeline.")}
            />

            <div className="rounded-3xl border border-dashed border-cyan-400/35 bg-cyan-400/5 p-6 text-center">
              <button type="button" className={PRIMARY_BUTTON} onClick={() => inputRef.current?.click()}>
                {t("merge.selectTimeline", "Select Timeline Files")}
              </button>

              <input
                ref={inputRef}
                type="file"
                multiple
                accept="video/*,audio/*"
                className="hidden"
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>

            <div className="mt-5 space-y-3">
              {timeline.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-white">{item.name}</div>
                      <div className="text-sm text-white/45">
                        {item.kind} • {formatBytes(item.size)} • {formatSeconds(item.duration)}
                      </div>
                    </div>

                    <button type="button" className={SECONDARY_BUTTON} onClick={() => removeItem(item.id)}>
                      {t("merge.remove", "Remove")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={PANEL}>
            <SectionTitle
              title={t("merge.backgroundMusic", "Background Music")}
              desc={t("merge.backgroundDesc", "Optional background music track.")}
            />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div><label className={LABEL}>{t("merge.audioMode", "Audio Mode")}</label><select className={INPUT} value={audioMode} onChange={(e) => setAudioMode(e.target.value)}><option value="keep_main_audio">Keep Main Audio</option><option value="mix_all_audio">Mix All Audio</option><option value="mute_timeline">Mute Timeline</option></select></div>
              <div><label className={LABEL}>{t("merge.musicMode", "Music Mode")}</label><select className={INPUT} value={musicMode} onChange={(e) => setMusicMode(e.target.value)}><option value="none">No Music</option><option value="custom_track">Custom Track</option></select></div>
              <div><label className={LABEL}>{t("merge.musicVolume", "Music Volume")}</label><input className={INPUT} type="number" value={musicVolume} onChange={(e) => setMusicVolume(e.target.value)} /></div>
              <label className="flex items-end gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"><input type="checkbox" checked={duckingEnabled} onChange={(e) => setDuckingEnabled(e.target.checked)} /><span className="text-sm text-white/85">{t("merge.dialogueDucking", "Dialogue Ducking")}</span></label>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" className={SECONDARY_BUTTON} onClick={() => musicInputRef.current?.click()}>
                {t("merge.addMusic", "Add Background Music")}
              </button>

              <input
                ref={musicInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                  addMusicFile(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>

            {selectedMusic ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
                {selectedMusic.name} • {formatSeconds(selectedMusic.duration)}
              </div>
            ) : null}
          </section>
        </div>

        <aside className="space-y-6">
          <section className={PANEL}>
            <SectionTitle
              title={t("common.status", "Status")}
              desc={t("merge.creditDesc", "Merge cost and credit status.")}
            />

            <div className="space-y-3 text-sm text-white/80">
              <div>{t("subtitle.remaining", "Credits remaining")}: {creditState.creditsRemaining}</div>
              <div>{t("merge.timelineDuration", "Timeline duration")}: {formatSeconds(totalDuration)}</div>
              <div>{t("merge.mergeCost", "Merge cost")}: {mergePreview.requiredCredits ?? 0}</div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" className={PRIMARY_BUTTON} onClick={runMerge}>
                {t("merge.prepare", "Prepare Merge")}
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
              desc={t("merge.payloadDesc", "Merge JSON preview.")}
            />

            <div className="mb-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-4 text-sm leading-6 text-cyan-100">
              {status}
            </div>

            <pre className="max-h-[460px] overflow-auto rounded-2xl bg-black/40 p-4 text-xs leading-6 text-cyan-100">
{JSON.stringify(payload || { app: "Afrawood", feature: "video_merge" }, null, 2)}
            </pre>
          </section>
        </aside>
      </div>
    </div>
  );
}