import { useState } from "react";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";

function getUiText(language) {
  const map = {
    fa: {
      copy: "کپی فیلمنامه",
      word: "دانلود Word",
      pdf: "دانلود PDF",
      logline: "لاگ‌لاین",
      overall: "خلاصه کل فیلمنامه",
      episodes: "قسمت‌ها",
      scenes: "صحنه‌ها",
      duration: "زمان",
      summary: "خلاصه",
      cliffhanger: "پایان کنجکاوانه",
      open: "باز کردن فیلمنامه این قسمت",
      close: "بستن فیلمنامه این قسمت",
      episodeScript: "فیلمنامه قسمت",
      noEpisodes: "هیچ قسمتی تولید نشده است.",
      noScenes: "هیچ صحنه‌ای تولید نشده است."
    },
    en: {
      copy: "Copy Script",
      word: "Download Word",
      pdf: "Download PDF",
      logline: "Logline",
      overall: "Overall Summary",
      episodes: "Episodes",
      scenes: "Scenes",
      duration: "Duration",
      summary: "Summary",
      cliffhanger: "Cliffhanger",
      open: "Open this episode script",
      close: "Close this episode script",
      episodeScript: "Episode Script",
      noEpisodes: "No episodes generated.",
      noScenes: "No scenes generated."
    },
    tr: {
      copy: "Metni Kopyala",
      word: "Word İndir",
      pdf: "PDF İndir",
      logline: "Logline",
      overall: "Genel Özet",
      episodes: "Bölümler",
      scenes: "Sahneler",
      duration: "Süre",
      summary: "Özet",
      cliffhanger: "Merak Unsuru",
      open: "Bu bölümün senaryosunu aç",
      close: "Bu bölümün senaryosunu kapat",
      episodeScript: "Bölüm Senaryosu",
      noEpisodes: "Hiç bölüm üretilmedi.",
      noScenes: "Hiç sahne üretilmedi."
    },
    fr: {
      copy: "Copier le Script",
      word: "Télécharger Word",
      pdf: "Télécharger PDF",
      logline: "Logline",
      overall: "Résumé Global",
      episodes: "Épisodes",
      scenes: "Scènes",
      duration: "Durée",
      summary: "Résumé",
      cliffhanger: "Suspense Final",
      open: "Ouvrir le script de cet épisode",
      close: "Fermer le script de cet épisode",
      episodeScript: "Script de l’Épisode",
      noEpisodes: "Aucun épisode généré.",
      noScenes: "Aucune scène générée."
    },
    ar: {
      copy: "نسخ السيناريو",
      word: "تنزيل Word",
      pdf: "تنزيل PDF",
      logline: "Logline",
      overall: "الملخص العام",
      episodes: "الحلقات",
      scenes: "المشاهد",
      duration: "المدة",
      summary: "الملخص",
      cliffhanger: "النهاية المعلّقة",
      open: "فتح سيناريو هذه الحلقة",
      close: "إغلاق سيناريو هذه الحلقة",
      episodeScript: "سيناريو الحلقة",
      noEpisodes: "لم يتم إنشاء أي حلقات.",
      noScenes: "لم يتم إنشاء أي مشاهد."
    }
  };

  return map[language] || map.fa;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildResultText(result) {
  let formattedText = "";

  if (result.mode === "series") {
    formattedText = `
Title:
${result.title}

Logline:
${result.logline}

Overall Summary:
${result.overallSummary || "-"}

Episodes:
${result.episodes
  ?.map(
    (episode) => `
${episode.episodeTitle}
Duration: ${episode.duration}
Summary: ${episode.summary}
Cliffhanger: ${episode.cliffhanger}

Scenes:
${episode.scenes
  ?.map(
    (scene) => `
Scene ${scene.sceneNumber}
Location: ${scene.location}
Time: ${scene.time}
Visual: ${scene.visual}
Narration: ${scene.narration || "-"}

Dialogue:
${
  scene.dialogue?.length
    ? scene.dialogue.map((item) => `${item.character}: ${item.text}`).join("\n")
    : "No dialogue"
}
`
  )
  .join("\n")}
`
  )
  .join("\n")}
`.trim();
  } else {
    formattedText = `
Title:
${result.title}

Logline:
${result.logline}

Overall Summary:
${result.overallSummary || "-"}

Scenes:
${result.scenes
  ?.map(
    (scene) => `
Scene ${scene.sceneNumber}
Location: ${scene.location}
Time: ${scene.time}
Visual: ${scene.visual}
Narration: ${scene.narration || "-"}

Dialogue:
${
  scene.dialogue?.length
    ? scene.dialogue.map((item) => `${item.character}: ${item.text}`).join("\n")
    : "No dialogue"
}
`
  )
  .join("\n")}
`.trim();
  }

  return formattedText;
}

function buildResultHtml(result) {
  const isRtl = result?.language === "fa" || result?.language === "ar";
  const dir = isRtl ? "rtl" : "ltr";
  const align = isRtl ? "right" : "left";
  const lang = result?.language || "fa";

  const seriesHtml =
    result.mode === "series"
      ? `
        <h2>Episodes</h2>
        ${result.episodes
          ?.map(
            (episode) => `
              <section class="block">
                <h3>${escapeHtml(episode.episodeTitle)}</h3>
                <p><strong>Duration:</strong> ${escapeHtml(episode.duration)}</p>
                <p><strong>Summary:</strong> ${escapeHtml(episode.summary)}</p>
                <p><strong>Cliffhanger:</strong> ${escapeHtml(episode.cliffhanger)}</p>

                <h4>Scenes</h4>
                ${episode.scenes
                  ?.map(
                    (scene) => `
                      <article class="scene">
                        <h5>Scene ${scene.sceneNumber}</h5>
                        <p><strong>Location:</strong> ${escapeHtml(scene.location)}</p>
                        <p><strong>Time:</strong> ${escapeHtml(scene.time)}</p>
                        <p><strong>Visual:</strong> ${escapeHtml(scene.visual)}</p>
                        <p><strong>Narration:</strong> ${escapeHtml(scene.narration || "-")}</p>
                        <p><strong>Dialogue:</strong></p>
                        ${
                          scene.dialogue?.length
                            ? scene.dialogue
                                .map(
                                  (item) => `
                                    <p class="dialogue-line"><strong>${escapeHtml(item.character)}:</strong> ${escapeHtml(item.text)}</p>
                                  `
                                )
                                .join("")
                            : `<p class="dialogue-line">No dialogue</p>`
                        }
                      </article>
                    `
                  )
                  .join("")}
              </section>
            `
          )
          .join("")}
      `
      : "";

  const movieHtml =
    result.mode !== "series"
      ? `
        <h2>Scenes</h2>
        ${result.scenes
          ?.map(
            (scene) => `
              <article class="scene">
                <h3>Scene ${scene.sceneNumber}</h3>
                <p><strong>Location:</strong> ${escapeHtml(scene.location)}</p>
                <p><strong>Time:</strong> ${escapeHtml(scene.time)}</p>
                <p><strong>Visual:</strong> ${escapeHtml(scene.visual)}</p>
                <p><strong>Narration:</strong> ${escapeHtml(scene.narration || "-")}</p>
                <p><strong>Dialogue:</strong></p>
                ${
                  scene.dialogue?.length
                    ? scene.dialogue
                        .map(
                          (item) => `
                            <p class="dialogue-line"><strong>${escapeHtml(item.character)}:</strong> ${escapeHtml(item.text)}</p>
                          `
                        )
                        .join("")
                    : `<p class="dialogue-line">No dialogue</p>`
                }
              </article>
            `
          )
          .join("")}
      `
      : "";

  return `
    <!DOCTYPE html>
    <html lang="${escapeHtml(lang)}" dir="${dir}">
      <head>
        <meta charset="UTF-8" />
        <title>${escapeHtml(result.title || "script")}</title>
        <style>
          body {
            font-family: Tahoma, Arial, "Segoe UI", sans-serif;
            background: #ffffff;
            color: #111111;
            padding: 28px;
            line-height: 1.9;
            direction: ${dir};
            text-align: ${align};
          }

          h1 { font-size: 28px; margin: 0 0 18px; }
          h2 { font-size: 24px; margin: 28px 0 12px; }
          h3 { font-size: 20px; margin: 20px 0 10px; }
          h4 { font-size: 18px; margin: 18px 0 10px; }
          h5 { font-size: 17px; margin: 14px 0 8px; }

          p {
            font-size: 15px;
            margin: 8px 0;
            word-break: break-word;
          }

          .summary, .block, .scene {
            border: 1px solid #d8d8d8;
            border-radius: 10px;
            padding: 14px 16px;
            margin: 14px 0;
            background: #fafafa;
          }

          .dialogue-line {
            margin-${isRtl ? "right" : "left"}: 12px;
          }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(result.title)}</h1>

        <div class="summary">
          <p><strong>Logline:</strong> ${escapeHtml(result.logline)}</p>
          <p><strong>Overall Summary:</strong> ${escapeHtml(result.overallSummary || "-")}</p>
        </div>

        ${seriesHtml}
        ${movieHtml}
      </body>
    </html>
  `;
}

async function copyToClipboard(result) {
  try {
    await navigator.clipboard.writeText(buildResultText(result));
    alert("کپی شد ✅");
  } catch (error) {
    console.error("Copy failed:", error);
    alert("کپی انجام نشد");
  }
}

async function downloadWord(result) {
  try {
    const text = buildResultText(result);
    const lines = text.split("\n");

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: lines.map(
            (line) =>
              new Paragraph({
                bidirectional: result?.language === "fa" || result?.language === "ar",
                children: [
                  new TextRun({
                    text: line || " ",
                    size: 28
                  })
                ],
                spacing: {
                  after: 140
                }
              })
          )
        }
      ]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(
      blob,
      `${result.title?.replace(/[\\/:*?"<>|]/g, "_") || "script"}.docx`
    );
  } catch (error) {
    console.error("Word export failed:", error);
    alert("دانلود فایل Word انجام نشد");
  }
}

