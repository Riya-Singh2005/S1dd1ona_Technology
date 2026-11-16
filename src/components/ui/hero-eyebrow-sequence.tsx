"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

const WORDS = ["TECHNOLOGY", "PEOPLE", "IMPACT"] as const;
const CHARACTER_INTERVAL = 95;
const WORD_HOLD = 800;
const EXIT_DURATION = 300;
const LOOP_PAUSE = 240;

interface HeroEyebrowSequenceProps {
  trigger: boolean;
  className?: string;
}

export function HeroEyebrowSequence({
  trigger,
  className,
}: HeroEyebrowSequenceProps) {
  const reduceMotion = useReducedMotion();
  const [text, setText] = useState("IMPACT");
  const [visible, setVisible] = useState(true);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const clearTimers = () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current = [];
    };

    clearTimers();

    const schedule = (callback: () => void, delay: number) => {
      const timer = window.setTimeout(callback, delay);
      timers.current.push(timer);
    };

    if (!trigger || reduceMotion) {
      schedule(() => {
        setText("IMPACT");
        setVisible(true);
      }, 0);
      return clearTimers;
    }

    const runCycle = () => {
      let elapsed = CHARACTER_INTERVAL;

      schedule(() => {
        setText("");
        setVisible(true);
      }, 0);

      WORDS.forEach((word) => {
        Array.from(word).forEach((_, characterIndex) => {
          schedule(() => {
            setText(word.slice(0, characterIndex + 1));
            setVisible(true);
          }, elapsed);
          elapsed += CHARACTER_INTERVAL;
        });

        elapsed += WORD_HOLD;
        schedule(() => setVisible(false), elapsed);
        elapsed += EXIT_DURATION;
        schedule(() => {
          setText("");
          setVisible(true);
        }, elapsed);
      });

      elapsed += LOOP_PAUSE;
      schedule(runCycle, elapsed);
    };

    runCycle();

    return clearTimers;
  }, [reduceMotion, trigger]);

  return (
    <p className={className}>
      <span className="sr-only">Technology, People, Impact</span>
      <span
        aria-hidden="true"
        className={`inline-grid min-w-[10ch] place-items-center transition-[opacity,filter,transform] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          visible
            ? "translate-y-0 opacity-100 blur-0"
            : "-translate-y-0.5 opacity-0 blur-[1px]"
        }`}
      >
        {text || "\u00A0"}
      </span>
    </p>
  );
}
