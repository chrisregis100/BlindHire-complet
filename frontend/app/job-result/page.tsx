"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { FormInput } from "@/components/form-input";
import { PageContainer } from "@/components/page-container";
import { PrimaryButton } from "@/components/primary-button";
import { ProfileBadge } from "@/components/profile-badge";
import { TxStatus } from "@/components/tx-status";
import { useBlindHire } from "@/hooks/use-blindhire";
import { useProfilesByWallets } from "@/hooks/use-profile";
import { RevealedBidView, WinnerView } from "@/lib/types";

const EMPTY_WINNER: WinnerView = {
  hasWinner: false,
  winnerAddress: "",
  winningAmount: BigInt(0),
};

function JobResultContent() {
  const searchParams = useSearchParams();
  const blindHire = useBlindHire();
  const [jobId, setJobId] = useState(searchParams.get("jobId") ?? "");
  const [revealedBids, setRevealedBids] = useState<RevealedBidView[]>([]);
  const [winner, setWinner] = useState<WinnerView>(EMPTY_WINNER);
  const [hasLoaded, setHasLoaded] = useState(false);

  const parsedJobId = Number(jobId || 0);

  const walletAddresses = useMemo(() => {
    const addrs = revealedBids.map((b) => b.freelancerAddress);
    if (winner.hasWinner && !addrs.includes(winner.winnerAddress)) {
      addrs.push(winner.winnerAddress);
    }
    return addrs;
  }, [revealedBids, winner]);

  const { profileMap } = useProfilesByWallets(walletAddresses);

  const handleLoadResult = async () => {
    const [nextBids, nextWinner] = await Promise.all([
      blindHire.getRevealedBids(parsedJobId),
      blindHire.getWinner(parsedJobId),
    ]);
    setRevealedBids(nextBids);
    setWinner(nextWinner);
    setHasLoaded(true);
  };

  const handleFinalize = async () => {
    await blindHire.finalizeAuction(parsedJobId);
    await handleLoadResult();
  };

  const winnerProfile = winner.hasWinner
    ? profileMap.get(winner.winnerAddress.toLowerCase()) ?? null
    : null;

  return (
    <PageContainer
      title="Job Results"
      subtitle="Finalize once the offer confirmation deadline has passed. The lowest valid offer wins."
    >
      {/* Controls */}
      <div className="mb-6 rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-48">
            <FormInput
              label="Job ID"
              type="number"
              min={0}
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="flex flex-wrap gap-3 pb-0.5">
            <PrimaryButton
              type="button"
              variant="secondary"
              onClick={handleLoadResult}
              disabled={blindHire.isLoading}
            >
              Load Results
            </PrimaryButton>
            <PrimaryButton
              type="button"
              onClick={handleFinalize}
              disabled={blindHire.isLoading}
            >
              {blindHire.isLoading ? "Processing…" : "Finalize"}
            </PrimaryButton>
          </div>
        </div>
      </div>

      {hasLoaded && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Winner card */}
          <div className="lg:col-span-2">
            <div
              className={`h-full rounded-xl border p-6 shadow-sm ${
                winner.hasWinner
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-border bg-surface"
              }`}
            >
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Winner
              </p>

              {winner.hasWinner ? (
                <div className="space-y-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-500/10">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      className="h-7 w-7 text-green-500"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0"
                      />
                    </svg>
                  </div>

                  {/* Profile-aware winner display */}
                  <ProfileBadge
                    profile={winnerProfile}
                    walletAddress={winner.winnerAddress}
                    size="md"
                  />

                  <div>
                    <p className="mb-1 text-xs text-muted-foreground">
                      Winning Offer
                    </p>
                    <p className="text-3xl font-bold tabular-nums text-green-600 dark:text-green-400">
                      {winner.winningAmount.toString()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-hover">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      className="h-6 w-6 text-muted-foreground"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-foreground">Not finalized yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Click &ldquo;Finalize&rdquo; after the confirmation
                    deadline.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Confirmed Offers */}
          <div className="lg:col-span-3">
            <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Confirmed Offers ({revealedBids.length})
              </p>

              {!revealedBids.length ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-muted-foreground">
                    No confirmed offers for this job.
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {revealedBids.map((bid, index) => {
                    const isWinner =
                      winner.hasWinner &&
                      bid.freelancerAddress.toLowerCase() ===
                        winner.winnerAddress.toLowerCase();
                    const bidProfile =
                      profileMap.get(bid.freelancerAddress.toLowerCase()) ??
                      null;

                    return (
                      <li
                        key={`${bid.freelancerAddress}-${bid.amount.toString()}`}
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors duration-150 ${
                          isWinner
                            ? "border-green-500/30 bg-green-500/5"
                            : "border-border bg-background hover:border-primary/30"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              #{index + 1}
                            </span>
                            {isWinner && (
                              <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[11px] font-medium text-green-600 dark:text-green-400">
                                Winner
                              </span>
                            )}
                          </div>
                          <ProfileBadge
                            profile={bidProfile}
                            walletAddress={bid.freelancerAddress}
                            size="sm"
                          />
                        </div>
                        <p
                          className={`ml-4 shrink-0 text-base font-bold tabular-nums ${
                            isWinner ? "text-green-600 dark:text-green-400" : "text-foreground"
                          }`}
                        >
                          {bid.amount.toString()}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <TxStatus
          error={blindHire.error}
          isLoading={blindHire.isLoading}
          lastTxHash={blindHire.lastTxHash}
        />
      </div>
    </PageContainer>
  );
}

export default function JobResultPage() {
  return (
    <Suspense fallback={<PageContainer title="Job Results"><div className="h-64 animate-pulse rounded-xl border border-border bg-surface" /></PageContainer>}>
      <JobResultContent />
    </Suspense>
  );
}
