import { useState } from "react";

function SectionCard({ title, subtitle, children }) {
  return (
    <div
      style={{
        marginBottom: 20,
        padding: 20,
        borderRadius: 18,
        border: "1px solid #242424",
        background: "linear-gradient(180deg, #101010, #0c0c0c)",
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <h3
          style={{
            margin: 0,
            fontSize: 22,
            color: "#ffffff",
          }}
        >
          {title}
        </h3>

        {subtitle ? (
          <p
            style={{
              margin: "8px 0 0",
              color: "#9f9f9f",
              fontSize: 15,
              lineHeight: 1.8,
            }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>

      {children}
    </div>
  );
}

export default function StoryToScriptForm({ onGenerate }) {
  const [storyIdea, setStoryIdea] = useState("");
  const [contentType, setContentType] = useState("movie");
  const [seriesType, setSeriesType] = useState("serialized");
  const [episodes, setEpisodes] = useState(3);
  const [episodeDuration, setEpisodeDuration] = useState(20);
  const [genre, setGenre] = useState("drama");
  const [tone, setTone] = useState("cinematic");
  const [language, setLanguage] = useState("fa");

  const labelStyle = {
    display: "block",
    marginBottom: 8,
    fontSize: 16,
    fontWeight: 700,
    color: "#f3f3f3",
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid #313131",
    background: "#121212",
    color: "#fff",
    fontSize: 17,
    outline: "none",
    boxSizing: "border-box",
  };

  const helperStyle = {
    marginTop: 8,
    color: "#8f8f8f",
    fontSize: 14,
    lineHeight: 1.8,
  };

  const handleSubmit = () => {
    if (!storyIdea.trim()) {
      alert("ایده داستان را وارد کن");
      return;
    }

    onGenerate?.({
      storyIdea: storyIdea.trim(),
      contentType,
      seriesType,
      episodes: Number(episodes),
      episodeDuration: Number(episodeDuration),
      genre,
      tone,
      language,
      durationMinutes: Number(episodeDuration),
    });
  };

  return (
    <div>
      <SectionCard
        title="Story Input"
        subtitle="ایده اصلی داستان، جهان روایت و مسیر درام را از اینجا تعریف کن."
      >
        <label style={labelStyle}>ایده داستان</label>
        <textarea
          placeholder="مثلاً: می‌خواهم داستان زندگی فرهاد کوه‌کن و عشق او به شیرین را به یک فیلم تاریخی عاشقانه تبدیل کنم..."
          value={storyIdea}
          onChange={(e) => setStoryIdea(e.target.value)}
          rows={7}
          style={{
            ...inputStyle,
            resize: "vertical",
            lineHeight: 1.95,
            minHeight: 170,
            direction: "rtl",
            textAlign: "right",
          }}
        />
        <div style={helperStyle}>
          ایده را کامل‌تر بنویس: شخصیت‌ها، فضای داستان، تنش اصلی و حس کلی اثر.
        </div>
      </SectionCard>

      <SectionCard
        title="Project Setup"
        subtitle="فرمت پروژه و زبان خروجی را مشخص کن."
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          <div>
            <label style={labelStyle}>نوع پروژه</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              style={inputStyle}
            >
              <option value="movie">فیلم</option>
              <option value="series">سریال</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>زبان خروجی</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={inputStyle}
            >
              <option value="fa">فارسی</option>
              <option value="en">English</option>
              <option value="tr">Türkçe</option>
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
            </select>
          </div>
        </div>
      </SectionCard>

      {contentType === "series" ? (
        <SectionCard
          title="Series Configuration"
          subtitle="ساختار سریال، تعداد قسمت‌ها و زمان هر قسمت را تعیین کن."
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
            }}
          >
            <div>
              <label style={labelStyle}>نوع سریال</label>
              <select
                value={seriesType}
                onChange={(e) => setSeriesType(e.target.value)}
                style={inputStyle}
              >
                <option value="serialized">تداوم داستانی</option>
                <option value="episodic">اپیزودی</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>تعداد قسمت‌ها</label>
              <input
                type="number"
                min="1"
                value={episodes}
                onChange={(e) => setEpisodes(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>زمان هر قسمت (دقیقه)</label>
              <input
                type="number"
                min="1"
                value={episodeDuration}
                onChange={(e) => setEpisodeDuration(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
        </SectionCard>
      ) : (
        <SectionCard
          title="Cinema Configuration"
          subtitle="مدت زمان تقریبی فیلم را مشخص کن."
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
            }}
          >
            <div>
              <label style={labelStyle}>زمان فیلم (دقیقه)</label>
              <input
                type="number"
                min="1"
                value={episodeDuration}
                onChange={(e) => setEpisodeDuration(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
        </SectionCard>
      )}

      <SectionCard
        title="Creative Direction"
        subtitle="ژانر و لحن را مشخص کن تا جهت هنری فیلمنامه روشن شود."
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          <div>
            <label style={labelStyle}>ژانر</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              style={inputStyle}
            >
              <option value="drama">Drama</option>
              <option value="romance">Romance</option>
              <option value="action">Action</option>
              <option value="comedy">Comedy</option>
              <option value="historical">Historical</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>فضا (Tone)</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              style={inputStyle}
            >
              <option value="cinematic">Cinematic</option>
              <option value="emotional">Emotional</option>
              <option value="epic">Epic</option>
              <option value="tragic">Tragic</option>
            </select>
          </div>
        </div>
      </SectionCard>

      <div style={{ display: "flex", justifyContent: "flex-start" }}>
        <button
          onClick={handleSubmit}
          style={{
            padding: "15px 24px",
            borderRadius: 14,
            border: "1px solid rgba(0,194,209,0.38)",
            background: "linear-gradient(135deg, #00c2d1, #d4af37)",
            color: "#061014",
            cursor: "pointer",
            fontSize: 18,
            fontWeight: 800,
            boxShadow: "0 12px 28px rgba(0,194,209,0.16)",
          }}
        >
          Generate Screenplay
        </button>
      </div>
    </div>
  );
}