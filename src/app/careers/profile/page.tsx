import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ProfileForm } from "@/components/careers/profile-form";
import { requireProfile, requireUser } from "@/lib/auth/guards";

/**
 * Candidate profile.
 *
 * Authentication identity stays in Supabase Auth; this page edits the
 * `profiles` row, which holds application data only. There is no
 * password field and no duplicated credential anywhere in the table.
 *
 * `requireProfile` creates the row on demand if it is missing, which
 * covers a user who predates the `handle_new_user` trigger.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your profile",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const { supabase, user } = await requireUser("/careers/profile");
  const profile = await requireProfile(supabase, user);

  return (
    <>
      <section className="bg-[#070B14] pb-12 pt-10 sm:pb-14 sm:pt-12">
        <Container size="default">
          <div className="flex items-center gap-2.5">
            <span className="h-1 w-2.5 shrink-0 rounded-full bg-[#EA580C]" aria-hidden="true" />
            <span className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#EA580C]">
              Your account
            </span>
          </div>

          <h1 className="mt-4 text-balance font-display text-[32px] font-extrabold leading-[1.04] tracking-[-0.04em] text-white sm:text-[40px]">
            Your profile
          </h1>

          <p className="mt-4 max-w-[58ch] text-pretty text-[16.5px] leading-[1.65] text-slate-400">
            Kept here so every application starts filled in. You can change any of it before you
            submit.
          </p>
        </Container>
      </section>

      <section className="min-h-[40svh] bg-[#F7F6F2] py-14 sm:py-16 lg:py-20">
        <Container size="default">
          <div className="mx-auto max-w-[760px] rounded-[18px] border border-slate-200/80 bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.06)] sm:p-9">
            {profile ? (
              <ProfileForm profile={profile} email={user.email ?? ""} />
            ) : (
              <p className="text-[15.5px] leading-[1.65] text-slate-600">
                We could not load your profile just now. Please refresh the page, and write to us
                at{" "}
                <a
                  href="mailto:hr@example.com"
                  className="font-semibold text-[#C2410C] underline-offset-4 hover:underline"
                >
                  HR — hr@example.com
                </a>{" "}
                or{" "}
                <a
                  href="mailto:tech@example.com"
                  className="font-semibold text-[#C2410C] underline-offset-4 hover:underline"
                >
                  Technical — tech@example.com
                </a>{" "}
                if it keeps happening.
              </p>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
