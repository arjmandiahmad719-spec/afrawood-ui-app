import React, { useMemo, useState } from "react";

const PAGE_STYLE = {
  minHeight: "100vh",
  backgroundImage: "url('/script-bg-bw.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  position: "relative",
  color: "#fff",
  overflow: "hidden",
};

const OVERLAY_STYLE = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.78) 100%)",
};

const WRAP_STYLE = {
  position: "relative",
  zIndex: 2,
  width: "100%",
  maxWidth: 1320,
  margin: "0 auto",
  padding: "110px 24px 40px",
  boxSizing: "border-box",
};

const CARD_STYLE = {
  borderRadius: 28,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(10,10,10,0.38)",
  boxShadow: "0 20px 80px rgba(0,0,0,0.35)",
  backdropFilter: "blur(10px)",
  padding: 28,
  boxSizing: "border-box",
};

const PANEL_STYLE = {
  borderRadius: 22,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.24)",
  padding: 18,
  boxSizing: "border-box",
};

const BUTTON_STYLE = {
  height: 52,
  padding: "0 20px",
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
};

const ACTIVE_BUTTON_STYLE = {
  ...BUTTON_STYLE,
  background: "linear-gradient(135deg, #1ed6ff 0%, #f3d35e 100%)",
  color: "#111",
  border: "none",
};

const INPUT_STYLE = {
  width: "100%",
  height: 56,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.28)",
  color: "#fff",
  outline: "none",
  padding: "0 16px",
  fontSize: 16,
  boxSizing: "border-box",
};

const TEXTAREA_STYLE = {
  width: "100%",
  minHeight: 220,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.28)",
  color: "#fff",
  outline: "none",
  padding: "16px",
  fontSize: 16,
  boxSizing: "border-box",
  resize: "vertical",
};

const PRIMARY_BUTTON_STYLE = {
  height: 54,
  padding: "0 24px",
  borderRadius: 16,
  border: "none",
  background: "linear-gradient(135deg, #1ed6ff 0%, #f3d35e 100%)",
  color: "#111",
  cursor: "pointer",
  fontSize: 16,
  fontWeight: 800,
};

const SECONDARY_BUTTON_STYLE = {
  height: 48,
  padding: "0 18px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 700,
};

const FORMAT_OPTIONS = [
  {
    id: "short-film",
    label: "فیلم کوتاه",
    englishLabel: "Short Film",
    durationPlaceholder: "مثلا 5 تا 20 دقیقه",
  },
  {
    id: "feature-film",
    label: "فیلم سینمایی",
    englishLabel: "Feature Film",
    durationPlaceholder: "مثلا 80 تا 120 دقیقه",
  },
  {
    id: "series",
    label: "سریال",
    englishLabel: "Series",
    durationPlaceholder: "مثلا 8 قسمت / هر قسمت 45 دقیقه",
  },
];

function readHistory() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("afrawood_script_history");
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(items) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("afrawood_script_history", JSON.stringify(items || []));
}

function buildTitle(format) {
  if (format === "short-film") return "SHORT FILM";
  if (format === "feature-film") return "FEATURE FILM";
  if (format === "series") return "SERIES";
  return "SCRIPT";
}

function buildScriptDraft({
  format,
  idea,
  genre,
  tone,
  duration,
  protagonist,
  setting,
  language,
}) {
  const title = buildTitle(format);
  const safeIdea = String(idea || "").trim() || "Write your story idea here.";
  const safeGenre = String(genre || "").trim() || "Drama";
  const safeTone = String(tone || "").trim() || "Cinematic";
  const safeDuration = String(duration || "").trim() || "-";
  const safeProtagonist = String(protagonist || "").trim() || "Main Character";
  const safeSetting = String(setting || "").trim() || "Film World";
  const safeLanguage = String(language || "").trim() || "English";

  return `${title}

Language: ${safeLanguage}
Genre: ${safeGenre}
Tone: ${safeTone}
Duration: ${safeDuration}

Logline:
${safeIdea}

Main Character:
- Name: ${safeProtagonist}
- Goal:
- Inner Conflict:
- Outer Conflict:

World / Setting:
- Main Setting: ${safeSetting}
- Visual Tone:
- Emotional Atmosphere:
- Central Theme:

Story Structure:
1. Opening Image
2. Setup
3. Inciting Incident
4. Rising Conflict
5. Midpoint
6. Crisis
7. Climax
8. Resolution

Scene 1
INT./EXT. - LOCATION - TIME
Action:
Dialogue:

Scene 2
INT./EXT. - LOCATION - TIME
Action:
Dialogue:

Scene 3
INT./EXT. - LOCATION - TIME
Action:
Dialogue:

Director Notes:
- Strengthen conflict
- Sharpen character motivation
- Keep dialogue cinematic
- Improve scene rhythm
`;
}

