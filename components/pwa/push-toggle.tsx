"use client";

import { useEffect, useState } from "react";
import { subscribeToDailyPush, unsubscribeFromDailyPush } from "@/app/push/actions";
import { BellIcon, BellOffIcon } from "@/components/ui/icons";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

type Status = "unsupported" | "off" | "on" | "blocked";

const labels: Record<Exclude<Status, "unsupported">, string> = {
  off: "Turn on daily reminders",
  on: "Turn off daily reminders",
  blocked: "Daily reminders are blocked in your browser settings",
};

function isSupported() {
  return Boolean(vapidPublicKey) && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

// The service worker registers in production only (ServiceWorkerRegistration), so `ready` never
// settles in dev and the bell stays hidden. Waiting on `ready` rather than reading the current
// registration matters on a first launch from the iOS home screen: the installed app has its own
// storage, so the worker is still registering when this runs. On iOS, web push only exists once the
// app is added to the home screen.
function getRegistration() {
  return isSupported() ? navigator.serviceWorker.ready : Promise.resolve(null);
}

// The zone last saved from this browser, so a change (travel, a new device setting) is re-saved.
const SAVED_ZONE_KEY = "numletics:push-time-zone";

function currentTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function readSavedZone() {
  try {
    return localStorage.getItem(SAVED_ZONE_KEY);
  } catch {
    return null;
  }
}

function writeSavedZone(zone: string) {
  try {
    localStorage.setItem(SAVED_ZONE_KEY, zone);
  } catch {
    // Storage can be blocked; the zone is then re-saved on the next visit, which is harmless.
  }
}

async function save(subscription: PushSubscription) {
  const timeZone = currentTimeZone();
  const json = subscription.toJSON();
  const saved = await subscribeToDailyPush({
    endpoint: subscription.endpoint,
    keys: { p256dh: json.keys?.p256dh ?? "", auth: json.keys?.auth ?? "" },
    timeZone,
  });
  if (saved) writeSavedZone(timeZone);
  return saved;
}

function urlBase64ToUint8Array(base64: string) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

/**
 * Bell in the header that subscribes this browser to the daily pushes: a morning "today's problems are
 * ready" and an evening reminder when they're unsolved, both in the browser's local time.
 */
export function PushToggle() {
  const [status, setStatus] = useState<Status>("unsupported");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const registration = await getRegistration();
      if (!registration || !active) return;
      const subscription = await registration.pushManager.getSubscription();
      if (!active) return;
      setStatus(subscription ? "on" : Notification.permission === "denied" ? "blocked" : "off");
      if (subscription && readSavedZone() !== currentTimeZone()) await save(subscription);
    })();
    return () => {
      active = false;
    };
  }, []);

  async function toggle() {
    setBusy(true);
    try {
      if (status === "on") {
        const existing = await (await getRegistration())?.pushManager.getSubscription();
        if (existing) {
          await unsubscribeFromDailyPush(existing.endpoint);
          await existing.unsubscribe();
        }
        setStatus("off");
        return;
      }
      // Ask first: iOS shows the prompt only while the tap still counts as a user gesture, which
      // can lapse during the awaits below.
      if ((await Notification.requestPermission()) !== "granted") {
        setStatus(Notification.permission === "denied" ? "blocked" : "off");
        return;
      }
      const registration = await getRegistration();
      if (!registration) return;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      const saved = await save(subscription);
      // Don't leave the browser subscribed to pushes the server will never send.
      if (!saved) await subscription.unsubscribe();
      setStatus(saved ? "on" : "off");
    } catch (error) {
      console.error("Daily reminder toggle failed:", error);
    } finally {
      setBusy(false);
    }
  }

  if (status === "unsupported") return null;

  const Icon = status === "on" ? BellIcon : BellOffIcon;
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy || status === "blocked"}
      aria-pressed={status === "on"}
      aria-label={labels[status]}
      title={labels[status]}
      className="flex size-10 shrink-0 items-center justify-center rounded-control transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink disabled:opacity-40"
    >
      <Icon className="size-6" />
    </button>
  );
}
