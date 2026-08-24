"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { EASE } from './Reveal';
import { useHydrated } from '@/hooks/useHydrated';

/**
 * The overlay covers the viewport until it finishes, so its duration is the
 * page's Largest Contentful Paint. Keep it capped and skippable.
 */
const TICK_MS = 40;
const MAX_DURATION_MS = 1400;

export default function Preloader({ onDone }: { onDone: () => void }) {
  const hydrated = useHydrated();
  const reduceMotion = useReducedMotion();
  const [count, setCount] = useState(0);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (!hydrated) return;

    // Readers who asked for less motion get the content, not the show.
    if (reduceMotion) {
      setCount(100);
      setGone(true);
      return;
    }

    let v = 0;
    const t = setInterval(() => {
      v += Math.floor(Math.random() * 8) + 5;
      if (v >= 100) {
        v = 100;
        clearInterval(t);
        setTimeout(() => setGone(true), 200);
      }
      setCount(v);
    }, TICK_MS);

    // Hard ceiling: a slow API or a stalled tick must never hold the page.
    const ceiling = setTimeout(() => {
      clearInterval(t);
      setCount(100);
      setGone(true);
    }, MAX_DURATION_MS);

    return () => {
      clearInterval(t);
      clearTimeout(ceiling);
    };
  }, [hydrated, reduceMotion]);

  // Avoid SSR Motion style attributes; show a static overlay until hydrated.
  if (!hydrated) {
    return (
      <div className="fixed inset-0 z-[300] bg-[#0a0a0a] flex flex-col items-center justify-center">
        <img
          src="/images/logo-white.png"
          alt="Global Untold Story"
          className="w-[15.5vw] max-w-[7rem] h-auto"
        />
        <div className="absolute bottom-8 left-0 right-0 px-5 md:px-10 flex items-end justify-between">
          <p className="font-mono2 text-[10px] tracking-[0.3em] uppercase text-white/40">
            Film Production Services — Egypt · UAE · KSA
          </p>
          <p className="font-display font-extrabold text-5xl md:text-7xl tabular-nums leading-none">
            0<span className="text-white/30 text-2xl md:text-4xl">%</span>
          </p>
        </div>
        <div className="absolute bottom-0 left-0 h-[2px] bg-white" style={{ width: '0%' }} />
      </div>
    );
  }

  return (
    <AnimatePresence onExitComplete={onDone}>
      {!gone && (
        <motion.div
          className="fixed inset-0 z-[300] bg-[#0a0a0a] flex flex-col items-center justify-center"
          exit={{ y: '-100%' }}
          transition={{ duration: reduceMotion ? 0 : 0.7, ease: EASE }}
        >
          <motion.img
            src="/images/logo-white.png"
            alt="Global Untold Story"
            className="w-[15.5vw] max-w-[7rem] h-auto"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
          />
          <div className="absolute bottom-8 left-0 right-0 px-5 md:px-10 flex items-end justify-between">
            <p className="font-mono2 text-[10px] tracking-[0.3em] uppercase text-white/40">
              Film Production Services — Egypt · UAE · KSA
            </p>
            <p className="font-display font-extrabold text-5xl md:text-7xl tabular-nums leading-none">
              {count}<span className="text-white/30 text-2xl md:text-4xl">%</span>
            </p>
          </div>
          <div className="absolute bottom-0 left-0 h-[2px] bg-white" style={{ width: `${count}%`, transition: 'width 0.15s linear' }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
