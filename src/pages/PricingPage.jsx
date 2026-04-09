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
import {
  CRYPTO_NETWORKS,
  createCreditPurchaseInvoice,
  createCryptoInvoice,
  downloadInvoiceJson,
} from "../ai/cryptoPayments.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const PAGE = "min-h-[calc(100vh-110px)] bg-black text-white";
const WRAP = "mx-auto max-w-[1320px] px-4 py-8 md:px-6";
const HERO =
  "mb-10 rounded-[32px] border border-white/10 bg-gradient-to-br from-cyan-400/10 via-white/5 to-amber-300/10 p-6 backdrop-blur-xl md:p-8";
const CARD =
  "rounded-[30px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:border-cyan-400/40 hover:bg-white/[0.06]";
const ACTIVE_CARD = "border-cyan-400/70 bg-cyan-400/10";
const BUTTON = "mt-6 w-full rounded-2xl py-3 text-sm font-bold transition";
const PRIMARY_BUTTON =
  "bg-gradient-to-r from-cyan-400 to-amber-300 text-black hover:scale-[1.01]";
const SECONDARY_BUTTON =
  "border border-white/10 bg-white/5 text-white hover:border-cyan-400/40 hover:bg-white/10";
const TOGGLE = "rounded-xl px-4 py-2 text-sm font-semibold transition";
const CHIP =
  "inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70";
const INPUT =
  "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none";

function mapPlanToCredit(planId) {
  if (planId === "pro") return CREDIT_PLANS.MONTHLY_PRO;
  if (planId === "studio") return CREDIT_PLANS.YEARLY;
  return CREDIT_PLANS.FREE;
}

function usdtFromCredits(credits) {
  return Number((Number(credits || 0) / 10).toFixed(2));
}

