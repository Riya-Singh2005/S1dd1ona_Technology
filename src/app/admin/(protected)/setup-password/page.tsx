import type { Metadata } from "next";
import { AdminPasswordSetupForm } from "@/components/admin/admin-password-setup-form";
import { PageHeader, Panel } from "@/components/admin/admin-ui";
import { requireAdmin } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Set administrator password",
};

export default async function SetupAdminPasswordPage() {
  await requireAdmin("/admin/setup-password");

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        eyebrow="Account setup"
        title="Choose your password"
        description="Finish setting up your administrator account before entering the dashboard."
      />
      <Panel>
        <div className="p-5 sm:p-6">
          <AdminPasswordSetupForm />
        </div>
      </Panel>
    </div>
  );
}
