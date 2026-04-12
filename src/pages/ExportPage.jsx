import React, { useMemo, useState } from "react";
import { addListItem, downloadTextFile, formatTimestamp, readList, removeListItem, wait } from "../ai/demoStudio.js";
import { createPageStyles } from "../styles/afrawoodPageTheme.js";

const styles = createPageStyles("export-bg.jpg");

const RESOLUTION_OPTIONS = ["1080p", "2K", "4K"];
const FORMAT_OPTIONS = ["MP4", "MOV", "WEBM"];
const FPS_OPTIONS = ["24", "25", "30", "60"];

function buildExportSummary({
  projectName,
  resolution,
  format,
  fps,
  subtitles,
  watermark,
  audioMix,
}) {
  return {
    title: "Export ready",
    lines: [
      `Project: ${projectName || "Afrawood Project"}`,
      `Resolution: ${resolution}`,
      `Format: ${format}`,
      `FPS: ${fps}`,
      `Subtitles: ${subtitles ? "Included" : "Off"}`,
      `Watermark: ${watermark ? "On" : "Off"}`,
      `Audio Mix: ${audioMix ? "Enabled" : "Off"}`,
      `Generated At: ${formatTimestamp()}`,
    ],
  };
}

export default function ExportPage() {
  const [projectName, setProjectName] = useState("Afrawood Final Cut");
  const [resolution, setResolution] = useState("1080p");
  const [format, setFormat] = useState("MP4");
  const [fps, setFps] = useState("24");
  const [subtitles, setSubtitles] = useState(true);
  const [watermark, setWatermark] = useState(false);
  const [audioMix, setAudioMix] = useState(true);
  const [exportStatus, setExportStatus] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(() => readList("export_history"));

  const estimatedSize = useMemo(() => {
    const resolutionFactor = resolution === "4K" ? 4 : resolution === "2K" ? 2 : 1;
    const fpsFactor = fps === "60" ? 2 : fps === "30" ? 1.4 : 1;
    const formatFactor = format === "MOV" ? 1.8 : format === "WEBM" ? 0.9 : 1.2;
    const total = Math.round(350 * resolutionFactor * fpsFactor * formatFactor);
    return `${total} MB`;
  }, [resolution, fps, format]);

  async function handleExport() {
    setExportStatus("Exporting project...");
    await wait(1000);

    const summary = buildExportSummary({
      projectName,
      resolution,
      format,
      fps,
      subtitles,
      watermark,
      audioMix,
    });

    const entry = {
      id: Date.now(),
      projectName,
      resolution,
      format,
      fps,
      subtitles,
      watermark,
      audioMix,
      summary,
    };

    setHistory(addListItem("export_history", entry, 12));
    setResult(summary);
    setExportStatus("Export completed successfully.");
  }

  function handleReset() {
    setProjectName("Afrawood Final Cut");
    setResolution("1080p");
    setFormat("MP4");
    setFps("24");
    setSubtitles(true);
    setWatermark(false);
    setAudioMix(true);
    setExportStatus("");
    setResult(null);
  }

  function handleDownload(target = result) {
    if (!target) return;
    downloadTextFile(
      `${projectName || "afrawood-export"}-summary.txt`,
      `${target.title}\n\n${target.lines.join("\n")}`
    );
  }

  function handleDelete(id) {
    setHistory(removeListItem("export_history", id));
  }

  return (
    <div style={styles.page}>
      <div style={styles.overlay} />

      <div style={styles.wrap}>
        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.heroTitle}>Export</div>

            <div style={styles.heroText}>
              Prepare your final cinematic output with resolution, format, frame rate, subtitles, and export settings.
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project name"
                style={styles.input}
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 14,
                }}
              >
                <select value={resolution} onChange={(e) => setResolution(e.target.value)} style={styles.select}>
                  {RESOLUTION_OPTIONS.map((item) => (
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

                <select value={fps} onChange={(e) => setFps(e.target.value)} style={styles.select}>
                  {FPS_OPTIONS.map((item) => (
                    <option key={item} value={item} style={{ background: "#111" }}>
                      {item} FPS
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 14,
                  marginTop: 4,
                }}
              >
                <label style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.88)" }}>
                  <input type="checkbox" checked={subtitles} onChange={(e) => setSubtitles(e.target.checked)} />
                  Include Subtitles
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.88)" }}>
                  <input type="checkbox" checked={watermark} onChange={(e) => setWatermark(e.target.checked)} />
                  Watermark
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.88)" }}>
                  <input type="checkbox" checked={audioMix} onChange={(e) => setAudioMix(e.target.checked)} />
                  Audio Mix
                </label>
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
                <button type="button" onClick={handleExport} style={styles.primaryButton}>
                  Export Project
                </button>

                <button type="button" onClick={handleReset} style={styles.secondaryButton}>
                  Reset
                </button>
              </div>

              {exportStatus ? (
                <div style={{ ...styles.panel, color: "rgba(255,255,255,0.92)" }}>{exportStatus}</div>
              ) : null}
            </div>
          </div>

          <div style={styles.card}>
            <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 16 }}>Export Summary</div>

            <div style={{ ...styles.panel, minHeight: 260 }}>
              {result ? (
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>{result.title}</div>

                  <div style={{ display: "grid", gap: 10, lineHeight: 1.8, color: "rgba(255,255,255,0.88)" }}>
                    {result.lines.map((line) => (
                      <div key={line}>{line}</div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ color: "rgba(255,255,255,0.66)", fontSize: 16 }}>
                  Final export summary appears here
                </div>
              )}
            </div>

            <div style={{ marginTop: 16, display: "grid", gap: 10, ...styles.infoText }}>
              <div><strong>Project:</strong> {projectName}</div>
              <div><strong>Resolution:</strong> {resolution}</div>
              <div><strong>Format:</strong> {format}</div>
              <div><strong>FPS:</strong> {fps}</div>
              <div><strong>Estimated Size:</strong> {estimatedSize}</div>
            </div>

            <div style={{ marginTop: 18 }}>
              <button
                type="button"
                onClick={() => handleDownload()}
                style={styles.primaryButton}
                disabled={!result}
              >
                Download Export Summary
              </button>
            </div>
          </div>
        </div>

        <div style={{ ...styles.card, marginTop: 20 }}>
          <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 16 }}>Export History</div>

          {history.length === 0 ? (
            <div style={{ color: "rgba(255,255,255,0.66)" }}>No export history yet.</div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {history.map((item) => (
                <div key={item.id} style={styles.panel}>
                  <div style={{ fontWeight: 800, marginBottom: 8 }}>{item.projectName}</div>
                  <div style={styles.infoText}>
                    {item.resolution} • {item.format} • {item.fps} FPS
                  </div>
                  <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      style={styles.secondaryButton}
                      onClick={() => downloadTextFile(
                        `${item.projectName}-summary.txt`,
                        `${item.summary.title}\n\n${item.summary.lines.join("\n")}`
                      )}
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