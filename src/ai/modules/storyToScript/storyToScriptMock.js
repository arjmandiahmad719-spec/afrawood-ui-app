function getLanguagePack(language) {
  const packs = {
    fa: {
      movieTitle: "فیلمنامه سینمایی",
      seriesTitle: "سریال",
      overallSummary: "خلاصه کل فیلمنامه",
      noDialogue: "بدون دیالوگ",
      movieLogline: (genre, tone, idea, duration) =>
        `یک داستان ${genre} با لحن ${tone} درباره «${idea}» که برای قالب سینمایی در حدود ${duration} دقیقه روایت می‌شود.`,
      movieOverallSummary: (idea, genre, tone) =>
        `این اثر سینمایی داستان «${idea}» را در قالبی ${genre} و با فضایی ${tone} دنبال می‌کند. روایت از معرفی جهان داستان و شخصیت‌ها آغاز می‌شود، سپس به بحران، کشمکش، اوج و پیامد نهایی می‌رسد.`,
      seriesLogline: (genre, tone, idea, type, episodes, duration) =>
        `یک سریال ${genre} با لحن ${tone} درباره «${idea}» در قالب ${type === "serialized" ? "تداوم داستانی" : "اپیزودی"} با ${episodes} قسمت ${duration} دقیقه‌ای.`,
      seriesOverallSummary: (idea, type, episodes, duration) =>
        `این سریال روایت «${idea}» را در ${episodes} قسمت ${duration} دقیقه‌ای دنبال می‌کند. ساختار آن ${type === "serialized" ? "تداوم داستانی" : "اپیزودی"} است و داستان بر پایه رشد شخصیت، تعلیق، بحران و کشش عاطفی پیش می‌رود.`,
    },
    en: {
      movieTitle: "Cinema Screenplay",
      seriesTitle: "Series",
      overallSummary: "Overall Summary",
      noDialogue: "No dialogue",
      movieLogline: (genre, tone, idea, duration) =>
        `A ${tone} ${genre} cinema screenplay about "${idea}" designed for approximately ${duration} minutes.`,
      movieOverallSummary: (idea, genre, tone) =>
        `This cinematic work follows "${idea}" through a ${genre} narrative with a ${tone} atmosphere. The story moves from setup and emotional grounding toward conflict, climax, and final consequence.`,
      seriesLogline: (genre, tone, idea, type, episodes, duration) =>
        `A ${tone} ${genre} series about "${idea}" in a ${type === "serialized" ? "serialized" : "episodic"} format with ${episodes} episodes of ${duration} minutes each.`,
      seriesOverallSummary: (idea, type, episodes, duration) =>
        `This series develops "${idea}" across ${episodes} episodes of ${duration} minutes each. Its structure is ${type === "serialized" ? "serialized" : "episodic"}, focusing on character growth, suspense, conflict, and emotional progression.`,
    },
    tr: {
      movieTitle: "Sinematik Senaryo",
      seriesTitle: "Dizi",
      overallSummary: "Genel Özet",
      noDialogue: "Diyalog yok",
      movieLogline: (genre, tone, idea, duration) =>
        `"${idea}" hakkında, yaklaşık ${duration} dakikalık ${tone} tonlu bir ${genre} sinema senaryosu.`,
      movieOverallSummary: (idea, genre, tone) =>
        `Bu sinematik eser, "${idea}" hikâyesini ${genre} yapısında ve ${tone} atmosferinde takip eder. Hikâye tanıtım, çatışma, zirve ve sonuç çizgisinde ilerler.`,
      seriesLogline: (genre, tone, idea, type, episodes, duration) =>
        `"${idea}" hakkında, ${type === "serialized" ? "devamlı hikâye" : "epizodik"} yapıda, ${episodes} bölümlük ve bölüm başı ${duration} dakikalık ${tone} tonlu bir ${genre} dizi.`,
      seriesOverallSummary: (idea, type, episodes, duration) =>
        `Bu dizi, "${idea}" hikâyesini ${episodes} bölüm boyunca ve her bölüm ${duration} dakika olacak şekilde geliştirir. Yapısı ${type === "serialized" ? "devamlı hikâye" : "epizodik"} olup karakter gelişimi, gerilim ve duygusal akış üzerine kuruludur.`,
    },
    fr: {
      movieTitle: "Scénario Cinématographique",
      seriesTitle: "Série",
      overallSummary: "Résumé Global",
      noDialogue: "Pas de dialogue",
      movieLogline: (genre, tone, idea, duration) =>
        `Un scénario de cinéma ${genre} au ton ${tone}, autour de « ${idea} », conçu pour environ ${duration} minutes.`,
      movieOverallSummary: (idea, genre, tone) =>
        `Cette œuvre cinématographique suit « ${idea} » dans une structure ${genre} avec une ambiance ${tone}. Le récit avance de l’exposition au conflit, puis vers le climax et ses conséquences.`,
      seriesLogline: (genre, tone, idea, type, episodes, duration) =>
        `Une série ${genre} au ton ${tone}, autour de « ${idea} », en format ${type === "serialized" ? "feuilletonnant" : "épisodique"}, avec ${episodes} épisodes de ${duration} minutes.`,
      seriesOverallSummary: (idea, type, episodes, duration) =>
        `Cette série développe « ${idea} » sur ${episodes} épisodes de ${duration} minutes chacun. Sa structure est ${type === "serialized" ? "feuilletonnante" : "épisodique"}, avec une progression axée sur les personnages, la tension et l’émotion.`,
    },
    ar: {
      movieTitle: "سيناريو سينمائي",
      seriesTitle: "مسلسل",
      overallSummary: "الملخص العام",
      noDialogue: "لا يوجد حوار",
      movieLogline: (genre, tone, idea, duration) =>
        `سيناريو سينمائي من نوع ${genre} وبأسلوب ${tone} حول «${idea}» لمدة تقارب ${duration} دقيقة.`,
      movieOverallSummary: (idea, genre, tone) =>
        `يتابع هذا العمل السينمائي قصة «${idea}» ضمن إطار ${genre} وبأجواء ${tone}. يتحرك السرد من التمهيد إلى الصراع ثم الذروة والنتيجة.`,
      seriesLogline: (genre, tone, idea, type, episodes, duration) =>
        `مسلسل ${genre} بأسلوب ${tone} حول «${idea}» بصيغة ${type === "serialized" ? "مستمرة" : "حلقات مستقلة"} من ${episodes} حلقات مدة كل حلقة ${duration} دقيقة.`,
      seriesOverallSummary: (idea, type, episodes, duration) =>
        `يتابع هذا المسلسل قصة «${idea}» عبر ${episodes} حلقات مدة كل منها ${duration} دقيقة. بنيته ${type === "serialized" ? "مستمرة" : "حلقات مستقلة"} وتركز على تطور الشخصية والتشويق والصراع.`,
    },
  };

  return packs[language] || packs.fa;
}

