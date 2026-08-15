/**
 * middleware.ts (Next.js root middleware)
 *
 * Runs on every matched request. Responsibilities:
 * 1. Refresh the Supabase session (keeps the auth cookie alive).
 * 2. Redirect unauthenticated users to the Astro sign-in page.
 *
 * Protected routes: everything under /dashboard and /api (client-triggered
 * fetches). Public routes: /auth/callback (needs to set the cookie first).
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/auth/callback",
  "/auth/login",
  "/manifest.webmanifest",
  "/manifest.json",
  "/apple-touch-icon.png",
  "/icons",
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

  // IMPORTANT: getUser() must be called to refresh the session — don't skip.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!user && !isPublicPath) {
    const astroUrl = process.env.NEXT_PUBLIC_ASTRO_URL ?? "http://localhost:4321";
    return NextResponse.redirect(`${astroUrl}/signin`);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Match all paths except Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
