const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

function buildPrompt({
  genre = "",
  tone = "",
  duration = "",
  platform = "",
  language = "English",
  topic = "",
}) {
  return `
You are a professional screenplay writer.

Create a high-quality cinematic script.

Details:
- Genre: ${genre}
- Tone: ${tone}
- Duration: ${duration}
- Platform: ${platform}
- Language: ${language}
- Topic: ${topic}

Output format:
- Title
- Logline
- Scenes
- Dialogues
- Visual descriptions
`;
}

export async function generateScriptAI(options) {
  if (!OPENAI_API_KEY) {
    throw new Error("Missing OpenAI API Key");
  }

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "You are Afrawood AI Script Engine." },
        { role: "user", content: buildPrompt(options) },
      ],
      temperature: 0.7,
      max_tokens: 1800,
    }),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() || "";
}