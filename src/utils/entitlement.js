// src/utils/entitlement.js

/**
 * Afrawood Entitlement Rules
 * Stable watermark decision logic for current plan + credit system
 */

/**
 * Normalize plan key
 */
export function normalizePlan(plan) {
  const raw =
    typeof plan === "string"
      ? plan
      : plan?.id || plan?.key || plan?.name || plan?.type || "";

  return String(raw).trim().toLowerCase();
}

/**
 * Detect subscription plans that should remove watermark
 */
export function isNoWatermarkSubscription(plan) {
  const key = normalizePlan(plan);

  return [
    "pro",
    "monthly-pro",
    "monthly_pro",
    "monthlypro",
    "yearly",
    "yearly-pro",
    "yearly_pro",
    "yearlypro",
    "annual",
    "annual-pro",
    "annual_pro",
    "annualpro",
  ].includes(key);
}

/**
 * Free and purchased-credit flows keep watermark on
 */
export function isWatermarkRequired({
  user = null,
  plan = null,
  subscription = null,
  billing = null,
  credits = null,
} = {}) {
  const resolvedPlan =
    plan ??
    user?.plan ??
    user?.currentPlan ??
    subscription?.plan ??
    billing?.plan ??
    credits?.plan ??
    "free";

  if (isNoWatermarkSubscription(resolvedPlan)) {
    return false;
  }

  return true;
}

/**
 * Return stable entitlement object for UI / export pipeline
 */
export function getUserEntitlements(context = {}) {
  const watermarkRequired = isWatermarkRequired(context);

  return {
    watermarkRequired,
    exportWatermark: watermarkRequired,
    imageWatermark: watermarkRequired,
    videoWatermark: watermarkRequired,
    noWatermark: !watermarkRequired,
  };
}

/**
 * Small helper for direct checks in components
 */
export function canExportWithoutWatermark(context = {}) {
  return !isWatermarkRequired(context);
}