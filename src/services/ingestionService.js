const fs = require('fs');
const { parse } = require('csv-parse');
const Transaction = require('../models/Transaction');
const { normalizeType } = require('../utils/typeMapping');
const { ASSET_ALIAS_MAP } = require('../utils/assetAliases');

/**
 * Normalizes asset names using the alias map.
 */
function normalizeAsset(asset) {
  if (!asset || typeof asset !== 'string') return '';
  const cleaned = asset.trim().toLowerCase();
  return ASSET_ALIAS_MAP[cleaned] || cleaned.toUpperCase();
}

/**
 * Validates a transaction row and returns quality issues if any.
 */
function validateRow(row) {
  const issues = [];
  if (!row.transaction_id) issues.push('Missing transaction_id');
  if (!row.timestamp || isNaN(Date.parse(row.timestamp))) issues.push('Invalid or missing timestamp');
  if (!row.asset) issues.push('Missing asset');
  if (!row.type) issues.push('Missing type');
  if (row.quantity === undefined || row.quantity === '' || isNaN(parseFloat(row.quantity))) issues.push('Invalid or missing quantity');
  
  return issues;
}

/**
 * Ingests a CSV file into the database.
 */
async function ingestCSV(filePath, source) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on('data', (row) => {
        const issues = validateRow(row);
        const isValid = issues.length === 0;

        results.push({
          source,
          externalId: row.transaction_id || 'UNKNOWN',
          timestamp: isValid ? new Date(row.timestamp) : null,
          type: row.type || 'UNKNOWN',
          normalizedType: normalizeType(row.type),
          asset: row.asset || 'UNKNOWN',
          normalizedAsset: normalizeAsset(row.asset),
          quantity: isValid ? parseFloat(row.quantity) : 0,
          priceUsd: row.price_usd ? parseFloat(row.price_usd) : null,
          fee: row.fee ? parseFloat(row.fee) : null,
          note: row.note,
          qualityIssues: issues,
          isValid
        });
      })
      .on('end', async () => {
        try {
          // Clear previous data for this source to allow re-runs during development
          // In production, we might want to handle this differently (e.g., sessions)
          await Transaction.deleteMany({ source });
          await Transaction.insertMany(results);
          console.log(`Ingested ${results.length} rows from ${source} source.`);
          resolve(results.length);
        } catch (err) {
          reject(err);
        }
      })
      .on('error', (err) => reject(err));
  });
}

module.exports = { ingestCSV };
