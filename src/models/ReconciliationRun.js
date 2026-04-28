const mongoose = require('mongoose');

const ReconciliationRunSchema = new mongoose.Schema({
  runId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  config: {
    timestampToleranceSeconds: Number,
    quantityTolerancePct: Number
  },
  summary: {
    matchedCount: { type: Number, default: 0 },
    conflictingCount: { type: Number, default: 0 },
    unmatchedUserCount: { type: Number, default: 0 },
    unmatchedExchangeCount: { type: Number, default: 0 }
  },
  startedAt: { type: Date, default: Date.now },
  completedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('ReconciliationRun', ReconciliationRunSchema);
