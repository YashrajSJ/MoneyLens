import mongoose, { Schema } from "mongoose";

import { RECEIPT_STATUS_VALUES } from "./receipt.constants.js";

const receiptSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    transactionId: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
    },

    imageUrl: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      required: true,
    },

    originalName: {
      type: String,
      trim: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    size: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: RECEIPT_STATUS_VALUES,
      default: "PROCESSING",
      index: true,
    },

    extractedData: {
      merchantName: String,
      amount: Number,
      date: Date,
      category: String,
      type: {
        type: String,
        enum: ["INCOME", "EXPENSE"],
      },
      paymentMethod: String,
      description: String,
      confidence: Number,
    },

    rawAiResponse: {
      type: Schema.Types.Mixed,
    },

    errorMessage: {
      type: String,
    },

  },
  {
    timestamps: true,
  },
);

receiptSchema.index({ userId: 1, createdAt: -1 });
receiptSchema.index({ userId: 1, status: 1, createdAt: -1 });
receiptSchema.index({ userId: 1, transactionId: 1 });

export const Receipt = mongoose.model("Receipt", receiptSchema);
