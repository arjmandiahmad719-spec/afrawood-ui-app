function safeText(value, fallback = "-") {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text || fallback;
}

function arrayToBulletLines(items = []) {
  if (!Array.isArray(items) || !items.length) return ["-"];
  return items.map((item) => `• ${safeText(item)}`);
}

function shotListLines(shotList = []) {
  if (!Array.isArray(shotList) || !shotList.length) return ["-"];
  return shotList.map(
    (row) =>
      `• شات ${safeText(row.shot)} | ${safeText(row.type)} | ${safeText(
        row.description
      )}`
  );
}

function makeSection(title, lines = []) {
  return {
    title,
    lines: Array.isArray(lines) && lines.length ? lines : ["-"],
  };
}

export function buildDirectorScriptDocument(form = {}, output = {}, sceneDialogues = []) {
  const overview = output?.overview || {};
  const dialogueText =
    safeText(form?.dialogueText, "") ||
    safeText(
      sceneDialogues?.find?.(
        (item) => item?.sceneNumber === form?.sceneNumber
      )?.dialogueText,
      ""
    );

  return {
    fileName: `director-studio-scene-${safeText(form?.sceneNumber, "1")}.html`,
    pdfFileName: `director-studio-scene-${safeText(form?.sceneNumber, "1")}.pdf`,
    title: safeText(overview.title, "Director Studio Output"),
    subtitle: `Scene ${safeText(overview.sceneTitle)} | ${safeText(
      overview.location
    )} | ${safeText(overview.time)}`,
    meta: [
      { label: "نوع پروژه", value: safeText(form?.projectType) },
      { label: "عنوان پروژه", value: safeText(form?.projectTitle) },
      { label: "شماره صحنه", value: safeText(form?.sceneNumber) },
      { label: "مدت تقریبی", value: safeText(form?.estimatedDuration) },
      { label: "زبان خروجی", value: safeText(form?.outputLanguage, "فارسی") },
      { label: "مود", value: safeText(form?.mood) },
      { label: "لوکیشن", value: safeText(form?.location) },
      { label: "زمان", value: safeText(form?.timeOfDay) },
    ],
    sections: [
      makeSection("نمای کلی صحنه", [
        `عنوان صحنه: ${safeText(overview.sceneTitle)}`,
        `لوکیشن: ${safeText(overview.location)}`,
        `مود: ${safeText(overview.mood)}`,
        `زمان: ${safeText(overview.time)}`,
        `مدت: ${safeText(overview.duration)}`,
        `زبان: ${safeText(overview.language)}`,
      ]),
      makeSection(
        "شخصیت‌ها",
        safeText(form?.characters, "-").split("\n").filter(Boolean)
      ),
      makeSection("خلاصه کنش صحنه", [safeText(form?.actionSummary)]),
      makeSection("لحن دیالوگ", [safeText(form?.dialogueTone)]),
      makeSection(
        "دیالوگ",
        dialogueText ? dialogueText.split("\n") : ["هنوز دیالوگی ساخته نشده"]
      ),
      makeSection("شکست صحنه", arrayToBulletLines(output?.sceneBreakdown)),
      makeSection("پلان دوربین", arrayToBulletLines(output?.cameraPlan)),
      makeSection("نورپردازی", arrayToBulletLines(output?.lightingPlan)),
      makeSection("میزانسن", arrayToBulletLines(output?.blockingPlan)),
      makeSection("یادداشت کارگردان", arrayToBulletLines(output?.directorNotes)),
      makeSection("طراحی صدا", arrayToBulletLines(output?.soundDesign)),
      makeSection("موسیقی", arrayToBulletLines(output?.music)),
      makeSection("شات لیست", shotListLines(output?.shotList)),
    ],
  };
}

