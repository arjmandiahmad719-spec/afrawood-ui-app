import React, { useEffect, useMemo, useState } from "react";
import { addPurchasedCredits } from "../ai/creditSystem.js";

const PAGE = "min-h-screen bg-black px-6 py-10 text-white";
const CARD =
  "mx-auto max-w-3xl rounded-[28px] border border-white/10 bg-white/5 p-8";
const APPLY_PREFIX = "afrawood_stripe_applied_";

function getSessionIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return String(params.get("session_id") || "").trim();
}

export default function SuccessPage() {
  const sessionId = useMemo(() => getSessionIdFromUrl(), []);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Checking payment status...");
  const [credits, setCredits] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function verifyAndApply() {
      if (!sessionId) {
        setError("Missing session id");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:4242/checkout-session-status?session_id=${encodeURIComponent(sessionId)}`
        );

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.error || "Could not verify payment");
        }

        if (!data?.paid) {
          setMessage("Payment is not marked as paid yet. Refresh in a few seconds.");
          setCredits(Number(data?.credits || 0));
          return;
        }

        const appliedKey = `${APPLY_PREFIX}${sessionId}`;
        const alreadyApplied = window.localStorage.getItem(appliedKey) === "1";
        const purchasedCredits = Number(data?.credits || 0);

        if (!alreadyApplied && purchasedCredits > 0) {
          addPurchasedCredits(purchasedCredits);
          window.localStorage.setItem(appliedKey, "1");
        }

        if (!cancelled) {
          setCredits(purchasedCredits);
          setMessage("Payment confirmed and credits added successfully.");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Payment verification failed");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    verifyAndApply();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <div className={PAGE}>
      <div className={CARD}>
        <h1 className="text-3xl font-black md:text-4xl">✅ Payment Successful</h1>

        <p className="mt-4 text-sm leading-7 text-white/70 md:text-base">
          {loading ? "Please wait while we confirm your payment..." : message}
        </p>

        {credits > 0 ? (
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/85">
            Credits added: <span className="font-bold text-white">{credits}</span>
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="mt-8">
          <a
            href="/"
            className="inline-flex rounded-2xl bg-gradient-to-r from-cyan-400 to-amber-300 px-5 py-3 text-sm font-bold text-black"
          >
            Back Home
          </a>
        </div>
      </div>
    </div>
  );
}