import React from "react";
import { useAfraFlow } from "../../core/AfraFlowContext";

const wrapperStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background:
    "linear-gradient(180deg, rgba(10,10,10,0.96), rgba(18,18,18,0.96))",
  border: "1px solid rgba(87,221,210,0.14)",
  borderRadius: 24,
  padding: 18,
  color: "#f4efe7",
};

const titleStyle = {
  margin: 0,
  fontSize: 18,
  fontWeight: 800,
};

const subtitleStyle = {
  margin: "4px 0 0 0",
  fontSize: 12,
  color: "rgba(244,239,231,0.68)",
};

const emptyStyle = {
  padding: 18,
  borderRadius: 16,
  background: "rgba(255,255,255,0.03)",
  border: "1px dashed rgba(255,255,255,0.10)",
  color: "rgba(244,239,231,0.72)",
  lineHeight: 1.8,
};

const formStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
};

const fullRowStyle = {
  gridColumn: "1 / -1",
};

const fieldWrapStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const labelStyle = {
  fontSize: 12,
  color: "rgba(244,239,231,0.72)",
  fontWeight: 700,
};

const inputStyle = {
  height: 42,
  padding: "0 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.04)",
  color: "#f4efe7",
  outline: "none",
};

const textareaStyle = {
  minHeight: 120,
  resize: "vertical",
  padding: 12,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.04)",
  color: "#f4efe7",
  outline: "none",
  lineHeight: 1.8,
};

const dangerButtonStyle = {
  height: 42,
  padding: "0 16px",
  borderRadius: 12,
  border: "1px solid rgba(255,107,107,0.20)",
  background: "rgba(255,107,107,0.08)",
  color: "#ff9a9a",
  fontWeight: 800,
  cursor: "pointer",
};

export default function SceneEditorPanel() {
  const { activeScene, updateScene, removeScene, syncStoryboardFromScenes } =
    useAfraFlow();

  const handleChange = (field, value) => {
    if (!activeScene) return;

    updateScene(activeScene.id, {
      [field]: value,
    });

    if (field === "title" || field === "location" || field === "time" || field === "mood") {
      syncStoryboardFromScenes();
    }
  };

  const handleRemove = () => {
    if (!activeScene) return;
    removeScene(activeScene.id);
    setTimeout(() => {
      syncStoryboardFromScenes();
    }, 0);
  };

  return (
    <section style={wrapperStyle}>
      <div>
        <h3 style={titleStyle}>Scene Editor</h3>
        <p style={subtitleStyle}>ویرایش مستقیم صحنه فعال</p>
      </div>

      {!activeScene ? (
        <div style={emptyStyle}>
          هنوز صحنه فعالی انتخاب نشده است.
          <br />
          از Scene List یک صحنه را انتخاب کن.
        </div>
      ) : (
        <>
          <div style={formStyle}>
            <div style={fieldWrapStyle}>
              <label style={labelStyle}>عنوان</label>
              <input
                style={inputStyle}
                value={activeScene.title || ""}
                onChange={(e) => handleChange("title", e.target.value)}
              />
            </div>

            <div style={fieldWrapStyle}>
              <label style={labelStyle}>لوکیشن</label>
              <input
                style={inputStyle}
                value={activeScene.location || ""}
                onChange={(e) => handleChange("location", e.target.value)}
              />
            </div>

            <div style={fieldWrapStyle}>
              <label style={labelStyle}>زمان</label>
              <input
                style={inputStyle}
                value={activeScene.time || ""}
                onChange={(e) => handleChange("time", e.target.value)}
              />
            </div>

            <div style={fieldWrapStyle}>
              <label style={labelStyle}>حس</label>
              <input
                style={inputStyle}
                value={activeScene.mood || ""}
                onChange={(e) => handleChange("mood", e.target.value)}
              />
            </div>

            <div style={{ ...fieldWrapStyle, ...fullRowStyle }}>
              <label style={labelStyle}>توضیح صحنه</label>
              <textarea
                style={textareaStyle}
                value={activeScene.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>
          </div>

          <button type="button" style={dangerButtonStyle} onClick={handleRemove}>
            حذف صحنه فعال
          </button>
        </>
      )}
    </section>
  );
}