function getLocalizedTime(language, index) {
  const isNight = index % 2 === 0;
  if (language === "en") return isNight ? "Night" : "Day";
  if (language === "tr") return isNight ? "Gece" : "Gündüz";
  if (language === "fr") return isNight ? "Nuit" : "Jour";
  if (language === "ar") return isNight ? "ليل" : "نهار";
  return isNight ? "شب" : "روز";
}

function parseCharactersFromIdea(storyIdea = "", language = "fa") {
  const raw = String(storyIdea);

  if (/فرهاد/.test(raw) && /شیرین/.test(raw)) {
    return ["فرهاد", "شیرین", "خسرو"];
  }

  const separators = /[\n،,]/;
  const parts = raw
    .split(separators)
    .map((item) => item.trim())
    .filter(Boolean);

  const found = [];
  parts.forEach((item) => {
    if (
      item.length > 1 &&
      item.length < 24 &&
      !found.includes(item) &&
      found.length < 4
    ) {
      found.push(item);
    }
  });

  if (found.length >= 2) return found.slice(0, 3);

  if (language === "en") return ["Main Character", "Second Character"];
  if (language === "tr") return ["Ana Karakter", "İkinci Karakter"];
  if (language === "fr") return ["Personnage Principal", "Deuxième Personnage"];
  if (language === "ar") return ["الشخصية الرئيسية", "الشخصية الثانية"];
  return ["شخصیت اصلی", "شخصیت دوم"];
}

function isFarhadShirinStory(storyIdea = "") {
  return /فرهاد/.test(storyIdea) && /شیرین/.test(storyIdea);
}

function getStoryStages(language = "fa") {
  if (language === "en") {
    return [
      "Setup",
      "Inciting Incident",
      "Emotional Shift",
      "Conflict",
      "Rising Stakes",
      "Climax",
      "Aftermath",
    ];
  }
  if (language === "tr") {
    return [
      "Kurulum",
      "Kıvılcım",
      "Duygusal Kırılma",
      "Çatışma",
      "Yükselen Bedel",
      "Zirve",
      "Sonrası",
    ];
  }
  if (language === "fr") {
    return [
      "Mise en place",
      "Élément déclencheur",
      "Bascule émotionnelle",
      "Conflit",
      "Montée des enjeux",
      "Climax",
      "Après-coup",
    ];
  }
  if (language === "ar") {
    return [
      "التمهيد",
      "الشرارة",
      "التحول العاطفي",
      "الصراع",
      "تصاعد الرهان",
      "الذروة",
      "النتيجة",
    ];
  }

  return [
    "معرفی",
    "جرقه",
    "چرخش احساسی",
    "تقابل",
    "افزایش بحران",
    "اوج",
    "پیامد",
  ];
}

