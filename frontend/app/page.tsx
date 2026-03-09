import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 animate-gradient" />
          <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-32">
          <div className="mx-auto max-w-3xl text-center animate-fade-in">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-primary">Built on Starknet</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
              Fair Freelance Bidding.{" "}
              <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                Powered by Privacy.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Submit sealed offers that stay hidden until the confirmation period.
              No one can undercut you. The lowest valid offer wins.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/jobs"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-100 transition-all duration-200"
              >
                Browse Jobs
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="/create-job"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-8 py-3.5 text-base font-semibold text-foreground hover:bg-surface-hover hover:border-border-hover transition-all duration-200"
              >
                Post a Job
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="border-t border-border bg-surface/50 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-14 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              How BlindHire Works
            </h2>
            <p className="mt-3 text-base text-muted-foreground max-w-xl mx-auto">
              A three-step commit-reveal process that guarantees fair pricing.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 stagger-children">
            {/* Step 1 */}
            <div className="group relative rounded-2xl border border-border bg-surface p-8 shadow-sm hover:border-primary/30 hover:shadow-md transition-all duration-300">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">1</span>
                <h3 className="text-lg font-semibold text-foreground">Submit Sealed Offer</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Enter your price and a secret. We hash both on the frontend and submit only the hash on-chain.
                Your amount is completely hidden.
              </p>
            </div>

            {/* Step 2 */}
            <div className="group relative rounded-2xl border border-border bg-surface p-8 shadow-sm hover:border-amber-500/30 hover:shadow-md transition-all duration-300">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                <svg className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">2</span>
                <h3 className="text-lg font-semibold text-foreground">Confirm Your Offer</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                After the submission deadline, reveal your original amount and secret.
                The contract verifies your hash matches — fakes are rejected.
              </p>
            </div>

            {/* Step 3 */}
            <div className="group relative rounded-2xl border border-border bg-surface p-8 shadow-sm hover:border-accent/30 hover:shadow-md transition-all duration-300">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
                <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                </svg>
              </div>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-bold text-accent">3</span>
                <h3 className="text-lg font-semibold text-foreground">Lowest Offer Wins</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The contract selects the lowest valid confirmed offer as the winner.
                Fair, transparent, and verifiable on-chain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trust / CTA ─── */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-10 sm:p-16 text-center overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />

            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Ready to hire fairly?
              </h2>
              <p className="mt-3 text-base text-muted-foreground max-w-lg mx-auto">
                Post your first job and let the best freelancers compete on price — privately.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/create-job"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-hover hover:shadow-xl transition-all duration-200"
                >
                  Post a Job
                </Link>
                <Link
                  href="/jobs"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-8 py-3.5 text-base font-semibold text-foreground hover:bg-surface-hover transition-all duration-200"
                >
                  Explore Jobs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
