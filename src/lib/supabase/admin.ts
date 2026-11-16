import "server-only";

/**
 * Service-role Supabase client. Bypasses Row Level Security entirely.
 *
 * The `server-only` import above is load-bearing: if any client
 * component ever imports this module, even transitively, the build
 * fails rather than shipping the service-role key to a browser.
 *
 * Reach for this ONLY where RLS genuinely cannot serve the request:
 *
 *   - writing to `email_events`, which has no INSERT policy by design
 *   - reading an admin-notification recipient's details outside a
 *     user session, from a background send
 *
 * Every candidate-facing and admin-facing query goes through the
 * ordinary server client instead, so the database keeps enforcing
 * permissions rather than trusting the application.
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

let adminClient: SupabaseClient<Database> | undefined;

export function isServiceRoleConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function createAdminClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Service role client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
  }

  if (!adminClient) {
    adminClient = createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }

  return adminClient;
}
