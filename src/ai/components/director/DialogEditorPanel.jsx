import React from "react";
import { useAfraFlow } from "../../core/AfraFlowContext";

function TextArea({ value, onChange, placeholder }) {
  return (
    <textarea
      rows={3}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        resize: "vertical",
        background: "#0b0b0b",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10,
        padding: "10px 12px",
        outline: "none",
        fontSize: 14,
        lineHeight: 1.6,
      }}
    />
  );
}

function ActionButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: "none",
        borderRadius: 10,
        padding: "8px 12px",
        cursor: "pointer",
        fontWeight: 700,
        fontSize: 12,
        color: "#071113",
        background: "linear-gradient(135deg, #14b8c4, #d7b56d)",
      }}
    >
      {children}
    </button>
  );
}

export default function DialogEditorPanel() {
  const { scenes = [], updateScene } = useAfraFlow();

  const updateShotDialog = (sceneId, shotId, newDialogue) => {
    updateScene(sceneId, {
      shots: scenes
        .find((s) => s.id === sceneId)
        ?.shots.map((shot) =>
          shot.id === shotId ? { ...shot, dialogue: newDialogue } : shot
        ),
    });
  };

  const addLine = (sceneId, shot) => {
    const next = [...(shot.dialogue || []), { character: "", text: "" }];
    updateShotDialog(sceneId, shot.id, next);
  };

  const removeLine = (sceneId, shot, index) => {
    const next = (shot.dialogue || []).filter((_, i) => i !== index);
    updateShotDialog(sceneId, shot.id, next);
  };

  const updateLine = (sceneId, shot, index, key, value) => {
    const next = (shot.dialogue || []).map((line, i) =>
      i === index ? { ...line, [key]: value } : line
    );
    updateShotDialog(sceneId, shot.id, next);
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
        Dialogue Editor
      </div>

      {!scenes.length ? (
        <div style={{ opacity: 0.6 }}>No scenes available.</div>
      ) : (
        scenes.map((scene) => (
          <div
            key={scene.id}
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
              padding: 16,
              background: "#0a0a0a",
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
              {scene.title}
            </div>

            {(scene.shots || []).map((shot) => (
              <div
                key={shot.id}
                style={{
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: 12,
                  padding: 12,
                  display: "grid",
                  gap: 10,
                }}
              >
                <div style={{ fontWeight: 700 }}>
                  {shot.title || shot.id}
                </div>

                {(shot.dialogue || []).map((line, index) => (
                  <div
                    key={index}
                    style={{
                      display: "grid",
                      gap: 6,
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      paddingBottom: 8,
                    }}
                  >
                    <input
                      value={line.character || ""}
                      onChange={(e) =>
                        updateLine(
                          scene.id,
                          shot,
                          index,
                          "character",
                          e.target.value
                        )
                      }
                      placeholder="Character"
                      style={{
                        background: "#111",
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 8,
                        padding: "6px 8px",
                      }}
                    />

                    <TextArea
                      value={line.text || ""}
                      onChange={(value) =>
                        updateLine(scene.id, shot, index, "text", value)
                      }
                      placeholder="Dialogue line..."
                    />

                    <ActionButton
                      onClick={() => removeLine(scene.id, shot, index)}
                    >
                      Remove
                    </ActionButton>
                  </div>
                ))}

                <ActionButton onClick={() => addLine(scene.id, shot)}>
                  + Add Dialogue
                </ActionButton>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}