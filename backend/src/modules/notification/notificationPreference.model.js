import mongoose, { Schema } from "mongoose";

const notificationPreferenceSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    emailEnabled: {
      type: Boolean,
      default: true,
    },

    budgetAlerts: {
      type: Boolean,
      default: true,
    },

    monthlyReports: {
      type: Boolean,
      default: true,
    },

    aiInsights: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

notificationPreferenceSchema.index({ userId: 1 }, { unique: true });

export const NotificationPreference = mongoose.model(
  "NotificationPreference",
  notificationPreferenceSchema,
);
