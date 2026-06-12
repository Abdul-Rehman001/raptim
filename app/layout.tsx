import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";
import { Outfit, Satisfy } from 'next/font/google';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const satisfy = Satisfy({ weight: '400', subsets: ['latin'], variable: '--font-satisfy' });

export const metadata: Metadata = {
  title: "ApplyIQ - AI Job Tracker",
  description: "Track your job applications with AI coaching.",
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
            --font-outfit: 'Outfit', sans-serif;
          }
          body {
            font-family: 'Outfit', sans-serif !important;
            letter-spacing: 0.015em !important;
          }
        `}} />
      </head>
      <body className={`antialiased bg-bg-base text-text-primary min-h-screen ${outfit.variable} ${satisfy.variable}`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <Toaster
              position="top-center"
              toastOptions={{
                className: "!bg-bg-surface !text-text-primary !border !border-border-subtle !shadow-lg !rounded-xl !text-sm !font-medium",
                style: {
                  fontFamily: "'Outfit', sans-serif",
                  letterSpacing: '0.015em',
                },
                duration: 3000,
              }}
            />
            {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
