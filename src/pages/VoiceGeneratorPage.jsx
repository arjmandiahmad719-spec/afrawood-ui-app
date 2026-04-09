import React, { useEffect, useMemo, useRef, useState } from "react";
import { buildVoicePayload, generateVoice } from "../ai/voiceAI.js";
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

function SectionTitle({ title, desc }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {desc ? <p className="mt-1 text-sm text-white/55">{desc}</p> : null}
    </div>
  );
}

function ScriptPresetCard({ title, text, onUse }) {
  return (
    <button
      type="button"
      onClick={() => onUse(text)}
      className="rounded-3xl border border-white/10 bg-black/20 p-4 text-left transition hover:border-cyan-400/35 hover:bg-white/[0.07]"
    >
      <div className="mb-2 text-sm font-semibold text-white">{title}</div>
      <div className="text-sm leading-6 text-white/55 line-clamp-4">{text}</div>
    </button>
  );
}

export default function VoiceGeneratorPage({ onBackHome }) {
  const { t } = useLanguage();
  const [projectTitle, setProjectTitle] = useState("");
  const [scriptText, setScriptText] = useState("");
  const [language, setLanguage] = useState("en");
  const [voiceGender, setVoiceGender] = useState("male");
  const [voiceStyle, setVoiceStyle] = useState("cinematic");
  const [provider, setProvider] = useState("mock_ready");
  const [voiceName, setVoiceName] = useState("default_voice");
  const [speed, setSpeed] = useState("1");
  const [pitch, setPitch] = useState("0");
  const [emotion, setEmotion] = useState("warm");
  const [outputFormat, setOutputFormat] = useState("wav");
  const [sampleRate, setSampleRate] = useState("22050");
  const [noiseReduction, setNoiseReduction] = useState(true);
  const [normalizeAudio, setNormalizeAudio] = useState(true);
  const [subtitleFriendlyPauses, setSubtitleFriendlyPauses] = useState(true);
  const [status, setStatus] = useState(t("common.ready", "Ready"));
  const [isPreparing, setIsPreparing] = useState(false);
  const [payload, setPayload] = useState(null);
  const [previewAudio, setPreviewAudio] = useState(null);
  const [creditState, setCreditState] = useState(() => getCreditSummary());

  const downloadRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewAudio?.url) URL.revokeObjectURL(previewAudio.url);
    };
  }, [previewAudio]);

  const createPreview = useMemo(
    () => canSpendCredits(CREDIT_ACTIONS.VOICE_CREATE),
    [creditState]
  );
  const editPreview = useMemo(
    () => canSpendCredits(CREDIT_ACTIONS.VOICE_EDIT),
    [creditState]
  );

  function refreshCredits() {
    setCreditState(getCreditSummary());
  }

  function usePreset(text) {
    setScriptText(text);
    setStatus(t("voice.presetLoaded", "Preset script loaded."));
  }

  async function prepareVoicePayload() {
    if (!scriptText.trim()) {
      setStatus(t("voice.needText", "Write or paste text first."));
      return;
    }

    setIsPreparing(true);
    setStatus(t("voice.preparing", "Preparing voice payload..."));

    try {
      const finalPayload = buildVoicePayload({
        projectTitle,
        text: scriptText,
        language,
        provider,
        voiceName,
        gender: voiceGender,
        style: voiceStyle,
        emotion,
        speed: Number(speed) || 1,
        pitch: Number(pitch) || 0,
        outputFormat,
        sampleRate: Number(sampleRate) || 22050,
        noiseReduction,
        normalizeAudio,
        subtitleFriendlyPauses,
      });

      setPayload(finalPayload);
      setStatus(t("voice.payloadReady", "Voice payload is ready."));
    } catch (error) {
      console.error(error);
      setStatus(t("voice.payloadFailed", "Failed to prepare voice payload."));
    } finally {
      setIsPreparing(false);
    }
  }

  async function runVoice(isEdit = false) {
    if (!scriptText.trim()) {
      setStatus(t("voice.needText", "Write or paste text first."));
      return;
    }

    const action = isEdit ? CREDIT_ACTIONS.VOICE_EDIT : CREDIT_ACTIONS.VOICE_CREATE;
    const access = canSpendCredits(action);
    if (!access.ok) {
      setStatus(access.message || t("voice.notEnough", "Not enough credits."));
      refreshCredits();
      return;
    }

    setIsPreparing(true);
    setStatus(`${t("voice.generating", "Generating voice...")} (${access.requiredCredits} ${t("voice.credits", "credits")})`);

    try {
      const result = await generateVoice({
        projectTitle,
        text: scriptText,
        language,
        provider,
        voiceName,
        gender: voiceGender,
        style: voiceStyle,
        emotion,
        speed: Number(speed) || 1,
        pitch: Number(pitch) || 0,
        outputFormat,
        sampleRate: Number(sampleRate) || 22050,
        noiseReduction,
        normalizeAudio,
        subtitleFriendlyPauses,
      });

      const spent = spendCredits(action);
      refreshCredits();

      if (!spent.ok) {
        setStatus(spent.message || t("voice.creditFailed", "Credit spend failed."));
        return;
      }

      setPayload(result.payload);
      setPreviewAudio({
        url: result.previewUrl,
        duration: result.duration,
        name: `${projectTitle || "voice_preview"}.wav`,
      });
      setStatus(`${t("voice.ready", "Voice ready.")} ${spent.creditsSpent} ${t("voice.creditsUsed", "credits used.")}`);
    } catch (error) {
      console.error(error);
      setStatus(t("voice.failed", "Voice generation failed."));
    } finally {
      setIsPreparing(false);
    }
  }

  function downloadMockPreview() {
    if (!previewAudio?.url) return;
    const a = downloadRef.current || document.createElement("a");
    a.href = previewAudio.url;
    a.download = previewAudio.name || "voice_preview.wav";
    if (!downloadRef.current) {
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      a.click();
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
    a.download = `${(projectTitle || "afrawood_voice").replace(/[^\w\-]+/g, "_")}_payload.json`;
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
              <span className={CHIP}>{t("modules.voice", "Voice Generator")}</span>
              <span className={CHIP}>{creditState.plan?.name || t("common.free", "Free")}</span>
            </div>

            <SectionTitle
              title={t("voice.setup", "Project Setup")}
              desc={t("voice.setupDesc", "Configure general voice settings.")}
            />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div><label className={LABEL}>{t("common.projectTitle", "Project Title")}</label><input className={INPUT} value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} /></div>
              <div><label className={LABEL}>{t("common.language", "Language")}</label><select className={INPUT} value={language} onChange={(e) => setLanguage(e.target.value)}><option value="en">English</option><option value="tr">Turkish</option><option value="fa">Persian</option><option value="fr">French</option></select></div>
              <div><label className={LABEL}>{t("voice.provider", "Provider")}</label><select className={INPUT} value={provider} onChange={(e) => setProvider(e.target.value)}><option value="mock_ready">Mock / Provider-ready</option><option value="local_later">Local Provider Later</option><option value="api_later">API Provider Later</option></select></div>
              <div><label className={LABEL}>{t("voice.voiceName", "Voice Name")}</label><input className={INPUT} value={voiceName} onChange={(e) => setVoiceName(e.target.value)} /></div>
              <div><label className={LABEL}>{t("voice.gender", "Gender")}</label><select className={INPUT} value={voiceGender} onChange={(e) => setVoiceGender(e.target.value)}><option value="male">Male</option><option value="female">Female</option><option value="neutral">Neutral</option></select></div>
              <div><label className={LABEL}>{t("voice.style", "Style")}</label><select className={INPUT} value={voiceStyle} onChange={(e) => setVoiceStyle(e.target.value)}><option value="cinematic">Cinematic</option><option value="narration">Narration</option><option value="commercial">Commercial</option></select></div>
              <div><label className={LABEL}>{t("voice.emotion", "Emotion")}</label><select className={INPUT} value={emotion} onChange={(e) => setEmotion(e.target.value)}><option value="warm">Warm</option><option value="dramatic">Dramatic</option><option value="calm">Calm</option><option value="energetic">Energetic</option></select></div>
              <div><label className={LABEL}>{t("voice.speed", "Speed")}</label><input className={INPUT} type="number" min="0.6" max="1.8" step="0.05" value={speed} onChange={(e) => setSpeed(e.target.value)} /></div>
              <div><label className={LABEL}>{t("voice.pitch", "Pitch")}</label><input className={INPUT} type="number" min="-12" max="12" step="1" value={pitch} onChange={(e) => setPitch(e.target.value)} /></div>
            </div>
          </section>

          <section className={PANEL}>
            <SectionTitle
              title={t("voice.script", "Script")}
              desc={t("voice.scriptDesc", "Enter narration text.")}
            />

            <textarea className={`${INPUT} min-h-[220px] resize-y`} value={scriptText} onChange={(e) => setScriptText(e.target.value)} />

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <ScriptPresetCard title={t("voice.preset1", "Trailer Intro")} text="In a world where every moment matters, one story rises above the noise." onUse={usePreset} />
              <ScriptPresetCard title={t("voice.preset2", "Social Promo")} text="Create faster. Look better. Turn your ideas into cinematic content with Afrawood." onUse={usePreset} />
              <ScriptPresetCard title={t("voice.preset3", "Emotional Story")} text="She walked through the silent city, carrying memories no one could see." onUse={usePreset} />
            </div>
          </section>

          <section className={PANEL}>
            <SectionTitle
              title={t("voice.audioOutput", "Audio Output")}
              desc={t("voice.outputDesc", "Audio settings and credit usage.")}
            />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div><label className={LABEL}>{t("voice.outputFormat", "Output Format")}</label><select className={INPUT} value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)}><option value="wav">WAV</option><option value="mp3">MP3</option><option value="aac">AAC</option></select></div>
              <div><label className={LABEL}>{t("voice.sampleRate", "Sample Rate")}</label><select className={INPUT} value={sampleRate} onChange={(e) => setSampleRate(e.target.value)}><option value="22050">22050</option><option value="32000">32000</option><option value="44100">44100</option></select></div>
              <label className="flex items-end gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"><input type="checkbox" checked={noiseReduction} onChange={(e) => setNoiseReduction(e.target.checked)} /><span className="text-sm text-white/85">{t("voice.noiseReduction", "Noise Reduction")}</span></label>
              <label className="flex items-end gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"><input type="checkbox" checked={normalizeAudio} onChange={(e) => setNormalizeAudio(e.target.checked)} /><span className="text-sm text-white/85">{t("voice.normalizeAudio", "Normalize Audio")}</span></label>
              <label className="flex items-end gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"><input type="checkbox" checked={subtitleFriendlyPauses} onChange={(e) => setSubtitleFriendlyPauses(e.target.checked)} /><span className="text-sm text-white/85">{t("voice.subtitlePauses", "Subtitle-friendly Pauses")}</span></label>
            </div>

            <div className="mt-4 rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
              <div>{t("voice.createCost", "Create cost")}: {createPreview.requiredCredits ?? 10}</div>
              <div>{t("voice.editCost", "Edit cost")}: {editPreview.requiredCredits ?? 0}</div>
              <div>{t("subtitle.remaining", "Credits remaining")}: {creditState.creditsRemaining}</div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" className={PRIMARY_BUTTON} onClick={() => runVoice(false)} disabled={isPreparing}>
                {t("voice.generate", "Generate Voice")}
              </button>
              <button type="button" className={SECONDARY_BUTTON} onClick={() => runVoice(true)} disabled={isPreparing || !previewAudio}>
                {t("voice.edit", "Edit Voice")}
              </button>
              <button type="button" className={SECONDARY_BUTTON} onClick={prepareVoicePayload} disabled={isPreparing}>
                {t("voice.preparePayload", "Prepare Payload")}
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
              desc={t("voice.statusDesc", "Voice generation status.")}
            />
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-4 text-sm leading-6 text-cyan-100">{status}</div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" className={SECONDARY_BUTTON} onClick={downloadMockPreview} disabled={!previewAudio}>
                {t("voice.downloadPreview", "Download Preview")}
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
              desc={t("voice.payloadDesc", "JSON preview for the voice payload.")}
            />
            <pre className="max-h-[460px] overflow-auto rounded-2xl bg-black/40 p-4 text-xs leading-6 text-cyan-100">
{JSON.stringify(payload || { app: "Afrawood", feature: "voice" }, null, 2)}
            </pre>
          </section>
        </aside>
      </div>
      <a ref={downloadRef} className="hidden" aria-hidden="true">download</a>
    </div>
  );
}