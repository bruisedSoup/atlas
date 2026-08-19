import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Sign in – Atlas",
  description: "Sign in to Atlas – A centralized dashboard for all your tasks.",
};

interface SignInPageProps {
  searchParams: Promise<{ auth_error?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const authError = params.auth_error;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');
        .signin-body { font-family: 'Inter', -apple-system, sans-serif; background-color: #ffffff; color: #111827; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1.5rem; margin: 0; }
        .signin-card { width: 100%; max-width: 380px; background: #ffffff; border: 1px solid #e2e4e8; border-radius: 14px; padding: 44px 32px 36px; display: flex; flex-direction: column; align-items: center; text-align: center; box-shadow: 0 4px 20px -2px rgba(0,0,0,0.03); }
        .signin-title { font-family: 'EB Garamond', Georgia, serif; font-size: 2rem; font-weight: 500; letter-spacing: -0.01em; color: #111827; line-height: 1.1; margin: 12px 0 24px; }
        .signin-tagline { font-size: 0.84rem; font-weight: 300; color: #6b7280; line-height: 1.4; margin-bottom: 40px; }
        .btn-demo { width: 100%; height: 42px; background: #ffffff; color: #1f2937; border: 1px solid #d1d5db; border-radius: 8px; font-family: 'Inter', sans-serif; font-size: 0.85rem; font-weight: 500; display: inline-flex; align-items: center; justify-content: center; text-decoration: none; cursor: not-allowed; opacity: 0.6; margin-bottom: 10px; }
        .btn-google { width: 100%; height: 42px; background: #000000; color: #ffffff; border: 1px solid #000000; border-radius: 8px; font-family: 'Inter', sans-serif; font-size: 0.85rem; font-weight: 500; display: inline-flex; align-items: center; justify-content: center; text-decoration: none; transition: background-color 0.15s ease; }
        .btn-google:hover { background-color: #262626; border-color: #262626; }
        .signin-helper { font-size: 0.72rem; color: #9ca3af; margin-top: 10px; letter-spacing: -0.01em; }
        .error-banner { width: 100%; margin-bottom: 1rem; padding: 0.625rem 0.875rem; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 6px; color: #991b1b; font-size: 0.8rem; text-align: left; }
      `}</style>
      <div className="signin-body">
        <main className="signin-card">
          <Image src="/atlas_logo.png" alt="Atlas Star Logo" width={72} height={72} style={{ objectFit: "contain" }} priority />
          <h1 className="signin-title">Atlas</h1>
          <p className="signin-tagline">A centralized dashboard for all your tasks.</p>
          {authError && <div className="error-banner">Sign-in error: {decodeURIComponent(authError)}</div>}
          <span className="btn-demo" aria-disabled="true">Try Demo Mode</span>
          <Link id="signin-google-btn" href="/auth/login" className="btn-google">Sign in with Google Account</Link>
          <p className="signin-helper">Sign in with your school Google Account</p>
        </main>
      </div>
    </>
  );
}
