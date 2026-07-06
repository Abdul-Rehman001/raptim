"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Save, X, ChevronDown, ChevronUp, Loader2, Globe, Linkedin } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Dropdown } from "@/components/ui/Dropdown";

const PREDEFINED_PLATFORMS = ["LinkedIn", "Indeed", "Glassdoor", "Wellfound", "Y Combinator", "Greenhouse", "Lever", "Workday", "Company Website", "Referral"];

function matchPlatform(p: string) {
  if (!p) return "";
  const found = PREDEFINED_PLATFORMS.find(opt => opt.toLowerCase() === p.toLowerCase());
  return found || "Other";
}

interface EditJobModalProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  job: any;
  open: boolean;
  onClose: () => void;
}

export function EditJobModal({ job, open, onClose }: EditJobModalProps) {
  const router = useRouter();
  const triggerRefresh = useAppStore((s) => s.triggerRefresh);
  const [loading, setLoading] = useState(false);
  const [showOptional, setShowOptional] = useState(!!(job.location || job.jobUrl || job.salaryMin || job.salaryMax || job.platform));
  
  const [isCustomPlatform, setIsCustomPlatform] = useState(() => matchPlatform(job.platform) === "Other" && !!job.platform);
  const [formData, setFormData] = useState({
    title: job.title || "", 
    company: job.company || "", 
    jobUrl: job.jobUrl || "", 
    location: job.location || "", 
    salaryMin: job.salaryMin || "", 
    salaryMax: job.salaryMax || "",
    platform: job.platform || "",
  });

  useEffect(() => {
    setFormData({
      title: job.title || "", 
      company: job.company || "", 
      jobUrl: job.jobUrl || "", 
      location: job.location || "", 
      salaryMin: job.salaryMin || "", 
      salaryMax: job.salaryMax || "",
      platform: job.platform || "",
    });
    setIsCustomPlatform(matchPlatform(job.platform) === "Other" && !!job.platform);
    setShowOptional(!!(job.location || job.jobUrl || job.salaryMin || job.salaryMax || job.platform));
  }, [job]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${job._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          salaryMin: formData.salaryMin ? Number(formData.salaryMin) : null,
          salaryMax: formData.salaryMax ? Number(formData.salaryMax) : null,
        }),
      });
      if (!res.ok) throw new Error("Failed to update job");

      toast.success("Job updated successfully!");
      triggerRefresh();
      router.refresh();
      onClose();
    } catch {
      toast.error("Failed to update job");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-bg-surface-elevated border border-border-default rounded-md px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all";

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-145 mx-4 bg-bg-surface border border-border-subtle rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-7 py-5 border-b border-border-subtle sticky top-0 bg-bg-surface z-10">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Edit Job</h2>
            <p className="text-xs text-text-secondary mt-0.5">Update application details.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-surface-hover transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-7 py-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-tertiary">Job Title *</label>
              <input required className={inputClass} value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-tertiary">Company *</label>
              <input required className={inputClass} value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
            </div>
          </div>

          {/* Optional fields toggle */}
          <button
            type="button"
            onClick={() => setShowOptional(!showOptional)}
            className="flex items-center gap-1.5 text-xs font-semibold text-text-tertiary hover:text-text-secondary transition-colors"
          >
            {showOptional ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showOptional ? "Hide" : "Show"} location, salary, platform & URL
          </button>

          {showOptional && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border border-border-subtle rounded-md p-4 bg-bg-surface">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-tertiary">Location</label>
                <input className={inputClass} placeholder="e.g. Remote, NYC" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-tertiary">Job URL</label>
                <input className={inputClass} placeholder="https://..." value={formData.jobUrl} onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-tertiary">Salary Min</label>
                <input type="number" className={inputClass} placeholder="120000" value={formData.salaryMin} onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-tertiary">Salary Max</label>
                <input type="number" className={inputClass} placeholder="150000" value={formData.salaryMax} onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-semibold text-text-tertiary">Platform</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary z-10 pointer-events-none">
                      {formData.platform.toLowerCase() === "linkedin" ? <Linkedin className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                    </div>
                    <Dropdown
                      className="flex-1 [&>button]:pl-9"
                      value={isCustomPlatform ? "Other" : matchPlatform(formData.platform)}
                      onChange={(val) => {
                        if (val === "Other") {
                          setIsCustomPlatform(true);
                          setFormData({ ...formData, platform: "" });
                        } else {
                          setIsCustomPlatform(false);
                          setFormData({ ...formData, platform: val });
                        }
                      }}
                      placeholder="Select platform..."
                      options={[
                        ...PREDEFINED_PLATFORMS.map(p => ({ value: p, label: p })),
                        { value: "Other", label: "Other (Custom)" }
                      ]}
                    />
                  </div>
                  {isCustomPlatform && (
                    <input 
                      type="text" 
                      placeholder="Enter custom platform..." 
                      className={`${inputClass} flex-1`}
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                      autoFocus
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-border-subtle flex justify-end gap-3">
            <button type="button" onClick={onClose} className="text-sm font-semibold text-text-secondary hover:text-text-primary px-4 py-2 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-sm px-6 py-2.5 rounded-md transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" strokeWidth={3} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
