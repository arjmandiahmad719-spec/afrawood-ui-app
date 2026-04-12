const TRON_API_BASE = "https://api.trongrid.io/v1/transactions";
const ETHERSCAN_API_BASE = "https://api.etherscan.io/api";

const USDT_TRC20_DECIMALS = 6;
const USDT_ERC20_DECIMALS = 6;
const USDT_ERC20_CONTRACT = "0xdac17f958d2ee523a2206206994597c13d831ec7";

function normalizeText(value = "") {
  return String(value || "").trim();
}

function normalizeLower(value = "") {
  return normalizeText(value).toLowerCase();
}

function parseAmount(value, decimals = 6) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Number((num / Math.pow(10, decimals)).toFixed(6));
}

function parseHexAmount(hexValue = "0x0", decimals = 6) {
  try {
    const raw = BigInt(hexValue);
    const divisor = 10n ** BigInt(decimals);
    const integerPart = raw / divisor;
    const fractionPart = raw % divisor;
    const fractionText = fractionPart.toString().padStart(decimals, "0").replace(/0+$/, "");
    return Number(
      fractionText ? `${integerPart.toString()}.${fractionText}` : integerPart.toString()
    );
  } catch {
    return 0;
  }
}

function isHex64(value = "") {
  return /^[a-fA-F0-9]{64}$/.test(normalizeText(value));
}

function ensure0xPrefix(value = "") {
  const clean = normalizeText(value);
  if (!clean) return "";
  return clean.startsWith("0x") ? clean : `0x${clean}`;
}

export function detectNetworkFromTxHash(txHash = "") {
  const clean = normalizeText(txHash);

  if (clean.startsWith("0x") && clean.length === 66) {
    return "ERC20";
  }

  if (isHex64(clean)) {
    return "TRC20";
  }

  return null;
}

export async function verifyTRC20Transaction({
  txHash,
  expectedAmount,
  receiverAddress,
}) {
  const cleanHash = normalizeText(txHash);
  const cleanReceiver = normalizeText(receiverAddress);

  const res = await fetch(`${TRON_API_BASE}/${cleanHash}/events`);
  if (!res.ok) {
    throw new Error("TRC20 verification request failed");
  }

  const data = await res.json();
  const events = Array.isArray(data?.data) ? data.data : [];

  const matching = events.find((event) => {
    const eventName = normalizeLower(event?.event_name);
    const contractAddress = normalizeLower(event?.contract_address);
    const toAddress =
      normalizeText(event?.result?.to) ||
      normalizeText(event?.result?.to_address) ||
      normalizeText(event?.result?.recipient);

    return (
      eventName === "transfer" &&
      contractAddress &&
      toAddress &&
      normalizeLower(toAddress) === normalizeLower(cleanReceiver)
    );
  });

  if (!matching) {
    return {
      ok: false,
      network: "TRC20",
      reason: "No matching TRC20 transfer found",
    };
  }

  const rawValue =
    matching?.result?.value ??
    matching?.result?._value ??
    matching?.result?.amount ??
    0;

  const amount = parseAmount(rawValue, USDT_TRC20_DECIMALS);

  if (amount < Number(expectedAmount || 0)) {
    return {
      ok: false,
      network: "TRC20",
      reason: "Transferred amount is lower than expected",
      amount,
    };
  }

  return {
    ok: true,
    network: "TRC20",
    amount,
    to: cleanReceiver,
    txHash: cleanHash,
  };
}

export async function verifyERC20Transaction({
  txHash,
  expectedAmount,
  receiverAddress,
  etherscanApiKey = "",
}) {
  const cleanHash = ensure0xPrefix(txHash);
  const cleanReceiver = normalizeLower(receiverAddress);

  const url = new URL(ETHERSCAN_API_BASE);
  url.searchParams.set("module", "account");
  url.searchParams.set("action", "tokentx");
  url.searchParams.set("contractaddress", USDT_ERC20_CONTRACT);
  url.searchParams.set("page", "1");
  url.searchParams.set("offset", "100");
  url.searchParams.set("sort", "desc");
  if (etherscanApiKey) {
    url.searchParams.set("apikey", etherscanApiKey);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error("ERC20 verification request failed");
  }

  const data = await res.json();
  const rows = Array.isArray(data?.result) ? data.result : [];

  const matching = rows.find((row) => {
    const rowHash = normalizeLower(row?.hash);
    const toAddress = normalizeLower(row?.to);
    return rowHash === normalizeLower(cleanHash) && toAddress === cleanReceiver;
  });

  if (!matching) {
    return {
      ok: false,
      network: "ERC20",
      reason: "No matching ERC20 transfer found",
    };
  }

  const amount = parseAmount(matching?.value, USDT_ERC20_DECIMALS);

  if (amount < Number(expectedAmount || 0)) {
    return {
      ok: false,
      network: "ERC20",
      reason: "Transferred amount is lower than expected",
      amount,
    };
  }

  return {
    ok: true,
    network: "ERC20",
    amount,
    to: matching?.to || receiverAddress,
    txHash: cleanHash,
  };
}

export async function verifyBlockchainPayment({
  txHash,
  expectedAmount,
  receiverAddress,
  network,
  etherscanApiKey = "",
}) {
  const resolvedNetwork = network || detectNetworkFromTxHash(txHash);

  if (!resolvedNetwork) {
    return {
      ok: false,
      reason: "Could not detect payment network",
    };
  }

  if (resolvedNetwork === "TRC20") {
    return await verifyTRC20Transaction({
      txHash,
      expectedAmount,
      receiverAddress,
    });
  }

  if (resolvedNetwork === "ERC20") {
    return await verifyERC20Transaction({
      txHash,
      expectedAmount,
      receiverAddress,
      etherscanApiKey,
    });
  }

  return {
    ok: false,
    reason: "Unsupported network",
  };
}