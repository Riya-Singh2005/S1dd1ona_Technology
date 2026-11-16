import { requireAdmin } from "@/lib/auth/guards";
import { AdminNav } from "@/components/admin/admin-nav";

/**
 * The guarded admin shell.
 *
 * `requireAdmin` runs `auth.getUser()` and then checks `admin_users`
 * through the caller's own session. A non-admin is sent to the sign-in
 * page with the same message a signed-out visitor sees, because telling
 * someone "this page exists but you lack the role" gives them
 * information and gives us nothing.
 *
 * This guard is for routing, not security. Every page below fetches its
 * data through the user's session, so the admin SELECT policies are
 * what actually return the rows. If this file were deleted, a
 * non-admin's dashboard would simply be empty rather than exposed.
 *
 * `/admin/sign-in` sits outside this route group, so the guard can
 * never lock an administrator out of the login page.
 */

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user, adminRole } = await requireAdmin();

  return (
    <div className="flex min-h-[100dvh] flex-col lg:flex-row">
      <AdminNav email={user.email ?? ""} canManageAdmins={adminRole === "super_admin"} />

      <div className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          {children}
        </div>
      </div>
    </div>
  );
}
