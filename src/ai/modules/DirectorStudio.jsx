import React, { useMemo, useState } from "react";
import DialogBuilderPanel from "../components/director/DialogBuilderPanel.jsx";
import SceneListPanel from "../components/director/SceneListPanel.jsx";
import DirectorTopInsights from "../components/director/DirectorTopInsights.jsx";
import { useAfraFlow } from "../core/AfraFlowContext";
import { createDirectorStudioOutput } from "../core/afraAutoFill";
import { buildSceneDialoguePayload } from "../core/sceneDialogueManager";
import {
  buildDirectorScriptDocument,
  downloadDirectorScriptHtml,
  openDirectorPrintWindow,
} from "../core/directorPdfExport.js";

const ASSISTANT_IMAGE = "/afra-assistant.png";

const panelStyle = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at 14% 18%, rgba(87,221,210,0.10), transparent 24%), radial-gradient(circle at 86% 12%, rgba(216,179,93,0.11), transparent 24%), linear-gradient(180deg, #040608 0%, #0a0d12 100%)",
  color: "#fff",
  position: "relative",
  overflow: "hidden",
};

const pageInnerStyle = {
  width: "min(1480px, calc(100% - 32px))",
  margin: "0 auto",
  padding: "22px 0 80px",
  position: "relative",
  zIndex: 1,
};

const surfaceStyle = {
  background: "linear-gradient(180deg, rgba(10,10,10,0.95), rgba(18,18,18,0.95))",
  border: "1px solid rgba(216,179,93,0.15)",
  borderRadius: 28,
  color: "#fff",
  boxShadow: "0 18px 40px rgba(0,0,0,0.26)",
  position: "relative",
  overflow: "hidden",
};

const fieldStyle = {
  width: "100%",
  padding: "15px 16px",
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  fontSize: 17,
  direction: "rtl",
  textAlign: "right",
  outline: "none",
  boxSizing: "border-box",
};

const textareaFieldStyle = {
  ...fieldStyle,
  minHeight: 100,
  resize: "vertical",
};

const labelStyle = {
  display: "block",
  marginBottom: 8,
  color: "#d7c58a",
  fontSize: 15,
  fontWeight: 800,
};

const primaryButtonStyle = {
  border: "none",
  borderRadius: 18,
  padding: "13px 20px",
  background: "linear-gradient(135deg, #d8b35d, #57ddd2)",
  color: "#111",
  fontWeight: 900,
  cursor: "pointer",
  fontSize: 16,
  boxShadow: "0 10px 26px rgba(0,0,0,0.25)",
};

const secondaryGlowButtonStyle = {
  border: "none",
  borderRadius: 18,
  padding: "13px 20px",
  background: "linear-gradient(135deg, #57ddd2, #d8b35d)",
  color: "#111",
  fontWeight: 900,
  cursor: "pointer",
  fontSize: 16,
  boxShadow: "0 10px 26px rgba(0,0,0,0.25)",
};

const neutralButtonStyle = {
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 18,
  padding: "13px 20px",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
  fontSize: 16,
};

const thStyle = {
  textAlign: "right",
  padding: "12px 10px",
  borderBottom: "1px solid rgba(255,255,255,0.12)",
  color: "#d7c58a",
  fontSize: 15,
};

const tdStyle = {
  padding: "12px 10px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  fontSize: 16,
};

function SectionCard({ title, caption, children, style = {} }) {
  return (
    <div style={{ ...surfaceStyle, padding: 22, ...style }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 92% 8%, rgba(216,179,93,0.08), transparent 22%), radial-gradient(circle at 8% 14%, rgba(87,221,210,0.08), transparent 18%)",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        {(title || caption) && (
          <div style={{ marginBottom: 18 }}>
            {title ? (
              <h3
                style={{
                  margin: 0,
                  fontSize: 22,
                  color: "#57ddd2",
                  lineHeight: 1.2,
                }}
              >
                {title}
              </h3>
            ) : null}
            {caption ? (
              <p
                style={{
                  margin: "8px 0 0",
                  color: "rgba(255,255,255,0.68)",
                  lineHeight: 1.8,
                  fontSize: 15,
                }}
              >
                {caption}
              </p>
            ) : null}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

function OutputCard({ title, children }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(87,221,210,0.14)",
        borderRadius: 22,
        padding: 18,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
      }}
    >
      <h3 style={{ marginTop: 0, color: "#57ddd2", fontSize: 22 }}>{title}</h3>
      {children}
    </div>
  );
}

