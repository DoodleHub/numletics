// Sends the daily push when the problems reset. pg_cron calls it at 00:00 UTC
// (supabase/migrations/*_push_at_reset.sql), and private.claim_due_pushes() returns every
// subscription not yet notified today ("today's problems are ready", or a rank drop). Claimed pushes
// are marked sent, so the function is safe to call without auth.
// Secrets: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto: or https: contact).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import postgres from "npm:postgres@3.4.5";
import webpush from "npm:web-push@3.6.7";

type DuePush = {
  endpoint: string;
  p256dh: string;
  auth: string;
  rank: string | null; // bigint arrives as a string
  previous_rank: string | null;
};

type Message = { title: string; body: string; url: string };

const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!, { prepare: false });

const BATCH = 50;

function message(push: DuePush): Message {
  const rank = push.rank === null ? null : Number(push.rank);
  const previous = push.previous_rank === null ? null : Number(push.previous_rank);
  if (rank !== null && previous !== null && rank > previous) {
    return {
      title: `You dropped to #${rank} on the leaderboard`,
      body: "Today's problems are ready. Solve both to climb back.",
      url: "/",
    };
  }
  return { title: "Today's problems are ready", body: "One to read, one to listen to. Can you solve both?", url: "/" };
}

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

  const due = await sql<DuePush[]>`select * from private.claim_due_pushes()`;

  let sent = 0;
  const gone: string[] = [];
  for (let i = 0; i < due.length; i += BATCH) {
    await Promise.all(
      due.slice(i, i + BATCH).map(async (push) => {
        try {
          // Expire within a few hours: a push that arrives much later is no longer news.
          await webpush.sendNotification(
            { endpoint: push.endpoint, keys: { p256dh: push.p256dh, auth: push.auth } },
            JSON.stringify(message(push)),
            { TTL: 4 * 60 * 60 },
          );
          sent++;
        } catch (error) {
          const status = (error as { statusCode?: number }).statusCode;
          // 404 and 410 mean the browser unsubscribed or the subscription expired.
          if (status === 404 || status === 410) gone.push(push.endpoint);
          else console.error("daily-push: send failed", status, (error as Error).message);
        }
      }),
    );
  }

  if (gone.length) await sql`delete from public.push_subscriptions where endpoint = any(${gone})`;

  const counts = { claimed: due.length, sent, removed: gone.length };
  console.log("daily-push:", counts);
  return Response.json(counts);
});
