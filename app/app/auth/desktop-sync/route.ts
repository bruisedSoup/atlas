import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const refreshToken = searchParams.get("refresh_token");

  if (!refreshToken) {
    return NextResponse.redirect(`${origin}/signin?auth_error=missing_refresh_token`);
  }

  let response = NextResponse.redirect(`${origin}/dashboard`);

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
          response = NextResponse.redirect(`${origin}/dashboard`);
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
  
  if (!error) {
    return response;
  }
  
  console.error("[atlas-app] Sync error:", error.message);
  return NextResponse.redirect(
    `${origin}/signin?auth_error=${encodeURIComponent(error.message)}`
  );
}
