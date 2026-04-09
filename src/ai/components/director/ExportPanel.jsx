import React, { useMemo, useState } from "react";
import { useAfraFlow } from "../../core/AfraFlowContext";

function downloadTextFile(filename, content, mimeType = "application/json;charset=utf-8") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeText(value, fallback = "") {
  return String(value ?? fallback);
}

function FieldLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 12,
        opacity: 0.72,
        marginBottom: 6,
      }}
    >
      {children}
    </div>
  );
}

function ActionButton({ children, onClick, disabled = false, variant = "primary" }) {
  const isPrimary = variant === "primary";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        border: "none",
        borderRadius: 12,
        padding: "11px 14px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        fontWeight: 800,
        color: isPrimary ? "#071113" : "#d7b56d",
        background: isPrimary
          ? "linear-gradient(135deg, #14b8c4, #d7b56d)"
          : "rgba(255,255,255,0.05)",
      }}
    >
      {children}
    </button>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "12px 14px",
        borderRadius: 12,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        cursor: "pointer",
      }}
    >
      <span style={{ fontSize: 14, lineHeight: 1.6 }}>{label}</span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{
          width: 18,
          height: 18,
          accentColor: "#14b8c4",
          cursor: "pointer",
        }}
      />
    </label>
  );
}

function buildProjectJson(data, options) {
  const includeImages = !!options.includeImages;
  const includeVideos = !!options.includeVideos;
  const includeDialogue = !!options.includeDialogue;
  const includeNotes = !!options.includeNotes;

  return {
    title: data.title || "",
    topic: data.topic || "",
    genre: data.genre || "",
    tone: data.tone || "",
    language: data.language || "",
    platform: data.platform || "",
    format: data.format || "",
    duration: data.duration || "",
    ratio: data.ratio || "",
    logline: data.logline || "",
    synopsis: data.synopsis || "",
    theme: data.theme || "",
    visualStyle: data.visualStyle || "",
    recommendation: data.recommendation || "",
    endingType: data.endingType || "",
    endingText: data.endingText || "",
    narration: data.narration || "",
    characters: safeArray(data.characters),
    outline: safeArray(data.outline),
    scenes: safeArray(data.scenes).map((scene) => ({
      id: scene.id || "",
      title: scene.title || "",
      description: scene.description || "",
      summary: scene.summary || "",
      location: scene.location || "",
      time: scene.time || "",
      mood: scene.mood || "",
      lighting: scene.lighting || "",
      palette: scene.palette || "",
      cameraStyle: scene.cameraStyle || "",
      tension: scene.tension || "",
      notes: includeNotes ? scene.notes || "" : "",
      performanceNotes: includeNotes ? scene.performanceNotes || "" : "",
      cameraNotes: includeNotes ? scene.cameraNotes || "" : "",
      atmosphereNotes: includeNotes ? scene.atmosphereNotes || "" : "",
      dialogue: includeDialogue ? safeArray(scene.dialogue) : [],
      shots: safeArray(scene.shots).map((shot) => ({
        id: shot.id || "",
        title: shot.title || "",
        description: shot.description || "",
        prompt: shot.prompt || "",
        negativePrompt: shot.negativePrompt || "",
        shotType: shot.shotType || "",
        cameraAngle: shot.cameraAngle || "",
        lighting: shot.lighting || "",
        mood: shot.mood || "",
        environment: shot.environment || "",
        style: shot.style || "",
        ratio: shot.ratio || "",
        seed: shot.seed || "",
        seedLocked: !!shot.seedLocked,
        referenceStrength:
          typeof shot.referenceStrength === "number" ? shot.referenceStrength : 0.6,
        imageUrl: includeImages ? shot.imageUrl || shot.image || "" : "",
        videoUrl: includeVideos ? shot.videoUrl || shot.video || "" : "",
        imageMeta: includeImages ? shot.imageMeta || null : null,
        videoMeta: includeVideos ? shot.videoMeta || null : null,
        dialogue: includeDialogue ? safeArray(shot.dialogue) : [],
        notes: includeNotes ? shot.notes || "" : "",
      })),
    })),
    meta: data.meta || {},
    exportedAt: new Date().toISOString(),
    exportOptions: {
      includeImages,
      includeVideos,
      includeDialogue,
      includeNotes,
    },
  };
}

