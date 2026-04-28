const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ["user", "exchange"],
      required: true,
    },
    externalId: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
    },
    type: {
      type: String,
      required: true,
    },
    normalizedType: {
      type: String,
    },
    asset: {
      type: String,
      required: true,
    },
    normalizedAsset: {
      type: String,
    },
    quantity: {
      type: Number,
    },
    priceUsd: Number,
    fee: Number,
    note: String,
    qualityIssues: [String],
    isValid: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

TransactionSchema.index({
  normalizedAsset: 1,
  normalizedType: 1,
  timestamp: 1,
});

module.exports = mongoose.model("Transaction", TransactionSchema);
