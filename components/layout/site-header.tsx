import Link from "next/link";
import { Suspense } from "react";
import { UserMenu, UserMenuSkeleton } from "@/components/auth/user-menu";
import { TrophyIcon } from "@/components/ui/icons";
import { Logo } from "@/components/ui/logo";

const linkFocus = "rounded-control focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between gap-4 pt-6 md:pt-[34px]">
      <Link href="/" aria-label="Numletics home" className={`inline-block shrink-0 ${linkFocus}`}>
        <Logo />
      </Link>
      <div className="flex min-w-0 items-center gap-4 md:gap-6">
        <Link
          href="/leaderboard"
          aria-label="Leaderboard"
          className={`flex shrink-0 items-center gap-2 text-base font-medium underline-offset-4 hover:underline md:text-caption ${linkFocus}`}
        >
          <TrophyIcon className="size-6" />
          {/* The label hides on narrow screens so the header fits at 390px. */}
          <span className="hidden sm:inline">Leaderboard</span>
        </Link>
        {/* The user streams in, so the rest of the header and the page don't wait for the auth check. */}
        <Suspense fallback={<UserMenuSkeleton />}>
          <UserMenu />
        </Suspense>
      </div>
    </header>
  );
}
