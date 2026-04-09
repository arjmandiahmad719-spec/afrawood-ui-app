import React, { useMemo, useState } from "react";
import { buildExportPayload } from "../ai/exportAI.js";
import { getCreditSummary } from "../ai/creditSystem.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const PAGE = "min-h-[calc(100vh-110px)] text-white";
const WRAP = "mx-auto max-w-[1280px] px-4 py-6 md:px-6";
const PANEL =
  "rounded-[30px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.35)] md:p-6";
const INPUT =
  "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35";
const LABEL = "mb-2 block text-sm font-medium text-white/75";
const BTN = "rounded-2xl px-4 py-3 text-sm font-semibold transition";
const PRIMARY = `${BTN} bg-gradient-to-r from-cyan-400 to-amber-300 text-black`;
const SECONDARY = `${BTN} border border-white/10 bg-white/5 text-white`;
const CHIP =
  "inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70";

export default function ExportPage({ onBackHome }) {
  const [title, setTitle] = useState("");
  const [format, setFormat] = useState("mp4");
  const [ratio, setRatio] = useState("16:9");
  const [resolution, setResolution] = useState("1080p");
  const creditState = useMemo(() => getCreditSummary(), []);
  const { t } = useLanguage();

  const payload = useMemo(() => {
    return buildExportPayload({
      projectTitle: title,
      output: {
        format,
        ratio,
        resolution,
        noWatermark: !creditState.watermark,
      },
    });
  }, [title, format, ratio, resolution, creditState.watermark]);

  function download() {
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "afrawood_export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={PAGE}>
      <div className={WRAP}>
        <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <section className={PANEL}>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className={CHIP}>{t("modules.export", "Export")}</span>
              <span className={CHIP}>{creditState.plan?.name || t("common.free", "Free")}</span>
            </div>

            <h1 className="mb-2 text-2xl font-black md:text-3xl">
              {t("export.title", "Export Settings")}
            </h1>
            <p className="mb-6 text-sm leading-7 text-white/60">
              {t("export.desc", "Prepare the final output settings here.")}
            </p>

            <div className="mb-6 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">
              {t("pricing.watermark", "Watermark:")}{" "}
              <span className="font-bold text-white">
                {creditState.watermark
                  ? t("pricing.on", "On")
                  : t("pricing.off", "Off")}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={LABEL}>{t("common.projectTitle", "Project Title")}</label>
                <input className={INPUT} value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div>
                <label className={LABEL}>{t("common.format", "Format")}</label>
                <select className={INPUT} value={format} onChange={(e) => setFormat(e.target.value)}>
                  <option>mp4</option>
                  <option>mov</option>
                </select>
              </div>

              <div>
                <label className={LABEL}>{t("common.ratio", "Ratio")}</label>
                <select className={INPUT} value={ratio} onChange={(e) => setRatio(e.target.value)}>
                  <option>16:9</option>
                  <option>9:16</option>
                  <option>1:1</option>
                </select>
              </div>

              <div>
                <label className={LABEL}>{t("common.resolution", "Resolution")}</label>
                <select
                  className={INPUT}
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                >
                  <option>1080p</option>
                  <option>2k</option>
                  <option>4k</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {onBackHome && (
                <button className={SECONDARY} onClick={onBackHome}>
                  {t("common.home", "Home")}
                </button>
              )}

              <button className={PRIMARY} onClick={download}>
                {t("export.exportJson", "Export JSON")}
              </button>
            </div>
          </section>

          <section className={PANEL}>
            <h2 className="mb-4 text-lg font-semibold">{t("common.preview", "Preview")}</h2>
            <pre className="max-h-[700px] overflow-auto rounded-2xl bg-black/40 p-4 text-xs leading-6 text-cyan-100">
{JSON.stringify(payload, null, 2)}
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
}