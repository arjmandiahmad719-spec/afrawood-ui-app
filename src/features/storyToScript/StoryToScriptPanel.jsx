import React, { useEffect, useMemo, useState } from "react";
import { useAfraFlow } from "../../ai/core/AfraFlowContext";
import { runCopilotDirectorCommand } from "../../ai/core/CopilotEngine";

const shellStyle = {
  width: "100%",
  display: "grid",
  gap: 18,
  padding: 20,
  borderRadius: 28,
  background:
    "linear-gradient(180deg, rgba(8,12,18,0.98) 0%, rgba(11,16,24,0.98) 100%)",
  border: "1px solid rgba(87,221,210,0.14)",
  boxShadow: "0 24px 80px rgba(0,0,0,0.28)",
  color: "#f5f7fb",
};

const headerStyle = {
  display: "grid",
  gap: 8,
};

const titleStyle = {
  fontSize: 24,
  fontWeight: 900,
};

const subStyle = {
  fontSize: 13,
  color: "rgba(255,255,255,0.7)",
  lineHeight: 1.9,
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.1fr) minmax(320px, 0.9fr)",
  gap: 18,
  alignItems: "start",
};

const columnStyle = {
  display: "grid",
  gap: 18,
  minWidth: 0,
};

const cardStyle = {
  display: "grid",
  gap: 14,
  padding: 18,
  borderRadius: 24,
  background: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const cardTitleStyle = {
  fontSize: 18,
  fontWeight: 800,
};

const labelStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: "rgba(255,255,255,0.72)",
};

const inputStyle = {
  width: "100%",
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(3,5,10,0.62)",
  color: "#f8fbff",
  padding: "12px 14px",
  fontSize: 14,
  outline: "none",
};

const textareaStyle = {
  ...inputStyle,
  minHeight: 120,
  resize: "vertical",
  lineHeight: 1.9,
};

const row2Style = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
};

const row3Style = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 12,
};

const buttonRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
};

const primaryButtonStyle = {
  border: "none",
  borderRadius: 16,
  padding: "12px 16px",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
  background: "linear-gradient(135deg, #f5c66d 0%, #57ddd2 100%)",
  color: "#071018",
};

const secondaryButtonStyle = {
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 16,
  padding: "12px 16px",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
  background: "rgba(255,255,255,0.04)",
  color: "#f5f7fb",
};

const chipWrapStyle = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const chipStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "7px 11px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  color: "#dffcf7",
  background: "rgba(87,221,210,0.1)",
  border: "1px solid rgba(87,221,210,0.16)",
};

const outputStyle = {
  minHeight: 120,
  padding: 16,
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(0,0,0,0.22)",
  whiteSpace: "pre-wrap",
  lineHeight: 1.9,
  fontSize: 14,
  color: "#eef8ff",
};

const listStyle = {
  display: "grid",
  gap: 10,
};

const listItemStyle = {
  padding: 14,
  borderRadius: 18,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.07)",
};

const listTitleStyle = {
  fontSize: 14,
  fontWeight: 800,
  marginBottom: 6,
};

const listSubStyle = {
  fontSize: 12,
  color: "rgba(255,255,255,0.72)",
  lineHeight: 1.8,
};

const emptyStyle = {
  padding: 18,
  borderRadius: 18,
  border: "1px dashed rgba(255,255,255,0.12)",
  color: "rgba(255,255,255,0.68)",
  background: "rgba(255,255,255,0.02)",
};

const memoryBoxStyle = {
  padding: 14,
  borderRadius: 18,
  background: "rgba(87,221,210,0.08)",
  border: "1px solid rgba(87,221,210,0.14)",
  color: "#dffcf7",
  fontSize: 12,
  lineHeight: 1.9,
};

const normalizeText = (value) => String(value || "").trim();

const splitTags = (value) =>
  String(value || "")
    .split(/[،,|]/)
    .map((item) => item.trim())
    .filter(Boolean);

