"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { JobCard } from "@/components/job-card";
import { PrimaryButton } from "@/components/primary-button";
import { useBlindHire } from "@/hooks/use-blindhire";
import { getJobPhase, JobPhase } from "@/lib/format";
import { JobView } from "@/lib/types";


const FILTERS: { label: string; value: "all" | JobPhase }[] = [
  { label: "All", value: "all" },
  { label: "Bidding", value: "bidding" },
  { label: "Confirming", value: "confirming" },
  { label: "Finalized", value: "finalized" },
];

export default function JobsPage() {
  const blindHire = useBlindHire();
  const { getJobs } = blindHire;
  const [jobs, setJobs] = useState<JobView[]>([]);
  const [hasFetched, setHasFetched] = useState(false);
  const [filter, setFilter] = useState<"all" | JobPhase>("all");

  useEffect(() => {
    getJobs()
      .then((nextJobs) => {
        setJobs(nextJobs);
        setHasFetched(true);
      })
      .catch(() => setHasFetched(true));
  }, [getJobs]);

  const handleRefreshJobs = async () => {
    const nextJobs = await getJobs();
    setJobs(nextJobs);
  };

  const filteredJobs = filter === "all"
    ? jobs
    : jobs.filter((job) => getJobPhase(job.commitDeadline, job.revealDeadline, job.finalized) === filter);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-6 animate-fade-in">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Active Jobs</h1>
          <p className="max-w-xl text-sm sm:text-base text-muted-foreground">
            Browse available jobs and submit your sealed offer.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <PrimaryButton variant="secondary" onClick={handleRefreshJobs} disabled={blindHire.isLoading} size="sm">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            Refresh
          </PrimaryButton>
          <PrimaryButton as={Link} href="/create-job" className="inline-flex">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Post Job
          </PrimaryButton>
        </div>
      </div>

      {/* Filter pills */}
      <div className="mb-6 flex items-center gap-2 flex-wrap animate-fade-in" style={{ animationDelay: "100ms" }}>
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
              filter === f.value
                ? "bg-primary text-white shadow-sm"
                : "bg-surface border border-border text-muted-foreground hover:bg-surface-hover hover:text-foreground"
            }`}
          >
            {f.label}
            {filter === f.value && hasFetched && (
              <span className="ml-1.5 text-xs opacity-80">
                ({filteredJobs.length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Jobs grid */}
      {!hasFetched ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-2xl border border-border bg-surface animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface py-20 animate-fade-in">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-surface-hover">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="h-7 w-7 text-muted-foreground"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <p className="mb-1 text-base font-semibold text-foreground">
            {filter === "all" ? "No jobs yet" : "No matching jobs"}
          </p>
          <p className="mb-5 text-sm text-muted-foreground">
            {filter === "all"
              ? "Post the first job to start an auction."
              : "Try a different filter or post a new job."}
          </p>
          <PrimaryButton as={Link} href="/create-job" className="inline-flex">
            Post a Job
          </PrimaryButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {filteredJobs.map((job) => (
            <JobCard key={job.jobId} job={job} />
          ))}
        </div>
      )}
    </main>
  );
}
