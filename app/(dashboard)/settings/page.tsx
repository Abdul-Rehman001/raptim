import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";
import { ResumeTextEditor } from "@/components/resume/ResumeTextEditor";
import { ResumeUpload } from "@/components/resume/ResumeUpload";
import { ResumeBanner } from "@/components/settings/ResumeBanner";
import { ProfileForm } from "@/components/settings/ProfileForm";

export const revalidate = 30;

import {
  Bell,
  CloudUpload
} from "lucide-react";

async function getUser(userId: string) {
  await dbConnect();
  const user = await User.findById(userId);
  if (!user) return null;
  return JSON.parse(JSON.stringify(user));
}

export default async function SettingsPage() {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login");
  }

  const user = await getUser(session.user.id);

  return (
    <div className="space-y-10 pb-20 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Account Settings</h1>
        <p className="text-text-secondary mt-1 font-medium">
          Manage your profile, preferences, and resume data.
        </p>
      </div>

      {!user?.resumeText && <ResumeBanner />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-bg-surface border border-border-subtle p-6 rounded-3xl shadow-sm">
            <h3 className="text-lg font-extrabold text-text-primary mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Bell className="w-4 h-4" />
              </span>
              Personal Info
            </h3>
            <ProfileForm user={user} />
          </div>

          <div className="bg-bg-surface border border-border-subtle p-6 rounded-3xl shadow-sm opacity-50 relative overflow-hidden group">
             <div className="absolute inset-0 bg-bg-surface-elevated/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
               <span className="px-3 py-1.5 rounded-lg bg-bg-surface border border-border-default text-xs font-bold text-text-primary shadow-lg">Coming Soon</span>
             </div>
             <div className="blur-[2px]">
              <h3 className="text-lg font-extrabold text-text-primary mb-4 flex items-center gap-2">
                Preferences
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-secondary">Email Notifications</span>
                  <div className="w-10 h-5 bg-border-default rounded-full" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-secondary">Weekly Report</span>
                  <div className="w-10 h-5 bg-border-default rounded-full" />
                </div>
              </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-bg-surface border border-border-subtle p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col h-[calc(100vh-16rem)] min-h-[600px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-text-primary flex items-center gap-2">
                  <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <CloudUpload className="w-5 h-5" />
                  </span>
                  Resume Database
                </h2>
                <p className="text-sm text-text-secondary mt-1 ml-12">
                  Upload your PDF or paste your resume text directly. This data is used by the AI to analyze job fit.
                </p>
              </div>
              <ResumeUpload />
            </div>
            
            <div className="flex-1 bg-bg-surface-elevated/30 rounded-2xl border border-border-default overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-border-default flex justify-between items-center bg-bg-surface">
                <span className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Raw Text Representation</span>
                <span className="text-[10px] font-medium text-text-tertiary bg-bg-surface-elevated px-2 py-1 rounded-md">Auto-saved</span>
              </div>
              <div className="flex-1 p-4 relative">
                 <ResumeTextEditor initialText={user?.resumeText || ""} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