function getDialogueText(dialogueItem) {
  if (!dialogueItem) return "";
  if (typeof dialogueItem.dialogueText === "string" && dialogueItem.dialogueText.trim()) {
    return dialogueItem.dialogueText;
  }
  if (typeof dialogueItem.fullText === "string" && dialogueItem.fullText.trim()) {
    return dialogueItem.fullText;
  }
  if (Array.isArray(dialogueItem.dialogueLines) && dialogueItem.dialogueLines.length) {
    return dialogueItem.dialogueLines.join("\n");
  }
  if (Array.isArray(dialogueItem.lines) && dialogueItem.lines.length) {
    return dialogueItem.lines.join("\n");
  }
  return "";
}

export default function DirectorStudio() {
  const {
    directorStudioForm,
    updateDirectorField,
    addCopilotMessage,
    resetDirectorStudio,
    sceneDialogues,
    addOrUpdateSceneDialogue,
    removeSceneDialogue,
    clearSceneDialogues,
  } = useAfraFlow();

  const [generated, setGenerated] = useState(false);
  const [generatedDialogue, setGeneratedDialogue] = useState(null);
  const [showAssistantImage, setShowAssistantImage] = useState(true);

  const sceneId = useMemo(() => {
    return String(directorStudioForm.sceneNumber || "1");
  }, [directorStudioForm.sceneNumber]);

  const dialogueSceneData = useMemo(() => {
    const characterList =
      typeof directorStudioForm.characters === "string"
        ? directorStudioForm.characters
            .split(/\n|،|,/)
            .map((item, index) => ({
              id: `char-${index + 1}`,
              name: item.trim(),
              role: "",
            }))
            .filter((item) => item.name)
        : [];

    return {
      mood: directorStudioForm.mood || "دراماتیک",
      location: directorStudioForm.location || "لوکیشن نامشخص",
      time: directorStudioForm.timeOfDay || "شب",
      sceneGoal: directorStudioForm.actionSummary || "",
      characters: characterList,
    };
  }, [directorStudioForm]);

  const output = useMemo(
    () => createDirectorStudioOutput(directorStudioForm),
    [directorStudioForm]
  );

  const currentSceneDialogue = useMemo(() => {
    return (
      sceneDialogues.find(
        (item) =>
          String(item.sceneId || "") === sceneId ||
          String(item.sceneNumber || "") === sceneId
      ) || null
    );
  }, [sceneDialogues, sceneId]);

  const currentSceneDialogueText = useMemo(() => {
    return getDialogueText(currentSceneDialogue);
  }, [currentSceneDialogue]);

  const handleChange = (field, value) => {
    updateDirectorField(field, value);
  };

  const handleGenerate = () => {
    setGenerated(true);
    addCopilotMessage({
      role: "assistant",
      text: "خروجی حرفه‌ای Director Studio تولید شد.",
    });
  };

  const handleReset = () => {
    resetDirectorStudio();
    setGenerated(false);
    setGeneratedDialogue(null);
    clearSceneDialogues();
  };

  const handleDialogueApply = (dialogueOutput) => {
    setGeneratedDialogue(dialogueOutput);
    updateDirectorField("dialogueText", dialogueOutput.fullText || "");

    const payload = buildSceneDialoguePayload({
      sceneId,
      sceneNumber: directorStudioForm.sceneNumber,
      sceneTitle: directorStudioForm.sceneTitle,
      dialogueOutput,
    });

    addOrUpdateSceneDialogue(payload);
  };

  const handleLoadScene = (scene) => {
    if (!scene) return;

    updateDirectorField("sceneNumber", scene.sceneNumber || scene.sceneId || "");
    updateDirectorField("sceneTitle", scene.sceneTitle || scene.title || "");
    updateDirectorField("dialogueText", getDialogueText(scene));

    if (scene.mood && scene.mood !== "-") {
      updateDirectorField("mood", scene.mood);
    }

    if (scene.location && scene.location !== "-") {
      updateDirectorField("location", scene.location);
    }

    if ((scene.time || scene.timeOfDay) && (scene.time || scene.timeOfDay) !== "-") {
      updateDirectorField("timeOfDay", scene.time || scene.timeOfDay);
    }

    setGeneratedDialogue({
      fullText: getDialogueText(scene),
      lines: getDialogueText(scene).split("\n").filter(Boolean),
      meta: {
        mood: scene.mood || "",
        location: scene.location || "",
        time: scene.time || scene.timeOfDay || "",
        dialogueType: scene.dialogueType || "cinematic",
        characterCount:
          scene.characterCount ||
          scene.dialogueMeta?.characterCount ||
          0,
      },
    });
  };

  const handleRemoveScene = (targetSceneId) => {
    removeSceneDialogue(targetSceneId);

    if (String(targetSceneId) === sceneId) {
      setGeneratedDialogue(null);
      updateDirectorField("dialogueText", "");
    }
  };

  const handleExportScript = () => {
    const documentData = buildDirectorScriptDocument(
      directorStudioForm,
      output,
      sceneDialogues
    );

    downloadDirectorScriptHtml(documentData);

    addCopilotMessage({
      role: "assistant",
      text: "فایل Script HTML با موفقیت دانلود شد.",
    });
  };

  const handleSaveAsPdf = () => {
    const documentData = buildDirectorScriptDocument(
      directorStudioForm,
      output,
      sceneDialogues
    );

    const success = openDirectorPrintWindow(documentData);

    addCopilotMessage({
      role: "assistant",
      text: success
        ? "پنجره Print برای ذخیره PDF باز شد."
        : "مرورگر اجازه باز کردن پنجره Print را نداد.",
    });
  };

  return (
    <div style={panelStyle}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 92% 10%, rgba(216,179,93,0.10), transparent 22%), radial-gradient(circle at 8% 14%, rgba(87,221,210,0.08), transparent 18%), linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0))",
        }}
      />

      <div style={pageInnerStyle}>
        <SectionCard
          style={{ padding: 28 }}
          title=""
          caption=""
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(320px, 1.25fr) minmax(260px, 0.85fr)",
              gap: 22,
              alignItems: "stretch",
            }}
          >
            <div>
              <div
                style={{
                  color: "#58dfd0",
                  fontSize: 12,
                  letterSpacing: 1.8,
                  marginBottom: 10,
                  fontWeight: 800,
                }}
              >
                DIRECTOR STUDIO
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: 38,
                  lineHeight: 1.08,
                  color: "#fff",
                }}
              >
                طراحی صحنه، دیالوگ و کارگردانی
                <span style={{ color: "#d8b35d" }}> در یک پنل حرفه‌ای</span>
              </h1>

              <p
                style={{
                  color: "rgba(255,255,255,0.76)",
                  marginTop: 14,
                  lineHeight: 1.95,
                  fontSize: 17,
                  maxWidth: 780,
                }}
              >
                ایده را به صحنه تبدیل کن، شخصیت و فضا را شکل بده، دیالوگ سینمایی
                بساز و خروجی نهایی کارگردانی را برای تولید فیلم آماده کن.
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                  marginTop: 18,
                }}
              >
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 999,
                    border: "1px solid rgba(87,221,210,0.18)",
                    background: "rgba(87,221,210,0.08)",
                    color: "#57ddd2",
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  Copilot فعال
                </div>

                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 999,
                    border: "1px solid rgba(216,179,93,0.18)",
                    background: "rgba(216,179,93,0.08)",
                    color: "#d8b35d",
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  Dialogue Engine سینمایی
                </div>

                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(255,255,255,0.04)",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  Export آماده
                </div>
              </div>
            </div>

            <div
              style={{
                minHeight: 320,
                borderRadius: 26,
                border: "1px solid rgba(87,221,210,0.14)",
                background:
                  "radial-gradient(circle at 50% 18%, rgba(87,221,210,0.16), transparent 30%), radial-gradient(circle at 52% 92%, rgba(216,179,93,0.12), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))",
                position: "relative",
                overflow: "hidden",
                display: "grid",
                placeItems: "center",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0)), radial-gradient(circle at 50% 50%, rgba(0,0,0,0), rgba(0,0,0,0.24))",
                }}
              />

              {showAssistantImage ? (
                <img
                  src={ASSISTANT_IMAGE}
                  alt="Afrawood Assistant"
                  onError={() => setShowAssistantImage(false)}
                  style={{
                    maxWidth: "100%",
                    maxHeight: 300,
                    objectFit: "contain",
                    display: "block",
                    filter: "drop-shadow(0 14px 34px rgba(0,0,0,0.42))",
                    position: "relative",
                    zIndex: 1,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 220,
                    height: 280,
                    borderRadius: 999,
                    position: "relative",
                    zIndex: 1,
                    background:
                      "radial-gradient(circle at 50% 26%, rgba(255,255,255,0.22), rgba(255,255,255,0.05) 22%, transparent 23%), radial-gradient(circle at 50% 40%, rgba(87,221,210,0.34), rgba(87,221,210,0.10) 28%, transparent 29%), linear-gradient(180deg, rgba(216,179,93,0.20), rgba(87,221,210,0.18))",
                    boxShadow: "0 28px 60px rgba(0,0,0,0.35)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 22,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 104,
                      height: 104,
                      borderRadius: "50%",
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.44), rgba(255,255,255,0.10))",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 20,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 168,
                      height: 184,
                      borderRadius: "40% 40% 26% 26%",
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.15), rgba(0,0,0,0.18))",
                    }}
                  />
                </div>
              )}

              <div
                style={{
                  position: "absolute",
                  bottom: 16,
                  left: 16,
                  right: 16,
                  zIndex: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#57ddd2",
                      letterSpacing: 1.4,
                      fontWeight: 800,
                    }}
                  >
                    AFRAWOOD AI
                  </div>
                  <div
                    style={{
                      color: "#fff",
                      fontSize: 16,
                      fontWeight: 800,
                      marginTop: 4,
                    }}
                  >
                    Director Assistant
                  </div>
                </div>

                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: 14,
                    background: "rgba(0,0,0,0.26)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.86)",
                    fontSize: 12,
                    textAlign: "right",
                    lineHeight: 1.8,
                  }}
                >
                  دیالوگ، صحنه و خروجی
                  <br />
                  در یک جریان واحد
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <div style={{ marginTop: 18 }}>
          <DirectorTopInsights
            form={directorStudioForm}
            sceneDialogues={sceneDialogues}
            currentSceneDialogue={currentSceneDialogue}
          />
        </div>

        <div
          style={{
            marginTop: 18,
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.55fr) minmax(320px, 0.95fr)",
            gap: 18,
            alignItems: "start",
          }}
        >
          <SectionCard
            title="فرم کارگردانی صحنه"
            caption="جزئیات صحنه را کامل کن تا Copilot و موتور دیالوگ خروجی دقیق‌تری بسازند."
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 16,
              }}
            >
              <div>
                <label style={labelStyle}>نوع پروژه</label>
                <select
                  style={fieldStyle}
                  value={directorStudioForm.projectType}
                  onChange={(e) => handleChange("projectType", e.target.value)}
                >
                  <option value="cinema">سینما</option>
                  <option value="series">سریال</option>
                  <option value="short">فیلم کوتاه</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>عنوان پروژه</label>
                <input
                  style={fieldStyle}
                  value={directorStudioForm.projectTitle}
                  onChange={(e) => handleChange("projectTitle", e.target.value)}
                />
              </div>

              <div>
                <label style={labelStyle}>شماره صحنه</label>
                <input
                  style={fieldStyle}
                  value={directorStudioForm.sceneNumber}
                  onChange={(e) => handleChange("sceneNumber", e.target.value)}
                />
              </div>

              <div>
                <label style={labelStyle}>مدت تقریبی</label>
                <input
                  style={fieldStyle}
                  value={directorStudioForm.estimatedDuration}
                  onChange={(e) => handleChange("estimatedDuration", e.target.value)}
                />
              </div>

              <div>
                <label style={labelStyle}>زبان خروجی</label>
                <select
                  style={fieldStyle}
                  value={directorStudioForm.outputLanguage}
                  onChange={(e) => handleChange("outputLanguage", e.target.value)}
                >
                  <option value="فارسی">فارسی</option>
                  <option value="English">English</option>
                  <option value="Türkçe">Türkçe</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>عنوان صحنه</label>
                <input
                  style={fieldStyle}
                  value={directorStudioForm.sceneTitle}
                  onChange={(e) => handleChange("sceneTitle", e.target.value)}
                />
              </div>

              <div>
                <label style={labelStyle}>لوکیشن</label>
                <input
                  style={fieldStyle}
                  value={directorStudioForm.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                />
              </div>

              <div>
                <label style={labelStyle}>زمان</label>
                <input
                  style={fieldStyle}
                  value={directorStudioForm.timeOfDay}
                  onChange={(e) => handleChange("timeOfDay", e.target.value)}
                />
              </div>

              <div>
                <label style={labelStyle}>مود و حس</label>
                <input
                  style={fieldStyle}
                  value={directorStudioForm.mood}
                  onChange={(e) => handleChange("mood", e.target.value)}
                />
              </div>

              <div>
                <label style={labelStyle}>استایل بصری</label>
                <input
                  style={fieldStyle}
                  value={directorStudioForm.visualStyle}
                  onChange={(e) => handleChange("visualStyle", e.target.value)}
                />
              </div>

              <div>
                <label style={labelStyle}>استایل دوربین</label>
                <input
                  style={fieldStyle}
                  value={directorStudioForm.cameraStyle}
                  onChange={(e) => handleChange("cameraStyle", e.target.value)}
                />
              </div>

              <div>
                <label style={labelStyle}>نورپردازی</label>
                <input
                  style={fieldStyle}
                  value={directorStudioForm.lightingStyle}
                  onChange={(e) => handleChange("lightingStyle", e.target.value)}
                />
              </div>

              <div>
                <label style={labelStyle}>تراکم شات</label>
                <select
                  style={fieldStyle}
                  value={directorStudioForm.shotDensity}
                  onChange={(e) => handleChange("shotDensity", e.target.value)}
                >
                  <option value="کم">کم</option>
                  <option value="متوسط">متوسط</option>
                  <option value="زیاد">زیاد</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>لحن دیالوگ</label>
                <input
                  style={fieldStyle}
                  value={directorStudioForm.dialogueTone}
                  onChange={(e) => handleChange("dialogueTone", e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={labelStyle}>شخصیت‌ها</label>
              <textarea
                style={{ ...textareaFieldStyle, minHeight: 100 }}
                value={directorStudioForm.characters}
                onChange={(e) => handleChange("characters", e.target.value)}
                placeholder="مثلاً: علی، سارا"
              />
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={labelStyle}>خلاصه کنش صحنه</label>
              <textarea
                style={{ ...textareaFieldStyle, minHeight: 120 }}
                value={directorStudioForm.actionSummary}
                onChange={(e) => handleChange("actionSummary", e.target.value)}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 16,
                marginTop: 16,
              }}
            >
              <div>
                <label style={labelStyle}>طراحی صدا</label>
                <textarea
                  style={{ ...textareaFieldStyle, minHeight: 100 }}
                  value={directorStudioForm.soundDesign}
                  onChange={(e) => handleChange("soundDesign", e.target.value)}
                />
              </div>

              <div>
                <label style={labelStyle}>استایل موسیقی</label>
                <textarea
                  style={{ ...textareaFieldStyle, minHeight: 100 }}
                  value={directorStudioForm.musicStyle}
                  onChange={(e) => handleChange("musicStyle", e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={labelStyle}>نیت کارگردانی</label>
              <textarea
                style={{ ...textareaFieldStyle, minHeight: 110 }}
                value={directorStudioForm.directorIntent}
                onChange={(e) => handleChange("directorIntent", e.target.value)}
              />
            </div>

            <div
              style={{
                marginTop: 24,
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                alignItems: "center",
              }}
            >
              <button onClick={handleGenerate} style={primaryButtonStyle}>
                Generate Director Output
              </button>

              <button onClick={handleExportScript} style={secondaryGlowButtonStyle}>
                Export Script
              </button>

              <button onClick={handleSaveAsPdf} style={secondaryGlowButtonStyle}>
                Save as PDF
              </button>

              <button onClick={handleReset} style={neutralButtonStyle}>
                Reset Form
              </button>
            </div>
          </SectionCard>

          <div
            style={{
              display: "grid",
              gap: 18,
            }}
          >
            <SectionCard
              title="Dialogue Builder"
              caption="از روی داده‌های صحنه، دیالوگ سینمایی را تولید و روی همین صحنه اعمال کن."
            >
              <DialogBuilderPanel
                sceneData={dialogueSceneData}
                onApplyDialogue={handleDialogueApply}
              />
            </SectionCard>

            <SectionCard
              title="دیالوگ ذخیره‌شده این صحنه"
              caption="آخرین دیالوگی که برای این صحنه ذخیره شده اینجا نمایش داده می‌شود."
            >
              <div
                style={{
                  minHeight: 180,
                  whiteSpace: "pre-line",
                  lineHeight: 2,
                  fontSize: 16,
                  color: currentSceneDialogueText
                    ? "#fff"
                    : "rgba(255,255,255,0.56)",
                }}
              >
                {currentSceneDialogueText || "هنوز دیالوگی برای این صحنه ذخیره نشده"}
              </div>
            </SectionCard>

            <SceneListPanel
              sceneDialogues={sceneDialogues}
              currentSceneId={sceneId}
              onLoadScene={handleLoadScene}
              onRemoveScene={handleRemoveScene}
            />
          </div>
        </div>

        {generated && (
          <div
            style={{
              ...surfaceStyle,
              marginTop: 20,
              padding: 22,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background:
                  "radial-gradient(circle at 90% 8%, rgba(216,179,93,0.08), transparent 22%), radial-gradient(circle at 10% 12%, rgba(87,221,210,0.08), transparent 18%)",
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    color: "#58dfd0",
                    fontSize: 12,
                    letterSpacing: 1.4,
                    fontWeight: 800,
                    marginBottom: 8,
                  }}
                >
                  GENERATED OUTPUT
                </div>
                <h3 style={{ margin: 0, fontSize: 28 }}>
                  خروجی نهایی Director Studio
                </h3>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: 16,
                }}
              >
                <OutputCard title="Scene Overview">
                  <div style={{ lineHeight: 2, fontSize: 17 }}>
                    <div><strong>Title:</strong> {output.overview.title}</div>
                    <div><strong>Scene:</strong> {output.overview.sceneTitle}</div>
                    <div><strong>Location:</strong> {output.overview.location}</div>
                    <div><strong>Mood:</strong> {output.overview.mood}</div>
                    <div><strong>Time:</strong> {output.overview.time}</div>
                    <div><strong>Duration:</strong> {output.overview.duration}</div>
                    <div><strong>Language:</strong> {output.overview.language}</div>
                  </div>
                </OutputCard>

                <OutputCard title="Scene Breakdown">
                  <ul style={{ margin: 0, paddingInlineStart: 20, lineHeight: 2, fontSize: 17 }}>
                    {output.sceneBreakdown.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </OutputCard>

                <OutputCard title="Camera Plan">
                  <ul style={{ margin: 0, paddingInlineStart: 20, lineHeight: 2, fontSize: 17 }}>
                    {output.cameraPlan.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </OutputCard>

                <OutputCard title="Lighting Plan">
                  <ul style={{ margin: 0, paddingInlineStart: 20, lineHeight: 2, fontSize: 17 }}>
                    {output.lightingPlan.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </OutputCard>

                <OutputCard title="Blocking Plan">
                  <ul style={{ margin: 0, paddingInlineStart: 20, lineHeight: 2, fontSize: 17 }}>
                    {output.blockingPlan.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </OutputCard>

                <OutputCard title="Director Notes">
                  <ul style={{ margin: 0, paddingInlineStart: 20, lineHeight: 2, fontSize: 17 }}>
                    {output.directorNotes.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </OutputCard>

                <OutputCard title="Sound Design">
                  <ul style={{ margin: 0, paddingInlineStart: 20, lineHeight: 2, fontSize: 17 }}>
                    {output.soundDesign.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </OutputCard>

                <OutputCard title="Music">
                  <ul style={{ margin: 0, paddingInlineStart: 20, lineHeight: 2, fontSize: 17 }}>
                    {output.music.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </OutputCard>

                <OutputCard title="Dialogue">
                  <div style={{ lineHeight: 2, fontSize: 17, whiteSpace: "pre-line" }}>
                    {generatedDialogue?.fullText ||
                      currentSceneDialogueText ||
                      directorStudioForm.dialogueText ||
                      "هنوز دیالوگی ساخته نشده"}
                  </div>
                </OutputCard>

                <div
                  style={{
                    gridColumn: "1 / -1",
                    background: "rgba(255,255,255,0.035)",
                    border: "1px solid rgba(216,179,93,0.12)",
                    borderRadius: 22,
                    padding: 18,
                  }}
                >
                  <h3 style={{ marginTop: 0, color: "#57ddd2", fontSize: 22 }}>
                    Shot List
                  </h3>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff" }}>
                      <thead>
                        <tr>
                          <th style={thStyle}>Shot</th>
                          <th style={thStyle}>Type</th>
                          <th style={thStyle}>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {output.shotList.map((row) => (
                          <tr key={row.shot}>
                            <td style={tdStyle}>{row.shot}</td>
                            <td style={tdStyle}>{row.type}</td>
                            <td style={tdStyle}>{row.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}