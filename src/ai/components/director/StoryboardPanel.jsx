import React from "react";
import { useAfraFlow } from "../../core/AfraFlowContext";

export default function StoryboardPanel() {
  const { scenes = [] } = useAfraFlow();

  const shots = (scenes || []).flatMap((scene) => scene.shots || []);

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
        Storyboard
      </div>

      {!shots.length ? (
        <div
          style={{
            opacity: 0.6,
            background: "rgba(255,255,255,0.03)",
            padding: 20,
            borderRadius: 16,
          }}
        >
          No shots available yet.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {shots.map((shot) => (
            <div
              key={shot.id}
              style={{
                background: "#0a0a0a",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                overflow: "hidden",
                display: "grid",
                gap: 10,
              }}
            >
              {/* Image */}
              {shot.imageUrl ? (
                <img
                  src={shot.imageUrl}
                  alt=""
                  style={{
                    width: "100%",
                    height: 180,
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    height: 180,
                    display: "grid",
                    placeItems: "center",
                    fontSize: 12,
                    opacity: 0.5,
                  }}
                >
                  No Image
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
                    opacity: 0.7,
                    lineHeight: 1.6,
                  }}
                >
                  {shot.description || shot.prompt || "No description"}
                </div>

                {/* Video indicator */}
                {shot.videoUrl && (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 11,
                      color: "#14b8c4",
                    }}
                  >
                    🎬 Video Ready
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}