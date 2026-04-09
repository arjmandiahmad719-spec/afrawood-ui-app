import React, { useEffect, useMemo, useRef, useState } from "react";
import { buildMusicPayload } from "../ai/musicAI.js";
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

function formatSeconds(sec = 0) {
  if (!Number.isFinite(sec) || sec <= 0) return "00:00";
  const total = Math.round(sec);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function estimateMusicDuration(prompt, bars, bpm) {
  const promptWeight = Math.min(18, Math.max(0, String(prompt || "").trim().length / 18));
  const musicalBars = Number(bars || 16);
  const tempo = Number(bpm || 100);
  const secFromBars = (musicalBars * 4 * 60) / Math.max(60, tempo);
  return Math.max(8, Math.round(secFromBars + promptWeight));
}

function makeMockMusicUrl(durationSec = 12) {
  const sampleRate = 22050;
  const seconds = Math.max(2, Math.round(durationSec));
  const numSamples = sampleRate * seconds;
  const bytesPerSample = 2;
  const buffer = new ArrayBuffer(44 + numSamples * bytesPerSample);
  const view = new DataView(buffer);

  function writeString(offset, string) {
    for (let i = 0; i < string.length; i += 1) view.setUint8(offset + i, string.charCodeAt(i));
  }

  writeString(0, "RIFF");
  view.setUint32(4, 36 + numSamples * bytesPerSample, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, numSamples * bytesPerSample, true);

  let offset = 44;
  const progression = [110, 146.83, 164.81, 220];
  for (let i = 0; i < numSamples; i += 1) {
    const t = i / sampleRate;
    const bar = Math.floor(t / 2) % progression.length;
    const freq = progression[bar];
    const melody = Math.sin(2 * Math.PI * freq * t);
    const pad = Math.sin(2 * Math.PI * (freq / 2) * t) * 0.65;
    const sparkle = Math.sin(2 * Math.PI * (freq * 2) * t) * 0.15;
    const envelope = t < 0.15 ? t / 0.15 : t > seconds - 0.25 ? Math.max(0, (seconds - t) / 0.25) : 1;
    const tremolo = 0.85 + 0.15 * Math.sin(2 * Math.PI * 3 * t);
    const sample = (melody * 0.22 + pad * 0.18 + sparkle * 0.08) * envelope * tremolo;
    view.setInt16(offset, Math.max(-1, Math.min(1, sample)) * 32767, true);
    offset += 2;
  }

  return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
}

function SectionTitle({ title, desc }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {desc ? <p className="mt-1 text-sm text-white/55">{desc}</p> : null}
    </div>
  );
}