function getGenericLocations(language = "fa") {
  if (language === "en") {
    return [
      "EXT. OLD STREET",
      "INT. QUIET ROOM",
      "EXT. ROOFTOP",
      "INT. HALLWAY",
      "EXT. MARKET",
      "INT. BACKSTAGE",
      "EXT. COURTYARD",
    ];
  }
  if (language === "tr") {
    return [
      "EXT. ESKİ SOKAK",
      "INT. SESSİZ ODA",
      "EXT. ÇATI",
      "INT. KORİDOR",
      "EXT. PAZAR",
      "INT. KULİS",
      "EXT. AVLU",
    ];
  }
  if (language === "fr") {
    return [
      "EXT. VIEILLE RUE",
      "INT. CHAMBRE SILENCIEUSE",
      "EXT. TOIT",
      "INT. COULOIR",
      "EXT. MARCHÉ",
      "INT. COULISSES",
      "EXT. COUR",
    ];
  }
  if (language === "ar") {
    return [
      "EXT. شارع قديم",
      "INT. غرفة هادئة",
      "EXT. سطح",
      "INT. ممر",
      "EXT. سوق",
      "INT. كواليس",
      "EXT. ساحة",
    ];
  }

  return [
    "EXT. کوچه قدیمی",
    "INT. اتاق ساکت",
    "EXT. پشت‌بام",
    "INT. راهرو",
    "EXT. بازار",
    "INT. پشت‌صحنه",
    "EXT. حیاط",
  ];
}

function getFarhadShirinLocations(language = "fa") {
  if (language === "en") {
    return [
      "EXT. MOUNTAIN SLOPE",
      "INT. SHIRIN'S PALACE",
      "EXT. STONE WORKSITE",
      "INT. ROYAL HALL",
      "EXT. MOUNTAIN PASS",
      "INT. QUIET CHAMBER",
      "EXT. STORMY HEIGHTS",
    ];
  }
  if (language === "tr") {
    return [
      "EXT. DAĞ ETEĞİ",
      "INT. ŞİRİN'İN SARAYI",
      "EXT. TAŞ OCAĞI",
      "INT. KRALİYET SALONU",
      "EXT. DAĞ GEÇİDİ",
      "INT. SESSİZ ODA",
      "EXT. FIRTINALI YÜKSEKLİKLER",
    ];
  }
  if (language === "fr") {
    return [
      "EXT. PENTE DE LA MONTAGNE",
      "INT. PALAIS DE SHIRIN",
      "EXT. CARRIÈRE DE PIERRE",
      "INT. SALLE ROYALE",
      "EXT. PASSAGE DE MONTAGNE",
      "INT. CHAMBRE SILENCIEUSE",
      "EXT. HAUTEURS ORAGEUSES",
    ];
  }
  if (language === "ar") {
    return [
      "EXT. سفح الجبل",
      "INT. قصر شيرين",
      "EXT. موقع نحت الحجر",
      "INT. القاعة الملكية",
      "EXT. ممر جبلي",
      "INT. غرفة هادئة",
      "EXT. مرتفعات عاصفة",
    ];
  }

  return [
    "EXT. دامنه کوه",
    "INT. قصر شیرین",
    "EXT. کارگاه سنگ‌تراشی",
    "INT. تالار شاهانه",
    "EXT. گذرگاه کوهستانی",
    "INT. اتاق خلوت",
    "EXT. ارتفاعات طوفانی",
  ];
}

function getDialogueCount(stageIndex, isFarhadShirin, durationMinutes) {
  const base = isFarhadShirin ? 7 : 6;
  const bonus = durationMinutes >= 20 ? 2 : durationMinutes >= 10 ? 1 : 0;
  return base + bonus + (stageIndex % 3);
}

