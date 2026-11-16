"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import {
  attributionFromVisit,
  captureCurrentAttribution,
} from "@/lib/analytics/attribution";

export function SiteAnalytics() {
  const candidateId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const measurementId = candidateId && /^G-[A-Z0-9]+$/.test(candidateId) ? candidateId : undefined;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPage = useRef<string | null>(null);
  const capturedArrival = useRef(false);
  const [analyticsReady, setAnalyticsReady] = useState(false);

  useEffect(() => {
    if (!capturedArrival.current) {
      captureCurrentAttribution();
      capturedArrival.current = true;
    }
  }, []);

  useEffect(() => {
    if (!measurementId || !analyticsReady) return;

    const pagePath = pathname;
    const navigationKey = `${pathname}?${searchParams.toString()}`;
    if (lastPage.current === navigationKey || window.__siddionaGaLastPage === navigationKey) {
      lastPage.current = navigationKey;
      return;
    }
    const currentVisit = attributionFromVisit(
      window.location.href,
      lastPage.current ? "" : document.referrer
    )?.touch;
    lastPage.current = navigationKey;
    window.__siddionaGaLastPage = navigationKey;
    window.gtag?.("event", "page_view", {
      page_path: pagePath,
      page_location: `${window.location.origin}${pagePath}`,
      page_title: document.title,
      ...(currentVisit?.campaign ? { campaign_name: currentVisit.campaign } : {}),
      ...(currentVisit?.campaignId ? { campaign_id: currentVisit.campaignId } : {}),
      ...(currentVisit?.source !== "direct" ? { campaign_source: currentVisit?.source } : {}),
      ...(currentVisit?.medium !== "(none)" ? { campaign_medium: currentVisit?.medium } : {}),
      ...(currentVisit?.content ? { campaign_content: currentVisit.content } : {}),
      ...(currentVisit?.term ? { campaign_term: currentVisit.term } : {}),
    });
  }, [analyticsReady, measurementId, pathname, searchParams]);

  if (!measurementId) return null;

  function handleAnalyticsReady() {
    window.dataLayer = window.dataLayer ?? [];
    window.gtag = window.gtag ?? ((...args: unknown[]) => window.dataLayer?.push(args));
    if (!window.__siddionaGaConfigured) {
      window.gtag("js", new Date());
      window.gtag("config", measurementId, {
        send_page_view: false,
        page_location: `${window.location.origin}${window.location.pathname}`,
      });
      window.__siddionaGaConfigured = true;
    }
    setAnalyticsReady(true);
  }

  return (
    <>
      <Script id="siddiona-ga-bootstrap" strategy="afterInteractive">
        {`(function(){
var id=${JSON.stringify(measurementId)};
window.dataLayer=window.dataLayer||[];
window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};
if(!window.__siddionaGaConfigured){
  window.gtag('js',new Date());
  window.gtag('config',id,{send_page_view:false,page_location:location.origin+location.pathname});
  window.__siddionaGaConfigured=true;
}
var key=location.pathname+'?'+new URLSearchParams(location.search).toString();
if(window.__siddionaGaLastPage!==key){
  var params=new URLSearchParams(location.search);
  var clean=function(name){
    var value=(params.get(name)||'').trim().toLowerCase().slice(0,200);
    return value&&!/\\S+@\\S+\\.\\S+/.test(value)&&!/(?:\\+?\\d[\\s().-]*){7,}/.test(value)?value:undefined;
  };
  var eventParams={page_path:location.pathname,page_location:location.origin+location.pathname,page_title:document.title};
  var source=clean('utm_source'),medium=clean('utm_medium'),campaign=clean('utm_campaign'),campaignId=clean('utm_id'),content=clean('utm_content'),term=clean('utm_term');
  if(source)eventParams.campaign_source=source;
  if(medium)eventParams.campaign_medium=medium;
  if(campaign)eventParams.campaign_name=campaign;
  if(campaignId)eventParams.campaign_id=campaignId;
  if(content)eventParams.campaign_content=content;
  if(term)eventParams.campaign_term=term;
  window.gtag('event','page_view',eventParams);
  window.__siddionaGaLastPage=key;
}
})();`}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`}
        strategy="afterInteractive"
        onLoad={handleAnalyticsReady}
        onReady={handleAnalyticsReady}
      />
    </>
  );
}
