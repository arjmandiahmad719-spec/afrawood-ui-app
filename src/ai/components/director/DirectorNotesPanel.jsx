import React from "react";
import { useAfraFlow } from "../../core/AfraFlowContext";

function TextArea({ value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        resize: "vertical",
        background: "#0b0b0b",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: "12px 14px",
        outline: "none",
        fontSize: 14,
        lineHeight: 1.7,
      }}
    />
  );
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

export default function DirectorNotesPanel() {
  const {
    title,
    topic,
    genre,
    tone,
    visualStyle,
    recommendation,
    scenes = [],
    updateScene,
  } = useAfraFlow();

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
        Director Notes
      </div>

      <div
        style={{
          background: "#0a0a0a",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: 16,
          display: "grid",
          gap: 10,
        }}
      >
        <div style={{ fontWeight: 800, color: "#d7b56d" }}>
          Project Overview
        </div>

        <div style={{ fontSize: 14, lineHeight: 1.8, opacity: 0.86 }}>
          <div><strong>Title:</strong> {title || "Untitled Project"}</div>
          <div><strong>Topic:</strong> {topic || "-"}</div>
          <div><strong>Genre:</strong> {genre || "-"}</div>
          <div><strong>Tone:</strong> {tone || "-"}</div>
          <div><strong>Visual Style:</strong> {visualStyle || "-"}</div>
          <div><strong>Platform Note:</strong> {recommendation || "-"}</div>
        </div>
      </div>

      {!scenes.length ? (
        <div
          style={{
            opacity: 0.6,
            background: "rgba(255,255,255,0.03)",
            padding: 18,
            borderRadius: 16,
          }}
        >
          No scenes available.
        </div>
      ) : (
        scenes.map((scene) => (
          <div
            key={scene.id}
            style={{
              background: "#0a0a0a",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
              padding: 16,
              display: "grid",
              gap: 14,
            }}
          >
            <div
              style={{
                fontWeight: 800,
                color: "#d7b56d",
                fontSize: 16,
              }}
            >
              {scene.title || scene.id}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              <div>
                <FieldLabel>Scene Notes</FieldLabel>
                <TextArea
                  rows={4}
                  value={scene.notes || ""}
                  onChange={(value) =>
                    updateScene(scene.id, {
                      notes: value,
                    })
                  }
                  placeholder="Director's notes for blocking, performance, rhythm, emotional direction..."
                />
              </div>

              <div>
                <FieldLabel>Performance Direction</FieldLabel>
                <TextArea
                  rows={4}
                  value={scene.performanceNotes || ""}
                  onChange={(value) =>
                    updateScene(scene.id, {
                      performanceNotes: value,
                    })
                  }
                  placeholder="Actor energy, pacing, silence, emotional intensity..."
                />
              </div>

              <div>
                <FieldLabel>Camera Direction</FieldLabel>
                <TextArea
                  rows={4}
                  value={scene.cameraNotes || ""}
                  onChange={(value) =>
                    updateScene(scene.id, {
                      cameraNotes: value,
                    })
                  }
                  placeholder="Lens feel, movement, framing, push-in, handheld, static..."
                />
              </div>

              <div>
                <FieldLabel>Lighting / Atmosphere Notes</FieldLabel>
                <TextArea
                  rows={4}
                  value={scene.atmosphereNotes || ""}
                  onChange={(value) =>
                    updateScene(scene.id, {
                      atmosphereNotes: value,
                    })
                  }
                  placeholder="Mood, shadows, practical lights, haze, contrast, color feeling..."
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}