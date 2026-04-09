import { getPersistedSession, persistSession, updateUser } from "./userStore.js";
import { PLAN_DEFINITIONS } from "./accessControl.js";

const GUEST_STATE_KEY = "afrawood_guest_credit_state_v3";
const RESET_INTERVAL_MS = 48 * 60 * 60 * 1000;

export const CREDIT_PLANS = {
  FREE: "free",
  MONTHLY_PRO: "pro",
  YEARLY: "studio",
};

export const CREDIT_ACTIONS = {
  IMAGE_CREATE: "image_create",
  IMAGE_EDIT: "image_edit",
  VIDEO_CREATE: "video_create",
  VIDEO_EDIT: "video_edit",
  VOICE_CREATE: "voice_create",
  VOICE_EDIT: "voice_edit",
  MUSIC_CREATE: "music_create",
  MUSIC_EDIT: "music_edit",
  SUBTITLE_CREATE: "subtitle_create",
  SUBTITLE_EDIT: "subtitle_edit",
  MERGE_CREATE: "merge_create",
};

const ACTION_RULES = {
  [CREDIT_ACTIONS.IMAGE_CREATE]: { cost: 10 },
  [CREDIT_ACTIONS.IMAGE_EDIT]: { cost: 5, freeEdits: 3 },

  [CREDIT_ACTIONS.VIDEO_CREATE]: { cost: 20 },
  [CREDIT_ACTIONS.VIDEO_EDIT]: { cost: 15, freeEdits: 2 },

  [CREDIT_ACTIONS.VOICE_CREATE]: { cost: 10 },
  [CREDIT_ACTIONS.VOICE_EDIT]: { cost: 5, freeEdits: 3 },

  [CREDIT_ACTIONS.MUSIC_CREATE]: { cost: 15 },
  [CREDIT_ACTIONS.MUSIC_EDIT]: { cost: 10 },

  [CREDIT_ACTIONS.SUBTITLE_CREATE]: {
    perUnitCost: 50,
    unitSeconds: 30,
  },
  [CREDIT_ACTIONS.SUBTITLE_EDIT]: {
    cost: 0,
    freeEdits: 3,
    lockAfterFreeEdits: true,
  },

  [CREDIT_ACTIONS.MERGE_CREATE]: {
    perUnitCost: 45,
    unitSeconds: 30,
  },
};

function getPlan(planId = "free") {
  return PLAN_DEFINITIONS[planId] || PLAN_DEFINITIONS.free;
}

function nextResetIso() {
  return new Date(Date.now() + RESET_INTERVAL_MS).toISOString();
}

function createGuestState(planId = "free") {
  const plan = getPlan(planId);
  return {
    freeCredits: plan.initialCredits,
    paidCredits: 0,
    planId: plan.id,
    watermark: Boolean(plan.watermark),
    usage: {},
    nextCreditResetAt: nextResetIso(),
  };
}

