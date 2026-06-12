"use client";

import { useState, useCallback, useEffect } from "react";

import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { BoardColumn } from "./BoardColumn";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IJob } from "@/types";
import { useAppStore } from "@/lib/store";
import { Target, Frown, PartyPopper } from "lucide-react";

// Dynamic import — only loads confetti JS on this page
const confetti = async () => {
  const mod = await import("canvas-confetti");
  return mod.default;
};

const COLUMNS = [
  { id: "saved", title: "Saved" },
  { id: "applied", title: "Applied" },
  { id: "interview", title: "Interview" },
  { id: "offer", title: "Offer" },
  { id: "rejected", title: "Rejected" },
];

export function Board({ initialJobs }: { initialJobs: IJob[] }) {
  const [jobs, setJobs] = useState<IJob[]>(initialJobs);
  const router = useRouter();
  const refreshKey = useAppStore((s) => s.refreshKey);

  useEffect(() => {
    setJobs(initialJobs);
  }, [initialJobs, refreshKey]);

  const showContextualToast = useCallback((status: string, jobId: string) => {
    if (status === "interview") {
      toast(
        (t) => (
          <span className="flex flex-col gap-1.5">
            <span className="font-bold text-sm flex items-center gap-1.5"><Target className="w-4 h-4 text-emerald-500" /> Interview added!</span>
            <span className="text-xs text-text-secondary">Want to prep with AI?</span>
            <Link
              href={`/jobs/${jobId}?tab=interview-prep`}
              onClick={() => toast.dismiss(t.id)}
              className="text-xs font-bold text-purple-600 underline"
            >
              Prep Now →
            </Link>
          </span>
        ),
        { duration: 6000 }
      );
    } else if (status === "rejected") {
      toast(
        (t) => (
          <span className="flex flex-col gap-1.5">
            <span className="font-bold text-sm flex items-center gap-1.5"><Frown className="w-4 h-4 text-amber-500" /> Sorry to hear that</span>
            <span className="text-xs text-text-secondary">Want to note what happened?</span>
            <Link
              href={`/jobs/${jobId}?tab=notes`}
              onClick={() => toast.dismiss(t.id)}
              className="text-xs font-bold text-purple-600 underline"
            >
              Add Note →
            </Link>
          </span>
        ),
        { duration: 6000 }
      );
    } else if (status === "offer") {
      // Fire confetti!
      confetti().then((fire) => {
        fire({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#7C3AED", "#A78BFA", "#DDD6FE", "#FFFFFF"],
        });
      });
      toast.success(
        <span className="flex items-center gap-1.5"><PartyPopper className="w-4 h-4" /> Offer received! Congratulations!</span>, 
        { duration: 5000 }
      );
    } else {
      toast.success(`Moved to ${COLUMNS.find((c) => c.id === status)?.title}`);
    }
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const movedJob = jobs.find((j) => j._id === draggableId);
    if (!movedJob) return;

    const newStatus = destination.droppableId;
    const updatedJobs = jobs.map((job) =>
      job._id === draggableId ? { ...job, status: newStatus } : job
    );
    setJobs(updatedJobs);

    try {
      const res = await fetch(`/api/jobs/${draggableId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      showContextualToast(newStatus, draggableId);
      router.refresh();
    } catch {
      toast.error("Failed to save changes");
      setJobs(jobs); // revert
    }
  };

  const getJobsByStatus = (status: string) => jobs.filter((job) => job.status === status);

  return (
    <div className="h-[calc(100vh-140px)] overflow-x-auto pb-4">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 h-full min-w-max">
          {COLUMNS.map((col) => (
            <BoardColumn key={col.id} id={col.id} title={col.title} jobs={getJobsByStatus(col.id)} />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
