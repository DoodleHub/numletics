"use client";

import { useState, useSyncExternalStore } from "react";
import { CloseIcon, ShareIcon } from "@/components/ui/icons";

// Chromium-only event, not in the DOM typings.
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Chrome can fire beforeinstallprompt before React hydrates, so it's caught when this module loads
// rather than in an effect, and kept for the banner to use.
let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function setDeferredPrompt(event: BeforeInstallPromptEvent | null) {
  deferredPrompt = event;
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault(); // Keep Chrome's own mini-infobar away; the banner offers the install instead.
    setDeferredPrompt(event as BeforeInstallPromptEvent);
  });
  window.addEventListener("appinstalled", () => setDeferredPrompt(null));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// A dismissed banner stays hidden for two weeks.
const DISMISSED_KEY = "numletics:install-dismissed-at";
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

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

// iPadOS reports itself as a Mac, so a touch-capable "Mac" counts too.
export function isIOS() {
  return /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

type Platform = "android" | "ios";

// Read on the client only; the server snapshot is null, so the banner never renders during SSR.
function getPlatform(): Platform | null {
  if (isStandalone() || wasDismissedRecently()) return null;
  if (deferredPrompt) return "android";
  return isIOS() ? "ios" : null;
}

/**
 * Mobile banner under the header that suggests installing the app. Chromium browsers fire
 * beforeinstallprompt, so the banner opens the real install dialog. iOS has no install API, so it
 * explains Share → Add to Home Screen instead, which is also what web push needs there.
 */
export function InstallPrompt() {
  const platform = useSyncExternalStore(subscribe, getPlatform, () => null);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !platform) return null;

  function dismiss() {
    rememberDismissal();
    setDismissed(true);
  }

  async function install() {
    if (!deferredPrompt) return;
    const event = deferredPrompt;
    await event.prompt();
    const { outcome } = await event.userChoice;
    // The event can only be used once.
    setDeferredPrompt(null);
    if (outcome === "dismissed") dismiss();
  }

  return (
    <aside
      aria-label="Install Numletics"
      className="mt-4 flex items-center gap-3 rounded-card border border-line bg-surface py-3 pr-2 pl-4 md:hidden"
    >
      <p className="min-w-0 flex-1 text-base text-muted">
        {platform === "android" ? (
          <>
            <span className="font-medium text-ink">Install Numletics</span> to open today&apos;s problems in one
            tap.
          </>
        ) : (
          <>
            <span className="font-medium text-ink">Add Numletics to your home screen</span> for daily reminders:
            tap <ShareIcon className="inline size-5 align-text-bottom text-ink" />
            <span className="sr-only">Share</span>,
            then <span className="font-medium text-ink">Add to Home Screen</span>.
          </>
        )}
      </p>
      {platform === "android" && (
        <button
          type="button"
          onClick={install}
          className="h-10 shrink-0 rounded-control bg-ink px-4 text-base font-medium text-surface transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          Install
        </button>
      )}
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
