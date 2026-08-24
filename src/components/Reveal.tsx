"use client";

import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';
import { useHydrated } from '@/hooks/useHydrated';

const EASE = [0.76, 0, 0.24, 1] as const;

/** Splits children text into words, each revealed with a masked rise. */
export function SplitWords({ text, className = '', delay = 0, as: Tag = 'h2' }: {
  text: string; className?: string; delay?: number; as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
}) {
  const hydrated = useHydrated();
  const words = text.split(' ');

  // Arabic script letters connect and have tall ascenders/descenders — the
  // per-word overflow-hidden mask clips them. Render Arabic (and any RTL
  // script) as plain text instead of splitting into masked words.
  if (!hydrated || /[\u0600-\u06FF]/.test(text)) {
    return <Tag className={className} aria-label={text}>{text}</Tag>;
  }

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.045, delayChildren: delay } },
  };
  const word: Variants = {
    hidden: { y: '115%', rotate: 3 },
    show: { y: '0%', rotate: 0, transition: { duration: 0.9, ease: EASE } },
  };
  const MTag = motion[Tag] as typeof motion.div;
  return (
    <MTag
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-8% 0px' }}
      aria-label={text}
    >
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom">
          <motion.span className="inline-block will-change-transform" variants={word}>
            {w}{i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </MTag>
  );
}

/** Fade + rise reveal block. */
export function Reveal({ children, delay = 0, y = 36, className = '' }: {
  children: ReactNode; delay?: number; y?: number; className?: string;
}) {
  const hydrated = useHydrated();

  // Plain element on SSR/first paint so Motion style attrs don't mismatch hydration.
  if (!hydrated) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 1, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Masked line that sweeps in from the left. */
export function LineReveal({ className = '' }: { className?: string }) {
  const hydrated = useHydrated();

  if (!hydrated) {
    return <div className={`h-px bg-current opacity-20 ${className}`} />;
  }

  return (
    <motion.div
      className={`h-px bg-current opacity-20 ${className}`}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: '-5% 0px' }}
      transition={{ duration: 1.4, ease: EASE }}
      style={{ transformOrigin: 'left' }}
    />
  );
}

export { EASE };
