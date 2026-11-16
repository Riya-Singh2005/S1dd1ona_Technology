import { CareersAccountBar } from "@/components/careers/careers-account-bar";
import { createClient, isSupabaseServerConfigured } from "@/lib/supabase/server";

export function CareersAccountBarSkeleton() {
  return (
    <div
      className="h-12 rounded-xl border border-white/10 bg-white/[0.04] motion-reduce:animate-none"
      aria-busy="true"
      aria-label="Loading account controls"
    />
  );
}

export async function CareersAccountSlot() {
  let email: string | null = null;
  let displayName: string | null = null;
  let isAdmin = false;

  if (isSupabaseServerConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const claims = data?.claims;

    if (claims?.sub) {
      email = claims.email ?? null;
      const [{ data: profile, error: profileError }, { data: admin, error: adminError }] =
        await Promise.all([
          supabase.from("profiles").select("full_name").eq("id", claims.sub).maybeSingle(),
          supabase.from("admin_users").select("user_id").eq("user_id", claims.sub).maybeSingle(),
        ]);
      if (profileError) throw new Error(profileError.message);
      if (adminError) throw new Error(adminError.message);

      displayName =
        profile?.full_name ??
        (typeof claims.user_metadata?.full_name === "string"
          ? claims.user_metadata.full_name
          : null);
      isAdmin = Boolean(admin);
    }
  }

  return <CareersAccountBar email={email} displayName={displayName} isAdmin={isAdmin} />;
}
