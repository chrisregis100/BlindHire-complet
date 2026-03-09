/**
 * Shared formatting utilities — single source of truth for
 * address truncation, deadline formatting, and time helpers.
 */

export function truncateAddress(address: string, start = 6, end = 4): string {
  if (!address || address.length < start + end + 3) return address;
  return `${address.slice(0, start)}…${address.slice(-end)}`;
}

export function formatDeadline(unixTimestamp: number): string {
  return new Date(unixTimestamp * 1000).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatShortDeadline(unixTimestamp: number): string {
  return new Date(unixTimestamp * 1000).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Returns human-readable time remaining, e.g. "2h 15m" or "Expired" */
export function timeRemaining(unixTimestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = unixTimestamp - now;
  if (diff <= 0) return "Expired";

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/** Compute the current phase of a job based on deadlines */
export type JobPhase = "bidding" | "confirming" | "finalized" | "expired";

export function getJobPhase(
  commitDeadline: number,
  revealDeadline: number,
  finalized: boolean,
): JobPhase {
  if (finalized) return "finalized";
  const now = Math.floor(Date.now() / 1000);
  if (now < commitDeadline) return "bidding";
  if (now < revealDeadline) return "confirming";
  return "expired";
}
