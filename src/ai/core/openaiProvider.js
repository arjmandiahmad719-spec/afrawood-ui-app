import OpenAI from "openai";

let client = null;

export function getOpenAIClient() {
  if (!client) {
    client = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }
  return client;
}

export async function generateWithOpenAI(prompt) {
  const openai = getOpenAIClient();

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a professional cinematic screenwriter."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7
  });

  return response.choices[0].message.content;
}