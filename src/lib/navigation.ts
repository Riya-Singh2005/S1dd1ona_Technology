export interface NavItemConfig {
  title: string;
  href: string;
  description?: string;
  badge?: string;
  iconName?: string;
}

export interface NavGroupConfig {
  title: string;
  items: NavItemConfig[];
}

/**
 * Core Services Taxonomy: 8 Professional Capability Domains
 * Represents "What Siddiona's Certified Specialists Do"
 */
export const SERVICES_NAV: NavItemConfig[] = [
  {
    title: "Managed IT Services",
    href: "/services/managed-it-services",
    description: "Infrastructure monitoring, IT maintenance, facility management, and co-managed IT.",
    iconName: "ShieldCheck",
  },
  {
    title: "IT Consultancy Services",
    href: "/services/it-consultancy-services",
    description: "Technology strategy, architecture, assessment, project governance, and cloud consulting.",
    iconName: "Compass",
  },
  {
    title: "SAP Consultancy Services",
    href: "/services/sap-consultancy-services",
    description: "SAP discovery, S/4HANA migration, implementation, rollout, consulting, and AMS.",
    iconName: "Database",
  },
  {
    title: "Enterprise Solutions",
    href: "/services/enterprise-solutions",
    description: "Integrated infrastructure, data-centre, networking, licensing, automation, and systems.",
    iconName: "Layers",
  },
  {
    title: "Application Services",
    href: "/services/application-services",
    description: "Custom applications, integration, modernization, migration, and lifecycle support.",
    iconName: "Code2",
  },
  {
    title: "Cloud Solution",
    href: "/services/cloud-solutions",
    description: "Cloud infrastructure, migration, productivity, recovery, security, and operations.",
    iconName: "Cloud",
  },
  {
    title: "Staffing Solutions",
    href: "/services/staffing-solutions",
    description: "Technology talent, role-based staffing, and scalable technical teams.",
    iconName: "Users",
  },
  {
    title: "Software Licensing & Compliance",
    href: "/services/software-licensing-compliance",
    description: "License assessment, lifecycle management, deployment, tracking, and compliance support.",
    iconName: "FileCheck2",
  },
];

/**
 * Structured groupings for the eight-service catalog
 */
export const SERVICES_GROUPS: { groupName: string; items: NavItemConfig[] }[] = [
  {
    groupName: "Operations & Advisory",
    items: [
      SERVICES_NAV[0], // Managed IT Services
      SERVICES_NAV[1], // IT Consultancy Services
      SERVICES_NAV[2], // SAP Consultancy Services
    ],
  },
  {
    groupName: "Applications & Enterprise",
    items: [
      SERVICES_NAV[3], // Enterprise Solutions
      SERVICES_NAV[4], // Application Services
      SERVICES_NAV[5], // Cloud Solution
      SERVICES_NAV[6], // Staffing Solutions
      SERVICES_NAV[7], // Software Licensing & Compliance
    ],
  },
];

/**
 * Focused Solutions Taxonomy: 4 Enterprise Solution Offerings
 */
export const SOLUTIONS_NAV: NavItemConfig[] = [
  {
    title: "Backup & Disaster Recovery",
    href: "/solutions/backup-disaster-recovery",
    description: "Recovery planning, resilient backup architecture, implementation, and testing.",
    badge: "01",
    iconName: "ShieldCheck",
  },
  {
    title: "Data Center Migration & Virtualization",
    href: "/solutions/data-center-migration-virtualization",
    description: "Dependency-led migration, virtualization, validation, and operational handover.",
    badge: "02",
    iconName: "Server",
  },
  {
    title: "Smart Classrooms & AV Systems",
    href: "/solutions/smart-classrooms-av-systems",
    description: "Integrated learning spaces spanning display, audio, control, and collaboration.",
    badge: "03",
    iconName: "Tv",
  },
  {
    title: "Annual Maintenance Contract Services",
    href: "/solutions/annual-maintenance-contract-services",
    description: "Structured maintenance, response coordination, reporting, and lifecycle planning.",
    badge: "04",
    iconName: "Wrench",
  },
];

const CATALOG_NAV: NavItemConfig[] = [...SERVICES_NAV, ...SOLUTIONS_NAV];

/** Resolves service and solution paths to their nav entries, skipping unknown paths. */
export function getCatalogNavItems(hrefs: readonly string[]): NavItemConfig[] {
  return hrefs.flatMap((href) => CATALOG_NAV.find((item) => item.href === href) ?? []);
}

export const MAIN_NAV: NavItemConfig[] = [
  { title: "Home", href: "/" },
  { title: "Who We Are", href: "/about" },
  { title: "What We Do", href: "/services" },
  { title: "Solutions", href: "/solutions" },
  { title: "FlowX365", href: "https://flowx365.com/" },
  { title: "Career", href: "/careers" },
];

export const FOOTER_LEGAL_NAV: NavItemConfig[] = [
  { title: "Privacy Policy", href: "/privacy-policy" },
  { title: "Terms of Service", href: "/terms-of-service" },
];

/**
 * Routes that are product surfaces rather than marketing pages.
 *
 * The root layout mounts the navbar, footer and page loader. Those belong
 * on the marketing site, not inside the admin console; the careers pages
 * also skip the page loader.
 *
 * Shared route helpers keep these exclusions consistent.
 */
export function isAdminRoute(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function isCareersRoute(pathname: string): boolean {
  return pathname === "/careers" || pathname.startsWith("/careers/");
}

export function isAuthRoute(pathname: string): boolean {
  return pathname === "/auth" || pathname.startsWith("/auth/");
}

export function isAppRoute(pathname: string): boolean {
  return isAdminRoute(pathname) || isCareersRoute(pathname) || isAuthRoute(pathname);
}
