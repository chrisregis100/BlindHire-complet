"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

import { ToastContainer } from "@/components/toast";
import { AutoRevealProvider } from "@/contexts/auto-reveal-context";
import { ToastProvider } from "@/contexts/toast-context";
import { WalletProvider } from "@/contexts/wallet-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <WalletProvider>
        <ToastProvider>
          <AutoRevealProvider>
            {children}
            <ToastContainer />
          </AutoRevealProvider>
        </ToastProvider>
      </WalletProvider>
    </ThemeProvider>
  );
}
