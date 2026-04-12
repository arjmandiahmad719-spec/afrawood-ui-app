import React, { useMemo, useState } from "react";
import { addListItem, readList, removeListItem, wait } from "../ai/demoStudio.js";
import { createPageStyles } from "../styles/afrawoodPageTheme.js";

const styles = createPageStyles("music-bg.jpg");

const GENRE_OPTIONS = [
  "Cinematic",
  "Epic",
  "Drama",
  "Suspense",
  "Romantic",
  "Sci-Fi",
  "Fantasy",
  "Documentary",
  "Dark Ambient",
];

const MOOD_OPTIONS = [
  "Emotional",
  "Powerful",
  "Hopeful",
  "Dark",
  "Mysterious",
  "Inspirational",
  "Tense",
  "Calm",
];

const LENGTH_OPTIONS = ["15s", "30s", "45s", "60s", "90s"];

export default function MusicGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState("Cinematic");
  const [mood, setMood] = useState("Emotional");
  const [duration, setDuration] = useState("30s");
  const [tempo, setTempo] = useState("Medium");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(() => readList("music_history"));

  const wordCount = useMemo(() => {
    return String(prompt || "").trim().split(/\s+/).filter(Boolean).length;
  }, [prompt]);

  async function handleGenerateMusic() {
    await wait(800);

    const entry = {
      id: Date.now(),
      prompt,
      genre,
      mood,
      duration,
      tempo,
    };

    setHistory(addListItem("music_history", entry, 12));
    setResult(entry);
  }

  function handleReset() {
    setPrompt("");
    setGenre("Cinematic");
    setMood("Emotional");
    setDuration("30s");
    setTempo("Medium");
    setResult(null);
  }

  function handleDelete(id) {
    setHistory(removeListItem("music_history", id));
  }

  return (
    <div style={styles.page}>
      <div style={styles.overlay} />

      <div style={styles.wrap}>
        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.heroTitle}>Music Generator</div>

            <div style={styles.heroText}>
              Create cinematic music concepts for trailers, scenes, emotional moments, and final edits.
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the music you want..."
                style={{ ...styles.textarea, minHeight: 190 }}
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 14,
                }}
              >
                <select value={genre} onChange={(e) => setGenre(e.target.value)} style={styles.select}>
                  {GENRE_OPTIONS.map((item) => (
                    <option key={item} value={item} style={{ background: "#111" }}>
                      {item}
                    </option>
                  ))}
                </select>

                <select value={mood} onChange={(e) => setMood(e.target.value)} style={styles.select}>
                  {MOOD_OPTIONS.map((item) => (
                    <option key={item} value={item} style={{ background: "#111" }}>
                      {item}
                    </option>
                  ))}
                </select>

                <select value={duration} onChange={(e) => setDuration(e.target.value)} style={styles.select}>
                  {LENGTH_OPTIONS.map((item) => (
                    <option key={item} value={item} style={{ background: "#111" }}>
                      {item}
                    </option>
                  ))}
                </select>

                <select value={tempo} onChange={(e) => setTempo(e.target.value)} style={styles.select}>
                  <option style={{ background: "#111" }}>Slow</option>
                  <option style={{ background: "#111" }}>Medium</option>
                  <option style={{ background: "#111" }}>Fast</option>
                </select>
              </div>

              <div style={styles.mutedText}>Word count: {wordCount}</div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button type="button" onClick={handleGenerateMusic} style={styles.primaryButton}>
                  Generate Music
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
                    Music generated successfully
                  </div>

                  <div style={{ ...styles.infoText, marginBottom: 14 }}>
                    Genre: {result.genre} • Mood: {result.mood} • Duration: {result.duration} • Tempo: {result.tempo}
                  </div>

                  <div style={{ ...styles.panel, padding: 14 }}>
                    {String(result.prompt || "").trim().slice(0, 220) || "No music concept entered"}
                  </div>
                </div>
              ) : (
                <div style={{ color: "rgba(255,255,255,0.66)", fontSize: 16 }}>
                  Generated music preview appears here
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ ...styles.card, marginTop: 20 }}>
          <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 16 }}>Music History</div>

          {history.length === 0 ? (
            <div style={{ color: "rgba(255,255,255,0.66)" }}>No music history yet.</div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {history.map((item) => (
                <div key={item.id} style={styles.panel}>
                  <div style={{ fontWeight: 800, marginBottom: 8 }}>{item.genre}</div>
                  <div style={styles.infoText}>
                    {item.mood} • {item.duration} • {item.tempo}
                  </div>
                  <div style={{ ...styles.infoText, marginTop: 8 }}>
                    {String(item.prompt || "").slice(0, 160)}
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