function getGuestState() {
  const raw = localStorage.getItem(GUEST_STATE_KEY);

  if (!raw) {
    const initial = createGuestState("free");
    localStorage.setItem(GUEST_STATE_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    return JSON.parse(raw);
  } catch {
    const initial = createGuestState("free");
    localStorage.setItem(GUEST_STATE_KEY, JSON.stringify(initial));
    return initial;
  }
}

function saveGuestState(state) {
  localStorage.setItem(GUEST_STATE_KEY, JSON.stringify(state));
}

function ensureReset(state) {
  const now = Date.now();
  const nextResetAt = new Date(state.nextCreditResetAt || 0).getTime();
  const plan = getPlan(state.planId || "free");

  if (!nextResetAt || now >= nextResetAt) {
    state.freeCredits = plan.initialCredits;
    state.usage = {};
    state.nextCreditResetAt = nextResetIso();
  }

  return state;
}

function getActiveState() {
  const session = getPersistedSession();

  if (session?.id) {
    return {
      kind: "user",
      state: ensureReset({
        userId: session.id,
        freeCredits: Number.isFinite(Number(session.freeCredits))
          ? Number(session.freeCredits)
          : getPlan(session.planId).initialCredits,
        paidCredits: Number.isFinite(Number(session.paidCredits))
          ? Number(session.paidCredits)
          : 0,
        planId: session.planId || "free",
        watermark:
          typeof session.watermark === "boolean"
            ? session.watermark
            : Boolean(getPlan(session.planId).watermark),
        usage: session.usage || {},
        nextCreditResetAt: session.nextCreditResetAt || nextResetIso(),
      }),
    };
  }

  return {
    kind: "guest",
    state: ensureReset(getGuestState()),
  };
}

function saveActiveState(kind, state) {
  if (kind === "user") {
    const updated = updateUser(state.userId, {
      freeCredits: state.freeCredits,
      paidCredits: state.paidCredits,
      planId: state.planId,
      watermark: state.watermark,
      usage: state.usage,
      nextCreditResetAt: state.nextCreditResetAt,
    });

    if (updated) {
      persistSession(updated);
    }
    return;
  }

  saveGuestState({
    freeCredits: state.freeCredits,
    paidCredits: state.paidCredits,
    planId: state.planId,
    watermark: state.watermark,
    usage: state.usage,
    nextCreditResetAt: state.nextCreditResetAt,
  });
}

function totalCredits(state) {
  return Number(state.freeCredits || 0) + Number(state.paidCredits || 0);
}

function getUsageCount(state, action) {
  return Number(state?.usage?.[action] || 0);
}

function setUsageCount(state, action, count) {
  state.usage = state.usage || {};
  state.usage[action] = count;
}

function getActionCost(action, options = {}, state = null) {
  const rule = ACTION_RULES[action];
  if (!rule) return 0;

  const usageCount = state ? getUsageCount(state, action) : 0;

  if (rule.lockAfterFreeEdits && usageCount >= rule.freeEdits) {
    return null;
  }

  if (typeof rule.freeEdits === "number" && usageCount < rule.freeEdits) {
    return 0;
  }

  if (rule.perUnitCost && rule.unitSeconds) {
    const seconds = Math.max(1, Number(options.seconds) || rule.unitSeconds);
    const units = Math.ceil(seconds / rule.unitSeconds);
    return units * rule.perUnitCost;
  }

  return Number(rule.cost || 0);
}

function spendFromPools(state, amount) {
  let remaining = Number(amount || 0);

  const freeAvailable = Number(state.freeCredits || 0);
  const paidAvailable = Number(state.paidCredits || 0);

  const freeUsed = Math.min(freeAvailable, remaining);
  state.freeCredits = freeAvailable - freeUsed;
  remaining -= freeUsed;

  const paidUsed = Math.min(paidAvailable, remaining);
  state.paidCredits = paidAvailable - paidUsed;
  remaining -= paidUsed;

  return {
    ok: remaining <= 0,
    freeUsed,
    paidUsed,
  };
}

export function getCreditSummary() {
  const active = getActiveState();
  const state = active.state;
  const plan = getPlan(state.planId);

  saveActiveState(active.kind, state);

  return {
    creditsRemaining: totalCredits(state),
    freeCreditsRemaining: Number(state.freeCredits || 0),
    paidCreditsRemaining: Number(state.paidCredits || 0),
    nextCreditResetAt: state.nextCreditResetAt,
    plan,
    planId: plan.id,
    watermark: Boolean(state.watermark),
    usage: state.usage || {},
  };
}

export function setCreditPlan(planId = CREDIT_PLANS.FREE) {
  const active = getActiveState();
  const state = active.state;
  const plan = getPlan(planId);

  state.planId = plan.id;
  state.watermark = Boolean(plan.watermark);

  saveActiveState(active.kind, state);

  return getCreditSummary();
}

export function resetCreditsToday(planId = null) {
  const active = getActiveState();
  const state = active.state;
  const plan = getPlan(planId || state.planId || "free");

  state.planId = plan.id;
  state.freeCredits = plan.initialCredits;
  state.watermark = Boolean(plan.watermark);
  state.usage = {};
  state.nextCreditResetAt = nextResetIso();

  saveActiveState(active.kind, state);

  return getCreditSummary();
}

export function canSpendCredits(action, options = {}) {
  const active = getActiveState();
  const state = active.state;

  const requiredCredits = getActionCost(action, options, state);

  if (requiredCredits === null) {
    return {
      ok: false,
      requiredCredits: 0,
      message: "Edit limit reached.",
    };
  }

  const creditsRemaining = totalCredits(state);

  if (creditsRemaining < requiredCredits) {
    return {
      ok: false,
      requiredCredits,
      message: "Not enough credits.",
    };
  }

  return {
    ok: true,
    requiredCredits,
    creditsRemaining,
  };
}

export function spendCredits(action, options = {}) {
  const active = getActiveState();
  const state = active.state;

  const requiredCredits = getActionCost(action, options, state);

  if (requiredCredits === null) {
    return {
      ok: false,
      creditsSpent: 0,
      message: "Edit limit reached.",
    };
  }

  if (totalCredits(state) < requiredCredits) {
    return {
      ok: false,
      creditsSpent: 0,
      message: "Not enough credits.",
    };
  }

  const deduction = spendFromPools(state, requiredCredits);
  if (!deduction.ok) {
    return {
      ok: false,
      creditsSpent: 0,
      message: "Not enough credits.",
    };
  }

  setUsageCount(state, action, getUsageCount(state, action) + 1);
  saveActiveState(active.kind, state);

  return {
    ok: true,
    creditsSpent: requiredCredits,
    freeUsed: deduction.freeUsed,
    paidUsed: deduction.paidUsed,
    summary: getCreditSummary(),
  };
}

export function addPurchasedCredits(amount = 0) {
  const credits = Math.max(0, Number(amount) || 0);
  const active = getActiveState();
  const state = active.state;

  state.paidCredits = Number(state.paidCredits || 0) + credits;

  saveActiveState(active.kind, state);

  return getCreditSummary();
}