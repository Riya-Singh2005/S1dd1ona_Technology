"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ArrowUpRight, ChevronDown } from "lucide-react";
import { gsap } from "gsap";
import { BrandLockup } from "@/components/layout/brand-lockup";
import { MobileNav } from "@/components/layout/mobile-nav";
import { isAdminRoute, SERVICES_NAV, SOLUTIONS_NAV } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const ContactDialog = dynamic(() =>
  import("@/components/layout/contact-dialog").then((module) => module.ContactDialog)
);

type MenuKey = "services" | "solutions";

const directLinks = [
  { label: "Home", href: "/" },
  { label: "FlowX365", href: "https://flowx365.com/" },
  { label: "Career", href: "/careers" },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  const base = href.split("#")[0];
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function SiteNavbar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [activeMenu, setActiveMenu] = useState<MenuKey | null>(null);
  const [focusWithin, setFocusWithin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const contactTriggerRef = useRef<HTMLElement | null>(null);
  const lastY = useRef(0);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const guardedRef = useRef(false);
  const directionRef = useRef<1 | -1>(1);
  const directionalTravelRef = useRef(0);

  const guarded = focusWithin || activeMenu !== null || mobileOpen || contactOpen;
  // The admin console is an internal tool, not a marketing surface. It
  // brings its own navigation. Hooks above stay unconditional.
  const hideChrome = isAdminRoute(pathname);

  useEffect(() => {
    guardedRef.current = guarded;
  }, [guarded]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      lastY.current = window.scrollY;
      setActiveMenu(null);
      setContactOpen(false);
      setFocusWithin(false);
      if (shellRef.current?.contains(document.activeElement)) {
        (document.activeElement as HTMLElement).blur();
      }
      setVisible(true);
    });
    return () => {
      window.cancelAnimationFrame(frame);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, [pathname]);

  useLayoutEffect(() => {
    lastY.current = window.scrollY;
    directionRef.current = 1;
    directionalTravelRef.current = 0;
    let animationFrame: number | null = null;

    const updateNavbar = () => {
      animationFrame = null;
      const nextY = Math.max(window.scrollY, 0);
      const delta = nextY - lastY.current;
      const frameDistance = Math.abs(delta);
      lastY.current = nextY;

      if (nextY <= 8 || guardedRef.current) {
        directionalTravelRef.current = 0;
        setVisible(true);
        return;
      }

      if (frameDistance < 0.5) return;
      const direction: 1 | -1 = delta > 0 ? 1 : -1;

      if (direction !== directionRef.current) {
        directionRef.current = direction;
        directionalTravelRef.current = 0;
      }
      directionalTravelRef.current += frameDistance;
      if (directionalTravelRef.current <= 6) return;
      directionalTravelRef.current = 0;

      setVisible(direction === -1);
    };

    const handleScroll = () => {
      if (animationFrame !== null) return;
      animationFrame = window.requestAnimationFrame(updateNavbar);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
    };
  }, [pathname]);

  useEffect(() => {
    if (!guarded) return;
    const frame = window.requestAnimationFrame(() => setVisible(true));
    return () => window.cancelAnimationFrame(frame);
  }, [guarded]);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!shellRef.current?.contains(event.target as Node)) setActiveMenu(null);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveMenu(null);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape);
    };
  }, []);

  useLayoutEffect(() => {
    if (!headerRef.current) return;
    const header = headerRef.current;
    gsap.to(header, {
      y: visible ? 0 : -16,
      opacity: visible ? 1 : 0,
      duration: visible ? 0.36 : 0.28,
      ease: "power4.out",
      force3D: true,
      overwrite: true,
    });
    return () => gsap.killTweensOf(header);
  }, [visible]);

  const openMenu = (menu: MenuKey) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setContactOpen(false);
    setActiveMenu(menu);
  };

  const openContact = (trigger: HTMLElement) => {
    contactTriggerRef.current = trigger;
    setActiveMenu(null);
    setContactOpen(true);
  };

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setActiveMenu(null), 140);
  };

  const navigate = (href: string, event: React.MouseEvent<HTMLAnchorElement>) => {
    setActiveMenu(null);
    if (pathname === "/" && href === "/") {
      event.preventDefault();
      document.getElementById("hero")?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", "/");
      return;
    }
    if (pathname === "/" && href.startsWith("/#")) {
      event.preventDefault();
      document.getElementById(href.slice(2))?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", href);
    }
  };

  const linkClass = (active: boolean) => cn(
    "relative whitespace-nowrap rounded-full px-3.5 py-2.5 text-[15px] font-semibold transition-[color,background-color,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]",
    active ? "bg-white/[0.14] text-white" : "text-white/90 hover:bg-white/[0.10] hover:text-white"
  );

  const menuGroups = [
    { key: "services", label: "What We Do", href: "/services", active: pathname.startsWith("/services") },
    { key: "solutions", label: "Solutions", href: "/solutions", active: pathname.startsWith("/solutions") },
  ] as const;

  if (hideChrome) {
    return null;
  }

  return (
    <header
      ref={headerRef}
      data-site-header
      className={cn(
        "fixed inset-x-0 top-0 z-50 px-3 pt-3 transform-gpu will-change-[transform,opacity] sm:px-5 sm:pt-4",
        visible ? "pointer-events-auto" : "pointer-events-none"
      )}
    >
      {/* Outer shell provides positioning context for the full-width mega-menu */}
      <div
        ref={shellRef}
        data-tone="dark"
        onFocusCapture={() => setFocusWithin(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusWithin(false);
        }}
        className="relative mx-auto w-full max-w-[1536px]"
      >
        {/* Navbar pill */}
        <div className="grid min-h-[72px] grid-cols-[1fr_auto] items-center gap-4 rounded-[22px] border border-white/[0.22] bg-slate-950/[0.62] px-3 py-2 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_16px_44px_rgba(2,6,23,0.28)] backdrop-blur-[24px] backdrop-saturate-[1.6] sm:rounded-full xl:grid-cols-[245px_minmax(0,1fr)_auto] xl:gap-6">
          <div className="justify-self-start">
            <BrandLockup
              isLight={false}
              onClick={(event) => navigate("/", event)}
              className="w-[185px] sm:w-[215px] lg:w-[245px]"
              preload
            />
          </div>

          <nav
            className="hidden w-full min-w-0 items-center justify-between gap-1 px-2.5 py-1.5 xl:flex"
            aria-label="Main navigation"
          >
            <Link
              href="/"
              onClick={(event) => navigate("/", event)}
              className={linkClass(pathname === "/")}
              aria-current={pathname === "/" ? "page" : undefined}
            >
              Home
            </Link>

            <Link
              href="/about"
              onClick={(event) => navigate("/about", event)}
              className={linkClass(isActivePath(pathname, "/about"))}
              aria-current={isActivePath(pathname, "/about") ? "page" : undefined}
            >
              Who We Are
            </Link>

            {menuGroups.map((item) => {
              const open = activeMenu === item.key;
              return (
                <div
                  key={item.key}
                  onPointerEnter={() => openMenu(item.key)}
                  onPointerLeave={scheduleClose}
                  className={cn(
                    "inline-flex items-center whitespace-nowrap rounded-full text-[15px] font-semibold transition-[color,background-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
                    item.active || open ? "bg-white/[0.14] text-white" : "text-white/90 hover:bg-white/[0.10] hover:text-white"
                  )}
                >
                  {/* The label is a real link to the index page; hovering the
                      group or using the chevron opens the dropdown. */}
                  <Link
                    href={item.href}
                    onClick={(event) => navigate(item.href, event)}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowDown") {
                        event.preventDefault();
                        openMenu(item.key);
                      }
                    }}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className="rounded-full py-2.5 pl-3.5 pr-1 transition-transform duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]"
                  >
                    {item.label}
                  </Link>
                  <button
                    type="button"
                    aria-label={`${open ? "Close" : "Open"} ${item.label} menu`}
                    aria-expanded={open}
                    aria-haspopup="menu"
                    onClick={() => setActiveMenu((current) => current === item.key ? null : item.key)}
                    className="inline-flex cursor-pointer items-center self-stretch rounded-full pl-0.5 pr-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]"
                  >
                    <ChevronDown
                      className={cn("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              );
            })}

            {directLinks.slice(1).map((link) => {
              const active = isActivePath(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={linkClass(active)}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="relative hidden justify-self-end xl:block">
            <button
              type="button"
              onClick={(event) => openContact(event.currentTarget)}
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#EA580C] px-5 text-[14px] font-bold text-white shadow-[0_12px_32px_rgba(234,88,12,0.25)] transition-[background-color,transform,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[#C2410C] hover:shadow-[0_16px_38px_rgba(234,88,12,0.3)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
            >
              Get in Touch
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            </button>
          </div>

          <div className="justify-self-end xl:hidden">
            <MobileNav isLightNav={false} onOpenChange={setMobileOpen} onContact={openContact} />
          </div>
        </div>

        {/* Full-width mega-menu — rendered below the pill, spans the entire shell width */}
        {activeMenu !== null && (
          <div
            role="menu"
            aria-label={`${activeMenu === "services" ? "What We Do" : "Solutions"} menu`}
            onPointerEnter={() => activeMenu && openMenu(activeMenu)}
            onPointerLeave={scheduleClose}
            className="mt-2 hidden overflow-hidden rounded-[20px] border border-white/75 bg-white/[0.96] p-5 text-slate-950 shadow-[0_24px_70px_rgba(15,23,42,0.22)] backdrop-blur-2xl xl:block"
          >
            <div className="mb-3 flex items-center justify-between gap-4 border-b border-slate-200 px-4 pb-3">
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                {activeMenu === "services" ? "What We Do" : "Solutions"}
              </span>
              <Link
                href={activeMenu === "services" ? "/services" : "/solutions"}
                role="menuitem"
                onClick={(event) => navigate(activeMenu === "services" ? "/services" : "/solutions", event)}
                className="group inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-sm font-bold text-[#C2410C] transition-colors duration-200 hover:text-[#9A3412] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]"
              >
                {activeMenu === "services" ? "View all services" : "View all solutions"}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </div>
            <div className={cn("grid gap-2", activeMenu === "solutions" ? "grid-cols-2" : "grid-cols-3")}>
              {(activeMenu === "services" ? SERVICES_NAV : SOLUTIONS_NAV).map((link) => {
                const href = link.href;
                return (
                  <Link
                    key={link.href}
                    href={href}
                    role="menuitem"
                    onClick={(event) => navigate(href, event)}
                    className="group flex min-h-12 items-center justify-between gap-4 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition-[background-color,color,transform] duration-200 ease-out hover:bg-slate-950/[0.05] hover:text-[#C2410C] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]"
                  >
                    <span>{link.title}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden="true" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {contactOpen && <ContactDialog onClose={() => {
        setContactOpen(false);
        contactTriggerRef.current?.focus();
      }} />}
    </header>
  );
}

export const Header = SiteNavbar;
