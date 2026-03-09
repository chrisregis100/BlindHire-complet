"use client";

const BIDS_STORAGE_KEY = "blindhire_bids";

export const BID_STATUS = {
  pendingCommit: "pending_commit",
  waitingRevealPhase: "waiting_reveal_phase",
  revealSubmitted: "reveal_submitted",
  revealCompleted: "reveal_completed",
  revealFailed: "reveal_failed",
} as const;

export interface StoredBidStatusMap {
  pendingCommit: "pending_commit";
  waitingRevealPhase: "waiting_reveal_phase";
  revealSubmitted: "reveal_submitted";
  revealCompleted: "reveal_completed";
  revealFailed: "reveal_failed";
}

export interface StoredBid {
  jobId: string;
  bidAmount: string;
  secret: string;
  commitHash: string;
  commitTimestamp: number;
  walletAddress: string;
  revealed: boolean;
  status: StoredBidStatusMap[keyof StoredBidStatusMap];
  lastError?: string;
  revealTxHash?: string;
  updatedAt: number;
}

function hasWindow(): boolean {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function isStoredBid(value: unknown): value is StoredBid {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<StoredBid>;
  return (
    typeof candidate.jobId === "string" &&
    typeof candidate.bidAmount === "string" &&
    typeof candidate.secret === "string" &&
    typeof candidate.commitHash === "string" &&
    typeof candidate.commitTimestamp === "number" &&
    typeof candidate.walletAddress === "string" &&
    typeof candidate.revealed === "boolean" &&
    typeof candidate.status === "string" &&
    typeof candidate.updatedAt === "number"
  );
}

function getBidIdentifier(input: Pick<StoredBid, "walletAddress" | "jobId" | "commitHash">): string {
  return `${input.walletAddress.toLowerCase()}:${input.jobId}:${input.commitHash}`;
}

export function loadStoredBids(): StoredBid[] {
  if (!hasWindow()) return [];

  const rawValue = window.localStorage.getItem(BIDS_STORAGE_KEY);
  if (!rawValue) return [];

  try {
    const parsedValue: unknown = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue)) return [];
    return parsedValue.filter(isStoredBid);
  } catch {
    return [];
  }
}

export function saveStoredBids(bids: StoredBid[]): void {
  if (!hasWindow()) return;
  window.localStorage.setItem(BIDS_STORAGE_KEY, JSON.stringify(bids));
}

export function upsertStoredBid(
  bidInput: Omit<StoredBid, "updatedAt"> & { updatedAt?: number },
): StoredBid {
  const bids = loadStoredBids();
  const nextBid: StoredBid = {
    ...bidInput,
    updatedAt: bidInput.updatedAt ?? Date.now(),
  };

  const nextBidId = getBidIdentifier(nextBid);
  const nextBids = bids.some((bid) => getBidIdentifier(bid) === nextBidId)
    ? bids.map((bid) => (getBidIdentifier(bid) === nextBidId ? nextBid : bid))
    : [nextBid, ...bids];

  saveStoredBids(nextBids);
  return nextBid;
}

interface UpdateStoredBidInput {
  walletAddress: string;
  jobId: string;
  commitHash: string;
  updates: Partial<StoredBid>;
}

export function updateStoredBid(input: UpdateStoredBidInput): StoredBid | null {
  const bids = loadStoredBids();
  const targetId = getBidIdentifier(input);

  let nextBid: StoredBid | null = null;
  const nextBids = bids.map((bid) => {
    if (getBidIdentifier(bid) !== targetId) return bid;

    nextBid = {
      ...bid,
      ...input.updates,
      updatedAt: Date.now(),
    };
    return nextBid;
  });

  if (!nextBid) return null;

  saveStoredBids(nextBids);
  return nextBid;
}

export function markBidRevealSubmitted(
  input: Pick<StoredBid, "walletAddress" | "jobId" | "commitHash">,
): StoredBid | null {
  return updateStoredBid({
    ...input,
    updates: {
      status: BID_STATUS.revealSubmitted,
      lastError: "",
    },
  });
}

export function markBidRevealed(
  input: Pick<StoredBid, "walletAddress" | "jobId" | "commitHash"> & { revealTxHash: string },
): StoredBid | null {
  return updateStoredBid({
    ...input,
    updates: {
      revealed: true,
      revealTxHash: input.revealTxHash,
      status: BID_STATUS.revealCompleted,
      lastError: "",
    },
  });
}

export function markBidRevealFailed(
  input: Pick<StoredBid, "walletAddress" | "jobId" | "commitHash"> & { lastError: string },
): StoredBid | null {
  return updateStoredBid({
    ...input,
    updates: {
      status: BID_STATUS.revealFailed,
      lastError: input.lastError,
    },
  });
}

export function getStoredBidsByWallet(walletAddress: string): StoredBid[] {
  const lowercaseWalletAddress = walletAddress.toLowerCase();
  return loadStoredBids().filter(
    (bid) => bid.walletAddress.toLowerCase() === lowercaseWalletAddress,
  );
}

export function getPendingBidsByWallet(walletAddress: string): StoredBid[] {
  return getStoredBidsByWallet(walletAddress).filter((bid) => !bid.revealed);
}