export default function AIScriptPage() {
  const [selectedFormat, setSelectedFormat] = useState("short-film");
  const [idea, setIdea] = useState("");
  const [genre, setGenre] = useState("");
  const [tone, setTone] = useState("");
  const [duration, setDuration] = useState("");
  const [protagonist, setProtagonist] = useState("");
  const [setting, setSetting] = useState("");
  const [language, setLanguage] = useState("English");
  const [result, setResult] = useState("");
  const [history, setHistory] = useState(() => readHistory());

  const currentFormat = useMemo(() => {
    return FORMAT_OPTIONS.find((item) => item.id === selectedFormat) || FORMAT_OPTIONS[0];
  }, [selectedFormat]);

  const wordCount = useMemo(() => {
    return String(idea || "").trim().split(/\s+/).filter(Boolean).length;
  }, [idea]);

  function handleGenerate() {
    const generated = buildScriptDraft({
      format: selectedFormat,
      idea,
      genre,
      tone,
      duration,
      protagonist,
      setting,
      language,
    });

    setResult(generated);

    const entry = {
      id: Date.now(),
      format: selectedFormat,
      title: buildTitle(selectedFormat),
      idea: idea || "Untitled Idea",
      genre: genre || "Drama",
      tone: tone || "Cinematic",
      duration: duration || "-",
      protagonist: protagonist || "Main Character",
      setting: setting || "Film World",
      language: language || "English",
      result: generated,
    };

    const nextHistory = [entry, ...history].slice(0, 12);
    setHistory(nextHistory);
    saveHistory(nextHistory);
  }

  function handleReset() {
    setSelectedFormat("short-film");
    setIdea("");
    setGenre("");
    setTone("");
    setDuration("");
    setProtagonist("");
    setSetting("");
    setLanguage("English");
    setResult("");
  }

  function handleSelectHistory(item) {
    setSelectedFormat(item.format || "short-film");
    setIdea(item.idea || "");
    setGenre(item.genre || "");
    setTone(item.tone || "");
    setDuration(item.duration || "");
    setProtagonist(item.protagonist || "");
    setSetting(item.setting || "");
    setLanguage(item.language || "English");
    setResult(item.result || "");
  }

  function handleDeleteHistory(id) {
    const nextHistory = history.filter((item) => item.id !== id);
    setHistory(nextHistory);
    saveHistory(nextHistory);
  }

  function handleClearHistory() {
    setHistory([]);
    saveHistory([]);
  }

  return (
    <div style={PAGE_STYLE}>
      <div style={OVERLAY_STYLE} />

      <div style={WRAP_STYLE}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 0.92fr",
            gap: 20,
          }}
        >
          <div style={CARD_STYLE}>
            <div style={{ fontSize: 40, fontWeight: 900, marginBottom: 10 }}>
              AI Script
            </div>

            <div
              style={{
                color: "rgba(255,255,255,0.84)",
                lineHeight: 1.9,
                marginBottom: 24,
                fontSize: 17,
              }}
            >
              Create screenplay drafts for short films, feature films, and series in a cinematic writing workflow.
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 22,
              }}
            >
              {FORMAT_OPTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedFormat(item.id)}
                  style={selectedFormat === item.id ? ACTIVE_BUTTON_STYLE : BUTTON_STYLE}
                >
                  {item.label} / {item.englishLabel}
                </button>
              ))}
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 14,
                }}
              >
                <input
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="Genre"
                  style={INPUT_STYLE}
                />

                <input
                  type="text"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  placeholder="Tone"
                  style={INPUT_STYLE}
                />

                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder={currentFormat.durationPlaceholder}
                  style={INPUT_STYLE}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 14,
                }}
              >
                <input
                  type="text"
                  value={protagonist}
                  onChange={(e) => setProtagonist(e.target.value)}
                  placeholder="Main Character"
                  style={INPUT_STYLE}
                />

                <input
                  type="text"
                  value={setting}
                  onChange={(e) => setSetting(e.target.value)}
                  placeholder="Setting / World"
                  style={INPUT_STYLE}
                />

                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  style={INPUT_STYLE}
                >
                  <option value="English" style={{ background: "#111" }}>English</option>
                  <option value="Persian" style={{ background: "#111" }}>Persian</option>
                  <option value="Turkish" style={{ background: "#111" }}>Turkish</option>
                  <option value="French" style={{ background: "#111" }}>French</option>
                </select>
              </div>

              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Write your story idea..."
                style={{ ...TEXTAREA_STYLE, minHeight: 170 }}
              />

              <div
                style={{
                  color: "rgba(255,255,255,0.68)",
                  fontSize: 14,
                }}
              >
                Word count: {wordCount}
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={handleGenerate}
                  style={PRIMARY_BUTTON_STYLE}
                >
                  Generate Script Draft
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  style={SECONDARY_BUTTON_STYLE}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div style={CARD_STYLE}>
            <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 16 }}>
              Preview
            </div>

            <div
              style={{
                ...PANEL_STYLE,
                minHeight: 520,
                whiteSpace: "pre-wrap",
                lineHeight: 1.8,
                color: "rgba(255,255,255,0.88)",
                overflow: "auto",
              }}
            >
              {result || "Generated screenplay appears here..."}
            </div>
          </div>
        </div>

        <div style={{ ...CARD_STYLE, marginTop: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 900 }}>
              Script History
            </div>

            <button
              type="button"
              onClick={handleClearHistory}
              style={SECONDARY_BUTTON_STYLE}
              disabled={history.length === 0}
            >
              Clear History
            </button>
          </div>

          {history.length === 0 ? (
            <div style={{ color: "rgba(255,255,255,0.66)" }}>
              No script history yet.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {history.map((item) => (
                <div key={item.id} style={PANEL_STYLE}>
                  <div style={{ fontWeight: 800, marginBottom: 8 }}>
                    {item.title} — {item.genre}
                  </div>

                  <div
                    style={{
                      color: "rgba(255,255,255,0.82)",
                      lineHeight: 1.8,
                    }}
                  >
                    {item.tone} • {item.duration} • {item.language}
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      color: "rgba(255,255,255,0.82)",
                      lineHeight: 1.8,
                    }}
                  >
                    {String(item.idea || "").slice(0, 180)}
                  </div>

                  <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => handleSelectHistory(item)}
                      style={SECONDARY_BUTTON_STYLE}
                    >
                      Select
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteHistory(item.id)}
                      style={SECONDARY_BUTTON_STYLE}
                    >
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