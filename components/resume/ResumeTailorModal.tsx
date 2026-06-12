/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";
import { X, FileDown, Loader2, LayoutTemplate, RefreshCw } from "lucide-react";
import { PDFTemplate } from "./PDFTemplate";
import { pdf } from "@react-pdf/renderer";

// Dynamically import PDFViewer with no SSR to avoid Next.js hydration errors
const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false, loading: () => <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed"><Loader2 className="animate-spin text-primary w-8 h-8" /></div> }
);

import { useRouter } from "next/navigation";
import { IJob } from "@/types";

interface ResumeTailorModalProps {
  job: IJob;
  open: boolean;
  onClose: () => void;
}

export function ResumeTailorModal({ job, open, onClose }: ResumeTailorModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [resumeData, setResumeData] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTemplate, setActiveTemplate] = useState("classic");

  const tailorResume = useCallback(async (isMounted = true) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${job._id}/tailor`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (isMounted) {
        setResumeData(data.tailoredJson);
        setHistory(data.history || []);
        router.refresh(); // Refresh the page behind the scenes so the timeline button appears
      }
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to tailor resume");
      if (isMounted && !resumeData) onClose();
    } finally {
      if (isMounted) setLoading(false);
    }
  }, [job, onClose, resumeData, router]);

  // Fetch tailoring data on open
  useEffect(() => {
    if (!open) return;
    
    let isMounted = true;

    if (job.tailoredResume && job.resumeHistory && job.resumeHistory.length > 0) {
      // If we already tailored it before, just load it
      setResumeData(job.tailoredResume);
      setHistory(job.resumeHistory);
      setLoading(false);
    } else {
      tailorResume(isMounted);
    }

    return () => { isMounted = false; };
  }, [open, job, tailorResume]);

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

  const handleDownload = async () => {
    if (!resumeData) return;
    const toastId = toast.loading("Generating PDF...");
    try {
      const blob = await pdf(<PDFTemplate data={resumeData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Tailored_Resume_${job.company.replace(/\s+/g, "_")}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Resume downloaded!", { id: toastId });
    } catch {
      toast.error("Failed to download PDF", { id: toastId });
    }
  };

  const templates = [
    { id: "classic", name: "Classic Professional" },
    { id: "modern", name: "Modern Minimal" },
    { id: "tech", name: "Tech Startup" },
  ];

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-[95vw] h-[95vh] bg-bg-surface border border-border-subtle rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between px-4 md:px-6 py-4 border-b border-border-subtle bg-bg-surface shrink-0 gap-4 relative">
          <div className="pr-10 md:pr-0">
            <h2 className="text-xl font-extrabold text-text-primary">Resume Tailoring Studio</h2>
            <p className="text-sm text-text-secondary mt-0.5">Tailored for {job.title} at {job.company}</p>
          </div>
          
          <div className="flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-4">
            {!loading && history.length > 1 && (
              <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-xl text-sm font-extrabold border border-emerald-500/20 mr-4 shadow-sm">
                <span>Original Match: {history[0].analysis?.matchScore || job.matchScore}%</span>
                <span className="text-lg">➡️</span>
                <span>New Match: {history[history.length - 1].analysis?.matchScore}%</span>
                <span className="text-lg animate-bounce">🚀</span>
              </div>
            )}
            
            {!loading && resumeData && (
              <>
                <button
                  onClick={() => tailorResume()}
                  className="flex-1 md:flex-none justify-center bg-bg-surface border border-border-default hover:bg-bg-surface-hover text-text-primary font-bold text-sm px-3 md:px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
                >
                  <RefreshCw className="w-4 h-4 shrink-0" /> Re-Tailor
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 md:flex-none justify-center bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-sm px-3 md:px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 whitespace-nowrap"
                >
                  <FileDown className="w-4 h-4 shrink-0" /> Download
                </button>
              </>
            )}
            <button onClick={onClose} className="absolute top-3 right-3 md:static md:top-auto md:right-auto p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-surface-hover transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Body Split View */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Left Panel: Editor */}
          <div className="w-full lg:w-1/3 lg:min-w-100 border-b lg:border-b-0 lg:border-r border-border-subtle bg-bg-surface-hover/50 flex flex-col overflow-hidden max-h-[50vh] lg:max-h-full">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-text-secondary">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="font-bold">AI is tailoring your resume...</p>
                <p className="text-sm mt-2 opacity-70">Matching keywords with JD</p>
              </div>
            ) : resumeData ? (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Template Selector */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold flex items-center gap-2 text-text-primary">
                    <LayoutTemplate className="w-4 h-4 text-primary" /> Template Style
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {templates.map((tpl) => (
                      <button
                        key={tpl.id}
                        onClick={() => setActiveTemplate(tpl.id)}
                        className={`text-left px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
                          activeTemplate === tpl.id 
                            ? 'border-primary bg-primary/10 text-primary' 
                            : 'border-border-default hover:border-border-hover text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {tpl.name}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-text-tertiary mt-2">
                    Note: Currently all templates map to the Classic template until others are built.
                  </p>
                </div>

                <hr className="border-border-subtle" />

                {/* Editor Content */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-text-primary">Important Links (Header)</h3>
                  <div className="space-y-2">
                    {resumeData.basics?.links?.map((link: string, idx: number) => (
                      <div key={idx} className="flex gap-2">
                        <input 
                          type="text"
                          className="flex-1 bg-bg-surface border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
                          value={link}
                          placeholder="https://github.com/username"
                          onChange={(e) => {
                            const newLinks = [...(resumeData.basics.links || [])];
                            newLinks[idx] = e.target.value;
                            setResumeData({...resumeData, basics: {...resumeData.basics, links: newLinks}});
                          }}
                        />
                        <button 
                          onClick={() => {
                            const newLinks = resumeData.basics.links.filter((_: unknown, i: number) => i !== idx);
                            setResumeData({...resumeData, basics: {...resumeData.basics, links: newLinks}});
                          }}
                          className="px-3 py-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors font-bold"
                        >
                          X
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => {
                        const newLinks = [...(resumeData.basics?.links || []), "https://"];
                        setResumeData({...resumeData, basics: {...resumeData.basics, links: newLinks}});
                      }}
                      className="text-xs font-bold text-primary hover:text-primary-hover transition-colors"
                    >
                      + Add Link (Must include https:// to be clickable)
                    </button>
                  </div>
                </div>

                <hr className="border-border-subtle" />

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-text-primary">Project Links</h3>
                  {resumeData.projects?.map((project: any, idx: number) => (
                    <div key={idx} className="space-y-1">
                      <label className="text-xs font-bold text-text-secondary">{project.name} URL:</label>
                      <input 
                        type="text"
                        className="w-full bg-bg-surface border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
                        value={project.link || ""}
                        placeholder="https://github.com/your-project"
                        onChange={(e) => {
                          const newProjects = [...resumeData.projects];
                          newProjects[idx] = { ...newProjects[idx], link: e.target.value };
                          setResumeData({...resumeData, projects: newProjects});
                        }}
                      />
                    </div>
                  ))}
                  {(!resumeData.projects || resumeData.projects.length === 0) && (
                    <p className="text-xs text-text-tertiary italic">No projects found in resume.</p>
                  )}
                </div>

                <hr className="border-border-subtle" />

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-text-primary">Professional Summary</h3>
                  <textarea 
                    className="w-full h-32 bg-bg-surface border border-border-default rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                    value={resumeData.basics?.objective || ""}
                    onChange={(e) => setResumeData({...resumeData, basics: {...resumeData.basics, objective: e.target.value}})}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-text-primary">Experience Bullets (Top Job)</h3>
                  {resumeData.work?.[0]?.bullets?.map((bullet: string, idx: number) => (
                    <textarea 
                      key={idx}
                      className="w-full h-20 bg-bg-surface border border-border-default rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                      value={bullet}
                      onChange={(e) => {
                        const newWork = [...resumeData.work];
                        newWork[0].bullets[idx] = e.target.value;
                        setResumeData({...resumeData, work: newWork});
                      }}
                    />
                  ))}
                </div>

              </div>
            ) : null}
          </div>

          {/* Right Panel: Live PDF Preview */}
          <div className="flex-1 bg-gray-100 p-4">
            {loading ? (
              <div className="w-full h-full bg-white rounded-xl border shadow-sm animate-pulse flex items-center justify-center text-gray-400 font-bold">
                Preparing PDF Engine...
              </div>
            ) : resumeData ? (
              <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl border border-gray-300">
                {/* Dynamically render the template based on selection later, for now just PDFTemplate */}
                <PDFViewer width="100%" height="100%" className="border-none">
                  <PDFTemplate data={resumeData} />
                </PDFViewer>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
