"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { useLoading } from "@/components/providers/LoadingProvider";

export function ForgotPasswordForm() {
  const router = useRouter();
  
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { setGlobalLoading } = useLoading();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to request reset");
      
      toast.success(data.message);
      setStep("reset");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to reset password");
      
      toast.success("Password reset successfully! Please sign in.");
      router.push("/login");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setGlobalLoading(false);
    }
  };

  const inputClass = "w-full h-12 bg-bg-surface-elevated border border-border-default rounded-md px-4 text-sm text-text-primary placeholder:text-text-tertiary/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all";

  if (step === "reset") {
    return (
      <div className="w-full space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">Reset your password</h1>
          <p className="text-sm text-text-secondary">We sent a verification code to <strong>{email}</strong>.</p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider" htmlFor="otp">Verification Code</label>
            <input 
              id="otp" 
              placeholder="123456" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              required 
              maxLength={6}
              className={`${inputClass} text-center tracking-[0.5em] font-mono text-xl`} 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider" htmlFor="password">New Password</label>
            <div className="relative">
              <input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required 
                minLength={6} 
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
          <button type="submit" className="w-full h-11 bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded-md transition-all shadow-md shadow-primary/20">
            Reset Password
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary">
          <button onClick={() => setStep("request")} className="text-primary font-semibold hover:underline">
            Didn&apos;t receive the code? Try again
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">Forgot password?</h1>
        <p className="text-sm text-text-secondary">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleRequestOtp} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider" htmlFor="email">
            Email Address
          </label>
          <input 
            id="email" 
            type="email" 
            placeholder="name@example.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            className={inputClass} 
          />
        </div>
        <button type="submit" className="w-full h-11 bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded-md transition-all shadow-md shadow-primary/20">
          Send Reset Code
        </button>
      </form>

      <p className="text-center text-sm text-text-secondary">
        Remember your password?{" "}
        <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