function getGenericDialogueTemplates(language, storyIdea, genre, tone) {
  if (language === "en") {
    return [
      `You still think "${storyIdea}" is only a passing problem.`,
      `Stories built on ${genre} never stay harmless for long.`,
      `Sometimes what destroys us looks exactly like what saves us.`,
      `You asked for truth, but truth never arrives gently.`,
      `This silence has already cost us too much.`,
      `If we keep waiting, the choice will be made without us.`,
      `I can carry pain, but I cannot carry false hope forever.`,
      `This is no longer just about desire; it is about consequence.`,
      `Every step forward in a ${tone} story demands a sacrifice.`,
      `What we refuse to say out loud is shaping everything now.`,
      `There is still time to stop lying to ourselves.`,
      `Some endings begin the moment we pretend we still have control.`,
    ];
  }

  if (language === "tr") {
    return [
      `"${storyIdea}" sandığından daha derin bir mesele.`,
      `${genre} üzerine kurulu hikâyeler uzun süre masum kalmaz.`,
      `Bazen bizi kurtaran şey, aynı anda bizi yıkan şey olur.`,
      `Gerçeği istedin ama gerçek asla yumuşak gelmez.`,
      `Bu sessizlik bize zaten çok pahalıya mal oldu.`,
      `Daha fazla beklersek karar bizsiz verilecek.`,
      `Acıya dayanırım ama sahte umudu sonsuza kadar taşıyamam.`,
      `Bu artık sadece arzuyla ilgili değil; sonuçlarla ilgili.`,
      `${tone} bir hikâyede ileri atılan her adım bir bedel ister.`,
      `Yüksek sesle söylemediğimiz şey her şeyi yönlendiriyor.`,
      `Kendimize yalan söylemeyi bırakmak için hâlâ zaman var.`,
      `Bazı sonlar, hâlâ kontrol bizde sanmamızla başlar.`,
    ];
  }

  if (language === "fr") {
    return [
      `Tu crois encore que « ${storyIdea} » n’est qu’un problème passager.`,
      `Les récits fondés sur le ${genre} ne restent jamais inoffensifs très longtemps.`,
      `Parfois, ce qui nous sauve ressemble exactement à ce qui nous détruit.`,
      `Tu as demandé la vérité, mais la vérité n’arrive jamais avec douceur.`,
      `Ce silence nous a déjà coûté trop cher.`,
      `Si nous attendons encore, la décision se prendra sans nous.`,
      `Je peux porter la douleur, mais pas l’illusion éternellement.`,
      `Ce n’est plus seulement une affaire de désir, mais de conséquence.`,
      `Dans une histoire ${tone}, chaque pas en avant exige un sacrifice.`,
      `Ce que nous refusons de dire à voix haute décide déjà de tout.`,
      `Il reste encore du temps pour cesser de nous mentir.`,
      `Certaines fins commencent au moment où l’on croit encore contrôler la suite.`,
    ];
  }

  if (language === "ar") {
    return [
      `ما زلت تظن أن «${storyIdea}» مجرد مشكلة عابرة.`,
      `القصص المبنية على ${genre} لا تبقى آمنة طويلاً.`,
      `أحياناً ما ينقذنا هو نفسه ما يحطمنا.`,
      `طلبت الحقيقة، لكن الحقيقة لا تصل بلطف.`,
      `هذا الصمت كلّفنا أكثر مما ينبغي.`,
      `إذا واصلنا الانتظار، فسيُتخذ القرار من دوننا.`,
      `أستطيع حمل الألم، لكن لا أستطيع حمل الوهم إلى الأبد.`,
      `لم يعد الأمر متعلقاً بالرغبة فقط، بل بالعواقب أيضاً.`,
      `في قصة ذات طابع ${tone}، كل خطوة إلى الأمام تتطلب تضحية.`,
      `ما نرفض قوله علناً هو ما يشكّل كل شيء الآن.`,
      `لا يزال هناك وقت لنتوقف عن الكذب على أنفسنا.`,
      `بعض النهايات تبدأ لحظة نظن أننا ما زلنا نتحكم في كل شيء.`,
    ];
  }

  return [
    `تو هنوز فکر می‌کنی «${storyIdea}» فقط یک مسئله گذراست.`,
    `قصه‌هایی که بر پایه ${genre} ساخته می‌شوند، هیچ‌وقت زیاد بی‌خطر نمی‌مانند.`,
    `بعضی وقت‌ها چیزی که نجاتمان می‌دهد، همان چیزی‌ست که خردمان می‌کند.`,
    `تو حقیقت را خواستی، اما حقیقت هیچ‌وقت آرام از راه نمی‌رسد.`,
    `این سکوت، بیشتر از چیزی که فکر می‌کردیم از ما گرفته است.`,
    `اگر بیشتر از این صبر کنیم، تصمیم بدون ما گرفته می‌شود.`,
    `من می‌توانم درد را تحمل کنم، اما امید دروغین را نه.`,
    `دیگر مسئله فقط خواستن نیست؛ مسئله بهایی‌ست که باید داد.`,
    `در یک روایت ${tone}، هر قدم رو به جلو یک قربانی می‌خواهد.`,
    `چیزی که بلند نمی‌گوییم، دارد همه چیز را شکل می‌دهد.`,
    `هنوز وقت هست که دست‌کم به خودمان دروغ نگوییم.`,
    `بعضی پایان‌ها از همان لحظه‌ای شروع می‌شوند که فکر می‌کنیم هنوز کنترل دست ماست.`,
  ];
}

