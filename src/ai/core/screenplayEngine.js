import { generateProfessionalDialogue } from "../dialogueEngine";

/* =========================
   🎬 SCENE BUILDER
========================= */

function buildScenesFromIdea(input) {
  const text = String(input || "");

  if (/فرهاد/.test(text) && /شیرین/.test(text)) {
    return [
      {
        title: "دیدار اول",
        location: "کوهستان",
        mood: "عاشقانه",
        characters: ["فرهاد", "شیرین"],
        summary: "اولین نگاه عاشقانه در دل طبیعت",
      },
      {
        title: "ورود خسرو",
        location: "قصر",
        mood: "تنش",
        characters: ["خسرو", "شیرین"],
        summary: "قدرت وارد بازی می‌شود",
      },
      {
        title: "تقابل",
        location: "کوه",
        mood: "دراماتیک",
        characters: ["فرهاد", "خسرو"],
        summary: "عشق در برابر قدرت",
      },
      {
        title: "شکست",
        location: "کوهستان",
        mood: "تراژیک",
        characters: ["فرهاد"],
        summary: "سقوط عاشق",
      },
      {
        title: "پایان",
        location: "قصر",
        mood: "غم‌انگیز",
        characters: ["شیرین"],
        summary: "پایان یک عشق",
      },
    ];
  }

  // fallback
  return [
    {
      title: "صحنه 1",
      location: "نامشخص",
      mood: "دراماتیک",
      characters: ["شخصیت اول", "شخصیت دوم"],
      summary: "شروع داستان",
    },
  ];
}

/* =========================
   🎭 BUILD SCREENPLAY
========================= */

export function generateScreenplayFromIdea(input) {
  const scenes = buildScenesFromIdea(input);

  const screenplay = scenes.map((scene, index) => {
    const dialogue = generateProfessionalDialogue({
      characters: scene.characters.map((name) => ({ name })),
      customPrompt: `${scene.summary} دیالوگ سینمایی`,
      mood: scene.mood,
      location: scene.location,
    });

    return {
      sceneNumber: index + 1,
      title: scene.title,
      location: scene.location,
      mood: scene.mood,
      summary: scene.summary,
      dialogue: dialogue.fullText,
    };
  });

  return screenplay;
}