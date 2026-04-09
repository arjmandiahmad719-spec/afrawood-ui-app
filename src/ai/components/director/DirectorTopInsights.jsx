import React, { useMemo } from "react";
import { useAfraFlow } from "../../core/AfraFlowContext";

const panelStyle = {
  background: "linear-gradient(180deg, rgba(10,10,10,0.97), rgba(18,18,18,0.97))",
  border: "1px solid rgba(87,221,210,0.14)",
  borderRadius: 28,
  padding: 24,
  color: "#f5f7fb",
  boxShadow: "0 18px 60px rgba(0,0,0,0.34)",
  minHeight: 260,
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

const statusWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
};

const statusBadgeStyle = {
  borderRadius: 999,
  border: "1px solid rgba(87,221,210,0.18)",
  background: "rgba(87,221,210,0.08)",
  color: "#dffefe",
  padding: "7px 10px",
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.05em",
};

const warmBadgeStyle = {
  ...statusBadgeStyle,
  border: "1px solid rgba(255,215,0,0.16)",
  background: "rgba(255,215,0,0.08)",
  color: "#fff1b8",
};

const alertBadgeStyle = {
  ...statusBadgeStyle,
  border: "1px solid rgba(248,113,113,0.18)",
  background: "rgba(248,113,113,0.08)",
  color: "#fee2e2",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 12,
};

const statCardStyle = {
  border: "1px solid rgba(255,255,255,0.06)",
  background: "rgba(255,255,255,0.03)",
  borderRadius: 18,
  padding: 14,
  display: "flex",
  flexDirection: "column",
  gap: 8,
  minHeight: 96,
};

const statLabelStyle = {
  fontSize: 11,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "rgba(148,163,184,0.85)",
};

const statValueStyle = {
  fontSize: 22,
  fontWeight: 900,
  color: "#f8fafc",
  lineHeight: 1.2,
};

const statMetaStyle = {
  fontSize: 12,
  color: "rgba(203,213,225,0.76)",
  lineHeight: 1.7,
};

const highlightGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 12,
};

const insightCardStyle = {
  border: "1px solid rgba(255,255,255,0.06)",
  background: "linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.025))",
  borderRadius: 20,
  padding: 16,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const insightTitleStyle = {
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "rgba(148,163,184,0.88)",
  fontWeight: 800,
};

const insightMainStyle = {
  fontSize: 15,
  lineHeight: 1.9,
  color: "#f8fafc",
  fontWeight: 700,
};

const insightSubStyle = {
  fontSize: 13,
  lineHeight: 1.9,
  color: "rgba(226,232,240,0.78)",
};

const topicRowStyle = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const topicStyle = {
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "#e2e8f0",
  padding: "6px 10px",
  fontSize: 11,
  fontWeight: 700,
};

const progressWrapStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const progressHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
};

const progressTitleStyle = {
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "rgba(148,163,184,0.88)",
  fontWeight: 800,
};

const progressValueStyle = {
  fontSize: 12,
  fontWeight: 800,
  color: "#f8fafc",
};

const progressBarStyle = {
  width: "100%",
  height: 10,
  borderRadius: 999,
  background: "rgba(255,255,255,0.08)",
  overflow: "hidden",
};

const progressFillBaseStyle = {
  height: "100%",
  borderRadius: 999,
};

const emptyStateStyle = {
  border: "1px dashed rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.025)",
  borderRadius: 22,
  padding: 18,
  color: "rgba(226,232,240,0.78)",
  fontSize: 14,
  lineHeight: 1.9,
};

const footerStyle = {
  marginTop: "auto",
  borderTop: "1px solid rgba(255,255,255,0.06)",
  paddingTop: 14,
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

const clampPercent = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
};

function StatCard({ label, value, meta }) {
  return (
    <div style={statCardStyle}>
      <div style={statLabelStyle}>{label}</div>
      <div style={statValueStyle}>{value}</div>
      <div style={statMetaStyle}>{meta}</div>
    </div>
  );
}

function InsightCard({ title, main, sub }) {
  return (
    <div style={insightCardStyle}>
      <div style={insightTitleStyle}>{title}</div>
      <div style={insightMainStyle}>{main || "—"}</div>
      <div style={insightSubStyle}>{sub || "—"}</div>
    </div>
  );
}

function ProgressBlock({ title, value, fillStyle }) {
  return (
    <div style={progressWrapStyle}>
      <div style={progressHeaderStyle}>
        <div style={progressTitleStyle}>{title}</div>
        <div style={progressValueStyle}>{value}%</div>
      </div>
      <div style={progressBarStyle}>
        <div
          style={{
            ...progressFillBaseStyle,
            ...fillStyle,
            width: `${value}%`,
          }}
        />
      </div>
    </div>
  );
}