function getFarhadShirinDialogueBlocks(language) {
  if (language === "en") {
    return [
      [
        { character: "Farhad", text: "Since I saw her, the mountain no longer feels like stone; it feels like fate." },
        { character: "Shirin", text: "If fate were kind, it would not place love in the shadow of fear." },
        { character: "Farhad", text: "Then let me carve a path through fear itself." },
        { character: "Shirin", text: "Some roads do not lead to union; they only reveal how much the heart can endure." },
        { character: "Farhad", text: "Then let my endurance speak where my place in the world cannot." },
        { character: "Shirin", text: "Your silence is louder than the voices that surround me." },
      ],
      [
        { character: "Shirin", text: "Every step toward you costs me peace." },
        { character: "Farhad", text: "And every step away from you costs me breath." },
        { character: "Shirin", text: "Some loves begin like light and continue like a wound." },
        { character: "Farhad", text: "Then let the wound remain honest." },
        { character: "Shirin", text: "Honesty is dangerous in palaces built on fear." },
        { character: "Farhad", text: "Fear has already taken enough from us." },
      ],
      [
        { character: "Khosrow", text: "In this kingdom, power decides which love survives." },
        { character: "Farhad", text: "Power can command bodies, not hearts." },
        { character: "Khosrow", text: "Hearts break faster than crowns fall." },
        { character: "Shirin", text: "Crowns are remembered by history; hearts are remembered by truth." },
        { character: "Khosrow", text: "Truth is whatever remains standing." },
        { character: "Farhad", text: "Then let history learn to kneel before what it cannot own." },
      ],
      [
        { character: "Farhad", text: "I have carried stone for less than what I carry in silence now." },
        { character: "Shirin", text: "Silence is merciful only until it becomes a prison." },
        { character: "Farhad", text: "Then let truth wound us honestly." },
        { character: "Shirin", text: "Honest wounds heal slower, but they do not rot the soul." },
        { character: "Farhad", text: "I would rather bleed by truth than live by a lie." },
        { character: "Shirin", text: "Then do not turn away when the truth asks everything of you." },
      ],
      [
        { character: "Khosrow", text: "You call this love, but I see defiance." },
        { character: "Shirin", text: "Because power fears any feeling it cannot own." },
        { character: "Farhad", text: "And love fears only the day it must kneel." },
        { character: "Khosrow", text: "Everything kneels eventually." },
        { character: "Shirin", text: "Not what was born in dignity." },
        { character: "Farhad", text: "And not what has already survived humiliation." },
      ],
      [
        { character: "Farhad", text: "The mountain grows smaller each day, but the distance to you grows heavier." },
        { character: "Shirin", text: "Some distances are built by walls, others by names." },
        { character: "Farhad", text: "Then I will outlast both." },
        { character: "Shirin", text: "Do not promise victory when the world is built to exhaust men like you." },
        { character: "Farhad", text: "I am already exhausted; that is why I can no longer be frightened." },
        { character: "Shirin", text: "Then let courage be your last shelter." },
      ],
      [
        { character: "Shirin", text: "I can hear sorrow arriving before it speaks." },
        { character: "Farhad", text: "Then hold this moment tightly; it may be all that mercy allows." },
        { character: "Shirin", text: "Even mercy feels late in stories like ours." },
        { character: "Farhad", text: "Late mercy is still kinder than no mercy at all." },
        { character: "Shirin", text: "What if kindness is only another name for delay?" },
        { character: "Farhad", text: "Then let delay be enough for one more truth between us." },
      ],
    ];
  }

  return [
    [
      { character: "فرهاد", text: "از وقتی تو را دیدم، این کوه دیگر سنگ نیست؛ انگار سرنوشت است." },
      { character: "شیرین", text: "اگر سرنوشت مهربان بود، عشق را در سایه ترس پنهان نمی‌کرد." },
      { character: "فرهاد", text: "پس بگذار راهی از دل همین ترس باز کنم." },
      { character: "شیرین", text: "بعضی راه‌ها به وصال نمی‌رسند؛ فقط به آدم نشان می‌دهند دلش چقدر طاقت دارد." },
      { character: "فرهاد", text: "پس بگذار طاقت من جایی حرف بزند که جایگاهم نمی‌تواند." },
      { character: "شیرین", text: "سکوت تو از همه صداهایی که دور من‌اند بلندتر است." },
    ],
    [
      { character: "شیرین", text: "هر قدمی که به تو نزدیک می‌شوم، بهای آرامشم را بیشتر می‌پردازم." },
      { character: "فرهاد", text: "و هر قدمی که از تو دور بمانم، انگار نفس کشیدن را از من می‌گیرد." },
      { character: "شیرین", text: "بعضی عشق‌ها با نور شروع می‌شوند و با زخم ادامه پیدا می‌کنند." },
      { character: "فرهاد", text: "پس بگذار این زخم، دست‌کم صادقانه بماند." },
      { character: "شیرین", text: "صداقت در قصرهایی که بر ترس بنا شده‌اند، خطرناک است." },
      { character: "فرهاد", text: "ترس تا همین‌جا هم از ما خیلی چیزها گرفته." },
    ],
    [
      { character: "خسرو", text: "در این سرزمین، قدرت تصمیم می‌گیرد کدام عشق زنده بماند." },
      { character: "فرهاد", text: "قدرت فقط بر تن حکم می‌راند، نه بر دل." },
      { character: "خسرو", text: "دل‌ها خیلی زودتر از تاج‌ها می‌شکنند." },
      { character: "شیرین", text: "تاج‌ها را تاریخ به خاطر می‌سپارد، دل‌ها را حقیقت." },
      { character: "خسرو", text: "حقیقت همان چیزی‌ست که آخرِ کار ایستاده بماند." },
      { character: "فرهاد", text: "پس بگذار تاریخ یاد بگیرد در برابر چیزی که نمی‌تواند مالکش باشد، زانو بزند." },
    ],
    [
      { character: "فرهاد", text: "من برای سنگ کمتر از چیزی که حالا در سکوت حمل می‌کنم رنج کشیده‌ام." },
      { character: "شیرین", text: "سکوت فقط تا وقتی مهربان است که به زندان تبدیل نشده باشد." },
      { character: "فرهاد", text: "پس بگذار این‌بار حقیقت، صادقانه زخمی‌مان کند." },
      { character: "شیرین", text: "زخم صادقانه آهسته‌تر خوب می‌شود، اما روح را نمی‌پوساند." },
      { character: "فرهاد", text: "من ترجیح می‌دهم از حقیقت خون بدهم تا با دروغ زنده بمانم." },
      { character: "شیرین", text: "پس وقتی حقیقت همه چیز را از تو خواست، از آن رو برنگردان." },
    ],
    [
      { character: "خسرو", text: "تو اسم این را عشق می‌گذاری، اما من فقط سرپیچی می‌بینم." },
      { character: "شیرین", text: "چون قدرت همیشه از احساسی می‌ترسد که نتواند صاحبش شود." },
      { character: "فرهاد", text: "و عشق فقط از روزی می‌ترسد که مجبور شود زانو بزند." },
      { character: "خسرو", text: "همه چیز بالاخره جایی زانو می‌زند." },
      { character: "شیرین", text: "نه چیزی که از عزت به دنیا آمده باشد." },
      { character: "فرهاد", text: "و نه چیزی که از تحقیر جان سالم به در برده باشد." },
    ],
    [
      { character: "فرهاد", text: "هر روز که می‌گذرد، کوه کوچک‌تر می‌شود، اما فاصله من با تو سنگین‌تر." },
      { character: "شیرین", text: "بعضی فاصله‌ها را دیوارها می‌سازند، بعضی را نام‌ها." },
      { character: "فرهاد", text: "پس من از هر دو عبور می‌کنم." },
      { character: "شیرین", text: "وقتی جهان برای فرسودن مردانی مثل تو ساخته شده، از پیروزی حرف نزن." },
      { character: "فرهاد", text: "من همین حالا هم فرسوده‌ام؛ برای همین دیگر نمی‌ترسم." },
      { character: "شیرین", text: "پس بگذار شجاعت، آخرین پناهت باشد." },
    ],
    [
      { character: "شیرین", text: "من صدای اندوه را پیش از آنکه حرف بزند می‌شنوم." },
      { character: "فرهاد", text: "پس این لحظه را محکم نگه دار؛ شاید همه سهم ما از رحمت همین باشد." },
      { character: "شیرین", text: "در قصه‌ای مثل قصه ما، حتی رحمت هم دیر می‌رسد." },
      { character: "فرهاد", text: "رحمتِ دیررس هم از نبودنش مهربان‌تر است." },
      { character: "شیرین", text: "اگر مهربانی فقط اسم دیگری برای تأخیر باشد چه؟" },
      { character: "فرهاد", text: "آن‌وقت بگذار همین تأخیر، برای یک حقیقت دیگر بین ما کافی باشد." },
    ],
  ];
}

