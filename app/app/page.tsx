import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Atlas",
  description: "A centralized dashboard for all your tasks.",
};

export default async function HomePage() {
  // If user already has a session, skip the landing page and go straight to dashboard
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .landing-body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #ffffff; color: #111827; min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column; }
        .landing-main { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0; }
        .landing-logo { width: 80px; height: auto; object-fit: contain; margin-bottom: 1rem; }
        .landing-wordmark { font-family: 'EB Garamond', Georgia, serif; font-size: 2.75rem; font-weight: 500; letter-spacing: -0.01em; line-height: 1; margin-bottom: 0.75rem; }
        .landing-tagline { font-size: 0.95rem; color: #6b7280; margin-bottom: 2.5rem; font-weight: 400; }
        .landing-btn { display: inline-flex; align-items: center; justify-content: center; padding: 0.75rem 2rem; background: #000000; color: #ffffff; border: none; border-radius: 8px; font-family: 'Inter', sans-serif; font-size: 0.9rem; font-weight: 500; cursor: pointer; text-decoration: none; transition: background 0.15s ease; }
        .landing-btn:hover { background: #262626; }
        .landing-footer { position: fixed; bottom: 1.5rem; font-size: 0.8125rem; color: #9ca3af; }
      `}</style>
      <div className="landing-body">
        <main className="landing-main">
          <Image src="/atlas_logo.png" alt="Atlas Logo" width={80} height={80} className="landing-logo" priority style={{ objectFit: "contain" }} />
          <h1 className="landing-wordmark">Atlas</h1>
          <p className="landing-tagline">A centralized dashboard for all your tasks.</p>
          <Link href="/signin" className="landing-btn">Log in</Link>
        </main>
        <footer className="landing-footer">Atlas &copy; {new Date().getFullYear()}</footer>
      </div>
    </>
  );
}
