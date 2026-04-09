export function buildDirectorStudioAutofillFromStory(story) {
  const title = story?.title?.trim?.() || "";
  const genre = story?.genre?.trim?.() || "";
  const language = story?.language?.trim?.() || "فارسی";
  const format = story?.format?.trim?.() || "فیلم";
  const synopsis = story?.synopsis?.trim?.() || "";
  const setting = story?.setting?.trim?.() || "";
  const tone = story?.tone?.trim?.() || "";
  const conflict = story?.conflict?.trim?.() || "";
  const characters = story?.characters?.trim?.() || "";

  return {
    projectType:
      format === "سریال"
        ? "series"
        : format === "کوتاه" || format === "فیلم کوتاه"
        ? "short"
        : "cinema",
    projectTitle: title,
    outputLanguage: language,
    sceneTitle: title ? `صحنه افتتاحیه ${title}` : "صحنه افتتاحیه",
    location: setting || "لوکیشن اصلی داستان",
    timeOfDay: "شب",
    mood: tone || "دراماتیک",
    visualStyle: genre ? `سینمایی واقع‌گرا با حال‌وهوای ${genre}` : "سینمایی واقع‌گرا",
    cameraStyle: "حرکت نرم و کنترل‌شده",
    lightingStyle: tone ? `نورپردازی متناسب با حس ${tone}` : "نور سینمایی کنترل‌شده",
    shotDensity: "متوسط",
    dialogueTone: tone || "طبیعی و احساسی",
    dialogueText: "",
    characters,
    actionSummary:
      synopsis ||
      "شروع صحنه با معرفی فضا و شخصیت‌ها و حرکت تدریجی به سمت کشمکش اصلی.",
    soundDesign: setting
      ? `صداسازی محیطی متناسب با ${setting}`
      : "صداسازی محیطی سینمایی و واقع‌گرایانه",
    musicStyle: tone ? `موسیقی متناسب با فضای ${tone}` : "موسیقی سینمایی احساسی",
    directorIntent: conflict
      ? `تمرکز کارگردانی بر برجسته‌کردن کشمکش اصلی: ${conflict}`
      : "تمرکز کارگردانی بر ایجاد فضا، ریتم و احساس صحنه",
  };
}

export function createDirectorStudioOutput(form) {
  const dialogueText = form?.dialogueText?.trim?.() || "";

  return {
    overview: {
      title: form.projectTitle || "بدون عنوان",
      sceneTitle: form.sceneTitle || "بدون عنوان صحنه",
      location: form.location || "-",
      mood: form.mood || "-",
      time: form.timeOfDay || "-",
      duration: form.estimatedDuration || "-",
      language: form.outputLanguage || "فارسی",
    },

    sceneBreakdown: [
      `شروع صحنه در ${form.location || "لوکیشن نامشخص"} با مود ${form.mood || "خنثی"}.`,
      `شخصیت‌های حاضر: ${form.characters || "هنوز تعریف نشده‌اند"}.`,
      `کنش اصلی صحنه: ${form.actionSummary || "هنوز نوشته نشده"}.`,
      `لحن دیالوگ: ${form.dialogueTone || "طبیعی"}.`,
      dialogueText ? `دیالوگ حرفه‌ای برای این صحنه تولید شده است.` : `دیالوگ حرفه‌ای هنوز تولید نشده است.`,
    ],

    cameraPlan: [
      "لانگ شات برای معرفی فضا",
      "مدیوم شات برای تعامل شخصیت‌ها",
      "کلوزآپ برای تاکید احساسی",
      form.cameraStyle || "حرکت نرم و کنترل‌شده",
    ],

    lightingPlan: [
      form.lightingStyle || "نور نرم سینمایی",
      "کنتراست کنترل‌شده برای حفظ عمق تصویر",
      "نور بک برای جداسازی سوژه از بک‌گراند",
    ],

    blockingPlan: [
      "ورود کنترل‌شده شخصیت اصلی به قاب",
      "جابه‌جایی با هدف تقویت تنش یا صمیمیت",
      "استفاده از فاصله و زاویه بدن برای روایت احساس",
    ],

    directorNotes: [
      form.directorIntent || "تمرکز بر احساسات و روایت سینمایی",
      "ریتم اجرا متناسب با مود صحنه حفظ شود",
      "سکوت و مکث در نقاط احساسی مهم جدی گرفته شود",
      dialogueText
        ? "دیالوگ تولیدشده با میزانسن و ریتم بازی هماهنگ اجرا شود."
        : "در صورت نیاز، دیالوگ حرفه‌ای برای صحنه تولید شود.",
    ],

    shotList: [
      { shot: "01", type: "Wide", description: "نمای کلی از لوکیشن و فضای صحنه" },
      { shot: "02", type: "Medium", description: "ورود یا استقرار شخصیت در صحنه" },
      { shot: "03", type: "Over Shoulder", description: "تعامل یا تقابل بین شخصیت‌ها" },
      { shot: "04", type: "Close-up", description: "نمای نزدیک از احساسات چهره" },
      { shot: "05", type: "Insert", description: "جزئیات مهم برای تقویت روایت" },
    ],

    soundDesign: [
      form.soundDesign || "صدای محیط و افکت‌های طبیعی صحنه",
      "کنترل دقیق لایه‌های صوتی برای حفظ تمرکز احساسی",
    ],

    music: [form.musicStyle || "موسیقی سینمایی متناسب با مود صحنه"],

    dialogue: dialogueText
      ? dialogueText.split("\n").filter(Boolean)
      : ["هنوز دیالوگی ساخته نشده"],
  };
}