import Link from "next/link";

import { CountdownTimer } from "@/components/countdown-timer";
import { PhaseBadge } from "@/components/phase-badge";
import { formatShortDeadline, getJobPhase } from "@/lib/format";
import { JobView } from "@/lib/types";

interface JobCardProps {
  job: JobView;
}

export function JobCard({ job }: JobCardProps) {
  const phase = getJobPhase(job.commitDeadline, job.revealDeadline, job.finalized);

  const nextDeadline = phase === "bidding" ? job.commitDeadline : job.revealDeadline;
  const deadlineLabel = phase === "bidding" ? "Bidding closes" : "Confirm by";

  return (
    <Link
      href={`/jobs/${job.jobId}`}
      className="group flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <span className="rounded-lg bg-surface-hover px-2.5 py-1 font-mono text-xs text-muted-foreground">
          #{job.jobId}
        </span>
        <PhaseBadge
          commitDeadline={job.commitDeadline}
          revealDeadline={job.revealDeadline}
          finalized={job.finalized}
        />
      </div>

      {/* Description */}
      <p className="mb-5 line-clamp-3 flex-1 text-sm leading-relaxed text-foreground">
        {job.jobDescription || "No description provided."}
      </p>

      {/* Countdown / Deadline */}
      {phase !== "finalized" && phase !== "expired" ? (
        <div className="mb-4 rounded-xl bg-background border border-border px-4 py-3">
          <CountdownTimer targetUnix={nextDeadline} label={deadlineLabel} />
        </div>
      ) : (
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-background px-3 py-2.5 border border-border">
            <p className="mb-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">Submit by</p>
            <p className="text-xs font-medium text-foreground">{formatShortDeadline(job.commitDeadline)}</p>
          </div>
          <div className="rounded-lg bg-background px-3 py-2.5 border border-border">
            <p className="mb-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">Confirm by</p>
            <p className="text-xs font-medium text-foreground">{formatShortDeadline(job.revealDeadline)}</p>
          </div>
        </div>
      )}

      {/* CTA hint */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
          {phase === "bidding" ? "Submit offer →" : phase === "confirming" ? "Confirm offer →" : "View results →"}
        </span>
        <svg
          className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </Link>
  );
}
