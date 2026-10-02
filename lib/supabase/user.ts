import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { isSupabaseConfigured } from "./env";
import { createClient } from "./server";

export type CurrentUser = { id: string; email: string | null };

// getClaims() verifies the JWT, so it's safe to trust on the server. Never use getSession() for this.
export async function getCurrentUser(): Promise<CurrentUser | null> {
  // Auth is per request. Opt out of prerendering even when Supabase isn't configured yet.
  await connection();
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return null;
  return { id: claims.sub, email: typeof claims.email === "string" ? claims.email : null };
}

// Use in pages and Server Actions that need a signed-in user. The proxy also redirects, but only optimistically.
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
