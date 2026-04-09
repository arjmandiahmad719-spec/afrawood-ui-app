import React, { useEffect, useRef, useState } from "react";
import { generateScript } from "../../scriptAI";

const FORMAT_OPTIONS = [
  { value: "short-film", label: "Short Film" },
  { value: "feature-film", label: "Feature Film" },
  { value: "series", label: "Series" },
];

const DIALOGUE_STYLE_OPTIONS = [
  { value: "auto", label: "Auto" },
  { value: "conversational", label: "Conversational" },
  { value: "formal-poetic", label: "Formal / Poetic" },
];

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function buildExportJson(data) {
  return JSON.stringify(data, null, 2);
}

export default function ScriptPanel({ initialPrompt = "" }) {
  const initializedRef = useRef(false);

  const [idea, setIdea] = useState(initialPrompt || "");
  const [format, setFormat] = useState("short-film");
  const [duration, setDuration] = useState(10);
  const [episodeCount, setEpisodeCount] = useState(1);
  const [dialogueStyle, setDialogueStyle] = useState("auto");

  const [result, setResult] = useState("");
  const [statusText, setStatusText] = useState("Ready");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (initialPrompt && String(initialPrompt).trim()) {
      setIdea(String(initialPrompt).trim());
    }
  }, [initialPrompt]);

  function getDurationHint(currentFormat) {
    if (currentFormat === "short-film") {
      return "30 seconds to 60 minutes";
    }
    if (currentFormat === "feature-film") {
      return "60 to 150 minutes";
    }
    return "Per episode: 1 to 120 minutes";
  }

  async function handleGenerate() {
    try {
      const trimmedIdea = String(idea || "").trim();

      if (!trimmedIdea) {
        setError("Idea is required.");
        return;
      }

      setError("");
      setIsGenerating(true);
      setStatusText("Generating script...");

      const script = await generateScript({
        idea: trimmedIdea,
        format,
        duration: Number(duration),
        episodeCount: Number(episodeCount),
        dialogueStyle,
      });

      if (typeof script === "string") {
        setResult(script);
      } else if (script?.text) {
        setResult(script.text);
      } else {
        setResult("No script text returned.");
      }

      setStatusText("Script generated successfully.");
    } catch (err) {
      setError(err.message || "Script generation failed.");
      setStatusText("Failed.");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(result).catch(() => {});
  }

  function handleExportTxt() {
    if (!result) return;
    downloadTextFile("afrawood-script.txt", result);
  }

  function handleExportJson() {
    const payload = {
      idea,
      format,
      duration,
      episodeCount,
      dialogueStyle,
      result,
    };
    downloadTextFile("afrawood-script.json", buildExportJson(payload));
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>AI Script</div>
          <div style={styles.subtitle}>
            Script generation with landing prompt support
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.sectionTitle}>Input</div>

          <label style={styles.label}>Idea</label>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Describe your story idea..."
            style={styles.textarea}
          />

          <label style={styles.label}>Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            style={styles.select}
          >
            {FORMAT_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <label style={styles.label}>Duration</label>
          <input
            type="number"
            min={format === "series" ? 1 : format === "short-film" ? 0.5 : 60}
            max={format === "series" ? 120 : format === "short-film" ? 60 : 150}
            step={format === "short-film" ? 0.5 : 1}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            style={styles.input}
          />
          <div style={styles.hint}>{getDurationHint(format)}</div>

          {format === "series" && (
            <>
              <label style={styles.label}>Episode Count</label>
              <input
                type="number"
                min={1}
                max={100}
                step={1}
                value={episodeCount}
                onChange={(e) => setEpisodeCount(e.target.value)}
                style={styles.input}
              />
            </>
          )}

          <label style={styles.label}>Dialogue Style</label>
          <select
            value={dialogueStyle}
            onChange={(e) => setDialogueStyle(e.target.value)}
            style={styles.select}
          >
            {DIALOGUE_STYLE_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            style={styles.primaryBtn}
          >
            {isGenerating ? "Generating..." : "Generate Script"}
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.sectionTitle}>Output</div>

          <div style={styles.statusBox}>
            <div>
              <strong>Status:</strong> {statusText}
            </div>
          </div>

          {error ? <div style={styles.errorBox}>{error}</div> : null}

          <textarea
            value={result}
            readOnly
            placeholder="Generated script will appear here..."
            style={styles.resultTextarea}
          />

          <div style={styles.buttonRow}>
            <button type="button" style={styles.secondaryBtn} onClick={handleCopy}>
              Copy
            </button>
            <button
              type="button"
              style={styles.secondaryBtn}
              onClick={handleExportTxt}
            >
              Export TXT
            </button>
            <button
              type="button"
              style={styles.secondaryBtn}
              onClick={handleExportJson}
            >
              Export JSON
            </button>
          </div>
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

  textarea: {
    width: "100%",
    minHeight: 180,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "#050505",
    color: "#fff",
    padding: 14,
    outline: "none",
    resize: "vertical",
  },

  resultTextarea: {
    width: "100%",
    minHeight: 340,
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

  input: {
    width: "100%",
    height: 44,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "#0c0c0c",
    color: "#fff",
    padding: "0 12px",
    outline: "none",
  },

  hint: {
    marginTop: 8,
    color: "#888",
    fontSize: 13,
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
    height: 42,
    padding: "0 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
  },

  buttonRow: {
    marginTop: 14,
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
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
};