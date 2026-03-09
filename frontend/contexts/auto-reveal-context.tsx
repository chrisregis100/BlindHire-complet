"use client";

import { ReactNode, createContext, useContext } from "react";

import { useAutoReveal } from "@/hooks/use-auto-reveal";

type AutoRevealContextValue = ReturnType<typeof useAutoReveal>;

const AutoRevealContext = createContext<AutoRevealContextValue | null>(null);

export function AutoRevealProvider({ children }: { children: ReactNode }) {
  const autoReveal = useAutoReveal();

  return <AutoRevealContext.Provider value={autoReveal}>{children}</AutoRevealContext.Provider>;
}

export function useAutoRevealContext(): AutoRevealContextValue {
  const contextValue = useContext(AutoRevealContext);
  if (!contextValue)
    throw new Error("useAutoRevealContext must be used inside AutoRevealProvider.");
  return contextValue;
}
