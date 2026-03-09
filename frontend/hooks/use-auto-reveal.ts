"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useWallet } from "@/contexts/wallet-context";
import { fetchJobById, writeRevealBid } from "@/lib/contract";
import {
  BID_STATUS,
  StoredBid,
  getPendingBidsByWallet,
  getStoredBidsByWallet,
  markBidRevealFailed,
  markBidRevealSubmitted,
  markBidRevealed,
  updateStoredBid,
} from "@/lib/bid-storage";

const AUTO_REVEAL_INTERVAL_MS = 30_000;

interface UseAutoRevealReturn {
  bids: StoredBid[];
  isChecking: boolean;
  lastRunAt: number | null;
  manualReveal: (bid: StoredBid) => Promise<void>;
  refreshBids: () => void;
}

function getBidInFlightKey(bid: Pick<StoredBid, "walletAddress" | "jobId" | "commitHash">): string {
  return `${bid.walletAddress.toLowerCase()}:${bid.jobId}:${bid.commitHash}`;
}

function getRevealFailureMessage(error: unknown): string {
  if (!(error instanceof Error)) return "Reveal transaction failed.";
  return error.message || "Reveal transaction failed.";
}

export function useAutoReveal(): UseAutoRevealReturn {
  const wallet = useWallet();
  const [bids, setBids] = useState<StoredBid[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastRunAt, setLastRunAt] = useState<number | null>(null);
  const isMountedRef = useRef(true);
  const inFlightRevealsRef = useRef<Set<string>>(new Set());

  const refreshBids = useCallback(() => {
    if (!wallet.accountAddress) {
      setBids([]);
      return;
    }

    setBids(getStoredBidsByWallet(wallet.accountAddress));
  }, [wallet.accountAddress]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    refreshBids();
  }, [refreshBids]);

  const revealBid = useCallback(
    async (bid: StoredBid): Promise<void> => {
      if (!wallet.account) {
        markBidRevealFailed({
          walletAddress: bid.walletAddress,
          jobId: bid.jobId,
          commitHash: bid.commitHash,
          lastError: "Connect wallet to reveal this bid.",
        });
        refreshBids();
        throw new Error("Connect wallet to reveal this bid.");
      }

      const inFlightKey = getBidInFlightKey(bid);
      if (inFlightRevealsRef.current.has(inFlightKey)) return;

      inFlightRevealsRef.current.add(inFlightKey);
      markBidRevealSubmitted({
        walletAddress: bid.walletAddress,
        jobId: bid.jobId,
        commitHash: bid.commitHash,
      });
      refreshBids();

      try {
        const txHash = await writeRevealBid(
          wallet.account,
          Number(bid.jobId),
          bid.bidAmount,
          bid.secret,
        );

        markBidRevealed({
          walletAddress: bid.walletAddress,
          jobId: bid.jobId,
          commitHash: bid.commitHash,
          revealTxHash: txHash,
        });
      } catch (error) {
        markBidRevealFailed({
          walletAddress: bid.walletAddress,
          jobId: bid.jobId,
          commitHash: bid.commitHash,
          lastError: getRevealFailureMessage(error),
        });
        throw error;
      } finally {
        inFlightRevealsRef.current.delete(inFlightKey);
        refreshBids();
      }
    },
    [refreshBids, wallet.account],
  );

  const manualReveal = useCallback(
    async (bid: StoredBid) => {
      await revealBid(bid);
    },
    [revealBid],
  );

  const runAutoRevealCheck = useCallback(async () => {
    if (!wallet.accountAddress || !wallet.account) {
      refreshBids();
      setLastRunAt(Date.now());
      return;
    }

    setIsChecking(true);
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const pendingBids = getPendingBidsByWallet(wallet.accountAddress);

    for (const bid of pendingBids) {
      const inFlightKey = getBidInFlightKey(bid);
      if (inFlightRevealsRef.current.has(inFlightKey)) continue;

      try {
        const job = await fetchJobById(Number(bid.jobId));
        const isRevealWindowOpen =
          nowInSeconds > job.commitDeadline && nowInSeconds <= job.revealDeadline;

        if (job.finalized || nowInSeconds > job.revealDeadline) {
          updateStoredBid({
            walletAddress: bid.walletAddress,
            jobId: bid.jobId,
            commitHash: bid.commitHash,
            updates: {
              status: BID_STATUS.revealFailed,
              lastError: "Reveal window has closed for this job.",
            },
          });
          continue;
        }

        if (!isRevealWindowOpen) {
          updateStoredBid({
            walletAddress: bid.walletAddress,
            jobId: bid.jobId,
            commitHash: bid.commitHash,
            updates: {
              status: BID_STATUS.waitingRevealPhase,
              lastError: "",
            },
          });
          continue;
        }

        await revealBid(bid);
      } catch (error) {
        const message = getRevealFailureMessage(error);
        updateStoredBid({
          walletAddress: bid.walletAddress,
          jobId: bid.jobId,
          commitHash: bid.commitHash,
          updates: {
            status: BID_STATUS.revealFailed,
            lastError: message,
          },
        });
      }
    }

    if (isMountedRef.current) {
      setIsChecking(false);
      setLastRunAt(Date.now());
      refreshBids();
    }
  }, [refreshBids, revealBid, wallet.account, wallet.accountAddress]);

  useEffect(() => {
    void runAutoRevealCheck();
    const intervalId = window.setInterval(() => {
      void runAutoRevealCheck();
    }, AUTO_REVEAL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [runAutoRevealCheck]);

  const sortedBids = useMemo(
    () => [...bids].sort((left, right) => right.updatedAt - left.updatedAt),
    [bids],
  );

  return {
    bids: sortedBids,
    isChecking,
    lastRunAt,
    manualReveal,
    refreshBids,
  };
}
