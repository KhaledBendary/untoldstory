"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { readConsent, consentRequired } from "@/lib/consent";

/**
 * Cookieless page-view tracker, gated by the same consent as the other tags. In
 * a consent-required region nothing is recorded until the visitor grants it;
 * elsewhere it records unless they explicitly declined. It reports the path,
 * referrer and UTM params, tagged with an ephemeral per-tab session id — no
 * cookies, no personal data, no cross-site identifier.
 *
 * Only people are counted. Crawlers and audit tools that render pages with a real
 * browser run this script too (one burst of ~1,500 "visitors" from data-centre IPs
 * hit all 14 languages in five minutes), so a view is recorded only when:
 *   - the browser is not driven by automation (navigator.webdriver), and
 *   - the visitor actually uses the page (moves the pointer, scrolls, touches or
 *     types) or stays on it, visible, for a while.
 * Once a tab has shown a real interaction, later pages in that tab count at once.
 */
const STAY_MS = 8000;
const INTERACTION_EVENTS = ["pointermove", "pointerdown", "scroll", "keydown", "touchstart", "wheel"] as const;

let humanSeen = false; // survives client-side navigations within the tab

function isAutomated(): boolean {
  const nav = navigator as Navigator & { webdriver?: boolean };
  return nav.webdriver === true || /HeadlessChrome|PhantomJS|Playwright|Puppeteer/i.test(navigator.userAgent);
}

export default function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const stops: Array<() => void> = [];

    const send = () => {
      if (cancelled) return;
      try {
        let session = sessionStorage.getItem("gus_sid");
        if (!session) {
          session = Math.random().toString(36).slice(2) + Date.now().toString(36);
          sessionStorage.setItem("gus_sid", session);
        }
        const url = new URL(window.location.href);
        const p = url.searchParams;
        const body = JSON.stringify({
          session,
          path: pathname || url.pathname,
          referrer: document.referrer || null,
          utm_source: p.get("utm_source"),
          utm_medium: p.get("utm_medium"),
          utm_campaign: p.get("utm_campaign"),
          locale: document.documentElement.lang || null,
        });
        // sendBeacon is fire-and-forget and survives the page unloading.
        if (navigator.sendBeacon) {
          navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
        } else {
          fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
        }
      } catch {
        /* analytics must never break the page */
      }
    };

    try {
      const consent = readConsent();
      const allowed = consent === "granted" || (!consentRequired() && consent !== "denied");
      if (!allowed || isAutomated()) return;

      if (humanSeen) {
        send();
        return;
      }

      const confirmHuman = () => {
        if (cancelled) return;
        humanSeen = true;
        stops.forEach((stop) => stop());
        stops.length = 0;
        if (timer) clearTimeout(timer);
        send();
      };
      for (const name of INTERACTION_EVENTS) {
        window.addEventListener(name, confirmHuman, { once: true, passive: true });
        stops.push(() => window.removeEventListener(name, confirmHuman));
      }
      // Reading without touching anything still counts — but only if the tab is
      // actually in front of someone for a while.
      timer = setTimeout(() => {
        if (document.visibilityState === "visible") confirmHuman();
      }, STAY_MS);
    } catch {
      /* analytics must never break the page */
    }

    return () => {
      cancelled = true;
      stops.forEach((stop) => stop());
      if (timer) clearTimeout(timer);
    };
  }, [pathname]);

  return null;
}
