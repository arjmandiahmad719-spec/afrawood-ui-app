import React, { useEffect, useMemo, useRef, useState } from "react";
import generateImage, { getImageEngineInfo } from "../ai/imageAI.js";
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

function SectionTitle({ title, desc }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {desc ? <p className="mt-1 text-sm text-white/55">{desc}</p> : null}
    </div>
  );
}

function uid(prefix = "img") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export default function CinematicImagePage({ onBackHome }) {
  const { t } = useLanguage();
  const [prompt, setPrompt] = useState(
    "A cinematic close-up of a woman standing in the rain at night, neon reflections, realistic film look"
  );
  const [negativePrompt, setNegativePrompt] = useState("blurry, low quality, watermark");
  const [style, setStyle] = useState("cinematic");
  const [shotType, setShotType] = useState("medium");
  const [cameraAngle, setCameraAngle] = useState("eye level");
  const [lighting, setLighting] = useState("dramatic lighting");
  const [mood, setMood] = useState("cinematic");
  const [environment, setEnvironment] = useState("rainy night city");
  const [ratio, setRatio] = useState("1:1");
  const [seed, setSeed] = useState("");
  const [seedLocked, setSeedLocked] = useState(false);
  const [status, setStatus] = useState(t("common.ready", "Ready"));
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImages, setResultImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [referenceImage, setReferenceImage] = useState(null);
  const [referencePreview, setReferencePreview] = useState("");
  const [creditState, setCreditState] = useState(() => getCreditSummary());

  const fileInputRef = useRef(null);
  const controllerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (controllerRef.current) controllerRef.current.abort();
      if (referencePreview) URL.revokeObjectURL(referencePreview);
    };
  }, [referencePreview]);

  const engineInfo = useMemo(() => {
    try {
      return getImageEngineInfo();
    } catch {
      return { engine: "ComfyUI", mode: "local" };
    }
  }, []);

  const composedPrompt = useMemo(() => {
    const extras = [style, shotType, cameraAngle, lighting, mood, environment]
      .filter(Boolean)
      .join(", ");
    return extras ? `${prompt.trim()}, ${extras}` : prompt.trim();
  }, [prompt, style, shotType, cameraAngle, lighting, mood, environment]);

  const createPreview = useMemo(
    () => canSpendCredits(CREDIT_ACTIONS.IMAGE_CREATE),
    [creditState]
  );
  const editPreview = useMemo(
    () => canSpendCredits(CREDIT_ACTIONS.IMAGE_EDIT),
    [creditState]
  );

  function refreshCredits() {
    setCreditState(getCreditSummary());
  }

  function handleReferenceSelect(fileList) {
    const file = Array.from(fileList || [])[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus(t("image.referenceMustImage", "Reference must be an image file."));
      return;
    }
    if (referencePreview) URL.revokeObjectURL(referencePreview);
    const url = URL.createObjectURL(file);
    setReferenceImage(file);
    setReferencePreview(url);
    setStatus(t("image.referenceAdded", "Reference image added."));
  }

  function clearReference() {
    if (referencePreview) URL.revokeObjectURL(referencePreview);
    setReferenceImage(null);
    setReferencePreview("");
    setStatus(t("image.referenceCleared", "Reference image cleared."));
  }

  async function handleGenerate(isEdit = false) {
    if (!prompt.trim()) {
      setStatus(t("image.promptEmpty", "Prompt is empty."));
      return;
    }

    const action = isEdit ? CREDIT_ACTIONS.IMAGE_EDIT : CREDIT_ACTIONS.IMAGE_CREATE;
    const access = canSpendCredits(action);
    if (!access.ok) {
      setStatus(access.message || t("image.notEnough", "Not enough credits."));
      refreshCredits();
      return;
    }

    if (controllerRef.current) controllerRef.current.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setIsGenerating(true);
    setStatus(
      isEdit
        ? `${t("image.editing", "Editing image...")} (${access.requiredCredits} ${t("image.credits", "credits")})`
        : `${t("image.generating", "Generating image...")} (${access.requiredCredits} ${t("image.credits", "credits")})`
    );

    try {
      const result = await generateImage(
        {
          prompt: composedPrompt,
          negativePrompt,
          ratio,
          seed,
          seedLocked,
          referenceImage,
        },
        controller
      );

      const images = Array.isArray(result?.images) ? result.images : [];
      const spent = spendCredits(action);
      refreshCredits();

      if (!spent.ok) {
        setStatus(spent.message || t("image.creditFailed", "Credit spend failed."));
        return;
      }

      setResultImages(images.map((url) => ({ id: uid(), url })));
      setSelectedImage(images[0] || "");
      setStatus(
        images.length
          ? `${t("image.done", "Done.")} ${spent.creditsSpent} ${t("image.creditsUsed", "credits used.")}`
          : t("image.noImage", "No image returned.")
      );
    } catch (error) {
      console.error("generate image error:", error);
      setStatus(error?.message || t("image.failed", "Image generation failed."));
    } finally {
      setIsGenerating(false);
    }
  }

  function handleCancel() {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
      setIsGenerating(false);
      setStatus(t("image.canceled", "Generation canceled."));
    }
  }

  function handleDownload(url) {
    const a = document.createElement("a");
    a.href = url;
    a.download = "afrawood_image.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <div className="min-h-[calc(100vh-110px)] text-white">
      <div className="grid gap-6 xl:grid-cols-[1.02fr_1.08fr]">
        <section className={`${PANEL} p-5 md:p-6`}>
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className={CHIP}>{t("modules.image", "Cinematic Image")}</span>
            <span className={CHIP}>{engineInfo?.engine || "Engine"}</span>
            <span className={CHIP}>{engineInfo?.mode || "local"}</span>
            <span className={CHIP}>{creditState.plan?.name || t("common.free", "Free")}</span>
          </div>

          <SectionTitle
            title={t("image.title", "Image Prompt")}
            desc={t("image.desc", "Write your prompt and adjust cinematic controls.")}
          />

          <div className="space-y-4">
            <div>
              <label className={LABEL}>{t("image.prompt", "Prompt")}</label>
              <textarea
                className={`${INPUT} min-h-[140px] resize-y`}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t("image.describe", "Describe the image...")}
              />
            </div>

            <div>
              <label className={LABEL}>{t("image.negativePrompt", "Negative Prompt")}</label>
              <input
                className={INPUT}
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="blurry, low quality, watermark..."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={LABEL}>{t("image.style", "Style")}</label>
                <select className={INPUT} value={style} onChange={(e) => setStyle(e.target.value)}>
                  <option value="cinematic">cinematic</option>
                  <option value="realistic">realistic</option>
                  <option value="dramatic">dramatic</option>
                  <option value="commercial">commercial</option>
                </select>
              </div>

              <div>
                <label className={LABEL}>{t("image.shotType", "Shot Type")}</label>
                <select className={INPUT} value={shotType} onChange={(e) => setShotType(e.target.value)}>
                  <option value="close-up">close-up</option>
                  <option value="medium">medium</option>
                  <option value="wide">wide</option>
                </select>
              </div>

              <div>
                <label className={LABEL}>{t("image.cameraAngle", "Camera Angle")}</label>
                <select className={INPUT} value={cameraAngle} onChange={(e) => setCameraAngle(e.target.value)}>
                  <option value="eye level">eye level</option>
                  <option value="low angle">low angle</option>
                  <option value="high angle">high angle</option>
                </select>
              </div>

              <div>
                <label className={LABEL}>{t("image.lighting", "Lighting")}</label>
                <select className={INPUT} value={lighting} onChange={(e) => setLighting(e.target.value)}>
                  <option value="dramatic lighting">dramatic lighting</option>
                  <option value="soft light">soft light</option>
                  <option value="neon light">neon light</option>
                  <option value="natural light">natural light</option>
                </select>
              </div>

              <div>
                <label className={LABEL}>{t("image.mood", "Mood")}</label>
                <select className={INPUT} value={mood} onChange={(e) => setMood(e.target.value)}>
                  <option value="cinematic">cinematic</option>
                  <option value="dark">dark</option>
                  <option value="romantic">romantic</option>
                  <option value="epic">epic</option>
                </select>
              </div>

              <div>
                <label className={LABEL}>{t("image.environment", "Environment")}</label>
                <input className={INPUT} value={environment} onChange={(e) => setEnvironment(e.target.value)} />
              </div>

              <div>
                <label className={LABEL}>{t("common.ratio", "Ratio")}</label>
                <select className={INPUT} value={ratio} onChange={(e) => setRatio(e.target.value)}>
                  <option value="1:1">1:1</option>
                  <option value="16:9">16:9</option>
                  <option value="9:16">9:16</option>
                </select>
              </div>

              <div>
                <label className={LABEL}>{t("image.seed", "Seed")}</label>
                <input className={INPUT} value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="optional" />
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <input type="checkbox" checked={seedLocked} onChange={(e) => setSeedLocked(e.target.checked)} />
              <span className="text-sm text-white/85">{t("image.lockSeed", "Lock Seed")}</span>
            </label>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="mb-3 flex flex-wrap gap-3">
                <button type="button" className={SECONDARY_BUTTON} onClick={() => fileInputRef.current?.click()}>
                  {t("image.referenceImage", "Reference Image")}
                </button>
                <button type="button" className={SECONDARY_BUTTON} onClick={clearReference} disabled={!referenceImage}>
                  {t("image.clearReference", "Clear Reference")}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    handleReferenceSelect(e.target.files);
                    e.target.value = "";
                  }}
                />
              </div>

              {referencePreview ? (
                <img src={referencePreview} alt="Reference" className="h-44 w-full rounded-2xl object-contain bg-black" />
              ) : (
                <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-white/40">
                  {t("image.noReference", "No reference image")}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
              <div>{t("image.createCost", "Create cost")}: {createPreview.requiredCredits ?? 10}</div>
              <div>{t("image.editCost", "Edit cost")}: {editPreview.requiredCredits ?? 0}</div>
              <div>{t("subtitle.remaining", "Credits remaining")}: {creditState.creditsRemaining}</div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="button" className={PRIMARY_BUTTON} onClick={() => handleGenerate(false)} disabled={isGenerating}>
                {isGenerating ? t("image.generatingShort", "Generating...") : t("image.generate", "Generate Image")}
              </button>
              <button type="button" className={SECONDARY_BUTTON} onClick={() => handleGenerate(true)} disabled={isGenerating || !selectedImage}>
                {t("image.edit", "Edit Image")}
              </button>
              <button type="button" className={SECONDARY_BUTTON} onClick={handleCancel} disabled={!isGenerating}>
                {t("image.cancel", "Cancel")}
              </button>
              {typeof onBackHome === "function" ? (
                <button type="button" className={SECONDARY_BUTTON} onClick={onBackHome}>
                  {t("common.home", "Home")}
                </button>
              ) : null}
            </div>
          </div>
        </section>

        <section className={`${PANEL} p-5 md:p-6`}>
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className={CHIP}>{t("common.preview", "Preview")}</span>
            <span className={CHIP}>{status}</span>
          </div>

          <SectionTitle
            title={t("image.generatedImage", "Generated Image")}
            desc={t("image.generatedDesc", "The output appears here.")}
          />

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/30">
            {selectedImage ? (
              <img src={selectedImage} alt="Generated" className="h-[420px] w-full object-contain bg-black md:h-[560px]" />
            ) : (
              <div className="flex h-[420px] items-center justify-center text-sm text-white/45 md:h-[560px]">
                {t("image.generatedPlaceholder", "Generated image appears here.")}
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className={SECONDARY_BUTTON} onClick={() => handleDownload(selectedImage)} disabled={!selectedImage}>
              {t("common.download", "Download")}
            </button>
          </div>

          {resultImages.length > 0 ? (
            <div className="mt-5">
              <div className="mb-3 text-sm font-semibold text-white">{t("image.history", "History")}</div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {resultImages.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedImage(item.url)}
                    className={`overflow-hidden rounded-2xl border bg-black/20 transition ${
                      selectedImage === item.url ? "border-cyan-400/60" : "border-white/10 hover:border-white/25"
                    }`}
                  >
                    <img src={item.url} alt="Result" className="h-28 w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-5 rounded-3xl border border-white/10 bg-black/30 p-4">
            <div className="mb-3 text-sm font-semibold text-white">{t("image.finalPrompt", "Final Prompt")}</div>
            <div className="text-sm leading-6 text-white/65">{composedPrompt || "—"}</div>
          </div>
        </section>
      </div>
    </div>
  );
}