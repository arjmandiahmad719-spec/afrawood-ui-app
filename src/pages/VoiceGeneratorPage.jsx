import React, { useMemo, useState } from "react";
import { addListItem, readList, removeListItem, wait } from "../ai/demoStudio.js";
import { createPageStyles } from "../styles/afrawoodPageTheme.js";

const styles = createPageStyles("voice-bg.jpg");

const VOICE_OPTIONS = [
  "Cinematic Male",
  "Cinematic Female",
  "Deep Trailer",
  "Soft Narrator",
  "Documentary",
  "Dramatic",
];

const LANGUAGE_OPTIONS = [
  "English",
  "Persian",
  "Turkish",
  "French",
  "Arabic",
];

export default function VoiceGeneratorPage() {
  const [script, setScript] = useState("");
  const [voice, setVoice] = useState("Cinematic Female");
  const [language, setLanguage] = useState("English");
  const [speed, setSpeed] = useState("Normal");
  const [emotion, setEmotion] = useState("Cinematic");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(() => readList("voice_history"));

  const charCount = useMemo(() => String(script || "").length, [script]);

  async function handleGenerateVoice() {
    await wait(800);

    const entry = {
      id: Date.now(),
      script,
      voice,
      language,
      speed,
      emotion,
    };

    setHistory(addListItem("voice_history", entry, 12));
    setResult(entry);
  }

  function handleReset() {
    setScript("");
    setVoice("Cinematic Female");
    setLanguage("English");
    setSpeed("Normal");
    setEmotion("Cinematic");
    setResult(null);
  }

  function handleDelete(id) {
    setHistory(removeListItem("voice_history", id));
  }

  return (
    <div style={styles.page}>
      <div style={styles.overlay} />

      <div style={styles.wrap}>
        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.heroTitle}>Voice Generator</div>

            <div style={styles.heroText}>
              Create cinematic voiceovers for narration, dialogue, trailers, and storytelling scenes.
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Write your voice script..."
                style={{ ...styles.textarea, minHeight: 190 }}
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 14,
                }}
              >
                <select value={voice} onChange={(e) => setVoice(e.target.value)} style={styles.select}>
                  {VOICE_OPTIONS.map((item) => (
                    <option key={item} value={item} style={{ background: "#111" }}>
                      {item}
                    </option>
                  ))}
                </select>

                <select value={language} onChange={(e) => setLanguage(e.target.value)} style={styles.select}>
                  {LANGUAGE_OPTIONS.map((item) => (
                    <option key={item} value={item} style={{ background: "#111" }}>
                      {item}
                    </option>
                  ))}
                </select>

                <select value={speed} onChange={(e) => setSpeed(e.target.value)} style={styles.select}>
                  <option style={{ background: "#111" }}>Slow</option>
                  <option style={{ background: "#111" }}>Normal</option>
                  <option style={{ background: "#111" }}>Fast</option>
                </select>

                <select value={emotion} onChange={(e) => setEmotion(e.target.value)} style={styles.select}>
                  <option style={{ background: "#111" }}>Calm</option>
                  <option style={{ background: "#111" }}>Cinematic</option>
                  <option style={{ background: "#111" }}>Dramatic</option>
                  <option style={{ background: "#111" }}>Emotional</option>
                  <option style={{ background: "#111" }}>Epic</option>
                </select>
              </div>

              <div style={styles.mutedText}>Character count: {charCount}</div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button type="button" onClick={handleGenerateVoice} style={styles.primaryButton}>
                  Generate Voice
                </button>

                <button type="button" onClick={handleReset} style={styles.secondaryButton}>
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 16 }}>Preview</div>

            <div style={{ ...styles.panel, minHeight: 220 }}>
              {result ? (
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>
                    Voice generated successfully
                  </div>

                  <div style={{ ...styles.infoText, marginBottom: 14 }}>
                    Voice: {result.voice} • Language: {result.language} • Speed: {result.speed} • Emotion: {result.emotion}
                  </div>

                  <div style={{ ...styles.panel, padding: 14 }}>
                    {String(result.script || "").trim().slice(0, 220) || "No preview text"}
                  </div>
                </div>
              ) : (
                <div style={{ color: "rgba(255,255,255,0.66)", fontSize: 16 }}>
                  Generated voice preview appears here
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ ...styles.card, marginTop: 20 }}>
          <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 16 }}>Voice History</div>

          {history.length === 0 ? (
            <div style={{ color: "rgba(255,255,255,0.66)" }}>No voice history yet.</div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {history.map((item) => (
                <div key={item.id} style={styles.panel}>
                  <div style={{ fontWeight: 800, marginBottom: 8 }}>{item.voice}</div>
                  <div style={styles.infoText}>
                    {item.language} • {item.speed} • {item.emotion}
                  </div>
                  <div style={{ ...styles.infoText, marginTop: 8 }}>
                    {String(item.script || "").slice(0, 160)}
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