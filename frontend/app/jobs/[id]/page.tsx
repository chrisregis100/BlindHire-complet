"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { BidStatusList } from "@/components/bid-status-list";
import { CountdownTimer } from "@/components/countdown-timer";
import { FormInput } from "@/components/form-input";
import { PhaseBadge } from "@/components/phase-badge";
import { PrimaryButton } from "@/components/primary-button";
import { ProfileBadge } from "@/components/profile-badge";
import { useAutoRevealContext } from "@/contexts/auto-reveal-context";
import { useToast } from "@/contexts/toast-context";
import { useBlindHire } from "@/hooks/use-blindhire";
import { useProfilesByWallets } from "@/hooks/use-profile";
import { BID_STATUS, upsertStoredBid } from "@/lib/bid-storage";
import { fetchJobById } from "@/lib/contract";
import { formatDeadline, getJobPhase, truncateAddress } from "@/lib/format";
import { buildCommitHash } from "@/lib/hash";
import { JobView, RevealedBidView, WinnerView } from "@/lib/types";

const EMPTY_WINNER: WinnerView = { hasWinner: false, winnerAddress: "", winningAmount: BigInt(0) };

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const jobId = Number(id);
  const blindHire = useBlindHire();
  const autoReveal = useAutoRevealContext();
  const { addToast } = useToast();

  const [job, setJob] = useState<JobView | null>(null);
  const [isLoadingJob, setIsLoadingJob] = useState(true);

  // Bid form state
  const [bidAmount, setBidAmount] = useState("");
  const [secret, setSecret] = useState("");

  // Reveal form state
  const [revealAmount, setRevealAmount] = useState("");
  const [revealSecret, setRevealSecret] = useState("");

  // Results
  const [revealedBids, setRevealedBids] = useState<RevealedBidView[]>([]);
  const [winner, setWinner] = useState<WinnerView>(EMPTY_WINNER);
  const [hasLoadedResults, setHasLoadedResults] = useState(false);

  // Load job
  useEffect(() => {
    setIsLoadingJob(true);
    fetchJobById(jobId)
      .then((j) => setJob(j))
      .catch(() => setJob(null))
      .finally(() => setIsLoadingJob(false));
  }, [jobId]);

  // Load results when job is loaded and past bidding phase
  const loadResults = useCallback(async () => {
    try {
      const [bids, w] = await Promise.all([
        blindHire.getRevealedBids(jobId),
        blindHire.getWinner(jobId),
      ]);
      setRevealedBids(bids);
      setWinner(w);
      setHasLoadedResults(true);
    } catch {
      // Silently fail — results may not be available yet
    }
  }, [blindHire, jobId]);

  const phase = job ? getJobPhase(job.commitDeadline, job.revealDeadline, job.finalized) : null;

  useEffect(() => {
    if (job && (phase === "confirming" || phase === "finalized" || phase === "expired")) {
      loadResults();
    }
  }, [job, phase, loadResults]);

  // Profile lookup for results
  const walletAddresses = useMemo(() => {
    const addrs = revealedBids.map((b) => b.freelancerAddress);
    if (winner.hasWinner && !addrs.includes(winner.winnerAddress)) addrs.push(winner.winnerAddress);
    return addrs;
  }, [revealedBids, winner]);
  const { profileMap } = useProfilesByWallets(walletAddresses);

  // Hash preview
  const computedHashPreview = useMemo(() => {
    if (!bidAmount.trim() || !secret.trim()) return "";
    try { return buildCommitHash(bidAmount, secret); } catch { return ""; }
  }, [bidAmount, secret]);

  // Submit bid
  const handleSubmitBid = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const result = await blindHire.commitBid(jobId, bidAmount, secret);
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
      addToast("success", "Offer submitted! It will be auto-confirmed when the confirmation period opens.");
      setBidAmount("");
      setSecret("");
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to submit offer.");
    }
  };

  // Reveal bid
  const handleRevealBid = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await blindHire.revealBid(jobId, revealAmount, revealSecret);
      addToast("success", "Offer confirmed on-chain!");
      setRevealAmount("");
      setRevealSecret("");
      await loadResults();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to confirm offer.");
    }
  };

  // Finalize
  const handleFinalize = async () => {
    try {
      await blindHire.finalizeAuction(jobId);
      addToast("success", "Auction finalized! Winner selected.");
      // Refresh job data & results
      const updatedJob = await fetchJobById(jobId);
      setJob(updatedJob);
      await loadResults();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to finalize.");
    }
  };

  // Loading state
  if (isLoadingJob) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-8 sm:py-10">
        <div className="h-8 w-48 rounded-lg bg-surface animate-pulse mb-8" />
        <div className="h-96 rounded-2xl border border-border bg-surface animate-pulse" />
      </main>
    );
  }

  if (!job) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface py-20 animate-fade-in">
          <p className="mb-1 text-base font-semibold text-foreground">Job not found</p>
          <p className="mb-5 text-sm text-muted-foreground">Job #{id} does not exist.</p>
          <PrimaryButton as={Link} href="/jobs">Back to Jobs</PrimaryButton>
        </div>
      </main>
    );
  }

  const winnerProfile = winner.hasWinner ? profileMap.get(winner.winnerAddress.toLowerCase()) ?? null : null;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-8 sm:py-10">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground animate-fade-in">
        <Link href="/jobs" className="hover:text-foreground transition-colors">Jobs</Link>
        <span>/</span>
        <span className="text-foreground font-medium">#{job.jobId}</span>
      </div>

      {/* Job Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Job #{job.jobId}</h1>
            <PhaseBadge
              commitDeadline={job.commitDeadline}
              revealDeadline={job.revealDeadline}
              finalized={job.finalized}
              size="md"
            />
          </div>
        </div>

        {/* Description */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
            {job.jobDescription || "No description provided."}
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <span>Posted by</span>
            <span className="font-mono">{truncateAddress(job.clientAddress)}</span>
          </div>
        </div>
      </div>

      {/* Deadlines & Countdown */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: "100ms" }}>
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Submission Deadline</p>
              <p className="text-sm font-medium text-foreground">{formatDeadline(job.commitDeadline)}</p>
            </div>
            {phase === "bidding" && <CountdownTimer targetUnix={job.commitDeadline} />}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Confirmation Deadline</p>
              <p className="text-sm font-medium text-foreground">{formatDeadline(job.revealDeadline)}</p>
            </div>
            {phase === "confirming" && <CountdownTimer targetUnix={job.revealDeadline} />}
          </div>
        </div>
      </div>

      {/* ─── Contextual Action Panel ─── */}
      <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
        {/* BIDDING PHASE — Submit offer form */}
        {phase === "bidding" && (
          <div className="rounded-2xl border border-primary/20 bg-surface p-6 sm:p-8 shadow-sm mb-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Submit Your Offer</h2>
                <p className="text-xs text-muted-foreground">Your amount is hashed and hidden until the confirmation period.</p>
              </div>
            </div>

            <form onSubmit={handleSubmitBid} className="space-y-5">
              <FormInput
                label="Offer Amount"
                hint="Enter a plain integer. Save this number — you need it to confirm later."
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

              {computedHashPreview && (
                <div className="rounded-xl border border-border bg-background px-4 py-3">
                  <p className="mb-1 text-xs text-muted-foreground">Hash preview (sent on-chain)</p>
                  <p className="break-all font-mono text-xs text-primary">{computedHashPreview}</p>
                </div>
              )}

              <p className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
                Your offer will be automatically confirmed when the confirmation period begins.
              </p>

              <PrimaryButton type="submit" disabled={blindHire.isLoading} fullWidth>
                {blindHire.isLoading ? "Submitting…" : "Submit Sealed Offer"}
              </PrimaryButton>
            </form>
          </div>
        )}

        {/* CONFIRMING PHASE — Reveal offer form */}
        {phase === "confirming" && (
          <div className="rounded-2xl border border-amber-500/20 bg-surface p-6 sm:p-8 shadow-sm mb-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Confirm Your Offer</h2>
                <p className="text-xs text-muted-foreground">Enter the exact same amount and secret you submitted.</p>
              </div>
            </div>

            {/* Auto-reveal status */}
            <div className="mb-5">
              <BidStatusList
                bids={autoReveal.bids}
                isChecking={autoReveal.isChecking}
                lastRunAt={autoReveal.lastRunAt}
                onRevealNow={autoReveal.manualReveal}
              />
            </div>

            <form onSubmit={handleRevealBid} className="space-y-5">
              <FormInput
                label="Offer Amount"
                hint="Must match exactly what you submitted."
                type="number"
                min={0}
                value={revealAmount}
                onChange={(e) => setRevealAmount(e.target.value)}
                required
                placeholder="1500"
              />
              <FormInput
                label="Secret"
                hint="Must match exactly what you submitted."
                type="text"
                value={revealSecret}
                onChange={(e) => setRevealSecret(e.target.value)}
                required
                placeholder="e.g. 7331489"
              />
              <PrimaryButton type="submit" disabled={blindHire.isLoading} fullWidth>
                {blindHire.isLoading ? "Confirming…" : "Confirm Offer"}
              </PrimaryButton>
            </form>
          </div>
        )}

        {/* EXPIRED — Finalize button */}
        {phase === "expired" && (
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm mb-8 text-center">
            <p className="mb-2 text-base font-semibold text-foreground">Confirmation period is over</p>
            <p className="mb-6 text-sm text-muted-foreground">
              Click below to finalize the auction. The lowest valid confirmed offer wins.
            </p>
            <PrimaryButton onClick={handleFinalize} disabled={blindHire.isLoading}>
              {blindHire.isLoading ? "Processing…" : "Finalize Auction"}
            </PrimaryButton>
          </div>
        )}

        {/* RESULTS — Winner + Bids (visible once loaded) */}
        {hasLoadedResults && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 animate-fade-in">
            {/* Winner card */}
            <div className="lg:col-span-2">
              <div
                className={`h-full rounded-2xl border p-6 shadow-sm ${
                  winner.hasWinner
                    ? "border-accent/30 bg-accent/5"
                    : "border-border bg-surface"
                }`}
              >
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Winner</p>

                {winner.hasWinner ? (
                  <div className="space-y-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7 text-accent" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                      </svg>
                    </div>
                    <ProfileBadge
                      profile={winnerProfile}
                      walletAddress={winner.winnerAddress}
                      size="md"
                    />
                    <div>
                      <p className="mb-1 text-xs text-muted-foreground">Winning Offer</p>
                      <p className="text-3xl font-bold tabular-nums text-accent">
                        {winner.winningAmount.toString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-hover">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6 text-muted-foreground" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-foreground">Not finalized yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Click &ldquo;Finalize&rdquo; after the confirmation deadline.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Confirmed offers */}
            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Confirmed Offers ({revealedBids.length})
                </p>

                {!revealedBids.length ? (
                  <div className="py-10 text-center">
                    <p className="text-sm text-muted-foreground">No confirmed offers for this job.</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {revealedBids.map((bid, index) => {
                      const isWinner =
                        winner.hasWinner &&
                        bid.freelancerAddress.toLowerCase() === winner.winnerAddress.toLowerCase();
                      const bidProfile = profileMap.get(bid.freelancerAddress.toLowerCase()) ?? null;

                      return (
                        <li
                          key={`${bid.freelancerAddress}-${bid.amount.toString()}`}
                          className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors duration-150 ${
                            isWinner
                              ? "border-accent/30 bg-accent/5"
                              : "border-border bg-background hover:border-primary/30"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">#{index + 1}</span>
                              {isWinner && (
                                <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
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
                              isWinner ? "text-accent" : "text-foreground"
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

        {/* Finalize button for already-finalized jobs that user might want to reload */}
        {phase === "finalized" && !hasLoadedResults && (
          <div className="text-center">
            <PrimaryButton variant="secondary" onClick={loadResults} disabled={blindHire.isLoading}>
              Load Results
            </PrimaryButton>
          </div>
        )}
      </div>
    </main>
  );
}
