"use client";

import { FormEvent, useState } from "react";

import { FormInput, FormTextarea } from "@/components/form-input";
import { PageContainer } from "@/components/page-container";
import { PrimaryButton } from "@/components/primary-button";
import { TxStatus } from "@/components/tx-status";
import { useBlindHire } from "@/hooks/use-blindhire";

function toUnixTimestamp(datetimeLocalValue: string): number {
  return Math.floor(new Date(datetimeLocalValue).getTime() / 1000);
}

export default function CreateJobPage() {
  const blindHire = useBlindHire();
  const [jobDescription, setJobDescription] = useState("");
  const [commitDeadline, setCommitDeadline] = useState("");
  const [revealDeadline, setRevealDeadline] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleSubmitCreateJob = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError("");
    
    const commitDeadlineUnix = toUnixTimestamp(commitDeadline);
    const revealDeadlineUnix = toUnixTimestamp(revealDeadline);
    const now = Math.floor(Date.now() / 1000);

    if (commitDeadlineUnix <= now) {
      setValidationError("Submission deadline must be in the future.");
      return;
    }

    if (revealDeadlineUnix <= commitDeadlineUnix) {
      setValidationError("Confirmation deadline must be after submission deadline.");
      return;
    }

    await blindHire.createJob(
      jobDescription,
      commitDeadlineUnix,
      revealDeadlineUnix,
    );
    setSubmitted(true);
    setJobDescription("");
    setCommitDeadline("");
    setRevealDeadline("");
  };

  return (
    <PageContainer
      title="Post a Job"
      subtitle="Set an offer submission and confirmation deadline. Freelancers submit private offers during the submission window."
      narrow
    >
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        {submitted && !blindHire.isLoading && !blindHire.error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3" role="status">
            <span
              className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-green-500"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                Job posted on-chain.
              </p>
              <p className="text-xs text-green-600/80 dark:text-green-400/80">
                Freelancers can now submit private offers.
              </p>
            </div>
          </div>
        )}

        {validationError && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3" role="alert">
            <p className="text-sm text-red-500">{validationError}</p>
          </div>
        )}

        <form onSubmit={handleSubmitCreateJob} className="space-y-6">
          <FormTextarea
            label="Job Description"
            hint="Describe the work, deliverables, and any requirements."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            required
            rows={4}
            placeholder="Build a landing page with Starknet wallet onboarding and a clean UI…"
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormInput
              label="Offer Submission Deadline"
              hint="Freelancers must submit their offer before this time."
              type="datetime-local"
              value={commitDeadline}
              onChange={(e) => setCommitDeadline(e.target.value)}
              required
            />
            <FormInput
              label="Offer Confirmation Deadline"
              hint="Freelancers confirm their offer amounts in this window."
              type="datetime-local"
              value={revealDeadline}
              onChange={(e) => setRevealDeadline(e.target.value)}
              required
            />
          </div>

          <div className="pt-2">
            <PrimaryButton
              type="submit"
              disabled={blindHire.isLoading}
              fullWidth
            >
              {blindHire.isLoading ? "Posting…" : "Post Job"}
            </PrimaryButton>
          </div>
        </form>
      </div>

      <div className="mt-4">
        <TxStatus
          error={blindHire.error}
          isLoading={blindHire.isLoading}
          lastTxHash={blindHire.lastTxHash}
        />
      </div>
    </PageContainer>
  );
}
