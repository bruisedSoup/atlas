/**
 * middleware.ts (Next.js root middleware)
 *
 * Runs on every matched request. Responsibilities:
 * 1. Refresh the Supabase session (keeps the auth cookie alive).
 * 2. Redirect unauthenticated users to /signin (same Next.js origin).
 *
 * Public routes (no auth required): /, /signin, /auth/*
 * Protected routes: /dashboard, /thevault, and anything else not listed above.
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/signin",
  "/auth/callback",
  "/auth/login",
  "/manifest.webmanifest",
  "/manifest.json",
  "/apple-touch-icon.png",
  "/icons",
  "/sw.js",
  "/favicon.ico",
  "/atlas_logo.png",
];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: getUser() must be called to refresh the session — do not skip.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (!user && !isPublicPath) {
    const signinUrl = new URL("/signin", request.nextUrl.origin);
    return NextResponse.redirect(signinUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Match all paths except Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|apple-touch-icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
