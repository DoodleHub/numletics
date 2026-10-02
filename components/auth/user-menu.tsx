import { signOut } from "@/app/auth/actions";
import type { CurrentUser } from "@/lib/supabase/user";

export function UserMenu({ user }: { user: CurrentUser }) {
  return (
    <div className="flex min-w-0 items-center gap-4 md:gap-6">
      {user.email && (
        <span className="hidden truncate text-base text-muted sm:inline md:text-caption">{user.email}</span>
      )}
      <form action={signOut}>
        <button
          type="submit"
          className="shrink-0 rounded-control text-base font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink md:text-caption"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
