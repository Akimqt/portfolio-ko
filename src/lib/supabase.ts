import { createClient } from "@supabase/supabase-js";

/**
 * ---------------------------------------------------------------------------
 * Supabase client
 * ---------------------------------------------------------------------------
 * Single shared client for the whole app. The anon key is safe to ship to the
 * browser — it has no privileges on its own. Every table's Row Level Security
 * (RLS) policies (see supabase/schema.sql) are what actually decide what an
 * anonymous visitor vs. a logged-in admin can read/write, not this key.
 *
 * Requires two env vars (see .env.example):
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY
 * ------------------------------------------------------------------------- */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // Don't throw — this file is imported at module load time on both server
  // and client, and a hard crash here would take down the whole app before
  // any error boundary could show something useful. Every query will fail
  // instead, and each hook below surfaces that via a toast.
  console.error(
    "[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. " +
      "Copy .env.example to .env, fill in your Supabase project's URL + anon key, and restart the dev server.",
  );
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "", {
  auth: {
    persistSession: typeof window !== "undefined",
    autoRefreshToken: typeof window !== "undefined",
  },
});
