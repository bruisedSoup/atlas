import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { origin } = request.nextUrl;
  const cookieStore = request.cookies;

  let response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      scopes: "openid email profile",
    },
  });

  if (error || !data.url) {
    console.error("[atlas-app] /auth/login error:", error?.message);
    return NextResponse.redirect(
      `${origin}/signin?auth_error=${encodeURIComponent(error?.message ?? "oauth_init_failed")}`
    );
  }

  // Redirect to Google and preserve any set-cookie headers (PKCE verifier)
  const redirectResponse = NextResponse.redirect(data.url, 302);
  response.cookies.getAll().forEach((c) => {
    redirectResponse.cookies.set(c.name, c.value);
  });

  return redirectResponse;
}