function buildReadableText(data, options) {
  const lines = [];

  lines.push(`# ${safeText(data.title, "Untitled Project")}`);
  lines.push("");
  lines.push(`Topic: ${safeText(data.topic, "-")}`);
  lines.push(`Genre: ${safeText(data.genre, "-")}`);
  lines.push(`Tone: ${safeText(data.tone, "-")}`);
  lines.push(`Language: ${safeText(data.language, "-")}`);
  lines.push(`Platform: ${safeText(data.platform, "-")}`);
  lines.push(`Format: ${safeText(data.format, "-")}`);
  lines.push(`Duration: ${safeText(data.duration, "-")}`);
  lines.push(`Ratio: ${safeText(data.ratio, "-")}`);
  lines.push("");

  if (data.logline) {
    lines.push("## Logline");
    lines.push(data.logline);
    lines.push("");
  }

  if (data.synopsis) {
    lines.push("## Synopsis");
    lines.push(data.synopsis);
    lines.push("");
  }

  if (data.theme) {
    lines.push("## Theme");
    lines.push(data.theme);
    lines.push("");
  }

  if (data.visualStyle) {
    lines.push("## Visual Style");
    lines.push(data.visualStyle);
    lines.push("");
  }

  if (data.recommendation) {
    lines.push("## Recommendation");
    lines.push(data.recommendation);
    lines.push("");
  }

  if (safeArray(data.characters).length) {
    lines.push("## Characters");
    safeArray(data.characters).forEach((character, index) => {
      lines.push(`${index + 1}. ${safeText(character.name, "Unnamed Character")}`);
      lines.push(`   Role: ${safeText(character.role, "-")}`);
      lines.push(`   Goal: ${safeText(character.goal, "-")}`);
      lines.push(`   Fear: ${safeText(character.fear, "-")}`);
      lines.push(`   Arc: ${safeText(character.arc, "-")}`);
      lines.push("");
    });
  }

  lines.push("## Scenes");

  safeArray(data.scenes).forEach((scene, sceneIndex) => {
    lines.push(`### ${scene.title || `Scene ${sceneIndex + 1}`}`);
    lines.push(safeText(scene.description || scene.summary || "-", "-"));
    lines.push("");
    lines.push(`Location: ${safeText(scene.location, "-")}`);
    lines.push(`Time: ${safeText(scene.time, "-")}`);
    lines.push(`Mood: ${safeText(scene.mood, "-")}`);
    lines.push(`Lighting: ${safeText(scene.lighting, "-")}`);
    lines.push(`Palette: ${safeText(scene.palette, "-")}`);
    lines.push(`Tension: ${safeText(scene.tension, "-")}`);
    lines.push("");

    if (options.includeNotes) {
      if (scene.notes) {
        lines.push(`Scene Notes: ${scene.notes}`);
      }
      if (scene.performanceNotes) {
        lines.push(`Performance Notes: ${scene.performanceNotes}`);
      }
      if (scene.cameraNotes) {
        lines.push(`Camera Notes: ${scene.cameraNotes}`);
      }
      if (scene.atmosphereNotes) {
        lines.push(`Atmosphere Notes: ${scene.atmosphereNotes}`);
      }
      if (scene.notes || scene.performanceNotes || scene.cameraNotes || scene.atmosphereNotes) {
        lines.push("");
      }
    }

    if (options.includeDialogue && safeArray(scene.dialogue).length) {
      lines.push("Scene Dialogue:");
      safeArray(scene.dialogue).forEach((line) => {
        lines.push(`- ${safeText(line.character, "Character")}: ${safeText(line.line, "")}`);
      });
      lines.push("");
    }

    lines.push("Shots:");
    safeArray(scene.shots).forEach((shot, shotIndex) => {
      lines.push(`- ${shot.title || `Shot ${shotIndex + 1}`}`);
      lines.push(`  Description: ${safeText(shot.description || shot.prompt, "-")}`);
      lines.push(`  Shot Type: ${safeText(shot.shotType, "-")}`);
      lines.push(`  Camera Angle: ${safeText(shot.cameraAngle, "-")}`);
      lines.push(`  Mood: ${safeText(shot.mood, "-")}`);
      lines.push(`  Lighting: ${safeText(shot.lighting, "-")}`);
      lines.push(`  Environment: ${safeText(shot.environment, "-")}`);

      if (options.includeImages && (shot.imageUrl || shot.image)) {
        lines.push(`  Image URL: ${safeText(shot.imageUrl || shot.image, "")}`);
      }

      if (options.includeVideos && (shot.videoUrl || shot.video)) {
        lines.push(`  Video URL: ${safeText(shot.videoUrl || shot.video, "")}`);
      }

      if (options.includeDialogue && safeArray(shot.dialogue).length) {
        lines.push("  Dialogue:");
        safeArray(shot.dialogue).forEach((line) => {
          const lineText = line.line ?? line.text ?? "";
          lines.push(`    - ${safeText(line.character, "Character")}: ${safeText(lineText, "")}`);
        });
      }

      if (options.includeNotes && shot.notes) {
        lines.push(`  Notes: ${shot.notes}`);
      }

      lines.push("");
    });
  });

  return lines.join("\n");
}

