import { connection } from "next/server";
import { ListenCard } from "@/components/problem/listen-card";
import { ReadCard } from "@/components/problem/read-card";
import { Logo } from "@/components/ui/logo";
import { getDailyProblem } from "@/lib/problems";

export default async function Home() {
  // Render per request so the daily rotation follows the current date, not the build date.
  await connection();
  const read = getDailyProblem("read");
  const listen = getDailyProblem("listen");

  return (
    <div className="flex flex-1 flex-col px-4 md:px-[77px]">
      <header className="pt-6 md:pt-[34px]">
        <Logo />
      </header>
      <main className="mx-auto flex w-full max-w-page flex-col items-center pt-12 md:pt-[104px]">
        <h1 className="text-center text-[2.5rem] font-bold leading-[1.1] tracking-[-0.02em] md:text-display">
          Your daily math.
        </h1>
        <div className="mt-8 grid w-full gap-5 md:mt-[50px] md:grid-cols-2">
          <ReadCard problem={read} />
          <ListenCard problem={listen} />
        </div>
      </main>
      <footer className="py-10 text-center text-base text-muted md:pt-[50px] md:text-caption">
        Two problems. Every day.
      </footer>
    </div>
  );
}