export default function MusicGeneratorPage({ onBackHome }) {
  const { t } = useLanguage();
  const [projectTitle, setProjectTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [provider, setProvider] = useState("mock_ready");
  const [genre, setGenre] = useState("cinematic");
  const [mood, setMood] = useState("emotional");
  const [energy, setEnergy] = useState("medium");
  const [bpm, setBpm] = useState("92");
  const [keySignature, setKeySignature] = useState("D minor");
  const [bars, setBars] = useState("16");
  const [loopable, setLoopable] = useState(true);
  const [includePercussion, setIncludePercussion] = useState(true);
  const [includeBass, setIncludeBass] = useState(true);
  const [includePads, setIncludePads] = useState(true);
  const [includePiano, setIncludePiano] = useState(true);
  const [includeStrings, setIncludeStrings] = useState(true);
  const [useForBackgroundMusic, setUseForBackgroundMusic] = useState(true);
  const [outputFormat, setOutputFormat] = useState("wav");
  const [sampleRate, setSampleRate] = useState("22050");
  const [normalizeAudio, setNormalizeAudio] = useState(true);
  const [status, setStatus] = useState(t("common.ready", "Ready"));
  const [payload, setPayload] = useState(null);
  const [previewAudio, setPreviewAudio] = useState(null);
  const [creditState, setCreditState] = useState(() => getCreditSummary());

  const hiddenDownloadRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewAudio?.url) URL.revokeObjectURL(previewAudio.url);
    };
  }, [previewAudio]);

  const estimatedDuration = useMemo(() => estimateMusicDuration(prompt, bars, bpm), [prompt, bars, bpm]);
  const createPreview = useMemo(() => canSpendCredits(CREDIT_ACTIONS.MUSIC_CREATE), [creditState]);
  const editPreview = useMemo(() => canSpendCredits(CREDIT_ACTIONS.MUSIC_EDIT), [creditState]);

  function refreshCredits() {
    setCreditState(getCreditSummary());
  }

  function buildPayload() {
    return buildMusicPayload({
      projectTitle,
      prompt,
      provider,
      genre,
      mood,
      energy,
      bpm: Number(bpm) || 92,
      keySignature,
      bars: Number(bars) || 16,
      loopable,
      includePercussion,
      includeBass,
      includePads,
      includePiano,
      includeStrings,
      useForBackgroundMusic,
      outputFormat,
      sampleRate: Number(sampleRate) || 22050,
      normalizeAudio,
    });
  }

  function prepareMusicPayload() {
    if (!prompt.trim()) {
      setStatus(t("music.needPrompt", "Write a music prompt first."));
      return;
    }
    setPayload(buildPayload());
    setStatus(t("music.payloadReady", "Music payload is ready."));
  }

  function generateMockPreview(isEdit = false) {
    if (!prompt.trim()) {
      setStatus(t("music.needPrompt", "Write a music prompt first."));
      return;
    }

    const action = isEdit ? CREDIT_ACTIONS.MUSIC_EDIT : CREDIT_ACTIONS.MUSIC_CREATE;
    const access = canSpendCredits(action);
    if (!access.ok) {
      setStatus(access.message || t("music.notEnough", "Not enough credits."));
      refreshCredits();
      return;
    }

    if (previewAudio?.url) URL.revokeObjectURL(previewAudio.url);

    const duration = Math.max(8, Math.min(120, estimatedDuration));
    const url = makeMockMusicUrl(duration);
    const spent = spendCredits(action);
    refreshCredits();

    if (!spent.ok) {
      setStatus(spent.message || t("music.creditFailed", "Credit spend failed."));
      return;
    }

    setPreviewAudio({
      name: `${(projectTitle || "music_preview").replace(/[^\w\-]+/g, "_")}.wav`,
      url,
      duration,
    });
    setPayload(buildPayload());
    setStatus(`${t("music.previewReady", "Music preview ready.")} ${spent.creditsSpent} ${t("music.creditsUsed", "credits used.")}`);
  }

  function downloadPreview() {
    if (!previewAudio?.url) return;
    const anchor = hiddenDownloadRef.current || document.createElement("a");
    anchor.href = previewAudio.url;
    anchor.download = previewAudio.name || "music_preview.wav";
    if (!hiddenDownloadRef.current) {
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    } else {
      anchor.click();
    }
  }

  function downloadPayload() {
    if (!payload) return;
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(projectTitle || "afrawood_music").replace(/[^\w\-]+/g, "_")}_payload.json`;
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
              <span className={CHIP}>{t("modules.music", "Music Generator")}</span>
              <span className={CHIP}>{creditState.plan?.name || t("common.free", "Free")}</span>
            </div>

            <SectionTitle
              title={t("music.setup", "Project Setup")}
              desc={t("music.setupDesc", "Configure music generation settings.")}
            />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div><label className={LABEL}>{t("common.projectTitle", "Project Title")}</label><input className={INPUT} value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} /></div>
              <div><label className={LABEL}>{t("music.provider", "Provider")}</label><select className={INPUT} value={provider} onChange={(e) => setProvider(e.target.value)}><option value="mock_ready">Mock / Provider-ready</option><option value="local_later">Local Provider Later</option><option value="api_later">API Provider Later</option></select></div>
              <div><label className={LABEL}>{t("music.genre", "Genre")}</label><select className={INPUT} value={genre} onChange={(e) => setGenre(e.target.value)}><option value="cinematic">Cinematic</option><option value="ambient">Ambient</option><option value="hybrid_trailer">Hybrid Trailer</option><option value="orchestral">Orchestral</option></select></div>
              <div><label className={LABEL}>{t("music.mood", "Mood")}</label><select className={INPUT} value={mood} onChange={(e) => setMood(e.target.value)}><option value="emotional">Emotional</option><option value="dark">Dark</option><option value="hopeful">Hopeful</option><option value="mysterious">Mysterious</option><option value="epic">Epic</option></select></div>
              <div><label className={LABEL}>{t("music.energy", "Energy")}</label><select className={INPUT} value={energy} onChange={(e) => setEnergy(e.target.value)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
              <div><label className={LABEL}>{t("music.keySignature", "Key Signature")}</label><input className={INPUT} value={keySignature} onChange={(e) => setKeySignature(e.target.value)} /></div>
              <div><label className={LABEL}>BPM</label><input className={INPUT} type="number" min="60" max="180" value={bpm} onChange={(e) => setBpm(e.target.value)} /></div>
              <div><label className={LABEL}>{t("music.bars", "Bars")}</label><input className={INPUT} type="number" min="4" max="64" step="4" value={bars} onChange={(e) => setBars(e.target.value)} /></div>
              <label className="flex items-end gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"><input type="checkbox" checked={loopable} onChange={(e) => setLoopable(e.target.checked)} /><span className="text-sm text-white/85">{t("music.loopable", "Loopable")}</span></label>
            </div>
          </section>

          <section className={PANEL}>
            <SectionTitle
              title={t("music.promptTitle", "Music Prompt")}
              desc={t("music.promptDesc", "Describe the music you want.")}
            />
            <textarea className={`${INPUT} min-h-[220px] resize-y`} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          </section>

          <section className={PANEL}>
            <SectionTitle
              title={t("music.outputCredits", "Output & Credits")}
              desc={t("music.outputDesc", "Output controls and credit usage.")}
            />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <label className="flex items-end gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"><input type="checkbox" checked={includePercussion} onChange={(e) => setIncludePercussion(e.target.checked)} /><span className="text-sm text-white/85">{t("music.percussion", "Percussion")}</span></label>
              <label className="flex items-end gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"><input type="checkbox" checked={includeBass} onChange={(e) => setIncludeBass(e.target.checked)} /><span className="text-sm text-white/85">{t("music.bass", "Bass")}</span></label>
              <label className="flex items-end gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"><input type="checkbox" checked={includePads} onChange={(e) => setIncludePads(e.target.checked)} /><span className="text-sm text-white/85">{t("music.pads", "Pads")}</span></label>
              <label className="flex items-end gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"><input type="checkbox" checked={includePiano} onChange={(e) => setIncludePiano(e.target.checked)} /><span className="text-sm text-white/85">{t("music.piano", "Piano")}</span></label>
              <label className="flex items-end gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"><input type="checkbox" checked={includeStrings} onChange={(e) => setIncludeStrings(e.target.checked)} /><span className="text-sm text-white/85">{t("music.strings", "Strings")}</span></label>
              <label className="flex items-end gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"><input type="checkbox" checked={useForBackgroundMusic} onChange={(e) => setUseForBackgroundMusic(e.target.checked)} /><span className="text-sm text-white/85">{t("music.backgroundUse", "Use for Background Music")}</span></label>
              <div><label className={LABEL}>{t("music.outputFormat", "Output Format")}</label><select className={INPUT} value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)}><option value="wav">WAV</option><option value="mp3">MP3</option><option value="aac">AAC</option></select></div>
              <div><label className={LABEL}>{t("music.sampleRate", "Sample Rate")}</label><select className={INPUT} value={sampleRate} onChange={(e) => setSampleRate(e.target.value)}><option value="22050">22050</option><option value="32000">32000</option><option value="44100">44100</option></select></div>
              <label className="flex items-end gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"><input type="checkbox" checked={normalizeAudio} onChange={(e) => setNormalizeAudio(e.target.checked)} /><span className="text-sm text-white/85">{t("music.normalizeAudio", "Normalize Audio")}</span></label>
            </div>

            <div className="mt-4 rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
              <div>{t("music.createCost", "Create cost")}: {createPreview.requiredCredits ?? 15}</div>
              <div>{t("music.editCost", "Edit cost")}: {editPreview.requiredCredits ?? 10}</div>
              <div>{t("subtitle.remaining", "Credits remaining")}: {creditState.creditsRemaining}</div>
              <div>{t("music.estimatedDuration", "Estimated duration")}: {formatSeconds(estimatedDuration)}</div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" className={PRIMARY_BUTTON} onClick={() => generateMockPreview(false)}>
                {t("music.generate", "Generate Music")}
              </button>
              <button type="button" className={SECONDARY_BUTTON} onClick={() => generateMockPreview(true)} disabled={!previewAudio}>
                {t("music.edit", "Edit Music")}
              </button>
              <button type="button" className={SECONDARY_BUTTON} onClick={prepareMusicPayload}>
                {t("music.preparePayload", "Prepare Payload")}
              </button>
            </div>

            {previewAudio ? (
              <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className={CHIP}>{t("common.preview", "Preview")}</span>
                  <span className={CHIP}>{formatSeconds(previewAudio.duration || 0)}</span>
                </div>
                <audio className="mt-2 w-full" src={previewAudio.url} controls />
              </div>
            ) : null}
          </section>
        </div>

        <aside className="space-y-6">
          <section className={PANEL}>
            <SectionTitle
              title={t("common.status", "Status")}
              desc={t("music.statusDesc", "Music generation status.")}
            />
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-4 text-sm leading-6 text-cyan-100">{status}</div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" className={SECONDARY_BUTTON} onClick={downloadPreview} disabled={!previewAudio}>
                {t("music.downloadPreview", "Download Preview")}
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
              desc={t("music.payloadDesc", "JSON preview for the music payload.")}
            />
            <pre className="max-h-[460px] overflow-auto rounded-2xl bg-black/40 p-4 text-xs leading-6 text-cyan-100">
{JSON.stringify(payload || { app: "Afrawood", feature: "music" }, null, 2)}
            </pre>
          </section>
        </aside>
      </div>
      <a ref={hiddenDownloadRef} className="hidden" aria-hidden="true">download</a>
    </div>
  );
}