export async function runLocalAI(prompt) {
  try {
    const res = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tinyllama",
        prompt,
        stream: false,
      }),
    });

    const data = await res.json();
    return data.response || "هیچ پاسخی از AI دریافت نشد";
  } catch (err) {
    console.error("LOCAL AI ERROR:", err);
    return "AI در دسترس نیست";
  }
}