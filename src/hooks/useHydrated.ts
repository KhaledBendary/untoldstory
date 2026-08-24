"use client";

import { useEffect, useState } from "react";

/** True only after client mount — use to avoid SSR/client attribute mismatches. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
