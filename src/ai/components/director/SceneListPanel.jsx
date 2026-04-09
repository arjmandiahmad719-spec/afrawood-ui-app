import React, { useMemo, useState } from "react";
import { useAfraFlow } from "../../core/AfraFlowContext";

function createSceneTemplate(index) {
  return {
    id: `scene-${Date.now()}-${index}`,
    title: `Scene ${index}`,
    description: "",
    summary: "",
    location: "",
    time: "",
    mood: "",
    lighting: "",
    palette: "",
    cameraStyle: "",
    tension: "",
    dialogue: [],
    shots: [
      {
        id: `shot-${Date.now()}-${index}-1`,
        title: "Shot 1",
        description: "",
        prompt: "",
        negativePrompt: "",
        shotType: "medium",
        cameraAngle: "eye level",
        lighting: "",
        mood: "",
        environment: "",
        style: "",
        ratio: "16:9",
        seed: "",
        seedLocked: false,
        referenceImage: null,
        referenceStrength: 0.6,
        image: "",
        imageUrl: "",
        imageMeta: null,
        video: "",
        videoUrl: "",
        videoMeta: null,
        dialogue: [],
        notes: "",
      },
    ],
  };
}

function SectionTitle({ children }) {
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

function TextInput({ value, onChange, placeholder }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        background: "#0b0b0b",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 12,
        padding: "11px 12px",
        outline: "none",
      }}
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }) {
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
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 12,
        padding: "11px 12px",
        outline: "none",
      }}
    />
  );
}

function ActionButton({ children, onClick, variant = "primary", disabled = false }) {
  const primary = variant === "primary";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        border: "none",
        borderRadius: 12,
        padding: "10px 14px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        fontWeight: 800,
        color: primary ? "#071113" : "#d7b56d",
        background: primary
          ? "linear-gradient(135deg, #14b8c4, #d7b56d)"
          : "rgba(255,255,255,0.05)",
      }}
    >
      {children}
    </button>
  );
}

