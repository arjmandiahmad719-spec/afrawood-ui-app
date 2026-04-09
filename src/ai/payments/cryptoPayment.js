// src/ai/payments/cryptoPayment.js

import { getAfrawoodWalletConfig } from "./afrawoodWallet";

/**
 * Afrawood Crypto Payment Logic (stable)
 */

export function calculateUSDT(credits = 0) {
  const safeCredits = Number(credits) || 0;
  if (safeCredits <= 0) return 0;
  return Math.ceil(safeCredits / 10);
}

export function validateWalletAddress(address = "") {
  return typeof address === "string" && address.trim().length >= 10;
}

export function validateTxHash(txHash = "") {
  return typeof txHash === "string" && txHash.trim().length >= 30;
}

export function createCryptoInvoice({ credits }) {
  const wallet = getAfrawoodWalletConfig();
  const safeCredits = Number(credits) || 0;
  const amountUSDT = calculateUSDT(safeCredits);

  return {
    id: `inv_${Date.now()}`,
    credits: safeCredits,
    amountUSDT,
    coin: wallet.coin,
    network: wallet.network,
    receiveAddress: wallet.address,
    status: "pending",
    createdAt: Date.now(),
  };
}