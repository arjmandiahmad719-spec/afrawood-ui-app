export const PLAN_IDS = {
  FREE: "free",
  PRO: "pro",
  STUDIO: "studio",
};

export const FEATURE_KEYS = {
  AI_SCRIPT: "ai_script",
  CINEMATIC_IMAGE: "cinematic_image",
  VIDEO_GENERATOR: "video_generator",
  VIDEO_MERGE: "video_merge",
  SUBTITLE_GENERATOR: "subtitle_generator",
  VOICE_GENERATOR: "voice_generator",
  MUSIC_GENERATOR: "music_generator",
  EXPORT: "export",
  HD_EXPORT: "hd_export",
  PRIORITY_QUEUE: "priority_queue",
  COMMERCIAL_USE: "commercial_use",
  NO_WATERMARK: "no_watermark",
  API_READY: "api_ready",
};

export const pricingPlans = [
  {
    id: PLAN_IDS.FREE,
    name: "Free",
    badge: "Start",
    monthlyPrice: 0,
    yearlyPrice: 0,
    currency: "USD",
    description: "برای تست اولیه و آشنایی با Afrawood",
    limits: {
      imagePerDay: 10,
      videoPerDay: 2,
      maxVideoSeconds: 30,
      subtitlePerDay: 5,
      voicePerDay: 3,
      musicPerDay: 2,
      exportPerDay: 2,
      maxExportResolution: "720p",
    },
    features: {
      [FEATURE_KEYS.AI_SCRIPT]: true,
      [FEATURE_KEYS.CINEMATIC_IMAGE]: true,
      [FEATURE_KEYS.VIDEO_GENERATOR]: true,
      [FEATURE_KEYS.VIDEO_MERGE]: true,
      [FEATURE_KEYS.SUBTITLE_GENERATOR]: true,
      [FEATURE_KEYS.VOICE_GENERATOR]: true,
      [FEATURE_KEYS.MUSIC_GENERATOR]: true,
      [FEATURE_KEYS.EXPORT]: true,
      [FEATURE_KEYS.HD_EXPORT]: false,
      [FEATURE_KEYS.PRIORITY_QUEUE]: false,
      [FEATURE_KEYS.COMMERCIAL_USE]: false,
      [FEATURE_KEYS.NO_WATERMARK]: false,
      [FEATURE_KEYS.API_READY]: false,
    },
    cta: "Start Free",
  },
  {
    id: PLAN_IDS.PRO,
    name: "Pro",
    badge: "Best Value",
    monthlyPrice: 19,
    yearlyPrice: 190,
    currency: "USD",
    description: "برای تولیدکننده محتوا و درآمدزایی حرفه‌ای",
    limits: {
      imagePerDay: 200,
      videoPerDay: 25,
      maxVideoSeconds: 180,
      subtitlePerDay: 50,
      voicePerDay: 40,
      musicPerDay: 20,
      exportPerDay: 40,
      maxExportResolution: "4k",
    },
    features: {
      [FEATURE_KEYS.AI_SCRIPT]: true,
      [FEATURE_KEYS.CINEMATIC_IMAGE]: true,
      [FEATURE_KEYS.VIDEO_GENERATOR]: true,
      [FEATURE_KEYS.VIDEO_MERGE]: true,
      [FEATURE_KEYS.SUBTITLE_GENERATOR]: true,
      [FEATURE_KEYS.VOICE_GENERATOR]: true,
      [FEATURE_KEYS.MUSIC_GENERATOR]: true,
      [FEATURE_KEYS.EXPORT]: true,
      [FEATURE_KEYS.HD_EXPORT]: true,
      [FEATURE_KEYS.PRIORITY_QUEUE]: true,
      [FEATURE_KEYS.COMMERCIAL_USE]: true,
      [FEATURE_KEYS.NO_WATERMARK]: true,
      [FEATURE_KEYS.API_READY]: true,
    },
    cta: "Upgrade to Pro",
  },
  {
    id: PLAN_IDS.STUDIO,
    name: "Studio",
    badge: "Advanced",
    monthlyPrice: 49,
    yearlyPrice: 490,
    currency: "USD",
    description: "برای تیم‌ها، استودیوها و استفاده سنگین",
    limits: {
      imagePerDay: 1000,
      videoPerDay: 120,
      maxVideoSeconds: 600,
      subtitlePerDay: 300,
      voicePerDay: 200,
      musicPerDay: 120,
      exportPerDay: 200,
      maxExportResolution: "4k",
    },
    features: {
      [FEATURE_KEYS.AI_SCRIPT]: true,
      [FEATURE_KEYS.CINEMATIC_IMAGE]: true,
      [FEATURE_KEYS.VIDEO_GENERATOR]: true,
      [FEATURE_KEYS.VIDEO_MERGE]: true,
      [FEATURE_KEYS.SUBTITLE_GENERATOR]: true,
      [FEATURE_KEYS.VOICE_GENERATOR]: true,
      [FEATURE_KEYS.MUSIC_GENERATOR]: true,
      [FEATURE_KEYS.EXPORT]: true,
      [FEATURE_KEYS.HD_EXPORT]: true,
      [FEATURE_KEYS.PRIORITY_QUEUE]: true,
      [FEATURE_KEYS.COMMERCIAL_USE]: true,
      [FEATURE_KEYS.NO_WATERMARK]: true,
      [FEATURE_KEYS.API_READY]: true,
    },
    cta: "Get Studio",
  },
];

export function getPlanById(planId = PLAN_IDS.FREE) {
  return pricingPlans.find((plan) => plan.id === planId) || pricingPlans[0];
}

export function getDefaultPlan() {
  return getPlanById(PLAN_IDS.FREE);
}

export function hasPlanFeature(planId, featureKey) {
  const plan = getPlanById(planId);
  return Boolean(plan?.features?.[featureKey]);
}

export function getPlanLimit(planId, limitKey) {
  const plan = getPlanById(planId);
  return plan?.limits?.[limitKey];
}

export default pricingPlans;