function buildDialogueLines({
  language,
  storyIdea,
  stage,
  stageIndex,
  characters,
  tone,
  genre,
  isFarhadShirin,
  durationMinutes = 20,
}) {
  const a = characters[0];
  const b = characters[1] || characters[0];
  const c = characters[2] || null;

  if (isFarhadShirin) {
    const blocks = getFarhadShirinDialogueBlocks(language);
    const selected = blocks[stageIndex % blocks.length];
    const targetCount = getDialogueCount(stageIndex, true, durationMinutes);
    const expanded = [];

    while (expanded.length < targetCount) {
      expanded.push(...selected);
    }

    return expanded.slice(0, targetCount);
  }

  const templates = getGenericDialogueTemplates(language, storyIdea, genre, tone);
  const targetCount = getDialogueCount(stageIndex, false, durationMinutes);
  const lines = [];

  for (let i = 0; i < targetCount; i++) {
    const turn = i % 3;
    const speaker = turn === 0 ? a : turn === 1 ? b : c || a;
    const text = templates[(stageIndex + i) % templates.length];

    lines.push({
      character: speaker,
      text,
    });
  }

  return lines;
}

function createMovieScenes(input) {
  const {
    storyIdea,
    genre,
    tone,
    durationMinutes,
    includeNarration,
    language,
    audience,
  } = input;

  const safeDuration = Math.max(1, Number(durationMinutes) || 20);
  const lang = getLanguagePack(language);
  const stages = getStoryStages(language);
  const characters = parseCharactersFromIdea(storyIdea, language);
  const specialFarhad = isFarhadShirinStory(storyIdea);
  const locations = specialFarhad
    ? getFarhadShirinLocations(language)
    : getGenericLocations(language);

  const sceneCount = Math.max(
    stages.length,
    safeDuration >= 20 ? 8 : safeDuration >= 10 ? 6 : 4
  );

  const scenes = Array.from({ length: sceneCount }).map((_, index) => {
    const stage = stages[index % stages.length];
    const location = locations[index % locations.length];

    let visual;
    let narration;

    if (language === "en") {
      visual = `Scene ${index + 1} - ${stage}: The story of "${storyIdea}" deepens in a ${tone} atmosphere as the dramatic pressure rises.`;
      narration = includeNarration
        ? `Narration for scene ${index + 1}: The characters move deeper into a ${genre} world shaped for a ${audience || "general"} audience.`
        : "";
    } else if (language === "tr") {
      visual = `Sahne ${index + 1} - ${stage}: "${storyIdea}" hikâyesi ${tone} bir atmosferde daha yoğun bir çatışmaya doğru ilerler.`;
      narration = includeNarration
        ? `Sahne ${index + 1} anlatımı: Karakterler ${genre} dünyasında daha derin bir yüzleşmeye girer.`
        : "";
    } else if (language === "fr") {
      visual = `Scène ${index + 1} - ${stage} : L’histoire de « ${storyIdea} » avance dans une ambiance ${tone}, avec une tension croissante.`;
      narration = includeNarration
        ? `Narration de la scène ${index + 1} : Les personnages entrent dans une zone plus dense du conflit ${genre}.`
        : "";
    } else if (language === "ar") {
      visual = `المشهد ${index + 1} - ${stage}: تتقدم قصة «${storyIdea}» في أجواء ${tone} مع تصاعد واضح في الضغط الدرامي.`;
      narration = includeNarration
        ? `تعليق المشهد ${index + 1}: تدخل الشخصيات طبقة أعمق من الصراع داخل عالم ${genre}.`
        : "";
    } else {
      visual = `صحنه ${index + 1} - ${stage}: داستان «${storyIdea}» در فضایی ${tone} جلو می‌رود و فشار دراماتیک بیشتر می‌شود.`;
      narration = includeNarration
        ? `روایت صحنه ${index + 1}: شخصیت‌ها وارد لایه عمیق‌تری از کشمکش ${genre} می‌شوند و مسیر داستان پیچیده‌تر می‌گردد.`
        : "";
    }

    return {
      sceneNumber: index + 1,
      title: stage,
      location,
      time: getLocalizedTime(language, index),
      visual,
      narration,
      dialogue: buildDialogueLines({
        language,
        storyIdea,
        stage,
        stageIndex: index,
        characters,
        tone,
        genre,
        isFarhadShirin: specialFarhad,
        durationMinutes: safeDuration,
      }),
    };
  });

  return {
    mode: "movie",
    language,
    title: `${lang.movieTitle}: ${storyIdea}`,
    logline: lang.movieLogline(genre, tone, storyIdea, safeDuration),
    overallSummary: lang.movieOverallSummary(storyIdea, genre, tone),
    scenes,
    episodes: [],
  };
}

