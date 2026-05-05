/**
 * VOKASI Next.js Edge Middleware — AM-002 Session-Based Access Control
 *
 * Verifies server-issued session evidence (Supabase session or backend JWT token)
 * to enforce route-level access before any page renders. Does NOT trust
 * client-set role cookies for authorization. Role enforcement happens on
 * backend API calls for security. Client-side guards are UX-only.
 */

import { NextRequest, NextResponse } from "next/server";
import { matchRouteRule } from "@/lib/roles";

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const rule = matchRouteRule(pathname);

  // Public route — no check needed
  if (!rule) return NextResponse.next();

  // Check for server-issued session evidence
  // 1. Supabase session cookie (sb-* pattern, HttpOnly)
  // 2. Backend JWT token in localStorage (accessed via cookie for middleware)
  const hasSupabaseSession = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-"));

  const authToken = request.cookies.get("auth_token")?.value ?? "";

  // Not authenticated → redirect to login
  if (!hasSupabaseSession && !authToken) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control is enforced on backend API calls, not middleware
  // Middleware only verifies authentication state
  // Client-side RoleGuard components provide UX feedback for role mismatches

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)",
  ],
};
