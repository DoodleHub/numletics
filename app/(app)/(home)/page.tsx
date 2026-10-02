import { connection } from "next/server";
import { HomeIntro } from "@/components/problem/home-intro";
import { ListenCard } from "@/components/problem/listen-card";
import { ReadCard } from "@/components/problem/read-card";
import { getDailyProblem } from "@/lib/problems";
import { requireUser } from "@/lib/supabase/user";

export default async function Home() {
  // Render per request so the daily rotation follows the current date, not the build date.
  await connection();
  await requireUser();
  const read = getDailyProblem("read");
  const listen = getDailyProblem("listen");

  return (
    <HomeIntro>
      <ReadCard problem={read} />
      <ListenCard problem={listen} />
    </HomeIntro>
  );
}
