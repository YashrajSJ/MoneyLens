import mongoose, { Schema } from "mongoose";

import {
  EMAIL_STATUS,
  EMAIL_STATUS_VALUES,
  EMAIL_TYPE_VALUES,
} from "./notification.constants.js";

const emailLogSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    to: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    type: {
      type: String,
      enum: EMAIL_TYPE_VALUES,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: EMAIL_STATUS_VALUES,
      default: EMAIL_STATUS.QUEUED,
      index: true,
    },

    jobId: {
      type: String,
      trim: true,
      index: true,
    },

    providerMessageId: {
      type: String,
      trim: true,
    },

    errorMessage: {
      type: String,
      trim: true,
    },

    sentAt: {
      type: Date,
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  },
);

emailLogSchema.index({ userId: 1, createdAt: -1 });
emailLogSchema.index({ userId: 1, status: 1 });

export const EmailLog = mongoose.model("EmailLog", emailLogSchema);
