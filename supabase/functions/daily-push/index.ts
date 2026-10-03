// Sends "today's problems are ready" to every push subscription. pg_cron calls it at 00:00 UTC
// (supabase/migrations/*_daily_push.sql). private.claim_daily_push() hands out each subscription at
// most once per UTC day, so the function is safe to call without auth: extra calls send nothing.
// Secrets: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto: or https: contact).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import postgres from "npm:postgres@3.4.5";
import webpush from "npm:web-push@3.6.7";

type Subscription = { endpoint: string; p256dh: string; auth: string };

const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!, { prepare: false });

const payload = JSON.stringify({
  title: "Today's problems are ready",
  body: "One to read, one to listen to. Can you solve both?",
  url: "/",
});

const BATCH = 50;

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const publicKey = Deno.env.get("VAPID_PUBLIC_KEY");
  const privateKey = Deno.env.get("VAPID_PRIVATE_KEY");
  const subject = Deno.env.get("VAPID_SUBJECT");
  if (!publicKey || !privateKey || !subject) {
    // Checked before claiming, so nobody is marked as notified when nothing can be sent.
    console.error("daily-push: VAPID secrets are not set");
    return Response.json({ error: "VAPID secrets are not set" }, { status: 500 });
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);

  const subscriptions = await sql<Subscription[]>`select endpoint, p256dh, auth from private.claim_daily_push()`;

  let sent = 0;
  const gone: string[] = [];
  for (let i = 0; i < subscriptions.length; i += BATCH) {
    await Promise.all(
      subscriptions.slice(i, i + BATCH).map(async ({ endpoint, p256dh, auth }) => {
        try {
          // Expire by the end of the day: tomorrow there are new problems.
          await webpush.sendNotification({ endpoint, keys: { p256dh, auth } }, payload, { TTL: 12 * 60 * 60 });
          sent++;
        } catch (error) {
          const status = (error as { statusCode?: number }).statusCode;
          // 404 and 410 mean the browser unsubscribed or the subscription expired.
          if (status === 404 || status === 410) gone.push(endpoint);
          else console.error("daily-push: send failed", status, (error as Error).message);
        }
      }),
    );
  }

  if (gone.length) await sql`delete from public.push_subscriptions where endpoint = any(${gone})`;

  console.log("daily-push:", { claimed: subscriptions.length, sent, removed: gone.length });
  return Response.json({ claimed: subscriptions.length, sent, removed: gone.length });
});
