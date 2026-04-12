import React, { useMemo, useState } from "react";
import { addListItem, downloadTextFile, readList, removeListItem, wait } from "../ai/demoStudio.js";
import { createPageStyles } from "../styles/afrawoodPageTheme.js";

const styles = createPageStyles("subtitle-bg.jpg");

const LANGUAGE_OPTIONS = ["English", "Persian", "Turkish", "French", "Arabic"];
const FORMAT_OPTIONS = ["SRT", "VTT", "TXT"];

function buildSubtitleResult(transcript) {
  const safeText = String(transcript || "").trim();
  const lines = safeText
    ? safeText.split("\n").filter(Boolean)
    : [
        "Welcome to Afrawood.",
        "This is a cinematic subtitle preview.",
        "Your generated subtitles appear here.",
      ];

  return lines.slice(0, 6).map((line, index) => {
    const start = `00:00:${String(index * 3).padStart(2, "0")},000`;
    const end = `00:00:${String(index * 3 + 2).padStart(2, "0")},500`;

    return `${index + 1}
${start} --> ${end}
${line}`;
  }).join("\n\n");
}

export default function SubtitleGeneratorPage() {
  const [transcript, setTranscript] = useState("");
  const [language, setLanguage] = useState("English");
  const [format, setFormat] = useState("SRT");
  const [fileName, setFileName] = useState("afrawood-subtitles");
  const [result, setResult] = useState("");
  const [history, setHistory] = useState(() => readList("subtitle_history"));

  const lineCount = useMemo(() => {
    return String(transcript || "").split("\n").filter(Boolean).length;
  }, [transcript]);

  async function handleGenerateSubtitles() {
    await wait(700);
    const generated = buildSubtitleResult(transcript);
    setResult(generated);

    const entry = {
      id: Date.now(),
      language,
      format,
      fileName,
      subtitles: generated,
    };

    setHistory(addListItem("subtitle_history", entry, 12));
  }

  function handleReset() {
    setTranscript("");
    setLanguage("English");
    setFormat("SRT");
    setFileName("afrawood-subtitles");
    setResult("");
  }

  function handleDownload(content = result, targetFileName = fileName, targetFormat = format) {
    if (!content) return;
    const extension = String(targetFormat || "SRT").toLowerCase();
    downloadTextFile(`${targetFileName || "afrawood-subtitles"}.${extension}`, content);
  }

  function handleDelete(id) {
    setHistory(removeListItem("subtitle_history", id));
  }

  return (
    <div style={styles.page}>
      <div style={styles.overlay} />

      <div style={styles.wrap}>
        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.heroTitle}>Subtitle Generator</div>

            <div style={styles.heroText}>
              Generate subtitle files for videos, interviews, dialogue scenes, and cinematic content.
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste transcript or dialogue text here..."
                style={{ ...styles.textarea, minHeight: 220 }}
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 14,
                }}
              >
                <select value={language} onChange={(e) => setLanguage(e.target.value)} style={styles.select}>
                  {LANGUAGE_OPTIONS.map((item) => (
                    <option key={item} value={item} style={{ background: "#111" }}>
                      {item}
                    </option>
                  ))}
                </select>

                <select value={format} onChange={(e) => setFormat(e.target.value)} style={styles.select}>
                  {FORMAT_OPTIONS.map((item) => (
                    <option key={item} value={item} style={{ background: "#111" }}>
                      {item}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="File name"
                  style={styles.input}
                />
              </div>

              <div style={styles.mutedText}>Transcript lines: {lineCount}</div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button type="button" onClick={handleGenerateSubtitles} style={styles.primaryButton}>
                  Generate Subtitles
                </button>

                <button type="button" onClick={handleReset} style={styles.secondaryButton}>
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
                minHeight: 320,
                whiteSpace: "pre-wrap",
                lineHeight: 1.8,
                color: "rgba(255,255,255,0.88)",
                overflow: "auto",
              }}
            >
              {result || "Generated subtitle preview appears here"}
            </div>

            <div style={{ marginTop: 18 }}>
              <button
                type="button"
                onClick={() => handleDownload()}
                style={styles.primaryButton}
                disabled={!result}
              >
                Download Subtitles
              </button>
            </div>
          </div>
        </div>

        <div style={{ ...styles.card, marginTop: 20 }}>
          <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 16 }}>Subtitle History</div>

          {history.length === 0 ? (
            <div style={{ color: "rgba(255,255,255,0.66)" }}>No subtitle history yet.</div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {history.map((item) => (
                <div key={item.id} style={styles.panel}>
                  <div style={{ fontWeight: 800, marginBottom: 8 }}>
                    {item.fileName}.{String(item.format).toLowerCase()}
                  </div>
                  <div style={styles.infoText}>
                    {item.language} • {item.format}
                  </div>
                  <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      style={styles.secondaryButton}
                      onClick={() => handleDownload(item.subtitles, item.fileName, item.format)}
                    >
                      Download
                    </button>
                    <button
                      type="button"
                      style={styles.secondaryButton}
                      onClick={() => handleDelete(item.id)}
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