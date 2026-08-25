"use client";

import { useEffect, useState } from "react";

/**
 * True only after client mount — use to avoid SSR/client attribute mismatches.
 *
 * Deliberately useState + useEffect rather than useSyncExternalStore: the
 * external-store version returns its *client* snapshot during hydration, so
 * the first client render disagrees with the server HTML and React throws a
 * hydration mismatch (#418). Starting at `false` on both sides and flipping in
 * an effect is the pattern that actually hydrates cleanly, which is the whole
 * point of the hook.
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- mount detection
  useEffect(() => setHydrated(true), []);

  return hydrated;
}
