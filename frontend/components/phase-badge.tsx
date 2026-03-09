"use client";

import { JobPhase, getJobPhase } from "@/lib/format";

const PHASE_CONFIG: Record<JobPhase, { label: string; dotClass: string; bgClass: string; textClass: string }> = {
  bidding: {
    label: "Bidding Open",
    dotClass: "bg-primary animate-pulse",
    bgClass: "bg-primary/10",
    textClass: "text-primary",
  },
  confirming: {
    label: "Confirming",
    dotClass: "bg-amber-500 animate-pulse",
    bgClass: "bg-amber-500/10",
    textClass: "text-amber-600 dark:text-amber-400",
  },
  finalized: {
    label: "Finalized",
    dotClass: "bg-accent",
    bgClass: "bg-accent/10",
    textClass: "text-accent",
  },
  expired: {
    label: "Awaiting Finalization",
    dotClass: "bg-muted-foreground",
    bgClass: "bg-muted",
    textClass: "text-muted-foreground",
  },
};

interface PhaseBadgeProps {
  commitDeadline: number;
  revealDeadline: number;
  finalized: boolean;
  size?: "sm" | "md";
}

export function PhaseBadge({ commitDeadline, revealDeadline, finalized, size = "sm" }: PhaseBadgeProps) {
  const phase = getJobPhase(commitDeadline, revealDeadline, finalized);
  const config = PHASE_CONFIG[phase];

  const sizeClasses = size === "sm"
    ? "px-2.5 py-0.5 text-[11px]"
    : "px-3 py-1 text-xs";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses} ${config.bgClass} ${config.textClass}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} aria-hidden="true" />
      {config.label}
    </span>
  );
}
