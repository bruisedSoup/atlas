import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    let response = NextResponse.redirect(new URL(next, origin));

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
            response = NextResponse.redirect(new URL(next, origin));
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return response;
    }
    console.error("[atlas-app] Code exchange error:", error.message);
    const astroUrl = process.env.NEXT_PUBLIC_ASTRO_URL ?? "http://localhost:4321";
    return NextResponse.redirect(`${astroUrl}/?auth_error=${encodeURIComponent(error.message)}`);
  }

  // If no code, check if error was passed from provider
  const errorMsg = searchParams.get("error_description") || searchParams.get("error") || "missing_code";
  const astroUrl = process.env.NEXT_PUBLIC_ASTRO_URL ?? "http://localhost:4321";
  return NextResponse.redirect(`${astroUrl}/?auth_error=${encodeURIComponent(errorMsg)}`);
}
