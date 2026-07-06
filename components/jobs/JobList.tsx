"use client";

import { useState, useMemo } from "react";
import { format, isToday, isThisWeek, isThisMonth } from "date-fns";
import {
  Edit2, Trash2, MapPin, Banknote, Building2, AlertTriangle, Loader2,
  ChevronLeft, ChevronRight, ArrowUpDown, Filter, X, ChevronDown
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import Link from "next/link";
import { EditJobModal } from "./EditJobModal";
import { IJob } from "@/types";

interface JobListProps {
  initialJobs: IJob[];
}

const ITEMS_PER_PAGE = 10;

const PLATFORM_ICONS: Record<string, string> = {
  LinkedIn: "🔗",
  Indeed: "📋",
  Glassdoor: "🪟",
  Wellfound: "🚀",
  "Y Combinator": "🟧",
  Greenhouse: "🌱",
  Lever: "⚡",
  Workday: "💼",
};

type SortOption = "newest" | "oldest" | "company-az" | "company-za" | "match-high" | "match-low";
type TimeFilter = "all" | "today" | "week" | "month";

export function JobList({ initialJobs }: JobListProps) {
  const router = useRouter();
  const triggerRefresh = useAppStore((s) => s.triggerRefresh);
  
  // Filters & sort state
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [isPlatformDropdownOpen, setIsPlatformDropdownOpen] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  
  // Delete / edit state
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingJob, setEditingJob] = useState<IJob | null>(null);

  // Derive platform counts and unique platforms
  const platformCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    initialJobs.forEach((j) => {
      const p = j.platform || "none";
      counts[p] = (counts[p] || 0) + 1;
    });
    return counts;
  }, [initialJobs]);

  const platforms = useMemo(() => {
    return Object.keys(platformCounts).filter(p => p !== "none").sort();
  }, [platformCounts]);

  // Filter + sort pipeline
  const filteredJobs = useMemo(() => {
    let jobs = [...initialJobs];

    // Status filter
    if (statusFilter !== "all") {
      jobs = jobs.filter((j) => j.status === statusFilter);
    }

    // Time filter
    if (timeFilter !== "all") {
      jobs = jobs.filter((j) => {
        if (!j.createdAt) return false;
        const date = new Date(j.createdAt);
        if (timeFilter === "today") return isToday(date);
        if (timeFilter === "week") return isThisWeek(date, { weekStartsOn: 1 });
        if (timeFilter === "month") return isThisMonth(date);
        return true;
      });
    }

    // Platform filter
    if (platformFilter !== "all") {
      if (platformFilter === "none") {
        jobs = jobs.filter((j) => !j.platform);
      } else {
        jobs = jobs.filter((j) => j.platform === platformFilter);
      }
    }

    // Sort
    jobs.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case "oldest":
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case "company-az":
          return a.company.localeCompare(b.company);
        case "company-za":
          return b.company.localeCompare(a.company);
        case "match-high":
          return (b.matchScore ?? -1) - (a.matchScore ?? -1);
        case "match-low":
          return (a.matchScore ?? -1) - (b.matchScore ?? -1);
        default:
          return 0;
      }
    });

    return jobs;
  }, [initialJobs, statusFilter, timeFilter, platformFilter, sortBy]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedJobs = filteredJobs.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  const handleFilterChange = (setter: (v: string) => void, value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  const confirmDelete = async () => {
    if (!jobToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/jobs/${jobToDelete}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete job");
      toast.success("Job application deleted");
      triggerRefresh();
      router.refresh();
      setJobToDelete(null);
    } catch {
      toast.error("Failed to delete job");
    } finally {
      setIsDeleting(false);
    }
  };

  const statusTabs = [
    { id: "all", label: "All Applications" },
    { id: "saved", label: "Saved" },
    { id: "applied", label: "Applied" },
    { id: "interview", label: "Interview" },
    { id: "offer", label: "Offer" },
    { id: "rejected", label: "Rejected" },
  ];

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      saved: "bg-bg-surface-elevated text-text-secondary border-border-default",
      applied: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      interview: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      offer: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      rejected: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return map[status] || map.saved;
  };

  const activeFilterCount = [
    timeFilter !== "all" ? 1 : 0,
    platformFilter !== "all" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6 mt-12 bg-bg-surface border border-border-subtle rounded-lg p-6 shadow-sm relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">All Applications List</h2>
          <p className="text-sm text-text-secondary mt-1">Manage, filter, and edit your specific jobs.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Sort dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold border border-border-default bg-bg-surface-elevated text-text-secondary hover:text-text-primary hover:border-border-subtle transition-colors">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-bg-surface border border-border-subtle rounded-lg shadow-xl z-50 py-1 hidden group-hover:block">
              {([
                { id: "newest", label: "Newest first" },
                { id: "oldest", label: "Oldest first" },
                { id: "company-az", label: "Company A → Z" },
                { id: "company-za", label: "Company Z → A" },
                { id: "match-high", label: "Match ↑ High" },
                { id: "match-low", label: "Match ↓ Low" },
              ] as { id: SortOption; label: string }[]).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSortBy(opt.id)}
                  className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors ${
                    sortBy === opt.id
                      ? "bg-primary/10 text-primary"
                      : "text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold border transition-colors ${
              showFilters || activeFilterCount > 0
                ? "border-primary bg-primary/10 text-primary"
                : "border-border-default bg-bg-surface-elevated text-text-secondary hover:text-text-primary hover:border-border-subtle"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Advanced Filters Bar */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg bg-bg-surface-elevated border border-border-subtle animate-in fade-in duration-200">
          {/* Time filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1 sm:mb-0">Time</span>
            <div className="flex flex-wrap gap-1">
              {(["all", "today", "week", "month"] as TimeFilter[]).map((t) => (
                <button
                  key={t}
                  onClick={() => handleFilterChange(setTimeFilter as (v: string) => void, t)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                    timeFilter === t
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-surface"
                  }`}
                >
                  {t === "all" ? "All Time" : t === "today" ? "Today" : t === "week" ? "This Week" : "This Month"}
                </button>
              ))}
            </div>
          </div>

          <div className="w-px h-6 bg-border-subtle hidden sm:block" />

          {/* Platform filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Platform</span>
            
            <div className="relative">
              <button 
                onClick={() => setIsPlatformDropdownOpen(!isPlatformDropdownOpen)}
                className="flex items-center justify-between min-w-[160px] px-3 py-1.5 rounded-md text-xs font-semibold bg-bg-surface border border-border-default text-text-primary hover:border-primary/50 transition-colors"
              >
                <span className="truncate flex items-center gap-2">
                  {platformFilter === "all" ? "All Platforms" : platformFilter === "none" ? "No Platform" : platformFilter}
                  <span className="text-[10px] bg-bg-surface-elevated border border-border-subtle text-text-secondary px-1.5 py-0.5 rounded-full font-bold leading-none">
                    {platformFilter === "all" ? initialJobs.length : platformCounts[platformFilter] || 0}
                  </span>
                </span>
                <ChevronDown className="w-3 h-3 text-text-tertiary ml-2 shrink-0" />
              </button>

              {isPlatformDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsPlatformDropdownOpen(false)} />
                  <div className="absolute top-full left-0 mt-1 w-full min-w-[180px] max-h-64 overflow-y-auto bg-bg-surface border border-border-subtle rounded-lg shadow-xl z-50 py-1 flex flex-col scrollbar-hide animate-in fade-in slide-in-from-top-1 duration-150">
                    <button
                      onClick={() => { handleFilterChange(setPlatformFilter, "all"); setIsPlatformDropdownOpen(false); }}
                      className={`flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors ${platformFilter === "all" ? "bg-primary/10 text-primary" : "text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary"}`}
                    >
                      <span>All Platforms</span>
                      <span className="text-[10px] bg-bg-surface-elevated px-1.5 py-0.5 rounded-full border border-border-subtle">{initialJobs.length}</span>
                    </button>
                    
                    <button
                      onClick={() => { handleFilterChange(setPlatformFilter, "none"); setIsPlatformDropdownOpen(false); }}
                      className={`flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors ${platformFilter === "none" ? "bg-primary/10 text-primary" : "text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary"}`}
                    >
                      <span>No Platform</span>
                      <span className="text-[10px] bg-bg-surface-elevated px-1.5 py-0.5 rounded-full border border-border-subtle">{platformCounts["none"] || 0}</span>
                    </button>

                    {platforms.length > 0 && <div className="h-px bg-border-subtle my-1 mx-2" />}

                    {platforms.map(p => (
                      <button
                        key={p}
                        onClick={() => { handleFilterChange(setPlatformFilter, p); setIsPlatformDropdownOpen(false); }}
                        className={`flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors ${platformFilter === p ? "bg-primary/10 text-primary" : "text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary"}`}
                      >
                        <span className="truncate max-w-[120px] text-left">{p}</span>
                        <span className="text-[10px] bg-bg-surface-elevated px-1.5 py-0.5 rounded-full border border-border-subtle shrink-0">{platformCounts[p] || 0}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Clear filters */}
          {activeFilterCount > 0 && (
            <>
              <div className="w-px h-6 bg-border-subtle hidden sm:block" />
              <button
                onClick={() => {
                  setTimeFilter("all");
                  setPlatformFilter("all");
                  setCurrentPage(1);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <X className="w-3 h-3" />
                Clear filters
              </button>
            </>
          )}
        </div>
      )}

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {statusTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => handleFilterChange(setStatusFilter, t.id)}
            className={`px-4 py-2 rounded-md text-sm font-semibold whitespace-nowrap transition-colors border ${
              statusFilter === t.id 
                ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                : "bg-bg-surface-elevated text-text-secondary border-border-default hover:text-text-primary hover:border-border-subtle"
            }`}
          >
            {t.label} 
            <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] ${statusFilter === t.id ? 'bg-black/20 text-white' : 'bg-bg-surface border border-border-subtle text-text-tertiary'}`}>
               {t.id === 'all' ? initialJobs.length : initialJobs.filter(j => j.status === t.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* Results summary */}
      <div className="flex items-center justify-between text-xs text-text-tertiary font-medium">
        <span>
          Showing {filteredJobs.length === 0 ? 0 : (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredJobs.length)} of {filteredJobs.length} results
        </span>
        {filteredJobs.length !== initialJobs.length && (
          <span className="text-primary font-semibold">
            {filteredJobs.length} of {initialJobs.length} total
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-200">
          <thead>
            <tr className="border-b border-border-subtle text-xs font-semibold text-text-tertiary uppercase tracking-wider">
              <th className="py-4 font-semibold">Company & Title</th>
              <th className="py-4 font-semibold">Status</th>
              <th className="py-4 font-semibold">Platform</th>
              <th className="py-4 font-semibold">Location & Salary</th>
              <th className="py-4 font-semibold">Added On</th>
              <th className="py-4 font-semibold text-right pr-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {paginatedJobs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-text-tertiary">
                  No applications found matching your filters.
                </td>
              </tr>
            ) : (
              paginatedJobs.map((job) => (
                <tr key={job._id} className="group hover:bg-bg-surface-hover/50 transition-colors">
                  <td className="py-4">
                    <Link href={`/jobs/${job._id}`} className="block">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-bg-surface-elevated border border-border-default flex items-center justify-center shrink-0 overflow-hidden">
                           <Building2 className="w-5 h-5 text-text-tertiary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">{job.title}</p>
                          <p className="text-xs font-medium text-text-secondary mt-0.5">{job.company}</p>
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStatusBadge(job.status)} uppercase tracking-wide`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="py-4">
                    {job.platform ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border border-border-default bg-bg-surface-elevated text-text-secondary">
                        <span>{PLATFORM_ICONS[job.platform] || "🌐"}</span>
                        {job.platform}
                      </span>
                    ) : (
                      <span className="text-xs text-text-tertiary italic">—</span>
                    )}
                  </td>
                  <td className="py-4">
                    <div className="flex flex-col gap-1">
                      {job.location ? (
                        <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                          <MapPin className="w-3.5 h-3.5" /> {job.location}
                        </span>
                      ) : <span className="text-xs text-text-tertiary italic">No location</span>}
                      {(job.salaryMin || job.salaryMax) && (
                        <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                          <Banknote className="w-3.5 h-3.5" /> 
                          {job.salaryMin}{job.salaryMax ? ` - ${job.salaryMax}` : '+'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4">
                    <p className="text-xs font-medium text-text-secondary">
                      {job.createdAt ? format(new Date(job.createdAt), "MMM d, yyyy") : "N/A"}
                    </p>
                  </td>
                  <td className="py-4 pr-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setEditingJob(job)}
                        className="p-2 text-text-tertiary hover:text-primary hover:bg-bg-surface-elevated rounded-lg transition-colors border border-transparent hover:border-border-default"
                        title="Edit Job"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setJobToDelete(job._id)}
                        className="p-2 text-text-tertiary hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                        title="Delete Job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
          <p className="text-xs text-text-tertiary font-medium">
            Page {safeCurrentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={safeCurrentPage === 1}
              className="px-2.5 py-1.5 rounded-md text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-surface-elevated border border-border-default transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-surface-elevated border border-border-default transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                // Show first, last, and pages near current
                if (p === 1 || p === totalPages) return true;
                if (Math.abs(p - safeCurrentPage) <= 1) return true;
                return false;
              })
              .reduce<(number | "...")[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1]) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} className="px-1 text-xs text-text-tertiary">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p as number)}
                    className={`w-8 h-8 rounded-md text-xs font-semibold transition-colors ${
                      safeCurrentPage === p
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-text-secondary hover:text-text-primary hover:bg-bg-surface-elevated border border-border-default"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-surface-elevated border border-border-default transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={safeCurrentPage === totalPages}
              className="px-2.5 py-1.5 rounded-md text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-surface-elevated border border-border-default transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              Last
            </button>
          </div>
        </div>
      )}

      {editingJob && (
         <EditJobModal 
             job={editingJob} 
             open={!!editingJob} 
             onClose={() => setEditingJob(null)} 
         />
      )}

      {/* Delete Confirmation Modal */}
      {jobToDelete && (
        <div className="fixed inset-0 z-100 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !isDeleting && setJobToDelete(null)} />
          <div className="relative z-10 w-full max-w-sm mx-4 bg-bg-surface border border-border-subtle rounded-lg shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 mx-auto flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Delete Job Application?</h3>
            <p className="text-sm text-text-secondary mb-6">
              This action cannot be undone. All data, including AI analysis and notes, will be permanently removed.
            </p>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setJobToDelete(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-md border border-border-default text-text-secondary font-semibold text-sm hover:text-text-primary hover:bg-bg-surface-hover transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-2 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm px-4 py-2.5 rounded-md transition-colors shadow-[0_0_20px_rgba(239,68,68,0.2)] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</> : "Yes, Delete Job"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
