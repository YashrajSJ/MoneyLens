import mongoose, { model, Schema } from "mongoose";
import { type } from "node:os";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  password: {
    type: String,
    trim: true,
    required: true,
  },
  role: {
    type: String,
    enum: ["ADMIN", "USER", "MANAGER"],
    default: "USER",
  },
});

userSchema.pre("save", async () => {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAccessToken = async () => {
  jwt.sign({
    
  });
};

export default User = new model("User", userSchema);
