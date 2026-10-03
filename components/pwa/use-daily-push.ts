"use client";

import { useEffect, useSyncExternalStore } from "react";
import { subscribeToDailyPush, unsubscribeFromDailyPush } from "@/app/push/actions";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

/**
 * `loading` until the service worker is ready. `off` with `canAsk` means the browser has never asked
 * for permission, which is when the reminders banner offers it.
 */
export type PushStatus = "loading" | "unsupported" | "off" | "on" | "blocked";

type PushState = { status: PushStatus; canAsk: boolean; busy: boolean };

// One shared state, so the banner and the profile menu stay in step.
const initialState: PushState = { status: "loading", canAsk: false, busy: false };
let state = initialState;
const listeners = new Set<() => void>();

function setState(next: Partial<PushState>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// The service worker registers in production only (ServiceWorkerRegistration), so push is off in
// dev. On iOS, web push only exists once the app is added to the home screen.
function isSupported() {
  return (
    process.env.NODE_ENV === "production" &&
    Boolean(vapidPublicKey) &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

// Waiting on `ready` rather than reading the current registration matters on a first launch from the
// iOS home screen: the installed app has its own storage, so the worker is still registering.
function getRegistration() {
  return isSupported() ? navigator.serviceWorker.ready : Promise.resolve(null);
}

function permissionState(subscribed: boolean): Pick<PushState, "status" | "canAsk"> {
  const permission = Notification.permission;
  return {
    status: subscribed ? "on" : permission === "denied" ? "blocked" : "off",
    canAsk: !subscribed && permission === "default",
  };
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

let started = false;

async function load() {
  if (started) return;
  started = true;
  const registration = await getRegistration();
  if (!registration) {
    setState({ status: "unsupported" });
    return;
  }
  const subscription = await registration.pushManager.getSubscription();
  setState(permissionState(Boolean(subscription)));
  if (subscription && readSavedZone() !== currentTimeZone()) await save(subscription);
}

/** Asks for permission and subscribes. Call it straight from a click handler. */
async function enable() {
  setState({ busy: true });
  try {
    // Ask first: iOS shows the prompt only while the tap still counts as a user gesture, which can
    // lapse during the awaits below.
    if ((await Notification.requestPermission()) !== "granted") {
      setState(permissionState(false));
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
    setState(permissionState(saved));
  } catch (error) {
    console.error("Turning on daily reminders failed:", error);
  } finally {
    setState({ busy: false });
  }
}

async function disable() {
  setState({ busy: true });
  try {
    const existing = await (await getRegistration())?.pushManager.getSubscription();
    if (existing) {
      await unsubscribeFromDailyPush(existing.endpoint);
      await existing.unsubscribe();
    }
    setState(permissionState(false));
  } catch (error) {
    console.error("Turning off daily reminders failed:", error);
  } finally {
    setState({ busy: false });
  }
}

/**
 * This browser's daily-push subscription: a morning "today's problems are ready" and an evening
 * reminder when they're unsolved, both in the browser's local time.
 */
export function useDailyPush() {
  const current = useSyncExternalStore(subscribe, () => state, () => initialState);
  useEffect(() => {
    void load();
  }, []);
  return { ...current, enable, disable };
}
