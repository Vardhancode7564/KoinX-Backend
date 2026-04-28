/**
 * Asset alias mapping for normalizing cryptocurrency names.
 * Maps common aliases/full names to their canonical ticker symbol.
 */

const ASSET_ALIAS_MAP = {
  // Bitcoin
  bitcoin: "BTC",
  btc: "BTC",
  xbt: "BTC",

  // Ethereum
  ethereum: "ETH",
  eth: "ETH",
  ether: "ETH",

  // Tether
  tether: "USDT",
  usdt: "USDT",

  // USD Coin
  "usd coin": "USDC",
  usdc: "USDC",

  // Binance Coin
  "binance coin": "BNB",
  bnb: "BNB",

  // Ripple
  ripple: "XRP",
  xrp: "XRP",

  // Solana
  solana: "SOL",
  sol: "SOL",

  // Cardano
  cardano: "ADA",
  ada: "ADA",

  // Dogecoin
  dogecoin: "DOGE",
  doge: "DOGE",

  // Polkadot
  polkadot: "DOT",
  dot: "DOT",

  // Litecoin
  litecoin: "LTC",
  ltc: "LTC",

  // Polygon / MATIC
  polygon: "MATIC",
  matic: "MATIC",

  // Avalanche
  avalanche: "AVAX",
  avax: "AVAX",
};

/**
 * Normalize an asset name to its canonical ticker.
 * @param {string} asset - Raw asset name from CSV
 * @returns {string} Canonical ticker symbol (uppercase)
 */
function normalizeAsset(asset) {
  if (!asset || typeof asset !== "string") return "";
  const cleaned = asset.trim().toLowerCase();
  return ASSET_ALIAS_MAP[cleaned] || cleaned.toUpperCase();
}

module.exports = { normalizeAsset, ASSET_ALIAS_MAP };