function renderMetaTable(meta = []) {
  return `
    <div class="meta-grid">
      ${meta
        .map(
          (item) => `
            <div class="meta-card">
              <div class="meta-label">${safeText(item.label)}</div>
              <div class="meta-value">${safeText(item.value)}</div>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderSections(sections = []) {
  return sections
    .map(
      (section) => `
        <section class="section">
          <h2>${safeText(section.title)}</h2>
          <div class="section-body">
            ${section.lines
              .map((line) => `<div class="line">${safeText(line)}</div>`)
              .join("")}
          </div>
        </section>
      `
    )
    .join("");
}

export function generateDirectorScriptHtml(documentData = {}) {
  const title = safeText(documentData?.title, "Director Studio Output");
  const subtitle = safeText(documentData?.subtitle, "");
  const metaHtml = renderMetaTable(documentData?.meta || []);
  const sectionsHtml = renderSections(documentData?.sections || []);

  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      font-family: Tahoma, Arial, sans-serif;
      background: #0b0f12;
      color: #f6f3ea;
      line-height: 1.9;
    }
    body {
      padding: 28px;
    }
    .page {
      max-width: 1100px;
      margin: 0 auto;
      background: linear-gradient(180deg, #10161b, #0d1217);
      border: 1px solid rgba(216,179,93,0.18);
      border-radius: 24px;
      padding: 28px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.24);
    }
    .eyebrow {
      color: #57ddd2;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    h1 {
      margin: 0;
      font-size: 40px;
      color: #ffffff;
      line-height: 1.3;
    }
    .subtitle {
      margin-top: 10px;
      color: #d9c788;
      font-size: 18px;
    }
    .toolbar {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin: 22px 0 10px;
    }
    .toolbar button {
      border: none;
      border-radius: 14px;
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 900;
      cursor: pointer;
      background: linear-gradient(135deg, #d8b35d, #57ddd2);
      color: #111;
    }
    .toolbar .secondary {
      background: rgba(255,255,255,0.06);
      color: #fff;
      border: 1px solid rgba(255,255,255,0.12);
    }
    .meta-grid {
      margin-top: 24px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
      gap: 12px;
    }
    .meta-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(87,221,210,0.12);
      border-radius: 16px;
      padding: 14px;
    }
    .meta-label {
      color: #57ddd2;
      font-size: 12px;
      font-weight: 800;
      margin-bottom: 6px;
    }
    .meta-value {
      color: #fff;
      font-size: 15px;
      font-weight: 700;
    }
    .section {
      margin-top: 24px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 18px;
      padding: 18px;
      page-break-inside: avoid;
    }
    h2 {
      margin: 0 0 12px;
      color: #d8b35d;
      font-size: 22px;
    }
    .section-body {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .line {
      color: #f4f4f4;
      font-size: 15px;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .footer {
      margin-top: 26px;
      color: rgba(255,255,255,0.55);
      font-size: 12px;
      text-align: center;
    }

    @page {
      size: A4;
      margin: 14mm;
    }

    @media print {
      html, body {
        background: #ffffff;
        color: #111111;
      }
      body {
        padding: 0;
      }
      .page {
        max-width: 100%;
        border: none;
        border-radius: 0;
        padding: 0;
        background: #ffffff;
        color: #111111;
        box-shadow: none;
      }
      .toolbar {
        display: none !important;
      }
      .meta-card, .section {
        background: #ffffff;
        color: #111111;
        border: 1px solid #d7d7d7;
      }
      .meta-label, h2 { color: #333333; }
      .meta-value, .line, h1, .subtitle, .eyebrow { color: #111111; }
      .footer { color: #666666; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="eyebrow">AFRAWOOD DIRECTOR SCRIPT EXPORT</div>
    <h1>${title}</h1>
    <div class="subtitle">${subtitle}</div>

    <div class="toolbar">
      <button onclick="window.print()">Print / Save as PDF</button>
      <button class="secondary" onclick="window.close()">Close</button>
    </div>

    ${metaHtml}
    ${sectionsHtml}
    <div class="footer">Afrawood Director Studio Export</div>
  </div>
</body>
</html>`;
}

export function downloadDirectorScriptHtml(documentData = {}) {
  const html = generateDirectorScriptHtml(documentData);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = documentData.fileName || "director-script.html";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function openDirectorPrintWindow(documentData = {}) {
  const html = generateDirectorScriptHtml(documentData);
  const printWindow = window.open("", "_blank", "width=1200,height=900");

  if (!printWindow) return false;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  setTimeout(() => {
    try {
      printWindow.focus();
      printWindow.print();
    } catch (error) {
      console.error("Print window error:", error);
    }
  }, 500);

  return true;
}