"use client";

import { Droppable } from "@hello-pangea/dnd";
import { JobCard } from "./JobCard";
import { cn } from "@/lib/utils";
import { IJob } from "@/types";

interface BoardColumnProps {
  id: string;
  title: string;
  jobs: IJob[];
}

const getColumnColor = (id: string) => {
  switch (id) {
    case 'saved': return 'bg-text-secondary shadow-[0_0_8px_rgba(159,155,170,0.8)]';
    case 'applied': return 'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]';
    case 'interview': return 'bg-emerald-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]';
    case 'offer': return 'bg-primary shadow-[0_0_8px_rgba(166,137,250,0.8)]';
    case 'rejected': return 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]';
    default: return 'bg-text-tertiary';
  }
};

export function BoardColumn({ id, title, jobs }: BoardColumnProps) {
  return (
    <div className="flex flex-col h-full min-w-70 w-[320px] bg-bg-surface rounded-2xl border border-border-subtle shrink-0 shadow-sm p-4">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-sm font-extrabold text-text-primary uppercase tracking-widest flex items-center gap-2">
          <span className={cn("w-1.5 h-1.5 rounded-full", getColumnColor(id))}></span>
          {title} 
          <span className="text-text-secondary bg-bg-surface-elevated px-2 py-0.5 rounded-md ml-1 text-[10px]">
            {jobs.length}
          </span>
        </h3>
        <button className="text-text-tertiary hover:text-text-primary transition-colors">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto min-h-37.5 scrollbar-hide">
        <Droppable droppableId={id}>
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={cn(
                "h-full transition-colors rounded-xl p-1",
                snapshot.isDraggingOver ? "bg-bg-surface-elevated/50 border border-dashed border-border-strong" : ""
              )}
            >
              <div className="space-y-3">
                {jobs.map((job, index) => (
                  <JobCard key={job._id} job={job} index={index} columnId={id} />
                ))}
                {provided.placeholder}
              </div>
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
}
