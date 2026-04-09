// src/ai/components/payments/PaymentPanel.jsx

import React, { useMemo, useState } from "react";
import {
  calculateUSDT,
  validateTxHash,
  createCryptoInvoice,
} from "../../payments/cryptoPayment";
import {
  addTransaction,
  updateTransaction,
} from "../../payments/transactionManager";
import { verifyTransaction } from "../../payments/blockchainVerify";
import { getAfrawoodWalletConfig } from "../../payments/afrawoodWallet";
import { useAfraFlow } from "../../core/AfraFlowContext";

export default function PaymentPanel() {
  const { addCreditsToUser } = useAfraFlow();

  const walletConfig = useMemo(() => getAfrawoodWalletConfig(), []);
  const [credits, setCredits] = useState(20);
  const [txHash, setTxHash] = useState("");
  const [status, setStatus] = useState("");
  const [invoice, setInvoice] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  const amount = calculateUSDT(credits);

  function handleCreateInvoice() {
    const nextInvoice = createCryptoInvoice({ credits });
    addTransaction(nextInvoice);
    setInvoice(nextInvoice);
    setStatus("Invoice created. Send payment to Afrawood wallet.");
  }

  async function handleCopyAddress() {
    try {
      await navigator.clipboard.writeText(walletConfig.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Copy failed:", error);
      setStatus("Copy failed");
    }
  }

  async function handleVerify() {
    if (!invoice) {
      setStatus("Create invoice first");
      return;
    }

    if (!validateTxHash(txHash)) {
      setStatus("Invalid TX Hash");
      return;
    }

    setVerifying(true);
    setStatus("Verifying payment...");

    try {
      const pendingTx = {
        id: `tx_${Date.now()}`,
        invoiceId: invoice.id,
        txHash: txHash.trim(),
        credits: invoice.credits,
        amountUSDT: invoice.amountUSDT,
        network: walletConfig.network,
        coin: walletConfig.coin,
        receiveAddress: walletConfig.address,
        status: "pending",
        createdAt: Date.now(),
      };

      addTransaction(pendingTx);

      const result = await verifyTransaction({
        txHash: txHash.trim(),
        expectedAmount: amount,
        walletAddress: walletConfig.address,
      });

      if (!result?.ok) {
        updateTransaction(pendingTx.id, {
          status: "failed",
          reason: result?.reason || "verification failed",
          checkedAt: Date.now(),
        });
        setStatus("Payment not valid");
        return;
      }

      updateTransaction(pendingTx.id, {
        status: "approved",
        approvedAt: Date.now(),
        verifiedNetwork: result.network || walletConfig.network,
        verifiedAmount: result.amount ?? amount,
        verifiedTo: result.to || walletConfig.address,
      });

      updateTransaction(invoice.id, {
        status: "approved",
        approvedAt: Date.now(),
        txHash: txHash.trim(),
      });

      addCreditsToUser(invoice.credits);
      setStatus("Payment verified, credits added");
      setTxHash("");
    } catch (error) {
      console.error("Verify payment error:", error);
      setStatus("Verify failed");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="p-4 rounded-xl bg-black text-white space-y-4 border border-neutral-800">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Buy Credits</h2>
        <p className="text-sm text-neutral-400">
          Pay with {walletConfig.coin} on {walletConfig.network}
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm">Credits: {credits}</label>
        <input
          type="range"
          min={20}
          max={170}
          step={10}
          value={credits}
          onChange={(e) => setCredits(Number(e.target.value))}
          className="w-full"
        />
        <div className="text-sm text-neutral-300">
          {credits} credits = {amount} USDT
        </div>
      </div>

      <button
        onClick={handleCreateInvoice}
        className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-medium hover:bg-yellow-400 transition"
      >
        Create Invoice
      </button>

      <div className="space-y-2 rounded-xl border border-neutral-800 p-3 bg-neutral-950">
        <div className="text-sm text-neutral-400">Afrawood Wallet Address</div>
        <div className="break-all text-sm">{walletConfig.address}</div>
        <button
          onClick={handleCopyAddress}
          className="px-3 py-2 rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 transition"
        >
          {copied ? "Copied" : "Copy Address"}
        </button>
      </div>

      {invoice && (
        <div className="space-y-2 rounded-xl border border-neutral-800 p-3 bg-neutral-950">
          <div className="text-sm font-medium">Invoice Preview</div>
          <div className="text-sm text-neutral-300">
            Credits: {invoice.credits}
          </div>
          <div className="text-sm text-neutral-300">
            Amount: {invoice.amountUSDT} {invoice.coin}
          </div>
          <div className="text-sm text-neutral-300">
            Network: {invoice.network}
          </div>
          <div className="text-sm text-neutral-300 break-all">
            Receive Address: {invoice.receiveAddress}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <input
          placeholder="Paste TX Hash"
          value={txHash}
          onChange={(e) => setTxHash(e.target.value)}
          className="w-full p-2 rounded-lg text-black"
        />
        <button
          onClick={handleVerify}
          disabled={verifying}
          className="px-4 py-2 rounded-lg bg-green-500 text-black font-medium hover:bg-green-400 transition disabled:opacity-60"
        >
          {verifying ? "Verifying..." : "Verify Payment"}
        </button>
      </div>

      {!!status && <div className="text-sm text-neutral-200">{status}</div>}
    </div>
  );
}