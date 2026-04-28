const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  source: {
    type: String,
    enum: ['user', 'exchange'],
    required: true
  },
  externalId: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  normalizedType: {
    type: String,
    required: true
  },
  asset: {
    type: String,
    required: true
  },
  normalizedAsset: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  priceUsd: Number,
  fee: Number,
  note: String,
  qualityIssues: [String],
  isValid: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Index for faster matching
TransactionSchema.index({ normalizedAsset: 1, normalizedType: 1, timestamp: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
