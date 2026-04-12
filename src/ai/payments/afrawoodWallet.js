const AFRAWOOD_WALLET_CONFIG = {
  coin: "USDT",
  network: "TRC20",
  address: "TXPLACEHOLDERAfrawoodWalletAddress123456789",
  label: "Afrawood Main Wallet",
};

export function getAfrawoodWalletConfig() {
  return { ...AFRAWOOD_WALLET_CONFIG };
}

export function getAfrawoodWalletAddress() {
  return AFRAWOOD_WALLET_CONFIG.address;
}

export function getAfrawoodWalletNetwork() {
  return AFRAWOOD_WALLET_CONFIG.network;
}

export function getAfrawoodWalletCoin() {
  return AFRAWOOD_WALLET_CONFIG.coin;
}

export function setAfrawoodWalletConfig(patch = {}) {
  if (!patch || typeof patch !== "object") {
    return getAfrawoodWalletConfig();
  }

  if (typeof patch.coin === "string" && patch.coin.trim()) {
    AFRAWOOD_WALLET_CONFIG.coin = patch.coin.trim();
  }

  if (typeof patch.network === "string" && patch.network.trim()) {
    AFRAWOOD_WALLET_CONFIG.network = patch.network.trim();
  }

  if (typeof patch.address === "string" && patch.address.trim()) {
    AFRAWOOD_WALLET_CONFIG.address = patch.address.trim();
  }

  if (typeof patch.label === "string" && patch.label.trim()) {
    AFRAWOOD_WALLET_CONFIG.label = patch.label.trim();
  }

  return getAfrawoodWalletConfig();
}

export default AFRAWOOD_WALLET_CONFIG;