"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { JobCard } from "@/components/job-card";
import { PageContainer } from "@/components/page-container";
import { PrimaryButton } from "@/components/primary-button";
import { TxStatus } from "@/components/tx-status";
import { useBlindHire } from "@/hooks/use-blindhire";
import { JobView } from "@/lib/types";

export default function HomePage() {
  const blindHire = useBlindHire();
  const { getJobs } = blindHire;
  const [jobs, setJobs] = useState<JobView[]>([]);
  const [hasFetched, setHasFetched] = useState(false);

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

  return (
    <PageContainer
      title="Active Jobs"
      subtitle="Private freelance offers — no one sees your price until the confirmation period."
      action={
        <div className="flex items-center gap-3">
          <PrimaryButton variant="secondary" onClick={handleRefreshJobs} disabled={blindHire.isLoading}>
            Refresh
          </PrimaryButton>
          <PrimaryButton as={Link} href="/create-job" className="inline-flex">
            + Post Job
          </PrimaryButton>
        </div>
      }
    >
      {/* Protocol explanation banner */}
      <div className="mb-8 grid grid-cols-1 gap-4 rounded-xl border border-border bg-surface p-6 sm:grid-cols-3 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <span className="text-sm font-bold text-primary">1</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Submit Offer</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Submit a private offer — your amount stays hidden.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <span className="text-sm font-bold text-primary">2</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Confirm Offer</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              After the submission deadline, confirm your original offer amount.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-green-500/10">
            <span className="text-sm font-bold text-green-500">3</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Finalize</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              The lowest valid confirmed offer wins the job.
            </p>
          </div>
        </div>
      </div>

      {/* Jobs grid */}
      {!hasFetched ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-xl border border-border bg-surface"
            />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface py-20">
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
          <p className="mb-1 text-base font-semibold text-foreground">No jobs yet</p>
          <p className="mb-5 text-sm text-muted-foreground">Post the first job to start an auction.</p>
          <PrimaryButton as={Link} href="/create-job" className="inline-flex">
            Post a Job
          </PrimaryButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.jobId} job={job} />
          ))}
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
