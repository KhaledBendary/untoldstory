"use client";

import { useEffect } from "react";

/** Reports the current 404 path to the dashboard's broken-links log, once. */
export default function Track404() {
  useEffect(() => {
    try {
      fetch("/api/track-404", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: location.pathname, referrer: document.referrer || null }),
        keepalive: true,
      }).catch(() => {});
    } catch {}
  }, []);
  return null;
}
