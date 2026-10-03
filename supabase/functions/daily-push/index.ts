// Sends the pushes due this hour. pg_cron calls it hourly (supabase/migrations/*_local_time_push.sql),
// and private.claim_due_pushes() decides, in each subscription's time zone, who gets a morning push
// ("today's problems are ready", or a rank drop) or an evening reminder (unsolved problems, or a
// streak at risk). Claimed pushes are marked sent, so the function is safe to call without auth.
// Secrets: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto: or https: contact).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import postgres from "npm:postgres@3.4.5";
import webpush from "npm:web-push@3.6.7";

type DuePush = {
  endpoint: string;
  p256dh: string;
  auth: string;
  kind: "morning" | "evening";
  time_zone: string;
  rank: string | null; // bigint arrives as a string
  previous_rank: string | null;
  streak: number;
  solved_today: number;
};

type Message = { title: string; body: string; url: string };

const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!, { prepare: false });

const BATCH = 50;

// When the current problems change (next 00:00 UTC), in the subscriber's local time, e.g. "8:00 PM".
function rolloverTime(timeZone: string) {
  const next = new Date();
  next.setUTCHours(24, 0, 0, 0);
  try {
    return new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit" }).format(next);
  } catch {
    return "midnight UTC";
  }
}

function message(push: DuePush): Message {
  if (push.kind === "morning") {
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

  const changesAt = rolloverTime(push.time_zone);
  if (push.solved_today === 0 && push.streak >= 2) {
    return {
      title: `Don't lose your ${push.streak}-day streak`,
      body: `Solve one of today's problems before they change at ${changesAt}.`,
      url: "/",
    };
  }
  if (push.solved_today === 0) {
    return { title: "Today's problems are still waiting", body: `They change at ${changesAt}.`, url: "/" };
  }
  return { title: "One problem left today", body: `Finish it before the problems change at ${changesAt}.`, url: "/" };
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
          // Expire within a few hours: a late morning or evening push is no longer useful.
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
