"use client";

import { useOffline } from "next/offline";

// Shown on every page while offline. Next keeps navigations and answer submissions pending and
// retries them when the connection returns (experimental.useOffline in next.config.ts).
export function OfflineBanner() {
  const isOffline = useOffline();

  return (
    <div role="status" aria-live="polite">
      {isOffline && (
        <p className="bg-ink px-4 py-2 text-center text-base font-medium text-surface">
          You&apos;re offline. We&apos;ll send anything pending once you reconnect.
        </p>
      )}
    </div>
  );
}
