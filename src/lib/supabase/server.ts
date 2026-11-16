import "server-only";

/**
 * Supabase server client, bound to the request's cookie store.
 *
 * Still the anon key, so every query runs under Row Level Security as
 * the signed-in user. This is the client that Server Components, Server
 * Actions and Route Handlers should reach for by default.
 *
 * Next.js 16 notes:
 *   - `cookies()` is async and has no synchronous fallback
 *   - cookies cannot be written during Server Component render, so
 *     `setAll` is wrapped in try/catch. The proxy refreshes the session
 *     on every careers and admin request, so a swallowed write here is
 *     recovered on the next navigation rather than lost.
 */

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export type CareersServerClient = SupabaseClient<Database>;

export interface SupabaseServerConfig {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  serviceRoleKey?: string;
}

export function getSupabaseServerConfig(): SupabaseServerConfig {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

export function isSupabaseServerConfigured(): boolean {
  const config = getSupabaseServerConfig();
  return Boolean(config.supabaseUrl && config.supabaseAnonKey);
}

export async function createClient(): Promise<CareersServerClient> {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseServerConfig();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    );
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Component render: HTTP headers are already committed.
          // The proxy handles refresh for these routes.
        }
      },
    },
  });
}

/**
 * The authenticated user, or null.
 *
 * Always `getUser()` rather than `getSession()`. `getSession()` trusts
 * the cookie as-is; `getUser()` revalidates the token with the Supabase
 * Auth server, which is what you want before making any decision.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