function StorySummaryPanel({ story, project }) {
  const sections = [
    { title: "ایده خام / لاگلاین", value: story?.rawIdea },
    { title: "Outline", value: story?.outline },
    { title: "Synopsis", value: story?.synopsis },
    { title: "Treatment", value: story?.treatment },
  ].filter((item) => normalizeText(item.value));

  const chips = useMemo(() => {
    const items = [];
    if (project?.title) items.push(`پروژه: ${project.title}`);
    if (project?.genre) items.push(`ژانر: ${project.genre}`);
    if (project?.tone) items.push(`لحن: ${project.tone}`);
    if (project?.language) items.push(`زبان: ${project.language}`);
    return items;
  }, [project]);

  if (!sections.length && !chips.length) return null;

  return (
    <div style={cardStyle}>
      <div style={cardTitleStyle}>خلاصه مرکزی پروژه</div>

      {chips.length ? (
        <div style={chipWrapStyle}>
          {chips.map((item) => (
            <span key={item} style={chipStyle}>
              {item}
            </span>
          ))}
        </div>
      ) : null}

      {sections.map((section) => (
        <div key={section.title}>
          <div style={labelStyle}>{section.title}</div>
          <div style={outputStyle}>{section.value}</div>
        </div>
      ))}
    </div>
  );
}

