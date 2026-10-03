"use server";

import { deletePushSubscription, savePushSubscription, type PushSubscriptionInput } from "@/lib/push";
import { getCurrentUser } from "@/lib/supabase/user";

// Arguments come straight from the browser, so check their shape before they reach the database.
function isText(value: unknown, max: number): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= max;
}

function isEndpoint(value: unknown): value is string {
  return isText(value, 1024) && value.startsWith("https://");
}

export async function subscribeToDailyPush(subscription: PushSubscriptionInput): Promise<boolean> {
  if (!(await getCurrentUser())) return false;
  const { endpoint, keys } = subscription ?? {};
  if (!isEndpoint(endpoint) || !isText(keys?.p256dh, 256) || !isText(keys?.auth, 256)) return false;
  return savePushSubscription({ endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } });
}

export async function unsubscribeFromDailyPush(endpoint: string): Promise<void> {
  if (!(await getCurrentUser()) || !isEndpoint(endpoint)) return;
  await deletePushSubscription(endpoint);
}
