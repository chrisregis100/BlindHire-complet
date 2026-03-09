"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { FormInput, FormTextarea } from "@/components/form-input";
import { PageContainer } from "@/components/page-container";
import { PrimaryButton } from "@/components/primary-button";
import { useToast } from "@/contexts/toast-context";
import { useBlindHire } from "@/hooks/use-blindhire";

function toUnixTimestamp(datetimeLocalValue: string): number {
  return Math.floor(new Date(datetimeLocalValue).getTime() / 1000);
}

const STEPS = [
  { number: 1, title: "Description", subtitle: "What do you need?" },
  { number: 2, title: "Deadlines", subtitle: "Set the timeline" },
];

export default function CreateJobPage() {
  const router = useRouter();
  const blindHire = useBlindHire();
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [jobDescription, setJobDescription] = useState("");
  const [commitDeadline, setCommitDeadline] = useState("");
  const [revealDeadline, setRevealDeadline] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleNext = () => {
    if (!jobDescription.trim()) {
      setValidationError("Please enter a job description.");
      return;
    }
    setValidationError("");
    setStep(2);
  };

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

    try {
      await blindHire.createJob(jobDescription, commitDeadlineUnix, revealDeadlineUnix);
      addToast("success", "Job posted on-chain! Freelancers can now submit offers.");
      router.push("/jobs");
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to post job.");
    }
  };

  return (
    <PageContainer
      title="Post a Job"
      subtitle="Create a sealed-bid auction for freelance work."
      narrow
    >
      {/* Stepper */}
      <div className="mb-8 flex items-center gap-0 animate-fade-in">
        {STEPS.map((s, idx) => (
          <div key={s.number} className="flex items-center flex-1">
            <button
              type="button"
              onClick={() => s.number < step ? setStep(s.number) : undefined}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 w-full transition-all duration-200 ${
                step === s.number
                  ? "bg-primary/10 border border-primary/20"
                  : step > s.number
                    ? "bg-accent/10 border border-accent/20 cursor-pointer"
                    : "bg-surface border border-border"
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
                  step === s.number
                    ? "bg-primary text-white"
                    : step > s.number
                      ? "bg-accent text-white"
                      : "bg-surface-hover text-muted-foreground"
                }`}
              >
                {step > s.number ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  s.number
                )}
              </div>
              <div className="text-left">
                <p className={`text-sm font-semibold ${step >= s.number ? "text-foreground" : "text-muted-foreground"}`}>
                  {s.title}
                </p>
                <p className="text-[11px] text-muted-foreground">{s.subtitle}</p>
              </div>
            </button>
            {idx < STEPS.length - 1 && (
              <div className={`h-px w-4 mx-1 shrink-0 ${step > 1 ? "bg-accent" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      {validationError && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 animate-fade-in" role="alert">
          <p className="text-sm text-red-500">{validationError}</p>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm animate-fade-in">
        <form onSubmit={handleSubmitCreateJob}>
          {/* Step 1: Description */}
          {step === 1 && (
            <div className="space-y-6">
              <FormTextarea
                label="Job Description"
                hint="Describe the work, deliverables, and any requirements."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                required
                rows={5}
                placeholder="Build a landing page with Starknet wallet onboarding and a clean UI…"
              />
              <PrimaryButton type="button" onClick={handleNext} fullWidth>
                Next: Set Deadlines
                <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </PrimaryButton>
            </div>
          )}

          {/* Step 2: Deadlines */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Summary of description */}
              <div className="rounded-xl bg-background border border-border p-4">
                <p className="text-xs font-medium text-muted-foreground mb-1">Job Description</p>
                <p className="text-sm text-foreground line-clamp-3">{jobDescription}</p>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="mt-2 text-xs text-primary hover:text-primary-hover transition-colors"
                >
                  Edit description
                </button>
              </div>

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

              <div className="flex items-center gap-3 pt-2">
                <PrimaryButton
                  type="button"
                  variant="secondary"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </PrimaryButton>
                <PrimaryButton
                  type="submit"
                  disabled={blindHire.isLoading}
                  className="flex-2"
                >
                  {blindHire.isLoading ? "Posting…" : "Post Job"}
                </PrimaryButton>
              </div>
            </div>
          )}
        </form>
      </div>
    </PageContainer>
  );
}
