/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Sparkles, Brain, ShieldAlert, Mail, Activity, 
  Search, TrendingUp, AlertTriangle, 
  CheckCircle2, ChevronRight, RefreshCw,
  Copy, Zap, Target, FileText, MinusCircle
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ResumeTailorModal } from "@/components/resume/ResumeTailorModal";
import { IUser, IJob } from "@/types";

interface AICoachClientProps {
  user: IUser;
  jobs: IJob[];
}

export function AICoachClient({ user, jobs }: AICoachClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Tab State
  const activeTab = searchParams.get("tab") || "analyses";
  const selectedJobId = searchParams.get("jobId");
  
  const [selectedJob, setSelectedJob] = useState<IJob>(
    jobs.find(j => j._id.toString() === selectedJobId) || jobs[0]
  );

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", tab);
    router.push(`/ai-coach?${params.toString()}`);
  };

  const setJobId = (id: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("jobId", id);
    router.push(`/ai-coach?${params.toString()}`);
    setSelectedJob((jobs.find(j => j._id.toString() === id) as IJob) || jobs[0]);
  };

  const tabs = [
    { id: "analyses", label: "Job Analyses", icon: Brain },
    { id: "resume", label: "Resume Health", icon: Activity },
    { id: "intelligence", label: "Job Intelligence", icon: ShieldAlert },
    { id: "outreach", label: "Outreach", icon: Mail },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Premium Header */}
      <div className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">AI Coach</h1>
            <p className="text-sm text-text-secondary mt-1">Your personalized AI companion for the entire job search journey.</p>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex gap-2 p-1 bg-bg-surface border border-border-subtle rounded-lg shadow-sm mt-8 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                  isActive 
                  ? "bg-bg-elevated text-text-primary shadow-sm border border-border-subtle" 
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-text-tertiary"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "analyses" && <JobAnalysesTab jobs={jobs} initialExpandedId={selectedJobId} />}
          {activeTab === "resume" && <ResumeHealthTab user={user} />}
          {activeTab === "intelligence" && (
            <JobIntelligenceTab jobs={jobs} selectedJob={selectedJob} setJobId={setJobId} />
          )}
          {activeTab === "outreach" && (
            <OutreachTab jobs={jobs} selectedJob={selectedJob} setJobId={setJobId} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// --- TAB COMPONENTS ---

const AI_COACH_PER_PAGE = 8;

function JobAnalysesTab({ jobs, initialExpandedId }: { jobs: IJob[], initialExpandedId?: string | null }) {
  const [expandedId, setExpandedId] = useState<string | null>(initialExpandedId || null);
  const [page, setPage] = useState(1);
  
  const analyzedJobs = jobs.filter(j => j.matchScore !== null);
  const avgScore = analyzedJobs.length 
    ? Math.round(analyzedJobs.reduce((sum, j) => sum + (j.matchScore || 0), 0) / analyzedJobs.length)
    : 0;

  const totalPages = Math.max(1, Math.ceil(analyzedJobs.length / AI_COACH_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginatedJobs = analyzedJobs.slice((safePage - 1) * AI_COACH_PER_PAGE, safePage * AI_COACH_PER_PAGE);

  if (analyzedJobs.length === 0) {
    return (
      <div className="bg-bg-surface border border-border-subtle rounded-3xl p-12 text-center flex flex-col items-center">
        <div className="w-20 h-20 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
          <Brain className="w-10 h-10 text-primary/40" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary mb-3">No Job Analyses Yet</h2>
        <p className="text-sm text-text-secondary max-w-sm mb-8 leading-relaxed">
          Start by adding a job and clicking &quot;Analyze with AI&quot; in the job details page. Your match scores and tips will appear here.
        </p>
        <Link href="/jobs" className="bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-3 rounded-md transition-all shadow-lg shadow-primary/20">
          Go analyze a job
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Board */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-6 shadow-sm">
          <TrendingUp className="w-5 h-5 text-primary mb-4" />
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1">Average Match</p>
          <h3 className="text-3xl font-semibold text-text-primary">{avgScore}%</h3>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-6 shadow-sm text-glow-card">
          <Sparkles className="w-5 h-5 text-amber-500 mb-4" />
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1">Top Match</p>
          <h3 className="text-3xl font-semibold text-text-primary">{Math.max(...analyzedJobs.map(j => j.matchScore || 0))}%</h3>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-6 shadow-sm">
          <Brain className="w-5 h-5 text-emerald-500 mb-4" />
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1">Total Insights</p>
          <h3 className="text-3xl font-semibold text-text-primary">{analyzedJobs.length}</h3>
        </div>
      </div>

      {/* Job Rows */}
      <div className="space-y-3">
        {paginatedJobs.map(job => (
          <div key={job._id.toString()} className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden transition-all hover:border-primary/40 group">
            <button 
              onClick={() => setExpandedId(expandedId === job._id.toString() ? null : job._id.toString())}
              className="w-full text-left p-5 flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-widest mb-0.5">{job.company }</p>
                <h3 className="text-base font-semibold text-text-primary truncate">{job.title}</h3>
              </div>
              <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                <div className="flex flex-col items-end">
                  <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-widest leading-none mb-1">Match</p>
                  <p className={`text-sm sm:text-lg font-black ${(job.matchScore ?? 0) >= 80 ? "text-emerald-500" : (job.matchScore ?? 0) >= 60 ? "text-amber-500" : "text-red-400"}`}>
                    {job.matchScore || 0}%
                  </p>
                </div>
                <div className={`p-2 rounded-lg transition-colors ${expandedId === job._id.toString() ? "bg-primary text-white" : "bg-bg-surface-elevated text-text-tertiary group-hover:text-primary"}`}>
                  <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${expandedId === job._id.toString() ? "rotate-90" : ""}`} />
                </div>
              </div>
            </button>
            
            <AnimatePresence>
              {expandedId === job._id.toString() && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden border-t border-border-subtle bg-bg-surface-elevated/30"
                >
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-5">
                      <div>
                        <h4 className="flex items-center gap-2 text-xs font-semibold text-emerald-500 uppercase tracking-widest mb-3">
                          <CheckCircle2 className="w-4 h-4" /> Why you&apos;re a match
                        </h4>
                        <p className="text-sm text-text-secondary leading-relaxed bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-md italic">
                          &quot;{job.whatsStrong}&quot;
                        </p>
                      </div>
                      <div>
                        <h4 className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-widest mb-3">
                          <AlertTriangle className="w-4 h-4" /> Area to address
                        </h4>
                        <p className="text-sm text-text-secondary leading-relaxed bg-amber-500/5 border border-amber-500/10 p-4 rounded-md italic">
                          &quot;{job.biggestGap}&quot;
                        </p>
                      </div>
                    </div>
                    <div className="space-y-5">
                      <div>
                         <h4 className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-widest mb-3">
                            <Target className="w-4 h-4" /> Action Plan
                         </h4>
                         <p className="text-sm text-text-primary font-medium leading-relaxed bg-primary/5 border border-primary/10 p-4 rounded-md border-dashed">
                            {job.actionToday}
                         </p>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Link href={`/jobs/${job._id}`} className="flex-1 text-center py-2.5 bg-bg-surface border border-border-default rounded-md text-xs font-semibold text-text-primary hover:bg-bg-surface-hover transition-all">
                          Full Details
                        </Link>
                        <Link href={`/ai-coach?tab=outreach&jobId=${job._id}`} className="flex-1 text-center py-2.5 bg-primary text-white rounded-md text-xs font-semibold hover:bg-primary-hover transition-all shadow-md shadow-primary/10">
                          Generate Outreach
                        </Link>
                      </div>
                      <TailorResumeButton job={job} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
          <p className="text-xs text-text-tertiary font-medium">
            Showing {(safePage - 1) * AI_COACH_PER_PAGE + 1}–{Math.min(safePage * AI_COACH_PER_PAGE, analyzedJobs.length)} of {analyzedJobs.length} analyses
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="px-3 py-1.5 rounded-md text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-surface-elevated border border-border-default transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              Previous
            </button>
            <span className="text-xs font-semibold text-text-primary px-2">
              {safePage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="px-3 py-1.5 rounded-md text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-surface-elevated border border-border-default transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TailorResumeButton({ job }: { job: IJob }) {
  const [modalOpen, setModalOpen] = useState(false);
  const history = job.resumeHistory || [];

  return (
    <div className="flex flex-col gap-3 mt-4">
      <button
        onClick={() => setModalOpen(true)}
        className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-6 py-3 rounded-md transition-all shadow-md flex items-center justify-center gap-2 group"
      >
        <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
        {history.length > 0 ? "Open Tailoring Studio" : "Auto-Tailor Resume (Studio)"}
      </button>

      {/* Mini ROI Timeline */}
      {history.length > 1 && (
        <div className="bg-bg-surface-hover rounded-md p-3 border border-border-subtle mt-1 text-xs">
          <p className="font-semibold text-text-secondary mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> Resume Improvement History
          </p>
          <div className="space-y-2">
            {history.map((entry: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-text-tertiary">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  <span className="font-semibold">{entry.version}</span>
                </div>
                <span className="font-semibold text-text-primary">{entry.analysis?.matchScore}% Match</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Always show the link to the detailed history page */}
      <Link 
        href={`/jobs/${job._id}/history`}
        className="mt-1 block text-center w-full bg-bg-surface border border-border-default hover:bg-bg-base text-text-secondary py-2 rounded-md font-semibold transition-colors shadow-sm"
      >
        View Detailed Timeline
      </Link>

      {modalOpen && (
        <ResumeTailorModal 
          job={job} 
          open={modalOpen} 
          onClose={() => setModalOpen(false)} 
        />
      )}
    </div>
  );
}

function ResumeHealthTab({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const [atsDetails, setAtsDetails] = useState(user.atsDetails);
  
  // Bullet Improver State
  const [bulletText, setBulletText] = useState("");
  const [improving, setImproving] = useState(false);
  const [improvedResult, setImprovedResult] = useState<any>(null);

  const checkATS = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/resume/ats-score", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAtsDetails(data);
      toast.success("ATS Score updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to check ATS score");
    } finally {
      setLoading(false);
    }
  };

  const improveBullet = async () => {
    if (!bulletText.trim()) return;
    setImproving(true);
    try {
      const res = await fetch("/api/resume/improve-bullet", {
        method: "POST",
        body: JSON.stringify({ bullet: bulletText }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImprovedResult(data);
      toast.success("Bullet point improved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to improve bullet");
    } finally {
      setImproving(false);
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-red-400";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* ATS Scanner Section */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-bg-surface border border-border-subtle rounded-3xl p-8 relative overflow-hidden shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="grid place-items-center w-10 h-10 rounded-md bg-emerald-500/10 text-emerald-500 shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary">ATS Compatibility Scanner</h3>
            </div>
            <button 
              onClick={checkATS} 
              disabled={loading}
              className="px-5 py-2.5 w-full sm:w-auto bg-bg-surface-elevated hover:bg-bg-surface-hover text-xs font-semibold text-text-primary border border-border-default rounded-md transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Scanning..." : (atsDetails ? "Re-scan Resume" : "Start Initial Scan")}
            </button>
          </div>

          {!atsDetails ? (
            <div className="text-center py-10 bg-bg-surface-elevated/50 rounded-lg border border-dashed border-border-default">
              <p className="text-sm text-text-secondary max-w-xs mx-auto mb-6">
                Analyzing your resume text for ATS compatibility will give you specific fixes to rank higher in recruiter searches.
              </p>
              <button 
                onClick={checkATS} 
                className="bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-3 rounded-md transition-all shadow-lg shadow-primary/20"
              >
                Launch Scanner
              </button>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Score Dashboard */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-10">
                <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" className="text-border-subtle" fill="none" />
                    <circle 
                      cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" 
                      className={`${scoreColor(atsDetails.atsScore)} transition-all duration-1000 ease-out`} 
                      fill="none" 
                      strokeLinecap="round"
                      strokeDasharray={364} 
                      strokeDashoffset={364 - (364 * atsDetails.atsScore) / 100} 
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-black text-text-primary">{atsDetails.atsScore}</span>
                    <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-widest">Score</span>
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-xs font-semibold text-text-tertiary uppercase tracking-widest mb-1">Expert Verdict</p>
                  <h4 className="text-lg font-semibold text-text-primary leading-tight mb-2">{atsDetails.verdict}</h4>
                  <div className="flex justify-center sm:justify-start gap-2">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500`}>Keyword Density: {atsDetails.keywordDensity}</span>
                  </div>
                </div>
              </div>

              {/* Actionable Recs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="text-xs font-semibold text-text-primary uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Top Improvements
                  </h5>
                  <ul className="space-y-2.5">
                    {atsDetails.topRecommendations.map((rec: string, i: number) => (
                      <li key={i} className="flex gap-3 items-start bg-bg-surface-elevated p-3 rounded-md border border-border-subtle">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-xs text-text-secondary leading-snug">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h5 className="text-xs font-semibold text-text-primary uppercase tracking-widest flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" /> Quick Wins
                    </h5>
                    <div className="space-y-2">
                      {atsDetails.quickWins.map((win: string, i: number) => (
                        <div key={i} className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-md">
                          <p className="text-xs font-semibold text-amber-600 mb-0.5">Under 5 mins</p>
                          <p className="text-xs text-text-secondary leading-tight">{win}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {atsDetails.formatIssues.length > 0 && (
                    <div className="space-y-3">
                       <h5 className="text-xs font-semibold text-red-500 uppercase tracking-widest flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" /> Format Issues
                       </h5>
                       <div className="flex flex-wrap gap-2">
                          {atsDetails.formatIssues.map((iss: string, i: number) => (
                            <span key={i} className="text-[10px] font-semibold bg-red-500/10 text-red-500 px-2 py-1 rounded border border-red-500/20">{iss}</span>
                          ))}
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bullet Improver Section */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-bg-surface border border-border-subtle rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary text-glow">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Bullet Point Improver</h3>
              <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-widest">Quantify your impact</p>
            </div>
          </div>

          <div className="space-y-4">
            <textarea 
               value={bulletText}
               onChange={(e) => setBulletText(e.target.value)}
               placeholder="Paste a weak bullet point (e.g., &apos;Helped build a website used by many  people&apos;)"
               className="w-full h-32 p-4 text-sm bg-bg-surface-elevated border border-border-default rounded-lg text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 resize-none transition-all"
            />
            <button 
              onClick={improveBullet}
              disabled={improving || !bulletText.trim()}
              className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-semibold text-sm rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {improving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Perfecting...</> : <><Sparkles className="w-4 h-4" /> Improve Bullet Point</>}
            </button>
          </div>

          <AnimatePresence>
            {improvedResult && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 space-y-4"
              >
                <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-widest px-1">AI-Powered Versions (STAR Pattern)</p>
                <div className="space-y-3">
                  {improvedResult.improved.map((bullet: any, i: number) => (
                    <div key={i} className="group bg-bg-surface-elevated border border-border-subtle rounded-lg p-4 relative hover:border-primary/30 transition-all">
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <span className="text-[10px] font-black text-primary uppercase">Option {i+1}</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(bullet.text);
                            toast.success("Copied!");
                          }}
                          className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-bg-surface border border-border-default rounded-lg text-text-tertiary hover:text-primary"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-text-primary font-medium leading-relaxed mb-3">{bullet.text}</p>
                      <p className="text-[10px] text-text-tertiary italic">Why better: {bullet.whyBetter}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-primary/5 border border-primary/20 p-3 rounded-md mt-4">
                  <p className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-1">Expert Tip</p>
                  <p className="text-[11px] text-text-secondary leading-relaxed">{improvedResult.tip}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function JobIntelligenceTab({ jobs, selectedJob, setJobId }: { jobs: IJob[], selectedJob: any, setJobId: (id: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(selectedJob?.redFlagAnalysis || null);

  useEffect(() => {
    setAnalysis(selectedJob?.redFlagAnalysis || null);
  }, [selectedJob]);

  const analyzeRedFlags = async () => {
    if (!selectedJob) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${selectedJob._id}/red-flags`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAnalysis(data);
      toast.success("Intelligence report generated!");
    } catch (err: any) {
      toast.error(err.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar - Job Picker */}
      <div className="lg:col-span-4 space-y-4">
        <h4 className="text-xs font-semibold text-text-tertiary uppercase tracking-widest pl-1 mb-2">Select a Job</h4>
        <div className="space-y-2 max-h-150 overflow-y-auto no-scrollbar pb-10">
          {jobs.map(job => (
            <button
              key={job._id.toString()}
              onClick={() => setJobId(job._id.toString())}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                selectedJob?._id.toString() === job._id.toString()
                ? "bg-primary/10 border-primary shadow-sm"
                : "bg-bg-surface border-border-subtle hover:border-primary/30"
              }`}
            >
              <p className={`text-[10px] font-semibold uppercase tracking-widest mb-1 ${selectedJob?._id.toString() === job._id.toString() ? "text-primary" : "text-text-tertiary"}`}>
                {job.company }
              </p>
              <h5 className="text-sm font-semibold text-text-primary truncate">{job.title}</h5>
            </button>
          ))}
        </div>
      </div>

      {/* Main Analysis Area */}
      <div className="lg:col-span-8">
        {!selectedJob ? (
          <div className="h-full bg-bg-surface border border-border-subtle border-dashed rounded-3xl flex flex-col items-center justify-center p-12 text-center">
            <Search className="w-12 h-12 text-text-tertiary mb-4 opacity-20" />
            <p className="text-sm text-text-tertiary font-semibold lowercase tracking-widest">Select a job to start intelligence report</p>
          </div>
        ) : (
          <div className="bg-bg-surface border border-border-subtle rounded-3xl p-8 relative overflow-hidden shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 pb-8 border-b border-border-subtle">
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">Evaluating Opportunity</p>
                <h3 className="text-2xl font-black text-text-primary">{selectedJob.company }</h3>
                <p className="text-sm text-text-secondary font-medium">{selectedJob.title}</p>
              </div>
              <div className="bg-bg-surface-elevated p-2 rounded-lg border border-border-subtle w-full sm:w-auto">
                 {analysis ? (
                   <div className="flex items-center justify-center gap-2 px-4 py-2 bg-bg-base rounded-md border border-border-default">
                     <div className={`w-3 h-3 rounded-full ${analysis.overallRating === 'safe' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : analysis.overallRating === 'caution' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} />
                     <span className="text-xs font-black uppercase text-text-primary">{analysis.overallRating} Rating</span>
                   </div>
                 ) : (
                   <button 
                    onClick={analyzeRedFlags} 
                    disabled={loading || !selectedJob.jobDescription}
                    className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 w-full rounded-md text-xs font-semibold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                   >
                     {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                     Perform Deep Scan
                   </button>
                 )}
              </div>
            </div>

            {!analysis ? (
              <div className="text-center py-20 bg-bg-surface-elevated/30 rounded-lg flex flex-col items-center">
                 <ShieldAlert className="w-12 h-12 text-primary mb-4 opacity-50" />
                 <h4 className="text-lg font-semibold text-text-primary mb-2">Ready to Scan for Concerns</h4>
                 <p className="text-sm text-text-secondary max-w-sm mb-8">
                   We'll look for realistic requirements, work-life balance signals, toxic traits, and salary transparency in the job post.
                 </p>
                 <button 
                  onClick={analyzeRedFlags} 
                  disabled={loading || !selectedJob.jobDescription}
                  className="bg-primary hover:bg-primary-hover text-white px-10 py-3.5 rounded-lg text-sm font-semibold shadow-xl shadow-primary/20 transition-all flex items-center gap-2"
                 >
                   {loading ? "Analyzing Description..." : "Generate Intelligence Report"}
                 </button>
                 {!selectedJob.jobDescription && <p className="mt-4 text-xs text-red-400 font-semibold italic">Add job description first</p>}
              </div>
            ) : (
              <div className="space-y-10 animate-in fade-in duration-700">
                {/* Executive Summary */}
                <div className="bg-primary/5 border border-primary/20 p-6 rounded-3xl border-dashed">
                  <div className="flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest mb-3">
                    <Target className="w-4 h-4" /> Executive Summary
                  </div>
                  <p className="text-base text-text-primary leading-relaxed font-medium">"{analysis.summary}"</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Red Flags */}
                  <div className="space-y-4">
                    <h5 className="text-xs font-semibold text-red-500 uppercase tracking-widest px-1">Red Flags & Concerns</h5>
                    <div className="space-y-3">
                      {(analysis.redFlags || []).length === 0 ? (
                        <div className="text-xs text-text-tertiary p-4 rounded-lg bg-emerald-500/5 italic">No red flags identified.</div>
                      ) : (
                        (analysis.redFlags || []).map((flag: any, i: number) => (
                           <div key={i} className="bg-red-500/5 border border-red-500/10 p-4 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                 <p className="text-xs font-black text-red-600 uppercase">Concern {i+1}</p>
                                 <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${flag.severity === 'high' ? 'bg-red-500 text-white' : 'bg-red-200 text-red-800'}`}>{flag.severity}</span>
                              </div>
                              <p className="text-sm text-text-primary font-semibold mb-1 leading-tight">{flag.flag}</p>
                              <p className="text-xs text-text-secondary leading-normal italic">Meaning: {flag.meaning}</p>
                           </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Green Flags */}
                  <div className="space-y-4">
                    <h5 className="text-xs font-semibold text-emerald-500 uppercase tracking-widest px-1">Green Flags & Upsides</h5>
                    <div className="space-y-3">
                      {(analysis.greenFlags || []).map((flag: any, i: number) => (
                        <div key={i} className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-lg">
                           <div className="flex items-center gap-2 mb-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-500" />
                              <p className="text-xs font-black text-emerald-600 uppercase">Upside {i+1}</p>
                           </div>
                           <p className="text-sm text-text-primary font-semibold mb-1 leading-tight">{flag.flag}</p>
                           <p className="text-xs text-text-secondary leading-normal italic">Context: {flag.meaning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border-subtle pt-8">
                  <div className="bg-bg-surface-elevated p-4 rounded-lg text-center">
                    <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-widest mb-1">Salary Status</p>
                    <p className="text-xs font-semibold text-text-primary">{analysis.salaryAssessment}</p>
                  </div>
                  <div className="bg-bg-surface-elevated p-4 rounded-lg text-center">
                    <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-widest mb-1">Requirements</p>
                    <p className="text-xs font-semibold text-text-primary">{analysis.requirementsRealism}</p>
                  </div>
                  <div className="bg-bg-surface-elevated p-4 rounded-lg text-center">
                    <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-widest mb-1">Work-Life</p>
                    <p className="text-xs font-semibold text-text-primary">{analysis.workLifeBalance}</p>
                  </div>
                </div>

                <div className="bg-amber-500 border border-amber-600 p-5 rounded-3xl flex items-start gap-4">
                  <div className="bg-white/20 p-2 rounded-md text-white">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h6 className="text-xs font-black text-white uppercase tracking-widest leading-none mb-2">Top concern to investigate</h6>
                    <p className="text-sm text-amber-50 font-semibold leading-relaxed">{analysis.topConcern}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function OutreachTab({ jobs, selectedJob, setJobId }: { jobs: IJob[], selectedJob: any, setJobId: (id: string) => void }) {
  const [generating, setGenerating] = useState(false);
  const [email, setEmail] = useState<string>(selectedJob?.coldEmail || "");

  useEffect(() => {
    setEmail(selectedJob?.coldEmail || "");
  }, [selectedJob]);

  const generateEmail = async () => {
    if (!selectedJob) return;
    setGenerating(true);
    try {
      const res = await fetch(`/api/jobs/${selectedJob._id}/cold-email`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEmail(data.coldEmail);
      toast.success("Outreach message generated!");
    } catch (err: any) {
      toast.error(err.message || "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(email);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Job Picker */}
      <div className="lg:col-span-4 space-y-4">
        <h4 className="text-xs font-semibold text-text-tertiary uppercase tracking-widest pl-1 mb-2">Context for Outreach</h4>
        <div className="space-y-2 max-h-150 overflow-y-auto no-scrollbar pb-10">
          {jobs.map(job => (
            <button
              key={job._id.toString()}
              onClick={() => setJobId(job._id.toString())}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                selectedJob?._id.toString() === job._id.toString()
                ? "bg-primary/10 border-primary shadow-sm"
                : "bg-bg-surface border-border-subtle hover:border-primary/30"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                 <p className={`text-[10px] font-semibold uppercase tracking-widest ${selectedJob?._id.toString() === job._id.toString() ? "text-primary" : "text-text-tertiary"}`}>
                  {job.company }
                </p>
                {job.coldEmail && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Email generated" />}
              </div>
              <h5 className="text-sm font-semibold text-text-primary truncate">{job.title}</h5>
            </button>
          ))}
        </div>
      </div>

      {/* Message Output */}
      <div className="lg:col-span-8">
        {!selectedJob ? (
          <div className="h-full bg-bg-surface border border-border-subtle border-dashed rounded-3xl flex flex-col items-center justify-center p-12 text-center">
            <Mail className="w-12 h-12 text-text-tertiary mb-4 opacity-20" />
            <p className="text-sm text-text-tertiary font-semibold lowercase tracking-widest">Select a target job</p>
          </div>
        ) : (
          <div className="bg-bg-surface border border-border-subtle rounded-3xl p-8 shadow-sm">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 pb-6 border-b border-border-subtle">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-text-primary tracking-tight">Cold Professional Outreach</h3>
                    <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-widest leading-none mt-1">Short, Human, Effective</p>
                  </div>
                </div>
                {email && (
                  <button onClick={generateEmail} disabled={generating} className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center justify-center gap-1.5 transition-all w-full sm:w-auto p-2 bg-primary/5 sm:bg-transparent rounded-lg">
                     <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} /> 
                     {generating ? 'Regenerating...' : 'Regenerate'}
                  </button>
                )}
             </div>

             {!email ? (
               <div className="text-center py-24 bg-bg-surface-elevated/30 rounded-lg flex flex-col items-center border border-dashed border-border-default">
                  <Zap className="w-12 h-12 text-primary mb-6 opacity-30 shadow-primary/20 shadow-xl" />
                  <h4 className="text-xl font-black text-text-primary mb-3">Skip the line with AI outreach</h4>
                  <p className="text-sm text-text-secondary max-w-sm mb-10 leading-relaxed font-medium">
                    We'll draft a concise, human-toned message tailored specifically to <span className="text-primary font-semibold">{selectedJob.company }</span> using your strongest matching skills.
                  </p>
                  <button 
                    onClick={generateEmail}
                    disabled={generating || !selectedJob.jobDescription}
                    className="bg-primary hover:bg-primary-hover text-white px-12 py-4 rounded-lg text-sm font-black shadow-2xl shadow-primary/30 transition-all flex items-center gap-3"
                  >
                    {generating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    Compose Outreach Message
                  </button>
                  {!selectedJob.jobDescription && <p className="mt-4 text-xs text-red-400 font-semibold italic">Missing job description</p>}
               </div>
             ) : (
               <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
               >
                  <div className="bg-bg-surface-elevated border border-border-subtle p-8 rounded-3xl relative group shadow-inner min-h-75">
                     <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={copyEmail} className="p-2 bg-white dark:bg-bg-surface border border-border-default rounded-md shadow-sm text-text-secondary hover:text-primary transition-colors">
                           <Copy className="w-4 h-4" />
                        </button>
                     </div>
                     <p className="text-[10px] items-center gap-1.5 flex font-black text-text-tertiary uppercase tracking-widest mb-6">
                       <MinusCircle className="w-3 h-3 text-emerald-500" /> Professional Body
                     </p>
                     <div className="text-sm text-text-primary font-medium leading-[1.8] whitespace-pre-wrap selection:bg-primary/20">
                        {email}
                     </div>
                  </div>

                  <div className="flex gap-4">
                     <button onClick={copyEmail} className="flex-1 py-4 bg-primary text-white font-black rounded-lg shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2">
                        <Copy className="w-4 h-4" /> Copy Message Body
                     </button>
                  </div>
                  
                  <div className="bg-bg-surface-elevated/50 p-6 rounded-lg border border-border-subtle">
                     <h5 className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-3">AI Expert Feedback</h5>
                     <div className="space-y-3">
                        <div className="flex gap-3 items-center">
                           <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"><CheckCircle2 className="w-3 h-3" /></div>
                           <p className="text-xs text-text-secondary font-medium italic">"Concise length (under 120 words) favored by recruiters."</p>
                        </div>
                        <div className="flex gap-3 items-center">
                           <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"><CheckCircle2 className="w-3 h-3" /></div>
                           <p className="text-xs text-text-secondary font-medium italic">"Includes soft references to specific company  challenges."</p>
                        </div>
                     </div>
                  </div>
               </motion.div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
