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

// The service worker registers in production only (ServiceWorkerRegistration), so this stays
// hidden in dev. On iOS, web push only exists once the app is added to the home screen.
async function getRegistration() {
  if (!vapidPublicKey || !("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    return null;
  }
  return (await navigator.serviceWorker.getRegistration("/")) ?? null;
}

function urlBase64ToUint8Array(base64: string) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

/** Bell in the header that subscribes this browser to the 00:00 UTC "today's problems are ready" push. */
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
    })();
    return () => {
      active = false;
    };
  }, []);

  async function toggle() {
    const registration = await getRegistration();
    if (!registration) return;
    setBusy(true);
    try {
      const existing = await registration.pushManager.getSubscription();
      if (existing) {
        await unsubscribeFromDailyPush(existing.endpoint);
        await existing.unsubscribe();
        setStatus("off");
        return;
      }
      if ((await Notification.requestPermission()) !== "granted") {
        setStatus(Notification.permission === "denied" ? "blocked" : "off");
        return;
      }
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      const json = subscription.toJSON();
      const saved = await subscribeToDailyPush({
        endpoint: subscription.endpoint,
        keys: { p256dh: json.keys?.p256dh ?? "", auth: json.keys?.auth ?? "" },
      });
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
