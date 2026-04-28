const Transaction = require('../models/Transaction');
const ReconciliationResult = require('../models/ReconciliationResult');
const { areTypesCompatible } = require('../utils/typeMapping');


async function runMatchingEngine(runId, config) {
  const { timestampToleranceSeconds, quantityTolerancePct } = config;

  // 1. Get all valid transactions
  const userTxns = await Transaction.find({ source: 'user', isValid: true });
  const exchangeTxns = await Transaction.find({ source: 'exchange', isValid: true });

  const matchedExchangeIds = new Set();
  const results = [];

  // 2. Iterate through user transactions and find matches
  for (const userTx of userTxns) {
    let bestMatch = null;
    let potentialConflict = null;

    // Optimized: Find exchange transactions with same asset and compatible types
    const candidates = exchangeTxns.filter(exTx => 
      exTx.normalizedAsset === userTx.normalizedAsset && 
      areTypesCompatible(userTx.normalizedType, exTx.normalizedType) &&
      !matchedExchangeIds.has(exTx._id.toString())
    );

    for (const exTx of candidates) {
      const timeDiff = Math.abs(userTx.timestamp - exTx.timestamp) / 1000;
      const quantDiffPct = Math.abs(userTx.quantity - exTx.quantity) / userTx.quantity * 100;

      const isTimeInTolerance = timeDiff <= timestampToleranceSeconds;
      const isQuantInTolerance = quantDiffPct <= quantityTolerancePct;

      if (isTimeInTolerance && isQuantInTolerance) {
        bestMatch = exTx;
        break; 
      } else if (isTimeInTolerance || (timeDiff < timestampToleranceSeconds * 2 && quantDiffPct < quantityTolerancePct * 10)) {
       
        potentialConflict = exTx;
      }
    }

    if (bestMatch) {
      matchedExchangeIds.add(bestMatch._id.toString());
      results.push({
        runId,
        category: 'Matched',
        reason: 'Matched within tolerances',
        userTransactionId: userTx._id,
        exchangeTransactionId: bestMatch._id,
        details: { user: userTx, exchange: bestMatch }
      });
    } else if (potentialConflict) {
      matchedExchangeIds.add(potentialConflict._id.toString());
      results.push({
        runId,
        category: 'Conflicting',
        reason: 'Proximity match found but exceeded tolerances',
        userTransactionId: userTx._id,
        exchangeTransactionId: potentialConflict._id,
        details: { user: userTx, exchange: potentialConflict }
      });
    } else {
      results.push({
        runId,
        category: 'Unmatched (User only)',
        reason: 'No corresponding exchange transaction found',
        userTransactionId: userTx._id,
        details: { user: userTx }
      });
    }
  }

  // 3. Identify unmatched exchange transactions
  for (const ex of exchangeTxns) {
    if (!matchedExchangeIds.has(ex._id.toString())) {
      results.push({
        runId,
        category: 'Unmatched (Exchange only)',
        reason: 'No corresponding user transaction found',
        exchangeTransactionId: ex._id,
        details: { exchange: ex }
      });
    }
  }

  // 4. Save results to DB
  await ReconciliationResult.insertMany(results);

  // 5. Calculate summary
  const summary = {
    matchedCount: results.filter(r => r.category === 'Matched').length,
    conflictingCount: results.filter(r => r.category === 'Conflicting').length,
    unmatchedUserCount: results.filter(r => r.category === 'Unmatched (User only)').length,
    unmatchedExchangeCount: results.filter(r => r.category === 'Unmatched (Exchange only)').length
  };

  return summary;
}

module.exports = { runMatchingEngine };
