"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const DAY_MS = 86_400_000;

/** "05:12:09" until the next 00:00 UTC. */
function formatTimeLeft(now: number) {
  const total = Math.ceil((DAY_MS - (now % DAY_MS)) / 1000) % 86_400;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor(total / 60) % 60)}:${pad(total % 60)}`;
}

/** Countdown to the daily rotation in lib/problems.ts. Refreshes the page when it rolls over. */
export function NextProblems() {
  const router = useRouter();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let day = Math.floor(Date.now() / DAY_MS);
    const id = setInterval(() => {
      const next = Date.now();
      setNow(next);
      if (Math.floor(next / DAY_MS) !== day) {
        day = Math.floor(next / DAY_MS);
        router.refresh();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [router]);

  return (
    <p className="text-base text-muted md:text-caption">
      New problems in{" "}
      {/* role="timer" isn't announced on every tick. Server and client clocks differ by a second or two. */}
      <time role="timer" suppressHydrationWarning className="font-bold tabular-nums text-ink">
        {formatTimeLeft(now)}
      </time>
    </p>
  );
}