export default function SceneListPanel() {
  const {
    scenes = [],
    replaceScenes,
    addScene,
    removeScene,
    updateScene,
    addShotToScene,
    removeShotFromScene,
  } = useAfraFlow();

  const [expandedId, setExpandedId] = useState(scenes[0]?.id || "");

  const normalizedScenes = useMemo(() => {
    return Array.isArray(scenes) ? scenes : [];
  }, [scenes]);

  const handleAddScene = () => {
    const nextIndex = normalizedScenes.length + 1;
    const scene = createSceneTemplate(nextIndex);
    addScene(scene);
    setExpandedId(scene.id);
  };

  const handleDuplicateScene = (scene) => {
    const nextIndex = normalizedScenes.length + 1;
    const cloned = {
      ...scene,
      id: `scene-${Date.now()}-${nextIndex}`,
      title: scene.title ? `${scene.title} Copy` : `Scene ${nextIndex}`,
      shots: Array.isArray(scene.shots)
        ? scene.shots.map((shot, shotIndex) => ({
            ...shot,
            id: `shot-${Date.now()}-${nextIndex}-${shotIndex + 1}`,
            title: shot.title || `Shot ${shotIndex + 1}`,
          }))
        : [],
    };

    addScene(cloned);
    setExpandedId(cloned.id);
  };

  const handleMoveScene = (sceneId, direction) => {
    const currentIndex = normalizedScenes.findIndex((scene) => scene.id === sceneId);
    if (currentIndex < 0) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= normalizedScenes.length) return;

    const next = [...normalizedScenes];
    const temp = next[currentIndex];
    next[currentIndex] = next[targetIndex];
    next[targetIndex] = temp;

    replaceScenes(
      next.map((scene, index) => ({
        ...scene,
        title: scene.title || `Scene ${index + 1}`,
      }))
    );
  };

  const handleRemoveScene = (sceneId) => {
    removeScene(sceneId);

    if (expandedId === sceneId) {
      const remaining = normalizedScenes.filter((scene) => scene.id !== sceneId);
      setExpandedId(remaining[0]?.id || "");
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gap: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              color: "#d7b56d",
              fontSize: 20,
              fontWeight: 800,
              marginBottom: 4,
            }}
          >
            Scene List
          </div>
          <div
            style={{
              opacity: 0.72,
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            Manage scenes, story beats, locations, mood, and scene-level shot blocks.
          </div>
        </div>

        <ActionButton onClick={handleAddScene}>Add Scene</ActionButton>
      </div>

      {!normalizedScenes.length ? (
        <div
          style={{
            borderRadius: 18,
            padding: 18,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.65)",
          }}
        >
          No scenes found.
        </div>
      ) : null}

      {normalizedScenes.map((scene, index) => {
        const isExpanded = expandedId === scene.id;

        return (
          <div
            key={scene.id}
            style={{
              borderRadius: 22,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(77,208,225,0.12)",
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => setExpandedId(isExpanded ? "" : scene.id)}
              style={{
                width: "100%",
                border: "none",
                background: "transparent",
                color: "#fff",
                cursor: "pointer",
                textAlign: "left",
                padding: 18,
                display: "grid",
                gap: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    color: "#d7b56d",
                    fontWeight: 800,
                    fontSize: 18,
                  }}
                >
                  {scene.title || `Scene ${index + 1}`}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    opacity: 0.72,
                  }}
                >
                  {Array.isArray(scene.shots) ? scene.shots.length : 0} shot
                  {Array.isArray(scene.shots) && scene.shots.length !== 1 ? "s" : ""}
                </div>
              </div>

              <div
                style={{
                  opacity: 0.78,
                  lineHeight: 1.7,
                  fontSize: 14,
                }}
              >
                {scene.description || scene.summary || "No scene description yet."}
              </div>
            </button>

            {isExpanded ? (
              <div
                style={{
                  padding: "0 18px 18px",
                  display: "grid",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <div>
                    <SectionTitle>Scene Title</SectionTitle>
                    <TextInput
                      value={scene.title || ""}
                      onChange={(value) => updateScene(scene.id, { title: value })}
                      placeholder={`Scene ${index + 1}`}
                    />
                  </div>

                  <div>
                    <SectionTitle>Location</SectionTitle>
                    <TextInput
                      value={scene.location || ""}
                      onChange={(value) => updateScene(scene.id, { location: value })}
                      placeholder="Interior house / street / rooftop..."
                    />
                  </div>

                  <div>
                    <SectionTitle>Time</SectionTitle>
                    <TextInput
                      value={scene.time || ""}
                      onChange={(value) => updateScene(scene.id, { time: value })}
                      placeholder="Day / Night / Dawn..."
                    />
                  </div>

                  <div>
                    <SectionTitle>Mood</SectionTitle>
                    <TextInput
                      value={scene.mood || ""}
                      onChange={(value) => updateScene(scene.id, { mood: value })}
                      placeholder="Dark / emotional / tense..."
                    />
                  </div>

                  <div>
                    <SectionTitle>Lighting</SectionTitle>
                    <TextInput
                      value={scene.lighting || ""}
                      onChange={(value) => updateScene(scene.id, { lighting: value })}
                      placeholder="Low key / natural / contrast..."
                    />
                  </div>

                  <div>
                    <SectionTitle>Palette</SectionTitle>
                    <TextInput
                      value={scene.palette || ""}
                      onChange={(value) => updateScene(scene.id, { palette: value })}
                      placeholder="Cold blue / warm gold / muted..."
                    />
                  </div>
                </div>

                <div>
                  <SectionTitle>Description</SectionTitle>
                  <TextArea
                    rows={4}
                    value={scene.description || ""}
                    onChange={(value) => updateScene(scene.id, { description: value, summary: value })}
                    placeholder="Describe the dramatic purpose of this scene..."
                  />
                </div>

                <div>
                  <SectionTitle>Tension</SectionTitle>
                  <TextArea
                    rows={3}
                    value={scene.tension || ""}
                    onChange={(value) => updateScene(scene.id, { tension: value })}
                    placeholder="What is the conflict or pressure in this scene?"
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  <ActionButton
                    variant="secondary"
                    onClick={() => handleMoveScene(scene.id, "up")}
                    disabled={index === 0}
                  >
                    Move Up
                  </ActionButton>

                  <ActionButton
                    variant="secondary"
                    onClick={() => handleMoveScene(scene.id, "down")}
                    disabled={index === normalizedScenes.length - 1}
                  >
                    Move Down
                  </ActionButton>

                  <ActionButton
                    variant="secondary"
                    onClick={() => handleDuplicateScene(scene)}
                  >
                    Duplicate Scene
                  </ActionButton>

                  <ActionButton
                    variant="secondary"
                    onClick={() =>
                      addShotToScene(scene.id, {
                        id: `shot-${Date.now()}-${scene.id}-${(scene.shots?.length || 0) + 1}`,
                        title: `Shot ${(scene.shots?.length || 0) + 1}`,
                        environment: scene.location || "",
                        mood: scene.mood || "",
                        lighting: scene.lighting || "",
                        style: scene.palette || "",
                      })
                    }
                  >
                    Add Shot
                  </ActionButton>

                  <ActionButton
                    variant="secondary"
                    onClick={() => handleRemoveScene(scene.id)}
                    disabled={normalizedScenes.length <= 1}
                  >
                    Delete Scene
                  </ActionButton>
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      color: "#d7b56d",
                      fontWeight: 800,
                    }}
                  >
                    Scene Shots
                  </div>

                  {!scene.shots?.length ? (
                    <div
                      style={{
                        opacity: 0.65,
                        fontSize: 14,
                      }}
                    >
                      No shots in this scene.
                    </div>
                  ) : (
                    scene.shots.map((shot, shotIndex) => (
                      <div
                        key={shot.id}
                        style={{
                          display: "grid",
                          gap: 10,
                          border: "1px solid rgba(255,255,255,0.07)",
                          background: "#0a0a0a",
                          borderRadius: 16,
                          padding: 14,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 12,
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 800,
                            }}
                          >
                            {shot.title || `Shot ${shotIndex + 1}`}
                          </div>

                          <ActionButton
                            variant="secondary"
                            onClick={() => removeShotFromScene(scene.id, shot.id)}
                            disabled={(scene.shots?.length || 0) <= 1}
                          >
                            Remove Shot
                          </ActionButton>
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: 10,
                          }}
                        >
                          <div>
                            <SectionTitle>Shot Title</SectionTitle>
                            <TextInput
                              value={shot.title || ""}
                              onChange={(value) =>
                                updateScene(scene.id, {
                                  shots: scene.shots.map((item) =>
                                    item.id === shot.id ? { ...item, title: value } : item
                                  ),
                                })
                              }
                              placeholder={`Shot ${shotIndex + 1}`}
                            />
                          </div>

                          <div>
                            <SectionTitle>Shot Type</SectionTitle>
                            <TextInput
                              value={shot.shotType || ""}
                              onChange={(value) =>
                                updateScene(scene.id, {
                                  shots: scene.shots.map((item) =>
                                    item.id === shot.id ? { ...item, shotType: value } : item
                                  ),
                                })
                              }
                              placeholder="wide / medium / close-up"
                            />
                          </div>

                          <div>
                            <SectionTitle>Camera Angle</SectionTitle>
                            <TextInput
                              value={shot.cameraAngle || ""}
                              onChange={(value) =>
                                updateScene(scene.id, {
                                  shots: scene.shots.map((item) =>
                                    item.id === shot.id ? { ...item, cameraAngle: value } : item
                                  ),
                                })
                              }
                              placeholder="eye level / low angle / top shot"
                            />
                          </div>
                        </div>

                        <div>
                          <SectionTitle>Shot Description / Prompt Base</SectionTitle>
                          <TextArea
                            rows={3}
                            value={shot.description || ""}
                            onChange={(value) =>
                              updateScene(scene.id, {
                                shots: scene.shots.map((item) =>
                                  item.id === shot.id
                                    ? {
                                        ...item,
                                        description: value,
                                        prompt: item.prompt || value,
                                      }
                                    : item
                                ),
                              })
                            }
                            placeholder="Describe what happens in this shot..."
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}