"use client";

import Link from "next/link";
import { Draggable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { format, differenceInDays } from "date-fns";
import { Paperclip, Calendar } from "lucide-react";

interface JobCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  job: any;
  index: number;
  columnId: string;
}

const getLineGradient = (id: string) => {
  switch (id) {
    case 'saved': return 'from-transparent via-text-secondary to-transparent';
    case 'applied': return 'from-transparent via-orange-400 to-transparent';
    case 'interview': return 'from-transparent via-emerald-400 to-transparent';
    case 'offer': return 'from-transparent via-primary to-transparent';
    case 'rejected': return 'from-transparent via-red-400 to-transparent';
    default: return 'from-transparent via-text-tertiary to-transparent';
  }
};

const getStatusColor = (id: string, matchScore?: number) => {
  if (id === 'offer') return 'text-primary bg-primary/10 border border-primary/20';
  if (id === 'interview') return 'text-primary bg-primary/10 border border-primary/20';
  if (matchScore && matchScore >= 80) return 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20';
  if (matchScore && matchScore >= 60) return 'text-orange-400 bg-orange-500/10 border border-orange-500/20';
  return 'text-text-secondary bg-bg-surface-elevated border border-border-subtle';
};

const getDotColor = (id: string) => {
  switch (id) {
    case 'saved': return 'bg-text-secondary';
    case 'applied': return 'bg-orange-400';
    case 'interview': return 'bg-emerald-400';
    case 'offer': return 'bg-primary';
    case 'rejected': return 'bg-red-400';
    default: return 'bg-text-tertiary';
  }
};

export function JobCard({ job, index, columnId }: JobCardProps) {
  return (
    <Draggable draggableId={job._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{ ...provided.draggableProps.style }}
        >
          <Link href={`/jobs/${job._id}`} className="block">
            <div className={cn(
              "bg-bg-base border border-border-default rounded-lg p-4 transition-all cursor-grab active:cursor-grabbing shadow-sm group relative overflow-hidden",
              "hover:border-primary/40",
              snapshot.isDragging ? "shadow-xl ring-1 ring-primary/40 bg-bg-surface -rotate-1 scale-[1.02] z-50 backdrop-blur-md" : ""
            )}>
              {/* Status indicator top border */}
              <div className={cn("absolute top-0 left-0 right-0 h-1 bg-linear-to-r opacity-50", getLineGradient(columnId))}></div>
              {/* Stale indicator dot — shows if no update in 14+ days */}
              {differenceInDays(new Date(), new Date(job.updatedAt)) >= 14 && (
                <div
                  className="absolute top-2.5 left-2.5 w-2 h-2 rounded-full bg-amber-400"
                  title="No updates in 14 days"
                />
              )}
              
              <div className="flex justify-between items-start mb-3">
                  <div>
                      <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1 group-hover:text-primary transition-colors">{job.company}</p>
                      <h4 className="text-text-primary font-semibold text-sm leading-tight line-clamp-2">{job.title}</h4>
                  </div>
                  <div className={cn("w-2 h-2 rounded-full shrink-0 mt-1", getDotColor(columnId))}></div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                  {job.location && (
                    <span className="text-[10px] font-medium text-text-secondary bg-bg-surface-elevated px-2 py-1 rounded-md border border-border-subtle hover:bg-bg-surface transition-colors">
                      {job.location}
                    </span>
                  )}
                  {(job.salaryMin || job.salaryMax) && (
                    <span className="text-[10px] font-medium text-text-secondary bg-bg-surface-elevated px-2 py-1 rounded-md border border-border-subtle hover:bg-bg-surface transition-colors">
                      {job.salaryMin}{job.salaryMax ? `-${job.salaryMax}` : '+'}
                    </span>
                  )}
              </div>
              
              <div className="flex justify-between items-end mt-2">
                  <div className={cn("text-[10px] font-semibold px-2 py-1 rounded-md", getStatusColor(columnId, job.matchScore))}>
                      {job.matchScore ? `${job.matchScore}% Match` : 'Not Analyzed'}
                  </div>
                  <div className="flex items-center gap-2">
                      {job.coverLetter && <Paperclip className="w-3.5 h-3.5 text-text-tertiary" />}
                      {job.followUpDate && (
                        <span className={cn(
                          "flex items-center gap-1 text-[10px] font-medium",
                          differenceInDays(new Date(), new Date(job.followUpDate)) >= 0
                            ? "text-amber-500" : "text-text-tertiary"
                        )}>
                          <Calendar className="w-3 h-3" />
                          {format(new Date(job.followUpDate), "MMM d")}
                        </span>
                      )}
                      <span className="text-[10px] font-medium text-text-tertiary">
                        {columnId === 'saved' ? 'Saved' : columnId === 'applied' ? 'Applied' : 'Updated'} {format(new Date(job.updatedAt || new Date()), "MMM d")}
                      </span>
                  </div>
              </div>

            </div>
          </Link>
        </div>
      )}
    </Draggable>
  );
}
