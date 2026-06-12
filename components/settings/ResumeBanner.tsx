"use client";

import { useState, useEffect } from "react";
import { Zap, X } from "lucide-react";


const DISMISS_KEY = "applyiq_resume_banner_dismissed";

export function ResumeBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (!dismissed) { const timer = setTimeout(() => setVisible(true), 0); return () => clearTimeout(timer); }
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
      <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
        <Zap className="w-4 h-4 text-primary" strokeWidth={2.5} />
      </div>
      <p className="flex-1 text-sm font-medium text-text-primary">
        <span className="font-bold">Add your resume</span> to unlock AI job coaching and match scoring.
      </p>
      <button
        onClick={dismiss}
        className="p-1 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-surface-hover transition-colors shrink-0"
        aria-label="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
