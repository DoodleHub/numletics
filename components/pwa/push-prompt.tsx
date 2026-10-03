"use client";

import { useState, useSyncExternalStore } from "react";
import { BellIcon, CloseIcon } from "@/components/ui/icons";
import { useDailyPush } from "./use-daily-push";

// A dismissed banner stays hidden for two weeks. Reminders can still be turned on from the profile menu.
const DISMISSED_KEY = "numletics:push-prompt-dismissed-at";
const SNOOZE_MS = 14 * 86_400_000;

function wasDismissedRecently() {
  try {
    return Date.now() - Number(localStorage.getItem(DISMISSED_KEY) ?? 0) < SNOOZE_MS;
  } catch {
    return false;
  }
}

function rememberDismissal() {
  try {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  } catch {
    // Storage can be blocked; the banner then comes back on the next visit, which is harmless.
  }
}

const noop = () => () => {};

/**
 * Banner under the header, shown on open when the browser has never asked for notification
 * permission. Browsers only show the permission prompt after a tap (iOS ignores it otherwise), so
 * the banner's button is what opens it.
 */
export function PushPrompt() {
  const { status, canAsk, busy, enable } = useDailyPush();
  // Read on the client only, so the banner never renders during SSR.
  const snoozed = useSyncExternalStore(noop, wasDismissedRecently, () => true);
  const [dismissed, setDismissed] = useState(false);

  if (status !== "off" || !canAsk || snoozed || dismissed) return null;

  function dismiss() {
    rememberDismissal();
    setDismissed(true);
  }

  return (
    <aside
      aria-label="Daily reminders"
      className="mx-auto mt-4 flex w-full max-w-page items-center gap-3 rounded-card border border-line bg-surface py-3 pr-2 pl-4"
    >
      <BellIcon className="size-6 shrink-0" />
      <p className="min-w-0 flex-1 text-base text-muted md:text-caption">
        <span className="font-medium text-ink">Get a daily reminder</span> when new problems are ready.
      </p>
      <button
        type="button"
        onClick={enable}
        disabled={busy}
        className="h-10 shrink-0 rounded-control bg-ink px-4 text-base font-medium text-surface transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-60"
      >
        Turn on
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="flex size-10 shrink-0 items-center justify-center rounded-control text-muted transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        <CloseIcon className="size-5" />
      </button>
    </aside>
  );
}
