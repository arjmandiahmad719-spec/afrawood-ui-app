import React, { useMemo } from "react";
import { useAfraFlow } from "../../core/AfraFlowContext";

function InfoCard({ title, value }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: 14,
      }}
    >
      <div
        style={{
          fontSize: 12,
          opacity: 0.7,
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 14,
          lineHeight: 1.7,
          color: "#fff",
        }}
      >
        {value || "-"}
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div
      style={{
        fontSize: 18,
        fontWeight: 800,
        color: "#d7b56d",
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div
      style={{
        padding: 18,
        borderRadius: 16,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        color: "rgba(255,255,255,0.6)",
      }}
    >
      {text}
    </div>
  );
}

export default function ProjectPreviewPanel() {
  const {
    title,
    topic,
    genre,
    tone,
    language,
    platform,
    format,
    duration,
    ratio,
    logline,
    synopsis,
    theme,
    visualStyle,
    recommendation,
    endingType,
    endingText,
    characters = [],
    scenes = [],
  } = useAfraFlow();

  const summary = useMemo(() => {
    const safeScenes = Array.isArray(scenes) ? scenes : [];
    const shotCount = safeScenes.reduce(
      (total, scene) => total + (Array.isArray(scene.shots) ? scene.shots.length : 0),
      0
    );
    const imageCount = safeScenes.reduce(
      (total, scene) =>
        total +
        (Array.isArray(scene.shots)
          ? scene.shots.filter((shot) => shot.imageUrl || shot.image).length
          : 0),
      0
    );
    const videoCount = safeScenes.reduce(
      (total, scene) =>
        total +
        (Array.isArray(scene.shots)
          ? scene.shots.filter((shot) => shot.videoUrl || shot.video).length
          : 0),
      0
    );

    return {
      sceneCount: safeScenes.length,
      shotCount,
      imageCount,
      videoCount,
    };
  }, [scenes]);

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
        Project Preview
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        <InfoCard title="Title" value={title || "Untitled Project"} />
        <InfoCard title="Genre" value={genre || "-"} />
        <InfoCard title="Tone" value={tone || "-"} />
        <InfoCard title="Language" value={language || "-"} />
        <InfoCard title="Platform" value={platform || "-"} />
        <InfoCard title="Format" value={format || "-"} />
        <InfoCard title="Duration" value={duration ? `${duration} min` : "-"} />
        <InfoCard title="Ratio" value={ratio || "16:9"} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        <InfoCard title="Scenes" value={String(summary.sceneCount)} />
        <InfoCard title="Shots" value={String(summary.shotCount)} />
        <InfoCard title="Generated Images" value={String(summary.imageCount)} />
        <InfoCard title="Generated Videos" value={String(summary.videoCount)} />
      </div>

      <div
        style={{
          background: "#0a0a0a",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 18,
          padding: 18,
          display: "grid",
          gap: 16,
        }}
      >
        <SectionTitle>Story Summary</SectionTitle>

        <InfoCard title="Topic" value={topic || "-"} />
        <InfoCard title="Logline" value={logline || "-"} />
        <InfoCard title="Synopsis" value={synopsis || "-"} />
        <InfoCard title="Theme" value={theme || "-"} />
        <InfoCard title="Visual Style" value={visualStyle || "-"} />
        <InfoCard title="Recommendation" value={recommendation || "-"} />
        <InfoCard title="Ending Type" value={endingType || "-"} />
        <InfoCard title="Ending Text" value={endingText || "-"} />
      </div>

      <div
        style={{
          background: "#0a0a0a",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 18,
          padding: 18,
        }}
      >
        <SectionTitle>Characters</SectionTitle>

        {!characters.length ? (
          <EmptyState text="No characters available yet." />
        ) : (
          <div
            style={{
              display: "grid",
              gap: 12,
            }}
          >
            {characters.map((character) => (
              <div
                key={character.id || character.name}
                style={{
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(255,255,255,0.02)",
                  padding: 14,
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    color: "#d7b56d",
                    marginBottom: 8,
                  }}
                >
                  {character.name || "Unnamed Character"}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 10,
                  }}
                >
                  <InfoCard title="Role" value={character.role || "-"} />
                  <InfoCard title="Goal" value={character.goal || "-"} />
                  <InfoCard title="Fear" value={character.fear || "-"} />
                  <InfoCard title="Arc" value={character.arc || "-"} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          background: "#0a0a0a",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 18,
          padding: 18,
        }}
      >
        <SectionTitle>Scene Preview</SectionTitle>

        {!scenes.length ? (
          <EmptyState text="No scenes available yet." />
        ) : (
          <div
            style={{
              display: "grid",
              gap: 14,
            }}
          >
            {scenes.map((scene, index) => (
              <div
                key={scene.id || `scene-${index}`}
                style={{
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(255,255,255,0.02)",
                  padding: 16,
                  display: "grid",
                  gap: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 800,
                      color: "#d7b56d",
                      marginBottom: 6,
                    }}
                  >
                    {scene.title || `Scene ${index + 1}`}
                  </div>

                  <div
                    style={{
                      fontSize: 14,
                      lineHeight: 1.7,
                      opacity: 0.86,
                    }}
                  >
                    {scene.description || scene.summary || "No scene description."}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: 10,
                  }}
                >
                  <InfoCard title="Location" value={scene.location || "-"} />
                  <InfoCard title="Time" value={scene.time || "-"} />
                  <InfoCard title="Mood" value={scene.mood || "-"} />
                  <InfoCard title="Lighting" value={scene.lighting || "-"} />
                  <InfoCard title="Palette" value={scene.palette || "-"} />
                  <InfoCard
                    title="Shots"
                    value={String(Array.isArray(scene.shots) ? scene.shots.length : 0)}
                  />
                </div>

                {Array.isArray(scene.shots) && scene.shots.length ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: 12,
                    }}
                  >
                    {scene.shots.map((shot) => (
                      <div
                        key={shot.id}
                        style={{
                          borderRadius: 14,
                          overflow: "hidden",
                          border: "1px solid rgba(255,255,255,0.06)",
                          background: "#050505",
                        }}
                      >
                        {shot.imageUrl || shot.image ? (
                          <img
                            src={shot.imageUrl || shot.image}
                            alt={shot.title || "shot"}
                            style={{
                              width: "100%",
                              height: 150,
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              height: 150,
                              display: "grid",
                              placeItems: "center",
                              color: "rgba(255,255,255,0.45)",
                              fontSize: 12,
                              background: "rgba(255,255,255,0.02)",
                            }}
                          >
                            No image
                          </div>
                        )}

                        <div style={{ padding: 12 }}>
                          <div
                            style={{
                              fontWeight: 700,
                              marginBottom: 6,
                            }}
                          >
                            {shot.title || shot.id}
                          </div>

                          <div
                            style={{
                              fontSize: 13,
                              lineHeight: 1.6,
                              opacity: 0.76,
                              marginBottom: 8,
                            }}
                          >
                            {shot.description || shot.prompt || "No shot description."}
                          </div>

                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              flexWrap: "wrap",
                              fontSize: 11,
                            }}
                          >
                            <span
                              style={{
                                padding: "4px 8px",
                                borderRadius: 999,
                                background: "rgba(20,184,196,0.12)",
                                color: "#7be3eb",
                              }}
                            >
                              {shot.shotType || "shot"}
                            </span>

                            <span
                              style={{
                                padding: "4px 8px",
                                borderRadius: 999,
                                background: "rgba(215,181,109,0.12)",
                                color: "#d7b56d",
                              }}
                            >
                              {shot.cameraAngle || "angle"}
                            </span>

                            {(shot.videoUrl || shot.video) && (
                              <span
                                style={{
                                  padding: "4px 8px",
                                  borderRadius: 999,
                                  background: "rgba(120,255,160,0.12)",
                                  color: "#8df0a9",
                                }}
                              >
                                Video Ready
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}