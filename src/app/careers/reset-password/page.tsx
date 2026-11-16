import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ResetPasswordForm } from "@/components/careers/reset-password-form";

/**
 * Landing point for a password recovery link.
 *
 * `/auth/confirm` verifies the emailed token and establishes the
 * recovery session before redirecting here, so this page only has to
 * host the form. The form itself re-checks that a session actually
 * exists rather than assuming the redirect implies one.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <section className="flex min-h-[62svh] items-center bg-[#070B14] py-16 sm:py-20 lg:py-24">
      <Container size="default">
        <div className="mx-auto w-full max-w-[460px] rounded-[18px] border border-slate-200/70 bg-white p-6 shadow-[0_24px_70px_rgba(2,6,23,0.4)] sm:p-8">
          <ResetPasswordForm />
        </div>
      </Container>
    </section>
  );
}
