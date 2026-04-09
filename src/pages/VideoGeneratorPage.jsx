import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  buildVideoPayload,
  getVideoEngineInfo,
  generateMockVideoPreview,
} from "../ai/videoAI.js";
import { getVideoProviderInfo, runVideoProvider } from "../ai/videoProviders.js";
import {
  CREDIT_ACTIONS,
  canSpendCredits,
  getCreditSummary,
  spendCredits,
} from "../ai/creditSystem.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const PANEL =
  "rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.35)]";
const INPUT =
  "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20";
const LABEL = "mb-2 block text-sm font-medium text-white/80";
const PRIMARY_BUTTON =
  "inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-amber-300 px-4 py-3 text-sm font-semibold text-black transition hover:scale-[1.02] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50";
const SECONDARY_BUTTON =
  "inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-cyan-400/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50";
const CHIP =
  "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80";

function uid(prefix = "id") {
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

function formatBytes(bytes = 0) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function detectImageSize(aspectRatio, quality) {
  if (aspectRatio === "9:16") {
    if (quality === "ultra") return { width: 1440, height: 2560 };
    if (quality === "high") return { width: 1080, height: 1920 };
    return { width: 720, height: 1280 };
  }
  if (aspectRatio === "1:1") {
    if (quality === "ultra") return { width: 1440, height: 1440 };
    if (quality === "high") return { width: 1080, height: 1080 };
    return { width: 768, height: 768 };
  }
  if (quality === "ultra") return { width: 2560, height: 1440 };
  if (quality === "high") return { width: 1920, height: 1080 };
  return { width: 1280, height: 720 };
}

function makePosterSvg({ title, subtitle, aspectRatio, quality }) {
  const size = detectImageSize(aspectRatio, quality);
  const { width, height } = size;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#06141c"/>
          <stop offset="55%" stop-color="#091f2d"/>
          <stop offset="100%" stop-color="#2f2410"/>
        </linearGradient>
        <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#fcd34d" stop-opacity="0.95"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <rect x="${width * 0.08}" y="${height * 0.12}" width="${width * 0.84}" height="4" rx="2" fill="url(#line)"/>
      <text x="${width * 0.08}" y="${height * 0.24}" fill="#ffffff" font-size="${Math.max(34, width * 0.034)}" font-family="Arial, Helvetica, sans-serif" font-weight="700">
        ${String(title || "AFRAWOOD VIDEO PREVIEW").replace(/&/g, "&amp;").replace(/</g, "&lt;")}
      </text>
      <text x="${width * 0.08}" y="${height * 0.31}" fill="#d1d5db" font-size="${Math.max(20, width * 0.017)}" font-family="Arial, Helvetica, sans-serif">
        ${String(subtitle || "Mock poster frame").replace(/&/g, "&amp;").replace(/</g, "&lt;")}
      </text>
      <g transform="translate(${width * 0.1}, ${height * 0.62})">
        <circle cx="${width * 0.06}" cy="0" r="${Math.max(36, width * 0.026)}" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.22)"/>
        <polygon points="${width * 0.05},-${width * 0.014} ${width * 0.05},${width * 0.014} ${width * 0.082},0" fill="#22d3ee"/>
      </g>
      <text x="${width * 0.08}" y="${height * 0.9}" fill="#fcd34d" font-size="${Math.max(18, width * 0.013)}" font-family="Arial, Helvetica, sans-serif" font-weight="700">
        AFRAWOOD • VIDEO GENERATOR
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function SectionTitle({ title, desc }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {desc ? <p className="mt-1 text-sm text-white/55">{desc}</p> : null}
    </div>
  );
}

