import React, { useMemo, useState } from "react";
import { requestAiText } from "../../core/aiClient";

const GENRES = [
  "Drama",
  "Thriller",
  "Sci-Fi",
  "Mystery",
  "Romance",
  "Action",
  "Comedy",
  "Fantasy",
  "Horror",
  "Art House",
];

const TONES = [
  "Cinematic",
  "Dark",
  "Emotional",
  "Suspenseful",
  "Poetic",
  "Minimal",
  "Epic",
  "Realistic",
  "Dreamlike",
  "Hopeful",
];

const OUTPUT_MODES = [
  { value: "director_plan", label: "Director Plan" },
  { value: "production_blueprint", label: "Production Blueprint" },
  { value: "image_strategy", label: "Image Strategy" },
  { value: "video_strategy", label: "Video Strategy" },
];

const boxStyle = {
  borderRadius: 22,
  background:
    "linear-gradient(180deg, rgba(10,14,20,0.98) 0%, rgba(6,9,14,0.98) 100%)",
  border: "1px solid rgba(76, 217, 196, 0.16)",
  boxShadow: "0 20px 50px rgba(0,0,0,0.28)",
};

const labelStyle = {
  display: "block",
  marginBottom: 8,
  color: "#d4af37",
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: 0.4,
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(76, 217, 196, 0.22)",
  background: "rgba(8, 12, 18, 0.95)",
  color: "#eefbf8",
  outline: "none",
};

const textareaStyle = {
  ...inputStyle,
  minHeight: 120,
  resize: "vertical",
  lineHeight: 1.8,
};

function SelectField({ value, onChange, options }) {
  return (
    <select value={value} onChange={onChange} style={inputStyle}>
      {options.map((item) => {
        const optionValue = typeof item === "string" ? item : item.value;
        const optionLabel = typeof item === "string" ? item : item.label;
        return (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        );
      })}
    </select>
  );
}

function buildDirectorPrompt({
  idea,
  genre,
  tone,
  outputMode,
  visualStyle,
  targetDuration,
  audience,
}) {
  const modeInstructionMap = {
    director_plan: [
      "Build a director-level cinematic plan.",
      "Return practical Persian output.",
      "Include:",
      "1. core concept",
      "2. emotional center",
      "3. visual language",
      "4. directing approach",
      "5. scene flow",
      "6. shot philosophy",
      "7. sound/music approach",
      "8. risks and improvements",
    ],
    production_blueprint: [
      "Build a production blueprint for a short cinematic project.",
      "Return practical Persian output.",
      "Include:",
      "1. project identity",
      "2. story structure",
      "3. scene breakdown",
      "4. shot strategy",
      "5. image generation workflow",
      "6. video generation workflow",
      "7. editing direction",
      "8. final delivery strategy",
    ],
    image_strategy: [
      "Build a visual strategy specifically for cinematic image generation.",
      "Return practical Persian output.",
      "Include:",
      "1. visual identity",
      "2. color palette",
      "3. lighting language",
      "4. lens / framing language",
      "5. prompt strategy",
      "6. reference image strategy",
      "7. consistency strategy between shots",
    ],
    video_strategy: [
      "Build a cinematic video strategy from generated images.",
      "Return practical Persian output.",
      "Include:",
      "1. shot order",
      "2. pacing",
      "3. transition logic",
      "4. motion design suggestions",
      "5. music / sound rhythm",
      "6. subtitle strategy if needed",
      "7. editing blueprint",
    ],
  };

  const instructions = modeInstructionMap[outputMode] || modeInstructionMap.director_plan;

  return [
    ...instructions,
    "",
    "Project Input:",
    `Idea: ${idea}`,
    `Genre: ${genre || "Not specified"}`,
    `Tone: ${tone || "Not specified"}`,
    `Visual Style: ${visualStyle || "Not specified"}`,
    `Target Duration: ${targetDuration || "Not specified"}`,
    `Audience: ${audience || "Not specified"}`,
    "",
    "Write in Persian.",
    "Be concrete, cinematic, and production-friendly.",
    "Do not give vague motivational advice.",
  ].join("\n");
}

