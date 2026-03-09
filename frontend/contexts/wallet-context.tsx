"use client";

import { createContext, useContext, ReactNode } from "react";

import { useStarknetWallet } from "@/hooks/use-starknet-wallet";

type WalletContextValue = ReturnType<typeof useStarknetWallet>;

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const wallet = useStarknetWallet();
  return <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider.");
  return ctx;
}
