import Image from "next/image";

interface Props {
  searchParams: Promise<{ refresh_token?: string; nonce?: string }>;
}

export default async function DesktopSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const refreshToken = params.refresh_token ?? "";
  const nonce = params.nonce ?? "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');
        .success-body { font-family: 'Inter', -apple-system, sans-serif; background-color: #ffffff; color: #111827; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1.5rem; margin: 0; }
        .success-card { width: 100%; max-width: 380px; background: #ffffff; border: 1px solid #e2e4e8; border-radius: 14px; padding: 44px 32px 36px; display: flex; flex-direction: column; align-items: center; text-align: center; box-shadow: 0 4px 20px -2px rgba(0,0,0,0.03); }
        .success-title { font-family: 'EB Garamond', Georgia, serif; font-size: 2rem; font-weight: 500; letter-spacing: -0.01em; color: #111827; line-height: 1.1; margin: 12px 0 24px; }
        .success-tagline { font-size: 0.84rem; font-weight: 300; color: #6b7280; line-height: 1.4; margin-bottom: 40px; }
        .btn-continue { width: 100%; height: 42px; background: #000000; color: #ffffff; border: 1px solid #000000; border-radius: 8px; font-family: 'Inter', sans-serif; font-size: 0.85rem; font-weight: 500; display: inline-flex; align-items: center; justify-content: center; text-decoration: none; transition: background-color 0.15s ease; cursor: pointer; }
        .btn-continue:hover { background-color: #262626; border-color: #262626; }
        .helper-text { font-size: 0.72rem; color: #9ca3af; margin-top: 12px; letter-spacing: -0.01em; }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; display: inline-block; margin-right: 6px; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
      <script dangerouslySetInnerHTML={{ __html: `
        // As soon as this page loads, register the token with the desktop app's polling endpoint
        (async function() {
          try {
            await fetch('/api/auth/desktop-status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ nonce: ${JSON.stringify(nonce)}, refresh_token: ${JSON.stringify(refreshToken)} })
            });
          } catch(e) { console.error('Failed to post token', e); }
        })();
      `}} />
      <div className="success-body">
        <main className="success-card">
          <Image src="/atlas_logo.png" alt="Atlas Star Logo" width={72} height={72} style={{ objectFit: "contain" }} priority />
          <h1 className="success-title">Signed In</h1>
          <p className="success-tagline">You have successfully signed in. The Atlas desktop app will open automatically.</p>
          <span className="helper-text"><span className="status-dot"></span>Returning you to the app&hellip;</span>
        </main>
      </div>
    </>
  );
}
