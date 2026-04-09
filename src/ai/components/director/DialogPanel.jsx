import React from "react";
import { useAfraFlow } from "../../core/AfraFlowContext";

const containerStyle = {
  flex: 1,
  padding: 16,
  overflowY: "auto",
};

const cardStyle = {
  background: "#0a0a0a",
  border: "1px solid rgba(0,255,200,0.15)",
  borderRadius: 16,
  padding: 12,
  marginBottom: 10,
  color: "#0ff",
};

const titleStyle = {
  fontWeight: "bold",
  marginBottom: 6,
};

export default function DialogPanel() {
  const { project } = useAfraFlow();
  const dialogues = project.dialogues || [];

  if (!dialogues.length) {
    return <div style={containerStyle}>دیالوگی ساخته نشده</div>;
  }

  return (
    <div style={containerStyle}>
      {dialogues.map((d) => (
        <div key={d.id} style={cardStyle}>
          <div style={titleStyle}>🎭 {d.character}</div>
          <div>{d.text}</div>
        </div>
      ))}
    </div>
  );
}