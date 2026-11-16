export type AnalyticsEventName = "generate_lead" | "career_application_submitted";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __siddionaGaConfigured?: boolean;
    __siddionaGaLastPage?: string;
  }
}

export function sendAnalyticsEvent(
  eventName: AnalyticsEventName,
  parameters: Record<string, string> = {}
): void {
  if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) return;
  window.gtag?.("event", eventName, parameters);
}
