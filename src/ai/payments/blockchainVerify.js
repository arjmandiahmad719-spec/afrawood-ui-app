// src/ai/payments/blockchainVerify.js

/**
 * REAL Blockchain TX Verify (TRC20 + ERC20)
 * Uses public APIs (no API key needed)
 */

const TRON_API = "https://api.trongrid.io/v1/transactions/";
const ETH_API = "https://api.etherscan.io/api";

/**
 * Detect network by TX format
 */
export function detectNetwork(txHash = "") {
  if (!txHash) return null;

  // TRON usually starts with hex but shorter patterns
  if (txHash.length === 64) return "ERC20";

  if (txHash.length >= 60 && txHash.length <= 70) return "TRC20";

  return null;
}

/**
 * Verify TRC20 (USDT TRON)
 */
export async function verifyTRC20(txHash, expectedAmount, walletAddress) {
  try {
    const res = await fetch(`${TRON_API}${txHash}`);
    const data = await res.json();

    const tx = data?.data?.[0];
    if (!tx) return { ok: false };

    const contract = tx.raw_data.contract?.[0]?.parameter?.value;

    if (!contract) return { ok: false };

    const to = contract.to_address;
    const amount = contract.amount / 1_000_000;

    const success = tx.ret?.[0]?.contractRet === "SUCCESS";

    if (!success) return { ok: false, reason: "tx failed" };

    if (amount < expectedAmount) {
      return { ok: false, reason: "amount too low" };
    }

    return {
      ok: true,
      network: "TRC20",
      amount,
      to,
    };
  } catch (e) {
    console.error("TRC20 verify error:", e);
    return { ok: false };
  }
}

/**
 * Verify ERC20 (USDT ETH)
 */
export async function verifyERC20(txHash, expectedAmount, walletAddress) {
  try {
    const url = `${ETH_API}?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}`;

    const res = await fetch(url);
    const data = await res.json();

    const tx = data?.result;
    if (!tx) return { ok: false };

    const value = parseInt(tx.value, 16) / 1e18;
    const to = tx.to;

    if (!to) return { ok: false };

    if (value < expectedAmount) {
      return { ok: false, reason: "amount too low" };
    }

    return {
      ok: true,
      network: "ERC20",
      amount: value,
      to,
    };
  } catch (e) {
    console.error("ERC20 verify error:", e);
    return { ok: false };
  }
}

/**
 * Main verify
 */
export async function verifyTransaction({
  txHash,
  expectedAmount,
  walletAddress,
}) {
  const network = detectNetwork(txHash);

  if (!network) {
    return { ok: false, reason: "unknown network" };
  }

  if (network === "TRC20") {
    return await verifyTRC20(txHash, expectedAmount, walletAddress);
  }

  if (network === "ERC20") {
    return await verifyERC20(txHash, expectedAmount, walletAddress);
  }

  return { ok: false };
}