export default function PricingPage({ onBackHome }) {
  const [billing, setBilling] = useState("monthly");
  const [currentPlanId, setCurrentPlanId] = useState("free");
  const [creditSummary, setCreditSummary] = useState(() => getCreditSummary());
  const [selectedNetworkId, setSelectedNetworkId] = useState(CRYPTO_NETWORKS[0].id);
  const [invoice, setInvoice] = useState(null);
  const [creditInvoice, setCreditInvoice] = useState(null);
  const [customCredits, setCustomCredits] = useState(20);
  const { t } = useLanguage();
  const { user, requireAuth, refreshUserFromPatch } = useAuth();

  useEffect(() => {
    setCurrentPlanId(getCurrentPlanId());
    setCreditSummary(getCreditSummary());
  }, []);

  const selectedNetwork = useMemo(
    () => CRYPTO_NETWORKS.find((item) => item.id === selectedNetworkId) || CRYPTO_NETWORKS[0],
    [selectedNetworkId]
  );

  function syncPlan(planId) {
    const updated = setCurrentPlan(planId);
    setCreditPlan(mapPlanToCredit(planId));
    resetCreditsToday(mapPlanToCredit(planId));
    setCurrentPlanId(updated.id);
    setCreditSummary(getCreditSummary());
  }

  function handleChoosePlan(planId) {
    if (!requireAuth("signup")) return;
    syncPlan(planId);
  }

  function handleSaveWallet(walletAddress) {
    if (!requireAuth("login")) return;
    refreshUserFromPatch({ walletAddress: String(walletAddress || "").trim() });
  }

  function handleCreateInvoice(plan) {
    if (!requireAuth("login")) return;

    const nextInvoice = createCryptoInvoice({
      plan,
      billing,
      user,
      networkId: selectedNetworkId,
    });

    setInvoice(nextInvoice);
  }

  function handleCreateCreditInvoice() {
    if (!requireAuth("login")) return;

    const nextInvoice = createCreditPurchaseInvoice({
      credits: customCredits,
      user,
      networkId: selectedNetworkId,
    });

    setCreditInvoice(nextInvoice);
  }

  function handleMockApproveCreditPurchase() {
    if (!creditInvoice) return;
    addPurchasedCredits(creditInvoice.purchase.credits);
    setCreditSummary(getCreditSummary());
  }

  return (
    <div className={PAGE}>
      <div className={WRAP}>
        <section className={HERO}>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className={CHIP}>{t("common.pricing", "Pricing")}</span>
            <span className={CHIP}>Subscription + Credits</span>
            <span className={CHIP}>Crypto Payment Ready</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight md:text-5xl">
            {t("common.pricing", "Pricing")}
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60 md:text-base">
            {t("pricing.heroText", "Choose your plan and start creating")}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">
              {t("pricing.currentCredits", "Current credits:")}{" "}
              <span className="font-bold text-white">{creditSummary.creditsRemaining}</span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">
              Free: <span className="font-bold text-white">{creditSummary.freeCreditsRemaining}</span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">
              Paid: <span className="font-bold text-white">{creditSummary.paidCreditsRemaining}</span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">
              {t("pricing.watermark", "Watermark:")}{" "}
              <span className="font-bold text-white">
                {creditSummary.watermark
                  ? t("pricing.on", "On")
                  : t("pricing.off", "Off")}
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">
              Reset:{" "}
              <span className="font-bold text-white">
                {creditSummary.nextCreditResetAt
                  ? new Date(creditSummary.nextCreditResetAt).toLocaleString()
                  : "—"}
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">
              User:{" "}
              <span className="font-bold text-white">
                {user?.email || "Guest"}
              </span>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setBilling("monthly")}
              className={`${TOGGLE} ${
                billing === "monthly" ? "bg-cyan-400 text-black" : "bg-white/10 text-white"
              }`}
            >
              {t("common.monthly", "Monthly")}
            </button>

            <button
              onClick={() => setBilling("yearly")}
              className={`${TOGGLE} ${
                billing === "yearly" ? "bg-cyan-400 text-black" : "bg-white/10 text-white"
              }`}
            >
              {t("common.yearly", "Yearly")}
            </button>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {pricingPlans.map((plan) => {
            const price = billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
            const isActive = currentPlanId === plan.id;

            return (
              <article key={plan.id} className={`${CARD} ${isActive ? ACTIVE_CARD : ""}`}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-2xl font-black">{plan.name}</div>
                    <div className="mt-1 text-sm text-white/50">{plan.description}</div>
                  </div>

                  <span className={CHIP}>{plan.badge}</span>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-black">
                    {price === 0 ? t("common.free", "Free") : `$${price}`}
                  </span>
                  <span className="ml-2 text-sm text-white/45">
                    {price === 0 ? "" : billing === "monthly" ? "/mo" : "/yr"}
                  </span>
                </div>

                <div className="grid gap-2 text-sm text-white/80">
                  <div>{t("pricing.imagesDay", "Images/day")}: {plan.limits.imagePerDay}</div>
                  <div>{t("pricing.videosDay", "Videos/day")}: {plan.limits.videoPerDay}</div>
                  <div>{t("pricing.maxVideo", "Max video")}: {plan.limits.maxVideoSeconds}s</div>
                  <div>{t("pricing.subtitlesDay", "Subtitles/day")}: {plan.limits.subtitlePerDay}</div>
                  <div>{t("pricing.voiceDay", "Voice/day")}: {plan.limits.voicePerDay}</div>
                  <div>{t("pricing.musicDay", "Music/day")}: {plan.limits.musicPerDay}</div>
                  <div>{t("pricing.exportDay", "Export/day")}: {plan.limits.exportPerDay}</div>
                  <div>{t("pricing.maxExport", "Max export")}: {plan.limits.maxExportResolution}</div>
                </div>

                <button
                  onClick={() => handleChoosePlan(plan.id)}
                  className={`${BUTTON} ${
                    isActive
                      ? SECONDARY_BUTTON
                      : plan.monthlyPrice === 0
                        ? SECONDARY_BUTTON
                        : PRIMARY_BUTTON
                  }`}
                >
                  {isActive ? t("common.currentPlan", "Current Plan") : plan.cta}
                </button>

                {plan.id !== "free" ? (
                  <button
                    onClick={() => handleCreateInvoice(plan)}
                    className={`${BUTTON} ${SECONDARY_BUTTON}`}
                  >
                    Create Crypto Invoice
                  </button>
                ) : null}
              </article>
            );
          })}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className={CARD}>
            <div className="mb-4 text-xl font-black">Credit Purchase</div>

            <div className="mb-3 text-sm text-white/65">
              Buy custom credits with watermark. Min 20 / Max 170
            </div>

            <div className="mb-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="mb-2 flex items-center justify-between text-sm text-white/75">
                <span>Credits</span>
                <span className="font-bold text-white">{customCredits}</span>
              </div>

              <input
                type="range"
                min="20"
                max="170"
                step="10"
                value={customCredits}
                onChange={(e) => setCustomCredits(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />

              <div className="mt-3 flex items-center justify-between text-sm text-white/60">
                <span>20</span>
                <span>170</span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
              <div>Price: <span className="font-bold text-white">{usdtFromCredits(customCredits)} USDT</span></div>
              <div className="mt-2">Formula: 10 credits = 1 USDT</div>
              <div className="mt-2">Watermark: Afrawood logo</div>
            </div>

            <button
              onClick={handleCreateCreditInvoice}
              className={`${BUTTON} ${PRIMARY_BUTTON}`}
            >
              Create Credit Invoice
            </button>

            <button
              onClick={handleMockApproveCreditPurchase}
              className={`${BUTTON} ${SECONDARY_BUTTON}`}
              disabled={!creditInvoice}
            >
              Mock Approve Credit Purchase
            </button>
          </div>

          <div className={CARD}>
            <div className="mb-4 text-xl font-black">Credit Invoice Preview</div>

            <pre className="max-h-[520px] overflow-auto rounded-2xl bg-black/40 p-4 text-xs leading-6 text-cyan-100">
{JSON.stringify(
  creditInvoice || {
    app: "Afrawood",
    feature: "credit_purchase",
    status: "awaiting_invoice",
    note: "Use the slider and create a credit invoice.",
  },
  null,
  2
)}
            </pre>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                className={`${BUTTON} ${SECONDARY_BUTTON} mt-0 px-5`}
                onClick={() =>
                  creditInvoice &&
                  downloadInvoiceJson(creditInvoice, "afrawood_credit_invoice.json")
                }
                disabled={!creditInvoice}
              >
                Download Credit Invoice
              </button>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className={CARD}>
            <div className="mb-4 text-xl font-black">Crypto Payment Prep</div>

            <label className="mb-2 block text-sm text-white/70">Network</label>
            <select
              className={INPUT}
              value={selectedNetworkId}
              onChange={(e) => setSelectedNetworkId(e.target.value)}
            >
              {CRYPTO_NETWORKS.map((network) => (
                <option key={network.id} value={network.id}>
                  {network.label}
                </option>
              ))}
            </select>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
              <div>Receiver</div>
              <div className="mt-2 break-all font-semibold text-white">
                {selectedNetwork.address}
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm text-white/70">Your wallet address</label>
              <input
                className={INPUT}
                defaultValue={user?.walletAddress || ""}
                placeholder="Your crypto wallet"
                onBlur={(e) => handleSaveWallet(e.target.value)}
              />
            </div>
          </div>

          <div className={CARD}>
            <div className="mb-4 text-xl font-black">Subscription Invoice Preview</div>

            <pre className="max-h-[520px] overflow-auto rounded-2xl bg-black/40 p-4 text-xs leading-6 text-cyan-100">
{JSON.stringify(
  invoice || {
    app: "Afrawood",
    feature: "crypto_payment",
    status: "awaiting_invoice",
    note: "Choose a paid plan and click Create Crypto Invoice.",
  },
  null,
  2
)}
            </pre>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                className={`${BUTTON} ${SECONDARY_BUTTON} mt-0 px-5`}
                onClick={() => invoice && downloadInvoiceJson(invoice)}
                disabled={!invoice}
              >
                Download Subscription Invoice
              </button>

              {onBackHome ? (
                <button className={`${BUTTON} ${SECONDARY_BUTTON} mt-0 px-5`} onClick={onBackHome}>
                  {t("common.backHome", "Back Home")}
                </button>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}