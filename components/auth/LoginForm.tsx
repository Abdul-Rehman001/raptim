"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useLoading } from "@/components/providers/LoadingProvider";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { setGlobalLoading } = useLoading();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalLoading(true);
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        toast.error("Invalid credentials");
      } else {
        setIsSuccess(true);
        toast.success("Welcome back!");
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1500);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setGoogleLoading(true);
    signIn("google", { callbackUrl: "/dashboard" });
  };

  const inputClass = "w-full h-12 bg-bg-surface-elevated border border-border-default rounded-md px-4 text-sm text-text-primary placeholder:text-text-tertiary/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all";

  if (isSuccess) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12 space-y-4">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"
        >
          <CheckCircle2 className="w-10 h-10" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h2 className="text-xl font-bold text-text-primary">Authenticated</h2>
          <p className="text-sm text-text-secondary">Redirecting to dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">Sign in to your account</h1>
        <p className="text-sm text-text-secondary">
          Enter your details below to access your dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider" htmlFor="email">
            Email Address
          </label>
          <input id="email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider" htmlFor="password">Password</label>
            <button type="button" onClick={() => toast.error("Password reset is currently disabled.")} className="text-xs text-primary font-semibold hover:underline">Forgot?</button>
          </div>
          <div className="relative">
            <input 
              id="password" 
              type={showPassword ? "text" : "password"} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className={inputClass} 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <button type="submit" className="w-full h-11 bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded-md transition-all shadow-md shadow-primary/20 disabled:opacity-50" disabled={googleLoading}>
          Continue
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border-subtle" /></div>
        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
          <span className="bg-bg-base px-3 text-text-tertiary">Or connect with</span>
        </div>
      </div>

      <button 
        className="w-full h-11 rounded-md bg-bg-surface-elevated border border-border-default text-text-primary font-semibold text-sm hover:bg-bg-surface-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50" 
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
      >
        {googleLoading ? (
          <div className="w-4 h-4 border-2 border-text-tertiary border-t-text-primary rounded-full animate-spin"></div>
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        )}
        {googleLoading ? "Connecting..." : "Google"}
      </button>

      <p className="text-center text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary font-semibold hover:underline">Sign up</Link>
      </p>
    </div>
  );
}
