/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, Sparkles, LayoutDashboard, FileSearch,
  TrendingUp, CheckCircle, Zap, Star, ChevronRight
} from "lucide-react";

/* ─────────────────────────────────────────────
   Tiny reusable primitives
───────────────────────────────────────────── */
const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`
    backdrop-blur-xl bg-white/3
    border border-white/6
    rounded-2xl shadow-sm
    ${className}
  `}>
    {children}
  </div>
);

const StatusBadge = ({ label, color }: { label: string; color: string }) => (
  <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-current/20 ${color}`}>
    <span className="w-1.5 h-1.5 rounded-full bg-current" />
    {label}
  </span>
);

const JobCard = ({
  company, role, match, status, statusColor, delay
}: {
  company: string; role: string; match: number;
  status: string; statusColor: string; delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="
      group relative backdrop-blur-xl
      bg-white/4
      border border-white/6
      rounded-xl p-3 shadow-sm
      hover:bg-white/6
      hover:border-purple-400/30 hover:-translate-y-0.5
      transition-all duration-200 cursor-grab
    "
  >
    <div className="flex items-start justify-between mb-2">
      <div>
        <p className="text-[10px] text-text-tertiary font-medium">{company}</p>
        <p className="text-xs text-text-primary font-semibold leading-tight mt-0.5">{role}</p>
      </div>
      <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
        match >= 85 ? "bg-emerald-500/20 text-emerald-400" :
        match >= 70 ? "bg-amber-500/20 text-amber-400" :
        "bg-red-500/20 text-red-400"
      }`}>
        {match}%
      </div>
    </div>
    <StatusBadge label={status} color={statusColor} />
  </motion.div>
);

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function Home() {

  return (
    <div className="dark">
      <div className="relative min-h-screen bg-bg-base overflow-x-hidden font-sans transition-colors duration-300">

        {/* ── GRADIENT MESH BACKGROUND ── */}
        <div className="fixed inset-0 pointer-events-none z-0">
          {/* Primary purple orb */}
          <div className="absolute -top-40 -left-40 w-175 h-175 rounded-full
            bg-purple-600/25 blur-[120px] animate-[drift_14s_ease-in-out_infinite_alternate]" />
          {/* Secondary violet orb */}
          <div className="absolute top-1/4 -right-20 w-125 h-125 rounded-full
            bg-violet-500/15 blur-[100px] animate-[drift_18s_ease-in-out_4s_infinite_alternate-reverse]" />
          {/* Accent pink-indigo orb */}
          <div className="absolute bottom-1/3 left-1/3 w-100 h-100 rounded-full
            bg-indigo-500/10 blur-[90px] animate-[drift_16s_ease-in-out_8s_infinite_alternate]" />
          {/* Bottom right soft pink */}
          <div className="absolute -bottom-20 right-0 w-87.5 h-87.5 rounded-full
            bg-fuchsia-600/10 blur-[80px] animate-[drift_20s_ease-in-out_2s_infinite_alternate-reverse]" />

          {/* Fine grid overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none text-white"
            style={{ 
              backgroundImage: `
                linear-gradient(to right, currentColor 1px, transparent 1px),
                linear-gradient(to bottom, currentColor 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px"
            }} 
          />
        </div>

        {/* ── NAV ── */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between
          px-6 lg:px-10 h-15
          backdrop-blur-2xl bg-black/20
          border-b border-border-subtle">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-purple-500 to-violet-600
              flex items-center justify-center shadow-lg shadow-purple-500/30
              group-hover:shadow-purple-500/50 transition-shadow">
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">ApplyIQ</span>
          </Link>

          {/* Center links — hidden on mobile */}
          <div className="hidden md:flex items-center gap-1">
            {["Features", "Pricing", "Blog"].map(l => (
              <Link key={l} href="#"
                className="px-4 py-1.5 text-sm text-white/50 hover:text-white
                rounded-lg hover:bg-white/6 transition-all duration-150 font-medium">
                {l}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Link href="/login"
              className="hidden sm:block px-4 py-1.5 text-sm font-medium text-white/60
              hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/signup"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
              bg-linear-to-r from-purple-600 to-violet-600 text-white
              shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40
              hover:-translate-y-px transition-all duration-200">
              Get started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </nav>

        {/* ═══════════════════════════════════════
            HERO SECTION
        ═══════════════════════════════════════ */}
        <section className="relative z-10 pt-32 pb-10 px-6 lg:px-16">
          <div className="max-w-7xl mx-auto">

            {/* ── Eyebrow pill ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5
                backdrop-blur-xl bg-white/6 border border-purple-400/20
                rounded-full text-xs font-semibold text-purple-300">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_6px_#a78bfa] animate-pulse" />
                AI-powered job tracker — free to start
                <ChevronRight className="w-3 h-3 opacity-60" />
              </div>
            </motion.div>

            {/* ── Main heading + CTA — asymmetric layout ── */}
            <div className="grid lg:grid-cols-[1fr_420px] gap-12 lg:gap-16 items-start">

              {/* Left: text */}
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="text-[clamp(44px,7vw,88px)] font-bold leading-[1.05] md:leading-none tracking-[-0.04em] text-white mb-6"
                >
                  Your job search,{" "}
                  <br />
                  <span className="relative">
                    <span className="bg-linear-to-r from-purple-300 via-violet-300 to-fuchsia-300
                      bg-clip-text text-transparent">
                      finally organized.
                    </span>
                    {/* underline glow */}
                    <span className="absolute -bottom-1 left-0 right-0 h-px
                      bg-linear-to-r from-purple-500/0 via-purple-400/60 to-purple-500/0" />
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-lg text-white/50 leading-relaxed max-w-xl mb-8 font-light"
                >
                  Stop juggling spreadsheets and sticky notes.
                  ApplyIQ tracks every application, scores your resume with AI,
                  and coaches you from saved to signed offer.
                </motion.p>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-3 mb-10"
                >
                  <Link href="/signup"
                    className="group flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl
                    text-sm font-semibold text-white
                    bg-linear-to-r from-purple-600 via-violet-600 to-purple-700
                    shadow-[0_0_30px_rgba(124,58,237,0.4)]
                    hover:shadow-[0_0_40px_rgba(124,58,237,0.6)]
                    hover:-translate-y-0.5 transition-all duration-200">
                    Start for free
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link href="#demo"
                    className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl
                    text-sm font-semibold text-text-secondary
                    backdrop-blur-xl bg-white/2 border border-border-subtle
                    hover:bg-white/6 hover:text-text-primary hover:border-border-default
                    transition-all duration-200">
                    Watch demo
                  </Link>
                </motion.div>

                {/* Social proof row */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-4"
                >
                  <div className="flex -space-x-2">
                    {["#a78bfa","#818cf8","#60a5fa","#34d399","#f472b6"].map((c,i) => (
                      <div key={i} className="w-7 h-7 rounded-full border-2 border-bg-base
                        flex items-center justify-center text-[9px] font-bold text-white"
                        style={{ background: c }}>
                        {String.fromCharCode(65+i)}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-0.5 mb-0.5">
                      {[...Array(5)].map((_,i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-text-tertiary">
                      Loved by <span className="text-text-secondary font-semibold">2,400+</span> job seekers
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Right: floating stats panel */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="hidden lg:flex flex-col gap-3 pt-4"
              >
                {/* AI Score card */}
                <GlassCard className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">AI Match Score</p>
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div className="flex items-end gap-3 mb-3">
                    <span className="text-4xl font-bold text-white tracking-tight">91%</span>
                    <span className="text-xs text-emerald-400 font-semibold mb-1.5">↑ Strong match</span>
                  </div>
                  {/* Bar */}
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "91%" }}
                      transition={{ delay: 1, duration: 1.2, ease: "easeOut" }}
                      className="h-full rounded-full bg-linear-to-r from-purple-500 to-emerald-400"
                    />
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {["React", "TypeScript", "Node.js"].map(t => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-md
                        bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        Check {t}
                      </span>
                    ))}
                    <span className="text-[10px] px-2 py-0.5 rounded-md
                      bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
                      X PostgreSQL
                    </span>
                  </div>
                </GlassCard>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Applications", value: "47", delta: "+8 this week", color: "text-purple-400" },
                    { label: "Response rate", value: "24%", delta: "↑ above avg", color: "text-emerald-400" },
                  ].map(s => (
                    <GlassCard key={s.label} className="p-3.5 bg-white/3 border-white/6">
                      <p className="text-[10px] text-text-tertiary font-medium mb-1.5">{s.label}</p>
                      <p className={`text-2xl font-bold ${s.color} tracking-tight`}>{s.value}</p>
                      <p className="text-[10px] text-text-tertiary/60 mt-1">{s.delta}</p>
                    </GlassCard>
                  ))}
                </div>

                {/* Streak */}
                <GlassCard className="p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-linear-to-br from-orange-500/20 to-amber-500/20
                    border border-orange-500/20 flex items-center justify-center text-lg shrink-0">
                    🔥
                  </div>
                  <div>
                    <p className="text-text-primary font-semibold text-sm">12-day streak</p>
                    <p className="text-[10px] text-text-tertiary">Keep it up — your personal best!</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(7)].map((_,i) => (
                      <div key={i} className={`w-2 h-4 rounded-sm ${
                        i < 5 ? "bg-orange-400/80" : "bg-white/10"
                      }`} style={{ height: `${8 + (i < 5 ? i*2 : 0)}px`, marginTop: "auto" }} />
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            DASHBOARD MOCKUP
        ═══════════════════════════════════════ */}
        <section id="demo" className="relative z-10 px-6 lg:px-16 pb-20">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              {/* Glow behind mockup */}
              <div className="absolute inset-x-20 -top-8 h-16
                bg-linear-to-r from-purple-600/20 via-violet-500/30 to-purple-600/20
                blur-2xl rounded-full" />

              {/* Browser frame */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10
                shadow-[0_40px_80px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)]
                backdrop-blur-sm bg-[#0D0A18]">

                {/* Browser bar */}
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/6
                  bg-[#110D1E]/80">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                  </div>
                  <div className="flex-1 max-w-xs mx-auto h-6 rounded-lg bg-white/4
                    border border-white/6 flex items-center justify-center
                    text-[11px] text-white/30 font-mono tracking-tight">
                    app.applyiq.com/dashboard
                  </div>
                  <div className="w-16 h-5 rounded bg-white/3" />
                </div>

                {/* Dashboard content */}
                <div className="p-5 flex flex-col gap-4" style={{ minHeight: 420 }}>

                  {/* Dashboard header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-5 rounded-md bg-linear-to-br from-purple-500 to-violet-600
                          flex items-center justify-center">
                          <Zap className="w-3 h-3 text-white" strokeWidth={2.5} />
                        </div>
                        <h2 className="text-white/90 font-bold text-sm">Good morning, Rahul 👋</h2>
                      </div>
                      <p className="text-white/30 text-xs">You have 3 follow-ups due today</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs
                        font-semibold text-white bg-linear-to-r from-purple-600 to-violet-600
                        shadow-md shadow-purple-500/20">
                        <span>+</span> Add Job
                      </button>
                    </div>
                  </div>

                  {/* Stat cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { icon: "📤", label: "Applied", value: "47", sub: "+8 this week", c: "from-purple-500/10 to-violet-500/10" },
                      { icon: "📬", label: "Response Rate", value: "24%", sub: "↑ 6% avg", c: "from-blue-500/10 to-indigo-500/10" },
                      { icon: "🗓", label: "Interviews", value: "3", sub: "2 this week", c: "from-emerald-500/10 to-teal-500/10" },
                      { icon: "🔥", label: "Day Streak", value: "12", sub: "Personal best!", c: "from-orange-500/10 to-amber-500/10" },
                    ].map((s, i) => (
                      <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        className={`p-3 md:p-3.5 rounded-xl border border-white/6
                          bg-white/2 backdrop-blur-sm`}
                      >
                        <div className="text-base md:text-lg mb-1 md:mb-1.5">{s.icon}</div>
                        <div className="text-white/90 font-bold text-lg md:text-xl leading-none mb-1">{s.value}</div>
                        <div className="text-white/40 text-[9px] md:text-[10px] font-medium">{s.label}</div>
                        <div className="text-white/25 text-[8px] md:text-[9px] mt-0.5">{s.sub}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Kanban columns */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 flex-1">
                    {[
                      {
                        label: "Saved", count: 2,
                        color: "text-blue-400", borderColor: "border-blue-500/20",
                        jobs: [
                          { company: "Notion", role: "Product Designer", match: 72, status: "Saved", statusColor: "text-blue-400 border-blue-400/20 bg-blue-400/5" },
                          { company: "Linear", role: "Frontend Eng.", match: 68, status: "Saved", statusColor: "text-blue-400 border-blue-400/20 bg-blue-400/5" },
                        ]
                      },
                      {
                        label: "Applied", count: 4,
                        color: "text-amber-400", borderColor: "border-amber-500/20",
                        jobs: [
                          { company: "Stripe", role: "Sr. Frontend Engineer", match: 91, status: "Applied", statusColor: "text-amber-400 border-amber-400/20 bg-amber-400/5" },
                          { company: "Figma", role: "React Developer", match: 84, status: "Applied", statusColor: "text-amber-400 border-amber-400/20 bg-amber-400/5" },
                        ]
                      },
                      {
                        label: "Interview", count: 1,
                        color: "text-emerald-400", borderColor: "border-emerald-500/20",
                        jobs: [
                          { company: "Vercel", role: "DX Engineer", match: 95, status: "Interview", statusColor: "text-emerald-400 border-emerald-400/20 bg-emerald-400/5" },
                        ]
                      },
                      {
                        label: "Offer", count: 0,
                        color: "text-purple-400", borderColor: "border-purple-500/20",
                        jobs: []
                      },
                      {
                        label: "Rejected", count: 2,
                        color: "text-red-400", borderColor: "border-red-500/20",
                        jobs: [
                          { company: "Airbnb", role: "Staff Engineer", match: 61, status: "Rejected", statusColor: "text-red-400 border-red-400/20 bg-red-400/5" },
                        ]
                      },
                    ].map((col, ci) => (
                      <div key={col.label} className={`rounded-xl p-2 md:p-2.5 border ${col.borderColor}
                        bg-white/2 flex flex-col gap-2 ${ci >= 2 ? "hidden sm:flex" : "flex"} ${ci >= 3 ? "sm:hidden md:flex" : ""}`}>
                        <div className="flex items-center justify-between px-0.5">
                          <span className={`text-[10px] font-bold ${col.color}`}>{col.label}</span>
                          <span className="text-[9px] text-white/20 font-semibold
                            bg-white/5 px-1.5 py-0.5 rounded-full">{col.count}</span>
                        </div>
                        {col.jobs.map((j, ji) => (
                          <JobCard key={ji} {...j} delay={0.8 + ci * 0.1 + ji * 0.05} />
                        ))}
                        {col.jobs.length === 0 && (
                          <div className="flex-1 flex items-center justify-center
                            text-[10px] text-white/15 text-center py-4 leading-relaxed">
                            🎉<br />Your offer<br />lands here
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            FEATURES — bento grid layout
        ═══════════════════════════════════════ */}
        <section id="features" className="relative z-10 px-6 lg:px-16 py-20">
          <div className="max-w-7xl mx-auto">

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <p className="text-xs font-bold text-purple-400 uppercase tracking-[0.2em] mb-3">Features</p>
              <h2 className="text-[clamp(28px,4vw,52px)] font-bold text-white tracking-tight leading-tight">
                Everything you need to<br />
                <span className="text-white/30">get hired faster.</span>
              </h2>
            </motion.div>

            {/* Bento grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Big card — AI coach */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="md:col-span-2 relative rounded-2xl overflow-hidden border border-border-subtle
                  bg-linear-to-br from-purple-900/20 via-[#0D0A18] to-violet-900/10
                  p-7 group hover:border-purple-500/20 transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full
                  blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/20 transition-colors" />
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20
                    flex items-center justify-center mb-4">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">AI Career Coach</h3>
                  <p className="text-text-secondary text-sm leading-relaxed max-w-sm">
                    Paste any job description. Grok AI scores your resume, identifies gaps,
                    drafts your cover letter, and preps you for interviews — in seconds.
                  </p>
                  <div className="mt-6 space-y-2">
                    {[
                      "Resume match score with missing keywords",
                      "Personalized cover letter draft",
                      "Likely interview questions + model answers",
                    ].map(f => (
                      <div key={f} className="flex items-center gap-2.5 text-sm text-text-secondary">
                        <CheckCircle className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Kanban card */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="rounded-2xl border border-border-subtle
                  bg-linear-to-br from-[#0D0A18] to-blue-900/10
                  p-7 group hover:border-blue-500/20 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20
                  flex items-center justify-center mb-4">
                  <LayoutDashboard className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">Smart Kanban</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Drag and drop jobs across stages. Visual, fast, and satisfying. See your whole
                  pipeline at a glance.
                </p>
              </motion.div>

              {/* Analytics card */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="rounded-2xl border border-border-subtle
                  bg-linear-to-br from-[#0D0A18] to-emerald-900/10
                  p-7 group hover:border-emerald-500/20 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20
                  flex items-center justify-center mb-4">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">Analytics & Insights</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Response rates, application funnels, streak tracking. Know exactly what's working.
                </p>
              </motion.div>

              {/* Resume analyzer */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="md:col-span-2 rounded-2xl border border-border-subtle
                  bg-linear-to-br from-[#0D0A18] via-fuchsia-900/10 to-[#0D0A18]
                  p-7 group hover:border-fuchsia-500/20 transition-all duration-300
                  flex flex-col md:flex-row gap-6 items-start"
              >
                <div className="flex-1">
                  <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20
                    flex items-center justify-center mb-4">
                    <FileSearch className="w-5 h-5 text-fuchsia-400" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">Resume Analyzer</h3>
                  <p className="text-text-secondary text-sm leading-relaxed max-w-xs">
                    Upload your PDF resume once. Every job you add gets instantly analyzed
                    against your skills and experience.
                  </p>
                </div>
                {/* Mini score demo */}
                <div className="shrink-0 w-full md:w-48">
                  <GlassCard className="p-4">
                    <div className="relative w-20 h-20 mx-auto mb-3">
                      <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
                        <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                        <circle cx="40" cy="40" r="32" fill="none"
                          stroke="url(#scoreGrad)" strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray="201"
                          strokeDashoffset="36"
                        />
                        <defs>
                          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#7C3AED" />
                            <stop offset="100%" stopColor="#A855F7" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-text-primary font-bold text-lg leading-none">84%</span>
                        <span className="text-text-tertiary text-[9px]">match</span>
                      </div>
                    </div>
                    <p className="text-center text-[10px] text-text-tertiary">Stripe · Sr. Frontend Eng.</p>
                  </GlassCard>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            CTA SECTION
        ═══════════════════════════════════════ */}
        <section className="relative z-10 px-6 lg:px-16 py-20">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative rounded-3xl overflow-hidden
                border border-border-subtle
                bg-linear-to-br from-purple-900/40 via-[#0D0A18] to-violet-900/30
                p-12 text-center"
            >
              {/* Background orbs inside CTA */}
              <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />

              <div className="relative">
                <p className="text-xs font-bold text-purple-400 uppercase tracking-[0.2em] mb-4">
                  Free to start — no credit card
                </p>
                <h2 className="text-[clamp(28px,5vw,600px)] font-bold text-white tracking-tight mb-4">
                  Your next offer starts here.
                </h2>
                <p className="text-white/40 text-base md:text-lg mb-8 max-w-lg mx-auto">
                  Join thousands of job seekers who stopped stressing and started landing.
                </p>
                <Link href="/signup"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl
                  text-base font-semibold text-white
                  bg-linear-to-r from-purple-600 via-violet-600 to-purple-700
                  shadow-[0_0_40px_rgba(124,58,237,0.5)]
                  hover:shadow-[0_0_60px_rgba(124,58,237,0.7)]
                  hover:-translate-y-0.5 transition-all duration-200">
                  Get started for free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="relative z-10 px-6 lg:px-16 py-10 border-t border-border-subtle">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-linear-to-br from-purple-500 to-violet-600
                flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-white/60 font-semibold text-sm">ApplyIQ</span>
            </div>
            <div className="flex items-center gap-6">
              {["Privacy", "Terms", "Contact"].map(l => (
                <Link key={l} href="#"
                  className="text-xs text-white/30 hover:text-white/60 transition-colors">
                  {l}
                </Link>
              ))}
            </div>
            <p className="text-xs text-white/20">© 2026 ApplyIQ. All rights reserved.</p>
          </div>
        </footer>

      </div>
    </div>
  );
}