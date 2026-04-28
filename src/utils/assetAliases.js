const ASSET_ALIAS_MAP = {
  
  bitcoin: "BTC",
  btc: "BTC",
  xbt: "BTC",

  ethereum: "ETH",
  eth: "ETH",
  ether: "ETH",

  
  tether: "USDT",
  usdt: "USDT",

  
  "usd coin": "USDC",
  usdc: "USDC",

  
  "binance coin": "BNB",
  bnb: "BNB",

  
  ripple: "XRP",
  xrp: "XRP",

  
  solana: "SOL",
  sol: "SOL",

  
  cardano: "ADA",
  ada: "ADA",

  
  dogecoin: "DOGE",
  doge: "DOGE",

  polkadot: "DOT",
  dot: "DOT",

  litecoin: "LTC",
  ltc: "LTC",

  
  polygon: "MATIC",
  matic: "MATIC",

  
  avalanche: "AVAX",
  avax: "AVAX",
};

function normalizeAsset(asset) {
  if (!asset || typeof asset !== "string") return "";
  const cleaned = asset.trim().toLowerCase();
  return ASSET_ALIAS_MAP[cleaned] || cleaned.toUpperCase();
}

module.exports = { normalizeAsset, ASSET_ALIAS_MAP };
