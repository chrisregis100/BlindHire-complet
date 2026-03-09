import Link from "next/link";

import { JobView } from "@/lib/types";

interface JobCardProps {
  job: JobView;
}

function formatDeadline(unixTimestamp: number): string {
  return new Date(unixTimestamp * 1000).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function JobCard({ job }: JobCardProps) {
  return (
    <article
      className="group flex flex-col rounded-xl border border-border bg-surface p-6 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-primary/5 hover:shadow-md"
      aria-label={`Job ${job.jobId}`}
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-2.5">
        <span className="rounded-lg bg-surface-hover px-2.5 py-1 font-mono text-xs text-muted-foreground">
          #{job.jobId}
        </span>
        {job.finalized ? (
          <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-500">
            Finalized
          </span>
        ) : (
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            Open
          </span>
        )}
      </div>

      {/* Description */}
      <p className="mb-5 line-clamp-3 flex-1 text-sm leading-relaxed text-foreground">
        {job.jobDescription || "No description provided."}
      </p>

      {/* Deadlines */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-background px-3 py-2.5 border border-border">
          <p className="mb-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
            Submit by
          </p>
          <p className="text-xs font-medium text-foreground">
            {formatDeadline(job.commitDeadline)}
          </p>
        </div>
        <div className="rounded-lg bg-background px-3 py-2.5 border border-border">
          <p className="mb-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
            Confirm by
          </p>
          <p className="text-xs font-medium text-foreground">
            {formatDeadline(job.revealDeadline)}
          </p>
        </div>
      </div>

      {/* CTA */}
      {!job.finalized && (
        <Link
          href={`/submit-bid?jobId=${job.jobId}`}
          className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-hover hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-100"
        >
          Submit Offer
        </Link>
      )}
      {job.finalized && (
        <Link
          href={`/job-result?jobId=${job.jobId}`}
          className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-surface-hover px-4 py-2.5 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-border focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          View Results
        </Link>
      )}
    </article>
  );
}
