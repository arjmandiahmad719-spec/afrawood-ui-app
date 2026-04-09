import React from "react";
import { useAfraFlow } from "../core/AfraFlowContext";
import { buildDirectorStudioAutofillFromStory } from "../core/afraAutoFill";

function buildSceneFromText(text) {
  const t = (text || "").toLowerCase();
  const result = {};

  if (t.includes("عاشقانه")) result.mood = "عاشقانه";
  if (t.includes("ترسناک")) result.mood = "ترسناک";
  if (t.includes("رازآلود")) result.mood = "رازآلود";
  if (t.includes("حماسی")) result.mood = "حماسی";

  if (t.includes("بارانی")) result.location = "خیابان بارانی شب";
  else if (t.includes("خیابان")) result.location = "خیابان";
  else if (t.includes("خانه")) result.location = "خانه";
  else if (t.includes("کافه")) result.location = "کافه";
  else if (t.includes("اتاق")) result.location = "اتاق";

  if (t.includes("شب")) result.timeOfDay = "شب";
  if (t.includes("روز")) result.timeOfDay = "روز";
  if (t.includes("غروب")) result.timeOfDay = "غروب";

  if (t.includes("سینمایی")) result.lightingStyle = "نور سینمایی";
  if (t.includes("تیره")) result.lightingStyle = "نورپردازی تیره و کنتراست‌دار";
  if (t.includes("نرم")) result.cameraStyle = "حرکت نرم و کنترل‌شده";
  if (t.includes("سریع")) result.cameraStyle = "حرکت پویا و پرانرژی";

  result.visualStyle = "سینمایی واقع‌گرا";
  result.cameraStyle = result.cameraStyle || "حرکت نرم و کنترل‌شده";
  result.shotDensity = "متوسط";
  result.sceneTitle = "صحنه ساخته شده با AI";
  result.dialogueTone = result.mood || "طبیعی";
  result.musicStyle = result.mood ? `موسیقی متناسب با فضای ${result.mood}` : "موسیقی سینمایی";
  result.soundDesign = result.location
    ? `صداسازی محیطی متناسب با ${result.location}`
    : "صداسازی محیطی سینمایی";
  result.directorIntent = "خلق یک صحنه منسجم، سینمایی و قابل اجرا";
  result.actionSummary = "صحنه به‌صورت هوشمند از روی دستور کاربر ساخته شده است.";

  return result;
}

function applySmartDirectorCommand(text, bulkUpdateDirectorForm) {
  const updates = {};
  const clean = (text || "").trim();

  if (clean.startsWith("لوکیشن")) {
    const value = clean.replace(/^لوکیشن\s*/u, "").trim();
    if (value) updates.location = value;
  }

  if (clean.startsWith("مود")) {
    const value = clean.replace(/^مود\s*/u, "").trim();
    if (value) updates.mood = value;
  }

  if (clean.startsWith("عنوان پروژه")) {
    const value = clean.replace(/^عنوان پروژه\s*/u, "").trim();
    if (value) updates.projectTitle = value;
  }

  if (clean.startsWith("عنوان صحنه")) {
    const value = clean.replace(/^عنوان صحنه\s*/u, "").trim();
    if (value) updates.sceneTitle = value;
  }

  if (clean.includes("انگلیسی")) updates.outputLanguage = "English";
  if (clean.includes("فارسی")) updates.outputLanguage = "فارسی";
  if (clean.includes("ترکی")) updates.outputLanguage = "Türkçe";

  if (Object.keys(updates).length === 0) {
    return { handled: false, message: "متوجه نشدم. ساده‌تر بنویس." };
  }

  bulkUpdateDirectorForm(updates);
  return { handled: true, message: "انجام شد ✔️" };
}

const quickBtnStyle = {
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 14,
  padding: "8px 12px",
  background: "rgba(255,255,255,0.05)",
  color: "#fff",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 700,
};

