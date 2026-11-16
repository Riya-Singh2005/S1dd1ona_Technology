/**
 * Supabase browser client.
 *
 * Carries only the publishable anon key, and every request it makes is
 * subject to Row Level Security. It is used for three things:
 *
 *   1. auth flows that must run in the browser (OAuth handoff, signUp,
 *      signInWithPassword, resetPasswordForEmail)
 *   2. uploading a resume straight to Supabase Storage, which keeps a
 *      multi-megabyte file out of the 1MB Next.js Server Action body cap
 *   3. reading back the caller's own session
 *
 * It is never used to make an authorization decision. That lives in the
 * database.
 */

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export type CareersSupabaseClient = SupabaseClient<Database>;

export interface SupabaseClientConfig {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

export function getSupabaseBrowserConfig(): SupabaseClientConfig {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

export function isSupabaseConfigured(): boolean {
  const config = getSupabaseBrowserConfig();
  return Boolean(config.supabaseUrl && config.supabaseAnonKey);
}

/**
 * One client per browser tab. `createBrowserClient` memoises internally,
 * but holding the reference here keeps the auth listener count stable
 * across React re-renders.
 */
let browserClient: CareersSupabaseClient | undefined;

export function createClient(): CareersSupabaseClient {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseBrowserConfig();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    );
  }

  if (!browserClient) {
    browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  }

  return browserClient;
}
