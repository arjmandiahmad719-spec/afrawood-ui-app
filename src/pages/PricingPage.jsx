import React, { useEffect, useMemo, useState } from "react";
import pricingPlans from "../config/pricingPlans.js";
import { getCurrentPlanId, setCurrentPlan } from "../ai/accessControl.js";
import {
  CREDIT_PLANS,
  addPurchasedCredits,
  getCreditSummary,
  resetCreditsToday,
  setCreditPlan,
} from "../ai/creditSystem.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  cinematicCardStyle,
  cinematicOverlayStyle,
  cinematicPageStyle,
  cinematicWrapStyle,
} from "../styles/pageBackground.js";

const HERO_STYLE = {
  ...cinematicCardStyle,
  padding: 28,
  marginBottom: 24,
};

const CARD_STYLE = {
  ...cinematicCardStyle,
  padding: 22,
};

const ACTIVE_CARD_STYLE = {
  border: "1px solid rgba(30,214,255,0.55)",
  background: "rgba(30,214,255,0.10)",
};

const CHIP_STYLE = {
  display: "inline-flex",
  alignItems: "center",
  height: 34,
  padding: "0 14px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  color: "rgba(255,255,255,0.82)",
  fontSize: 13,
  fontWeight: 700,
};

const TOGGLE_STYLE = {
  height: 44,
  padding: "0 18px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 14,
};

const ACTIVE_TOGGLE_STYLE = {
  ...TOGGLE_STYLE,
  background: "linear-gradient(135deg, #1ed6ff 0%, #f3d35e 100%)",
  color: "#111",
  border: "none",
};

const PRIMARY_BUTTON_STYLE = {
  height: 50,
  padding: "0 20px",
  borderRadius: 16,
  border: "none",
  background: "linear-gradient(135deg, #1ed6ff 0%, #f3d35e 100%)",
  color: "#111",
  cursor: "pointer",
  fontWeight: 800,
  fontSize: 15,
};

const SECONDARY_BUTTON_STYLE = {
  height: 50,
  padding: "0 20px",
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 15,
};

const INPUT_STYLE = {
  width: "100%",
  height: 52,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.28)",
  color: "#fff",
  outline: "none",
  padding: "0 16px",
  fontSize: 16,
  boxSizing: "border-box",
};

function mapPlanToCredit(planId) {
  if (planId === "pro") return CREDIT_PLANS.MONTHLY_PRO;
  if (planId === "studio") return CREDIT_PLANS.YEARLY;
  return CREDIT_PLANS.FREE;
}

function usdtFromCredits(credits) {
  return Number((Number(credits || 0) / 10).toFixed(2));
}

