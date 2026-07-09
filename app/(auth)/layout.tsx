"use client";

import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const bgGradient = isLoginPage 
    ? "bg-linear-to-br from-purple-400 via-purple-600 to-purple-900 dark:from-purple-800 dark:via-[#2a0e4a] dark:to-[#0d041a]" 
    : "bg-linear-to-tr from-purple-800 via-purple-600 to-purple-400 dark:from-[#0d041a] dark:via-[#2a0e4a] dark:to-purple-800";

  const orb1 = isLoginPage ? '-top-[10%] -left-[10%] bg-purple-300/60 dark:bg-purple-500/30 animate-blob' : 'top-[20%] -right-[10%] bg-purple-400/50 dark:bg-purple-600/30 animate-blob';
  const orb2 = isLoginPage ? 'bottom-[-10%] right-[-10%] bg-purple-500/50 dark:bg-purple-700/40 animate-blob-slow' : '-bottom-[20%] -left-[10%] bg-purple-300/60 dark:bg-purple-500/30 animate-blob-slow';
  const orb3 = "top-[40%] left-[30%] bg-purple-200/40 dark:bg-purple-400/20 animate-blob-fast";
  return (
    <>
      <style>{`
        @keyframes blob-morph {
          0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
          100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
        }
        .animate-blob {
          animation: blob-morph 8s infinite alternate ease-in-out;
        }
        .animate-blob-slow {
          animation: blob-morph 12s infinite alternate-reverse ease-in-out;
        }
        .animate-blob-fast {
          animation: blob-morph 6s infinite alternate ease-in-out;
        }
      `}</style>
      <div className="min-h-screen grid lg:grid-cols-[60%_40%] bg-bg-base transition-all lg:p-4 lg:gap-4">
       {/* Left Side - Hero */}
       <div className={`hidden lg:flex flex-col justify-between p-12 text-white relative overflow-hidden lg:rounded-3xl ${bgGradient}`}>
          {/* Base Noise Texture */}
          <div 
            className="absolute inset-0 z-0 opacity-[0.2] mix-blend-overlay pointer-events-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
          />

          {/* Subtle Grid Pattern */}
          <div 
            className="absolute inset-0 z-0 opacity-30 pointer-events-none mix-blend-overlay"
            style={{ 
              backgroundImage: `linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)`,
              backgroundSize: '40px 40px' 
            }}
          />

          {/* Glassmorphism abstract shapes for modern feel */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            {/* Orb 1 */}
            <div className={`absolute w-[40vw] h-[40vw] blur-[100px] opacity-80 ${orb1}`} />
            
            {/* Orb 2 */}
            <div className={`absolute w-[50vw] h-[50vw] blur-[120px] opacity-70 ${orb2}`} />
            
            {/* Orb 3 - subtle accent */}
            <div className={`absolute w-[30vw] h-[30vw] blur-[90px] opacity-60 ${orb3}`} />
          </div>
          
          <div className="relative z-10 flex items-center gap-2.5">
             <div className="h-8 w-8 rounded-lg flex items-center justify-center">
                <Image src="/logo.svg" alt="Raptim" width={32} height={32} className="w-full h-full object-contain" />
             </div>
             <span className="text-xl font-bold tracking-tight text-white">
               Raptim
             </span>
          </div>

          <div className="relative z-10 max-w-lg mb-12">
             <h2 className="text-5xl font-extrabold text-white leading-tight mb-8 tracking-tight">
               Track smarter.<br/>
               <span className="text-white/95">Land faster!</span>
             </h2>
             <ul className="space-y-6">
                {[
                  { title: "ATS Compatibility Score", desc: "Instantly see how your resume matches any job description." },
                  { title: "AI-Powered Career Coach", desc: "Get specific, actionable advice to bridge your skill gaps." },
                  { title: "Smart Kanban Tracking", desc: "Manage your entire application funnel with visual simplicity." }
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-4 group">
                     <div className="mt-1.5 shrink-0">
                        <CheckCircle2 className="h-6 w-6 text-purple-400 group-hover:text-purple-300 transition-colors" />
                     </div>
                     <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-purple-200 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-white/60 leading-relaxed max-w-sm">
                          {feature.desc}
                        </p>
                     </div>
                  </li>
                ))}
             </ul>
          </div>

          <div className="relative z-10 text-xs text-white/30 font-medium">
             &copy; 2026 Raptim Inc. All rights reserved.
          </div>
       </div>

       {/* Right Side - Form */}
       <div className="flex flex-col items-center lg:items-start justify-center p-4 sm:p-8 lg:pl-12 xl:pl-20 bg-bg-base relative z-20 lg:rounded-3xl">
          <div className="w-full max-w-[440px]">
             {children}
          </div>
       </div>
    </div>
    </>
  )
}
