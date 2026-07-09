"use client";

import Image from "next/image";
import { SessionProvider } from "next-auth/react";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-bg-base flex flex-col">
        {/* Simple logo-only header */}
        <header className="px-6 py-5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <Image src="/logo.svg" alt="Raptim" width={32} height={32} className="object-contain" />
          </div>
          <span className="font-extrabold text-lg text-text-primary tracking-tight">Raptim</span>
        </header>

        {/* Centered content area */}
        <main className="flex-1 flex items-start justify-center px-4 pt-6 pb-16">
          <div className="w-full max-w-xl">
            {children}
          </div>
        </main>
      </div>
    </SessionProvider>
  );
}
