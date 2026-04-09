import React, { useMemo, useState } from "react";
import { useAfraFlow } from "../../core/AfraFlowContext";
import { runCopilotDirectorCommand } from "../../core/CopilotEngine";

const panelStyle = {
  background: "linear-gradient(180deg, rgba(10,10,10,0.97), rgba(18,18,18,0.97))",
  border: "1px solid rgba(87,221,210,0.14)",
  borderRadius: 28,
  padding: 24,
  color: "#f5f7fb",
  boxShadow: "0 18px 60px rgba(0,0,0,0.34)",
  minHeight: 420,
  display: "flex",
  flexDirection: "column",
  gap: 18,
};

const headerRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
};

const titleWrapStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const titleStyle = {
  margin: 0,
  fontSize: 22,
  fontWeight: 800,
  color: "#f8fafc",
  letterSpacing: "0.01em",
};

const subtitleStyle = {
  margin: 0,
  fontSize: 13,
  color: "rgba(226,232,240,0.72)",
  lineHeight: 1.7,
};

const actionRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
};

const primaryButtonStyle = {
  border: "1px solid rgba(87,221,210,0.28)",
  background: "linear-gradient(135deg, rgba(87,221,210,0.22), rgba(255,215,0,0.14))",
  color: "#ecfeff",
  borderRadius: 14,
  padding: "10px 16px",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButtonStyle = {
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "#e2e8f0",
  borderRadius: 14,
  padding: "10px 14px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

const infoGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
};

const infoCardStyle = {
  border: "1px solid rgba(255,255,255,0.06)",
  background: "rgba(255,255,255,0.03)",
  borderRadius: 18,
  padding: 14,
  display: "flex",
  flexDirection: "column",
  gap: 8,
  minHeight: 88,
};

const infoLabelStyle = {
  fontSize: 11,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "rgba(148,163,184,0.85)",
};

const infoValueStyle = {
  fontSize: 14,
  fontWeight: 700,
  color: "#f8fafc",
  lineHeight: 1.7,
};

const editorCardStyle = {
  border: "1px solid rgba(255,255,255,0.06)",
  background: "rgba(255,255,255,0.03)",
  borderRadius: 22,
  padding: 16,
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const formGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 10,
};

const fieldWrapStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const labelStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: "rgba(203,213,225,0.9)",
};

const inputStyle = {
  width: "100%",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(0,0,0,0.22)",
  color: "#f8fafc",
  padding: "11px 12px",
  outline: "none",
  fontSize: 13,
};

const textareaStyle = {
  ...inputStyle,
  minHeight: 90,
  resize: "vertical",
  lineHeight: 1.8,
};

const emptyStateStyle = {
  border: "1px dashed rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.025)",
  borderRadius: 22,
  padding: 22,
  color: "rgba(226,232,240,0.78)",
  fontSize: 14,
  lineHeight: 1.9,
};

const shotListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

const shotCardStyle = {
  border: "1px solid rgba(87,221,210,0.1)",
  background: "linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.025))",
  borderRadius: 22,
  padding: 18,
  display: "flex",
  flexDirection: "column",
  gap: 14,
  cursor: "pointer",
};

const activeShotCardStyle = {
  ...shotCardStyle,
  border: "1px solid rgba(87,221,210,0.24)",
  boxShadow: "0 0 0 1px rgba(87,221,210,0.08) inset",
  background:
    "linear-gradient(180deg, rgba(87,221,210,0.08), rgba(255,255,255,0.03))",
};

const shotTopStyle = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
};

const shotIndexStyle = {
  minWidth: 56,
  height: 56,
  borderRadius: 16,
  border: "1px solid rgba(255,215,0,0.18)",
  background: "linear-gradient(135deg, rgba(255,215,0,0.16), rgba(87,221,210,0.14))",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 800,
  fontSize: 18,
  color: "#fff8dc",
};

const shotTitleWrapStyle = {
  flex: 1,
  minWidth: 220,
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const shotTitleStyle = {
  margin: 0,
  fontSize: 16,
  fontWeight: 800,
  color: "#f8fafc",
};

const shotDescStyle = {
  margin: 0,
  fontSize: 13,
  lineHeight: 1.85,
  color: "rgba(226,232,240,0.78)",
};

const tagRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const tagStyle = {
  borderRadius: 999,
  border: "1px solid rgba(87,221,210,0.16)",
  background: "rgba(87,221,210,0.08)",
  padding: "6px 10px",
  fontSize: 11,
  color: "#dffefe",
  fontWeight: 700,
};

const detailGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 10,
};

