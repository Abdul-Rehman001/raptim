"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Save, Check } from "lucide-react";
import { useAppStore } from "@/lib/store";

interface ResumeTextEditorProps {
  initialText?: string;
}

export function ResumeTextEditor({ initialText }: ResumeTextEditorProps) {
  const [text, setText] = useState(initialText || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const setResumeText = useAppStore((s) => s.setResumeText);

  // Track dirty state
  useEffect(() => {
    if (text !== (initialText || "")) {
      setSaved(false);
    }
  }, [text, initialText]);

  // Sync to Zustand on mount or when props change
  useEffect(() => {
    if (initialText) {
      setResumeText(initialText);
      setText(initialText);
      setSaved(true);
    }
  }, [initialText, setResumeText]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: text }),
      });
      if (!res.ok) throw new Error("Failed to save resume text");
      setSaved(true);
      setResumeText(text); // update Zustand store
      setIsEditing(false); // exit edit mode
      toast.success("Resume text saved for AI analysis!");
    } catch {
      toast.error("Failed to update resume text");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setText(initialText || "");
    setSaved(true);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between shrink-0">
         <div>
            <label className="text-sm font-semibold text-text-primary">Resume Text (for AI Coaching)</label>
            <p className="text-xs text-text-tertiary">
              This text is used by the AI to calculate your match score and provide tailored advice.
            </p>
         </div>
         {!isEditing && (
            <button
               onClick={() => setIsEditing(true)}
               className="px-4 py-1.5 rounded-lg border border-border-default text-text-secondary text-xs font-bold hover:text-text-primary hover:bg-bg-surface-hover transition-colors"
            >
               Edit Text
            </button>
         )}
      </div>

      <div className="flex-1 w-full">
         {isEditing ? (
            <textarea
              className="w-full min-h-[400px] h-full p-5 text-sm bg-bg-surface-elevated border border-primary rounded-xl text-text-primary placeholder:text-text-tertiary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none shadow-[0_0_15px_rgba(166,137,250,0.1)]"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your resume experience, skills, and about section here..."
              autoFocus
            />
         ) : (
            <div 
               className="w-full min-h-[400px] h-full p-5 text-sm bg-bg-base border border-border-subtle rounded-xl text-text-secondary overflow-y-auto cursor-text hover:border-border-default transition-colors"
               onClick={() => setIsEditing(true)}
               title="Click to edit"
            >
               {text ? (
                 <div className="whitespace-pre-wrap">{text}</div>
               ) : (
                 <span className="text-text-tertiary italic">No resume text added yet. Click to paste your resume data.</span>
               )}
            </div>
         )}
      </div>

      {isEditing && (
         <div className="flex items-center gap-3 pt-2">
           <button
             onClick={handleSave}
             disabled={saving || saved}
             className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-sm rounded-xl transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
           >
             {saving ? (
               "Saving..."
             ) : saved ? (
               <><Check className="w-4 h-4" /> Saved</>
             ) : (
               <><Save className="w-4 h-4" /> Save Resume Text</>
             )}
           </button>
           
           <button
             onClick={handleCancel}
             disabled={saving}
             className="px-4 py-2.5 text-text-secondary font-bold text-sm hover:text-text-primary transition-colors"
           >
             Cancel
           </button>
           
           {saved && !saving && (
             <span className="text-xs font-medium text-emerald-500 ml-auto mr-2">Changes saved</span>
           )}
         </div>
      )}
    </div>
  );
}
