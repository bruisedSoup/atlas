/**
 * lib/supabase/client.ts
 * Browser-side Supabase client (uses @supabase/ssr for cookie-based sessions).
 * Import this in Client Components.
 */
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key!
  );
}
