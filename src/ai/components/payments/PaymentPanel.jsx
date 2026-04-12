import React, { useMemo, useState } from "react";
import {
  calculateUSDT,
  createCryptoInvoice,
  validateTxHash,
} from "../../payments/cryptoPayment";
import { getAfrawoodWalletConfig } from "../../payments/afrawoodWallet";
import {
  addTransaction,
  getTransactions,
  updateTransaction,
} from "../../payments/transactionManager";
import { verifyBlockchainPayment } from "../../payments/blockchainVerify";
import { useAfraFlow } from "../../core/AfraFlowContext";

const PANEL = "p-4 rounded-3xl bg-black text-white border border-white/10 space-y-4";
const INPUT = "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none";
const BUTTON_PRIMARY =
  "rounded-2xl px-4 py-3 font-bold bg-gradient-to-r from-cyan-400 to-amber-300 text-black";
const BUTTON_SECONDARY =
  "rounded-2xl px-4 py-3 font-semibold border border-white/10 bg-white/5 text-white";
const CARD = "rounded-2xl border border-white/10 bg-white/5 p-4";

function buildId(prefix = "tx") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function PaymentPanel() {
  const { addCreditsToUser } = useAfraFlow();

  const wallet = useMemo(() => getAfrawoodWalletConfig(), []);
  const [credits, setCredits] = useState(20);
  const [invoice, setInvoice] = useState(null);
  const [txHash, setTxHash] = useState("");
  const [network, setNetwork] = useState(wallet.network || "TRC20");
  const [status, setStatus] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  const amount = calculateUSDT(credits);

  function handleCreateInvoice() {
    const nextInvoice = createCryptoInvoice({ credits });
    const finalInvoice = {
      ...nextInvoice,
      id: buildId("invoice"),
      receiveAddress: wallet.address,
      coin: wallet.coin,
      network,
      createdAt: Date.now(),
      status: "awaiting_payment",
    };

    addTransaction(finalInvoice);
    setInvoice(finalInvoice);
    setStatus("Invoice created");
  }

  async function handleCopyAddress() {
    try {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setStatus("Copy failed");
    }
  }

  async function handleVerify() {
    if (!invoice) {
      setStatus("Create invoice first");
      return;
    }

    if (!validateTxHash(txHash)) {
      setStatus("Invalid TX hash");
      return;
    }

    setVerifying(true);
    setStatus("Verifying payment...");

    const txId = buildId("payment");

    addTransaction({
      id: txId,
      invoiceId: invoice.id,
      txHash: txHash.trim(),
      credits,
      amountUSDT: amount,
      receiveAddress: wallet.address,
      network,
      coin: wallet.coin,
      status: "pending_verification",
      createdAt: Date.now(),
    });

    try {
      const result = await verifyBlockchainPayment({
        txHash: txHash.trim(),
        expectedAmount: amount,
        receiverAddress: wallet.address,
        network,
      });

      if (!result?.ok) {
        updateTransaction(txId, {
          status: "failed",
          reason: result?.reason || "Verification failed",
          verificationResult: result,
        });
        setStatus(result?.reason || "Payment not verified");
        return;
      }

      updateTransaction(txId, {
        status: "approved",
        verifiedAmount: result.amount,
        verifiedTo: result.to,
        verificationResult: result,
        approvedAt: Date.now(),
      });

      updateTransaction(invoice.id, {
        status: "paid",
        txHash: txHash.trim(),
        paidAt: Date.now(),
      });

      addCreditsToUser(credits);
      setStatus("Payment verified and credits added");
      setTxHash("");
    } catch (error) {
      updateTransaction(txId, {
        status: "failed",
        reason: error?.message || "Verification failed",
      });
      setStatus(error?.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  }

  const recentTransactions = getTransactions().slice(0, 5);

  return (
    <div className={PANEL}>
      <div>
        <h2 className="text-xl font-black">Crypto Payment</h2>
        <div className="text-sm text-white/60">
          Buy custom credits and verify with TX hash
        </div>
      </div>

      <div className={CARD}>
        <div className="mb-2 flex items-center justify-between text-sm text-white/70">
          <span>Credits</span>
          <span className="font-bold text-white">{credits}</span>
        </div>

        <input
          type="range"
          min={20}
          max={170}
          step={10}
          value={credits}
          onChange={(e) => setCredits(Number(e.target.value))}
          className="w-full accent-cyan-400"
        />

        <div className="mt-3 text-sm text-white/70">
          {credits} credits = <span className="font-bold text-white">{amount} USDT</span>
        </div>
      </div>

      <div className={CARD}>
        <div className="mb-2 text-sm text-white/70">Network</div>
        <select
          value={network}
          onChange={(e) => setNetwork(e.target.value)}
          className={INPUT}
        >
          <option value="TRC20" className="bg-black">TRC20</option>
          <option value="ERC20" className="bg-black">ERC20</option>
        </select>
      </div>

      <button type="button" onClick={handleCreateInvoice} className={BUTTON_PRIMARY}>
        Create Invoice
      </button>

      <div className={CARD}>
        <div className="mb-2 text-sm text-white/70">Afrawood Wallet</div>
        <div className="break-all text-sm text-white">{wallet.address}</div>

        <button
          type="button"
          onClick={handleCopyAddress}
          className={`${BUTTON_SECONDARY} mt-3`}
        >
          {copied ? "Copied" : "Copy Address"}
        </button>
      </div>

      {invoice ? (
        <div className={CARD}>
          <div className="text-sm text-white/70">Invoice Preview</div>
          <div className="mt-2 text-sm text-white/90">
            Invoice ID: {invoice.id}
          </div>
          <div className="mt-1 text-sm text-white/90">
            Amount: {invoice.amountUSDT} {invoice.coin}
          </div>
          <div className="mt-1 text-sm text-white/90">
            Network: {invoice.network}
          </div>
          <div className="mt-1 text-sm text-white/90">
            Credits: {invoice.credits}
          </div>
        </div>
      ) : null}

      <div className={CARD}>
        <div className="mb-2 text-sm text-white/70">Transaction Hash</div>
        <input
          value={txHash}
          onChange={(e) => setTxHash(e.target.value)}
          placeholder="Paste TX hash"
          className={INPUT}
        />

        <button
          type="button"
          onClick={handleVerify}
          disabled={verifying}
          className={`${BUTTON_PRIMARY} mt-3 w-full ${verifying ? "opacity-60" : ""}`}
        >
          {verifying ? "Verifying..." : "Verify Payment"}
        </button>
      </div>

      {status ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
          {status}
        </div>
      ) : null}

      <div className={CARD}>
        <div className="mb-3 text-sm font-bold text-white">Recent Transactions</div>

        {!recentTransactions.length ? (
          <div className="text-sm text-white/50">No transactions yet</div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-xs text-white/80"
              >
                <div className="font-semibold text-white">{item.id}</div>
                <div className="mt-1">Status: {item.status}</div>
                {item.amountUSDT ? <div>Amount: {item.amountUSDT} USDT</div> : null}
                {item.credits ? <div>Credits: {item.credits}</div> : null}
                {item.reason ? <div>Reason: {item.reason}</div> : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}