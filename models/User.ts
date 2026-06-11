import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String }, // Optional for OAuth users
  provider: { type: String, enum: ["google", "credentials"], default: "credentials" },
  image: { type: String }, // For Google auth avatars
  phone: { type: String },
  jobTitle: { type: String },
  resumeUrl: { type: String },
  resumeText: { type: String }, // Extracted text for AI
  resumeJson: { type: Object, default: null }, // Structured JSON for PDF generation
  plan: { type: String, enum: ["free", "pro"], default: "free" },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  completedOnboarding: { type: Boolean, default: true }, // true = existing users unaffected
  atsScore: { type: Number, default: null },
  atsLastChecked: { type: Date, default: null },
  atsDetails: { type: Object, default: null },
}, { timestamps: true });

// Prevent overwrite on hot reload
export const User = mongoose.models.User || mongoose.model("User", UserSchema);
