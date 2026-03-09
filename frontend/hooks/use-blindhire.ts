"use client";

import { useCallback, useState } from "react";

import { useWallet } from "@/contexts/wallet-context";
import {
  fetchJobs,
  fetchRevealedBids,
  fetchWinner,
  writeCommitBid,
  writeCreateJob,
  writeFinalizeAuction,
  writeRevealBid,
} from "@/lib/contract";
import { buildCommitHash } from "@/lib/hash";
import { JobView, RevealedBidView, WinnerView } from "@/lib/types";

interface AsyncState {
  isLoading: boolean;
  error: string;
  lastTxHash: string;
}

const INITIAL_ASYNC_STATE: AsyncState = {
  isLoading: false,
  error: "",
  lastTxHash: "",
};

export function useBlindHire() {
  const wallet = useWallet();
  const [asyncState, setAsyncState] = useState<AsyncState>(INITIAL_ASYNC_STATE);

  const runAction = useCallback(async <T>(action: () => Promise<T>) => {
    setAsyncState((prev) => ({ ...prev, isLoading: true, error: "" }));

    try {
      const result = await action();
      setAsyncState((prev) => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      setAsyncState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Unknown contract error.",
      }));
      throw error;
    }
  }, []);

  const createJob = useCallback(
    async (
      description: string,
      commitDeadline: number,
      revealDeadline: number,
    ) => {
      if (!wallet.account) throw new Error("Connect wallet first.");
      const txHash = await runAction(() =>
        writeCreateJob(
          wallet.account!,
          description,
          commitDeadline,
          revealDeadline,
        ),
      );
      setAsyncState((prev) => ({ ...prev, lastTxHash: txHash }));
      return txHash;
    },
    [runAction, wallet.account],
  );

  const commitBid = useCallback(
    async (jobId: number, bidAmount: string, secret: string) => {
      if (!wallet.account) throw new Error("Connect wallet first.");
      const commitHash = buildCommitHash(bidAmount, secret);
      const txHash = await runAction(() =>
        writeCommitBid(wallet.account!, jobId, commitHash),
      );
      setAsyncState((prev) => ({ ...prev, lastTxHash: txHash }));
      return { txHash, commitHash };
    },
    [runAction, wallet.account],
  );

  const revealBid = useCallback(
    async (jobId: number, bidAmount: string, secret: string) => {
      if (!wallet.account) throw new Error("Connect wallet first.");
      const txHash = await runAction(() =>
        writeRevealBid(wallet.account!, jobId, bidAmount, secret),
      );
      setAsyncState((prev) => ({ ...prev, lastTxHash: txHash }));
      return txHash;
    },
    [runAction, wallet.account],
  );

  const finalizeAuction = useCallback(
    async (jobId: number) => {
      if (!wallet.account) throw new Error("Connect wallet first.");
      const txHash = await runAction(() =>
        writeFinalizeAuction(wallet.account!, jobId),
      );
      setAsyncState((prev) => ({ ...prev, lastTxHash: txHash }));
      return txHash;
    },
    [runAction, wallet.account],
  );

  const getJobs = useCallback(
    async (): Promise<JobView[]> => runAction(fetchJobs),
    [runAction],
  );

  const getRevealedBids = useCallback(
    async (jobId: number): Promise<RevealedBidView[]> =>
      runAction(() => fetchRevealedBids(jobId)),
    [runAction],
  );

  const getWinner = useCallback(
    async (jobId: number): Promise<WinnerView> =>
      runAction(() => fetchWinner(jobId)),
    [runAction],
  );

  return {
    wallet,
    ...asyncState,
    createJob,
    commitBid,
    revealBid,
    finalizeAuction,
    getJobs,
    getRevealedBids,
    getWinner,
  };
}
