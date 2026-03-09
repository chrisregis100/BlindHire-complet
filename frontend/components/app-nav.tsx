"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/create-job", label: "Post Job" },
  { href: "/submit-bid", label: "Submit Offer" },
  { href: "/reveal-bid", label: "Confirm Offer" },
  { href: "/job-result", label: "Results" },
  { href: "/profile/setup", label: "Profile" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1.5" aria-label="Page navigation">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isActive
                ? "bg-surface-hover text-foreground"
                : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
