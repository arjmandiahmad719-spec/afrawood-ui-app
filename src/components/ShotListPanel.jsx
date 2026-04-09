import React, { useEffect, useMemo, useState } from "react";
import { generateImageForShot, getImageEngineInfo } from "../ai/imageAI";

function normalizeShots(input) {
  if (Array.isArray(input)) return input;
  if (Array.isArray(input?.shots)) return input.shots;
  return [];
}

function buildShotId(shot, index) {
  return (
    shot?.id ||
    shot?.shotId ||
    shot?.uuid ||
    shot?.key ||
    `shot-${index + 1}`
  );
}

function buildShotTitle(shot, index) {
  return (
    shot?.title ||
    shot?.name ||
    shot?.label ||
    shot?.shotTitle ||
    `Shot ${index + 1}`
  );
}

function buildShotPrompt(shot) {
  return (
    shot?.finalPrompt ||
    shot?.imagePrompt ||
    shot?.visualPrompt ||
    shot?.prompt ||
    shot?.text ||
    shot?.description ||
    shot?.summary ||
    shot?.sceneDescription ||
    shot?.story ||
    "cinematic portrait, ultra realistic, detailed"
  );
}

function getShotPreview(shot) {
  return (
    shot?.imageUrl ||
    shot?.image ||
    shot?.preview ||
    shot?.thumbnail ||
    shot?.dataUrl ||
    shot?.lastImageResult?.imageUrl ||
    ""
  );
}

function getStatusLabel(status) {
  if (status === "loading") return "در حال ساخت...";
  if (status === "success") return "ساخته شد";
  if (status === "error") return "خطا";
  return "آماده";
}