function createEpisodeScenes(
  storyIdea,
  episodeNumber,
  episodeTitle,
  seriesType,
  language,
  episodeDuration,
  genre,
  tone
) {
  const safeDuration = Math.max(1, Number(episodeDuration) || 10);
  const stagePool = getStoryStages(language);
  const sceneCount = Math.max(4, safeDuration >= 15 ? 6 : 4);
  const characters = parseCharactersFromIdea(storyIdea, language);
  const specialFarhad = isFarhadShirinStory(storyIdea);
  const locations = specialFarhad
    ? getFarhadShirinLocations(language)
    : getGenericLocations(language);

  return Array.from({ length: sceneCount }).map((_, index) => {
    const stage = stagePool[(episodeNumber + index - 1) % stagePool.length];
    const location = locations[(episodeNumber + index - 1) % locations.length];

    let visual;
    let narration;

    if (language === "en") {
      visual = `Episode ${episodeNumber} - ${episodeTitle}: ${stage} pushes the narrative into a more personal and risky direction.`;
      narration = `This part of the story raises the emotional and narrative pressure.`;
    } else if (language === "tr") {
      visual = `Bölüm ${episodeNumber} - ${episodeTitle}: ${stage}, hikâyeyi daha kişisel ve riskli bir yöne taşır.`;
      narration = `Bu bölüm duygusal ve anlatısal baskıyı yükseltir.`;
    } else if (language === "fr") {
      visual = `Épisode ${episodeNumber} - ${episodeTitle} : ${stage} pousse le récit vers une zone plus personnelle et plus risquée.`;
      narration = `Cette partie augmente la tension émotionnelle et narrative.`;
    } else if (language === "ar") {
      visual = `الحلقة ${episodeNumber} - ${episodeTitle}: يدفع ${stage} السرد إلى اتجاه أكثر خطورة وشخصية.`;
      narration = `هذا الجزء يرفع الضغط العاطفي والسردي.`;
    } else {
      visual = `قسمت ${episodeNumber} - ${episodeTitle}: ${stage} داستان را به سمت مرحله‌ای شخصی‌تر و پرخطرتر می‌برد.`;
      narration = `این بخش فشار احساسی و روایی را بالاتر می‌برد.`;
    }

    return {
      sceneNumber: index + 1,
      title: stage,
      location,
      time: getLocalizedTime(language, index),
      visual,
      narration,
      dialogue: buildDialogueLines({
        language,
        storyIdea,
        stage,
        stageIndex: index + episodeNumber,
        characters,
        tone,
        genre,
        isFarhadShirin: specialFarhad,
        durationMinutes: safeDuration,
      }),
    };
  });
}