function downloadPdf(result) {
  try {
    const html = buildResultHtml(result);
    const printWindow = window.open("", "_blank", "width=1000,height=800");

    if (!printWindow) {
      alert("پنجره PDF باز نشد. Pop-up blocker را خاموش کن.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  } catch (error) {
    console.error("PDF export failed:", error);
    alert("خروجی PDF انجام نشد");
  }
}

function ActionButton({ label, bg, color = "#000", onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "12px 16px",
        borderRadius: 12,
        border: "1px solid #3a3a3a",
        background: bg,
        color,
        cursor: "pointer",
        fontWeight: 800,
        fontSize: 16,
        boxShadow: "0 10px 24px rgba(0,0,0,0.2)"
      }}
    >
      {label}
    </button>
  );
}

function MetaBadge({ label, value }) {
  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: 12,
        border: "1px solid #2b2b2b",
        background: "#131313"
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: "#8f8f8f",
          marginBottom: 6
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "#f3f3f3"
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SceneBlock({ scene }) {
  return (
    <div
      style={{
        marginBottom: 18,
        padding: 18,
        borderRadius: 16,
        background: "linear-gradient(180deg, #161616, #101010)",
        border: "1px solid #272727"
      }}
    >
      <h4 style={{ marginTop: 0, marginBottom: 14, fontSize: 22 }}>
        Scene {scene.sceneNumber}
      </h4>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          marginBottom: 16
        }}
      >
        <MetaBadge label="Location" value={scene.location} />
        <MetaBadge label="Time" value={scene.time} />
      </div>

      <div
        style={{
          padding: 14,
          borderRadius: 12,
          background: "#0f0f0f",
          border: "1px solid #222",
          marginBottom: 12
        }}
      >
        <div style={{ fontSize: 14, color: "#8e8e8e", marginBottom: 8 }}>
          Visual
        </div>
        <div style={{ fontSize: 18, lineHeight: 1.9 }}>{scene.visual}</div>
      </div>

      {scene.narration ? (
        <div
          style={{
            padding: 14,
            borderRadius: 12,
            background: "rgba(0,194,209,0.06)",
            border: "1px solid rgba(0,194,209,0.18)",
            marginBottom: 12
          }}
        >
          <div style={{ fontSize: 14, color: "#7bdfea", marginBottom: 8 }}>
            Narration
          </div>
          <div style={{ fontSize: 18, lineHeight: 1.9 }}>{scene.narration}</div>
        </div>
      ) : null}

      <div
        style={{
          padding: 14,
          borderRadius: 12,
          background: "rgba(212,175,55,0.06)",
          border: "1px solid rgba(212,175,55,0.16)"
        }}
      >
        <div style={{ fontSize: 14, color: "#f0d37a", marginBottom: 10 }}>
          Dialogue
        </div>

        {scene.dialogue?.length ? (
          scene.dialogue.map((item, index) => (
            <div
              key={index}
              style={{
                marginBottom: 10,
                paddingBottom: 10,
                borderBottom:
                  index !== scene.dialogue.length - 1
                    ? "1px solid rgba(255,255,255,0.06)"
                    : "none"
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  color: "#f3d67a",
                  fontWeight: 700,
                  marginBottom: 4
                }}
              >
                {item.character}
              </div>
              <div style={{ fontSize: 18, lineHeight: 1.9 }}>{item.text}</div>
            </div>
          ))
        ) : (
          <div style={{ fontSize: 17, opacity: 0.75 }}>No dialogue</div>
        )}
      </div>
    </div>
  );
}

