import {
  dialogueMoodStyles,
  dialogueTemplates,
  moodMap,
} from "./dialogueData"; // همین فایلی که فرستادی

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function replaceVars(text, vars) {
  let out = text;
  Object.keys(vars).forEach((key) => {
    out = out.replaceAll(`{${key}}`, vars[key]);
  });
  return out;
}

function detectLanguage(language) {
  const l = String(language || "").toLowerCase();

  if (l.includes("turk")) return "tr";
  if (l.includes("eng")) return "en";
  return "fa";
}

function makeConversational(text) {
  return text
    .replaceAll("می‌باشد", "ه")
    .replaceAll("می‌باشد.", "ه.")
    .replaceAll("نمی‌توانم", "نمی‌تونم")
    .replaceAll("می‌توانم", "می‌تونم")
    .replaceAll("می‌خواهم", "می‌خوام")
    .replaceAll("نمی‌دانم", "نمی‌دونم")
    .replaceAll("باید", "باید")
    .replaceAll("است", "ه");
}

function generateDialogueLines({
  mood = "dramatic",
  characters = ["شخصیت ۱", "شخصیت ۲"],
  dialogueStyle = "auto",
  language = "fa",
}) {
  const moodKey = moodMap[mood] || "dramatic";
  const style = dialogueMoodStyles[moodKey] || dialogueMoodStyles.dramatic;

  const templateSet =
    dialogueTemplates[style.sentenceStyle] ||
    dialogueTemplates.weighted;

  const template = pick(templateSet);

  let lines = template.split("\n").map((line) =>
    replaceVars(line, {
      name1: characters[0],
      name2: characters[1],
    })
  );

  // 🔥 تبدیل به محاوره‌ای
  if (dialogueStyle === "conversational" || dialogueStyle === "auto") {
    lines = lines.map((l) => makeConversational(l));
  }

  return lines;
}

/* =========================
   MAIN ENGINE
========================= */
export function generateDialogsForScene({
  scene,
  count = 3,
  mood = "dramatic",
  dialogueStyle = "auto",
  language = "Persian",
}) {
  const lang = detectLanguage(language);

  const dialogs = [];

  for (let i = 0; i < count; i++) {
    const lines = generateDialogueLines({
      mood,
      dialogueStyle,
      language: lang,
      characters: scene?.characters || ["کاراکتر ۱", "کاراکتر ۲"],
    });

    dialogs.push({
      id: `dialog-${scene.id}-${i}`,
      sceneId: scene.id,
      character: scene?.characters?.[0] || "کاراکتر",
      emotion: mood,
      text: lines.join(" "),
    });
  }

  return dialogs;
}