export default function AfrawoodAICopilot() {
  const {
    storyToScript,
    copilot,
    setCopilotInput,
    addCopilotMessage,
    bulkUpdateDirectorForm,
  } = useAfraFlow();

  const handleSend = () => {
    const text = copilot.input.trim();
    if (!text) return;

    addCopilotMessage({ role: "user", text });

    if (text.includes("خودکار")) {
      const patch = buildDirectorStudioAutofillFromStory(storyToScript);
      bulkUpdateDirectorForm(patch);
      addCopilotMessage({
        role: "assistant",
        text: "فرم Director Studio به‌صورت خودکار از Story to Script پر شد ✅",
      });
    } else if (text.includes("صحنه") || text.includes("بساز")) {
      const aiData = buildSceneFromText(text);
      bulkUpdateDirectorForm(aiData);
      addCopilotMessage({
        role: "assistant",
        text: "صحنه به‌صورت هوشمند ساخته شد 🎬",
      });
    } else {
      const result = applySmartDirectorCommand(text, bulkUpdateDirectorForm);
      addCopilotMessage({
        role: "assistant",
        text: result.message,
      });
    }

    setCopilotInput("");
  };

  return (
    <div
      style={{
        position: "sticky",
        bottom: 16,
        zIndex: 30,
        marginTop: 20,
      }}
    >
      <div
        style={{
          background: "rgba(10,10,10,0.94)",
          border: "1px solid rgba(87,221,210,0.18)",
          borderRadius: 24,
          padding: 16,
          boxShadow: "0 14px 35px rgba(0,0,0,0.30)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 12,
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                color: "#57ddd2",
                fontSize: 12,
                letterSpacing: 1.4,
                fontWeight: 800,
              }}
            >
              GLOBAL AI COPILOT
            </div>
            <div style={{ color: "#fff", fontSize: 24, fontWeight: 900 }}>
              Afrawood AI Copilot
            </div>
          </div>

          <div
            style={{
              background: "rgba(216,179,93,0.12)",
              color: "#d7c58a",
              borderRadius: 999,
              padding: "8px 12px",
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            Smart Scene Builder
          </div>
        </div>

        <div
          style={{
            maxHeight: 220,
            overflowY: "auto",
            marginBottom: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {copilot.messages.slice(-8).map((m) => (
            <div
              key={m.id}
              style={{
                color: "#fff",
                fontSize: 18,
                lineHeight: 1.9,
                direction: "rtl",
                textAlign: "right",
                background:
                  m.role === "user"
                    ? "linear-gradient(135deg, rgba(216,179,93,0.22), rgba(87,221,210,0.18))"
                    : "rgba(255,255,255,0.06)",
                borderRadius: 16,
                padding: "10px 14px",
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "88%",
              }}
            >
              {m.text}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <button style={quickBtnStyle} onClick={() => setCopilotInput("لوکیشن خیابان بارانی شب")}>
            لوکیشن
          </button>
          <button style={quickBtnStyle} onClick={() => setCopilotInput("مود عاشقانه")}>
            مود
          </button>
          <button style={quickBtnStyle} onClick={() => setCopilotInput("عنوان پروژه ملاقات شبانه")}>
            عنوان
          </button>
          <button style={quickBtnStyle} onClick={() => setCopilotInput("فرم را خودکار پر کن")}>
            Auto Fill
          </button>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={copilot.input}
            onChange={(e) => setCopilotInput(e.target.value)}
            placeholder="مثلاً: یه صحنه عاشقانه در خیابان بارانی شب با نور سینمایی بساز"
            style={{
              flex: 1,
              padding: 16,
              fontSize: 18,
              direction: "rtl",
              textAlign: "right",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
              color: "#fff",
              outline: "none",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />
          <button
            onClick={handleSend}
            style={{
              fontSize: 16,
              padding: "0 18px",
              borderRadius: 14,
              background: "linear-gradient(135deg, #d8b35d, #57ddd2)",
              color: "#111",
              border: "none",
              cursor: "pointer",
              fontWeight: 900,
            }}
          >
            ارسال
          </button>
        </div>
      </div>
    </div>
  );
}