import React from "react";
import {
  cinematicCardStyle,
  cinematicOverlayStyle,
  cinematicPageStyle,
  cinematicWrapStyle,
} from "../styles/pageBackground.js";

const CHIP_STYLE = {
  display: "inline-flex",
  alignItems: "center",
  height: 34,
  padding: "0 14px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  color: "rgba(255,255,255,0.82)",
  fontSize: 13,
  fontWeight: 700,
};

const TEXT_STYLE = {
  margin: 0,
  fontSize: 17,
  color: "rgba(255,255,255,0.92)",
  lineHeight: 1.9,
};

const BOX_STYLE = {
  borderRadius: 22,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(10,10,10,0.28)",
  padding: 18,
};

export default function AboutPage() {
  return (
    <div style={cinematicPageStyle}>
      <div style={cinematicOverlayStyle} />

      <div style={cinematicWrapStyle}>
        <div style={{ ...cinematicCardStyle, overflow: "hidden" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.05fr 0.95fr",
              gap: 26,
              padding: 34,
              boxSizing: "border-box",
              borderBottom: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <div>
              <div style={CHIP_STYLE}>About Us</div>
              <div style={{ fontSize: 46, fontWeight: 900, marginTop: 18, marginBottom: 14 }}>
                Afrawood
              </div>
              <p style={TEXT_STYLE}>
                A cinematic AI studio built to turn ideas into stories, scenes, shots, images,
                voices, music, and final videos in one controlled workflow.
              </p>
            </div>

            <div
              style={{
                borderRadius: 24,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(10,10,10,0.22)",
                minHeight: 240,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 14,
                boxSizing: "border-box",
              }}
            >
              <img
                src="/logo.png"
                alt="Afrawood"
                style={{
                  width: "100%",
                  maxWidth: 340,
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.05fr 0.95fr",
              gap: 26,
              padding: 34,
              boxSizing: "border-box",
            }}
          >
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 16 }}>
                Why Afrawood exists
              </div>

              <p style={TEXT_STYLE}>
                Afrawood was created to solve a real production problem: creators and filmmakers
                need a single place where cinematic writing, directing, imaging, voice, music,
                and final output can happen together with control, speed, and professional quality.
              </p>

              <p style={{ ...TEXT_STYLE, marginTop: 18 }}>
                The vision is simple: idea → story → scene → shot → dialogue → image → video.
                Instead of jumping between disconnected tools, Afrawood brings the creative workflow
                into one intelligent studio.
              </p>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              <div style={BOX_STYLE}>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.62)" }}>Mission</div>
                <div style={{ marginTop: 8, fontSize: 22, fontWeight: 800 }}>
                  Build a real AI-powered cinematic production studio
                </div>
              </div>

              <div style={BOX_STYLE}>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.62)" }}>Focus</div>
                <div style={{ marginTop: 8, fontSize: 22, fontWeight: 800 }}>
                  Professional workflow, strong control, and creator monetization
                </div>
              </div>

              <div style={BOX_STYLE}>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.62)" }}>Audience</div>
                <div style={{ marginTop: 8, fontSize: 22, fontWeight: 800 }}>
                  Filmmakers, studios, social creators, and visual storytellers
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}