function CharacterList({ characters }) {
  if (!characters.length) return null;

  return (
    <div style={cardStyle}>
      <div style={cardTitleStyle}>شخصیت‌های ثبت‌شده</div>

      <div style={listStyle}>
        {characters.map((item) => (
          <div key={item.id} style={listItemStyle}>
            <div style={listTitleStyle}>{item.name}</div>
            <div style={listSubStyle}>
              {[
                item.role ? `نقش: ${item.role}` : "",
                item.age ? `سن: ${item.age}` : "",
                item.archetype ? `آرکتایپ: ${item.archetype}` : "",
              ]
                .filter(Boolean)
                .join(" | ") || "مشخصات تکمیل نشده"}
            </div>
            {item.description ? (
              <div style={{ ...listSubStyle, marginTop: 8 }}>{item.description}</div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function SceneList({ scenes, getNamesByIds }) {
  if (!scenes.length) return null;

  return (
    <div style={cardStyle}>
      <div style={cardTitleStyle}>صحنه‌های ثبت‌شده</div>

      <div style={listStyle}>
        {scenes.map((item) => (
          <div key={item.id} style={listItemStyle}>
            <div style={listTitleStyle}>{item.title}</div>
            <div style={listSubStyle}>
              {[
                item.location ? `لوکیشن: ${item.location}` : "",
                item.timeOfDay ? `زمان: ${item.timeOfDay}` : "",
                item.mood ? `مود: ${item.mood}` : "",
              ]
                .filter(Boolean)
                .join(" | ") || "اطلاعات صحنه تکمیل نشده"}
            </div>
            {item.summary ? (
              <div style={{ ...listSubStyle, marginTop: 8 }}>{item.summary}</div>
            ) : null}
            {item.characterIds?.length ? (
              <div style={{ ...listSubStyle, marginTop: 8 }}>
                شخصیت‌ها: {getNamesByIds(item.characterIds).join("، ")}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StoryToScriptPanel() {
  const { state, actions } = useAfraFlow();

  const [projectForm, setProjectForm] = useState({
    title: "",
    type: "film",
    genre: "",
    tone: "",
    language: "fa",
    logline: "",
    premise: "",
    synopsis: "",
    world: "",
    themes: "",
    tags: "",
  });

  const [storyForm, setStoryForm] = useState({
    rawIdea: "",
    outline: "",
    synopsis: "",
    treatment: "",
    notes: "",
  });

  const [quickPrompt, setQuickPrompt] = useState("");

  const project = state?.project?.current || null;
  const story = state?.story || {};
  const characters = state?.entities?.characters || [];
  const scenes = state?.entities?.scenes || [];
  const dialogueDraft = state?.outputs?.generatedDialogueDraft || "";
  const directorNotes = state?.outputs?.directorNotes || "";
  const memorySummary = state?.memory?.conversationSummary || "";
  const recentTopics = state?.memory?.recentTopics || [];

  useEffect(() => {
    setProjectForm({
      title: project?.title || "",
      type: project?.type || "film",
      genre: project?.genre || "",
      tone: project?.tone || "",
      language: project?.language || "fa",
      logline: project?.logline || "",
      premise: project?.premise || "",
      synopsis: project?.synopsis || "",
      world: project?.world || "",
      themes: (project?.themes || []).join("، "),
      tags: (project?.tags || []).join("، "),
    });
  }, [
    project?.id,
    project?.title,
    project?.type,
    project?.genre,
    project?.tone,
    project?.language,
    project?.logline,
    project?.premise,
    project?.synopsis,
    project?.world,
    JSON.stringify(project?.themes || []),
    JSON.stringify(project?.tags || []),
  ]);

  useEffect(() => {
    setStoryForm({
      rawIdea: story?.rawIdea || "",
      outline: story?.outline || "",
      synopsis: story?.synopsis || "",
      treatment: story?.treatment || "",
      notes: story?.notes || "",
    });
  }, [
    story?.rawIdea,
    story?.outline,
    story?.synopsis,
    story?.treatment,
    story?.notes,
  ]);

  const getNamesByIds = (ids) =>
    (Array.isArray(ids) ? ids : [])
      .map((id) => state?.indexes?.characterMap?.[id]?.name)
      .filter(Boolean);

  const handleProjectChange = (field, value) => {
    setProjectForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStoryChange = (field, value) => {
    setStoryForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProject = () => {
    const payload = {
      title: normalizeText(projectForm.title) || "پروژه جدید Afrawood",
      type: normalizeText(projectForm.type) || "film",
      genre: normalizeText(projectForm.genre),
      tone: normalizeText(projectForm.tone),
      language: normalizeText(projectForm.language) || "fa",
      logline: normalizeText(projectForm.logline),
      premise: normalizeText(projectForm.premise),
      synopsis: normalizeText(projectForm.synopsis),
      world: normalizeText(projectForm.world),
      themes: splitTags(projectForm.themes),
      tags: splitTags(projectForm.tags),
    };

    if (project) {
      actions.updateProject(payload);
      actions.appendChatMessage?.({
        role: "assistant",
        text: `پروژه بروزرسانی شد: ${payload.title}`,
        type: "assistant",
        meta: { intent: "update_project", command: "panel-save-project" },
      });
      return;
    }

    actions.createProject(payload);
    actions.appendChatMessage?.({
      role: "assistant",
      text: `پروژه ساخته شد: ${payload.title}`,
      type: "assistant",
      meta: { intent: "create_project", command: "panel-create-project" },
    });
  };

  const handleSaveStory = () => {
    actions.mergeStory({
      rawIdea: storyForm.rawIdea,
      outline: storyForm.outline,
      synopsis: storyForm.synopsis,
      treatment: storyForm.treatment,
      notes: storyForm.notes,
    });

    if (project) {
      actions.updateProject({
        logline: normalizeText(projectForm.logline),
        premise: normalizeText(projectForm.premise),
        synopsis: normalizeText(projectForm.synopsis),
        world: normalizeText(projectForm.world),
      });
    }

    actions.appendChatMessage?.({
      role: "assistant",
      text: "اطلاعات Story / Script در هسته مرکزی ذخیره شد.",
      type: "assistant",
      meta: { intent: "story_update", command: "panel-save-story" },
    });
  };

  const handleQuickCommand = async () => {
    const text = normalizeText(quickPrompt);
    if (!text) return;

    try {
      await runCopilotDirectorCommand({
        input: text,
        state,
        actions,
      });
      setQuickPrompt("");
    } catch (error) {
      actions.setError?.(error?.message || "خطا در اجرای دستور");
    }
  };

  const buildFromStory = async () => {
    const prompt = [
      projectForm.title ? `عنوان پروژه: ${projectForm.title}` : "",
      projectForm.genre ? `ژانر: ${projectForm.genre}` : "",
      projectForm.tone ? `لحن: ${projectForm.tone}` : "",
      storyForm.rawIdea ? `لاگلاین: ${storyForm.rawIdea}` : "",
      storyForm.synopsis ? `خلاصه: ${storyForm.synopsis}` : "",
      storyForm.outline ? `اوتلاین: ${storyForm.outline}` : "",
      "اطلاعات داستان را به هسته پروژه اضافه کن",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await runCopilotDirectorCommand({
        input: prompt,
        state,
        actions,
      });
    } catch (error) {
      actions.setError?.(error?.message || "خطا در ساخت از روی داستان");
    }
  };

  const fillFromMemory = () => {
    const refs = state?.memory?.references || {};
    const refProject =
      state?.project?.current ||
      state?.project?.list?.find((item) => item.id === refs.lastProjectId) ||
      null;

    if (refProject) {
      setProjectForm({
        title: refProject?.title || "",
        type: refProject?.type || "film",
        genre: refProject?.genre || "",
        tone: refProject?.tone || "",
        language: refProject?.language || "fa",
        logline: refProject?.logline || "",
        premise: refProject?.premise || "",
        synopsis: refProject?.synopsis || "",
        world: refProject?.world || "",
        themes: (refProject?.themes || []).join("، "),
        tags: (refProject?.tags || []).join("، "),
      });
    }

    setStoryForm({
      rawIdea: story?.rawIdea || "",
      outline: story?.outline || "",
      synopsis: story?.synopsis || "",
      treatment: story?.treatment || "",
      notes: story?.notes || "",
    });
  };

  const hasProjectSummary =
    normalizeText(story?.rawIdea) ||
    normalizeText(story?.outline) ||
    normalizeText(story?.synopsis) ||
    normalizeText(story?.treatment) ||
    project?.title;

  return (
    <section style={shellStyle}>
      <header style={headerStyle}>
        <div style={titleStyle}>Story To Script Panel</div>
        <div style={subStyle}>
          این پنل مستقیم به هسته مرکزی Afrawood و حافظه مکالمه وصل است. پروژه،
          داستان، صحنه و خروجی‌ها همگی از همان هسته خوانده و ذخیره می‌شوند.
        </div>
      </header>

      <div style={memoryBoxStyle}>
        {memorySummary || "حافظه گفتگو هنوز خلاصه‌ای ندارد."}
        {recentTopics.length ? (
          <div style={{ marginTop: 8 }}>
            موضوعات اخیر: {recentTopics.join(" | ")}
          </div>
        ) : null}
      </div>

      <div style={gridStyle}>
        <div style={columnStyle}>
          <div style={cardStyle}>
            <div style={cardTitleStyle}>اطلاعات پروژه</div>

            <div style={row2Style}>
              <div>
                <div style={labelStyle}>عنوان پروژه</div>
                <input
                  style={inputStyle}
                  value={projectForm.title}
                  onChange={(e) => handleProjectChange("title", e.target.value)}
                />
              </div>

              <div>
                <div style={labelStyle}>نوع پروژه</div>
                <input
                  style={inputStyle}
                  value={projectForm.type}
                  onChange={(e) => handleProjectChange("type", e.target.value)}
                />
              </div>
            </div>

            <div style={row3Style}>
              <div>
                <div style={labelStyle}>ژانر</div>
                <input
                  style={inputStyle}
                  value={projectForm.genre}
                  onChange={(e) => handleProjectChange("genre", e.target.value)}
                />
              </div>

              <div>
                <div style={labelStyle}>لحن</div>
                <input
                  style={inputStyle}
                  value={projectForm.tone}
                  onChange={(e) => handleProjectChange("tone", e.target.value)}
                />
              </div>

              <div>
                <div style={labelStyle}>زبان</div>
                <input
                  style={inputStyle}
                  value={projectForm.language}
                  onChange={(e) => handleProjectChange("language", e.target.value)}
                />
              </div>
            </div>

            <div>
              <div style={labelStyle}>لاگلاین پروژه</div>
              <textarea
                style={textareaStyle}
                value={projectForm.logline}
                onChange={(e) => handleProjectChange("logline", e.target.value)}
              />
            </div>

            <div>
              <div style={labelStyle}>Premise</div>
              <textarea
                style={textareaStyle}
                value={projectForm.premise}
                onChange={(e) => handleProjectChange("premise", e.target.value)}
              />
            </div>

            <div>
              <div style={labelStyle}>World</div>
              <textarea
                style={textareaStyle}
                value={projectForm.world}
                onChange={(e) => handleProjectChange("world", e.target.value)}
              />
            </div>

            <div style={row2Style}>
              <div>
                <div style={labelStyle}>تم‌ها</div>
                <input
                  style={inputStyle}
                  value={projectForm.themes}
                  onChange={(e) => handleProjectChange("themes", e.target.value)}
                />
              </div>

              <div>
                <div style={labelStyle}>تگ‌ها</div>
                <input
                  style={inputStyle}
                  value={projectForm.tags}
                  onChange={(e) => handleProjectChange("tags", e.target.value)}
                />
              </div>
            </div>

            <div style={buttonRowStyle}>
              <button type="button" style={primaryButtonStyle} onClick={handleSaveProject}>
                ذخیره پروژه
              </button>

              <button type="button" style={secondaryButtonStyle} onClick={fillFromMemory}>
                پرکردن از حافظه
              </button>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={cardTitleStyle}>Story / Script Source</div>

            <div>
              <div style={labelStyle}>ایده خام</div>
              <textarea
                style={textareaStyle}
                value={storyForm.rawIdea}
                onChange={(e) => handleStoryChange("rawIdea", e.target.value)}
              />
            </div>

            <div>
              <div style={labelStyle}>Outline</div>
              <textarea
                style={textareaStyle}
                value={storyForm.outline}
                onChange={(e) => handleStoryChange("outline", e.target.value)}
              />
            </div>

            <div>
              <div style={labelStyle}>Synopsis</div>
              <textarea
                style={textareaStyle}
                value={storyForm.synopsis}
                onChange={(e) => handleStoryChange("synopsis", e.target.value)}
              />
            </div>

            <div>
              <div style={labelStyle}>Treatment</div>
              <textarea
                style={textareaStyle}
                value={storyForm.treatment}
                onChange={(e) => handleStoryChange("treatment", e.target.value)}
              />
            </div>

            <div>
              <div style={labelStyle}>یادداشت</div>
              <textarea
                style={textareaStyle}
                value={storyForm.notes}
                onChange={(e) => handleStoryChange("notes", e.target.value)}
              />
            </div>

            <div style={buttonRowStyle}>
              <button type="button" style={primaryButtonStyle} onClick={handleSaveStory}>
                ذخیره Story
              </button>

              <button type="button" style={secondaryButtonStyle} onClick={buildFromStory}>
                ارسال به هسته
              </button>
            </div>
          </div>

          {hasProjectSummary ? <StorySummaryPanel story={story} project={project} /> : null}
        </div>

        <div style={columnStyle}>
          <div style={cardStyle}>
            <div style={cardTitleStyle}>دستور سریع برای Copilot</div>

            <div style={labelStyle}>پیام مستقیم به هسته</div>
            <textarea
              style={textareaStyle}
              value={quickPrompt}
              onChange={(e) => setQuickPrompt(e.target.value)}
              placeholder="مثال: صحنه بساز: عنوان صحنه: ملاقات شبانه | لوکیشن: خیابان خلوت | شخصیت‌ها: آرمان، سارا"
            />

            <div style={buttonRowStyle}>
              <button type="button" style={primaryButtonStyle} onClick={handleQuickCommand}>
                اجرای دستور
              </button>
            </div>
          </div>

          <CharacterList characters={characters} />
          <SceneList scenes={scenes} getNamesByIds={getNamesByIds} />

          {normalizeText(dialogueDraft) ? (
            <div style={cardStyle}>
              <div style={cardTitleStyle}>خروجی دیالوگ</div>
              <div style={outputStyle}>{dialogueDraft}</div>
            </div>
          ) : null}

          {normalizeText(directorNotes) ? (
            <div style={cardStyle}>
              <div style={cardTitleStyle}>Director Notes</div>
              <div style={outputStyle}>{directorNotes}</div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}