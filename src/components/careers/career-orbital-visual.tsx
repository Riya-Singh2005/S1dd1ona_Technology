"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Users, ChartNoAxesCombined, Cloud } from "lucide-react";
import styles from "./career-orbital-visual.module.css";

export function CareerOrbitalVisual({ ready }: { ready: boolean }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let visible = false;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setRunning(ready && visible && !document.hidden && !motion.matches);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }, { threshold: 0.1 });
    observer.observe(stage);
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", sync);
    };
  }, [ready]);

  return (
    <div ref={stageRef} className={styles.stage} data-running={running} role="img" aria-label="People, Business and Technology orbit a stable Siddiona core.">
      <div aria-hidden="true" className={styles.scene}>
        <div className={styles.floor} />
        <div className={`${styles.plane} ${styles.planeOne}`}><div className={styles.ring} /></div>
        <div className={`${styles.plane} ${styles.planeTwo}`}><div className={styles.ring} /></div>
        <div className={`${styles.plane} ${styles.planeThree}`}><div className={styles.ring} /></div>
        <div className={styles.core}>
          <Image src="/brand/Siddiona-emblem-icon-white.png" alt="" width={500} height={516} sizes="(min-width: 1024px) 140px, 100px" className={styles.emblem} />
        </div>
        <div className={`${styles.node} ${styles.people}`}><div className={styles.sphere}><Users /></div><span>People</span></div>
        <div className={`${styles.node} ${styles.business}`}><div className={styles.sphere}><ChartNoAxesCombined /></div><span>Business</span></div>
        <div className={`${styles.node} ${styles.technology}`}><div className={styles.sphere}><Cloud /></div><span>Technology</span></div>
      </div>
    </div>
  );
}
