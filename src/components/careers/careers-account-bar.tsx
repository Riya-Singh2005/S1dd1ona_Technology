"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The careers utility strip.
 *
 * Sits under the fixed navbar on every careers route and gives the
 * experience its own identity without touching the global navigation.
 * The site's main navbar is shared by the whole marketing site; adding
 * account state to it would push auth concerns onto pages that have
 * nothing to do with hiring.
 *
 * Deliberately not a dropdown. There are three destinations, they fit,
 * and a menu would add a popover, a focus trap and an animation to save
 * roughly nothing.
 */

export interface CareersAccountBarProps {
  email: string | null;
  displayName: string | null;
  isAdmin?: boolean;
}

export function CareersAccountBar({ email, displayName, isAdmin }: CareersAccountBarProps) {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    cn(
      "rounded-full px-3 py-1.5 text-[13px] font-semibold transition-[color,background-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070B14]",
      pathname === href
        ? "bg-white/[0.12] text-white"
        : "text-white/65 hover:bg-white/[0.08] hover:text-white"
    );

  const initial = (displayName || email || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 py-3">
      <Link
        href="/careers"
        className="group inline-flex items-center gap-2.5 rounded-full py-1 pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070B14]"
      >
        <span className="h-[9px] w-[9px] shrink-0 bg-[#EA580C]" aria-hidden="true" />
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-white/70 transition-colors duration-200 group-hover:text-white">
          Siddiona Careers
        </span>
      </Link>

      {email ? (
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          <Link href="/careers/applications" className={linkClass("/careers/applications")}>
            Applications
          </Link>

          <Link href="/careers/profile" className={linkClass("/careers/profile")}>
            Profile
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="hidden rounded-full px-3 py-1.5 text-[13px] font-semibold text-[#FB923C] transition-colors duration-200 hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070B14] sm:inline-flex"
            >
              Admin
            </Link>
          )}

          <span
            title={email}
            className="ml-1 hidden h-7 w-7 shrink-0 select-none items-center justify-center rounded-full border border-white/20 bg-white/[0.08] font-mono text-[11px] font-bold text-white sm:inline-flex"
            aria-hidden="true"
          >
            {initial}
          </span>
          <span className="sr-only">Signed in as {email}</span>

          {/*
            A form POST rather than a link. A GET sign-out URL can be
            triggered by any page that embeds it, and Next.js prefetches
            links, which would eventually sign people out on hover.
          */}
          <form action="/auth/sign-out" method="post">
            <input type="hidden" name="next" value="/careers" />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] font-semibold text-white/55 transition-[color,background-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070B14]"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">Sign out</span>
            </button>
          </form>
        </div>
      ) : (
        <Link
          href={`/careers/join?next=${encodeURIComponent(pathname || "/careers")}`}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3.5 py-1.5 text-[13px] font-semibold text-white/85 transition-[border-color,background-color,color,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-white/35 hover:bg-white/[0.08] hover:text-white active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070B14]"
        >
          <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
          Sign in
        </Link>
      )}
    </div>
  );
}

export default CareersAccountBar;
