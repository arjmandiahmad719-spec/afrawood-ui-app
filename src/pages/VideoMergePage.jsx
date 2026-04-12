import React, { useState } from "react";
import { addListItem, readList, removeListItem, wait } from "../ai/demoStudio.js";
import { createPageStyles } from "../styles/afrawoodPageTheme.js";

const styles = createPageStyles("merge-bg.jpg");

export default function VideoMergePage() {
  const [videos, setVideos] = useState([]);
  const [result, setResult] = useState("");
  const [history, setHistory] = useState(() => readList("merge_history"));

  function handleUpload(e) {
    const files = Array.from(e.target.files || []);
    setVideos(files);
  }

  async function handleMerge() {
    if (videos.length === 0) {
      setResult("⚠️ Please upload videos first");
      return;
    }

    setResult("🎞 Merging videos...");
    await wait(1000);

    const entry = {
      id: Date.now(),
      count: videos.length,
      names: videos.map((file) => file.name),
      result: "Final video ready",
    };

    setHistory(addListItem("merge_history", entry, 10));
    setResult("✅ Final video ready");
  }

  function handleDelete(id) {
    setHistory(removeListItem("merge_history", id));
  }

  return (
    <div style={styles.page}>
      <div style={styles.overlay} />

      <div style={styles.wrap}>
        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.heroTitle}>Video Merge</div>

            <div style={styles.heroText}>
              Combine multiple clips into one cinematic sequence.
            </div>

            <div style={{ display: "grid", gap: 15 }}>
              <input
                type="file"
                multiple
                accept="video/*"
                onChange={handleUpload}
                style={styles.input}
              />

              <button style={styles.primaryButton} onClick={handleMerge}>
                Merge Videos
              </button>

              {videos.length > 0 ? (
                <div style={styles.infoText}>{videos.length} video(s) selected</div>
              ) : null}

              {result ? <div style={styles.infoText}>{result}</div> : null}
            </div>
          </div>

          <div style={styles.card}>
            <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 16 }}>Selection</div>

            <div style={{ ...styles.panel, minHeight: 240 }}>
              {videos.length === 0 ? (
                <div style={{ color: "rgba(255,255,255,0.66)" }}>No videos selected</div>
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  {videos.map((file) => (
                    <div key={`${file.name}_${file.size}`} style={styles.infoText}>
                      {file.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ ...styles.card, marginTop: 20 }}>
          <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 16 }}>Merge History</div>

          {history.length === 0 ? (
            <div style={{ color: "rgba(255,255,255,0.66)" }}>No merge history yet.</div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {history.map((item) => (
                <div key={item.id} style={styles.panel}>
                  <div style={{ fontWeight: 800, marginBottom: 8 }}>{item.count} clip(s)</div>
                  <div style={styles.infoText}>{item.names.join(", ")}</div>
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