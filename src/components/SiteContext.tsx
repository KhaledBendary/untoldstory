"use client";

import { createContext, useContext } from "react";

const SiteReadyContext = createContext(true);

export function SiteReadyProvider({ value, children }: { value: boolean; children: React.ReactNode }) {
  return <SiteReadyContext.Provider value={value}>{children}</SiteReadyContext.Provider>;
}

export function useSiteReady() {
  return useContext(SiteReadyContext);
}
