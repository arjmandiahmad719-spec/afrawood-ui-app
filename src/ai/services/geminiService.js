const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// مدل پایدار رایگان
const GEMINI_MODEL = "gemini-1.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function safeText(value, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function buildScreenplayPrompt(payload = {}) {
  const {
    projectType = "",
    title = "",
    genre = "",
    language = "فارسی",
    logline = "",
    synopsis = "",
    story = "",
    tone = "",
    setting = "",
    timePeriod = "",
    visualStyle = "",
    characters = [],
    extraNotes = "",
  } = payload;

  const castBlock = Array.isArray(characters) && characters.length
    ? characters
        .map((char, index) => {
          if (typeof char === "string") {
            return `${index + 1}. ${char}`;
          }

          const name = safeText(char?.name, `شخصیت ${index + 1}`);
          const role = safeText(char?.role);
          const traits = safeText(char?.traits);
          const goal = safeText(char?.goal);

          return [
            `${index + 1}. ${name}`,
            role ? `نقش: ${role}` : "",
            traits ? `ویژگی‌ها: ${traits}` : "",
            goal ? `هدف: ${goal}` : "",
          ]
            .filter(Boolean)
            .join(" | ");
        })
        .join("\n")
    : "شخصیت‌ها از دل داستان استخراج شوند.";

  return `
تو یک فیلمنامه‌نویس حرفه‌ای سینما هستی.

یک فیلمنامه کامل، سینمایی، حرفه‌ای و عمیق تولید کن.

قوانین:
- فقط به زبان ${language}
- دیالوگ‌ها طبیعی، طولانی و احساسی باشند
- هر صحنه حداقل 10 دیالوگ داشته باشد
- اکشن، حس، سکوت و رفتار اضافه کن
- خروجی شبیه فیلمنامه واقعی باشد
- توضیح اضافه نده
- فقط خروجی نهایی

اطلاعات:
عنوان: ${title}
ژانر: ${genre}
داستان: ${story}
خلاصه: ${synopsis}
لحن: ${tone}
لوکیشن: ${setting}

شخصیت‌ها:
${castBlock}

${extraNotes}

فیلمنامه را شروع کن:
`.trim();
}

function extractTextFromGemini(data) {
  try {
    return data.candidates
      ?.map(c => c.content?.parts?.map(p => p.text).join(""))
      .join("\n\n")
      .trim();
  } catch (e) {
    console.error("EXTRACT ERROR:", e);
    return "";
  }
}

export async function generateScreenplayWithGemini(payload = {}) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY_NOT_FOUND");
  }

  const prompt = buildScreenplayPrompt(payload);

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 8192,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`GEMINI_API_ERROR: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  // 🔥 دیباگ مهم
  console.log("GEMINI RESPONSE:", data);

  const text = extractTextFromGemini(data);

  if (!text) {
    throw new Error("GEMINI_EMPTY_RESPONSE");
  }

  return {
    text,
    raw: data,
  };
}

// تست اتصال
export async function testGeminiConnection() {
  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: "فقط بنویس: اتصال برقرار است" }],
        },
      ],
    }),
  });

  const data = await response.json();
  return extractTextFromGemini(data);
}