import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";


const { auth } = NextAuth(authConfig);

export default auth((req: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoggedIn = !!session?.user;
  const completedOnboarding = session?.user?.completedOnboarding ?? true;

  const isOnOnboarding = nextUrl.pathname.startsWith("/onboarding");
  const isOnAuth =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/signup");
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
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
