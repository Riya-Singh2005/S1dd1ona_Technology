import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Home, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    // `data-hide-site-header` hides the navbar on this page (see globals.css).
    <div data-hide-site-header className="flex-1 flex flex-col justify-center items-center py-20 bg-gradient-to-b from-slate-50 via-white to-slate-50 text-center">
      <Container size="default">
        <div className="max-w-md mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold shadow-xs">
            <SearchX className="w-4 h-4 text-orange-600" />
            <span>Page not found</span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-[#16134D] sm:text-3xl">
            We couldn&apos;t find that page
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed">
            The address may be outdated, or the page may have moved. You can return to the homepage and continue browsing.
          </p>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold text-sm transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Go to Home Page</span>
          </Link>
        </div>
      </Container>
    </div>
  );
}