function DirectorTopInsights() {
  const { state } = useAfraFlow();

  const activeScene = useMemo(() => {
    return state.entities.scenes.find((scene) => scene.id === state.ui.activeSceneId) || null;
  }, [state.entities.scenes, state.ui.activeSceneId]);

  const activeShot = useMemo(() => {
    return state.entities.shots.find((shot) => shot.id === state.ui.activeShotId) || null;
  }, [state.entities.shots, state.ui.activeShotId]);

  const activeSceneShots = useMemo(() => {
    if (!activeScene) return [];
    return state.entities.shots
      .filter((shot) => shot.sceneId === activeScene.id)
      .sort((a, b) => {
        const aNum =
          typeof a.shotNumber === "number" ? a.shotNumber : Number.MAX_SAFE_INTEGER;
        const bNum =
          typeof b.shotNumber === "number" ? b.shotNumber : Number.MAX_SAFE_INTEGER;
        return aNum - bNum;
      });
  }, [state.entities.shots, activeScene]);

  const activeSceneDialogues = useMemo(() => {
    if (!activeScene) return [];
    return state.entities.dialogues
      .filter((dialogue) => dialogue.sceneId === activeScene.id)
      .sort((a, b) => a.order - b.order);
  }, [state.entities.dialogues, activeScene]);

  const activeSceneCharacters = useMemo(() => {
    if (!activeScene) return [];
    return safeArray(activeScene.characterIds)
      .map((characterId) =>
        state.entities.characters.find((character) => character.id === characterId) || null
      )
      .filter(Boolean);
  }, [activeScene, state.entities.characters]);

  const storyCoverage = useMemo(() => {
    if (!state.entities.scenes.length) return 0;

    const covered = state.entities.scenes.filter(
      (scene) => normalizeText(scene.summary) || safeArray(scene.beatOutline).length
    ).length;

    return clampPercent((covered / state.entities.scenes.length) * 100);
  }, [state.entities.scenes]);

  const shotCoverage = useMemo(() => {
    if (!state.entities.scenes.length) return 0;

    const covered = state.entities.scenes.filter((scene) =>
      state.entities.shots.some((shot) => shot.sceneId === scene.id)
    ).length;

    return clampPercent((covered / state.entities.scenes.length) * 100);
  }, [state.entities.scenes, state.entities.shots]);

  const dialogueCoverage = useMemo(() => {
    if (!state.entities.scenes.length) return 0;

    const covered = state.entities.scenes.filter((scene) =>
      state.entities.dialogues.some((dialogue) => dialogue.sceneId === scene.id)
    ).length;

    return clampPercent((covered / state.entities.scenes.length) * 100);
  }, [state.entities.scenes, state.entities.dialogues]);

  const recentTopics = safeArray(state.memory.recentTopics).slice(-8);

  const activeSceneSummaryText = activeScene
    ? [
        activeScene.summary ? `خلاصه: ${activeScene.summary}` : "",
        activeScene.conflict ? `کانفلیکت: ${activeScene.conflict}` : "",
        activeScene.purpose ? `هدف: ${activeScene.purpose}` : "",
      ]
        .filter(Boolean)
        .join(" | ")
    : "";

  const activeShotSummaryText = activeShot
    ? [
        activeShot.shotSize ? `سایز: ${activeShot.shotSize}` : "",
        activeShot.cameraAngle ? `زاویه: ${activeShot.cameraAngle}` : "",
        activeShot.cameraMove ? `حرکت: ${activeShot.cameraMove}` : "",
        activeShot.lighting ? `نور: ${activeShot.lighting}` : "",
      ]
        .filter(Boolean)
        .join(" | ")
    : "";

  const draftStatusText = state.outputs.generatedStoryboardDraft
    ? "Storyboard Draft آماده است"
    : state.outputs.generatedDialogueDraft
    ? "Dialogue Draft آماده است"
    : "هنوز Draft جدیدی تولید نشده";

  const projectHealthText = useMemo(() => {
    if (!state.entities.scenes.length) return "پروژه هنوز صحنه‌ای ندارد.";

    const missingSummary = state.entities.scenes.filter(
      (scene) => !normalizeText(scene.summary)
    ).length;
    const missingShots = state.entities.scenes.filter(
      (scene) => !state.entities.shots.some((shot) => shot.sceneId === scene.id)
    ).length;
    const missingDialogues = state.entities.scenes.filter(
      (scene) => !state.entities.dialogues.some((dialogue) => dialogue.sceneId === scene.id)
    ).length;

    return [
      missingSummary ? `${missingSummary} صحنه بدون خلاصه` : "همه صحنه‌ها خلاصه دارند",
      missingShots ? `${missingShots} صحنه بدون شات` : "همه صحنه‌ها شات دارند",
      missingDialogues ? `${missingDialogues} صحنه بدون دیالوگ` : "همه صحنه‌ها دیالوگ دارند",
    ].join(" | ");
  }, [state.entities.scenes, state.entities.shots, state.entities.dialogues]);

  const systemBadge = state.ui.lastError
    ? { style: alertBadgeStyle, text: "HAS ISSUE" }
    : state.ui.isThinking
    ? { style: statusBadgeStyle, text: "COPILOT THINKING" }
    : { style: statusBadgeStyle, text: "COPILOT READY" };

  return (
    <section style={panelStyle}>
      <div style={headerRowStyle}>
        <div style={titleWrapStyle}>
          <h2 style={titleStyle}>Director Insights</h2>
          <p style={subtitleStyle}>
            نمای سریع از وضعیت فعلی پروژه، صحنه فعال، شات فعال، پوشش دیالوگ و استوری‌بورد
            و آمادگی کلی پروژه برای ادامه کارگردانی.
          </p>
        </div>

        <div style={statusWrapStyle}>
          <span style={warmBadgeStyle}>DEVELOPMENT MODE</span>
          <span style={statusBadgeStyle}>{state.assistant.systemStatus || "ready"}</span>
          <span style={systemBadge.style}>{systemBadge.text}</span>
        </div>
      </div>

      <div style={gridStyle}>
        <StatCard
          label="Scenes"
          value={state.entities.scenes.length}
          meta={`${storyCoverage}% دارای خلاصه یا Beat`}
        />
        <StatCard
          label="Dialogues"
          value={state.entities.dialogues.length}
          meta={`${dialogueCoverage}% پوشش صحنه‌ها`}
        />
        <StatCard
          label="Shots"
          value={state.entities.shots.length}
          meta={`${shotCoverage}% پوشش Storyboard`}
        />
        <StatCard
          label="Characters"
          value={state.entities.characters.length}
          meta={state.project.current?.title || "بدون پروژه فعال"}
        />
      </div>

      <div style={insightCardStyle}>
        <div style={insightTitleStyle}>Coverage Overview</div>
        <ProgressBlock
          title="Story Coverage"
          value={storyCoverage}
          fillStyle={{
            background: "linear-gradient(90deg, rgba(255,215,0,0.88), rgba(255,215,0,0.55))",
          }}
        />
        <ProgressBlock
          title="Dialogue Coverage"
          value={dialogueCoverage}
          fillStyle={{
            background: "linear-gradient(90deg, rgba(87,221,210,0.88), rgba(87,221,210,0.55))",
          }}
        />
        <ProgressBlock
          title="Storyboard Coverage"
          value={shotCoverage}
          fillStyle={{
            background: "linear-gradient(90deg, rgba(129,140,248,0.88), rgba(129,140,248,0.55))",
          }}
        />
      </div>

      {!activeScene ? (
        <div style={emptyStateStyle}>
          هنوز صحنه فعالی انتخاب نشده. از Scene List یک صحنه انتخاب کن تا Insightهای
          کارگردانی برای همان صحنه دقیق‌تر نمایش داده شود.
        </div>
      ) : (
        <div style={highlightGridStyle}>
          <InsightCard
            title="Active Scene"
            main={activeScene.title || "—"}
            sub={
              activeSceneSummaryText ||
              "برای این صحنه هنوز خلاصه یا اطلاعات کارگردانی کامل ثبت نشده."
            }
          />

          <InsightCard
            title="Scene Coverage"
            main={`${activeSceneDialogues.length} دیالوگ | ${activeSceneShots.length} شات`}
            sub={
              activeSceneCharacters.length
                ? `شخصیت‌های صحنه: ${activeSceneCharacters
                    .map((item) => item.name)
                    .join(" ، ")}`
                : "هنوز شخصیتی به این صحنه وصل نشده."
            }
          />

          <InsightCard
            title="Active Shot"
            main={activeShot?.title || "شات فعالی انتخاب نشده"}
            sub={
              activeShotSummaryText ||
              "بعد از ساخت Storyboard، اطلاعات شات فعال اینجا نمایش داده می‌شود."
            }
          />

          <InsightCard
            title="Draft Status"
            main={draftStatusText}
            sub={
              state.assistant.memorySummary ||
              "خلاصه حافظه گفتگو هنوز برای این مرحله تکمیل نشده."
            }
          />
        </div>
      )}

      <div style={highlightGridStyle}>
        <InsightCard
          title="Project Health"
          main={state.project.current?.title || "بدون پروژه فعال"}
          sub={projectHealthText}
        />

        <InsightCard
          title="Director Notes"
          main={normalizeText(state.outputs.directorNotes) || "ثبت نشده"}
          sub="آخرین نوت ثبت‌شده برای دیالوگ یا استوری‌بورد در اینجا خلاصه می‌شود."
        />
      </div>

      <div style={insightCardStyle}>
        <div style={insightTitleStyle}>Recent Topics</div>
        {recentTopics.length ? (
          <div style={topicRowStyle}>
            {recentTopics.map((topic, index) => (
              <span key={`${topic}_${index}`} style={topicStyle}>
                {topic}
              </span>
            ))}
          </div>
        ) : (
          <div style={insightSubStyle}>
            هنوز موضوع اخیر ثبت نشده. با کار روی صحنه‌ها، دیالوگ‌ها و شات‌ها این بخش پر
            می‌شود.
          </div>
        )}
      </div>

      <div style={footerStyle}>
        <div style={footerTextStyle}>
          پروژه فعال: <strong>{state.project.current?.title || "ندارد"}</strong>
        </div>

        <div style={footerTextStyle}>
          intent اخیر: <strong>{state.assistant.activeIntent || "general"}</strong>
        </div>
      </div>
    </section>
  );
}

export default DirectorTopInsights;