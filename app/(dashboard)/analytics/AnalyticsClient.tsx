"use client";

import { useState, useMemo } from "react";
import { isToday, isThisWeek, isThisMonth, subDays } from "date-fns";
import { IJob } from "@/types";
import {
  Play, Calendar, Trophy, Globe,
} from "lucide-react";
import { Dropdown } from "@/components/ui/Dropdown";
import { getPlatformIcon } from "@/lib/utils";

type TimeRange = "all" | "today" | "week" | "month" | "quarter";

const PLATFORM_COLORS = [
  "bg-violet-600",
  "bg-purple-500",
  "bg-fuchsia-400",
  "bg-pink-500",
  "bg-rose-400",
  "bg-orange-400",
  "bg-amber-400",
  "bg-emerald-400",
];

export function AnalyticsClient({ jobs: allJobs }: { jobs: IJob[] }) {
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [platformFilter, setPlatformFilter] = useState("all");

  // Unique platforms and counts
  const platformCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allJobs.forEach((j) => {
      const p = j.platform || "none";
      counts[p] = (counts[p] || 0) + 1;
    });
    return counts;
  }, [allJobs]);

  const platforms = useMemo(() => {
    return Object.keys(platformCounts).filter(p => p !== "none").sort();
  }, [platformCounts]);

  // Filtered jobs
  const jobs = useMemo(() => {
    let filtered = [...allJobs];

    // Time filter
    if (timeRange !== "all") {
      filtered = filtered.filter((j) => {
        if (!j.createdAt) return false;
        const date = new Date(j.createdAt);
        if (timeRange === "today") return isToday(date);
        if (timeRange === "week") return isThisWeek(date, { weekStartsOn: 1 });
        if (timeRange === "month") return isThisMonth(date);
        if (timeRange === "quarter") return date >= subDays(new Date(), 90);
        return true;
      });
    }

    // Platform filter
    if (platformFilter !== "all") {
      if (platformFilter === "none") {
        filtered = filtered.filter((j) => !j.platform);
      } else {
        filtered = filtered.filter((j) => j.platform === platformFilter);
      }
    }

    return filtered;
  }, [allJobs, timeRange, platformFilter]);

  // Compute analytics
  const total = jobs.length;
  const appliedJobs = jobs.filter((j) => j.status !== "saved");
  const responses = jobs.filter((j) => ["interview", "offer", "rejected"].includes(j.status));
  const interviews = jobs.filter((j) => ["interview", "offer"].includes(j.status));
  const offers = jobs.filter((j) => j.status === "offer");

  const responseRate = appliedJobs.length > 0 ? ((responses.length / appliedJobs.length) * 100).toFixed(1) : "0.0";
  const offerRate = appliedJobs.length > 0 ? ((offers.length / appliedJobs.length) * 100).toFixed(1) : "0.0";

  let totalTimeToInterview = 0;
  let interviewCountWithDates = 0;
  interviews.forEach((j) => {
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

  // Heatmap Data (last 90 days)
  const heatmapDays = useMemo(() => {
    return Array.from({ length: 90 }, (_, i) => {
      const date = subDays(new Date(), 89 - i);
      const count = jobs.filter(j => j.createdAt && new Date(j.createdAt).toDateString() === date.toDateString()).length;
      return { date, count };
    });
  }, [jobs]);

  const getHeatmapColor = (count: number) => {
    if (count === 0) return "bg-bg-surface-elevated";
    if (count === 1) return "bg-violet-200 dark:bg-violet-900/50";
    if (count <= 3) return "bg-violet-400 dark:bg-violet-700/70";
    return "bg-violet-600 dark:bg-violet-500";
  };

  // 12-Week Trend Graph
  const weeklyTrendData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const start = subDays(new Date(), (11 - i) * 7);
      const end = subDays(new Date(), (10 - i) * 7);
      const count = jobs.filter(j => j.createdAt && new Date(j.createdAt) >= start && new Date(j.createdAt) < end).length;
      return { weekLabel: `W${i+1}`, count };
    });
  }, [jobs]);
  const maxWeeklyCount = Math.max(...weeklyTrendData.map(d => d.count), 1);

  // Location breakdown
  const remote = jobs.filter((j) => j.location && j.location.toLowerCase().includes("remote")).length;
  const onSite = jobs.filter((j) => j.location && !j.location.toLowerCase().includes("remote")).length;
  const unspecified = total - remote - onSite;
  const remotePct = total > 0 ? Math.round((remote / total) * 100) : 0;
  const onSitePct = total > 0 ? Math.round((onSite / total) * 100) : 0;
  const unspecifiedPct = total > 0 ? Math.round((unspecified / total) * 100) : 0;

  // Platform breakdown
  const platformBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    allJobs.forEach((j) => {
      const p = j.platform || "No Platform";
      map[p] = (map[p] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], i) => ({
        name,
        count,
        pct: allJobs.length > 0 ? Math.round((count / allJobs.length) * 100) : 0,
        color: PLATFORM_COLORS[i % PLATFORM_COLORS.length],
      }));
  }, [allJobs]);

  const timeRanges: { id: TimeRange; label: string }[] = [
    { id: "all", label: "All Time" },
    { id: "today", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "month", label: "This Month" },
    { id: "quarter", label: "Last 90 Days" },
  ];

  const activeFilterCount = [
    timeRange !== "all" ? 1 : 0,
    platformFilter !== "all" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Analytics Overview</h1>
          <p className="text-text-secondary mt-1 font-medium">Track your application performance and conversion funnel</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg bg-bg-surface border border-border-subtle shadow-sm">
        {/* Time filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1 sm:mb-0">Period</span>
          <div className="flex flex-wrap gap-1">
            {timeRanges.map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  timeRange === t.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-surface-elevated"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="w-px h-6 bg-border-subtle hidden sm:block" />

        {/* Platform filter */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Platform</span>
          <div className="w-[180px]">
            <Dropdown
              value={platformFilter}
              onChange={setPlatformFilter}
              options={[
                { 
                  value: "all", 
                  label: <div className="flex justify-between items-center w-full"><span className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-text-tertiary" /> All Platforms</span><span className="text-[10px] bg-bg-surface-elevated px-1.5 py-0.5 rounded-full border border-border-subtle">{allJobs.length}</span></div> 
                },
                { 
                  value: "none", 
                  label: <div className="flex justify-between items-center w-full"><span className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-text-tertiary" /> No Platform</span><span className="text-[10px] bg-bg-surface-elevated px-1.5 py-0.5 rounded-full border border-border-subtle">{platformCounts["none"] || 0}</span></div> 
                },
                { value: "divider", label: "" },
                ...platforms.map(p => ({
                  value: p,
                  label: (
                    <div className="flex justify-between items-center w-full">
                      <span className="flex items-center gap-2 truncate max-w-[100px]">
                        {getPlatformIcon(p) ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={getPlatformIcon(p)!} alt="" className="w-3.5 h-3.5 rounded-sm shrink-0" />
                        ) : (
                          <Globe className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                        )}
                        <span className="truncate">{p}</span>
                      </span>
                      <span className="text-[10px] bg-bg-surface-elevated px-1.5 py-0.5 rounded-full border border-border-subtle shrink-0">
                        {platformCounts[p] || 0}
                      </span>
                    </div>
                  )
                }))
              ]}
            />
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-primary font-semibold">
              {total} of {allJobs.length} jobs shown
            </span>
            <button
              onClick={() => { setTimeRange("all"); setPlatformFilter("all"); }}
              className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-bg-surface border border-border-subtle p-6 rounded-lg shadow-sm relative overflow-hidden group hover:border-border-default transition-all">
           <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-md bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                 <Play className="w-5 h-5 ml-1" />
              </div>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">+{responseRate}%</span>
           </div>
           <p className="text-xs text-text-secondary font-medium tracking-wide mb-1">Response Rate</p>
           <h3 className="text-3xl font-semibold text-text-primary">{responseRate}%</h3>
        </div>

        <div className="bg-bg-surface border border-border-subtle p-6 rounded-lg shadow-sm relative overflow-hidden group hover:border-border-default transition-all">
           <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                 <Calendar className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-text-secondary bg-bg-surface-elevated px-2 py-1 rounded-full">avg</span>
           </div>
           <p className="text-xs text-text-secondary font-medium tracking-wide mb-1">Time to Interview</p>
           <h3 className="text-3xl font-semibold text-text-primary">{timeToInterview} Days</h3>
        </div>

        <div className="bg-bg-surface border border-border-subtle p-6 rounded-lg shadow-sm relative overflow-hidden group hover:border-border-default transition-all">
           <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-md bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-400">
                 <Trophy className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">&gt;{offerRate}%</span>
           </div>
           <p className="text-xs text-text-secondary font-medium tracking-wide mb-1">Offer Rate</p>
           <h3 className="text-3xl font-semibold text-text-primary">{offerRate}%</h3>
        </div>
      </div>

      {/* Application Funnel */}
      <div className="bg-bg-surface border border-border-subtle p-6 rounded-lg">
         <div className="flex items-center justify-between mb-8">
            <h3 className="text-base font-semibold text-text-primary">Application Funnel</h3>
            <span className="text-xs font-semibold text-text-tertiary tracking-widest uppercase">
              {timeRange === "all" ? "All Time" : timeRange === "today" ? "Today" : timeRange === "week" ? "This Week" : timeRange === "month" ? "This Month" : "Last 90 Days"}
            </span>
         </div>
         
         <div className="relative pt-2 pb-6">
            <div className="h-14 w-full bg-bg-surface-elevated rounded-xl overflow-hidden flex relative border border-border-subtle">
               <div className="h-full bg-violet-100/50 dark:bg-violet-950/30 border-r border-border-subtle flex items-center px-4 relative z-10" style={{width: "100%"}}>
                  <span className="text-xs font-bold text-violet-900 dark:text-violet-200 drop-shadow-sm">{total} Saved</span>
               </div>
            </div>
            <div className={`absolute top-2 left-0 h-14 bg-violet-500 border-r border-violet-600 flex items-center px-4 z-20 transition-all rounded-l-xl ${appliedJobs.length === 0 ? 'hidden' : ''}`} style={{width: appliedWidth}}>
               <span className="text-xs font-bold text-white drop-shadow-md relative z-10 overflow-hidden whitespace-nowrap">{appliedJobs.length} Applied</span>
               <div className="absolute -right-2.5 top-0 bottom-0 w-8 bg-gradient-to-r from-violet-500 to-transparent z-0 opacity-50 skew-x-12" />
            </div>
            
            <div className={`absolute top-2 left-0 h-14 bg-fuchsia-400 border-r border-fuchsia-500 flex items-center px-4 z-30 transition-all rounded-l-xl ${interviews.length === 0 ? 'hidden' : ''}`} style={{width: interviewWidth}}>
               <span className="text-xs font-bold text-white drop-shadow-md relative z-10 overflow-hidden whitespace-nowrap">{interviews.length} Interview</span>
               <div className="absolute right-[-10px] top-0 bottom-0 w-8 bg-gradient-to-r from-fuchsia-400 to-transparent z-0 opacity-50 skew-x-12" />
            </div>

            <div className={`absolute top-2 left-0 h-14 bg-amber-400 flex items-center px-4 z-40 transition-all rounded-l-xl ${offers.length === 0 ? 'hidden' : ''}`} style={{width: offerWidth}}>
               <span className="text-xs font-bold text-amber-950 drop-shadow-sm relative z-10 overflow-hidden whitespace-nowrap">{offers.length} Offers</span>
            </div>
            
            <div className="flex flex-wrap gap-x-6 gap-y-3 mt-5 text-[10px] font-bold text-text-tertiary uppercase tracking-wider p-3 bg-bg-surface-elevated sm:bg-transparent sm:p-0 sm:border-0 rounded-lg border border-border-subtle sm:justify-between items-center sm:pt-2">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-violet-200" />
                  <span>100% Total</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-violet-500" />
                  <span>{cvRate}% CV Rate</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-fuchsia-400" />
                  <span>{intRate}% Int. Rate</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>{successRate}% Success</span>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Heatmap */}
        <div className="bg-bg-surface border border-border-subtle p-6 rounded-lg shadow-sm flex flex-col justify-between">
           <h3 className="text-base font-semibold text-text-primary mb-4">90-Day Activity Heatmap</h3>
           <div className="w-full flex-1 flex flex-col justify-end">
             <div className="grid grid-cols-[repeat(13,_1fr)] gap-1 mb-2">
               {heatmapDays.map((day, i) => (
                 <div 
                   key={i} 
                   className={`w-full aspect-square rounded-[2px] ${getHeatmapColor(day.count)} transition-colors hover:ring-1 hover:ring-violet-400`} 
                   title={`${day.count} applications on ${day.date.toDateString()}`} 
                 />
               ))}
             </div>
             <div className="flex justify-between items-center text-[10px] font-semibold text-text-tertiary mt-2">
               <span>90 days ago</span>
               <div className="flex items-center gap-1">
                 <span>Less</span>
                 <div className="w-2 h-2 bg-bg-surface-elevated rounded-[1px]"></div>
                 <div className="w-2 h-2 bg-violet-200 dark:bg-violet-900/50 rounded-[1px]"></div>
                 <div className="w-2 h-2 bg-violet-400 dark:bg-violet-700/70 rounded-[1px]"></div>
                 <div className="w-2 h-2 bg-violet-600 dark:bg-violet-500 rounded-[1px]"></div>
                 <span>More</span>
               </div>
             </div>
           </div>
        </div>

        {/* 12-Week Trend Graph */}
        <div className="bg-bg-surface border border-border-subtle p-6 rounded-lg flex flex-col justify-between shadow-sm">
           <h3 className="text-base font-semibold text-text-primary mb-4">12-Week Trend</h3>
           <div className="flex-1 flex flex-col justify-end">
              <div className="h-32 w-full border-b border-border-subtle pb-2 relative flex items-end justify-between">
                {weeklyTrendData.map((d, i) => {
                  const heightPct = (d.count / maxWeeklyCount) * 100;
                  return (
                    <div key={i} className="w-[6%] relative group flex justify-center h-full items-end">
                      <div 
                        className="w-full bg-violet-200 dark:bg-violet-900/30 group-hover:bg-violet-400 dark:group-hover:bg-violet-700 transition-colors rounded-t-sm relative"
                        style={{ height: `${Math.max(heightPct, 4)}%` }}
                      >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          {d.count}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between text-[10px] font-bold tracking-wider text-text-tertiary mt-2">
                 <span>12W Ago</span>
                 <span>Now</span>
              </div>
           </div>
        </div>

        {/* Platform Distribution */}
        <div className="bg-bg-surface border border-border-subtle p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-text-primary">Platform Distribution</h3>
            <Globe className="w-4 h-4 text-text-tertiary" />
          </div>
          {platformBreakdown.length === 0 ? (
            <p className="text-sm text-text-tertiary text-center py-8">No platform data yet</p>
          ) : (
            <div className="space-y-4">
              {platformBreakdown.map((p) => (
                <div key={p.name}>
                  <div className="flex justify-between text-xs font-bold text-text-primary mb-2">
                    <span className="flex items-center gap-2">
                       {getPlatformIcon(p.name) ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={getPlatformIcon(p.name)!} alt="" className="w-4 h-4 rounded-sm" />
                        ) : (
                          <Globe className="w-4 h-4 text-text-tertiary" />
                        )}
                       {p.name}
                    </span>
                    <span className="text-text-secondary">{p.count} ({p.pct}%)</span>
                  </div>
                  <div className="h-2.5 w-full bg-border-subtle rounded-full overflow-hidden">
                    <div
                      className={`h-full ${p.color} rounded-full transition-all duration-500`}
                      style={{ width: `${p.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Job Locations */}
        <div className="bg-bg-surface border border-border-subtle p-6 rounded-lg shadow-sm">
            <h3 className="text-base font-semibold text-text-primary mb-6">Location Types</h3>
            <div className="space-y-6">
               <div>
                  <div className="flex justify-between text-xs font-bold text-text-primary mb-3">
                     <span>Remote</span>
                     <span className="text-text-secondary">{remotePct}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-border-subtle rounded-full overflow-hidden">
                     <div className="h-full bg-violet-600 rounded-full relative" style={{width: `${remotePct}%`}}></div>
                  </div>
               </div>
               
               <div>
                  <div className="flex justify-between text-xs font-bold text-text-primary mb-3">
                     <span>On-site / Hybrid</span>
                     <span className="text-text-secondary">{onSitePct}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-border-subtle rounded-full overflow-hidden">
                     <div className="h-full bg-purple-500 rounded-full" style={{width: `${onSitePct}%`}}></div>
                  </div>
               </div>

               <div>
                  <div className="flex justify-between text-xs font-bold text-text-primary mb-3">
                     <span>Unspecified</span>
                     <span className="text-text-secondary">{unspecifiedPct}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-border-subtle rounded-full overflow-hidden">
                     <div className="h-full bg-fuchsia-400 rounded-full" style={{width: `${unspecifiedPct}%`}}></div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
