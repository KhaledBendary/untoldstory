"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Cursor from "./Cursor";
import Preloader from "./Preloader";
import WhatsAppButton from "./WhatsAppButton";
import ConsentBanner from "./ConsentBanner";
import DomSafetyPatch from "./DomSafetyPatch";
import { SiteReadyProvider } from "./SiteContext";
import { LanguageProvider, useLanguage } from "./LanguageContext";
import type { ShellData } from "@/lib/page-data";

gsap.registerPlugin(ScrollTrigger);

export default function SiteShell({
  children,
  shell,
  locale,
}: {
  children: React.ReactNode;
  shell: ShellData | null;
  locale: string;
}) {
  return (
    <LanguageProvider>
      <SiteShellInner shell={shell} locale={locale}>{children}</SiteShellInner>
    </LanguageProvider>
  );
}

function SiteShellInner({ children, shell, locale: initialLocale }: { children: React.ReactNode; shell: ShellData | null; locale: string }) {
  const [loaded, setLoaded] = useState(false);
  const pathname = usePathname();
  const { locale } = useLanguage();

  useEffect(() => {
    const lenis = (window as unknown as { lenis?: Lenis }).lenis;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }

    // Kill on leave (cleanup), not on enter — otherwise we'd wipe triggers
    // the new page just created in the same commit.
    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill(true));
      ScrollTrigger.clearScrollMemory?.();
    };
  }, [pathname]);

  useEffect(() => {
    // Smooth scroll hijacks the wheel and drives scrolling from rAF. Safari
    // already applies its own momentum curve, so the two fight and the page
    // feels like it is catching — the stutter people report there and not in
    // Chrome. Leave Safari's native scrolling alone, and skip the loop
    // entirely for anyone who asked for less motion.
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ua = navigator.userAgent;
    const isSafari = /Safari/.test(ua) && !/Chrome|Chromium|Android|Edg\//.test(ua);

    if (prefersReducedMotion || isSafari) return;

    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    (window as unknown as { lenis?: Lenis }).lenis = lenis;
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      // Clear the handle too: route changes read it to scroll to the top, and
      // a destroyed instance left behind means that silently does nothing.
      delete (window as unknown as { lenis?: Lenis }).lenis;
    };
  }, [locale]);

  return (
    <SiteReadyProvider value={loaded}>
      <DomSafetyPatch />
      <div className="grain bg-[#0a0a0a] min-h-screen text-[#fafafa]">
        {!loaded && <Preloader onDone={() => setLoaded(true)} />}
        <Cursor />
        <Navbar initialData={shell} initialLocale={initialLocale} />
        <main>{children}</main>
        <Footer initialData={shell} initialLocale={initialLocale} />
        <WhatsAppButton />
        {/* Inside the provider: it reads the active locale. */}
        <ConsentBanner />
      </div>
    </SiteReadyProvider>
  );
}
