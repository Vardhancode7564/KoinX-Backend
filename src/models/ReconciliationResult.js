const mongoose = require('mongoose');

const ReconciliationResultSchema = new mongoose.Schema({
  runId: {
    type: String,
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: ['Matched', 'Conflicting', 'Unmatched (User only)', 'Unmatched (Exchange only)'],
    required: true
  },
  reason: String,
  userTransactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  exchangeTransactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  // We'll store copies of key fields for quick reporting without complex joins
  details: {
    user: Object,
    exchange: Object
  }
}, { timestamps: true });

module.exports = mongoose.model('ReconciliationResult', ReconciliationResultSchema);
