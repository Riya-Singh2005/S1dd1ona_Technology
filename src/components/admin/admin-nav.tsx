"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  Briefcase,
  ExternalLink,
  Inbox,
  LayoutGrid,
  LoaderCircle,
  LogOut,
  ShieldCheck,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Admin navigation.
 *
 * A different mode from the public site on purpose: dense, quiet, Inter
 * throughout, no display type and no motion beyond a 150ms colour
 * change. This is a tool someone uses for an hour at a time, and the
 * editorial voice that serves a careers page would be friction here.
 *
 * A rail on desktop, a horizontal scroller on mobile.
 */

const BASE_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutGrid, exact: true },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { href: "/admin/applications", label: "Applications", icon: Inbox },
  { href: "/admin/candidates", label: "Candidates", icon: Users },
] as const;

export interface AdminNavProps {
  email: string;
  canManageAdmins: boolean;
}

function LinkPendingIndicator({ label }: { label: string }) {
  const { pending } = useLinkStatus();
  return (
    <>
      <span className="ml-auto inline-flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden="true">
        {pending && <LoaderCircle className="admin-link-pending h-3.5 w-3.5 animate-spin motion-reduce:animate-none" />}
      </span>
      {pending && <span className="sr-only" role="status">Loading {label}</span>}
    </>
  );
}

function MobileNavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  const itemRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (active) itemRef.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [active]);

  return (
    <li ref={itemRef}>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-[13.5px] font-medium whitespace-nowrap transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]",
          active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
        )}
      >
        {label}
        <LinkPendingIndicator label={label} />
      </Link>
    </li>
  );
}

export function AdminNav({ email, canManageAdmins }: AdminNavProps) {
  const pathname = usePathname();
  const links = canManageAdmins
    ? [...BASE_LINKS, { href: "/admin/admins", label: "Admin", icon: ShieldCheck }]
    : BASE_LINKS;

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* Desktop rail */}
      <aside className="hidden w-[232px] shrink-0 border-r border-slate-200 bg-white lg:sticky lg:top-0 lg:flex lg:h-[100dvh] lg:self-start lg:flex-col">
        <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 px-5">
          <Image
            src="/brand/Siddiona-emblem-icon.png"
            alt=""
            width={120}
            height={120}
            className="h-6 w-6 object-contain"
            sizes="24px"
          />
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
            Careers Admin
          </span>
        </div>

        <nav aria-label="Admin navigation" className="flex-1 p-3">
          <ul className="space-y-1">
            {links.map((link) => {
              const active = isActive(link.href, "exact" in link ? link.exact : false);
              const Icon = link.icon;

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2",
                      active
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                    {link.label}
                    <LinkPendingIndicator label={link.label} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-slate-200 p-3">
          <Link
            href="/careers"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium text-slate-600 transition-colors duration-150 ease-out hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
          >
            <ExternalLink className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
            Public careers page
          </Link>

          <div className="mt-3 border-t border-slate-200 px-3 pt-3">
            <p className="truncate text-[12px] text-slate-500" title={email}>
              {email}
            </p>

            <form action="/auth/sign-out" method="post" className="mt-2">
              <input type="hidden" name="next" value="/admin/sign-in" />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 transition-colors duration-150 ease-out hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Mobile bar */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white lg:hidden">
        <div className="flex h-14 items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-2.5">
            <Image
              src="/brand/Siddiona-emblem-icon.png"
              alt=""
              width={120}
              height={120}
              className="h-5 w-5 object-contain"
              sizes="20px"
            />
            <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-slate-500">
              Careers Admin
            </span>
          </div>

          <form action="/auth/sign-out" method="post">
            <input type="hidden" name="next" value="/admin/sign-in" />
            <button
              type="submit"
              aria-label="Sign out"
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 transition-colors duration-150 hover:bg-slate-100 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </div>

        <nav aria-label="Admin navigation" className="no-scrollbar overflow-x-auto border-t border-slate-200">
          <ul className="flex min-w-max gap-1 px-3 py-2">
            {links.map((link) => {
              const active = isActive(link.href, "exact" in link ? link.exact : false);
              return (
                <MobileNavLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  active={active}
                />
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
}

export default AdminNav;
