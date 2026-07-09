import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Upstash Rate Limiter (300 requests per 1 minute per IP)
let ratelimit: Ratelimit | undefined;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(300, "1 m"),
    analytics: true,
  });
}

const { auth } = NextAuth(authConfig);

export default auth(async (req: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => {
  const { nextUrl } = req;
  const isApiRoute = nextUrl.pathname.startsWith("/api");

  // --- 1. RATE LIMITING (Runs at the Edge before hitting our servers) ---
  const isPrefetch = req.headers.get("next-router-prefetch") === "1" || req.headers.get("purpose") === "prefetch";
  
  if (ratelimit && !isPrefetch) {
    // Get IP address (Vercel sets x-forwarded-for automatically)
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    try {
      const { success } = await ratelimit.limit(`ratelimit_${ip}`);
      
      if (!success) {
        if (isApiRoute) {
          return NextResponse.json({ error: "Too Many Requests. Please wait a minute." }, { status: 429 });
        }
        return new NextResponse("Too Many Requests. Please wait a minute.", { status: 429 });
      }
    } catch (error) {
      console.error("Rate Limiter Error:", error);
      // Fall through and allow the request if the rate limiter fails (Fail Open)
    }
  }

  // --- 2. AUTHENTICATION & ROUTING ---
  const session = req.auth;
  const isLoggedIn = !!session?.user;
  const completedOnboarding = session?.user?.completedOnboarding ?? true;

  // Let API routes pass through to their handlers after rate limiting
  if (isApiRoute) {
    return NextResponse.next();
  }

  const isOnOnboarding = nextUrl.pathname.startsWith("/onboarding");
  const isOnAuth =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/signup") ||
    nextUrl.pathname.startsWith("/forgot-password");
    
  const isOnDashboard =
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/jobs") ||
    nextUrl.pathname.startsWith("/settings") ||
    nextUrl.pathname.startsWith("/analytics") ||
    nextUrl.pathname.startsWith("/ai-coach");

  // Redirect new users to onboarding
  if (isLoggedIn && !completedOnboarding && !isOnOnboarding) {
    return NextResponse.redirect(new URL("/onboarding", nextUrl));
  }

  // Redirect logged-in completed users away from auth pages
  if (isLoggedIn && isOnAuth && completedOnboarding) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Protect dashboard/onboarding for unauthenticated users
  if (!isLoggedIn && (isOnDashboard || isOnOnboarding)) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // Exclude NextAuth API, static files, and images from middleware
  // We WANT other /api routes to be matched so they get rate limited!
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
