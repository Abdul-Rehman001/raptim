import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String },
  jobUrl: { type: String },
  jobDescription: { type: String }, // Raw text for AI
  status: {
    type: String,
    enum: ["saved", "applied", "interview", "offer", "rejected"],
    default: "saved",
  },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  platform: { type: String, default: "" }, // e.g. LinkedIn, Indeed, Glassdoor, etc.
  salaryMin: { type: Number },
  salaryMax: { type: Number },
  coverLetter: { type: String, default: "" },
  aiInterviewQs: [{ type: String }],
  resumeVersionUrl: { type: String }, // Which resume was used
  appliedDate: { type: Date },
  followUpDate: { type: Date },
  contacts: [{
    name: String,
    email: String,
    role: String,
    notes: String
  }],
  notes: { type: String },
  order: { type: Number, default: 0 }, // For Kanban ordering
  // In your Job.ts model, add to the schema:
matchScore:      { type: Number, default: null },
whatsStrong:     { type: String, default: "" },
biggestGap:      { type: String, default: "" },
actionToday:     { type: String, default: "" },
successStrategy: { type: String, default: "" },
missingKeywords: { type: [String], default: [] },
interviewRisk:   { type: String, enum: ["low", "medium", "high"], default: "medium" },
aiCoachTips:     { type: [String], default: [] },
aiAnalyzedAt:    { type: Date, default: null },
aiResumeFingerprint: { type: String, default: null }, // Tracks which resume version was used for analysis
redFlagAnalysis: { type: Object, default: null },
coldEmail:       { type: String, default: "" },
  // Resume Tailoring & Versioning
  tailoredResume: { type: mongoose.Schema.Types.Mixed, default: null },
  resumeHistory: [{
    version: { type: String, required: true }, // e.g. "Original" or "Tailored_v1"
    createdAt: { type: Date, default: Date.now },
    resumeJson: { type: mongoose.Schema.Types.Mixed },
    analysis: {
      matchScore: Number,
      whatsStrong: String,
      biggestGap: String,
      improvementTips: [String]
    }
  }],
}, { timestamps: true });

// Prevent overwrite on hot reload but allow schema updates
if (mongoose.models.Job) {
  delete mongoose.models.Job;
}
export const Job = mongoose.model("Job", JobSchema);
