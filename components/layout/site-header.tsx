import Link from "next/link";
import { Suspense } from "react";
import { UserMenu, UserMenuSkeleton } from "@/components/auth/user-menu";
import { Logo } from "@/components/ui/logo";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between gap-4 pt-6 md:pt-[34px]">
      <Link
        href="/"
        aria-label="Numletics home"
        className="inline-block shrink-0 rounded-control focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
      >
        <Logo />
      </Link>
      {/* The user streams in, so the rest of the header and the page don't wait for the auth check. */}
      <Suspense fallback={<UserMenuSkeleton />}>
        <UserMenu />
      </Suspense>
    </header>
  );
}
