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

export const locationStyles = {
  "خیابان خلوت": { sensory: ["سکوت", "باد", "نور کم"] },
  "کافه": { sensory: ["نور گرم", "صداهای آرام"] },
};

export const timeStyles = {
  شب: { flavor: "تاریک" },
  روز: { flavor: "روشن" },
};

export const moodMap = {
  عاشقانه: "romantic",
  romantic: "romantic",
  دراماتیک: "dramatic",
  dramatic: "dramatic",
  تعلیقی: "suspense",
  suspense: "suspense",
  احساسی: "emotional",
  emotional: "emotional",
  اکشن: "action",
  action: "action",
  معمایی: "mystery",
  mystery: "mystery",
};