"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { WalletButton } from "@/components/wallet-button";

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/create-job", label: "Post Job" },
  { href: "/submit-bid", label: "Submit Offer" },
  { href: "/reveal-bid", label: "Confirm Offer" },
  { href: "/job-result", label: "Results" },
  { href: "/profile/setup", label: "Profile" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <nav
        className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
            aria-label="BlindHire home"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <svg
                viewBox="0 0 16 16"
                fill="none"
                className="h-4 w-4 text-white"
                aria-hidden="true"
              >
                <path
                  d="M8 1L2 4.5V8C2 11.2 4.6 14.2 8 15C11.4 14.2 14 11.2 14 8V4.5L8 1Z"
                  fill="currentColor"
                  fillOpacity="0.9"
                />
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight text-foreground">BlindHire</span>
          </Link>

          {/* Nav links – hidden on mobile */}
          <div className="hidden items-center gap-0.5 md:flex" role="list">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  role="listitem"
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isActive
                      ? "bg-surface-hover text-foreground"
                      : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Wallet */}
          <WalletButton />

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-hover hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 shadow-lg">
          <div className="flex flex-col space-y-1" role="list">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  role="listitem"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block rounded-lg px-4 py-3 text-base font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-surface-hover text-foreground"
                      : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
