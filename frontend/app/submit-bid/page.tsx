"use client";

import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";

import { FormInput } from "@/components/form-input";
import { PageContainer } from "@/components/page-container";
import { PrimaryButton } from "@/components/primary-button";
import { TxStatus } from "@/components/tx-status";
import { useBlindHire } from "@/hooks/use-blindhire";
import { BID_STATUS, upsertStoredBid } from "@/lib/bid-storage";
import { buildCommitHash } from "@/lib/hash";

function SubmitBidForm() {
  const searchParams = useSearchParams();
  const blindHire = useBlindHire();

  const [jobId, setJobId] = useState(searchParams.get("jobId") ?? "");
  const [bidAmount, setBidAmount] = useState("");
  const [secret, setSecret] = useState("");
  const [localCommitHash, setLocalCommitHash] = useState("");

  const computedHashPreview = useMemo(() => {
    if (!bidAmount.trim() || !secret.trim()) return "";
    try {
      return buildCommitHash(bidAmount, secret);
    } catch {
      return "";
    }
  }, [bidAmount, secret]);

  const handleSubmitPrivateBid = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await blindHire.commitBid(Number(jobId), bidAmount, secret);
    setLocalCommitHash(result.commitHash);
    upsertStoredBid({
      jobId: String(jobId),
      bidAmount: bidAmount.trim(),
      secret: secret.trim(),
      commitHash: result.commitHash,
      commitTimestamp: Math.floor(Date.now() / 1000),
      walletAddress: blindHire.wallet.accountAddress,
      revealed: false,
      status: BID_STATUS.waitingRevealPhase,
      lastError: "",
      updatedAt: Date.now(),
    });
  };

  return (
    <PageContainer
      title="Submit Offer"
      subtitle="Your offer amount stays hidden until the confirmation period — no one can undercut you."
      narrow
    >
      {/* How it works callout */}
      <div className="mb-6 rounded-xl border border-border bg-surface p-5 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          How private offers work
        </p>
        <p className="text-sm text-foreground">
          We create a private hash of your offer on the frontend, then submit
          only that hash on-chain. Your actual amount is never visible during
          the submission period.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <form onSubmit={handleSubmitPrivateBid} className="space-y-6">
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
            hint="Enter a plain integer. Save this number — you need it to confirm your offer."
            type="number"
            min={0}
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            required
            placeholder="1500"
          />

          <FormInput
            label="Secret"
            hint="Any numeric string. Save this — you need it to confirm your offer later."
            type="text"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            required
            placeholder="e.g. 7331489"
          />

          <p className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
            Your offer will be automatically confirmed when the confirmation period begins.
          </p>

          {/* Live hash preview */}
          {computedHashPreview && (
            <div className="rounded-xl border border-border bg-background px-4 py-3">
              <p className="mb-1 text-xs text-muted-foreground">
                Offer hash preview (sent on-chain)
              </p>
              <p className="break-all font-mono text-xs text-primary">
                {computedHashPreview}
              </p>
            </div>
          )}

          {localCommitHash && (
            <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3" role="status">
              <p className="mb-1 text-xs text-green-600/80 dark:text-green-400/80">
                Offer submitted — hash confirmed
              </p>
              <p className="break-all font-mono text-xs text-green-600 dark:text-green-400">
                {localCommitHash}
              </p>
            </div>
          )}

          <div className="pt-2">
            <PrimaryButton
              type="submit"
              disabled={blindHire.isLoading}
              fullWidth
            >
              {blindHire.isLoading
                ? "Submitting…"
                : "Submit Offer"}
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

export default function SubmitBidPage() {
  return (
    <Suspense fallback={<PageContainer title="Submit Offer" narrow><div className="h-64 animate-pulse rounded-xl border border-border bg-surface" /></PageContainer>}>
      <SubmitBidForm />
    </Suspense>
  );
}
