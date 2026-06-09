import mongoose, { Schema } from "mongoose";
import { ACCOUNT_TYPES } from "./account.constants.js";

const accountSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ACCOUNT_TYPES,
      required: true,
    },

    balance: {
      type: Number,
      default: 0,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },

    institutionName: {
      type: String,
      trim: true,
    },

    color: {
      type: String,
      default: "#2563eb",
    },
  },
  {
    timestamps: true,
  }
);

accountSchema.index({ userId: 1, isDefault: 1 });
accountSchema.index({ userId: 1, createdAt: -1 });

export const Account = mongoose.model("Account", accountSchema);