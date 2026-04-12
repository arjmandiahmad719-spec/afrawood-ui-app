import React, { useMemo, useState } from "react";
import { addListItem, buildPlaceholderImage, clearList, readList, removeListItem } from "../ai/demoStudio.js";
import { createPageStyles } from "../styles/afrawoodPageTheme.js";

const styles = createPageStyles("image-bg-bw.jpg");

const RATIO_OPTIONS = [
  { value: "1:1", label: "1:1" },
  { value: "16:9", label: "16:9" },
  { value: "9:16", label: "9:16" },
  { value: "4:5", label: "4:5" },
  { value: "21:9", label: "21:9" },
];

const STYLE_OPTIONS = [
  "Cinematic",
  "Realistic",
  "Film Noir",
  "Sci-Fi",
  "Fantasy",
  "Drama",
  "Historical",
  "Minimal",
];

export default function CinematicImagePage() {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [style, setStyle] = useState("Cinematic");
  const [ratio, setRatio] = useState("16:9");
  const [seedLocked, setSeedLocked] = useState(false);
  const [seed, setSeed] = useState("123456");
  const [resultImage, setResultImage] = useState("");
  const [history, setHistory] = useState(() => readList("image_history"));

  const effectiveSeed = useMemo(() => {
    if (seedLocked && String(seed).trim()) return String(seed).trim();
    return String(Math.floor(Math.random() * 1000000000));
  }, [seedLocked, seed]);

  function handleGenerate() {
    const nextImage = buildPlaceholderImage({
      prompt: prompt || "Afrawood cinematic frame",
      style,
      ratio,
    });

    const entry = {
      id: Date.now(),
      imageUrl: nextImage,
      prompt: prompt || "Afrawood cinematic frame",
      negativePrompt,
      style,
      ratio,
      seed: effectiveSeed,
    };

    setResultImage(nextImage);
    setHistory(addListItem("image_history", entry, 12));
  }

  function handleSelectHistory(item) {
    setPrompt(item.prompt || "");
    setNegativePrompt(item.negativePrompt || "");
    setStyle(item.style || "Cinematic");
    setRatio(item.ratio || "16:9");
    setSeed(item.seed || "123456");
    setSeedLocked(true);
    setResultImage(item.imageUrl || "");
  }

  function handleDeleteHistory(id) {
    setHistory(removeListItem("image_history", id));
  }

  function handleClearHistory() {
    setHistory(clearList("image_history"));
  }

  return (
    <div style={styles.page}>
      <div style={styles.overlay} />

      <div style={styles.wrap}>
        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.heroTitle}>Cinematic Image</div>

            <div style={styles.heroText}>
              Create cinematic images with prompt, style, ratio, and seed control.
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Write your image prompt..."
                style={{ ...styles.textarea, minHeight: 140 }}
              />

              <textarea
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="Negative prompt..."
                style={{ ...styles.textarea, minHeight: 110 }}
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 14,
                }}
              >
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  style={styles.select}
                >
                  {STYLE_OPTIONS.map((item) => (
                    <option key={item} value={item} style={{ background: "#111" }}>
                      {item}
                    </option>
                  ))}
                </select>

                <select
                  value={ratio}
                  onChange={(e) => setRatio(e.target.value)}
                  style={styles.select}
                >
                  {RATIO_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value} style={{ background: "#111" }}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 14,
                  alignItems: "center",
                }}
              >
                <input
                  type="text"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  placeholder="Seed"
                  style={styles.input}
                />

                <button
                  type="button"
                  onClick={() => setSeedLocked((prev) => !prev)}
                  style={styles.secondaryButton}
                >
                  {seedLocked ? "Seed Locked" : "Seed Random"}
                </button>
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button type="button" onClick={handleGenerate} style={styles.primaryButton}>
                  Generate Image
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPrompt("");
                    setNegativePrompt("");
                    setStyle("Cinematic");
                    setRatio("16:9");
                    setSeed("123456");
                    setSeedLocked(false);
                    setResultImage("");
                  }}
                  style={styles.secondaryButton}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 16 }}>Preview</div>

            <div
              style={{
                ...styles.panel,
                minHeight: 360,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                padding: 0,
              }}
            >
              {resultImage ? (
                <img
                  src={resultImage}
                  alt="Generated preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : (
                <div style={{ color: "rgba(255,255,255,0.66)", fontSize: 16 }}>
                  Generated image appears here
                </div>
              )}
            </div>

            <div style={{ marginTop: 16, display: "grid", gap: 10, ...styles.infoText }}>
              <div><strong>Style:</strong> {style}</div>
              <div><strong>Ratio:</strong> {ratio}</div>
              <div><strong>Seed:</strong> {effectiveSeed}</div>
            </div>
          </div>
        </div>

        <div style={{ ...styles.card, marginTop: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 900 }}>Image History</div>

            <button
              type="button"
              onClick={handleClearHistory}
              style={styles.secondaryButton}
              disabled={history.length === 0}
            >
              Clear History
            </button>
          </div>

          {history.length === 0 ? (
            <div style={{ color: "rgba(255,255,255,0.66)" }}>No images generated yet.</div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: 14,
              }}
            >
              {history.map((item) => (
                <div
                  key={item.id}
                  style={{
                    borderRadius: 18,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(0,0,0,0.22)",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.prompt}
                    style={{
                      width: "100%",
                      height: 170,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />

                  <div style={{ padding: 12, boxSizing: "border-box" }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        lineHeight: 1.6,
                        minHeight: 44,
                      }}
                    >
                      {item.prompt}
                    </div>

                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 12,
                        color: "rgba(255,255,255,0.68)",
                        lineHeight: 1.7,
                      }}
                    >
                      {item.style} • {item.ratio} • Seed {item.seed}
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button
                        type="button"
                        onClick={() => handleSelectHistory(item)}
                        style={styles.secondaryButton}
                      >
                        Select
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteHistory(item.id)}
                        style={styles.secondaryButton}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}