export default function ExportPanel() {
  const flow = useAfraFlow();
  const [options, setOptions] = useState({
    includeImages: true,
    includeVideos: true,
    includeDialogue: true,
    includeNotes: true,
  });

  const sceneCount = safeArray(flow.scenes).length;
  const shotCount = useMemo(
    () =>
      safeArray(flow.scenes).reduce(
        (total, scene) => total + safeArray(scene.shots).length,
        0
      ),
    [flow.scenes]
  );

  const canExport = sceneCount > 0 || !!flow.title || !!flow.topic || !!flow.logline;

  const handleExportJson = () => {
    const payload = buildProjectJson(flow, options);
    const filename = `${safeText(flow.title, "afrawood-project")
      .trim()
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, "_") || "afrawood-project"}.json`;

    downloadTextFile(filename, JSON.stringify(payload, null, 2));
  };

  const handleExportTxt = () => {
    const content = buildReadableText(flow, options);
    const filename = `${safeText(flow.title, "afrawood-project")
      .trim()
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, "_") || "afrawood-project"}.txt`;

    downloadTextFile(filename, content, "text/plain;charset=utf-8");
  };

  return (
    <div
      style={{
        padding: 20,
        display: "grid",
        gap: 20,
      }}
    >
      <div
        style={{
          fontSize: 20,
          fontWeight: 800,
          color: "#d7b56d",
        }}
      >
        Export Panel
      </div>

      <div
        style={{
          background: "#0a0a0a",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 18,
          padding: 18,
          display: "grid",
          gap: 14,
        }}
      >
        <div
          style={{
            fontWeight: 800,
            color: "#d7b56d",
          }}
        >
          Project Summary
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
          }}
        >
          <div
            style={{
              padding: 14,
              borderRadius: 14,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <FieldLabel>Title</FieldLabel>
            <div style={{ lineHeight: 1.7 }}>{flow.title || "Untitled Project"}</div>
          </div>

          <div
            style={{
              padding: 14,
              borderRadius: 14,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <FieldLabel>Scenes</FieldLabel>
            <div style={{ lineHeight: 1.7 }}>{sceneCount}</div>
          </div>

          <div
            style={{
              padding: 14,
              borderRadius: 14,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <FieldLabel>Shots</FieldLabel>
            <div style={{ lineHeight: 1.7 }}>{shotCount}</div>
          </div>

          <div
            style={{
              padding: 14,
              borderRadius: 14,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <FieldLabel>Format</FieldLabel>
            <div style={{ lineHeight: 1.7 }}>{flow.format || "-"}</div>
          </div>
        </div>
      </div>

      <div
        style={{
          background: "#0a0a0a",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 18,
          padding: 18,
          display: "grid",
          gap: 12,
        }}
      >
        <div
          style={{
            fontWeight: 800,
            color: "#d7b56d",
          }}
        >
          Export Options
        </div>

        <ToggleRow
          label="Include generated image links and image metadata"
          checked={options.includeImages}
          onChange={(value) =>
            setOptions((prev) => ({
              ...prev,
              includeImages: value,
            }))
          }
        />

        <ToggleRow
          label="Include generated video links and video metadata"
          checked={options.includeVideos}
          onChange={(value) =>
            setOptions((prev) => ({
              ...prev,
              includeVideos: value,
            }))
          }
        />

        <ToggleRow
          label="Include dialogue"
          checked={options.includeDialogue}
          onChange={(value) =>
            setOptions((prev) => ({
              ...prev,
              includeDialogue: value,
            }))
          }
        />

        <ToggleRow
          label="Include director notes and production notes"
          checked={options.includeNotes}
          onChange={(value) =>
            setOptions((prev) => ({
              ...prev,
              includeNotes: value,
            }))
          }
        />
      </div>

      <div
        style={{
          background: "#0a0a0a",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 18,
          padding: 18,
          display: "grid",
          gap: 12,
        }}
      >
        <div
          style={{
            fontWeight: 800,
            color: "#d7b56d",
          }}
        >
          Export Actions
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <ActionButton onClick={handleExportJson} disabled={!canExport}>
            Export JSON
          </ActionButton>

          <ActionButton
            variant="secondary"
            onClick={handleExportTxt}
            disabled={!canExport}
          >
            Export TXT
          </ActionButton>
        </div>

        <div
          style={{
            fontSize: 13,
            lineHeight: 1.7,
            opacity: 0.72,
          }}
        >
          JSON is best for re-import, development, and structured storage. TXT is better for
          reading, sharing, and quick review.
        </div>
      </div>
    </div>
  );
}