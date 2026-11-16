import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import localFont from "next/font/local";
import { Anton, Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import { SkipToContent } from "@/components/layout/skip-to-content";
import { RouteBottomChrome, RouteTopChrome } from "@/components/layout/route-chrome";
import { RouteAnalytics } from "@/components/analytics/route-analytics";
import { SITE_ORIGIN } from "@/lib/site";
import { buildSitewideSchemas, serializeJsonLd } from "@/lib/structured-data";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = localFont({
  src: [
    {
      path: "../assets/fonts/PlusJakartaSans-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../assets/fonts/PlusJakartaSans-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../assets/fonts/PlusJakartaSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../assets/fonts/PlusJakartaSans-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: "Siddiona Technologies | Enterprise IT Solutions & Systems Integration",
    template: "%s | Siddiona Technologies",
  },
  description:
    "Siddiona Technologies Services Pvt. Ltd. delivers enterprise IT consulting, managed infrastructure, cloud transformation, and smart ELV automation solutions.",
  keywords: [
    "Enterprise IT Solutions",
    "Managed IT Services",
    "Cloud Migration",
    "SAP Consulting",
    "Smart Infrastructure",
    "IT AMC Delhi",
    "Siddiona Technologies",
  ],
  authors: [{ name: "Siddiona Technologies Services Pvt. Ltd." }],
  openGraph: {
    title: "Siddiona Technologies | Enterprise IT Solutions & Systems Integration",
    description:
      "Enterprise IT Solutions, Cloud Transformation & Smart Infrastructure Integration.",
    url: SITE_ORIGIN,
    siteName: "Siddiona Technologies",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Siddiona Technologies | Enterprise IT Solutions & Systems Integration",
    description:
      "Enterprise IT Solutions, Cloud Transformation & Smart Infrastructure Integration.",
  },
  // AdSense site ownership. The ad script itself is not loaded yet.
  other: {
    "google-adsense-account": "ca-pub-0000000000000000",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sitewideJsonLd = buildSitewideSchemas();

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} ${anton.variable} ${instrumentSerif.variable}`}
    >
      <body className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col antialiased selection:bg-orange-500 selection:text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(sitewideJsonLd) }}
        />
        <SkipToContent />
        <RouteTopChrome />
        <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col">
          {children}
        </main>
        <RouteBottomChrome />
        <Suspense fallback={null}>
          <RouteAnalytics />
        </Suspense>
      </body>
    </html>
  );
}
