export const dialogueMoodStyles = {
  romantic: { sentenceStyle: "gentle" },
  dramatic: { sentenceStyle: "weighted" },
  suspense: { sentenceStyle: "short-tense" },
  emotional: { sentenceStyle: "emotional" },
  action: { sentenceStyle: "sharp" },
  mystery: { sentenceStyle: "curious" },
};

export const locationStyles = {
  "خیابان خلوت": { sensory: ["سکوت", "باد", "نور کم"] },
  "کافه": { sensory: ["نور گرم", "صداهای آرام"] },
};

export const timeStyles = {
  شب: { flavor: "تاریک و رازآلود" },
  روز: { flavor: "روشن" },
};

export const dialogueTemplates = {
  gentle: [
    "{name1}: حس می‌کنم یه چیزی بینمون عوض شده.",
    "{name2}: شاید فقط بیشتر فهمیدیم همدیگه رو.",
  ],
  weighted: [
    "{name1}: حقیقت همیشه درد داره.",
    "{name2}: اما بدونش نمی‌شه ادامه داد.",
  ],
  "short-tense": [
    "{name1}: شنیدی؟",
    "{name2}: آره.",
  ],
  emotional: [
    "{name1}: هنوز یادته؟",
    "{name2}: هیچ‌وقت فراموش نکردم.",
  ],
  sharp: [
    "{name1}: وقت نداریم.",
    "{name2}: پس حرکت کن.",
  ],
  curious: [
    "{name1}: یه چیزی درست نیست.",
    "{name2}: دقیقاً.",
  ],
};

export const dialogueTypes = [
  { value: "cinematic", label: "سینمایی" },
  { value: "short", label: "کوتاه" },
  { value: "poetic", label: "شاعرانه" },
  { value: "tense", label: "تنش‌دار" },
];

export const moodMap = {
  عاشقانه: "romantic",
  دراماتیک: "dramatic",
  تعلیقی: "suspense",
  احساسی: "emotional",
  اکشن: "action",
  معمایی: "mystery",
};