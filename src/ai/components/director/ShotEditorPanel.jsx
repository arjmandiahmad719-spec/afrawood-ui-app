import React from "react";
import { useAfraFlow } from "../../core/AfraFlowContext";

const containerStyle = {
  flex: 1,
  padding: 16,
  overflowY: "auto",
};

const itemStyle = {
  background: "#0a0a0a",
  border: "1px solid rgba(0,255,200,0.15)",
  borderRadius: 14,
  padding: 14,
  marginBottom: 12,
};

const titleStyle = {
  color: "#00ffd0",
  fontWeight: "bold",
  marginBottom: 8,
};

const textStyle = {
  color: "#d7fffb",
  lineHeight: 1.8,
  whiteSpace: "pre-line",
};

const metaStyle = {
  marginTop: 8,
  fontSize: 12,
  color: "rgba(215,255,251,0.6)",
  lineHeight: 1.7,
};

const emptyStyle = {
  color: "rgba(215,255,251,0.6)",
  textAlign: "center",
  marginTop: 40,
};

export default function ShotListPanel() {
  const { project } = useAfraFlow();
  const shots = Array.isArray(project?.shots) ? project.shots : [];

  if (!shots.length) {
    return <div style={emptyStyle}>شاتی وجود ندارد</div>;
  }

  return (
    <div style={containerStyle}>
      {shots.map((shot, i) => (
        <div key={i} style={itemStyle}>
          <div style={titleStyle}>
            📷 {shot.title || `شات ${i + 1}`}
          </div>

          <div style={textStyle}>
            {shot.description || "توضیحی ثبت نشده"}
          </div>

          <div style={metaStyle}>
            🎬 نوع: {shot.type || "نامشخص"}
            <br />
            🎥 حرکت: {shot.movement || "نامشخص"}
            <br />
            ⏱ مدت: {shot.duration || "نامشخص"}
          </div>
        </div>
      ))}
    </div>
  );
}