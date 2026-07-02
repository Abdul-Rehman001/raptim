import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";
import { Inter, Satisfy } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
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
            --font-inter: 'Inter', sans-serif;
          }
          body {
            font-family: 'Inter', sans-serif !important;
            letter-spacing: -0.01em !important;
          }
        `}} />
      </head>
      <body className={`antialiased bg-bg-base text-text-primary min-h-screen ${inter.variable} ${satisfy.variable}`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <Toaster
              position="top-center"
              toastOptions={{
                className: "!bg-bg-surface !text-text-primary !border !border-border-subtle !shadow-lg !rounded-lg !text-sm !font-medium",
                style: {
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: '-0.01em',
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
