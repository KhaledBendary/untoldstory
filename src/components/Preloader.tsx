"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { EASE } from './Reveal';
import { useHydrated } from '@/hooks/useHydrated';

/**
 * The overlay covers the viewport until it finishes, so its duration is the
 * page's Largest Contentful Paint. Keep it capped and skippable.
 */
const MotionImage = motion.create(Image);

// The overlay is opaque and full-screen, so its lifetime *is* the page's
// Largest Contentful Paint — Lighthouse measured 3.8s with the old timings.
// Fast enough to still read as an intro, short enough not to own the metric.
const TICK_MS = 22;
const MAX_DURATION_MS = 700;

export default function Preloader({ onDone }: { onDone: () => void }) {
  const hydrated = useHydrated();
  const reduceMotion = useReducedMotion();
  const [count, setCount] = useState(0);
  const [gone, setGone] = useState(false);

  // Readers who asked for less motion get the content, not the show. Derived
  // rather than pushed into state, so no render is spent showing the overlay.
  const skip = hydrated && Boolean(reduceMotion);

  useEffect(() => {
    if (!hydrated || skip) return;

    let v = 0;
    const t = setInterval(() => {
      v += Math.floor(Math.random() * 10) + 8;
      if (v >= 100) {
        v = 100;
        clearInterval(t);
        setTimeout(() => setGone(true), 90);
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
  }, [hydrated, skip]);

  // Nothing to animate — hand control to the page immediately.
  useEffect(() => {
    if (skip) onDone();
  }, [skip, onDone]);

  if (skip) return null;

  // Nothing on the server.
  //
  // This used to render a full-viewport opaque overlay into the SSR HTML, so
  // the real content stayed hidden until hydration finished — and hydration is
  // exactly what a throttled device is slowest at. Lighthouse measured LCP at
  // 4.8s while every byte had arrived by 324ms. The intro still plays for real
  // visitors; it just no longer sits in front of the first paint.
  if (!hydrated) return null;

  return (
    <AnimatePresence onExitComplete={onDone}>
      {!gone && (
        <motion.div
          className="fixed inset-0 z-[300] bg-[#0a0a0a] flex flex-col items-center justify-center"
          exit={{ y: '-100%' }}
          transition={{ duration: reduceMotion ? 0 : 0.45, ease: EASE }}
        >
          <MotionImage
            src="/images/logo-white.png"
            alt="Global Untold Story"
            width={348}
            height={191}
            priority
            className="w-[15.5vw] max-w-[7rem] h-auto"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
          />
          <div className="absolute bottom-8 left-0 right-0 px-5 md:px-10 flex items-end justify-between">
            <p className="font-mono2 text-[10px] tracking-[0.3em] uppercase text-white/55">
              Film Production Services — Egypt · UAE · KSA
            </p>
            <p className="font-display font-extrabold text-5xl md:text-7xl tabular-nums leading-none">
              {count}<span className="text-white/55 text-2xl md:text-4xl">%</span>
            </p>
          </div>
          <div className="absolute bottom-0 left-0 h-[2px] bg-white" style={{ width: `${count}%`, transition: 'width 0.15s linear' }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