const detailBoxStyle = {
  border: "1px solid rgba(255,255,255,0.06)",
  background: "rgba(0,0,0,0.18)",
  borderRadius: 16,
  padding: 12,
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const detailLabelStyle = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "rgba(148,163,184,0.8)",
};

const detailValueStyle = {
  fontSize: 13,
  lineHeight: 1.8,
  color: "#f8fafc",
  fontWeight: 600,
};

const largeNoteStyle = {
  border: "1px solid rgba(255,255,255,0.06)",
  background: "rgba(255,255,255,0.025)",
  borderRadius: 18,
  padding: 14,
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const largeNoteTitleStyle = {
  fontSize: 12,
  color: "rgba(148,163,184,0.9)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontWeight: 800,
};

const largeNoteTextStyle = {
  fontSize: 13,
  lineHeight: 1.95,
  color: "rgba(241,245,249,0.84)",
  whiteSpace: "pre-wrap",
};

const smallActionRowStyle = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const miniButtonStyle = {
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "#f8fafc",
  borderRadius: 12,
  padding: "8px 10px",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};

const footerStyle = {
  marginTop: "auto",
  borderTop: "1px solid rgba(255,255,255,0.06)",
  paddingTop: 16,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
};

const footerTextStyle = {
  fontSize: 12,
  color: "rgba(148,163,184,0.82)",
};

const normalizeText = (value) => {
  if (value == null) return "";
  return String(value).trim();
};

const safeArray = (value) => (Array.isArray(value) ? value : []);

const createLocalId = (prefix = "afra") => {
  const random = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${prefix}_${time}_${random}`;
};

function DetailBox({ label, value }) {
  return (
    <div style={detailBoxStyle}>
      <div style={detailLabelStyle}>{label}</div>
      <div style={detailValueStyle}>{normalizeText(value) || "—"}</div>
    </div>
  );
}

const createEmptyForm = (sceneId = "", nextShotNumber = 1) => ({
  sceneId,
  shotNumber: String(nextShotNumber),
  title: "",
  description: "",
  purpose: "",
  shotType: "",
  shotSize: "",
  lens: "",
  cameraAngle: "",
  cameraMove: "",
  cameraHeight: "",
  framing: "",
  composition: "",
  subject: "",
  subjectFocus: "",
  blocking: "",
  action: "",
  lighting: "",
  colorTone: "",
  visualMood: "",
  atmosphere: "",
  soundNote: "",
  transition: "",
  durationEstimate: "",
  continuityNotes: "",
  directorNote: "",
  storyboardPrompt: "",
});

function StoryboardShotPanel() {
  const { state, actions } = useAfraFlow();

  const activeScene = useMemo(() => {
    return state.entities.scenes.find((scene) => scene.id === state.ui.activeSceneId) || null;
  }, [state.entities.scenes, state.ui.activeSceneId]);

  const sceneShots = useMemo(() => {
    if (!activeScene) return [];
    return safeArray(state.entities.shots)
      .filter((shot) => shot.sceneId === activeScene.id)
      .sort((a, b) => {
        const aNum =
          typeof a.shotNumber === "number" ? a.shotNumber : Number.MAX_SAFE_INTEGER;
        const bNum =
          typeof b.shotNumber === "number" ? b.shotNumber : Number.MAX_SAFE_INTEGER;
        return aNum - bNum;
      });
  }, [state.entities.shots, activeScene]);

  const activeShot = useMemo(() => {
    return sceneShots.find((shot) => shot.id === state.ui.activeShotId) || null;
  }, [sceneShots, state.ui.activeShotId]);

  const [editingShotId, setEditingShotId] = useState("");
  const [form, setForm] = useState(createEmptyForm("", 1));

  const resetForm = () => {
    setEditingShotId("");
    setForm(createEmptyForm(activeScene?.id || "", sceneShots.length + 1));
  };

  const fillFormFromShot = (shot) => {
    setEditingShotId(shot.id);
    setForm({
      sceneId: shot.sceneId || activeScene?.id || "",
      shotNumber:
        typeof shot.shotNumber === "number" ? String(shot.shotNumber) : "",
      title: shot.title || "",
      description: shot.description || "",
      purpose: shot.purpose || "",
      shotType: shot.shotType || "",
      shotSize: shot.shotSize || "",
      lens: shot.lens || "",
      cameraAngle: shot.cameraAngle || "",
      cameraMove: shot.cameraMove || "",
      cameraHeight: shot.cameraHeight || "",
      framing: shot.framing || "",
      composition: shot.composition || "",
      subject: shot.subject || "",
      subjectFocus: shot.subjectFocus || "",
      blocking: shot.blocking || "",
      action: shot.action || "",
      lighting: shot.lighting || "",
      colorTone: shot.colorTone || "",
      visualMood: shot.visualMood || "",
      atmosphere: shot.atmosphere || "",
      soundNote: shot.soundNote || "",
      transition: shot.transition || "",
      durationEstimate: shot.durationEstimate || "",
      continuityNotes: shot.continuityNotes || "",
      directorNote: shot.directorNote || "",
      storyboardPrompt: shot.storyboardPrompt || "",
    });
  };

  const handleGenerateStoryboard = async () => {
    if (!activeScene) {
      if (typeof actions.setError === "function") {
        actions.setError("اول یک صحنه را انتخاب کن تا شات‌لیست ساخته شود.");
      }
      return;
    }

    try {
      if (typeof actions.clearError === "function") {
        actions.clearError();
      }

      if (typeof actions.setThinking === "function") {
        actions.setThinking(true);
      }

      await runCopilotDirectorCommand(
        {
          state,
          actions,
        },
        "برای صحنه فعال شات لیست و storyboard کامل بساز"
      );

      setEditingShotId("");
      setForm(createEmptyForm(activeScene.id, 1));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "خطا در ساخت Storyboard رخ داد.";

      if (typeof actions.setError === "function") {
        actions.setError(message);
      }

      if (typeof actions.appendChatMessage === "function") {
        actions.appendChatMessage({
          role: "assistant",
          type: "copilot-error",
          text: message,
          meta: { source: "storyboard-panel" },
        });
      }
    } finally {
      if (typeof actions.setThinking === "function") {
        actions.setThinking(false);
      }
    }
  };

  const handleClearShots = () => {
    if (!activeScene) return;

    if (typeof actions.clearSceneShots === "function") {
      actions.clearSceneShots(activeScene.id);
    }

    if (typeof actions.setOutputs === "function") {
      actions.setOutputs({
        generatedStoryboardDraft: "",
      });
    }

    resetForm();
  };

  const handleSelectShot = (shotId) => {
    if (typeof actions.setUi === "function") {
      actions.setUi({
        activeShotId: shotId,
        activeSceneId: activeScene?.id || state.ui.activeSceneId,
      });
    }
  };

  const handleRemoveShot = (shotId) => {
    if (typeof actions.removeShot === "function") {
      actions.removeShot(shotId);
    }

    if (editingShotId === shotId) {
      resetForm();
    }
  };

  const handleSaveShot = () => {
    if (!activeScene) {
      if (typeof actions.setError === "function") {
        actions.setError("اول باید یک صحنه فعال انتخاب شود.");
      }
      return;
    }

    const payload = {
      sceneId: activeScene.id,
      shotNumber:
        normalizeText(form.shotNumber) !== "" && Number.isFinite(Number(form.shotNumber))
          ? Number(form.shotNumber)
          : sceneShots.length + 1,
      title: normalizeText(form.title) || "شات جدید",
      description: normalizeText(form.description),
      purpose: normalizeText(form.purpose),
      shotType: normalizeText(form.shotType),
      shotSize: normalizeText(form.shotSize),
      lens: normalizeText(form.lens),
      cameraAngle: normalizeText(form.cameraAngle),
      cameraMove: normalizeText(form.cameraMove),
      cameraHeight: normalizeText(form.cameraHeight),
      framing: normalizeText(form.framing),
      composition: normalizeText(form.composition),
      subject: normalizeText(form.subject),
      subjectFocus: normalizeText(form.subjectFocus),
      blocking: normalizeText(form.blocking),
      action: normalizeText(form.action),
      lighting: normalizeText(form.lighting),
      colorTone: normalizeText(form.colorTone),
      visualMood: normalizeText(form.visualMood),
      atmosphere: normalizeText(form.atmosphere),
      soundNote: normalizeText(form.soundNote),
      transition: normalizeText(form.transition),
      durationEstimate: normalizeText(form.durationEstimate),
      continuityNotes: normalizeText(form.continuityNotes),
      directorNote: normalizeText(form.directorNote),
      storyboardPrompt: normalizeText(form.storyboardPrompt),
      status: "draft",
    };

    if (typeof actions.clearError === "function") {
      actions.clearError();
    }

    if (editingShotId) {
      if (typeof actions.updateShot === "function") {
        actions.updateShot(editingShotId, payload);
      }
      if (typeof actions.setUi === "function") {
        actions.setUi({
          activeShotId: editingShotId,
          activeSceneId: activeScene.id,
        });
      }
    } else {
      const newId = createLocalId("shot");
      if (typeof actions.addShot === "function") {
        actions.addShot({
          id: newId,
          ...payload,
        });
      }
      if (typeof actions.setUi === "function") {
        actions.setUi({
          activeShotId: newId,
          activeSceneId: activeScene.id,
        });
      }
    }

    resetForm();
  };

  const summaryText = useMemo(() => {
    if (!activeScene) return "هیچ صحنه فعالی انتخاب نشده است.";

    return [
      activeScene.summary ? `خلاصه: ${activeScene.summary}` : "",
      activeScene.conflict ? `کانفلیکت: ${activeScene.conflict}` : "",
      activeScene.purpose ? `هدف: ${activeScene.purpose}` : "",
    ]
      .filter(Boolean)
      .join(" | ");
  }, [activeScene]);

  return (
    <section style={panelStyle}>
      <div style={headerRowStyle}>
        <div style={titleWrapStyle}>
          <h2 style={titleStyle}>Storyboard / Shot Planning</h2>
          <p style={subtitleStyle}>
            برای صحنه فعال شات‌لیست سینمایی، نوع نما، زاویه دوربین، حرکت، نور، کادربندی،
            انتخاب شات فعال و ویرایش دستی شات‌ها مدیریت می‌شود.
          </p>
        </div>

        <div style={actionRowStyle}>
          <button type="button" style={primaryButtonStyle} onClick={handleGenerateStoryboard}>
            ساخت شات‌لیست صحنه فعال
          </button>

          <button type="button" style={secondaryButtonStyle} onClick={handleClearShots}>
            پاک کردن شات‌های صحنه
          </button>
        </div>
      </div>

      <div style={infoGridStyle}>
        <div style={infoCardStyle}>
          <div style={infoLabelStyle}>Scene</div>
          <div style={infoValueStyle}>{activeScene?.title || "صحنه‌ای انتخاب نشده"}</div>
        </div>

        <div style={infoCardStyle}>
          <div style={infoLabelStyle}>Location</div>
          <div style={infoValueStyle}>{activeScene?.location || "—"}</div>
        </div>

        <div style={infoCardStyle}>
          <div style={infoLabelStyle}>Time</div>
          <div style={infoValueStyle}>{activeScene?.timeOfDay || "—"}</div>
        </div>

        <div style={infoCardStyle}>
          <div style={infoLabelStyle}>Active Shot</div>
          <div style={infoValueStyle}>{activeShot?.title || "شات فعال ندارد"}</div>
        </div>
      </div>

      {!activeScene ? (
        <div style={emptyStateStyle}>
          هنوز صحنه فعالی انتخاب نشده. اول از Scene List یک صحنه را انتخاب کن، بعد اینجا
          روی «ساخت شات‌لیست صحنه فعال» بزن.
        </div>
      ) : (
        <>
          <div style={largeNoteStyle}>
            <div style={largeNoteTitleStyle}>Scene Summary</div>
            <div style={largeNoteTextStyle}>{summaryText || "—"}</div>
          </div>

          <div style={editorCardStyle}>
            <div style={formGridStyle}>
              <div style={fieldWrapStyle}>
                <label style={labelStyle}>شماره شات</label>
                <input
                  style={inputStyle}
                  value={form.shotNumber}
                  onChange={(e) => setForm((prev) => ({ ...prev, shotNumber: e.target.value }))}
                  placeholder="1"
                />
              </div>

              <div style={fieldWrapStyle}>
                <label style={labelStyle}>عنوان شات</label>
                <input
                  style={inputStyle}
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="مثلاً: استقرار فضا"
                />
              </div>

              <div style={fieldWrapStyle}>
                <label style={labelStyle}>Shot Type</label>
                <input
                  style={inputStyle}
                  value={form.shotType}
                  onChange={(e) => setForm((prev) => ({ ...prev, shotType: e.target.value }))}
                  placeholder="Establishing / Dialogue Coverage"
                />
              </div>

              <div style={fieldWrapStyle}>
                <label style={labelStyle}>Shot Size</label>
                <input
                  style={inputStyle}
                  value={form.shotSize}
                  onChange={(e) => setForm((prev) => ({ ...prev, shotSize: e.target.value }))}
                  placeholder="WS / MCU / CU"
                />
              </div>

              <div style={fieldWrapStyle}>
                <label style={labelStyle}>Lens</label>
                <input
                  style={inputStyle}
                  value={form.lens}
                  onChange={(e) => setForm((prev) => ({ ...prev, lens: e.target.value }))}
                  placeholder="24mm / 50mm / 85mm"
                />
              </div>

              <div style={fieldWrapStyle}>
                <label style={labelStyle}>Camera Angle</label>
                <input
                  style={inputStyle}
                  value={form.cameraAngle}
                  onChange={(e) => setForm((prev) => ({ ...prev, cameraAngle: e.target.value }))}
                  placeholder="Eye Level / Low Angle"
                />
              </div>

              <div style={fieldWrapStyle}>
                <label style={labelStyle}>Camera Move</label>
                <input
                  style={inputStyle}
                  value={form.cameraMove}
                  onChange={(e) => setForm((prev) => ({ ...prev, cameraMove: e.target.value }))}
                  placeholder="Static / Dolly / Push In"
                />
              </div>

              <div style={fieldWrapStyle}>
                <label style={labelStyle}>Lighting</label>
                <input
                  style={inputStyle}
                  value={form.lighting}
                  onChange={(e) => setForm((prev) => ({ ...prev, lighting: e.target.value }))}
                  placeholder="Low Key / Soft Light"
                />
              </div>
            </div>

            <div style={fieldWrapStyle}>
              <label style={labelStyle}>Description</label>
              <textarea
                style={textareaStyle}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="توضیح شات..."
              />
            </div>

            <div style={formGridStyle}>
              <div style={fieldWrapStyle}>
                <label style={labelStyle}>Purpose</label>
                <input
                  style={inputStyle}
                  value={form.purpose}
                  onChange={(e) => setForm((prev) => ({ ...prev, purpose: e.target.value }))}
                  placeholder="هدف روایی شات"
                />
              </div>

              <div style={fieldWrapStyle}>
                <label style={labelStyle}>Framing</label>
                <input
                  style={inputStyle}
                  value={form.framing}
                  onChange={(e) => setForm((prev) => ({ ...prev, framing: e.target.value }))}
                  placeholder="Wide Establishing / Subject-driven"
                />
              </div>

              <div style={fieldWrapStyle}>
                <label style={labelStyle}>Composition</label>
                <input
                  style={inputStyle}
                  value={form.composition}
                  onChange={(e) => setForm((prev) => ({ ...prev, composition: e.target.value }))}
                  placeholder="Rule of Thirds / Negative Space"
                />
              </div>

              <div style={fieldWrapStyle}>
                <label style={labelStyle}>Subject Focus</label>
                <input
                  style={inputStyle}
                  value={form.subjectFocus}
                  onChange={(e) => setForm((prev) => ({ ...prev, subjectFocus: e.target.value }))}
                  placeholder="تمرکز سوژه"
                />
              </div>

              <div style={fieldWrapStyle}>
                <label style={labelStyle}>Color Tone</label>
                <input
                  style={inputStyle}
                  value={form.colorTone}
                  onChange={(e) => setForm((prev) => ({ ...prev, colorTone: e.target.value }))}
                  placeholder="گرم / سرد / خنثی"
                />
              </div>

              <div style={fieldWrapStyle}>
                <label style={labelStyle}>Visual Mood</label>
                <input
                  style={inputStyle}
                  value={form.visualMood}
                  onChange={(e) => setForm((prev) => ({ ...prev, visualMood: e.target.value }))}
                  placeholder="حس بصری"
                />
              </div>
            </div>

            <div style={fieldWrapStyle}>
              <label style={labelStyle}>Director Note</label>
              <textarea
                style={textareaStyle}
                value={form.directorNote}
                onChange={(e) => setForm((prev) => ({ ...prev, directorNote: e.target.value }))}
                placeholder="نکته کارگردانی..."
              />
            </div>

            <div style={fieldWrapStyle}>
              <label style={labelStyle}>Storyboard Prompt</label>
              <textarea
                style={textareaStyle}
                value={form.storyboardPrompt}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, storyboardPrompt: e.target.value }))
                }
                placeholder="پرامپت تصویری استوری‌بورد..."
              />
            </div>

            <div style={smallActionRowStyle}>
              <button type="button" style={primaryButtonStyle} onClick={handleSaveShot}>
                {editingShotId ? "ذخیره تغییرات شات" : "افزودن شات دستی"}
              </button>

              <button type="button" style={secondaryButtonStyle} onClick={resetForm}>
                پاک کردن فرم شات
              </button>
            </div>
          </div>

          {sceneShots.length === 0 ? (
            <div style={emptyStateStyle}>
              هنوز برای این صحنه شاتی ساخته نشده. با دکمه بالا شات‌لیست کامل این صحنه را
              بساز یا از فرم بالا شات دستی اضافه کن.
            </div>
          ) : (
            <div style={shotListStyle}>
              {sceneShots.map((shot) => {
                const isActive = shot.id === state.ui.activeShotId;

                return (
                  <article
                    key={shot.id}
                    style={isActive ? activeShotCardStyle : shotCardStyle}
                    onClick={() => handleSelectShot(shot.id)}
                  >
                    <div style={shotTopStyle}>
                      <div style={shotIndexStyle}>{shot.shotNumber ?? "—"}</div>

                      <div style={shotTitleWrapStyle}>
                        <h3 style={shotTitleStyle}>
                          {shot.title || "شات بدون عنوان"}
                          {isActive ? " • فعال" : ""}
                        </h3>
                        <p style={shotDescStyle}>{shot.description || "—"}</p>
                      </div>

                      <div
                        style={smallActionRowStyle}
                        onClick={(event) => {
                          event.stopPropagation();
                        }}
                      >
                        <button
                          type="button"
                          style={miniButtonStyle}
                          onClick={() => fillFormFromShot(shot)}
                        >
                          ویرایش
                        </button>

                        <button
                          type="button"
                          style={miniButtonStyle}
                          onClick={() => handleRemoveShot(shot.id)}
                        >
                          حذف
                        </button>
                      </div>
                    </div>

                    <div style={tagRowStyle}>
                      {[shot.shotType, shot.shotSize, shot.cameraAngle, shot.cameraMove, shot.lighting]
                        .filter(Boolean)
                        .map((tag, index) => (
                          <span key={`${shot.id}_tag_${index}`} style={tagStyle}>
                            {tag}
                          </span>
                        ))}
                    </div>

                    <div style={detailGridStyle}>
                      <DetailBox label="Purpose" value={shot.purpose} />
                      <DetailBox label="Lens" value={shot.lens} />
                      <DetailBox label="Camera Height" value={shot.cameraHeight} />
                      <DetailBox label="Framing" value={shot.framing} />
                      <DetailBox label="Composition" value={shot.composition} />
                      <DetailBox label="Subject Focus" value={shot.subjectFocus} />
                      <DetailBox label="Blocking" value={shot.blocking} />
                      <DetailBox label="Action" value={shot.action} />
                      <DetailBox label="Color Tone" value={shot.colorTone} />
                      <DetailBox label="Visual Mood" value={shot.visualMood} />
                      <DetailBox label="Atmosphere" value={shot.atmosphere} />
                      <DetailBox label="Transition" value={shot.transition} />
                      <DetailBox label="Duration" value={shot.durationEstimate} />
                    </div>

                    <div style={largeNoteStyle}>
                      <div style={largeNoteTitleStyle}>Director Note</div>
                      <div style={largeNoteTextStyle}>{shot.directorNote || "—"}</div>
                    </div>

                    <div style={largeNoteStyle}>
                      <div style={largeNoteTitleStyle}>Storyboard Prompt</div>
                      <div style={largeNoteTextStyle}>{shot.storyboardPrompt || "—"}</div>
                    </div>

                    <div style={largeNoteStyle}>
                      <div style={largeNoteTitleStyle}>Continuity Notes</div>
                      <div style={largeNoteTextStyle}>{shot.continuityNotes || "—"}</div>
                    </div>

                    <div style={largeNoteStyle}>
                      <div style={largeNoteTitleStyle}>Sound Note</div>
                      <div style={largeNoteTextStyle}>{shot.soundNote || "—"}</div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      <div style={footerStyle}>
        <div style={footerTextStyle}>
          تعداد شات‌های صحنه فعال: <strong>{sceneShots.length}</strong>
        </div>

        <div style={footerTextStyle}>
          {state.outputs.generatedStoryboardDraft
            ? "خروجی متنی Storyboard در state ذخیره شده است."
            : "هنوز خروجی متنی Storyboard ساخته نشده است."}
        </div>
      </div>
    </section>
  );
}

export default StoryboardShotPanel;