function createSeriesEpisodes(input) {
  const {
    storyIdea,
    seriesType,
    episodes,
    episodeDuration,
    genre,
    tone,
    language,
  } = input;

  const safeEpisodes = Math.max(1, Number(episodes) || 3);
  const safeEpisodeDuration = Math.max(1, Number(episodeDuration) || 10);
  const lang = getLanguagePack(language);

  const titlesFa = [
    "آغاز ماجرا",
    "ورود کشمکش",
    "نقطه شکست",
    "اوج تصمیم",
    "پیامد و پایان",
  ];
  const titlesEn = [
    "Beginning",
    "Rising Conflict",
    "Breaking Point",
    "Point of Decision",
    "Consequence and End",
  ];
  const titlesTr = [
    "Başlangıç",
    "Yükselen Çatışma",
    "Kırılma Noktası",
    "Karar Anı",
    "Sonuç ve Final",
  ];
  const titlesFr = [
    "Début",
    "Montée du Conflit",
    "Point de Rupture",
    "Moment de Décision",
    "Conséquence et Fin",
  ];
  const titlesAr = [
    "البداية",
    "تصاعد الصراع",
    "نقطة الانكسار",
    "لحظة القرار",
    "النتيجة والنهاية",
  ];

  const titles =
    language === "en"
      ? titlesEn
      : language === "tr"
        ? titlesTr
        : language === "fr"
          ? titlesFr
          : language === "ar"
            ? titlesAr
            : titlesFa;

  const episodesData = Array.from({ length: safeEpisodes }).map((_, index) => {
    const episodeNumber = index + 1;
    const title =
      titles[index] ||
      (language === "en"
        ? "Next Chapter"
        : language === "tr"
          ? "Sonraki Bölüm"
          : language === "fr"
            ? "Chapitre Suivant"
            : language === "ar"
              ? "الفصل التالي"
              : "ادامه مسیر");

    return {
      episodeNumber,
      episodeTitle:
        language === "en"
          ? `Episode ${episodeNumber}: ${title}`
          : language === "tr"
            ? `Bölüm ${episodeNumber}: ${title}`
            : language === "fr"
              ? `Épisode ${episodeNumber} : ${title}`
              : language === "ar"
                ? `الحلقة ${episodeNumber}: ${title}`
                : `قسمت ${episodeNumber}: ${title}`,
      duration:
        language === "en"
          ? `${safeEpisodeDuration} minutes`
          : language === "tr"
            ? `${safeEpisodeDuration} dakika`
            : language === "fr"
              ? `${safeEpisodeDuration} minutes`
              : language === "ar"
                ? `${safeEpisodeDuration} دقيقة`
                : `${safeEpisodeDuration} دقیقه`,
      summary:
        language === "en"
          ? `Episode ${episodeNumber} advances the story of "${storyIdea}" through "${title}" in a ${tone} ${genre} structure.`
          : language === "tr"
            ? `Bölüm ${episodeNumber}, "${storyIdea}" hikâyesini "${title}" ekseninde ${tone} bir ${genre} yapısıyla ilerletir.`
            : language === "fr"
              ? `L’épisode ${episodeNumber} fait avancer l’histoire de « ${storyIdea} » à travers « ${title} », dans une structure ${genre} au ton ${tone}.`
              : language === "ar"
                ? `تدفع الحلقة ${episodeNumber} قصة «${storyIdea}» إلى الأمام من خلال «${title}» ضمن بناء ${genre} وبأسلوب ${tone}.`
                : `در قسمت ${episodeNumber}، داستان «${storyIdea}» با محور «${title}» در ساختاری ${genre} و لحن ${tone} جلو می‌رود.`,
      cliffhanger:
        language === "en"
          ? "A decisive emotional turn closes the episode and pushes the story forward."
          : language === "tr"
            ? "Belirleyici duygusal bir kırılma bölümü kapatır ve hikâyeyi ileri iter."
            : language === "fr"
              ? "Un tournant émotionnel décisif clôt l’épisode et pousse le récit vers l’avant."
              : language === "ar"
                ? "انعطافة عاطفية حاسمة تنهي الحلقة وتدفع القصة إلى الأمام."
                : "یک چرخش احساسی سرنوشت‌ساز قسمت را می‌بندد و داستان را جلو می‌برد.",
      scenes: createEpisodeScenes(
        storyIdea,
        episodeNumber,
        title,
        seriesType,
        language,
        safeEpisodeDuration,
        genre,
        tone
      ),
    };
  });

  return {
    mode: "series",
    language,
    title: `${lang.seriesTitle}: ${storyIdea}`,
    logline: lang.seriesLogline(
      genre,
      tone,
      storyIdea,
      seriesType,
      safeEpisodes,
      safeEpisodeDuration
    ),
    overallSummary: lang.seriesOverallSummary(
      storyIdea,
      seriesType,
      safeEpisodes,
      safeEpisodeDuration
    ),
    scenes: [],
    episodes: episodesData,
  };
}

export async function generateMockScript(input) {
  await new Promise((resolve) => setTimeout(resolve, 400));

  if (input.contentType === "series") {
    return createSeriesEpisodes(input);
  }

  return createMovieScenes(input);
}