export default function ShotListPanel({
  shots: incomingShots = [],
  onUpdateShot,
  onSelectShot,
  selectedShotId,
}) {
  const shots = useMemo(() => normalizeShots(incomingShots), [incomingShots]);
  const [activeId, setActiveId] = useState(selectedShotId || null);
  const [statusMap, setStatusMap] = useState({});
  const [errorMap, setErrorMap] = useState({});
  const [localImages, setLocalImages] = useState({});
  const [localPrompts, setLocalPrompts] = useState({});
  const engine = getImageEngineInfo();

  useEffect(() => {
    setActiveId(selectedShotId || null);
  }, [selectedShotId]);

  useEffect(() => {
    const nextImages = {};
    const nextPrompts = {};

    shots.forEach((shot, index) => {
      const id = buildShotId(shot, index);
      const preview = getShotPreview(shot);
      const prompt = buildShotPrompt(shot);

      if (preview) nextImages[id] = preview;
      if (prompt) nextPrompts[id] = prompt;
    });

    setLocalImages((prev) => ({
      ...prev,
      ...nextImages,
    }));

    setLocalPrompts((prev) => ({
      ...prev,
      ...nextPrompts,
    }));
  }, [shots]);

  const currentSelectedId = selectedShotId || activeId;

  const handleSelect = (shot, index) => {
    const id = buildShotId(shot, index);
    setActiveId(id);

    if (typeof onSelectShot === "function") {
      onSelectShot(shot, index);
    }
  };

  const handlePromptChange = (shot, index, value) => {
    const id = buildShotId(shot, index);

    setLocalPrompts((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleGenerate = async (shot, index) => {
    const id = buildShotId(shot, index);
    const title = buildShotTitle(shot, index);
    const prompt = String(localPrompts[id] || buildShotPrompt(shot)).trim();

    setStatusMap((prev) => ({ ...prev, [id]: "loading" }));
    setErrorMap((prev) => ({ ...prev, [id]: "" }));

    try {
      const imageUrl = await generateImageForShot(prompt);

      if (!imageUrl) {
        throw new Error(`لینک تصویر برای شات «${title}» برنگشت`);
      }

      setLocalImages((prev) => ({
        ...prev,
        [id]: imageUrl,
      }));

      setStatusMap((prev) => ({ ...prev, [id]: "success" }));

      if (typeof onUpdateShot === "function") {
        onUpdateShot(
          {
            ...shot,
            prompt,
            image: imageUrl,
            imageUrl: imageUrl,
            dataUrl: "",
            preview: imageUrl,
            thumbnail: imageUrl,
            lastImageResult: {
              imageUrl: imageUrl,
            },
          },
          index
        );
      }

      console.log(`IMAGE GENERATED FOR ${title}:`, imageUrl);
    } catch (error) {
      const message =
        error?.message || `خطا در تصویرسازی شات «${title}»`;

      setStatusMap((prev) => ({ ...prev, [id]: "error" }));
      setErrorMap((prev) => ({ ...prev, [id]: message }));

      console.error(`خطا در تصویرسازی شات «${title}»:`, error);
    }
  };

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>Shot List</div>
          <div style={styles.subTitle}>
            موتور تصویر: {engine?.name || engine?.label || "ComfyUI"}
            {engine?.baseUrl ? ` — ${engine.baseUrl}` : ""}
          </div>
        </div>
        <div style={styles.badge}>{shots.length} Shot</div>
      </div>

      {shots.length === 0 ? (
        <div style={styles.emptyBox}>
          <div style={styles.emptyTitle}>هیچ شاتی وجود ندارد</div>
          <div style={styles.emptyText}>
            اول شات‌ها را بساز، بعد از همینجا برای هر شات تصویر تولید کن.
          </div>
        </div>
      ) : (
        <div style={styles.list}>
          {shots.map((shot, index) => {
            const id = buildShotId(shot, index);
            const title = buildShotTitle(shot, index);
            const preview = localImages[id] || getShotPreview(shot) || "";
            const prompt =
              localPrompts[id] !== undefined
                ? localPrompts[id]
                : buildShotPrompt(shot);
            const status = statusMap[id] || "idle";
            const error = errorMap[id] || "";
            const isSelected = currentSelectedId === id;

            return (
              <div
                key={id}
                style={{
                  ...styles.card,
                  ...(isSelected ? styles.cardSelected : null),
                }}
                onClick={() => handleSelect(shot, index)}
              >
                <div style={styles.cardTop}>
                  <div>
                    <div style={styles.cardTitle}>{title}</div>
                    <div style={styles.cardMeta}>
                      {getStatusLabel(status)}
                    </div>
                  </div>
                  <div style={styles.indexBadge}>{index + 1}</div>
                </div>

                <textarea
                  value={prompt}
                  onChange={(e) =>
                    handlePromptChange(shot, index, e.target.value)
                  }
                  onClick={(e) => e.stopPropagation()}
                  style={styles.textarea}
                  placeholder="پرامپت تصویر این شات را بنویس..."
                />

                <div style={styles.actions}>
                  <button
                    type="button"
                    style={{
                      ...styles.button,
                      ...(status === "loading" ? styles.buttonDisabled : null),
                    }}
                    disabled={status === "loading"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerate(shot, index);
                    }}
                  >
                    {status === "loading" ? "در حال ساخت..." : "Generate Image"}
                  </button>
                </div>

                {error ? <div style={styles.error}>{error}</div> : null}

                <div style={styles.previewBox}>
                  {preview ? (
                    <img
                      key={preview}
                      src={preview}
                      alt={title}
                      style={styles.image}
                    />
                  ) : (
                    <div style={styles.placeholder}>
                      تصویر این شات هنوز ساخته نشده
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  panel: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    height: "100%",
    minHeight: 0,
    padding: 16,
    color: "#f5f7fb",
    background:
      "linear-gradient(180deg, rgba(10,14,20,0.98), rgba(14,18,26,0.96))",
    border: "1px solid rgba(93, 173, 226, 0.15)",
    borderRadius: 20,
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 800,
    letterSpacing: 0.3,
  },
  subTitle: {
    marginTop: 4,
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
  },
  badge: {
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(93, 173, 226, 0.14)",
    border: "1px solid rgba(93, 173, 226, 0.2)",
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  list: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 16,
    overflow: "auto",
    paddingRight: 4,
  },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
    cursor: "pointer",
  },
  cardSelected: {
    border: "1px solid rgba(93, 173, 226, 0.45)",
    boxShadow: "0 10px 30px rgba(93,173,226,0.12)",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 800,
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 12,
    color: "rgba(255,255,255,0.62)",
  },
  indexBadge: {
    minWidth: 32,
    height: 32,
    display: "grid",
    placeItems: "center",
    borderRadius: 10,
    background: "rgba(255,255,255,0.06)",
    fontSize: 12,
    fontWeight: 800,
  },
  textarea: {
    width: "100%",
    minHeight: 96,
    resize: "vertical",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(6,10,16,0.85)",
    color: "#ffffff",
    padding: 12,
    fontSize: 13,
    lineHeight: 1.6,
    outline: "none",
    boxSizing: "border-box",
  },
  actions: {
    display: "flex",
    gap: 10,
  },
  button: {
    border: "none",
    borderRadius: 12,
    padding: "11px 14px",
    fontSize: 13,
    fontWeight: 800,
    background: "linear-gradient(135deg, #29b6f6, #5dade2)",
    color: "#081018",
    cursor: "pointer",
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  previewBox: {
    width: "100%",
    minHeight: 260,
    borderRadius: 16,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(6,10,16,0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  placeholder: {
    padding: 20,
    textAlign: "center",
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
  },
  error: {
    borderRadius: 12,
    padding: "10px 12px",
    background: "rgba(255, 84, 84, 0.1)",
    border: "1px solid rgba(255, 84, 84, 0.2)",
    color: "#ff9e9e",
    fontSize: 12,
    lineHeight: 1.7,
  },
  emptyBox: {
    padding: 24,
    borderRadius: 18,
    background: "rgba(255,255,255,0.03)",
    border: "1px dashed rgba(255,255,255,0.12)",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 800,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.62)",
    lineHeight: 1.8,
  },
};