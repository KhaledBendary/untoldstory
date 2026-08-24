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
import DomSafetyPatch from "./DomSafetyPatch";
import { SiteReadyProvider } from "./SiteContext";
import { LanguageProvider, useLanguage } from "./LanguageContext";

gsap.registerPlugin(ScrollTrigger);

export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <SiteShellInner>{children}</SiteShellInner>
    </LanguageProvider>
  );
}

function SiteShellInner({ children }: { children: React.ReactNode }) {
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
    };
  }, [locale]);

  return (
    <SiteReadyProvider value={loaded}>
      <DomSafetyPatch />
      <div className="grain bg-[#0a0a0a] min-h-screen text-[#fafafa]">
        {!loaded && <Preloader onDone={() => setLoaded(true)} />}
        <Cursor />
        <Navbar />
        <main>{children}</main>
        <Footer />
        <WhatsAppButton />
      </div>
    </SiteReadyProvider>
  );
}
