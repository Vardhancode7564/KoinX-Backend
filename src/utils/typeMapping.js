

// Canonical type normalization
const TYPE_NORMALIZE_MAP = {
  buy: "BUY",
  sell: "SELL",
  deposit: "DEPOSIT",
  withdrawal: "WITHDRAWAL",
  withdraw: "WITHDRAWAL",
  transfer_in: "TRANSFER_IN",
  transfer_out: "TRANSFER_OUT",
  transferin: "TRANSFER_IN",
  transferout: "TRANSFER_OUT",
  "transfer in": "TRANSFER_IN",
  "transfer out": "TRANSFER_OUT",
};

// Opposite perspective mapping (same transaction viewed from different sides)
const OPPOSITE_TYPE_MAP = {
  TRANSFER_IN: "TRANSFER_OUT",
  TRANSFER_OUT: "TRANSFER_IN",
  DEPOSIT: "WITHDRAWAL",
  WITHDRAWAL: "DEPOSIT",
};


function normalizeType(type) {
  if (!type || typeof type !== "string") return "";
  const cleaned = type.trim().toLowerCase().replace(/[\s_-]+/g, "_");
  return TYPE_NORMALIZE_MAP[cleaned] || type.trim().toUpperCase();
}


function areTypesCompatible(userType, exchangeType) {
  if (userType === exchangeType) return true;
  return OPPOSITE_TYPE_MAP[exchangeType] === userType;
}

module.exports = { normalizeType, areTypesCompatible, OPPOSITE_TYPE_MAP };
