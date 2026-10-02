"use client";

import { useSyncExternalStore } from "react";

/** 00:00 UTC on the 1st of next month, when the monthly leaderboard resets. */
function nextReset(now: Date) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
}

/** e.g. "Oct 31 at 5:00 PM PDT", in the viewer's time zone and locale. */
function formatLocal(date: Date) {
  const day = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
  const time = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(
    date,
  );
  return `${day} at ${time}`;
}

const subscribe = () => () => {};
const getSnapshot = () => nextReset(new Date()).toISOString();
// The server doesn't know the viewer's time zone, so it renders the UTC wording.
const getServerSnapshot = () => null;

/** When the monthly leaderboard resets, shown in local time once hydrated. */
export function MonthReset() {
  const iso = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <p className="mt-2 text-base text-muted md:text-caption">
      {iso ? (
        <>
          Resets <time dateTime={iso}>{formatLocal(new Date(iso))}</time>.
        </>
      ) : (
        "Resets on the 1st at 00:00 UTC."
      )}
    </p>
  );
}
