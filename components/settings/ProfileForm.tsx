"use client";
import Image from "next/image";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Save, Loader2, User as UserIcon } from "lucide-react";
import { IUser } from "@/types";

interface ProfileFormProps {
  user: IUser;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    jobTitle: user?.jobTitle || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) throw new Error("Failed to update profile");
      
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-bg-surface-elevated border border-border-default rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all";

  // Initials fallback logic
  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <section>
      <h2 className="text-base font-bold text-text-primary flex items-center gap-2 mb-4">
        <UserIcon className="w-4 h-4 text-primary" />
        Profile Information
      </h2>
      <div className="bg-bg-surface border border-border-subtle p-6 rounded-2xl shadow-sm">
         <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* Avatar Section */}
            <div className="relative group shrink-0">
               {user?.image ? (
                 <Image width={40} height={40} unoptimized src={(user.image || "")} alt={user.name || ""} className="w-24 h-24 rounded-full object-cover border-2 border-primary/50 shadow-[0_0_20px_rgba(166,137,250,0.2)]" />
               ) : (
                 <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/50 shadow-[0_0_20px_rgba(166,137,250,0.2)]">
                   <span className="text-3xl font-bold text-primary">{getInitials(user?.name || "")}</span>
                 </div>
               )}
            </div>
            
            {/* Form Section */}
            <form onSubmit={handleSubmit} className="flex-1 w-full grid md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-xs font-bold text-text-tertiary">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. Alex Johnson"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-bold text-text-tertiary">Email Address</label>
                  <input 
                    type="email" 
                    value={user?.email || ""}
                    disabled
                    title="Email cannot be changed"
                    className="w-full bg-bg-surface-elevated border border-border-default rounded-xl px-4 py-3 text-sm text-text-secondary opacity-70 cursor-not-allowed"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-bold text-text-tertiary">Phone Number (Optional)</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. +1 (555) 123-4567"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-bold text-text-tertiary">Current Job Title / Role</label>
                  <input 
                    type="text" 
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. Senior Product Designer"
                  />
               </div>
               
               <div className="md:col-span-2 flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-sm rounded-xl transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Profile</>}
                  </button>
               </div>
            </form>
         </div>
      </div>
    </section>
  );
}
