/**
 * app/dashboard/page.tsx
 *
 * Protected dashboard placeholder. Verifies the session server-side,
 * calls POST /api/auth/session/ on Django to confirm the API can read the
 * user's JWT, and renders a confirmation screen.
 *
 * This is a wireframe-level page — polished UI will replace it once
 * designs land (per plan §9 note).
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface DjangoUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  created_at: string;
}

async function getDjangoUser(accessToken: string): Promise<DjangoUser | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  try {
    const res = await fetch(`${apiUrl}/api/auth/session/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[atlas-app] Django session call failed:", res.status, await res.text());
      return null;
    }
    const json = await res.json();
    return json.user ?? null;
  } catch (err) {
    console.error("[atlas-app] Django session call threw:", err);
    return null;
  }
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const astroUrl = process.env.NEXT_PUBLIC_ASTRO_URL ?? "http://localhost:4321";
    redirect(`${astroUrl}/signin`);
  }

  const djangoUser = await getDjangoUser(session.access_token);

  return (
    <main
      style={{
        fontFamily: "Inter, sans-serif",
        maxWidth: 640,
        margin: "4rem auto",
        padding: "0 1.5rem",
        color: "#1a1a1a",
      }}
    >
      <h1 style={{ fontFamily: "EB Garamond, serif", fontSize: "2.5rem", fontWeight: 400, marginBottom: "0.25rem" }}>
        ✦ Atlas
      </h1>
      <p style={{ color: "#666", marginBottom: "2rem" }}>Step 1 verification — auth scaffold</p>

      <section style={{ borderTop: "1px solid #e5e5e5", paddingTop: "1.5rem", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "0.8125rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "#999", marginBottom: "0.75rem" }}>
          Supabase session
        </h2>
        <p><strong>User ID:</strong> {session.user.id}</p>
        <p><strong>Email:</strong> {session.user.email}</p>
        <p><strong>Name:</strong> {session.user.user_metadata?.full_name ?? "—"}</p>
        <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "#4ade80" }}>
          ✓ Next.js session cookie is valid
        </p>
      </section>

      <section style={{ borderTop: "1px solid #e5e5e5", paddingTop: "1.5rem" }}>
        <h2 style={{ fontSize: "0.8125rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "#999", marginBottom: "0.75rem" }}>
          Django API — POST /api/auth/session/
        </h2>
        {djangoUser ? (
          <>
            <p><strong>Django user ID:</strong> {djangoUser.id}</p>
            <p><strong>Email:</strong> {djangoUser.email}</p>
            <p><strong>Full name:</strong> {djangoUser.full_name || "—"}</p>
            <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "#4ade80" }}>
              ✓ Django JWT verification + upsert successful
            </p>
          </>
        ) : (
          <p style={{ fontSize: "0.875rem", color: "#f87171" }}>
            ✗ Django API call failed — make sure atlas-api is running on port 8000
            and SUPABASE_JWT_SECRET is set in atlas-api/.env
          </p>
        )}
      </section>
    </main>
  );
}
