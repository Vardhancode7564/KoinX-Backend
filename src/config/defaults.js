/**
 * Default configuration values for the reconciliation engine.
 * These can be overridden via environment variables or API request body.
 */

const defaults = {
  // Timestamp tolerance in seconds (default: 5 minutes)
  TIMESTAMP_TOLERANCE_SECONDS: parseInt(process.env.TIMESTAMP_TOLERANCE_SECONDS, 10) || 300,

  // Quantity tolerance as a percentage (default: 0.01%)
  QUANTITY_TOLERANCE_PCT: parseFloat(process.env.QUANTITY_TOLERANCE_PCT) || 0.01,
};

module.exports = defaults;
