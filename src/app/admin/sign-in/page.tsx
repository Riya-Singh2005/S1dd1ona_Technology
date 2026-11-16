import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminSignInForm } from "@/components/admin/admin-sign-in-form";
import { FormError } from "@/components/careers/form-fields";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/guards";
import { safeNextPath } from "@/lib/auth/redirect";

/**
 * Admin sign in.
 *
 * Sits outside the `(protected)` route group, so the admin guard can
 * never lock an administrator out of the page they need in order to
 * become one.
 *
 * A signed-in administrator arriving here is forwarded straight on. A
 * signed-in non-administrator is shown the forbidden message rather
 * than being bounced in a loop with no explanation.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false, nocache: true },
};

const ERROR_MESSAGES: Record<string, string> = {
  forbidden: "That account does not have admin access.",
  session_expired: "Your session has expired. Please sign in again.",
};

interface AdminSignInPageProps {
  searchParams: Promise<{ next?: string; error?: string }>;
}

export default async function AdminSignInPage({ searchParams }: AdminSignInPageProps) {
  const params = await searchParams;
  const next = safeNextPath(params.next, "/admin");
  const errorMessage = params.error ? ERROR_MESSAGES[params.error] : undefined;

  let signedInEmail: string | null = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      if (await isAdmin(supabase, user.id)) {
        redirect(next.startsWith("/admin") ? next : "/admin");
      }
      signedInEmail = user.email ?? null;
    }
  } catch {
    // Supabase not configured. The form renders and reports a clear
    // failure on submit rather than the page erroring outright.
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px]">
        <div className="mb-7 flex items-center gap-2.5">
          <Image
            src="/brand/Siddiona-emblem-icon.png"
            alt=""
            width={120}
            height={120}
            className="h-7 w-7 object-contain"
            sizes="28px"
          />
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
            Siddiona Careers Admin
          </span>
        </div>

        <div className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.07)] sm:p-8">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-slate-900">
            Sign in
          </h1>
          <p className="mt-2 text-[14.5px] leading-[1.6] text-slate-600">
            Admin access to jobs, applications and candidates.
          </p>

          {errorMessage && (
            <div className="mt-5">
              <FormError message={errorMessage} />
            </div>
          )}

          {signedInEmail && !errorMessage && (
            <div className="mt-5">
              <FormError
                message={`You are signed in as ${signedInEmail}, which does not have admin access.`}
              />
            </div>
          )}

          <div className="mt-6">
            <AdminSignInForm next={next} />
          </div>

          {signedInEmail && (
            <form action="/auth/sign-out" method="post" className="mt-4 text-center">
              <input type="hidden" name="next" value="/admin/sign-in" />
              <button
                type="submit"
                className="text-[13.5px] font-medium text-slate-500 underline-offset-4 transition-colors duration-150 hover:text-slate-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
              >
                Sign out of {signedInEmail}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-[13px] text-slate-500">
          Looking for open roles?{" "}
          <Link
            href="/careers"
            className="font-medium text-[#C2410C] underline-offset-4 transition-colors duration-150 hover:underline"
          >
            Siddiona Careers
          </Link>
        </p>
      </div>
    </div>
  );
}
