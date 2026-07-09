import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";
import { Geist, Satisfy } from 'next/font/google';
import { LoadingProvider } from "@/components/providers/LoadingProvider";

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });
const satisfy = Satisfy({ weight: '400', subsets: ['latin'], variable: '--font-satisfy' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://raptim.com'),
  title: {
    default: "Raptim - AI Job Tracker & Career Coach",
    template: "%s | Raptim"
  },
  description: "Stop juggling spreadsheets. Raptim tracks every application, scores your resume with AI, and coaches you from saved to signed offer.",
  keywords: ["job tracker", "ai career coach", "resume analyzer", "applicant tracking", "job search organizer"],
  authors: [{ name: "Raptim" }],
  creator: "Raptim",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Raptim - AI Job Tracker & Career Coach",
    description: "Track every job application, analyze your resume against job descriptions using AI, and land your next role faster.",
    siteName: "Raptim",
  },
  twitter: {
    card: "summary_large_image",
    title: "Raptim - AI Job Tracker & Career Coach",
    description: "Track every job application, analyze your resume against job descriptions using AI, and land your next role faster.",
    creator: "@raptim",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --font-geist: 'Geist', sans-serif;
          }
          body {
            font-family: 'Geist', sans-serif !important;
            letter-spacing: -0.01em !important;
          }
        `}} />
      </head>
      <body className={`antialiased bg-bg-base text-text-primary min-h-screen ${geist.variable} ${satisfy.variable}`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <LoadingProvider>
              <Toaster
                position="top-center"
                toastOptions={{
                  className: "!bg-bg-surface !text-text-primary !border !border-border-subtle !shadow-lg !rounded-lg !text-sm !font-medium",
                  style: {
                    fontFamily: "'Geist', sans-serif",
                    letterSpacing: '-0.01em',
                  },
                  duration: 3000,
                }}
              />
              {children}
            </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
