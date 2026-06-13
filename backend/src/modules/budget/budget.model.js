import mongoose, { Schema } from "mongoose";

import {
  MAX_BUDGET_ALERT_THRESHOLD,
  MAX_BUDGET_AMOUNT,
  MIN_BUDGET_ALERT_THRESHOLD,
} from "./budget.constants.js";

const budgetSchema = new Schema(
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

    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    year: {
      type: Number,
      required: true,
      min: 2000,
      max: 2100,
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
      max: MAX_BUDGET_AMOUNT,
    },

    alertThreshold: {
      type: Number,
      default: 80,
      min: MIN_BUDGET_ALERT_THRESHOLD,
      max: MAX_BUDGET_ALERT_THRESHOLD,
    },

    lastAlertSentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

budgetSchema.index(
  {
    userId: 1,
    accountId: 1,
    month: 1,
    year: 1,
  },
  {
    unique: true,
  }
);

budgetSchema.index({ userId: 1, year: -1, month: -1 });

export const Budget = mongoose.model("Budget", budgetSchema);