import React from "react";

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl rounded-[28px] border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-black md:text-4xl">❌ Payment Cancelled</h1>
        <p className="mt-4 text-sm leading-7 text-white/70 md:text-base">
          Your payment was cancelled. No credits were charged. You can return and try again anytime.
        </p>

        <div className="mt-8">
          <a
            href="/"
            className="inline-flex rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white"
          >
            Back Home
          </a>
        </div>
      </div>
    </div>
  );
}