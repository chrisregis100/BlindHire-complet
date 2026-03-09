"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";

import { AutoRevealProvider } from "@/contexts/auto-reveal-context";
import { WalletProvider } from "@/contexts/wallet-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <WalletProvider>
        <AutoRevealProvider>{children}</AutoRevealProvider>
      </WalletProvider>
    </ThemeProvider>
  );
}
