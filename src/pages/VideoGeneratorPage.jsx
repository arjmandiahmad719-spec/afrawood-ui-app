import React, { useState } from "react";
import { addListItem, readList, removeListItem, wait } from "../ai/demoStudio.js";
import { createPageStyles } from "../styles/afrawoodPageTheme.js";

const styles = createPageStyles("video-bg.jpg");

export default function VideoGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState("5s");
  const [style, setStyle] = useState("Cinematic");
  const [result, setResult] = useState("");
  const [status, setStatus] = useState("");
  const [history, setHistory] = useState(() => readList("video_history"));

  async function handleGenerate() {
    setStatus("Generating video...");
    await wait(900);

    const entry = {
      id: Date.now(),
      prompt,
      duration,
      style,
      result: "Video generated successfully",
    };

    setHistory(addListItem("video_history", entry, 10));
    setResult("✅ Video generated successfully");
    setStatus("");
  }

  function handleDelete(id) {
    setHistory(removeListItem("video_history", id));
  }

  return (
    <div style={styles.page}>
      <div style={styles.overlay} />

      <div style={styles.wrap}>
        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.heroTitle}>Video Generator</div>
            <div style={styles.heroText}>
              Create cinematic AI videos from text or images.
            </div>

            <div style={{ display: "grid", gap: 15 }}>
              <textarea
                style={{ ...styles.textarea, minHeight: 140 }}
                placeholder="Describe your video scene..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />

              <div style={{ display: "flex", gap: 10 }}>
                <select style={styles.select} value={duration} onChange={(e) => setDuration(e.target.value)}>
                  <option style={{ background: "#111" }}>5s</option>
                  <option style={{ background: "#111" }}>10s</option>
                  <option style={{ background: "#111" }}>15s</option>
                </select>

                <select style={styles.select} value={style} onChange={(e) => setStyle(e.target.value)}>
                  <option style={{ background: "#111" }}>Cinematic</option>
                  <option style={{ background: "#111" }}>Realistic</option>
                  <option style={{ background: "#111" }}>Fantasy</option>
                  <option style={{ background: "#111" }}>Sci-Fi</option>
                </select>
              </div>

              <button style={styles.primaryButton} onClick={handleGenerate}>
                Generate Video
              </button>

              {status ? <div style={styles.infoText}>{status}</div> : null}
              {result ? <div style={styles.infoText}>{result}</div> : null}
            </div>
          </div>

          <div style={styles.card}>
            <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 16 }}>Preview</div>

            <div style={{ ...styles.panel, minHeight: 240 }}>
              <div style={styles.infoText}>
                <div><strong>Prompt:</strong> {prompt || "—"}</div>
                <div><strong>Duration:</strong> {duration}</div>
                <div><strong>Style:</strong> {style}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ ...styles.card, marginTop: 20 }}>
          <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 16 }}>History</div>

          {history.length === 0 ? (
            <div style={{ color: "rgba(255,255,255,0.66)" }}>No videos generated yet.</div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {history.map((item) => (
                <div key={item.id} style={styles.panel}>
                  <div style={{ fontWeight: 800, marginBottom: 8 }}>{item.prompt || "Untitled Prompt"}</div>
                  <div style={styles.infoText}>
                    {item.style} • {item.duration}
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <button type="button" style={styles.secondaryButton} onClick={() => handleDelete(item.id)}>
                      Delete
                    </button>
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