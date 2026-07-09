// Trigger CI build
/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  ArrowRight, Sparkles, LayoutDashboard, FileSearch,
  TrendingUp, CheckCircle, Zap, Phone, MapPin,
  Flame, Send, Mail, Calendar, PartyPopper, Link2, Target, CheckCircle2
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
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) throw new Error("Failed to send message");
      
      toast.success("Message sent successfully! We'll be in touch.");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dark">
      <div className="relative min-h-screen bg-bg-base overflow-x-hidden font-sans transition-colors duration-300">

        {/* ── GRADIENT MESH BACKGROUND ── */}
        <div className="fixed inset-0 pointer-events-none z-0 bg-[#0D0A18]">
          {/* Primary purple orb */}
          <div className="absolute -top-40 -left-40 w-175 h-175 rounded-full
            bg-[#2E1065]/20 blur-[120px] animate-[drift_14s_ease-in-out_infinite_alternate]" />
          {/* Secondary violet orb */}
          <div className="absolute top-1/4 -right-20 w-125 h-125 rounded-full
            bg-[#4C1D95]/15 blur-[100px] animate-[drift_18s_ease-in-out_4s_infinite_alternate-reverse]" />
          {/* Accent pink-indigo orb */}
          <div className="absolute bottom-1/3 left-1/3 w-100 h-100 rounded-full
            bg-[#312E81]/10 blur-[90px] animate-[drift_16s_ease-in-out_8s_infinite_alternate]" />
          {/* Bottom right soft pink */}
          <div className="absolute -bottom-20 right-0 w-87.5 h-87.5 rounded-full
            bg-[#2E1065]/15 blur-[80px] animate-[drift_20s_ease-in-out_2s_infinite_alternate-reverse]" />

          {/* Fine grid overlay */}
          <div className="absolute inset-0 opacity-[0.01] pointer-events-none text-white"
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
        <nav className="fixed top-0 left-0 right-0 z-50 h-15 px-6 lg:px-16
          backdrop-blur-2xl bg-black/20 border-b border-border-subtle">
          <div className="max-w-7xl mx-auto w-full h-full flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <Image src="/logo.svg" alt="Raptim" width={32} height={32} className="w-full h-full object-contain" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">Raptim</span>
            </Link>

            {/* Center links — hidden on mobile */}
            <div className="hidden md:flex items-center gap-1">
              {[
                { label: "Features", href: "#features" },
                { label: "How it works", href: "#how-it-works" },
                { label: "About", href: "#about" }
              ].map(l => (
                <Link key={l.label} href={l.href}
                  className="px-4 py-1.5 text-sm text-white/50 hover:text-white
                  rounded-lg hover:bg-white/6 transition-all duration-150 font-normal">
                  {l.label}
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
                className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold
                bg-linear-to-r from-purple-500 to-purple-800 text-white
                shadow-sm hover:-translate-y-px transition-all duration-200">
                Get started
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </nav>

        {/* ═══════════════════════════════════════
            HERO SECTION
        ═══════════════════════════════════════ */}
        <section className="relative z-10 pt-32 pb-10 px-6 lg:px-16">
          <div className="max-w-7xl mx-auto">


            {/* ── Main heading + CTA — asymmetric layout ── */}
            <div className="grid lg:grid-cols-[1fr_420px] gap-12 lg:gap-16 items-start">

              {/* Left: text */}
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="text-[clamp(44px,7vw,88px)] font-semibold leading-[1.05] md:leading-none tracking-[-0.03em] text-white mb-6"
                >
                  Your job search,{" "}
                  <br />
                  <span className="text-purple-400">
                    finally organized.
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-lg text-white/50 leading-relaxed max-w-xl mb-8 font-light"
                >
                  Stop juggling spreadsheets and sticky notes.
                  Raptim tracks every application, scores your resume with AI,
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
                    className="group flex items-center justify-center gap-2 px-7 py-3.5 rounded-md
                    text-sm font-semibold text-white
                    bg-linear-to-r from-purple-500 to-purple-800
                    shadow-sm hover:-translate-y-0.5 transition-all duration-200">
                    Start for free
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link href="#about"
                    className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-md
                    text-sm font-semibold text-text-secondary
                    backdrop-blur-xl bg-white/2 border border-border-subtle
                    hover:bg-white/6 hover:text-text-primary hover:border-border-default
                    transition-all duration-200">
                    Learn more
                  </Link>
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
                    border border-orange-500/20 flex items-center justify-center shrink-0">
                    <Flame className="w-5 h-5 text-orange-400" />
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

              {/* Glassmorphism Dashboard Container */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10
                shadow-[0_40px_80px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]
                backdrop-blur-2xl bg-white/5">

                {/* Status Bar */}
                <div className="flex items-center justify-center px-5 py-3 border-b border-white/10 bg-white/5">
                   <div className="flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                     <span className="text-[10px] font-semibold text-white/50 uppercase tracking-widest">Live Pipeline</span>
                   </div>
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
                        <h2 className="text-white/90 font-bold text-sm">Good morning, Rahul</h2>
                      </div>
                      <p className="text-white/30 text-xs">You have 3 follow-ups due today</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs
                        font-semibold text-white bg-linear-to-r from-purple-500 to-purple-800
                        shadow-sm">
                        <span>+</span> Add Job
                      </button>
                    </div>
                  </div>

                  {/* Stat cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { icon: <Send className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />, label: "Applied", value: "47", sub: "+8 this week", c: "from-purple-500/10 to-violet-500/10" },
                      { icon: <Mail className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />, label: "Response Rate", value: "24%", sub: "↑ 6% avg", c: "from-blue-500/10 to-indigo-500/10" },
                      { icon: <Calendar className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />, label: "Interviews", value: "3", sub: "2 this week", c: "from-emerald-500/10 to-teal-500/10" },
                      { icon: <Flame className="w-4 h-4 md:w-5 md:h-5 text-orange-400" />, label: "Day Streak", value: "12", sub: "Personal best!", c: "from-orange-500/10 to-amber-500/10" },
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
                          <div className="flex-1 flex flex-col items-center justify-center
                            text-[10px] text-white/15 text-center py-4 leading-relaxed">
                            <PartyPopper className="w-6 h-6 text-white/20 mb-2" />
                            Your offer<br />lands here
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
            HOW IT WORKS
        ═══════════════════════════════════════ */}
        <section id="how-it-works" className="relative z-10 px-6 lg:px-16 py-20 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16 text-center"
            >
              <p className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-3">Simple Process</p>
              <h2 className="text-[clamp(28px,4vw,52px)] font-semibold text-white tracking-tight leading-tight">
                How Raptim works.
              </h2>
            </motion.div>

            <div className="flex flex-col gap-12 relative max-w-5xl mx-auto mt-20">
              {/* Vertical connecting line */}
              <div className="absolute top-0 bottom-0 left-8 md:left-1/2 w-px bg-white/5 -translate-x-1/2" />
              
              {[
                { 
                  step: "01", 
                  title: "Save any job instantly", 
                  desc: "Found a role on LinkedIn or a company career page? Just paste the URL. Raptim's engine automatically extracts the title, company, description, and key requirements.",
                  icon: <Link2 className="w-5 h-5 text-purple-400" />,
                  features: ["Auto-extracts job details", "Works with any URL", "Saves to Kanban board"]
                },
                { 
                  step: "02", 
                  title: "AI Match & Resume Gap Analysis", 
                  desc: "Stop guessing what recruiters want. Our AI compares the job description directly against your resume, providing a clear match score and highlighting missing keywords.",
                  icon: <Target className="w-5 h-5 text-emerald-400" />,
                  features: ["Detailed Match Score", "Missing Keywords", "Resume Optimization Tips"]
                },
                { 
                  step: "03", 
                  title: "Generate Tailored Outreach", 
                  desc: "Ready to apply? Generate a highly-personalized cover letter or a networking message for recruiters on LinkedIn—contextualized perfectly to your resume.",
                  icon: <Mail className="w-5 h-5 text-blue-400" />,
                  features: ["Contextual Cover Letters", "LinkedIn Outreach Messages", "One-click copy"]
                }
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                  className={`relative flex flex-col md:flex-row items-center gap-12 md:gap-24 ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
                >
                  {/* Timeline node */}
                  <div className="absolute left-8 md:left-1/2 w-12 h-12 rounded-full bg-[#0D0A18] border border-white/10 shadow-sm flex items-center justify-center -translate-x-1/2 z-10">
                    <span className="text-sm font-semibold text-white">{item.step}</span>
                  </div>

                  {/* Content (Text) */}
                  <div className={`w-full pl-24 md:pl-0 md:w-1/2 ${i % 2 === 0 ? 'md:pr-8 md:text-right flex flex-col md:items-end' : 'md:pl-8 text-left flex flex-col items-start'}`}>
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 border border-white/10 mb-5">
                      {item.icon}
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-3 tracking-tight">{item.title}</h3>
                    <p className="text-white/50 leading-relaxed mb-6 font-light">{item.desc}</p>
                    <ul className="flex flex-col gap-2.5">
                      {item.features.map(f => (
                        <li key={f} className={`flex items-center gap-2.5 text-sm text-white/70 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                          <CheckCircle2 className="w-4 h-4 text-purple-400 opacity-70" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Content (Visual UI) */}
                  <div className={`hidden md:block w-full md:w-1/2 ${i % 2 === 0 ? 'pl-8' : 'pr-8'}`}>
                     {i === 0 && (
                        <div className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm overflow-hidden group">
                           <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                           <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-black/40 mb-4 relative z-10">
                              <Link2 className="w-4 h-4 text-white/30" />
                              <span className="text-xs text-white/30 font-mono">https://linkedin.com/jobs/view/123</span>
                              <div className="ml-auto w-4 h-4 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                           </div>
                           <div className="bg-white/5 border border-white/10 rounded-xl p-4 relative z-10">
                              <div className="flex items-center gap-4 mb-4">
                                 <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                    <span className="text-blue-400 font-semibold text-xs">IN</span>
                                 </div>
                                 <div className="flex-1">
                                    <div className="w-2/3 h-2.5 bg-white/20 rounded mb-2" />
                                    <div className="w-1/2 h-2 bg-white/10 rounded" />
                                 </div>
                              </div>
                              <div className="flex gap-2">
                                <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[9px] text-white/40 font-medium tracking-wider uppercase">Full-time</span>
                                <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[9px] text-white/40 font-medium tracking-wider uppercase">Remote</span>
                              </div>
                           </div>
                        </div>
                     )}

                     {i === 1 && (
                        <div className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm overflow-hidden group">
                           <div className="absolute inset-0 bg-linear-to-bl from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                           <div className="flex items-center justify-between mb-6 relative z-10">
                              <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">AI Match Score</span>
                              <Target className="w-4 h-4 text-emerald-400 animate-pulse" />
                           </div>
                           <div className="flex items-center gap-8 relative z-10">
                              <div className="relative w-24 h-24 flex items-center justify-center">
                                 <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                                    <motion.path 
                                       initial={{ strokeDasharray: "0, 100" }}
                                       whileInView={{ strokeDasharray: "91, 100" }}
                                       transition={{ duration: 1.5, delay: 0.5 }}
                                       d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#34d399" strokeWidth="3" strokeDasharray="91, 100" />
                                 </svg>
                                 <span className="absolute text-2xl font-bold text-white">91<span className="text-xs text-white/50">%</span></span>
                              </div>
                              <div className="flex-1 space-y-2.5">
                                 <div className="flex items-center justify-between p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10">
                                    <span className="text-[11px] font-medium text-emerald-400">React.js</span>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                 </div>
                                 <div className="flex items-center justify-between p-2.5 rounded-lg border border-red-500/20 bg-red-500/10">
                                    <span className="text-[11px] font-medium text-red-400">GraphQL</span>
                                    <span className="text-[9px] uppercase tracking-wider text-red-400 font-semibold bg-red-500/20 px-1.5 py-0.5 rounded">Missing</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}

                     {i === 2 && (
                        <div className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm overflow-hidden group">
                           <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                           <div className="flex items-center justify-between mb-5 relative z-10">
                              <div className="flex items-center gap-2">
                                 <Mail className="w-4 h-4 text-blue-400" />
                                 <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">Drafting outreach</span>
                              </div>
                           </div>
                           <div className="space-y-3 relative z-10">
                              <div className="w-3/4 h-2 bg-white/20 rounded animate-pulse" />
                              <div className="w-full h-2 bg-white/10 rounded animate-pulse" style={{ animationDelay: "150ms" }} />
                              <div className="w-5/6 h-2 bg-white/10 rounded animate-pulse" style={{ animationDelay: "300ms" }} />
                              <div className="w-full h-2 bg-white/10 rounded animate-pulse" style={{ animationDelay: "450ms" }} />
                              <div className="w-1/2 h-2 bg-white/10 rounded animate-pulse" style={{ animationDelay: "600ms" }} />
                           </div>
                           <div className="mt-6 flex justify-end relative z-10">
                              <button className="px-3 py-1.5 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-semibold border border-blue-500/20 hover:bg-blue-500/20 transition-colors">
                                 Copy to Clipboard
                              </button>
                           </div>
                        </div>
                     )}
                  </div>
                </motion.div>
              ))}
            </div>
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
              <p className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-3">Platform Features</p>
              <h2 className="text-[clamp(28px,4vw,52px)] font-semibold text-white tracking-tight leading-tight">
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
                className="md:col-span-2 relative rounded-2xl overflow-hidden border border-white/10
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
                    Paste any job description. Raptim AI scores your resume, identifies gaps,
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
                className="rounded-2xl border border-white/10
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
                className="rounded-2xl border border-white/10
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
                className="md:col-span-2 rounded-2xl border border-white/10
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
            ABOUT SECTION
        ═══════════════════════════════════════ */}
        <section id="about" className="relative z-10 px-6 lg:px-16 py-20 border-t border-border-subtle">
          <div className="max-w-3xl mx-auto text-center">
             <p className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-3">About Raptim</p>
             <h2 className="text-3xl font-semibold text-white tracking-tight mb-6">
                Built for the modern job seeker.
             </h2>
             <p className="text-lg text-text-secondary leading-relaxed font-light">
                We believe the job search shouldn't be a black box. Raptim was created to give you the data, insights, and AI tooling previously only available to recruiters. By automating the repetitive tasks like resume matching and application tracking, we give you the time to focus on what actually gets you hired: preparing for interviews and having meaningful conversations.
             </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            CONTACT SECTION
        ═══════════════════════════════════════ */}
        <section id="contact" className="relative z-10 px-6 lg:px-16 py-20 border-t border-border-subtle">
          <div className="max-w-5xl mx-auto">
             <div className="text-center mb-12">
               <p className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-3">Get in Touch</p>
               <h2 className="text-3xl font-semibold text-white tracking-tight mb-4">
                  Have questions or feedback?
               </h2>
               <p className="text-lg text-text-secondary leading-relaxed font-light">
                  We'd love to hear from you. Whether you have a feature request or need support, our inbox is always open.
               </p>
             </div>

             <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">
                {/* Contact Info */}
                <div className="flex flex-col gap-6">
                   <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                      <h3 className="text-lg font-semibold text-white mb-6">Contact Information</h3>
                      <div className="flex flex-col gap-5 text-sm text-text-secondary">
                          <a href="mailto:abdul.rehman.tahir7377@gmail.com" className="flex items-center gap-3 hover:text-white transition-colors">
                             <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                                <Mail className="w-4 h-4 text-purple-400" />
                             </div>
                             abdul.rehman.tahir7377@gmail.com
                          </a>
                          <a href="tel:+917619931243" className="flex items-center gap-3 hover:text-white transition-colors">
                             <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                                <Phone className="w-4 h-4 text-purple-400" />
                             </div>
                             +91 76199 31243
                          </a>
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                                <MapPin className="w-4 h-4 text-purple-400" />
                             </div>
                             Lucknow, India
                          </div>
                      </div>
                   </div>
                </div>

                {/* Form */}
                <form onSubmit={handleContactSubmit} className="flex flex-col gap-4 p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                   <div>
                     <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Name</label>
                     <input 
                       type="text" 
                       value={formData.name}
                       onChange={(e) => setFormData({...formData, name: e.target.value})}
                       className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:outline-hidden focus:border-purple-500/50 transition-colors"
                       placeholder="John Doe"
                       required
                     />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Email</label>
                     <input 
                       type="email" 
                       value={formData.email}
                       onChange={(e) => setFormData({...formData, email: e.target.value})}
                       className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:outline-hidden focus:border-purple-500/50 transition-colors"
                       placeholder="john@example.com"
                       required
                     />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Message</label>
                     <textarea 
                       value={formData.message}
                       onChange={(e) => setFormData({...formData, message: e.target.value})}
                       className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:outline-hidden focus:border-purple-500/50 transition-colors min-h-30 resize-y"
                       placeholder="How can we help?"
                       required
                     />
                   </div>
                   <button 
                     type="submit" 
                     disabled={isSubmitting}
                     className="mt-2 w-full flex items-center justify-center gap-2 py-3.5 rounded-lg font-semibold text-white bg-linear-to-r from-purple-500 to-purple-800 shadow-sm hover:opacity-90 disabled:opacity-50 transition-all"
                   >
                     {isSubmitting ? "Sending..." : "Send Message"}
                     {!isSubmitting && <Send className="w-4 h-4" />}
                   </button>
                </form>
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
                p-6 md:p-12 text-center"
            >
              {/* Background orbs inside CTA */}
              <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />

              <div className="relative">
                <p className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-4">
                  Free to start — no credit card
                </p>
                <h2 className="text-[clamp(28px,5vw,60px)] font-semibold text-white tracking-tight mb-4">
                  Your next offer starts here.
                </h2>
                <p className="text-white/40 text-sm sm:text-base md:text-lg mb-8 max-w-lg mx-auto">
                  Join thousands of job seekers who stopped stressing and started landing.
                </p>
                <Link href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-5 sm:px-8 py-3.5 sm:py-4 rounded-md
                  text-sm sm:text-base font-semibold text-white whitespace-nowrap
                  bg-linear-to-r from-purple-500 to-purple-800
                  shadow-sm hover:-translate-y-0.5 transition-all duration-200">
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
              <div className="w-6 h-6 rounded-md flex items-center justify-center">
                <Image src="/logo.svg" alt="Raptim" width={24} height={24} className="w-full h-full object-contain opacity-60" />
              </div>
              <span className="text-white/60 font-semibold text-sm">Raptim</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-xs text-white/30 hover:text-white/60 transition-colors">Privacy</Link>
              <Link href="/terms" className="text-xs text-white/30 hover:text-white/60 transition-colors">Terms</Link>
              <Link href="#contact" className="text-xs text-white/30 hover:text-white/60 transition-colors">Contact</Link>
            </div>
            <p className="text-xs text-white/20">© 2026 Raptim. All rights reserved.</p>
          </div>
        </footer>

      </div>
    </div>
  );
}