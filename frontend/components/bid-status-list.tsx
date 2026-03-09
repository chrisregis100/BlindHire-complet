"use client";

import { BID_STATUS, StoredBid } from "@/lib/bid-storage";
import { PrimaryButton } from "./primary-button";

interface BidStatusListProps {
  bids: StoredBid[];
  isChecking: boolean;
  lastRunAt: number | null;
  onRevealNow: (bid: StoredBid) => Promise<void>;
}

const BID_STATUS_LABEL: Record<StoredBid["status"], string> = {
  [BID_STATUS.pendingCommit]: "Submitting Offer",
  [BID_STATUS.waitingRevealPhase]: "Waiting Confirmation Period",
  [BID_STATUS.revealSubmitted]: "Confirmation Sent",
  [BID_STATUS.revealCompleted]: "Offer Confirmed",
  [BID_STATUS.revealFailed]: "Confirmation Failed",
};

function formatUpdatedAt(lastRunAt: number | null): string {
  if (!lastRunAt) return "Never";
  return new Date(lastRunAt).toLocaleTimeString();
}

export function BidStatusList({
  bids,
  isChecking,
  lastRunAt,
  onRevealNow,
}: BidStatusListProps) {
  if (bids.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4 text-sm text-muted-foreground">
        No submitted offers found for this wallet.
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-5 shadow-sm" aria-label="Bid reveal statuses">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Automatic Confirmation Status</h2>
        <p className="text-xs text-muted-foreground">
          {isChecking ? "Checking now..." : `Last check: ${formatUpdatedAt(lastRunAt)}`}
        </p>
      </div>

      <ul className="space-y-3">
        {bids.map((bid) => {
          const shouldShowManualReveal =
            !bid.revealed &&
            (bid.status === BID_STATUS.revealFailed ||
              bid.status === BID_STATUS.waitingRevealPhase);

          return (
            <li
              key={`${bid.walletAddress}-${bid.jobId}-${bid.commitHash}`}
              className="rounded-lg border border-border bg-background px-4 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-xs text-muted-foreground">Job #{bid.jobId}</p>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {BID_STATUS_LABEL[bid.status]}
                </span>
              </div>

              {bid.lastError ? <p className="mt-2 text-xs text-red-500">{bid.lastError}</p> : null}

              {shouldShowManualReveal ? (
                <div className="mt-3">
                  <PrimaryButton
                    variant="secondary"
                    size="sm"
                    onClick={() => void onRevealNow(bid)}
                    aria-label={`Confirm offer now for job ${bid.jobId}`}
                  >
                    Confirm Now
                  </PrimaryButton>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