export default function DirectorAIPanel() {
  const [idea, setIdea] = useState("");
  const [genre, setGenre] = useState("Drama");
  const [tone, setTone] = useState("Cinematic");
  const [outputMode, setOutputMode] = useState("director_plan");
  const [visualStyle, setVisualStyle] = useState("");
  const [targetDuration, setTargetDuration] = useState("1-3 min");
  const [audience, setAudience] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");

  const canGenerate = useMemo(() => !loading && idea.trim().length > 0, [loading, idea]);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError("");
      setResult("");

      const prompt = buildDirectorPrompt({
        idea,
        genre,
        tone,
        outputMode,
        visualStyle,
        targetDuration,
        audience,
      });

      const response = await requestAiText({
        mode: "general",
        userPrompt: prompt,
        temperature: 0.8,
        maxTokens: 1800,
      });

      const text = String(response?.text || "").trim();
      if (!text) {
        throw new Error("خروجی از Director AI دریافت نشد.");
      }

      setResult(text);

      try {
        localStorage.setItem(
          "afrawood_director_ai_last_result",
          JSON.stringify({
            idea,
            genre,
            tone,
            outputMode,
            visualStyle,
            targetDuration,
            audience,
            result: text,
            createdAt: Date.now(),
          })
        );
      } catch {
        // ignore
      }
    } catch (err) {
      setError(err?.message || "خطا در Director AI");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      if (!result) return;
      await navigator.clipboard.writeText(result);
    } catch {
      // ignore
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "380px 1fr",
        gap: 20,
        height: "100%",
        minHeight: 0,
      }}
    >
      <div
        style={{
          ...boxStyle,
          padding: 18,
          overflow: "auto",
        }}
      >
        <div
          style={{
            color: "#4cd9c4",
            fontSize: 22,
            fontWeight: 900,
            marginBottom: 6,
          }}
        >
          Director AI
        </div>

        <div
          style={{
            color: "rgba(235,245,243,0.72)",
            fontSize: 13,
            lineHeight: 1.7,
            marginBottom: 18,
          }}
        >
          این پنل نقش مغز خلاق پروژه را دارد و برای ایده تو پلن کارگردانی، پلن
          تولید، استراتژی تصویر یا استراتژی ویدیو می‌سازد.
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <div>
            <label style={labelStyle}>Idea / Command</label>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="مثلاً: یک درام روانشناختی کوتاه درباره زنی در استانبول که متوجه می‌شود عکس‌های قدیمی آینده را نشان می‌دهند..."
              style={textareaStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Genre</label>
            <SelectField
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              options={GENRES}
            />
          </div>

          <div>
            <label style={labelStyle}>Tone</label>
            <SelectField
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              options={TONES}
            />
          </div>

          <div>
            <label style={labelStyle}>Output Mode</label>
            <SelectField
              value={outputMode}
              onChange={(e) => setOutputMode(e.target.value)}
              options={OUTPUT_MODES}
            />
          </div>

          <div>
            <label style={labelStyle}>Visual Style</label>
            <input
              value={visualStyle}
              onChange={(e) => setVisualStyle(e.target.value)}
              placeholder="مثلاً: Tarkovsky-inspired, moody, golden practical lights"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Target Duration</label>
            <input
              value={targetDuration}
              onChange={(e) => setTargetDuration(e.target.value)}
              placeholder="1-3 min"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Audience</label>
            <input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="Festival / YouTube / Instagram / General audience"
              style={inputStyle}
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          style={{
            width: "100%",
            marginTop: 18,
            padding: "14px 16px",
            borderRadius: 14,
            border: "1px solid rgba(212, 175, 55, 0.35)",
            background: canGenerate
              ? "linear-gradient(135deg, #0f766e 0%, #4cd9c4 45%, #d4af37 100%)"
              : "rgba(80,80,80,0.3)",
            color: "#071014",
            fontWeight: 900,
            cursor: canGenerate ? "pointer" : "not-allowed",
          }}
        >
          {loading ? "Generating..." : "Generate Director Plan"}
        </button>

        {error ? (
          <div
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 12,
              background: "rgba(255,80,80,0.08)",
              border: "1px solid rgba(255,80,80,0.18)",
              color: "#ffb8b8",
              fontSize: 13,
              lineHeight: 1.7,
            }}
          >
            {error}
          </div>
        ) : null}
      </div>

      <div
        style={{
          ...boxStyle,
          padding: 20,
          overflow: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              color: "#d4af37",
              fontSize: 18,
              fontWeight: 900,
            }}
          >
            Director Output
          </div>

          <button
            onClick={handleCopy}
            disabled={!result}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(76, 217, 196, 0.22)",
              background: result ? "rgba(76,217,196,0.10)" : "rgba(80,80,80,0.25)",
              color: result ? "#dffcf6" : "rgba(255,255,255,0.45)",
              fontWeight: 800,
              cursor: result ? "pointer" : "not-allowed",
            }}
          >
            Copy
          </button>
        </div>

        {!loading && !result ? (
          <div
            style={{
              color: "rgba(233,244,241,0.55)",
              fontSize: 14,
              lineHeight: 1.8,
            }}
          >
            هنوز خروجی ساخته نشده.
          </div>
        ) : null}

        {loading ? (
          <div
            style={{
              color: "#4cd9c4",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            Director AI is thinking...
          </div>
        ) : null}

        {result ? (
          <div
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: 1.9,
              color: "#eefbf8",
              fontSize: 14,
            }}
          >
            {result}
          </div>
        ) : null}
      </div>
    </div>
  );
}