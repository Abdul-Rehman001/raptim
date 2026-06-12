"use client";

import { useState } from "react";

import { format } from "date-fns";
import { Edit2, Trash2, MapPin, DollarSign, Building2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import Link from "next/link";
import { EditJobModal } from "./EditJobModal";
import { IJob } from "@/types";

interface JobListProps {
  initialJobs: IJob[];
}

export function JobList({ initialJobs }: JobListProps) {
  const router = useRouter();
  const triggerRefresh = useAppStore((s) => s.triggerRefresh);
  const [filter, setFilter] = useState("all");
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingJob, setEditingJob] = useState<IJob | null>(null);

  const filteredJobs = initialJobs.filter((job) => {
    if (filter === "all") return true;
    return job.status === filter;
  });

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

  const tabs = [
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

  return (
    <div className="space-y-6 mt-12 bg-bg-surface border border-border-subtle rounded-2xl p-6 shadow-sm relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
        <div>
          <h2 className="text-xl font-extrabold text-text-primary">All Applications List</h2>
          <p className="text-sm text-text-secondary mt-1">Manage, filter, and edit your specific jobs.</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors border ${
              filter === t.id 
                ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20" 
                : "bg-bg-surface-elevated text-text-secondary border-border-default hover:text-text-primary hover:border-border-subtle"
            }`}
          >
            {t.label} 
            <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] ${filter === t.id ? 'bg-black/20 text-white' : 'bg-bg-surface border border-border-subtle text-text-tertiary'}`}>
               {t.id === 'all' ? initialJobs.length : initialJobs.filter(j => j.status === t.id).length}
            </span>
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-200">
          <thead>
            <tr className="border-b border-border-subtle text-xs font-bold text-text-tertiary uppercase tracking-wider">
              <th className="py-4 font-bold">Company & Title</th>
              <th className="py-4 font-bold">Status</th>
              <th className="py-4 font-bold">Location & Salary</th>
              <th className="py-4 font-bold">Added On</th>
              <th className="py-4 font-bold text-right pr-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-text-tertiary">
                  No applications found in this category.
                </td>
              </tr>
            ) : (
              filteredJobs.map((job) => (
                <tr key={job._id} className="group hover:bg-bg-surface-hover/50 transition-colors">
                  <td className="py-4">
                    <Link href={`/jobs/${job._id}`} className="block">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-bg-surface-elevated border border-border-default flex items-center justify-center shrink-0 overflow-hidden">
                           <Building2 className="w-5 h-5 text-text-tertiary" />
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-text-primary group-hover:text-primary transition-colors">{job.title}</p>
                          <p className="text-xs font-medium text-text-secondary mt-0.5">{job.company}</p>
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${getStatusBadge(job.status)} uppercase tracking-wide`}>
                      {job.status}
                    </span>
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
                          <DollarSign className="w-3.5 h-3.5" /> 
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
          <div className="relative z-10 w-full max-w-sm mx-4 bg-bg-surface border border-border-subtle rounded-2xl shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 mx-auto flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-text-primary mb-2">Delete Job Application?</h3>
            <p className="text-sm text-text-secondary mb-6">
              This action cannot be undone. All data, including AI analysis and notes, will be permanently removed.
            </p>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setJobToDelete(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border-default text-text-secondary font-bold text-sm hover:text-text-primary hover:bg-bg-surface-hover transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-2 bg-red-500 hover:bg-red-600 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-[0_0_20px_rgba(239,68,68,0.2)] flex items-center justify-center gap-2 disabled:opacity-50"
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
