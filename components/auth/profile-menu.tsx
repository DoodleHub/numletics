"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { useFormStatus } from "react-dom";
import { signOut } from "@/app/auth/actions";
import { isIOS } from "@/components/pwa/install-prompt";
import { useDailyPush } from "@/components/pwa/use-daily-push";
import { BellIcon, SignOutIcon, TrophyIcon, UserIcon } from "@/components/ui/icons";

const itemClass =
  "flex min-h-12 w-full items-center gap-3 rounded-control px-3 text-left text-base font-medium hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ink disabled:text-muted disabled:hover:bg-transparent md:text-caption";

const noop = () => () => {};

function RemindersItem() {
  const { status, busy, enable, disable } = useDailyPush();
  // iOS offers web push only to apps added to the home screen. Read on the client only.
  const ios = useSyncExternalStore(noop, isIOS, () => false);
  const on = status === "on";
  const available = status === "on" || status === "off";
  const note =
    status === "blocked"
      ? "Blocked in your notification settings"
      : status === "unsupported"
        ? ios
          ? "Add Numletics to your home screen first"
          : "Not available in this browser"
        : null;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={on ? disable : enable}
      disabled={!available || busy}
      className={itemClass}
    >
      <BellIcon className="size-5 shrink-0" />
      <span className="flex min-w-0 flex-1 flex-col">
        Daily reminders
        {note && <span className="text-sm font-normal text-muted">{note}</span>}
      </span>
      <span
        aria-hidden="true"
        className={`flex h-6 w-10 shrink-0 items-center rounded-full p-0.5 transition-colors ${on ? "bg-ink" : "bg-line-strong"} ${available ? "" : "opacity-50"}`}
      >
        <span className={`size-5 rounded-full bg-surface transition-transform ${on ? "translate-x-4" : ""}`} />
      </span>
    </button>
  );
}

function SignOutItem() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={itemClass}>
      <SignOutIcon className="size-5 shrink-0" />
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}

/**
 * Profile button at the top right. Its dropdown shows who is signed in and holds the leaderboard
 * link, the daily-reminders switch and sign out. Closes on Escape, an outside click or focus leaving it.
 */
export function ProfileMenu({ displayName, email }: { displayName: string | null; email: string | null }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative shrink-0"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label="Profile and settings"
        className="flex size-10 items-center justify-center rounded-full border border-line-strong bg-surface transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        <UserIcon className="size-6" />
      </button>
      {open && (
        <div
          id={menuId}
          className="absolute top-full right-0 z-20 mt-2 w-72 rounded-card border border-line bg-surface p-2 shadow-popover"
        >
          {(displayName || email) && (
            <div className="border-b border-line px-3 pt-2 pb-3">
              {displayName && <p className="truncate text-base font-bold md:text-caption">{displayName}</p>}
              {email && <p className="truncate text-sm text-muted">{email}</p>}
            </div>
          )}
          <div className="flex flex-col pt-2">
            <Link href="/leaderboard" onClick={() => setOpen(false)} className={itemClass}>
              <TrophyIcon className="size-5 shrink-0" />
              Leaderboard
            </Link>
            <RemindersItem />
            <form action={signOut}>
              <SignOutItem />
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
