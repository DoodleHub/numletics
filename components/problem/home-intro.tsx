import type { ReactNode } from "react";
import { NextProblems } from "./next-problems";

/**
 * The home page's headline, countdown, streak and card grid. Shared by the page and its loading
 * skeleton, which passes a Skeleton as `streak`.
 */
export function HomeIntro({ streak, children }: { streak: ReactNode; children: ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-page flex-col items-center pt-12 md:pt-[104px]">
      <h1 className="text-center text-[2.5rem] font-bold leading-[1.1] tracking-[-0.02em] md:text-display">
        Your daily math.
      </h1>
      <div className="mt-3 md:mt-4">
        <NextProblems />
      </div>
      <div className="mt-2">{streak}</div>
      <div className="mt-8 grid w-full gap-5 md:mt-[50px] md:grid-cols-2">{children}</div>
    </main>
  );
}
