/**
 * Transaction type mapping utilities.
 * Handles normalization and opposite-perspective matching
 * (e.g., TRANSFER_IN on exchange = TRANSFER_OUT on user side).
 */

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

/**
 * Normalize a transaction type string.
 * @param {string} type - Raw type from CSV
 * @returns {string} Normalized type
 */
function normalizeType(type) {
  if (!type || typeof type !== "string") return "";
  const cleaned = type.trim().toLowerCase().replace(/[\s_-]+/g, "_");
  return TYPE_NORMALIZE_MAP[cleaned] || type.trim().toUpperCase();
}

/**
 * Check if two transaction types are compatible.
 * Types match if they are equal OR if one is the opposite perspective of the other.
 * @param {string} userType - Normalized user transaction type
 * @param {string} exchangeType - Normalized exchange transaction type
 * @returns {boolean}
 */
function areTypesCompatible(userType, exchangeType) {
  if (userType === exchangeType) return true;
  return OPPOSITE_TYPE_MAP[exchangeType] === userType;
}

module.exports = { normalizeType, areTypesCompatible, OPPOSITE_TYPE_MAP };
