import { Suspense, type ReactNode } from "react";
import { PeriodTabList, PeriodTabs } from "./period-tabs";

/** The leaderboard's headline and period tabs. Shared by the page and its loading skeleton. */
export function LeaderboardIntro({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-board flex-col items-center pt-12 md:pt-[104px]">
      <h1 className="text-center text-[2.5rem] font-bold leading-[1.1] tracking-[-0.02em] md:text-display">
        Leaderboard.
      </h1>
      <p className="mt-4 text-center text-base text-muted md:mt-6 md:text-caption">
        One point for each daily problem you solve. Ties go to fewer wrong answers.
      </p>
      <div className="mt-8 md:mt-[50px]">
        <Suspense fallback={<PeriodTabList period={null} />}>
          <PeriodTabs />
        </Suspense>
      </div>
      <div className="mt-5 w-full">{children}</div>
    </main>
  );
}
