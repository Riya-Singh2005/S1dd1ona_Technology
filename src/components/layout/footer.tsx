"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { gsap } from "gsap";
import { usePathname } from "next/navigation";
import { FOOTER_LEGAL_NAV, isAdminRoute, MAIN_NAV, SERVICES_NAV, SOLUTIONS_NAV } from "@/lib/navigation";

const footerNavigation = MAIN_NAV.filter((item) => item.href !== "/");

const footerLinkClass =
  "group inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-medium text-slate-300 transition-[color,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:translate-x-1 hover:text-white focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 sm:min-h-0";

export function Footer() {
  const pathname = usePathname();
  const footerRef = useRef<HTMLElement>(null);
  // The admin console carries its own shell; the marketing footer would
  // only add scroll depth to a working screen.
  const hideChrome = isAdminRoute(pathname);

  /**
   * Entrance reveal, played once when the footer first scrolls into view.
   *
   * The footer stays mounted across client-side navigations while the page
   * above it changes height, and some pages pin sections that grow the page
   * after mount. A ScrollTrigger measured its start position once and was
   * never re-measured, so on a shorter page it could never be reached and the
   * footer stayed hidden. An IntersectionObserver tracks layout on its own.
   *
   * The footer is visible until the observer fires; the hidden state exists
   * only for the length of the tween, and props are cleared afterwards.
   */
  useEffect(() => {
    const footer = footerRef.current;
    if (hideChrome || !footer) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;

    const items = footer.querySelectorAll<HTMLElement>("[data-footer-reveal]");
    let tween: gsap.core.Tween | undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      tween = gsap.fromTo(
        items,
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.075,
          ease: "power4.out",
          force3D: true,
          clearProps: "opacity,visibility,transform",
        }
      );
    });
    observer.observe(footer);

    return () => {
      observer.disconnect();
      tween?.kill();
      gsap.set(items, { clearProps: "opacity,visibility,transform" });
    };
  }, [hideChrome]);

  if (hideChrome) {
    return null;
  }

  return (
    <footer ref={footerRef} id="site-footer" className="relative w-full overflow-hidden bg-[#070b14] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_90%_at_50%_100%,rgba(234,88,12,0.20)_0%,rgba(15,23,42,0.30)_44%,transparent_72%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      <div className="relative mx-auto max-w-[1280px] px-5 pb-2 pt-5 sm:px-8 sm:pb-3 sm:pt-6 lg:px-10 lg:pt-7">
        <div className="grid gap-5 border-b border-white/10 pb-5 sm:grid-cols-2 sm:gap-x-8 sm:pb-6 lg:grid-cols-[1.3fr_0.6fr_1fr_1fr_1fr] lg:gap-10">
          <div data-footer-reveal className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500" aria-label="Siddiona Technologies Home">
              <Image src="/brand/Siddionalogo-orange-white.png" alt="Siddiona Technologies" width={1450} height={520} className="h-auto w-[165px] object-contain sm:w-[190px]" unoptimized />
            </Link>
            <p className="mt-3 max-w-[470px] text-base font-semibold leading-[1.45] tracking-[-0.015em] text-slate-200 sm:text-lg">
              Secure digital and enterprise solutions built to help ambitious businesses move forward.
            </p>

          </div>

          <nav data-footer-reveal aria-label="Footer navigation">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-400">Explore</p>
            <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-1">
              {footerNavigation.map((item) => (
                <li key={item.href}><Link href={item.href} className={footerLinkClass}>{item.title}</Link></li>
              ))}
            </ul>
          </nav>

          {/* Every page links to each service and solution. The header
              dropdowns only render their links on hover, so this is the
              crawlable path to the detail pages from anywhere on the site. */}
          <nav data-footer-reveal aria-label="Services">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-400">
              <Link href="/services" className="hover:text-orange-300">Services</Link>
            </p>
            <ul className="mt-3 grid gap-y-2">
              {SERVICES_NAV.map((item) => (
                <li key={item.href}><Link href={item.href} className={footerLinkClass}>{item.title}</Link></li>
              ))}
            </ul>
          </nav>

          <nav data-footer-reveal aria-label="Solutions">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-400">
              <Link href="/solutions" className="hover:text-orange-300">Solutions</Link>
            </p>
            <ul className="mt-3 grid gap-y-2">
              {SOLUTIONS_NAV.map((item) => (
                <li key={item.href}><Link href={item.href} className={footerLinkClass}>{item.title}</Link></li>
              ))}
            </ul>
          </nav>

          <div data-footer-reveal>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-400">Contact</p>
            <div className="mt-3 flex flex-col gap-2.5">
              <a href="mailto:hr@example.com" className={footerLinkClass}><Mail className="h-4 w-4 text-orange-400" strokeWidth={1.75} aria-hidden="true" />HR — hr@example.com</a>
              <a href="mailto:tech@example.com" className={footerLinkClass}><Mail className="h-4 w-4 text-orange-400" strokeWidth={1.75} aria-hidden="true" />Technical — tech@example.com</a>
              <a href="tel:+910000000000" className={footerLinkClass}><Phone className="h-4 w-4 text-orange-400" strokeWidth={1.75} aria-hidden="true" />+91-00000-00000</a>
              <p className="flex max-w-xs items-start gap-2.5 text-sm font-medium leading-5 text-slate-300"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" strokeWidth={1.75} aria-hidden="true" />123 Demo Business Park, New Delhi, India</p>
            </div>
          </div>
        </div>


        <div data-footer-reveal className="mt-1 flex flex-col gap-1.5 border-t border-white/10 pt-2 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Siddiona Technologies Services Pvt. Ltd.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {FOOTER_LEGAL_NAV.map((item) => (
              <Link key={item.href} href={item.href} className="inline-flex min-h-11 items-center transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 sm:min-h-0">{item.title}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