function PresetCard({ title, text, onUse }) {
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

export default function VideoGeneratorPage({ onBackHome }) {
  const { t } = useLanguage();
  const [projectTitle, setProjectTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [provider, setProvider] = useState("hybrid_ready");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [quality, setQuality] = useState("high");
  const [durationSec, setDurationSec] = useState("5");
  const [fps, setFps] = useState("24");
  const [format, setFormat] = useState("mp4");
  const [motionStrength, setMotionStrength] = useState("0.7");
  const [cameraMovement, setCameraMovement] = useState("subtle");
  const [shotStyle, setShotStyle] = useState("cinematic");
  const [loopable, setLoopable] = useState(false);
  const [stabilizeFaces, setStabilizeFaces] = useState(true);
  const [referenceImage, setReferenceImage] = useState(null);
  const [referenceUrl, setReferenceUrl] = useState("");
  const [status, setStatus] = useState(t("common.ready", "Ready"));
  const [isPreparing, setIsPreparing] = useState(false);
  const [payload, setPayload] = useState(null);
  const [result, setResult] = useState(null);
  const [creditState, setCreditState] = useState(() => getCreditSummary());

  const imageInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (referenceUrl) URL.revokeObjectURL(referenceUrl);
    };
  }, [referenceUrl]);

  const providerInfo = useMemo(() => getVideoProviderInfo(provider), [provider]);
  const engineInfo = useMemo(() => {
    try {
      return typeof getVideoEngineInfo === "function"
        ? getVideoEngineInfo()
        : { engine: "Afrawood Video", mode: "hybrid" };
    } catch {
      return { engine: "Afrawood Video", mode: "hybrid" };
    }
  }, []);

  const creditPreview = useMemo(
    () => canSpendCredits(CREDIT_ACTIONS.VIDEO_CREATE),
    [creditState]
  );

  function refreshCredits() {
    setCreditState(getCreditSummary());
  }

  function handleReferenceSelect(fileList) {
    const file = Array.from(fileList || [])[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatus(t("video.referenceMustImage", "Reference must be an image file."));
      return;
    }

    if (referenceUrl) URL.revokeObjectURL(referenceUrl);

    const url = URL.createObjectURL(file);
    setReferenceImage({
      id: uid("image"),
      name: file.name,
      type: file.type,
      size: file.size || 0,
      kind: "image",
      file,
    });
    setReferenceUrl(url);
    setStatus(t("video.referenceAdded", "Reference image added."));
  }

  function clearReference() {
    if (referenceUrl) URL.revokeObjectURL(referenceUrl);
    setReferenceImage(null);
    setReferenceUrl("");
    setStatus(t("video.referenceCleared", "Reference image cleared."));
  }

  async function preparePayload() {
    if (!String(prompt).trim() && !referenceImage) {
      setStatus(t("video.needPrompt", "Write a prompt or add a reference image first."));
      return;
    }

    setIsPreparing(true);
    setStatus(t("video.preparing", "Preparing video payload..."));

    try {
      const builtPayload = await buildVideoPayload({
        projectTitle,
        prompt,
        negativePrompt,
        provider,
        referenceImage,
        aspectRatio,
        quality,
        durationSec: Number(durationSec) || 5,
        fps: Number(fps) || 24,
        format,
        motionStrength: Number(motionStrength) || 0.7,
        cameraMovement,
        shotStyle,
        loopable,
        stabilizeFaces,
      });

      setPayload(builtPayload);
      setStatus(t("video.payloadReady", "Video payload is ready."));
    } catch (error) {
      console.error("prepare video payload error:", error);
      setStatus(t("video.payloadFailed", "Failed to prepare video payload."));
    } finally {
      setIsPreparing(false);
    }
  }

  async function generatePreview() {
    if (!String(prompt).trim() && !referenceImage) {
      setStatus(t("video.needPrompt", "Write a prompt or add a reference image first."));
      return;
    }

    const access = canSpendCredits(CREDIT_ACTIONS.VIDEO_CREATE);
    if (!access.ok) {
      setStatus(access.message || t("video.notEnough", "Not enough credits."));
      refreshCredits();
      return;
    }

    setIsPreparing(true);
    setStatus(`${t("video.generating", "Generating preview...")} (${access.requiredCredits} ${t("video.credits", "credits")})`);

    try {
      const videoPayload =
        payload ||
        (await buildVideoPayload({
          projectTitle,
          prompt,
          negativePrompt,
          provider,
          referenceImage,
          aspectRatio,
          quality,
          durationSec: Number(durationSec) || 5,
          fps: Number(fps) || 24,
          format,
          motionStrength: Number(motionStrength) || 0.7,
          cameraMovement,
          shotStyle,
          loopable,
          stabilizeFaces,
        }));

      const providerResult = await runVideoProvider(videoPayload || {});
      let previewPoster = "";
      let previewMeta = null;

      const mockPreview = await generateMockVideoPreview(videoPayload || {});
      previewPoster = mockPreview?.posterUrl || "";
      previewMeta = mockPreview || null;

      if (!previewPoster) {
        previewPoster = makePosterSvg({
          title: projectTitle || "AFRAWOOD VIDEO",
          subtitle: prompt || "Mock poster frame",
          aspectRatio,
          quality,
        });
      }

      const spent = spendCredits(CREDIT_ACTIONS.VIDEO_CREATE);
      refreshCredits();

      if (!spent.ok) {
        setStatus(spent.message || t("video.creditFailed", "Credit spend failed."));
        return;
      }

      setPayload(videoPayload);
      setResult({
        ...providerResult,
        previewPoster,
        previewMeta,
      });
      setStatus(`${t("video.previewReady", "Preview ready.")} ${spent.creditsSpent} ${t("video.creditsUsed", "credits used.")}`);
    } catch (error) {
      console.error("generate video preview error:", error);
      setStatus(t("video.previewFailed", "Failed to generate preview."));
    } finally {
      setIsPreparing(false);
    }
  }

  function downloadPayload() {
    if (!payload) return;
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeName = (projectTitle || "afrawood_video").trim().replace(/[^\w\-]+/g, "_");
    a.href = url;
    a.download = `${safeName || "afrawood_video"}_payload.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-[calc(100vh-110px)] text-white">
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <section className={`${PANEL} p-5 md:p-6`}>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className={CHIP}>{t("modules.video", "Video Generator")}</span>
              <span className={CHIP}>{providerInfo?.label || "Provider"}</span>
              <span className={CHIP}>{engineInfo?.mode || "hybrid"}</span>
              <span className={CHIP}>{creditState.plan?.name || t("common.free", "Free")}</span>
            </div>

            <SectionTitle
              title={t("video.setup", "Project Setup")}
              desc={t("video.setupDesc", "Configure your video settings and provider.")}
            />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <label className={LABEL}>{t("common.projectTitle", "Project Title")}</label>
                <input className={INPUT} value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} />
              </div>

              <div>
                <label className={LABEL}>{t("video.provider", "Provider")}</label>
                <select className={INPUT} value={provider} onChange={(e) => setProvider(e.target.value)}>
                  <option value="hybrid_ready">Hybrid Ready</option>
                  <option value="local_later">Local Later</option>
                  <option value="api_later">API Later</option>
                </select>
              </div>

              <div>
                <label className={LABEL}>{t("common.format", "Format")}</label>
                <select className={INPUT} value={format} onChange={(e) => setFormat(e.target.value)}>
                  <option value="mp4">MP4</option>
                  <option value="mov">MOV</option>
                  <option value="webm">WEBM</option>
                </select>
              </div>

              <div>
                <label className={LABEL}>{t("video.aspectRatio", "Aspect Ratio")}</label>
                <select className={INPUT} value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>
                  <option value="16:9">16:9</option>
                  <option value="9:16">9:16</option>
                  <option value="1:1">1:1</option>
                </select>
              </div>

              <div>
                <label className={LABEL}>{t("video.quality", "Quality")}</label>
                <select className={INPUT} value={quality} onChange={(e) => setQuality(e.target.value)}>
                  <option value="standard">Standard</option>
                  <option value="high">High</option>
                  <option value="ultra">Ultra</option>
                </select>
              </div>

              <div>
                <label className={LABEL}>{t("video.duration", "Duration (sec)")}</label>
                <select className={INPUT} value={durationSec} onChange={(e) => setDurationSec(e.target.value)}>
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                </select>
              </div>

              <div>
                <label className={LABEL}>FPS</label>
                <select className={INPUT} value={fps} onChange={(e) => setFps(e.target.value)}>
                  <option value="24">24</option>
                  <option value="25">25</option>
                  <option value="30">30</option>
                </select>
              </div>

              <div>
                <label className={LABEL}>{t("video.cameraMovement", "Camera Movement")}</label>
                <select className={INPUT} value={cameraMovement} onChange={(e) => setCameraMovement(e.target.value)}>
                  <option value="subtle">Subtle</option>
                  <option value="push_in">Push In</option>
                  <option value="orbit">Orbit</option>
                  <option value="pan">Pan</option>
                  <option value="handheld_soft">Handheld Soft</option>
                </select>
              </div>

              <div>
                <label className={LABEL}>{t("video.shotStyle", "Shot Style")}</label>
                <select className={INPUT} value={shotStyle} onChange={(e) => setShotStyle(e.target.value)}>
                  <option value="cinematic">Cinematic</option>
                  <option value="commercial">Commercial</option>
                  <option value="dramatic">Dramatic</option>
                  <option value="social_fast">Social Fast</option>
                </select>
              </div>

              <div>
                <label className={LABEL}>{t("video.motionStrength", "Motion Strength")}</label>
                <input
                  className={INPUT}
                  type="number"
                  min="0"
                  max="1.5"
                  step="0.1"
                  value={motionStrength}
                  onChange={(e) => setMotionStrength(e.target.value)}
                />
              </div>

              <label className="flex items-end gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <input type="checkbox" checked={loopable} onChange={(e) => setLoopable(e.target.checked)} />
                <span className="text-sm text-white/85">{t("video.loopable", "Loopable")}</span>
              </label>

              <label className="flex items-end gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <input type="checkbox" checked={stabilizeFaces} onChange={(e) => setStabilizeFaces(e.target.checked)} />
                <span className="text-sm text-white/85">{t("video.stabilizeFaces", "Stabilize Faces")}</span>
              </label>
            </div>
          </section>

          <section className={`${PANEL} p-5 md:p-6`}>
            <SectionTitle
              title={t("video.promptTitle", "Prompt")}
              desc={t("video.promptDesc", "Describe the video you want to generate.")}
            />

            <textarea
              className={`${INPUT} min-h-[220px] resize-y`}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t("video.promptPlaceholder", "Write your video prompt here...")}
            />

            <div className="mt-4">
              <label className={LABEL}>{t("video.negativePrompt", "Negative Prompt")}</label>
              <textarea
                className={`${INPUT} min-h-[110px] resize-y`}
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="low quality, distortions, broken anatomy, flicker..."
              />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <PresetCard
                title={t("video.preset1", "Cinematic Ocean")}
                text="A cinematic slow-moving shot of dark ocean waves hitting rocks at sunset, dramatic light, realistic texture, subtle camera motion."
                onUse={setPrompt}
              />
              <PresetCard
                title={t("video.preset2", "Rainy Street")}
                text="A moody night street in Istanbul with rain reflections, soft neon lights, slow dolly movement, realistic cinematic style."
                onUse={setPrompt}
              />
              <PresetCard
                title={t("video.preset3", "Character Portrait Motion")}
                text="A close-up portrait shot with gentle head motion, subtle breathing, shallow depth of field, soft light, cinematic realism."
                onUse={setPrompt}
              />
            </div>
          </section>

          <section className={`${PANEL} p-5 md:p-6`}>
            <SectionTitle
              title={t("video.referenceImage", "Reference Image")}
              desc={t("video.referenceDesc", "Optional but useful for image-to-video or prompt+image.")}
            />

            <div className="flex flex-wrap gap-3">
              <button type="button" className={SECONDARY_BUTTON} onClick={() => imageInputRef.current?.click()}>
                {t("video.selectReference", "Select Reference")}
              </button>
              <button type="button" className={SECONDARY_BUTTON} onClick={clearReference} disabled={!referenceImage}>
                {t("video.clearReference", "Clear Reference")}
              </button>

              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  handleReferenceSelect(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>

            {referenceImage ? (
              <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className={CHIP}>{t("video.reference", "Reference")}</span>
                  <span className={CHIP}>{formatBytes(referenceImage.size || 0)}</span>
                </div>
                <div className="mb-4 text-sm font-semibold text-white">{referenceImage.name}</div>
                <img
                  src={referenceUrl}
                  alt="Reference"
                  className="max-h-[360px] w-full rounded-2xl object-contain bg-black"
                />
              </div>
            ) : (
              <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-white/45">
                {t("video.noReference", "No reference image selected.")}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className={`${PANEL} p-5 md:p-6`}>
            <SectionTitle
              title={t("video.creditsTitle", "Credits")}
              desc={t("video.creditsDesc", "Manage credits and limits for video generation.")}
            />

            <div className="space-y-3 text-sm text-white/70">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <span>{t("common.currentPlan", "Current Plan")}</span>
                <span className="font-semibold text-white">{creditState.plan?.name || t("common.free", "Free")}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <span>{t("video.creditsRemaining", "Credits Remaining")}</span>
                <span className="font-semibold text-white">{creditState.creditsRemaining}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <span>{t("video.costPerVideo", "Cost Per Video")}</span>
                <span className="font-semibold text-white">{creditPreview.requiredCredits ?? 20}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <span>{t("pricing.watermark", "Watermark:")}</span>
                <span className="font-semibold text-white">
                  {creditState.watermark ? t("pricing.on", "On") : t("pricing.off", "Off")}
                </span>
              </div>
            </div>
          </section>

          <section className={`${PANEL} p-5 md:p-6`}>
            <SectionTitle
              title={t("common.status", "Status")}
              desc={t("video.statusDesc", "Payload and preview status.")}
            />

            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-4 text-sm leading-6 text-cyan-100">
              {status}
            </div>

            <div className="mt-4 space-y-3 text-sm text-white/70">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <span>{t("video.provider", "Provider")}</span>
                <span className="font-semibold text-white">{providerInfo?.type || "—"}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <span>{t("video.payload", "Payload")}</span>
                <span className="font-semibold text-white">{payload ? t("common.ready", "Ready") : t("common.pending", "Pending")}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <span>{t("common.preview", "Preview")}</span>
                <span className="font-semibold text-white">{result ? t("common.ready", "Ready") : t("common.pending", "Pending")}</span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" className={PRIMARY_BUTTON} onClick={generatePreview} disabled={isPreparing}>
                {isPreparing ? t("video.working", "Working...") : t("video.generatePreview", "Generate Preview")}
              </button>

              <button type="button" className={SECONDARY_BUTTON} onClick={preparePayload} disabled={isPreparing}>
                {t("video.preparePayload", "Prepare Payload")}
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

          <section className={`${PANEL} p-5 md:p-6`}>
            <SectionTitle
              title={t("common.preview", "Preview")}
              desc={t("video.previewDesc", "Mock preview for the current video logic.")}
            />

            {result ? (
              <>
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/30">
                  <img
                    src={result.previewPoster}
                    alt="Video preview poster"
                    className="w-full object-cover"
                  />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <div className="text-white/45">{t("video.durationLabel", "Duration")}</div>
                    <div className="mt-1 font-medium text-white">
                      {formatSeconds(result?.preview?.durationSec || Number(durationSec) || 0)}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <div className="text-white/45">FPS</div>
                    <div className="mt-1 font-medium text-white">{result?.preview?.fps || fps}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <div className="text-white/45">{t("common.resolution", "Resolution")}</div>
                    <div className="mt-1 font-medium text-white">
                      {(result?.preview?.width || detectImageSize(aspectRatio, quality).width)} ×{" "}
                      {(result?.preview?.height || detectImageSize(aspectRatio, quality).height)}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <div className="text-white/45">{t("common.status", "Status")}</div>
                    <div className="mt-1 font-medium text-white">{result?.status || "mock_ready"}</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-3xl border border-white/10 bg-black/20 p-6 text-sm text-white/45">
                {t("video.noPreview", "No preview yet.")}
              </div>
            )}

            <div className="mt-5 rounded-3xl border border-white/10 bg-black/30 p-4">
              <div className="mb-3 text-sm font-semibold text-white">
                {t("common.payloadPreview", "Payload Preview")}
              </div>
              <pre className="max-h-[420px] overflow-auto rounded-2xl bg-black/40 p-4 text-xs leading-6 text-cyan-100">
{JSON.stringify(
  payload || {
    app: "Afrawood",
    feature: "video",
    project: projectTitle || "Untitled Video Project",
    nextStep: "Prepare video payload",
  },
  null,
  2
)}
              </pre>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}