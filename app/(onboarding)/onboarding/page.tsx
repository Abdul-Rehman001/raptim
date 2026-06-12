"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import {
  Upload, FileText, ChevronRight, ChevronLeft, Check,
  AlertTriangle, Sparkles, X, ArrowRight, Loader2
} from "lucide-react";
import Link from "next/link";

/* ────────────────────────────────────────────── */
/* Types                                          */
/* ────────────────────────────────────────────── */
type Step = 1 | 2 | 3;

interface AnalysisResult {
  matchScore: number;
  whatsStrong: string;
  biggestGap: string;
}

/* ────────────────────────────────────────────── */
/* Sub-components                                 */
/* ────────────────────────────────────────────── */
function ProgressBar({ step }: { step: Step }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        {([1, 2, 3] as Step[]).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step > s ? "bg-primary text-primary-foreground" :
              step === s ? "bg-primary text-primary-foreground ring-4 ring-primary/20" :
              "bg-bg-surface-elevated text-text-tertiary border border-border-default"
            }`}>
              {step > s ? <Check className="w-3.5 h-3.5" /> : s}
            </div>
            {s < 3 && (
              <div className={`h-0.5 w-24 sm:w-40 rounded-full transition-all ${step > s ? "bg-primary" : "bg-border-default"}`} />
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-text-tertiary font-medium">Step {step} of 3</p>
    </div>
  );
}

/* ────────────────────────────────────────────── */
/* Main Wizard                                    */
/* ────────────────────────────────────────────── */
export default function OnboardingPage() {
  const router = useRouter();
  const { update: updateSession } = useSession();

  const [step, setStep] = useState<Step>(1);
  const [uploading, setUploading] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [resumeSkipped, setResumeSkipped] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [jobForm, setJobForm] = useState({ title: "", company: "", jobDescription: "", location: "", jobUrl: "" });
  const [showOptional, setShowOptional] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const inputClass = "w-full bg-bg-surface-elevated border border-border-default rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all";

  /* ── Resume Upload ── */
  const handleFileUpload = useCallback(async (file: File) => {
    if (!file || !file.name.endsWith(".pdf")) {
      toast.error("Please upload a PDF file");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/resume/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResumeText(data.resumeText || "uploaded");
      toast.success("Resume uploaded!");
    } catch {
      toast.error("Upload failed — try pasting text instead");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  /* ── Mark onboarding complete ── */
  const markComplete = async () => {
    try {
      await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completedOnboarding: true }),
      });
      await updateSession({ completedOnboarding: true });
    } catch {
      // non-critical — middleware will still work on next login
    }
  };

  /* ── Step 2: Submit Job + Analyze ── */
  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzing(true);
    try {
      // 1. Create job
      const jobRes = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobForm),
      });
      if (!jobRes.ok) throw new Error("Failed to create job");
      const { job } = await jobRes.json();
      setCreatedJobId(job._id);

      // 2. Auto-analyze if both JD and resume exist
      const hasResume = resumeText.length > 50 || resumeText === "uploaded";
      const hasJD = jobForm.jobDescription.length > 50;

      if (hasResume && hasJD) {
        const analyzeRes = await fetch(`/api/jobs/${job._id}/analyze`, { method: "POST" });
        if (analyzeRes.ok) {
          const { job: analyzed } = await analyzeRes.json();
          setAnalysis({
            matchScore: analyzed.matchScore,
            whatsStrong: analyzed.whatsStrong,
            biggestGap: analyzed.biggestGap,
          });
        }
      }

      // 3. Advance & mark complete
      await markComplete();
      setStep(3);
    } catch {
      toast.error("Something went wrong — please try again");
    } finally {
      setAnalyzing(false);
    }
  };

  /* ── Step 1 ── */
  if (step === 1) {
    const canContinue = resumeText.length > 50 || resumeText === "uploaded" || resumeSkipped;
    return (
      <div>
        <ProgressBar step={1} />
        <h1 className="text-2xl font-extrabold text-text-primary mb-2">First, let&apos;s upload your resume</h1>
        <p className="text-sm text-text-secondary mb-8">This lets our AI score every job against your actual skills.</p>

        {/* Drag-drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer mb-4 ${
            isDragOver ? "border-primary bg-primary/5" : "border-border-default hover:border-primary/50 hover:bg-bg-surface"
          }`}
          onClick={() => document.getElementById("resume-file-input")?.click()}
        >
          <input
            id="resume-file-input"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm font-medium text-text-secondary">Uploading resume...</p>
            </div>
          ) : resumeText && resumeText !== "" ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center">
                <Check className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-sm font-bold text-text-primary">Resume uploaded!</p>
              <p className="text-xs text-text-tertiary">Click to replace</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-bold text-text-primary">Drop your PDF here</p>
              <p className="text-xs text-text-tertiary">or click to browse</p>
            </div>
          )}
        </div>

        {/* OR separator */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-border-subtle" />
          <span className="text-xs font-bold text-text-tertiary">OR PASTE TEXT</span>
          <div className="h-px flex-1 bg-border-subtle" />
        </div>

        {/* Paste textarea */}
        <textarea
          className={`${inputClass} h-32 resize-none mb-6`}
          placeholder="Paste your resume text here (minimum 100 characters)..."
          value={resumeText === "uploaded" ? "" : resumeText}
          onChange={(e) => setResumeText(e.target.value)}
        />

        <button
          disabled={!canContinue}
          onClick={() => setStep(2)}
          className="w-full py-3.5 bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed mb-4"
        >
          Continue <ChevronRight className="w-4 h-4" />
        </button>

        {/* Skip */}
        {!resumeSkipped ? (
          <div className="text-center">
            <button onClick={() => { setResumeSkipped(true); }} className="text-xs text-text-tertiary hover:text-text-secondary transition-colors">
              Skip for now — I&apos;ll add it later
            </button>
          </div>
        ) : (
          <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-600 dark:text-amber-400">
              AI analysis won&apos;t work without your resume. You can add it later in Settings.
            </p>
          </div>
        )}
      </div>
    );
  }

  /* ── Step 2 ── */
  if (step === 2) {
    const canSubmit = jobForm.title.trim() && jobForm.company.trim() && jobForm.jobDescription.trim().length > 10;
    return (
      <div>
        <ProgressBar step={2} />
        <button onClick={() => setStep(1)} className="flex items-center gap-1 text-xs text-text-tertiary hover:text-text-secondary transition-colors mb-6">
          <ChevronLeft className="w-3.5 h-3.5" /> Back
        </button>
        <h1 className="text-2xl font-extrabold text-text-primary mb-2">Now add a job you&apos;re applying to</h1>
        <p className="text-sm text-text-secondary mb-8">Paste the job description and we&apos;ll analyze your fit instantly.</p>

        <form onSubmit={handleJobSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-tertiary mb-1.5">Job Title *</label>
            <input required className={inputClass} placeholder="e.g. Senior Frontend Engineer" value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-tertiary mb-1.5">Company *</label>
            <input required className={inputClass} placeholder="e.g. Google, Stripe" value={jobForm.company} onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-tertiary mb-1.5">Job Description *</label>
            <textarea required className={`${inputClass} h-40 resize-none`} placeholder="Paste the full job description here..." value={jobForm.jobDescription} onChange={(e) => setJobForm({ ...jobForm, jobDescription: e.target.value })} />
          </div>

          {/* Optional fields toggle */}
          <button type="button" onClick={() => setShowOptional(!showOptional)} className="text-xs font-bold text-primary hover:text-primary-hover transition-colors flex items-center gap-1">
            {showOptional ? <X className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            {showOptional ? "Hide extra details" : "Add more details (location, URL)"}
          </button>

          {showOptional && (
            <div className="space-y-4 border border-border-subtle rounded-xl p-4 bg-bg-surface">
              <div>
                <label className="block text-xs font-bold text-text-tertiary mb-1.5">Location</label>
                <input className={inputClass} placeholder="e.g. Remote, NYC" value={jobForm.location} onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-tertiary mb-1.5">Job URL</label>
                <input className={inputClass} placeholder="https://..." value={jobForm.jobUrl} onChange={(e) => setJobForm({ ...jobForm, jobUrl: e.target.value })} />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit || analyzing}
            className="w-full py-3.5 bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
          >
            {analyzing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Add Job & Analyze</>
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={async () => { await markComplete(); router.push("/dashboard"); }}
            className="text-xs text-text-tertiary hover:text-text-secondary transition-colors"
          >
            Skip — I&apos;ll add jobs later
          </button>
        </div>
      </div>
    );
  }

  /* ── Step 3: Success ── */
  return (
    <div className="text-center">
      <ProgressBar step={3} />

      {/* Animated checkmark */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center animate-[scaleUp_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]">
          <Check className="w-10 h-10 text-emerald-500" strokeWidth={2.5} />
        </div>
      </div>

      {analysis ? (
        <>
          <h1 className="text-2xl font-extrabold text-text-primary mb-2">Your first analysis is ready!</h1>
          <p className="text-sm text-text-secondary mb-8">Here&apos;s how you match up for this role.</p>

          {/* Match score ring */}
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-border-default" />
                <circle
                  cx="50" cy="50" r="42" fill="none" strokeWidth="8"
                  className={analysis.matchScore >= 75 ? "text-emerald-500" : analysis.matchScore >= 55 ? "text-amber-500" : "text-red-400"}
                  stroke="currentColor"
                  strokeDasharray={`${(analysis.matchScore / 100) * 264} 264`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-text-primary">{analysis.matchScore}</span>
                <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Match</span>
              </div>
            </div>
          </div>

          {/* Analysis cards */}
          <div className="space-y-3 mb-8 text-left">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> What&apos;s Strong
              </p>
              <p className="text-sm text-text-secondary leading-relaxed">{analysis.whatsStrong}</p>
            </div>
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Biggest Gap
              </p>
              <p className="text-sm text-text-secondary leading-relaxed">{analysis.biggestGap}</p>
            </div>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-extrabold text-text-primary mb-2">You&apos;re all set! 🎉</h1>
          <p className="text-sm text-text-secondary mb-8">
            Add your resume in Settings to unlock AI job analysis and match scoring.
          </p>
        </>
      )}

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/dashboard"
          className="flex-1 py-3.5 bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
        >
          Go to Dashboard <ArrowRight className="w-4 h-4" />
        </Link>
        {createdJobId && (
          <Link
            href={`/jobs/${createdJobId}`}
            className="flex-1 py-3.5 bg-bg-surface-elevated hover:bg-bg-surface-hover text-text-primary font-bold rounded-xl border border-border-default transition-all flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" /> View Full Analysis
          </Link>
        )}
      </div>
    </div>
  );
}
