import { signOut } from "@/app/auth/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/supabase/user";
import { SignOutButton } from "./sign-out-button";

export async function UserMenu() {
  const user = await getCurrentUser();
  // Signed-out visitors are redirected by the page's requireUser(), so there's nothing to show.
  if (!user) return null;

  return (
    <div className="flex min-w-0 items-center gap-4 md:gap-6">
      {user.email && (
        <span className="hidden truncate text-base text-muted sm:inline md:text-caption">{user.email}</span>
      )}
      <form action={signOut}>
        <SignOutButton />
      </form>
    </div>
  );
}

export function UserMenuSkeleton() {
  return (
    <div className="flex items-center gap-4 md:gap-6">
      <Skeleton className="hidden h-5 w-48 sm:block md:h-6 md:w-64" />
      <Skeleton className="h-5 w-16 md:h-6 md:w-20" />
    </div>
  );
}
