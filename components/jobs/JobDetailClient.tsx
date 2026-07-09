"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { 
  Bot, Sparkles, Building2, MapPin, Banknote, CheckCircle2, AlertTriangle, ShieldAlert, Target, FileText, Copy, RefreshCw, ExternalLink, ChevronDown, ChevronUp, Mail, Globe
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { formatDistanceToNow, isPast } from "date-fns";
import { IJob } from "@/types";
import { getPlatformIcon } from "@/lib/utils";
interface JobDetailProps {
  job: IJob;
  hasResume?: boolean;
}

export function JobDetailClient({ job, hasResume }: JobDetailProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as string) || "overview";

  const [analyzing, setAnalyzing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(job.jobDescription || "");
  const [saving, setSaving] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(job.matchScore === undefined);
  
  // Tab states
  const [activeTab, setActiveTab] = useState<"overview" | "notes" | "contacts" | "activity">(initialTab === "notes" ? "notes" : "overview");
  const [activeAITab, setActiveAITab] = useState<"coach" | "cover-letter" | "outreach">(initialTab === "interview-prep" ? "coach" : "coach");
  const [coverLetter, setCoverLetter] = useState(job.coverLetter || "");
  const [generatingLetter, setGeneratingLetter] = useState(false);
  
  const [outreachMessage, setOutreachMessage] = useState(job.coldEmail || "");
  const [generatingOutreach, setGeneratingOutreach] = useState(false);
  
  const [notes, setNotes] = useState(job.notes || "");
  const [savingNotes, setSavingNotes] = useState(false);

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/jobs/${job._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success("Notes saved!");
      router.refresh();
    } catch {
      toast.error("Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleSaveDescription = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/jobs/${job._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: description }),
      });

      if (!res.ok) throw new Error("Update failed");

      toast.success("Description updated!");
      setIsEditing(false);
      router.refresh();
    } catch {
      toast.error("Failed to update description");
    } finally {
      setSaving(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/jobs/${job._id}/analyze`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Analysis failed");

      toast.success("Job analyzed successfully!");
      router.refresh();
    } catch {
      toast.error("Failed to analyze job");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateCoverLetter = async (forceRegenerate = false) => {
    setGeneratingLetter(true);
    try {
      const res = await fetch(`/api/jobs/${job._id}/cover-letter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceRegenerate })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      setCoverLetter(data.coverLetter);
      toast.success(forceRegenerate ? "Cover letter regenerated!" : "Cover letter generated!");
      router.refresh();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Failed to generate cover letter");
    } finally {
      setGeneratingLetter(false);
    }
  };

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(coverLetter);
    toast.success("Copied to clipboard!");
  };

  const handleGenerateOutreach = async (forceRegenerate = false) => {
    setGeneratingOutreach(true);
    try {
      const res = await fetch(`/api/jobs/${job._id}/outreach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceRegenerate })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      setOutreachMessage(data.outreachMessage);
      toast.success(forceRegenerate ? "Outreach message regenerated!" : "Outreach message generated!");
      router.refresh();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Failed to generate outreach message");
    } finally {
      setGeneratingOutreach(false);
    }
  };

  const handleCopyOutreach = () => {
    navigator.clipboard.writeText(outreachMessage);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="w-full pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
          <div>
              <h1 className="text-2xl font-semibold text-text-primary tracking-tight leading-tight mb-3">
                 {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-text-secondary">
                  <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /> {job.company}</span>
                  {job.location && (
                     <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location}</span>
                  )}
                  {job.platform && (
                     <span className="flex items-center gap-1.5">
                        {getPlatformIcon(job.platform) ? (
                           /* eslint-disable-next-line @next/next/no-img-element */
                           <img src={getPlatformIcon(job.platform)!} alt="" className="w-4 h-4 rounded-sm" />
                        ) : (
                           <Globe className="w-4 h-4 text-text-tertiary" />
                        )}
                        {job.platform}
                     </span>
                  )}
                  {(job.salaryMin || job.salaryMax) && (
                     <span className="flex items-center gap-1.5 text-primary">
                        <Banknote className="w-4 h-4" /> 
                        {job.salaryMin}{job.salaryMax ? ` - ${job.salaryMax}` : '+'}
                     </span>
                  )}
              </div>
          </div>
          <div className="flex gap-3 shrink-0">
             {job.jobUrl && (
                <a href={job.jobUrl} target="_blank" rel="noreferrer" className="px-5 py-2.5 bg-bg-surface-elevated text-text-primary font-semibold rounded-md border border-border-subtle hover:bg-bg-surface-hover transition-all flex items-center gap-2">
                   Job Post <ExternalLink className="w-4 h-4" />
                </a>
             )}
             <button className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-bg-base font-semibold rounded-md transition-all shadow-sm">
                 Update Status
             </button>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Job Details Column */}
         <div className="lg:col-span-5 space-y-8 order-2 lg:order-2">
            
            {/* Status & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="space-y-3">
                  <h3 className="text-[10px] font-semibold text-text-tertiary tracking-widest uppercase">Application Status</h3>
                  <div className="flex bg-bg-surface border border-border-subtle rounded-lg p-1 shadow-sm">
                     <div className={`flex-1 text-center py-2 text-xs font-semibold rounded-md transition-colors cursor-default ${job.status === 'saved' || job.status === 'applied' ? 'bg-primary/20 text-primary border border-primary/20 shadow-sm' : 'text-text-secondary'}`}>Applied</div>
                     <div className={`flex-1 text-center py-2 text-xs font-semibold rounded-md transition-colors cursor-default ${job.status === 'interview' ? 'bg-primary/20 text-primary border border-primary/20 shadow-sm' : 'text-text-secondary'}`}>Interview</div>
                     <div className={`flex-1 text-center py-2 text-xs font-semibold rounded-md transition-colors cursor-default ${job.status === 'offer' ? 'bg-primary/20 text-primary border border-primary/20 shadow-sm' : 'text-text-secondary'}`}>Offer</div>
                  </div>
               </div>
            </div>

            {/* Main Tabs */}
            <div className="border-b border-border-subtle flex gap-6">
               <button onClick={() => setActiveTab("overview")} className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>Overview</button>
               <button onClick={() => setActiveTab("notes")} className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'notes' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>Notes & Links</button>
            </div>

            {activeTab === "overview" && (
               <div className="space-y-6">
                  {/* Action Bar (Follow up date picker) */}
                  <div className="flex items-center gap-4 bg-bg-surface border border-border-subtle p-4 rounded-lg">
                      <div className="flex-1">
                          <label className="text-xs font-semibold text-text-secondary block mb-1">Follow-up / Interview Date</label>
                          <input 
                              type="date" 
                              className="bg-bg-base border border-border-default rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-primary"
                              defaultValue={job.followUpDate ? new Date(job.followUpDate).toISOString().split('T')[0] : ''}
                              onChange={async (e) => {
                                  try {
                                      await fetch(`/api/jobs/${job._id}`, {
                                          method: 'PUT',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ followUpDate: e.target.value || null })
                                      });
                                      toast.success("Date updated");
                                      router.refresh();
                                  } catch {
                                      toast.error("Failed to update date");
                                  }
                              }}
                          />
                      </div>
                      {job.followUpDate && (
                          <div className="text-right">
                             <p className={`text-xs font-semibold ${isPast(new Date(job.followUpDate)) ? 'text-amber-500' : 'text-emerald-500'}`}>
                                 {isPast(new Date(job.followUpDate)) ? 'Overdue!' : 'Upcoming'}
                             </p>
                             <p className="text-[10px] text-text-tertiary">{formatDistanceToNow(new Date(job.followUpDate))} {isPast(new Date(job.followUpDate)) ? 'ago' : 'away'}</p>
                          </div>
                      )}
                  </div>

                  <div className="flex items-center justify-between">
                     <h2 className="text-xl font-semibold text-text-primary tracking-tight">Job Description</h2>
                     {!isEditing ? (
                        <button className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors" onClick={() => setIsEditing(true)}>Edit Text</button>
                     ) : (
                        <div className="flex gap-2">
                           <button className="text-xs font-semibold text-text-secondary hover:text-text-primary" onClick={() => setIsEditing(false)}>Cancel</button>
                           <button className="text-xs font-semibold text-primary hover:text-primary-hover" onClick={handleSaveDescription} disabled={saving}>{saving ? "Saving..." : "Save Content"}</button>
                        </div>
                     )}
                  </div>
                  
                  {isEditing ? (
                     <textarea
                        className="w-full h-100 p-4 text-sm bg-bg-surface-elevated border border-border-default rounded-md text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 resize-none"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Paste the job description here to enable AI analysis..."
                     />
                  ) : (
                     <div className="relative bg-bg-surface border border-border-subtle rounded-lg p-6">
                        <div className={`whitespace-pre-wrap text-sm text-text-secondary leading-relaxed overflow-hidden transition-all duration-300 ${isDescriptionExpanded ? "" : "max-h-64"}`}>
                           {job.jobDescription || (
                              <div className="text-center py-8">
                                 <p className="text-text-primary font-semibold mb-2">No Description Provided</p>
                                 <p className="opacity-70">Add the job description to unlock matching scores, targeted cover letters, and interview coaching.</p>
                              </div>
                           )}
                        </div>
                        
                        {job.jobDescription && !isDescriptionExpanded && (
                           <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-bg-surface to-transparent pointer-events-none rounded-b-2xl" />
                        )}
                        
                        {job.jobDescription && job.jobDescription.length > 500 && (
                           <div className="mt-4 flex justify-center">
                              <button 
                                 className="flex items-center gap-1.5 text-xs font-semibold text-text-tertiary hover:text-text-primary transition-colors"
                                 onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                              >
                                 {isDescriptionExpanded ? (
                                    <><ChevronUp className="w-4 h-4" /> Show less</>
                                 ) : (
                                    <><ChevronDown className="w-4 h-4" /> Read full description</>
                                 )}
                              </button>
                           </div>
                        )}
                     </div>
                  )}
               </div>
            )}

            {activeTab === "notes" && (
               <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                   <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
                       <h2 className="text-lg font-semibold text-text-primary mb-4">Notes & Links</h2>
                       <textarea
                           className="w-full bg-bg-surface-elevated border border-border-default rounded-md px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 min-h-50 resize-none"
                           placeholder="Add interview notes, important links, or recruiter contacts..."
                           value={notes}
                           onChange={(e) => setNotes(e.target.value)}
                       />
                       <div className="flex justify-end mt-4">
                           <button 
                               onClick={handleSaveNotes}
                               disabled={savingNotes}
                               className="px-6 py-2 bg-primary hover:bg-primary-hover text-bg-base font-semibold rounded-md transition-all shadow-sm disabled:opacity-50"
                           >
                              {savingNotes ? "Saving..." : "Save Notes"}
                           </button>
                       </div>
                   </div>
               </div>
            )}
         </div>

         {/* AI Coach Analysis Column */}
         <div className="lg:col-span-7 space-y-6 order-1 lg:order-1">
            <div className="bg-bg-surface border border-border-subtle rounded-lg p-6 relative overflow-hidden group shadow-sm">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-md bg-bg-surface-elevated flex items-center justify-center border border-border-subtle text-text-secondary">
                     <Bot className="w-5 h-5" />
                  </div>
                  <div>
                     <h3 className="text-sm font-semibold text-text-primary">AI Coach Analysis</h3>
                     <p className="text-[10px] font-semibold text-text-secondary tracking-widest uppercase mt-0.5">Smart Match Technology</p>
                  </div>
               </div>
               
               {/* Match Score Circle */}
               <div className="flex justify-center mb-8 relative">
                   <div className="w-36 h-36 relative flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                         <circle cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="8" className="text-border-subtle" fill="none" />
                         <circle 
                            cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="8" 
                            className="text-primary transition-all duration-1500 ease-out" 
                            fill="none" 
                            strokeLinecap="round"
                            strokeDasharray={402} 
                            strokeDashoffset={402 - (402 * (job.matchScore || 0)) / 100} 
                         />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                         <span className="text-3xl font-semibold text-text-primary">{job.matchScore || 0}<span className="text-xl text-text-tertiary">%</span></span>
                         <span className="text-[10px] font-semibold text-text-secondary tracking-widest uppercase mt-1">Match Core</span>
                      </div>
                   </div>
               </div>

               {/* AI Tabs */}
               <div className="flex bg-bg-surface-elevated p-1 rounded-lg mb-6 border border-border-subtle">
                  <button onClick={() => setActiveAITab("coach")} className={"flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors shadow-sm " + (activeAITab === "coach" ? "bg-primary text-bg-base" : "text-text-secondary hover:text-text-primary")}>Analysis</button>
                  <button onClick={() => setActiveAITab("cover-letter")} className={"flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors shadow-sm " + (activeAITab === "cover-letter" ? "bg-primary text-bg-base" : "text-text-secondary hover:text-text-primary")}>Letter</button>
                  <button onClick={() => setActiveAITab("outreach")} className={"flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors shadow-sm " + (activeAITab === "outreach" ? "bg-primary text-bg-base" : "text-text-secondary hover:text-text-primary")}>Outreach</button>
               </div>

               {/* Content based on AI Tab */}
               {activeAITab === "coach" && (
                 <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                     {!hasResume ? (
                        <div className="text-center py-6 bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 shadow-sm border-dashed">
                           <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                           <p className="text-sm font-semibold text-amber-500 mb-1">Resume Missing</p>
                           <p className="text-xs text-text-secondary mb-4 leading-relaxed">You need to upload a resume to generate personalized AI coaching, tailored cover letters, and match scores.</p>
                           <Link href="/settings" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold tracking-wide uppercase rounded-md transition-all shadow-sm inline-block">
                               Upload Resume in Settings
                           </Link>
                        </div>
                     ) : job.whatsStrong ? (
                        <>
                           <div>
                              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold mb-2">
                                 <CheckCircle2 className="w-4 h-4" /> Strong Match
                              </div>
                              <p className="text-xs text-text-secondary leading-relaxed bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg">
                                 {job.whatsStrong}
                              </p>
                           </div>
                           
                           <div>
                              <div className="flex items-center gap-1.5 text-orange-400 text-xs font-semibold mb-2">
                                 <AlertTriangle className="w-4 h-4" /> Experience Gaps
                              </div>
                              <p className="text-xs text-text-secondary leading-relaxed bg-orange-500/10 border border-orange-500/20 p-3 rounded-lg">
                                 {job.biggestGap}
                              </p>
                           </div>
                           
                           {job.actionToday && (
                              <div className="bg-bg-surface-elevated border border-border-subtle p-3 rounded-lg">
                                 <p className="text-xs font-semibold text-text-primary mb-1 flex items-center gap-1.5">
                                    <Target className="w-4 h-4" /> Action Today
                                 </p>
                                 <p className="text-xs text-text-secondary leading-relaxed">{job.actionToday}</p>
                              </div>
                           )}
                           
                           <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border-subtle border-dashed">
                               <div className="flex items-center justify-between">
                                   <p className="text-[10px] text-text-tertiary font-semibold tracking-wider uppercase">
                                       Analyzed {job.aiAnalyzedAt ? formatDistanceToNow(new Date(job.aiAnalyzedAt)) + ' ago' : 'recently'}
                                   </p>
                                   <button 
                                      className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors disabled:opacity-50"
                                      onClick={handleAnalyze} disabled={analyzing}
                                    >
                                      <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} /> 
                                      {analyzing ? "Re-Analyzing..." : "Re-analyze"}
                                   </button>
                               </div>
                               <div className="grid grid-cols-2 gap-2 mt-2">
                                  <Link 
                                    href={`/ai-coach?tab=intelligence&jobId=${job._id}`}
                                    className="flex items-center justify-center gap-2 py-2 bg-bg-surface-elevated border border-border-subtle rounded-md text-[10px] font-semibold text-text-secondary hover:text-primary hover:border-primary/30 transition-all"
                                  >
                                    <ShieldAlert className="w-3 h-3 text-red-400" /> Red Flags
                                  </Link>
                                  <Link 
                                    href={`/ai-coach?tab=analyses&jobId=${job._id}`}
                                    className="flex items-center justify-center gap-2 py-2 bg-primary text-white rounded-md text-[10px] font-semibold hover:bg-primary-hover transition-all shadow-md shadow-primary/20"
                                  >
                                    <FileText className="w-3 h-3" /> Tailor Resume
                                  </Link>
                               </div>
                           </div>
                        </>
                     ) : (
                        <div className="text-center py-6">
                           <p className="text-xs text-text-secondary mb-4">You have not analyzed this job description yet.</p>
                           <button 
                              className="w-full py-3 bg-primary hover:bg-primary-hover text-bg-base font-semibold text-xs tracking-wider uppercase rounded-md transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                              onClick={handleAnalyze} disabled={analyzing || !job.jobDescription}
                           >
                              {analyzing ? <><Sparkles className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Sparkles className="w-4 h-4" /> Analyze with AI</>}
                           </button>
                        </div>
                     )}
                 </div>
               )}

               {activeAITab === "cover-letter" && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                     {!coverLetter ? (
                        <div className="text-center py-6">
                           <p className="text-xs text-text-secondary mb-4">Generate a personalized cover letter using AI context.</p>
                           <button 
                              className="w-full py-3 bg-primary hover:bg-primary-hover text-bg-base font-semibold text-xs tracking-wider uppercase rounded-md transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                              onClick={() => handleGenerateCoverLetter()} disabled={generatingLetter || !job.jobDescription}
                           >
                              {generatingLetter ? <><Sparkles className="w-4 h-4 animate-spin" /> Generating...</> : <><FileText className="w-4 h-4" /> Generate Letter</>}
                           </button>
                        </div>
                     ) : (
                        <div className="space-y-4">
                           <div className="flex justify-between items-center bg-bg-surface-elevated p-2 rounded-md border border-border-subtle">
                              <span className="text-[10px] font-semibold text-text-tertiary uppercase pl-2">Ready to use</span>
                              <div className="flex gap-1">
                                 <button onClick={handleCopyLetter} className="px-3 py-1.5 bg-bg-surface-elevated hover:bg-bg-surface-hover text-xs font-semibold text-text-primary rounded-lg border border-border-default transition-colors flex items-center gap-1.5">
                                    <Copy className="w-3.5 h-3.5" /> Copy
                                 </button>
                                 <button onClick={() => handleGenerateCoverLetter(true)} disabled={generatingLetter} className="px-3 py-1.5 bg-bg-surface-elevated hover:bg-bg-surface-hover text-xs font-semibold text-text-primary rounded-lg border border-border-default transition-colors flex items-center gap-1.5 disabled:opacity-50">
                                    <RefreshCw className={`w-3.5 h-3.5 ${generatingLetter ? 'animate-spin' : ''}`} /> Retry
                                 </button>
                              </div>
                           </div>
                           
                           <div className="bg-bg-surface-elevated border border-border-subtle p-4 rounded-md max-h-75 overflow-y-auto scrollbar-hide text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">
                              {coverLetter}
                           </div>
                        </div>
                     )}
                  </div>
               )}

               {activeAITab === "outreach" && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                     {!outreachMessage ? (
                        <div className="text-center py-6">
                           <p className="text-xs text-text-secondary mb-4">Generate a personalized networking outreach message for this role.</p>
                           <button 
                              className="w-full py-3 bg-primary hover:bg-primary-hover text-bg-base font-semibold text-xs tracking-wider uppercase rounded-md transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                              onClick={() => handleGenerateOutreach()} disabled={generatingOutreach || !job.jobDescription}
                           >
                              {generatingOutreach ? <><Sparkles className="w-4 h-4 animate-spin" /> Generating...</> : <><Mail className="w-4 h-4" /> Generate Message</>}
                           </button>
                        </div>
                     ) : (
                        <div className="space-y-4">
                           <div className="flex justify-between items-center bg-bg-surface-elevated p-2 rounded-md border border-border-subtle">
                              <span className="text-[10px] font-semibold text-text-tertiary uppercase pl-2">Ready to send</span>
                              <div className="flex gap-1">
                                 <button onClick={handleCopyOutreach} className="px-3 py-1.5 bg-bg-surface-elevated hover:bg-bg-surface-hover text-xs font-semibold text-text-primary rounded-lg border border-border-default transition-colors flex items-center gap-1.5">
                                    <Copy className="w-3.5 h-3.5" /> Copy
                                 </button>
                                 <button onClick={() => handleGenerateOutreach(true)} disabled={generatingOutreach} className="px-3 py-1.5 bg-bg-surface-elevated hover:bg-bg-surface-hover text-xs font-semibold text-text-primary rounded-lg border border-border-default transition-colors flex items-center gap-1.5 disabled:opacity-50">
                                    <RefreshCw className={`w-3.5 h-3.5 ${generatingOutreach ? 'animate-spin' : ''}`} /> Retry
                                 </button>
                              </div>
                           </div>
                           
                           <div className="bg-bg-surface-elevated border border-border-subtle p-4 rounded-md max-h-75 overflow-y-auto scrollbar-hide text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">
                              {outreachMessage}
                           </div>
                        </div>
                     )}
                  </div>
               )}
            </div>

            {/* Interview Prep Summary */}
            <div className="bg-bg-surface border border-border-subtle rounded-lg p-6 shadow-sm mt-6">
               <h3 className="text-sm font-semibold text-text-primary mb-4">Interview Prep Summary</h3>
               <div className="space-y-3">
                  {job.aiCoachTips && job.aiCoachTips.length > 0 ? (
                     job.aiCoachTips.map((tip: string, index: number) => (
                        <div key={index} className="bg-bg-surface-elevated p-3 rounded-md border border-border-subtle opacity-90">
                           <div className="flex gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                               <p className="text-xs text-text-secondary leading-relaxed p-0 m-0">{tip}</p>
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className="text-center py-4 bg-bg-surface-elevated rounded-md border border-border-subtle">
                         <p className="text-xs text-text-tertiary">Run AI Analysis to generate personalized interview prep tips based on your resume gaps.</p>
                     </div>
                  )}
               </div>
            </div>

         </div>
      </div>
    </div>
  );
}
