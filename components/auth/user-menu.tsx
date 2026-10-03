import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/supabase/user";
import { ProfileMenu } from "./profile-menu";

export async function UserMenu() {
  const user = await getCurrentUser();
  // Signed-out visitors are redirected by the page's requireUser(), so there's nothing to show.
  if (!user) return null;

  return <ProfileMenu displayName={user.displayName} email={user.email} />;
}

export function UserMenuSkeleton() {
  return <Skeleton round className="size-10" />;
}
