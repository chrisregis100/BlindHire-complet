"use client";

/**
 * Inline wallet connection display — used when you need wallet state
 * inside a page body rather than exclusively in the Navbar.
 * Accepts explicit props to stay decoupled from context.
 */

import { truncateAddress } from "@/lib/format";
import { PrimaryButton } from "./primary-button";

interface WalletConnectProps {
  isConnected: boolean;
  isConnecting: boolean;
  accountAddress: string;
  error: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

export function WalletConnect({
  isConnected,
  isConnecting,
  accountAddress,
  error,
  connectWallet,
  disconnectWallet,
}: WalletConnectProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      {isConnected ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              Connected:{" "}
              <span className="font-mono text-foreground">{truncateAddress(accountAddress)}</span>
            </p>
          </div>
          <PrimaryButton
            variant="secondary"
            size="sm"
            onClick={disconnectWallet}
          >
            Disconnect
          </PrimaryButton>
        </div>
      ) : (
        <PrimaryButton
          fullWidth
          onClick={connectWallet}
          disabled={isConnecting}
        >
          {isConnecting ? "Connecting…" : "Connect ArgentX / Braavos"}
        </PrimaryButton>
      )}
      {error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
