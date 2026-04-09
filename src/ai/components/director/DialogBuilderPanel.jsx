import React, { useEffect, useRef, useState } from "react";

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

function makeDialogueSeed(prompt) {
  const text = String(prompt || "").trim();
  if (!text) return "";

  return [
    `Director Brief: ${text}`,
    "",
    "Scene 1",
    "Character A: ...",
    "Character B: ...",
    "",
    "Scene Notes:",
    "- Mood:",
    "- Camera:",
    "- Dialogue style:",
  ].join("\n");
}

export default function DialogBuilderPanel({ initialPrompt = "" }) {
  const initializedRef = useRef(false);

  const [directorBrief, setDirectorBrief] = useState(initialPrompt || "");
  const [dialogueText, setDialogueText] = useState("");
  const [notes, setNotes] = useState("");
  const [statusText, setStatusText] = useState("Ready");

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const prompt = String(initialPrompt || "").trim();
    if (prompt) {
      setDirectorBrief(prompt);
      setDialogueText(makeDialogueSeed(prompt));
      setNotes(
        [
          "Imported from Landing",
          `Prompt: ${prompt}`,
          "",
          "Next steps:",
          "- Expand dialogue",
          "- Define scene structure",
          "- Send to Image / Video later",
        ].join("\n")
      );
    }
  }, [initialPrompt]);

  function handleGenerateSeed() {
    const prompt = String(directorBrief || "").trim();
    if (!prompt) {
      setStatusText("Director brief is required.");
      return;
    }

    setDialogueText(makeDialogueSeed(prompt));
    setStatusText("Dialogue seed generated.");
  }

  function handleCopy() {
    const content = String(dialogueText || "").trim();
    if (!content) return;
    navigator.clipboard.writeText(content).catch(() => {});
    setStatusText("Copied.");
  }

  function handleExportTxt() {
    const content = [
      "AFRAWOOD DIRECTOR PANEL",
      "",
      "Director Brief:",
      directorBrief || "-",
      "",
      "Dialogue / Scene Draft:",
      dialogueText || "-",
      "",
      "Notes:",
      notes || "-",
    ].join("\n");

    downloadTextFile("afrawood-director-dialogue.txt", content);
    setStatusText("TXT exported.");
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>Director AI</div>
          <div style={styles.subtitle}>
            Dialogue viewer / builder with landing prompt support
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.sectionTitle}>Director Brief</div>

          <label style={styles.label}>Prompt / Brief</label>
          <textarea
            value={directorBrief}
            onChange={(e) => setDirectorBrief(e.target.value)}
            placeholder="Write the directing brief..."
            style={styles.textarea}
          />

          <button
            type="button"
            style={styles.primaryBtn}
            onClick={handleGenerateSeed}
          >
            Generate Dialogue Seed
          </button>

          <div style={styles.statusBox}>
            <strong>Status:</strong> {statusText}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.sectionTitle}>Notes</div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Director notes..."
            style={styles.textareaTall}
          />
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.sectionTitle}>Dialogue / Scene Draft</div>

        <textarea
          value={dialogueText}
          onChange={(e) => setDialogueText(e.target.value)}
          placeholder="Dialogue draft will appear here..."
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

  textareaTall: {
    width: "100%",
    minHeight: 270,
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
    minHeight: 360,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "#050505",
    color: "#fff",
    padding: 14,
    outline: "none",
    resize: "vertical",
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
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    background: "rgba(255,255,255,0.04)",
    color: "#ddd",
  },
};