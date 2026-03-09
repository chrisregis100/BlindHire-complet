import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        {/* Left — branding */}
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/20">
            <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 text-primary" aria-hidden="true">
              <path d="M8 1L2 4.5V8C2 11.2 4.6 14.2 8 15C11.4 14.2 14 11.2 14 8V4.5L8 1Z" fill="currentColor" />
            </svg>
          </div>
          <span className="text-sm text-muted-foreground">
            BlindHire &middot; Built on{" "}
            <Link
              href="https://www.starknet.io"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              Starknet
            </Link>
          </span>
        </div>

        {/* Right — links */}
        <div className="flex items-center gap-6">
          <Link href="/jobs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Jobs
          </Link>
          <Link href="/create-job" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Post Job
          </Link>
          <span className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </footer>
  );
}
