"use client";

import { memo, useEffect, useRef, useState } from "react";

const HERO_CLIPS = [
  "/videos/hero/clip-1.mp4",
  "/videos/hero/clip-2.mp4",
  "/videos/hero/clip-3.mp4",
] as const;
const DISPLAY_MS = 6_500;
/** How long before a rotation the next clip starts downloading. */
const PREFETCH_LEAD_MS = 3_000;
/** Matches the opacity transition on `.hero-video-layer`. */
const FADE_MS = 1_000;

/** Data Saver, or the experimental `prefers-reduced-data` media query. */
function prefersReducedData(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return Boolean(connection?.saveData) || window.matchMedia("(prefers-reduced-data: reduce)").matches;
}

/** Stops any download. Removing `src` alone does not; `load()` with no source does. */
function releaseSource(video: HTMLVideoElement) {
  video.pause();
  if (video.hasAttribute("src")) video.removeAttribute("src");
  if (video.networkState !== HTMLMediaElement.NETWORK_EMPTY) video.load();
}

export const HeroVideoBackground = memo(function HeroVideoBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [fadingIndex, setFadingIndex] = useState<number | null>(null);
  const [prefetchNext, setPrefetchNext] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [reduceData, setReduceData] = useState(false);
  const displayIndex = reduceMotion ? 0 : activeIndex;
  const nextIndex = (displayIndex + 1) % HERO_CLIPS.length;
  const onScreen = isVisible && tabVisible && !reduceData;

  /**
   * A clip holds a source only while it is needed: the clip on screen, the
   * outgoing clip for the length of its crossfade, and the next clip from
   * shortly before its turn. Off screen or in a background tab nothing holds
   * a source, so nothing downloads; a paused video would otherwise keep
   * buffering.
   */
  const hasSource = (index: number) =>
    onScreen &&
    (index === displayIndex ||
      index === fadingIndex ||
      (!reduceMotion && prefetchNext && index === nextIndex));

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReduceMotion(media.matches);
    const updateVisibility = () => setTabVisible(!document.hidden);
    updatePreference();
    updateVisibility();
    setReduceData(prefersReducedData());
    media.addEventListener("change", updatePreference);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      media.removeEventListener("change", updatePreference);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: "240px 0px", threshold: 0.01 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // React has removed `src` from clips that no longer need one; abort their downloads.
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video && !hasSource(index) && video.networkState !== HTMLMediaElement.NETWORK_EMPTY) {
        releaseSource(video);
      }
    });
  });

  // Leaving the page: release every clip so no browser keeps downloading. The
  // elements are copied now because React clears the refs before this cleanup.
  useEffect(() => {
    const videos = videoRefs.current.filter((video): video is HTMLVideoElement => video !== null);
    return () => videos.forEach(releaseSource);
  }, []);

  useEffect(() => {
    if (fadingIndex === null) return;
    const timer = window.setTimeout(() => setFadingIndex(null), FADE_MS);
    return () => window.clearTimeout(timer);
  }, [fadingIndex]);

  useEffect(() => {
    const videos = videoRefs.current;
    const current = videos[displayIndex];
    const next = videos[nextIndex];
    let cancelled = false;
    let advancing = false;
    let rotationTimer: number | undefined;
    let prefetchTimer: number | undefined;
    videos.forEach((video) => video?.pause());
    if (!current || !onScreen) return;

    const pauseFirstFrame = () => {
      current.pause();
      if (current.currentTime === 0) current.currentTime = 0.01;
    };
    if (reduceMotion) {
      if (current.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) pauseFirstFrame();
      else current.addEventListener("loadeddata", pauseFirstFrame, { once: true });
      return () => current.removeEventListener("loadeddata", pauseFirstFrame);
    }

    // Retain the outgoing frame until the next clip has decoded and can play.
    const advance = () => {
      if (cancelled || advancing || !next || next.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) return;
      advancing = true;
      void next.play().then(() => {
        if (cancelled) { next.pause(); return; }
        setFadingIndex(displayIndex);
        setPrefetchNext(false);
        setActiveIndex(nextIndex);
      }).catch(() => { advancing = false; });
    };
    const queueNext = () => {
      setPrefetchNext(true);
      if (next?.readyState && next.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) advance();
      else next?.addEventListener("canplay", advance, { once: true });
    };
    void current.play().then(() => {
      if (cancelled) { current.pause(); return; }
      prefetchTimer = window.setTimeout(() => setPrefetchNext(true), DISPLAY_MS - PREFETCH_LEAD_MS);
      rotationTimer = window.setTimeout(queueNext, DISPLAY_MS);
    }).catch(() => undefined);

    return () => {
      cancelled = true;
      window.clearTimeout(rotationTimer);
      window.clearTimeout(prefetchTimer);
      next?.removeEventListener("canplay", advance);
      videos.forEach((video) => video?.pause());
    };
  }, [displayIndex, nextIndex, onScreen, reduceMotion]);

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#0B1020] [transform:translate3d(0,0,0)]" aria-hidden="true">
      {HERO_CLIPS.map((src, index) => (
        <video
          key={src}
          ref={(video) => { videoRefs.current[index] = video; }}
          src={hasSource(index) ? src : undefined}
          muted
          loop
          playsInline
          preload={hasSource(index) ? "auto" : "none"}
          disablePictureInPicture
          tabIndex={-1}
          data-active={displayIndex === index}
          style={{ opacity: displayIndex === index ? 1 : 0, display: reduceMotion && index !== 0 ? "none" : undefined }}
          className="hero-video-layer pointer-events-none absolute inset-0 h-full w-full object-cover [transform:translate3d(0,0,0)] will-change-[transform,opacity] transition-opacity duration-1000 ease-[cubic-bezier(0.77,0,0.175,1)]"
        />
      ))}
      <div className="animate-hero-light absolute -inset-[12%] bg-[radial-gradient(circle_at_62%_42%,rgba(234,88,12,0.22),transparent_38%)]" />
    </div>
  );
});
