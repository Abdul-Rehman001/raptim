import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";
import { Job } from "@/models/Job";
import { 
  Users, 
  Briefcase, 
  Sparkles, 
  ShieldCheck,
  Globe,
  ArrowUpRight
} from "lucide-react";

async function getAdminStats() {
  await dbConnect();
  
  const totalUsers = await User.countDocuments();
  const totalJobs = await Job.countDocuments();
  const totalAIAnalyses = await Job.countDocuments({ aiAnalyzedAt: { $ne: null } });
  
  // Get recent signups
  const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).lean();
  
  // Get jobs per status across all users
  const statusCounts = await Job.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);

  return {
    totalUsers,
    totalJobs,
    totalAIAnalyses,
    recentUsers,
    statusCounts
  };
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Admin Hero Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-bg-surface to-[#1a142e] border border-white/[0.05] p-10 md:p-14 shadow-2xl shadow-primary/10">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 w-fit mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Administrator Console</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Intelligence</span>
            </h1>
            <p className="text-white/50 mt-4 text-base md:text-lg max-w-xl font-medium">
              Real-time oversight of ApplyIQ&apos;s growth, engagement, and AI performance across your entire user base.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl">
               <Globe className="w-8 h-8 text-white/40" />
            </div>
          </div>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {[
          { label: "Total Platform Users", value: stats.totalUsers, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
          { label: "Applications Tracked", value: stats.totalJobs, icon: Briefcase, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
          { label: "AI Powered Insights", value: stats.totalAIAnalyses, icon: Sparkles, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
        ].map((stat, i) => (
          <div key={i} className={`p-8 rounded-[2rem] bg-bg-surface border ${stat.border} shadow-sm transition-all hover:scale-[1.02]`}>
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6`}>
              <stat.icon size={24} />
            </div>
            <p className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-2">{stat.label}</p>
            <h3 className="text-4xl font-black text-text-primary tracking-tight">{stat.value.toLocaleString()}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Recent User Registrations */}
        <div className="bg-bg-surface border border-border-subtle rounded-[2rem] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-text-primary tracking-tight">Recent Onboardings</h3>
            <button className="text-xs font-bold text-primary flex items-center gap-1.5 hover:underline">
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-4">
            {stats.recentUsers.map((user: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => (
              <div key={user._id.toString()} className="flex items-center justify-between p-4 rounded-2xl bg-bg-surface-elevated/50 border border-border-subtle transition-all hover:bg-bg-surface-elevated">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-400 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-primary/20">
                    {user.name ? user.name[0] : user.email[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-text-primary leading-none mb-1">{user.name || "Anonymous User"}</h4>
                    <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest leading-none">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${user.role === 'admin' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-text-tertiary/10 text-text-tertiary border border-text-tertiary/20'}`}>
                    {user.role || 'user'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Pipeline Health */}
        <div className="bg-bg-surface border border-border-subtle rounded-[2rem] p-8 shadow-sm flex flex-col justify-between">
          <h3 className="text-xl font-black text-text-primary tracking-tight mb-8">Global Pipeline Status</h3>
          <div className="grid grid-cols-2 gap-4">
             {stats.statusCounts.map((s: { _id: string, count: number }) => (
               <div key={s._id} className="p-5 rounded-2xl bg-bg-surface-elevated/30 border border-border-subtle flex flex-col items-center text-center">
                  <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-1">{s._id}</span>
                  <span className="text-2xl font-black text-text-primary">{s.count}</span>
               </div>
             ))}
          </div>
          <div className="mt-8 pt-8 border-t border-border-subtle">
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <p className="text-xs font-bold text-text-secondary">System is active and processing global tracking data.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
