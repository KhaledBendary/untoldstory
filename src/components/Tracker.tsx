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
 */
export default function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      const consent = readConsent();
      const allowed = consent === "granted" || (!consentRequired() && consent !== "denied");
      if (!allowed) return;

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
  }, [pathname]);

  return null;
}
