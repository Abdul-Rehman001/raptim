import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Job } from "@/models/Job";
import mongoose from "mongoose";
import { IJob } from "@/types";
import { 
  Play, 
  Calendar,
  Trophy,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export const revalidate = 30;

async function getAnalyticsData(userId: string) {
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) return null;
  await dbConnect();

  const jobs = await Job.find({ userId }).lean();
  const total = jobs.length;

  const appliedJobs = jobs.filter((j: IJob) => j.status !== "saved");
  const responses = jobs.filter((j: IJob) => ["interview", "offer", "rejected"].includes(j.status));
  const interviews = jobs.filter((j: IJob) => ["interview", "offer"].includes(j.status)); 
  const offers = jobs.filter((j: IJob) => j.status === "offer");

  const responseRate = appliedJobs.length > 0 ? ((responses.length / appliedJobs.length) * 100).toFixed(1) : "0.0";
  const offerRate = appliedJobs.length > 0 ? ((offers.length / appliedJobs.length) * 100).toFixed(1) : "0.0";

  let totalTimeToInterview = 0;
  let interviewCountWithDates = 0;
  
  interviews.forEach((j: IJob) => {
     if (j.appliedDate && j.updatedAt) {
        const diffTime = Math.abs(new Date(j.updatedAt).getTime() - new Date(j.appliedDate).getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        totalTimeToInterview += diffDays;
        interviewCountWithDates++;
     }
  });
  const timeToInterview = interviewCountWithDates > 0 ? Math.round(totalTimeToInterview / interviewCountWithDates) : 0;

  const cvRate = appliedJobs.length > 0 ? ((interviews.length / appliedJobs.length) * 100).toFixed(1) : "0.0";
  const intRate = interviews.length > 0 ? ((offers.length / interviews.length) * 100).toFixed(1) : "0.0";
  const successRate = appliedJobs.length > 0 ? ((offers.length / appliedJobs.length) * 100).toFixed(1) : "0.0";

  const appliedWidth = total > 0 ? `${(appliedJobs.length / total) * 100}%` : "0%";
  const interviewWidth = total > 0 ? `${(interviews.length / total) * 100}%` : "0%";
  const offerWidth = total > 0 ? `${(offers.length / total) * 100}%` : "0%";

  const now = new Date();
  const weeks = [0, 0, 0, 0];
  jobs.forEach((j: IJob) => {
    const diffTime = Math.abs(now.getTime() - new Date((j as any /* eslint-disable-line @typescript-eslint/no-explicit-any */).createdAt).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) weeks[3]++;
    else if (diffDays <= 14) weeks[2]++;
    else if (diffDays <= 21) weeks[1]++;
    else if (diffDays <= 28) weeks[0]++;
  });
  const maxWeek = Math.max(...weeks, 1);
  const weeklyHeights = weeks.map(w => Math.round((w / maxWeek) * 100)); 

  const remote = jobs.filter((j: IJob) => j.location && j.location.toLowerCase().includes('remote')).length;
  const onSite = jobs.filter((j: IJob) => j.location && !j.location.toLowerCase().includes('remote')).length;
  const unspecified = total - remote - onSite;
  
  const remotePct = total > 0 ? Math.round((remote / total) * 100) : 0;
  const onSitePct = total > 0 ? Math.round((onSite / total) * 100) : 0;
  const unspecifiedPct = total > 0 ? Math.round((unspecified / total) * 100) : 0;

  return { 
     total, applied: appliedJobs.length, interview: interviews.length, offer: offers.length,
     responseRate, offerRate, timeToInterview, 
     cvRate, intRate, successRate,
     appliedWidth, interviewWidth, offerWidth,
     weeklyHeights,
     remotePct, onSitePct, unspecifiedPct
  };
}

export default async function AnalyticsPage() {
  const session = await auth();
  const data = await getAnalyticsData(session?.user?.id || "");
  const monthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Analytics Overview</h1>
          <p className="text-text-secondary mt-1 font-medium">Track your application performance and conversion funnel</p>
        </div>
        <div className="flex items-center gap-3 bg-bg-surface border border-border-subtle rounded-xl p-1 shadow-sm">
           <button className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-surface-hover transition-colors">
              <ChevronLeft className="w-5 h-5" />
           </button>
           <span className="text-sm font-bold text-text-primary px-2">{monthName}</span>
           <button className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-surface-hover transition-colors">
              <ChevronRight className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-bg-surface border border-border-subtle p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:border-border-default transition-all">
           <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                 <Play className="w-5 h-5 ml-1" />
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">+2.5%</span>
           </div>
           <p className="text-xs text-text-secondary font-medium tracking-wide mb-1">Response Rate</p>
           <h3 className="text-3xl font-extrabold text-text-primary">{data?.responseRate || "0.0"}%</h3>
        </div>

        <div className="bg-bg-surface border border-border-subtle p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:border-border-default transition-all">
           <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                 <Calendar className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-text-secondary bg-bg-surface-elevated px-2 py-1 rounded-full">avg</span>
           </div>
           <p className="text-xs text-text-secondary font-medium tracking-wide mb-1">Time to Interview</p>
           <h3 className="text-3xl font-extrabold text-text-primary">{data?.timeToInterview || 0} Days</h3>
        </div>

        <div className="bg-bg-surface border border-border-subtle p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:border-border-default transition-all">
           <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-400">
                 <Trophy className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">&gt;0%</span>
           </div>
           <p className="text-xs text-text-secondary font-medium tracking-wide mb-1">Offer Rate</p>
           <h3 className="text-3xl font-extrabold text-text-primary">{data?.offerRate || "0.0"}%</h3>
        </div>
      </div>

      {/* Application Funnel */}
      <div className="bg-bg-surface border border-border-subtle p-6 rounded-2xl">
         <div className="flex items-center justify-between mb-8">
            <h3 className="text-base font-extrabold text-text-primary">Application Funnel</h3>
            <span className="text-xs font-bold text-text-tertiary tracking-widest uppercase">Last 30 Days</span>
         </div>
         
         <div className="relative pt-2 pb-6">
            <div className="h-14 w-full bg-border-subtle rounded-xl overflow-hidden flex relative">
               <div className="h-full bg-primary/40 border-r border-[#1a142e] flex items-center px-4 relative z-10" style={{width: "100%"}}>
                  <span className="text-xs font-bold text-text-primary drop-shadow-md">{data?.total || 0} Saved</span>
               </div>
            </div>
            {/* Overlay layers mimicking funnel segments */}
            <div className={`absolute top-2 left-0 h-14 bg-primary border-r border-[#1a142e] flex items-center px-4 z-20 transition-all rounded-l-xl ${data?.applied === 0 ? 'hidden' : ''}`} style={{width: data?.appliedWidth}}>
               <span className="text-xs font-bold text-text-primary drop-shadow-md relative z-10 overflow-hidden whitespace-nowrap">{data?.applied} Applied</span>
               <div className="absolute -right-2.5 top-0 bottom-0 w-8 bg-linear-to-r from-primary to-transparent z-0 opacity-50 skew-x-12" />
            </div>
            
            <div className={`absolute top-2 left-0 h-14 bg-purple-400 border-r border-[#1a142e] flex items-center px-4 z-30 transition-all rounded-l-xl ${data?.interview === 0 ? 'hidden' : ''}`} style={{width: data?.interviewWidth}}>
               <span className="text-xs font-bold text-[#13101d] drop-shadow-sm relative z-10 overflow-hidden whitespace-nowrap">{data?.interview} Interview</span>
               <div className="absolute right-[-10px] top-0 bottom-0 w-8 bg-gradient-to-r from-purple-400 to-transparent z-0 opacity-50 skew-x-12" />
            </div>

            <div className={`absolute top-2 left-0 h-14 bg-white flex items-center px-4 z-40 transition-all rounded-l-xl ${data?.offer === 0 ? 'hidden' : ''}`} style={{width: data?.offerWidth}}>
               <span className="text-xs font-bold text-[#13101d] relative z-10 overflow-hidden whitespace-nowrap">{data?.offer} Offers</span>
            </div>
            
            {/* Funnel metrics - Responsive flex layout to prevent overlapping */}
            <div className="flex flex-wrap gap-x-6 gap-y-3 mt-5 text-[10px] font-bold text-text-tertiary uppercase tracking-wider p-3 bg-bg-surface-elevated sm:bg-transparent sm:p-0 sm:border-0 rounded-lg border border-border-subtle sm:justify-between items-center sm:pt-2">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary/40" />
                  <span>100% Total</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>{data?.cvRate}% CV Rate</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400" />
                  <span>{data?.intRate}% Int. Rate</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white" />
                  <span>{data?.successRate}% Success</span>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Heatmap */}
        <div className="bg-bg-surface border border-border-subtle p-6 rounded-2xl flex flex-col justify-between">
           <h3 className="text-base font-extrabold text-text-primary mb-6">Weekly Activity</h3>
           <div className="flex-1 flex flex-col justify-end">
              <div className="flex items-end gap-2 h-40 border-b border-border-subtle pb-2 w-full justify-between">
                 <div className="w-[15%] bg-primary/20 rounded-t-lg relative group cursor-pointer hover:bg-primary/40 transition-colors" style={{height: `${data?.weeklyHeights[0] || 5}%`}}></div>
                 <div className="w-[15%] bg-primary/40 rounded-t-lg relative group cursor-pointer hover:bg-primary/60 transition-colors" style={{height: `${data?.weeklyHeights[1] || 5}%`}}></div>
                 <div className="w-[15%] bg-primary/60 rounded-t-lg relative group cursor-pointer hover:bg-primary/80 transition-colors" style={{height: `${data?.weeklyHeights[2] || 5}%`}}></div>
                 <div className="w-[15%] bg-primary rounded-t-lg relative group cursor-pointer shadow-[0_0_15px_rgba(166,137,250,0.3)]" style={{height: `${data?.weeklyHeights[3] || 5}%`}}></div>
              </div>
              <div className="flex justify-between text-[10px] font-bold tracking-widest text-text-tertiary mt-2">
                 <span>W1</span><span>W2</span><span>W3</span><span>W4</span>
              </div>
           </div>
        </div>

         {/* Job Locations */}
         <div className="bg-bg-surface border border-border-subtle p-6 rounded-2xl">
            <h3 className="text-base font-extrabold text-text-primary mb-6">Location Types</h3>
            <div className="space-y-6">
               <div>
                  <div className="flex justify-between text-xs font-bold text-text-primary mb-3">
                     <span>Remote</span>
                     <span className="text-text-secondary">{data?.remotePct}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-border-subtle rounded-full overflow-hidden">
                     <div className="h-full bg-primary rounded-full relative shadow-[0_0_10px_rgba(166,137,250,0.5)]" style={{width: `${data?.remotePct}%`}}></div>
                  </div>
               </div>
               
               <div>
                  <div className="flex justify-between text-xs font-bold text-text-primary mb-3">
                     <span>On-site / Hybrid</span>
                     <span className="text-text-secondary">{data?.onSitePct}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-border-subtle rounded-full overflow-hidden">
                     <div className="h-full bg-primary/60 rounded-full" style={{width: `${data?.onSitePct}%`}}></div>
                  </div>
               </div>

               <div>
                  <div className="flex justify-between text-xs font-bold text-text-primary mb-3">
                     <span>Unspecified</span>
                     <span className="text-text-secondary">{data?.unspecifiedPct}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-border-subtle rounded-full overflow-hidden">
                     <div className="h-full bg-primary/40 rounded-full" style={{width: `${data?.unspecifiedPct}%`}}></div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

