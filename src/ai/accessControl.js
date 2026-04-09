import { getPersistedSession, persistSession, updateUser } from "./userStore.js";

export const PLAN_DEFINITIONS = {
  free: {
    id: "free",
    name: "Free",
    badge: "Starter",
    monthlyPrice: 0,
    yearlyPrice: 0,
    watermark: true,
    initialCredits: 100,
    limits: {
      imagePerDay: 10,
      videoPerDay: 5,
      maxVideoSeconds: 15,
      subtitlePerDay: 3,
      voicePerDay: 10,
      musicPerDay: 5,
      exportPerDay: 3,
      maxExportResolution: "1080p",
    },
  },
  pro: {
    id: "pro",
    name: "Monthly Pro",
    badge: "Popular",
    monthlyPrice: 19,
    yearlyPrice: 190,
    watermark: false,
    initialCredits: 350,
    limits: {
      imagePerDay: 50,
      videoPerDay: 20,
      maxVideoSeconds: 15,
      subtitlePerDay: 20,
      voicePerDay: 40,
      musicPerDay: 20,
      exportPerDay: 20,
      maxExportResolution: "2k",
    },
  },
  studio: {
    id: "studio",
    name: "Yearly",
    badge: "Best Value",
    monthlyPrice: 49,
    yearlyPrice: 490,
    watermark: false,
    initialCredits: 1000,
    limits: {
      imagePerDay: 200,
      videoPerDay: 80,
      maxVideoSeconds: 15,
      subtitlePerDay: 80,
      voicePerDay: 120,
      musicPerDay: 80,
      exportPerDay: 80,
      maxExportResolution: "4k",
    },
  },
};

function getPlan(planId = "free") {
  return PLAN_DEFINITIONS[planId] || PLAN_DEFINITIONS.free;
}

export function getCurrentPlan() {
  const session = getPersistedSession();
  return getPlan(session?.planId || "free");
}

export function getCurrentPlanId() {
  return getCurrentPlan().id;
}

export function setCurrentPlan(planId = "free") {
  const plan = getPlan(planId);
  const session = getPersistedSession();

  if (session?.id) {
    const updated = updateUser(session.id, {
      planId: plan.id,
      watermark: Boolean(plan.watermark),
      freeCredits: plan.initialCredits,
      nextCreditResetAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    });

    if (updated) {
      persistSession(updated);
    }
  }

  return plan;
}

export function canAccessFeature() {
  return true;
}

export function getFeatureAccessSummary() {
  const plan = getCurrentPlan();
  return {
    planId: plan.id,
    planName: plan.name,
    watermark: plan.watermark,
    limits: plan.limits,
  };
}