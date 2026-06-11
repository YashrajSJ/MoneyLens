import mongoose, { Schema } from "mongoose";

import {
  ALL_CATEGORIES,
  MAX_TRANSACTION_AMOUNT,
  PAYMENT_METHODS,
  RECURRING_INTERVALS,
  TRANSACTION_STATUSES,
  TRANSACTION_TYPES,
} from "./transaction.constants.js";

const transactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    accountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: TRANSACTION_TYPES,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
      max: MAX_TRANSACTION_AMOUNT,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    category: {
      type: String,
      enum: ALL_CATEGORIES,
      required: true,
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      default: "OTHER",
    },

    merchantName: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    receiptUrl: String,

    isRecurring: {
      type: Boolean,
      default: false,
    },

    recurringInterval: {
      type: String,
      enum: RECURRING_INTERVALS,
    },

    nextRecurringDate: Date,

    status: {
      type: String,
      enum: TRANSACTION_STATUSES,
      default: "COMPLETED",
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, accountId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1, category: 1 });
transactionSchema.index({ isRecurring: 1, nextRecurringDate: 1 });

export const Transaction = mongoose.model("Transaction", transactionSchema);