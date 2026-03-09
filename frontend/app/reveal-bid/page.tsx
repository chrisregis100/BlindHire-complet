"use client";

import { FormEvent, useState } from "react";

import { BidStatusList } from "@/components/bid-status-list";
import { FormInput } from "@/components/form-input";
import { PageContainer } from "@/components/page-container";
import { PrimaryButton } from "@/components/primary-button";
import { TxStatus } from "@/components/tx-status";
import { useAutoRevealContext } from "@/contexts/auto-reveal-context";
import { useBlindHire } from "@/hooks/use-blindhire";

export default function RevealBidPage() {
  const blindHire = useBlindHire();
  const autoReveal = useAutoRevealContext();
  const [jobId, setJobId] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [secret, setSecret] = useState("");
  const [revealed, setRevealed] = useState(false);

  const handleRevealBid = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await blindHire.revealBid(Number(jobId), bidAmount, secret);
    setRevealed(true);
  };

  return (
    <PageContainer
      title="Confirm Offer"
      subtitle="The submission deadline has passed. Confirm your original amount and secret so your offer can be verified."
      narrow
    >
      {/* Phase context callout */}
      <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/10 px-5 py-4 shadow-sm">
        <div className="flex items-start gap-3">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="mt-0.5 h-5 w-5 shrink-0 text-amber-500"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Offer confirmation period is open</p>
            <p className="mt-0.5 text-xs text-amber-600/80 dark:text-amber-400/80">
              Enter the exact same amount and secret you used when submitting your offer. The
              system will verify your offer on-chain and reject mismatches.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="mb-6 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3">
          <p className="text-sm text-primary">
            Your offer will be automatically confirmed when the confirmation period begins.
          </p>
        </div>

        <div className="mb-6">
          <BidStatusList
            bids={autoReveal.bids}
            isChecking={autoReveal.isChecking}
            lastRunAt={autoReveal.lastRunAt}
            onRevealNow={autoReveal.manualReveal}
          />
        </div>

        {revealed && !blindHire.isLoading && !blindHire.error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3" role="status">
            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-green-500" aria-hidden="true" />
            <p className="text-sm text-green-600 dark:text-green-400">
              Offer confirmed. Wait for the confirmation deadline, then finalize on the Results page.
            </p>
          </div>
        )}

        <form onSubmit={handleRevealBid} className="space-y-6">
          <FormInput
            label="Job ID"
            type="number"
            min={0}
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            required
            placeholder="0"
          />

          <FormInput
            label="Offer Amount"
            hint="Must match exactly what you submitted."
            type="number"
            min={0}
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            required
            placeholder="1500"
          />

          <FormInput
            label="Secret"
            hint="Must match exactly what you submitted."
            type="text"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            required
            placeholder="e.g. 7331489"
          />

          <div className="pt-2">
            <PrimaryButton type="submit" disabled={blindHire.isLoading} fullWidth>
              {blindHire.isLoading ? "Confirming…" : "Confirm Offer"}
            </PrimaryButton>
          </div>
        </form>
      </div>

      <div className="mt-4">
        <TxStatus
          error={blindHire.error}
          isLoading={blindHire.isLoading}
          lastTxHash={blindHire.lastTxHash}
        />
      </div>
    </PageContainer>
  );
}
