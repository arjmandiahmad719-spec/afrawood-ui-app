import React, { useEffect, useMemo, useRef, useState } from "react";
import { generateImage } from "../../imageAI";

const RATIO_OPTIONS = [
  "1:1",
  "9:16",
  "16:9",
  "4:5",
  "3:4",
  "21:9",
];

const MODE_OPTIONS = [
  { value: "prompt-to-image", label: "Prompt → Image" },
  { value: "raw-image-plus-prompt", label: "Raw Image + Prompt" },
  { value: "edit-image-with-prompt", label: "Edit Image with Prompt" },
];

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read image."));
    reader.readAsDataURL(file);
  });
}

export default function CinematicImagePanel({ initialPrompt = "" }) {
  const initializedRef = useRef(false);

  const [mode, setMode] = useState("prompt-to-image");
  const [prompt, setPrompt] = useState(initialPrompt || "");
  const [englishPrompt, setEnglishPrompt] = useState("");
  const [ratio, setRatio] = useState("16:9");
  const [fastMode, setFastMode] = useState(false);

  const [sourceImage, setSourceImage] = useState("");
  const [resultImage, setResultImage] = useState("");
  const [statusText, setStatusText] = useState("Ready");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (initialPrompt && String(initialPrompt).trim()) {
      setPrompt(String(initialPrompt).trim());
    }
  }, [initialPrompt]);

  const normalizedPrompt = useMemo(() => {
    return String(prompt || "").trim();
  }, [prompt]);

  function buildInternalEnglishPrompt(userPrompt) {
    const text = String(userPrompt || "").trim();
    if (!text) return "";

    const looksPersian = /[\u0600-\u06FF]/.test(text);

    if (!looksPersian) {
      return `cinematic image, ${text}, high detail, professional lighting, visually rich composition`;
    }

    return `cinematic image based on this concept: ${text}. high detail, professional lighting, visually rich composition`;
  }

  async function handleUploadSourceImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      setSourceImage(dataUrl);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load source image.");
    } finally {
      event.target.value = "";
    }
  }

  function handleClearSourceImage() {
    setSourceImage("");
  }

  async function handleGenerate() {
    try {
      if (!normalizedPrompt) {
        setError("Prompt is required.");
        return;
      }

      if (
        (mode === "raw-image-plus-prompt" ||
          mode === "edit-image-with-prompt") &&
        !sourceImage
      ) {
        setError("A source image is required for this mode.");
        return;
      }

      setError("");
      setIsGenerating(true);
      setStatusText("Preparing image request...");

      const internalPrompt = buildInternalEnglishPrompt(normalizedPrompt);
      setEnglishPrompt(internalPrompt);

      const result = await generateImage({
        mode,
        prompt: normalizedPrompt,
        englishPrompt: internalPrompt,
        ratio,
        fastMode,
        sourceImage,
      });

      if (result?.imageUrl) {
        setResultImage(result.imageUrl);
        setStatusText("Image generated successfully.");
      } else {
        setStatusText("Image generation completed.");
      }
    } catch (err) {
      setError(err.message || "Image generation failed.");
      setStatusText("Failed.");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleDownloadResult() {
    if (!resultImage) return;

    const a = document.createElement("a");
    a.href = resultImage;
    a.download = "afrawood-image.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>Cinematic Image</div>
          <div style={styles.subtitle}>
            Prompt-based image generation with initial prompt support
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.sectionTitle}>Input</div>

          <label style={styles.label}>Mode</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            style={styles.select}
          >
            {MODE_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <label style={styles.label}>Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to create..."
            style={styles.textarea}
          />

          <label style={styles.label}>Aspect Ratio</label>
          <select
            value={ratio}
            onChange={(e) => setRatio(e.target.value)}
            style={styles.select}
          >
            {RATIO_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <label style={styles.switchRow}>
            <input
              type="checkbox"
              checked={fastMode}
              onChange={(e) => setFastMode(e.target.checked)}
            />
            <span>Fast Mode</span>
          </label>

          {(mode === "raw-image-plus-prompt" ||
            mode === "edit-image-with-prompt") && (
            <>
              <label style={styles.label}>Source Image</label>
              <div style={styles.inlineRow}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadSourceImage}
                  style={styles.fileInput}
                />
                {sourceImage ? (
                  <button
                    type="button"
                    style={styles.secondaryBtn}
                    onClick={handleClearSourceImage}
                  >
                    Remove
                  </button>
                ) : null}
              </div>

              {sourceImage ? (
                <div style={styles.previewWrap}>
                  <img
                    src={sourceImage}
                    alt="Source"
                    style={styles.previewImage}
                  />
                </div>
              ) : null}
            </>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            style={styles.primaryBtn}
          >
            {isGenerating ? "Generating..." : "Generate Image"}
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.sectionTitle}>Output</div>

          <div style={styles.statusBox}>
            <div>
              <strong>Status:</strong> {statusText}
            </div>
          </div>

          {englishPrompt ? (
            <div style={styles.promptBox}>
              <div style={styles.promptTitle}>Internal English Prompt</div>
              <div style={styles.promptText}>{englishPrompt}</div>
            </div>
          ) : null}

          {error ? <div style={styles.errorBox}>{error}</div> : null}

          {resultImage ? (
            <div style={styles.outputWrap}>
              <img
                src={resultImage}
                alt="Generated"
                style={styles.resultImage}
              />
              <button
                type="button"
                style={styles.primaryBtn}
                onClick={handleDownloadResult}
              >
                Download Image
              </button>
            </div>
          ) : (
            <div style={styles.emptyBox}>No generated image yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: 20,
    color: "#fff",
    background: "#000",
    minHeight: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: 700,
  },

  subtitle: {
    color: "#aaa",
    marginTop: 4,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },

  card: {
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 18,
    padding: 16,
    background: "rgba(255,255,255,0.03)",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 14,
  },

  label: {
    display: "block",
    marginTop: 12,
    marginBottom: 8,
    color: "#ddd",
    fontSize: 14,
  },

  select: {
    width: "100%",
    height: 44,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "#0c0c0c",
    color: "#fff",
    padding: "0 12px",
    outline: "none",
  },

  textarea: {
    width: "100%",
    minHeight: 160,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "#050505",
    color: "#fff",
    padding: 14,
    outline: "none",
    resize: "vertical",
  },

  switchRow: {
    marginTop: 14,
    display: "flex",
    alignItems: "center",
    gap: 10,
    color: "#ddd",
  },

  inlineRow: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },

  fileInput: {
    flex: 1,
    color: "#fff",
  },

  secondaryBtn: {
    height: 40,
    padding: "0 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
  },

  primaryBtn: {
    marginTop: 18,
    width: "100%",
    height: 48,
    border: "none",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: 700,
    color: "#111",
    background: "linear-gradient(135deg, #d8b06a 0%, #7ee7ff 100%)",
  },

  previewWrap: {
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.08)",
    width: 220,
    maxWidth: "100%",
  },

  previewImage: {
    display: "block",
    width: "100%",
    height: "auto",
  },

  statusBox: {
    padding: 12,
    borderRadius: 12,
    background: "rgba(255,255,255,0.04)",
    marginBottom: 12,
  },

  promptBox: {
    padding: 12,
    borderRadius: 12,
    background: "rgba(255,255,255,0.04)",
    marginBottom: 12,
  },

  promptTitle: {
    fontWeight: 700,
    marginBottom: 8,
  },

  promptText: {
    color: "#ddd",
    lineHeight: 1.7,
    wordBreak: "break-word",
  },

  errorBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    background: "rgba(255,80,80,0.12)",
    border: "1px solid rgba(255,80,80,0.24)",
    color: "#ffd2d2",
  },

  outputWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  resultImage: {
    display: "block",
    width: "100%",
    borderRadius: 14,
    background: "#000",
  },

  emptyBox: {
    padding: 18,
    borderRadius: 12,
    background: "rgba(255,255,255,0.04)",
    color: "#aaa",
  },
};