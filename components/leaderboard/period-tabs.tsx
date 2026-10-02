"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Period = "all" | "month";

const TABS: { period: Period; label: string; href: string }[] = [
  { period: "all", label: "All-time", href: "/leaderboard" },
  { period: "month", label: "This month", href: "/leaderboard?period=month" },
];

/**
 * Reads the period from the URL, so the clicked tab is selected right away, while the
 * leaderboard's loading skeleton shows, not only once the new rows arrive.
 */
export function PeriodTabs() {
  return <PeriodTabList period={useSearchParams().get("period") === "month" ? "month" : "all"} />;
}

/** `period={null}` selects nothing; it's the fallback while search params aren't known yet. */
export function PeriodTabList({ period }: { period: Period | null }) {
  return (
    <nav aria-label="Leaderboard period" className="flex rounded-control border border-line-strong bg-surface p-1">
      {TABS.map((tab) => (
        <Link
          key={tab.period}
          href={tab.href}
          aria-current={tab.period === period ? "page" : undefined}
          className={`rounded-control px-4 py-2 text-base font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:px-6 md:text-caption ${
            tab.period === period ? "bg-ink text-surface" : "text-muted hover:text-ink"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
