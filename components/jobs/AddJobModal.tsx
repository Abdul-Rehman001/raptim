"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Plus, X, ChevronDown, ChevronUp, Sparkles, Loader2, Globe, Linkedin, } from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";

interface AddJobModalProps {
  children: React.ReactNode;
  userResumeText?: string;
}

export function AddJobModal({ children, userResumeText = "" }: AddJobModalProps) {
  const router = useRouter();
  const triggerRefresh = useAppStore((s) => s.triggerRefresh);
  const storeResumeText = useAppStore((s) => s.resumeText);
  const effectiveResumeText = storeResumeText || userResumeText;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showOptional, setShowOptional] = useState(false);
  const [formData, setFormData] = useState({
    title: "", company: "", jobDescription: "",
    jobUrl: "", location: "", salaryMin: "", salaryMax: "", salaryCurrency: "USD", platform: ""
  });

  const detectPlatform = (url: string) => {
    if (!url) return "";
    const lower = url.toLowerCase();
    if (lower.includes("linkedin.com")) return "LinkedIn";
    if (lower.includes("indeed.com")) return "Indeed";
    if (lower.includes("glassdoor.com")) return "Glassdoor";
    if (lower.includes("wellfound.com") || lower.includes("angel.co")) return "Wellfound";
    if (lower.includes("ycombinator.com")) return "Y Combinator";
    if (lower.includes("greenhouse.io")) return "Greenhouse";
    if (lower.includes("lever.co")) return "Lever";
    if (lower.includes("workday.com")) return "Workday";
    return "";
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    if (open) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let job: any;
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          salaryMin: formData.salaryMin ? Number(formData.salaryMin) : undefined,
          salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to create job");
      job = await res.json();
    } catch {
      toast.error("Failed to add job");
      setLoading(false);
      return;
    }

    const hasResume = effectiveResumeText.length > 50;
    const hasJD = formData.jobDescription.length > 50;

    setOpen(false);
    setFormData({ title: "", company: "", jobDescription: "", jobUrl: "", location: "", salaryMin: "", salaryMax: "", salaryCurrency: "USD", platform: "" });
    triggerRefresh();
    router.refresh();

    if (hasResume && hasJD) {
        // Fire auto-analysis in background
        toast("Job added! Running AI analysis...", { icon: "✨" });
        fetch(`/api/jobs/${job?._id}/analyze`, { method: "POST" })
          .then((r) => r.json())
          .then((data) => {
            if (data.job?.matchScore !== null && data.job?.matchScore !== undefined) {
              toast.success(`Analysis complete — ${data.job.matchScore}% match!`);
              router.refresh();
            } else {
              toast.error("Job added! Analysis failed — try manually.");
            }
          })
          .catch(() => toast.error("Job added! Analysis failed — try manually."))
          ;
      } else if (!hasResume) {
        toast(
          (t) => (
            <span className="flex items-center gap-2">
              Job added! Add your resume to enable AI analysis.
              <Link href="/settings" onClick={() => toast.dismiss(t.id)} className="font-bold underline text-primary">
                Go to Settings
              </Link>
            </span>
          ),
          { duration: 6000 }
        );
      } else {
        toast.success("Job added successfully!");
      }
      setLoading(false);
  };

  const inputClass = "w-full bg-bg-surface-elevated border border-border-default rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all";

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>

      {open && (
        <div className="fixed inset-0 z-100 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />

          <div className="relative z-10 w-full max-w-145 mx-4 bg-bg-surface border border-border-subtle rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-7 py-5 border-b border-border-subtle sticky top-0 bg-bg-surface z-10">
              <div>
                <h2 className="text-lg font-extrabold text-text-primary">Add New Job</h2>
                <p className="text-xs text-text-secondary mt-0.5">Track a new application in your pipeline</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-surface-hover transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-7 py-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-text-tertiary">Job Title *</label>
                  <input required className={inputClass} placeholder="e.g. Senior Frontend Engineer" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-text-tertiary">Company *</label>
                  <input required className={inputClass} placeholder="e.g. Google, Stripe" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                </div>
              </div>

              {/* Job Description — key for AI */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-tertiary items-center gap-1.5 flex">
                  Job Description
                  {effectiveResumeText.length > 50 && (
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> AI ready
                    </span>
                  )}
                </label>
                <textarea
                  className={`${inputClass} h-36 resize-none`}
                  placeholder="Paste the job description here — our AI will score your match and generate coaching insights..."
                  value={formData.jobDescription}
                  onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                />
                {!effectiveResumeText || effectiveResumeText.length < 50 ? (
                  <p className="text-[11px] text-amber-500 flex items-center gap-1">
                    ⚠ <Link href="/settings" className="underline hover:text-amber-400">Add your resume</Link> to enable AI match scoring
                  </p>
                ) : (
                  <p className="text-[11px] text-text-tertiary">AI analysis will run automatically after adding</p>
                )}
              </div>

              {/* Optional fields toggle */}
              <button
                type="button"
                onClick={() => setShowOptional(!showOptional)}
                className="flex items-center gap-1.5 text-xs font-bold text-text-tertiary hover:text-text-secondary transition-colors"
              >
                {showOptional ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {showOptional ? "Hide" : "Add"} location, salary & URL
              </button>

              {showOptional && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border border-border-subtle rounded-xl p-4 bg-bg-surface">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-text-tertiary">Job URL</label>
                    <input 
                      className={inputClass} 
                      placeholder="https://..." 
                      value={formData.jobUrl} 
                      onChange={(e) => {
                        const url = e.target.value;
                        const detected = detectPlatform(url);
                        setFormData({ ...formData, jobUrl: url, platform: detected || formData.platform });
                      }} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-text-tertiary">Platform</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                        {formData.platform.toLowerCase() === "linkedin" ? <Linkedin className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                      </div>
                      <input className={`${inputClass} pl-9`} placeholder="e.g. LinkedIn" value={formData.platform} onChange={(e) => setFormData({ ...formData, platform: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-text-tertiary">Location</label>
                    <input className={inputClass} placeholder="e.g. Remote, NYC" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-text-tertiary">Currency</label>
                    <select className={inputClass} value={formData.salaryCurrency} onChange={(e) => setFormData({ ...formData, salaryCurrency: e.target.value })}>
                      <option value="USD">USD ($)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-text-tertiary">Salary Min</label>
                    <input type="number" className={inputClass} placeholder="120000" value={formData.salaryMin} onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-text-tertiary">Salary Max</label>
                    <input type="number" className={inputClass} placeholder="150000" value={formData.salaryMax} onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })} />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-border-subtle flex justify-end gap-3">
                <button type="button" onClick={() => setOpen(false)} className="text-sm font-semibold text-text-secondary hover:text-text-primary px-4 py-2 transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</> : <><Plus className="w-4 h-4" strokeWidth={3} /> Add Job</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
