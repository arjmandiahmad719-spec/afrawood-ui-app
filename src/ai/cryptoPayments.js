export const CRYPTO_NETWORKS = [
  {
    id: "tron_usdt",
    label: "USDT (TRC20)",
    symbol: "USDT",
    network: "TRON",
    address: "TVjsmFakeAfrawoodWallet123456789XYZ",
  },
  {
    id: "trx",
    label: "TRX",
    symbol: "TRX",
    network: "TRON",
    address: "TQnqFakeAfrawoodWallet987654321XYZ",
  },
];

function getPlanPrice(plan, billing = "monthly") {
  if (!plan) return 0;
  return billing === "yearly" ? Number(plan.yearlyPrice || 0) : Number(plan.monthlyPrice || 0);
}

export function createCryptoInvoice({
  plan,
  billing = "monthly",
  user,
  networkId = "tron_usdt",
} = {}) {
  const network =
    CRYPTO_NETWORKS.find((item) => item.id === networkId) || CRYPTO_NETWORKS[0];

  const amount = getPlanPrice(plan, billing);

  return {
    app: "Afrawood",
    feature: "crypto_payment",
    status: "awaiting_payment",
    invoiceId: `inv_${Math.random().toString(36).slice(2, 10)}`,
    createdAt: new Date().toISOString(),
    user: user
      ? {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
        }
      : null,
    plan: {
      id: plan?.id || "free",
      name: plan?.name || "Free",
      billing,
      amountUsd: amount,
    },
    payment: {
      method: "crypto",
      networkId: network.id,
      network: network.network,
      symbol: network.symbol,
      receiverAddress: network.address,
      amount,
      note: "User sends crypto, then admin verifies tx hash manually.",
    },
  };
}

export function createCreditPurchaseInvoice({
  credits = 20,
  user,
  networkId = "tron_usdt",
} = {}) {
  const normalizedCredits = Math.min(170, Math.max(20, Number(credits) || 20));
  const finalCredits = Math.round(normalizedCredits / 10) * 10;

  const network =
    CRYPTO_NETWORKS.find((item) => item.id === networkId) || CRYPTO_NETWORKS[0];

  const amount = Number((finalCredits / 10).toFixed(2));

  return {
    app: "Afrawood",
    feature: "credit_purchase",
    status: "awaiting_payment",
    invoiceId: `credit_${Math.random().toString(36).slice(2, 10)}`,
    createdAt: new Date().toISOString(),
    user: user
      ? {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
        }
      : null,
    purchase: {
      credits: finalCredits,
      formula: "10 credits = 1 USDT",
      watermark: true,
      minCredits: 20,
      maxCredits: 170,
    },
    payment: {
      method: "crypto",
      networkId: network.id,
      network: network.network,
      symbol: network.symbol,
      receiverAddress: network.address,
      amount,
      note: "Purchased credits keep Afrawood watermark.",
    },
  };
}

export function downloadInvoiceJson(invoice, filename = "afrawood_crypto_invoice.json") {
  const blob = new Blob([JSON.stringify(invoice, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}