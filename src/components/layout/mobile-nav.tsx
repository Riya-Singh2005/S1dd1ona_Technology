"use client";

import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { BrandLockup } from "@/components/layout/brand-lockup";
import { SERVICES_NAV, SOLUTIONS_NAV } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

const links = [
  { label: "Home", href: "/" },
  { label: "Who We Are", href: "/about" },
  { label: "What We Do", href: "/services" },
  { label: "Solutions", href: "/solutions" },
  { label: "FlowX365", href: "https://flowx365.com/" },
  { label: "Career", href: "/careers" },
] as const;

interface MobileNavProps {
  isLightNav?: boolean;
  onOpenChange?: (open: boolean) => void;
  onContact: (trigger: HTMLButtonElement) => void;
}

export function MobileNav({ isLightNav = false, onOpenChange, onContact }: MobileNavProps) {
  const pathname = usePathname();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [open, setOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  const setMenuOpen = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) setExpandedGroup(null);
    onOpenChange?.(next);
  }, [onOpenChange]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setOpen(false);
      onOpenChange?.(false);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [onOpenChange, pathname]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
      if (event.key === "Tab") {
        const controls = Array.from(drawerRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []).filter(element => element.tabIndex >= 0 && element.getClientRects().length > 0 && !element.closest('[inert]'));
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, setMenuOpen]);

  useEffect(() => {
    if (!open) return;
    const desktop = window.matchMedia("(min-width: 1280px)");
    const closeOnDesktop = () => { if (desktop.matches) setMenuOpen(false); };
    closeOnDesktop();
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, [open, setMenuOpen]);

  const active = (href: string) => href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setMenuOpen(true)}
        className={cn(
          "inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border transition-[background-color,color,border-color,transform] duration-200 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]",
          isLightNav ? "border-slate-950/10 bg-white/55 text-slate-950" : "border-white/15 bg-white/[0.08] text-white"
        )}
      >
        <Menu className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
      </button>

      {mounted && createPortal(
        <div className={cn("fixed inset-0 z-[100] transition-[visibility] duration-0", open ? "visible" : "invisible delay-300")} aria-hidden={!open} inert={!open}>
          <button
            type="button"
            aria-label="Close navigation menu"
            tabIndex={open ? 0 : -1}
            onClick={() => setMenuOpen(false)}
            className={cn(
              "absolute inset-0 cursor-default bg-slate-950/70 backdrop-blur-sm transition-opacity duration-200 ease-out",
              open ? "opacity-100" : "opacity-0"
            )}
          />

          <aside
            ref={drawerRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className={cn(
              "absolute right-0 top-0 flex h-[100dvh] max-h-[100dvh] w-full max-w-[430px] transform-gpu flex-col overflow-hidden border-l border-white/10 bg-[#090B0F]/[0.97] text-white shadow-[-24px_0_70px_rgba(2,6,23,0.35)] backdrop-blur-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
              open ? "translate-x-0" : "translate-x-full"
            )}
          >
            <div className="flex min-h-[88px] shrink-0 items-center justify-between border-b border-white/10 px-5 pt-[env(safe-area-inset-top)]">
              <BrandLockup isLight={false} className="w-[185px]" />
              <button
                ref={closeRef}
                type="button"
                aria-label="Close navigation menu"
                tabIndex={open ? 0 : -1}
                onClick={() => {
                  setMenuOpen(false);
                  triggerRef.current?.focus();
                }}
                className="inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white transition-[background-color,transform] duration-150 ease-out hover:bg-white/[0.12] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]"
              >
                <X className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
              </button>
            </div>

            <nav className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-5 py-3" aria-label="Mobile navigation">
              {links.map((link) => {
                const children = link.href === "/services" ? SERVICES_NAV : link.href === "/solutions" ? SOLUTIONS_NAV : null;
                const expanded = expandedGroup === link.href;
                if (children) return (
                  <div key={link.href} className="border-b border-white/10">
                    <button type="button" tabIndex={open ? 0 : -1} aria-expanded={expanded} aria-controls={`mobile-${link.label.replaceAll(" ", "-")}`} onClick={() => setExpandedGroup(expanded ? null : link.href)} className={cn("flex min-h-14 w-full items-center justify-between gap-3 py-3 text-left font-jakarta text-2xl font-semibold tracking-[-0.035em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#EA580C]", active(link.href) ? "text-[#FB923C]" : "text-slate-100")}>
                      {link.label}<ChevronDown className={cn("h-5 w-5 shrink-0 transition-transform duration-200 motion-reduce:transition-none", expanded && "rotate-180")} aria-hidden="true" />
                    </button>
                    <div id={`mobile-${link.label.replaceAll(" ", "-")}`} inert={!expanded || !open} className={cn("grid transition-[grid-template-rows,opacity] duration-200 ease-[cubic-bezier(.23,1,.32,1)] motion-reduce:transition-none", expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                      <div className="min-h-0 overflow-hidden">
                        {[{ title: `All ${link.href === "/services" ? "services" : "solutions"}`, href: link.href }, ...children].map(item => (
                          <Link key={item.href} href={item.href} tabIndex={open && expanded ? 0 : -1} aria-current={pathname === item.href ? "page" : undefined} onClick={() => setMenuOpen(false)} className={cn("flex min-h-12 items-center rounded-lg px-3 py-3 font-sans text-sm font-semibold leading-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#EA580C]", pathname === item.href ? "bg-white/[0.08] text-[#FB923C]" : "text-slate-300 hover:bg-white/[0.05]")}>{item.title}</Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
                return (
                <React.Fragment key={link.href}>
                  <Link
                    href={link.href}
                    tabIndex={open ? 0 : -1}
                    aria-current={pathname === link.href ? "page" : undefined}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "group flex min-h-[68px] items-center justify-between border-b border-white/10 font-jakarta text-[clamp(1.4rem,7vw,2rem)] font-semibold tracking-[-0.035em] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#EA580C]",
                      active(link.href) ? "text-[#FB923C]" : "text-slate-100 hover:text-white"
                    )}
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="h-5 w-5 text-[#FB923C] opacity-70 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                  </Link>
                </React.Fragment>
              );})}
            </nav>

            <div className="shrink-0 border-t border-white/10 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                tabIndex={open ? 0 : -1}
                onClick={() => {
                  setMenuOpen(false);
                  if (triggerRef.current) onContact(triggerRef.current);
                }}
                className="flex min-h-14 w-full items-center justify-between rounded-full bg-[#EA580C] px-6 text-sm font-bold text-white transition-[background-color,transform] duration-150 ease-out hover:bg-[#C2410C] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Get in Touch
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </aside>
        </div>,
        document.body
      )}
    </>
  );
}
