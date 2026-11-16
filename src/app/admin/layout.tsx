import type { Metadata } from "next";

/**
 * Admin root.
 *
 * Deliberately thin, and deliberately unguarded: `/admin/sign-in` lives
 * under this layout, so putting the admin check here would lock an
 * administrator out of the page they use to sign in. The guard lives
 * one level down, in `(protected)/layout.tsx`.
 *
 * The marketing navbar, footer and page loader are
 * suppressed on `/admin` by the shared `isAdminRoute` helper in
 * `src/lib/navigation.ts`, so this is a clean surface rather than a
 * dashboard wearing a marketing site.
 */

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | Siddiona Admin",
  },
  // Belt and braces alongside the Disallow in robots.ts.
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="admin-shell flex min-h-[100dvh] flex-1 flex-col bg-[#F8FAFC] text-slate-800">{children}</div>;
}
