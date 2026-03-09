"use client";

import { useWallet } from "@/contexts/wallet-context";
import { PrimaryButton } from "./primary-button";

function truncateAddress(address: string): string {
  if (address.length < 14) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WalletButton() {
  const { isConnected, isConnecting, accountAddress, error, connectWallet, disconnectWallet } =
    useWallet();

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
          <span className="font-mono text-sm text-foreground">
            {truncateAddress(accountAddress)}
          </span>
        </div>
        <PrimaryButton
          variant="secondary"
          size="sm"
          onClick={disconnectWallet}
          aria-label="Disconnect wallet"
        >
          Disconnect
        </PrimaryButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <PrimaryButton
        onClick={connectWallet}
        disabled={isConnecting}
        aria-label="Connect Starknet wallet"
      >
        {isConnecting ? "Connecting…" : "Connect Wallet"}
      </PrimaryButton>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
