import "server-only";
import { createClient } from "./supabase/server";

/**
 * The fields of PushSubscription.toJSON() that the daily-push Edge Function needs, plus the browser's
 * IANA time zone, which decides when the morning and evening pushes arrive.
 */
export type PushSubscriptionInput = { endpoint: string; keys: { p256dh: string; auth: string }; timeZone: string };

/** Saves the browser's subscription for the current user, taking it over if another account had it. Unknown time zones fall back to UTC. */
export async function savePushSubscription({ endpoint, keys, timeZone }: PushSubscriptionInput): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("save_push_subscription", {
    p_endpoint: endpoint,
    p_p256dh: keys.p256dh,
    p_auth: keys.auth,
    p_time_zone: timeZone,
  });
  if (error) console.error("save_push_subscription failed:", error.message);
  return !error;
}

/** RLS limits the delete to the current user's own rows. */
export async function deletePushSubscription(endpoint: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
  if (error) console.error("delete push subscription failed:", error.message);
}
