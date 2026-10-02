"use client";

import { usePathname } from "next/navigation";
import { Card } from "@/components/ui/card";
import { LoadingStatus, Skeleton } from "@/components/ui/skeleton";

/** Matches AuthForm. The path is already the destination while this shows, so the field count fits. */
export function AuthFormSkeleton() {
  const fields = usePathname() === "/signup" ? 3 : 2;

  return (
    <Card>
      <LoadingStatus label="Loading" />
      <Skeleton className="h-8 w-40 md:h-11 md:w-56" />
      <div className="flex flex-col gap-5 pt-8">
        {Array.from({ length: fields + 1 }, (_, i) => (
          <Skeleton key={i} className="h-14 w-full md:h-control" />
        ))}
      </div>
      <Skeleton className="mx-auto mt-6 h-6 w-64 md:h-7 md:w-80" />
    </Card>
  );
}
