import { HomeIntro } from "@/components/problem/home-intro";
import { ListenCardSkeleton, ReadCardSkeleton } from "@/components/problem/problem-card-skeletons";
import { LoadingStatus } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <HomeIntro>
      <LoadingStatus label="Loading today’s problems" />
      <ReadCardSkeleton />
      <ListenCardSkeleton />
    </HomeIntro>
  );
}
