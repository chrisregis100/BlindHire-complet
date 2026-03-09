"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Account, ProviderInterface } from "starknet";

interface InjectedStarknetWallet {
  isConnected: boolean;
  selectedAddress?: string;
  provider?: ProviderInterface;
  account?: Account;
  enable: (options?: { starknetVersion?: "v5"; showModal?: boolean }) => Promise<string[]>;
  isPreauthorized?: () => Promise<boolean>;
}

interface StarknetWindow {
  starknet?: InjectedStarknetWallet;
}

interface WalletState {
  accountAddress: string;
  account: Account | null;
  isConnecting: boolean;
  error: string;
}

function getInjectedWallet(): InjectedStarknetWallet | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as StarknetWindow).starknet;
}

export function useStarknetWallet() {
  const [walletState, setWalletState] = useState<WalletState>(() => {
    const wallet = getInjectedWallet();
    if (!wallet?.isConnected || !wallet.selectedAddress) {
      return {
        accountAddress: "",
        account: null,
        isConnecting: false,
        error: "",
      };
    }

    return {
      accountAddress: wallet.selectedAddress,
      account: wallet.account ?? null,
      isConnecting: false,
      error: "",
    };
  });

  const connectWallet = useCallback(async () => {
    const wallet = getInjectedWallet();
    if (!wallet) {
      setWalletState((previousValue) => ({
        ...previousValue,
        error: "No Starknet wallet found. Install ArgentX or Braavos.",
      }));
      return;
    }

    setWalletState((previousValue) => ({
      ...previousValue,
      isConnecting: true,
      error: "",
    }));

    try {
      const addresses = await wallet.enable({ showModal: true, starknetVersion: "v5" });
      const firstAddress = addresses[0] ?? wallet.selectedAddress ?? "";
      setWalletState({
        accountAddress: firstAddress,
        account: wallet.account ?? null,
        isConnecting: false,
        error: "",
      });
    } catch (error) {
      setWalletState({
        accountAddress: "",
        account: null,
        isConnecting: false,
        error: error instanceof Error ? error.message : "Wallet connection failed.",
      });
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWalletState({
      accountAddress: "",
      account: null,
      isConnecting: false,
      error: "",
    });
  }, []);

  useEffect(() => {
    const autoConnect = async () => {
      const wallet = getInjectedWallet();
      if (!wallet) return;

      try {
        const isPreauthorized = await wallet.isPreauthorized?.();
        if (isPreauthorized) {
          const addresses = await wallet.enable({ showModal: false, starknetVersion: "v5" });
          const firstAddress = addresses[0] ?? wallet.selectedAddress ?? "";
          if (firstAddress) {
            setWalletState({
              accountAddress: firstAddress,
              account: wallet.account ?? null,
              isConnecting: false,
              error: "",
            });
          }
        }
      } catch (error) {
        console.error("Auto-connect failed:", error);
      }
    };

    autoConnect();
  }, []);

  const isConnected = useMemo(
    () => Boolean(walletState.accountAddress && walletState.account),
    [walletState.accountAddress, walletState.account],
  );

  return {
    ...walletState,
    isConnected,
    connectWallet,
    disconnectWallet,
  };
}
