import React, { useEffect, useRef, useState } from "react";
import { generateVideo } from "../../videoAI";

const PROVIDERS = [
  { value: "auto", label: "Auto" },
  { value: "veo", label: "Google Veo" },
  { value: "runway", label: "Runway" },
  { value: "fallback", label: "Fallback" },
];

const RATIOS = ["16:9", "9:16", "1:1", "4:5", "21:9"];
const QUALITIES = ["standard", "high"];
const DURATIONS = [4, 5, 6, 8, 10];

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read image."));
    reader.readAsDataURL(file);
  });
}

export default function VideoGeneratorPanel({ initialPrompt = "" }) {
  const initializedRef = useRef(false);

  const [prompt, setPrompt] = useState(initialPrompt || "");
  const [image, setImage] = useState("");
  const [provider, setProvider] = useState("auto");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [duration, setDuration] = useState(5);
  const [quality, setQuality] = useState("standard");

  const [isGenerating, setIsGenerating] = useState(false);
  const [statusText, setStatusText] = useState("Ready");
  const [error, setError] = useState("");

  const [result, setResult] = useState(null);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (initialPrompt && String(initialPrompt).trim()) {
      setPrompt(String(initialPrompt).trim());
    }
  }, [initialPrompt]);

  async function handleUploadImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      setImage(dataUrl);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load image.");
    } finally {
      event.target.value = "";
    }
  }

  function handleRemoveImage() {
    setImage("");
  }

  async function handleGenerate() {
    try {
      if (!String(prompt || "").trim() && !image) {
        setError("Prompt or image is required.");
        return;
      }

      setIsGenerating(true);
      setError("");
      setStatusText("Generating video...");
      setResult(null);

      const videoResult = await generateVideo({
        prompt,
        image,
        duration,
        aspectRatio,
        quality,
        provider,
      });

      setResult(videoResult);
      setStatusText("Video generated successfully.");
    } catch (err) {
      setError(err.message || "Video generation failed.");
      setStatusText("Failed.");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleDownload() {
    if (!result?.outputVideoUrl) return;

    const a = document.createElement("a");
    a.href = result.outputVideoUrl;
    a.download = "afrawood-video.mp4";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  const detectedMode = image && String(prompt || "").trim()
    ? "image+prompt"
    : image
    ? "image-to-video"
    : "text-to-video";

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>Video Generator</div>
          <div style={styles.subtitle}>
            Phase 4 • Real provider router + fallback engine
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.sectionTitle}>Input</div>

          <label style={styles.label}>Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your video..."
            style={styles.textarea}
          />

          <label style={styles.label}>Reference Image (optional)</label>
          <div style={styles.inlineRow}>
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadImage}
              style={styles.fileInput}
            />
            {image ? (
              <button
                type="button"
                style={styles.secondaryBtn}
                onClick={handleRemoveImage}
              >
                Remove
              </button>
            ) : null}
          </div>

          {image ? (
            <div style={styles.previewWrap}>
              <img src={image} alt="Reference" style={styles.previewImage} />
            </div>
          ) : null}

          <div style={styles.infoBox}>
            <div>
              <strong>Detected Mode:</strong> {detectedMode}
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.sectionTitle}>Settings</div>

          <label style={styles.label}>Provider</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            style={styles.select}
          >
            {PROVIDERS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <label style={styles.label}>Aspect Ratio</label>
          <select
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value)}
            style={styles.select}
          >
            {RATIOS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <label style={styles.label}>Duration</label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            style={styles.select}
          >
            {DURATIONS.map((item) => (
              <option key={item} value={item}>
                {item}s
              </option>
            ))}
          </select>

          <label style={styles.label}>Quality</label>
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            style={styles.select}
          >
            {QUALITIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            style={styles.primaryBtn}
          >
            {isGenerating ? "Generating..." : "Generate Video"}
          </button>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.sectionTitle}>Output</div>

        <div style={styles.statusBox}>
          <div>
            <strong>Status:</strong> {statusText}
          </div>
        </div>

        {error ? <div style={styles.errorBox}>{error}</div> : null}

        {result ? (
          <div style={styles.resultBox}>
            <div style={styles.metaGrid}>
              <div>
                <strong>Provider:</strong> {result.provider || "-"}
              </div>
              <div>
                <strong>Mode:</strong> {result.mode || "-"}
              </div>
              <div>
                <strong>Duration:</strong> {result.duration || "-"}s
              </div>
              <div>
                <strong>Aspect Ratio:</strong> {result.aspectRatio || "-"}
              </div>
              <div>
                <strong>Has Audio:</strong> {result.hasAudio ? "Yes" : "No"}
              </div>
              <div>
                <strong>Status:</strong> {result.status || "-"}
              </div>
            </div>

            {result.outputVideoUrl ? (
              <div style={styles.outputWrap}>
                <video
                  src={result.outputVideoUrl}
                  controls
                  style={styles.video}
                />
                <button
                  type="button"
                  style={styles.primaryBtn}
                  onClick={handleDownload}
                >
                  Download Video
                </button>
              </div>
            ) : (
              <div style={styles.noteBox}>
                No downloadable video URL returned yet. This is normal if the
                real provider endpoints are not connected and fallback is being used.
              </div>
            )}
          </div>
        ) : (
          <div style={styles.emptyBox}>No generated video yet.</div>
        )}
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

  inlineRow: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },

  fileInput: {
    flex: 1,
    color: "#fff",
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

  infoBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    background: "rgba(255,255,255,0.04)",
    fontSize: 14,
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

  secondaryBtn: {
    height: 40,
    padding: "0 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
  },

  statusBox: {
    padding: 12,
    borderRadius: 12,
    background: "rgba(255,255,255,0.04)",
    marginBottom: 12,
  },

  errorBox: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    background: "rgba(255,80,80,0.12)",
    border: "1px solid rgba(255,80,80,0.24)",
    color: "#ffd2d2",
  },

  resultBox: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },

  metaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    background: "rgba(255,255,255,0.04)",
    fontSize: 14,
  },

  outputWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  video: {
    width: "100%",
    maxWidth: 720,
    borderRadius: 14,
    background: "#000",
  },

  noteBox: {
    padding: 14,
    borderRadius: 12,
    background: "rgba(255,255,255,0.04)",
    color: "#bbb",
    lineHeight: 1.7,
  },

  emptyBox: {
    padding: 18,
    borderRadius: 12,
    background: "rgba(255,255,255,0.04)",
    color: "#aaa",
  },
};