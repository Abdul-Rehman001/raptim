"use client";

import { useState } from "react";
import { Bell, RefreshCw, Check, X, Mail, Calendar, CalendarDays, BellOff } from "lucide-react";
import toast from "react-hot-toast";

export function SendReportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingPref, setSavingPref] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState<"daily" | "weekly" | "none">("weekly");
  const [sent, setSent] = useState(false);

  const handleSaveAndSend = async () => {
    setSavingPref(true);
    try {
      // 1. Save Preference
      const prefRes = await fetch("/api/user/report-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frequency: selectedFrequency })
      });
      if (!prefRes.ok) throw new Error("Failed to save preferences");

      // 2. If they didn't select 'none', send the first report immediately
      if (selectedFrequency !== "none") {
        setLoading(true);
        const reportRes = await fetch("/api/user/report", { method: "POST" });
        if (!reportRes.ok) {
           const errData = await reportRes.json();
           throw new Error(errData.error || "Failed to send report");
        }
        toast.success(`Success! Your first ${selectedFrequency} report has been sent.`);
        setSent(true);
        setTimeout(() => setSent(false), 5000);
      } else {
        toast.success("Email reports paused.");
      }
      
      setIsOpen(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setSavingPref(false);
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        disabled={loading || sent}
        title="Email Report Preferences"
        className="h-10 w-10 rounded-md bg-bg-surface-elevated border border-border-subtle flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border-default transition-all shadow-sm disabled:opacity-50 group"
      >
        {loading || savingPref ? (
          <RefreshCw className="h-4 w-4 animate-spin text-primary" />
        ) : sent ? (
          <Check className="h-4 w-4 text-emerald-500" />
        ) : (
          <Bell className="h-4 w-4 group-hover:scale-110 transition-transform" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" onClick={() => setIsOpen(false)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-bg-surface border border-border-subtle rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-text-primary">Career Progress Reports</h2>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-text-tertiary hover:text-text-primary transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-sm text-text-secondary mt-4 mb-6 leading-relaxed">
                Stay on top of your job search. Get automated updates on your pipeline, interviews, and AI analysis directly in your inbox.
              </p>

              <div className="space-y-3">
                <button 
                  onClick={() => setSelectedFrequency("daily")}
                  className={`w-full flex items-start gap-4 p-4 rounded-lg border transition-all ${selectedFrequency === 'daily' ? 'bg-primary/5 border-primary text-primary' : 'bg-bg-surface-elevated border-border-subtle text-text-secondary hover:border-border-default'}`}
                >
                  <Calendar className={`w-5 h-5 mt-0.5 ${selectedFrequency === 'daily' ? 'text-primary' : 'text-text-tertiary'}`} />
                  <div className="text-left">
                    <p className={`text-sm font-bold ${selectedFrequency === 'daily' ? 'text-text-primary' : ''}`}>Daily Summary</p>
                    <p className={`text-xs mt-1 ${selectedFrequency === 'daily' ? 'text-text-secondary' : 'text-text-tertiary'}`}>A quick brief every morning on your progress.</p>
                  </div>
                  {selectedFrequency === 'daily' && <Check className="w-4 h-4 ml-auto mt-1" />}
                </button>

                <button 
                  onClick={() => setSelectedFrequency("weekly")}
                  className={`w-full flex items-start gap-4 p-4 rounded-lg border transition-all ${selectedFrequency === 'weekly' ? 'bg-primary/5 border-primary text-primary' : 'bg-bg-surface-elevated border-border-subtle text-text-secondary hover:border-border-default'}`}
                >
                  <CalendarDays className={`w-5 h-5 mt-0.5 ${selectedFrequency === 'weekly' ? 'text-primary' : 'text-text-tertiary'}`} />
                  <div className="text-left">
                    <p className={`text-sm font-bold ${selectedFrequency === 'weekly' ? 'text-text-primary' : ''}`}>Weekly Digest</p>
                    <p className={`text-xs mt-1 ${selectedFrequency === 'weekly' ? 'text-text-secondary' : 'text-text-tertiary'}`}>A comprehensive review of your week&apos;s activity.</p>
                  </div>
                  {selectedFrequency === 'weekly' && <Check className="w-4 h-4 ml-auto mt-1" />}
                </button>

                <button 
                  onClick={() => setSelectedFrequency("none")}
                  className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all ${selectedFrequency === 'none' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-bg-surface-elevated border-border-subtle text-text-secondary hover:border-border-default'}`}
                >
                  <BellOff className={`w-5 h-5 ${selectedFrequency === 'none' ? 'text-red-500' : 'text-text-tertiary'}`} />
                  <div className="text-left">
                    <p className={`text-sm font-bold ${selectedFrequency === 'none' ? 'text-red-500' : ''}`}>Pause Reports</p>
                  </div>
                  {selectedFrequency === 'none' && <Check className="w-4 h-4 ml-auto" />}
                </button>
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-md border border-border-default font-semibold text-sm text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveAndSend}
                  disabled={savingPref || loading}
                  className="flex-1 px-4 py-2.5 rounded-md bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {savingPref || loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  {savingPref || loading ? "Saving..." : selectedFrequency !== "none" ? "Save & Send Now" : "Save Preferences"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
