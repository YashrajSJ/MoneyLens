import mongoose, { Schema } from "mongoose";

import {
  INSIGHT_SEVERITIES,
  INSIGHT_TYPES,
} from "./insight.constants.js";

const insightSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: INSIGHT_TYPES,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    severity: {
      type: String,
      enum: INSIGHT_SEVERITIES,
      default: "LOW",
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
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

insightSchema.index({ userId: 1, createdAt: -1 });
insightSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
insightSchema.index({ userId: 1, type: 1, createdAt: -1 });
insightSchema.index({ userId: 1, year: 1, month: 1, createdAt: -1 });

export const Insight = mongoose.model("Insight", insightSchema);