export default function PricingPage() {
  const [billing, setBilling] = useState("monthly");
  const [currentPlanId, setCurrentPlanId] = useState("free");
  const [creditSummary, setCreditSummary] = useState(() => getCreditSummary());
  const [customCredits, setCustomCredits] = useState(20);
  const [statusText, setStatusText] = useState("");

  const { t } = useLanguage();
  const { user, requireAuth } = useAuth();

  useEffect(() => {
    setCurrentPlanId(getCurrentPlanId());
    setCreditSummary(getCreditSummary());
  }, []);

  const visiblePlans = useMemo(() => {
    return Array.isArray(pricingPlans) ? pricingPlans : [];
  }, []);

  function syncPlan(planId) {
    const updated = setCurrentPlan(planId);
    setCreditPlan(mapPlanToCredit(planId));
    resetCreditsToday(mapPlanToCredit(planId));
    setCurrentPlanId(updated.id);
    setCreditSummary(getCreditSummary());
  }

  function handleChoosePlan(planId) {
    if (!requireAuth()) return;
    syncPlan(planId);
    setStatusText("Plan updated successfully.");
  }

  function handleBuyCredits() {
    if (!requireAuth()) return;
    addPurchasedCredits(customCredits);
    setCreditSummary(getCreditSummary());
    setStatusText(`${customCredits} credits added successfully.`);
  }

  return (
    <div style={cinematicPageStyle}>
      <div style={cinematicOverlayStyle} />

      <div style={cinematicWrapStyle}>
        <section style={HERO_STYLE}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
            <div style={CHIP_STYLE}>Upgrade</div>
            <div style={CHIP_STYLE}>Subscriptions</div>
            <div style={CHIP_STYLE}>Credit Purchase</div>
          </div>

          <div style={{ fontSize: 42, fontWeight: 900, marginBottom: 12 }}>
            {t("common.upgrade", "Upgrade")}
          </div>

          <div
            style={{
              fontSize: 18,
              lineHeight: 1.9,
              color: "rgba(255,255,255,0.86)",
              maxWidth: 820,
            }}
          >
            Choose your subscription plan or buy extra credits to unlock more creative power in Afrawood.
          </div>

          <div
            style={{
              marginTop: 22,
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={CHIP_STYLE}>
              User: {user?.email || "Guest"}
            </div>
            <div style={CHIP_STYLE}>
              Current Plan: {creditSummary?.plan?.name || "Free"}
            </div>
            <div style={CHIP_STYLE}>
              Credits: {creditSummary?.creditsRemaining ?? 0}
            </div>
            <div style={CHIP_STYLE}>
              Watermark: {creditSummary?.watermark ? "On" : "Off"}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              style={billing === "monthly" ? ACTIVE_TOGGLE_STYLE : TOGGLE_STYLE}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling("yearly")}
              style={billing === "yearly" ? ACTIVE_TOGGLE_STYLE : TOGGLE_STYLE}
            >
              Yearly
            </button>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 18,
            marginBottom: 24,
          }}
        >
          {visiblePlans.map((plan) => {
            const price = billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
            const isActive = currentPlanId === plan.id;

            return (
              <article
                key={plan.id}
                style={{
                  ...CARD_STYLE,
                  ...(isActive ? ACTIVE_CARD_STYLE : {}),
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 26, fontWeight: 900 }}>{plan.name}</div>
                    <div style={{ marginTop: 8, color: "rgba(255,255,255,0.72)", lineHeight: 1.8 }}>
                      {plan.description}
                    </div>
                  </div>
                  <div style={CHIP_STYLE}>{plan.badge}</div>
                </div>

                <div style={{ fontSize: 38, fontWeight: 900, marginBottom: 16 }}>
                  {price === 0 ? "Free" : `$${price}`}
                  <span style={{ fontSize: 16, color: "rgba(255,255,255,0.62)", marginLeft: 8 }}>
                    {price === 0 ? "" : billing === "monthly" ? "/mo" : "/yr"}
                  </span>
                </div>

                <div style={{ display: "grid", gap: 8, color: "rgba(255,255,255,0.82)", lineHeight: 1.8 }}>
                  <div>Images/day: {plan.limits.imagePerDay}</div>
                  <div>Videos/day: {plan.limits.videoPerDay}</div>
                  <div>Max video: {plan.limits.maxVideoSeconds}s</div>
                  <div>Subtitles/day: {plan.limits.subtitlePerDay}</div>
                  <div>Voice/day: {plan.limits.voicePerDay}</div>
                  <div>Music/day: {plan.limits.musicPerDay}</div>
                  <div>Export/day: {plan.limits.exportPerDay}</div>
                  <div>Max export: {plan.limits.maxExportResolution}</div>
                </div>

                <div style={{ marginTop: 18 }}>
                  <button
                    type="button"
                    onClick={() => handleChoosePlan(plan.id)}
                    style={isActive ? SECONDARY_BUTTON_STYLE : PRIMARY_BUTTON_STYLE}
                  >
                    {isActive ? "Current Plan" : plan.cta}
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "0.95fr 1.05fr",
            gap: 18,
          }}
        >
          <div style={CARD_STYLE}>
            <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>
              Credit Purchase
            </div>

            <div style={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.9, marginBottom: 18 }}>
              Buy custom credits. Minimum 20 and maximum 170. Watermark applies to credit-based usage.
            </div>

            <div
              style={{
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(0,0,0,0.24)",
                padding: 16,
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ color: "rgba(255,255,255,0.76)" }}>Credits</span>
                <span style={{ fontWeight: 800 }}>{customCredits}</span>
              </div>

              <input
                type="range"
                min="20"
                max="170"
                step="10"
                value={customCredits}
                onChange={(e) => setCustomCredits(Number(e.target.value))}
                style={{ width: "100%" }}
              />

              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  justifyContent: "space-between",
                  color: "rgba(255,255,255,0.66)",
                }}
              >
                <span>20</span>
                <span>170</span>
              </div>
            </div>

            <div
              style={{
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(0,0,0,0.24)",
                padding: 16,
                marginBottom: 18,
                lineHeight: 1.9,
              }}
            >
              <div>Price: <strong>{usdtFromCredits(customCredits)} USDT</strong></div>
              <div>Formula: 10 credits = 1 USDT</div>
              <div>Watermark: Afrawood logo</div>
            </div>

            <button type="button" onClick={handleBuyCredits} style={PRIMARY_BUTTON_STYLE}>
              Buy Credits
            </button>
          </div>

          <div style={CARD_STYLE}>
            <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>
              Purchase Summary
            </div>

            <div
              style={{
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(0,0,0,0.24)",
                padding: 18,
                lineHeight: 1.9,
                minHeight: 240,
              }}
            >
              <div><strong>User:</strong> {user?.email || "Guest"}</div>
              <div><strong>Plan:</strong> {creditSummary?.plan?.name || "Free"}</div>
              <div><strong>Credits Remaining:</strong> {creditSummary?.creditsRemaining ?? 0}</div>
              <div><strong>Selected Credit Purchase:</strong> {customCredits}</div>
              <div><strong>Estimated Price:</strong> {usdtFromCredits(customCredits)} USDT</div>
              <div><strong>Watermark:</strong> {creditSummary?.watermark ? "On" : "Off"}</div>

              {statusText ? (
                <div
                  style={{
                    marginTop: 16,
                    borderRadius: 16,
                    border: "1px solid rgba(62,199,109,0.22)",
                    background: "rgba(62,199,109,0.10)",
                    padding: "14px 16px",
                    color: "#c7ffd9",
                  }}
                >
                  {statusText}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}