export default function StoryToScriptResult({ result }) {
  const [openEpisode, setOpenEpisode] = useState(null);

  if (!result) return null;

  const t = getUiText(result.language);

  return (
    <div
      style={{
        marginTop: 24,
        padding: 24,
        borderRadius: 22,
        border: "1px solid #242424",
        background: "linear-gradient(180deg, #0d0d0d, #090909)"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          alignItems: "flex-start",
          marginBottom: 24
        }}
      >
        <div style={{ flex: 1, minWidth: 280 }}>
          <div
            style={{
              display: "inline-flex",
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid rgba(0,194,209,0.28)",
              background: "rgba(0,194,209,0.08)",
              color: "#9cebf3",
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 14
            }}
          >
            SCREENPLAY RESULT
          </div>

          <h2 style={{ margin: 0, fontSize: 34, lineHeight: 1.4 }}>
            {result.title}
          </h2>

          <p
            style={{
              marginTop: 12,
              marginBottom: 0,
              fontSize: 19,
              color: "#cfcfcf",
              lineHeight: 1.95
            }}
          >
            {result.logline}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap"
          }}
        >
          <ActionButton
            label={t.copy}
            bg="linear-gradient(135deg, #d4af37, #f0d37a)"
            onClick={() => copyToClipboard(result)}
          />
          <ActionButton
            label={t.word}
            bg="linear-gradient(135deg, #00c2d1, #76ebf5)"
            onClick={() => downloadWord(result)}
          />
          <ActionButton
            label={t.pdf}
            bg="linear-gradient(135deg, #ff7070, #ff9a9a)"
            onClick={() => downloadPdf(result)}
          />
        </div>
      </div>

      <div
        style={{
          padding: 20,
          borderRadius: 18,
          border: "1px solid rgba(212,175,55,0.20)",
          background:
            "linear-gradient(135deg, rgba(212,175,55,0.08), rgba(0,194,209,0.05))",
          marginBottom: 24
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            marginBottom: 10
          }}
        >
          {t.overall}
        </div>

        <div
          style={{
            fontSize: 19,
            lineHeight: 2,
            color: "#efefef"
          }}
        >
          {result.overallSummary || "-"}
        </div>
      </div>

      {result.mode === "series" ? (
        <div>
          <h3 style={{ fontSize: 28, marginBottom: 18 }}>{t.episodes}</h3>

          {result.episodes?.length ? (
            result.episodes.map((episode) => {
              const isOpen = openEpisode === episode.episodeNumber;

              return (
                <div
                  key={episode.episodeNumber}
                  style={{
                    marginBottom: 20,
                    borderRadius: 18,
                    border: isOpen
                      ? "1px solid rgba(0,194,209,0.35)"
                      : "1px solid #292929",
                    background: isOpen
                      ? "linear-gradient(180deg, rgba(0,194,209,0.07), rgba(14,14,14,0.98))"
                      : "linear-gradient(180deg, #141414, #101010)",
                    overflow: "hidden",
                    boxShadow: isOpen
                      ? "0 18px 38px rgba(0,194,209,0.08)"
                      : "none"
                  }}
                >
                  <div
                    onClick={() =>
                      setOpenEpisode(isOpen ? null : episode.episodeNumber)
                    }
                    style={{
                      cursor: "pointer",
                      padding: 20
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 16,
                        alignItems: "flex-start",
                        flexWrap: "wrap"
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 280 }}>
                        <h4
                          style={{
                            marginTop: 0,
                            marginBottom: 10,
                            fontSize: 24
                          }}
                        >
                          {episode.episodeTitle}
                        </h4>

                        <p
                          style={{
                            margin: "0 0 10px",
                            fontSize: 18,
                            lineHeight: 1.9,
                            color: "#dddddd"
                          }}
                        >
                          <strong>{t.summary}:</strong> {episode.summary}
                        </p>

                        <p
                          style={{
                            margin: 0,
                            fontSize: 18,
                            lineHeight: 1.9,
                            color: "#d8f9fd"
                          }}
                        >
                          <strong>{t.cliffhanger}:</strong> {episode.cliffhanger}
                        </p>
                      </div>

                      <div
                        style={{
                          minWidth: 170,
                          padding: 14,
                          borderRadius: 14,
                          border: "1px solid #2a2a2a",
                          background: "#111"
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            color: "#8f8f8f",
                            marginBottom: 6
                          }}
                        >
                          {t.duration}
                        </div>
                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 800,
                            color: "#f3d67a"
                          }}
                        >
                          {episode.duration}
                        </div>

                        <div
                          style={{
                            marginTop: 14,
                            fontSize: 15,
                            fontWeight: 700,
                            color: "#7de3ff"
                          }}
                        >
                          {isOpen ? t.close : t.open}
                        </div>
                      </div>
                    </div>
                  </div>

                  {isOpen ? (
                    <div
                      style={{
                        padding: "0 20px 20px",
                        borderTop: "1px solid rgba(255,255,255,0.05)"
                      }}
                    >
                      <h4
                        style={{
                          fontSize: 22,
                          marginTop: 18,
                          marginBottom: 16
                        }}
                      >
                        {t.episodeScript}
                      </h4>

                      {episode.scenes?.length ? (
                        episode.scenes.map((scene) => (
                          <SceneBlock
                            key={`${episode.episodeNumber}-${scene.sceneNumber}`}
                            scene={scene}
                          />
                        ))
                      ) : (
                        <p style={{ fontSize: 18 }}>{t.noScenes}</p>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })
          ) : (
            <p style={{ fontSize: 18 }}>{t.noEpisodes}</p>
          )}
        </div>
      ) : (
        <div>
          <h3 style={{ fontSize: 28, marginBottom: 18 }}>{t.scenes}</h3>

          {result.scenes?.length ? (
            result.scenes.map((scene) => (
              <SceneBlock key={scene.sceneNumber} scene={scene} />
            ))
          ) : (
            <p style={{ fontSize: 18 }}>{t.noScenes}</p>
          )}
        </div>
      )}
    </div>
  );
}