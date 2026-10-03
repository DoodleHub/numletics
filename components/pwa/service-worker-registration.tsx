"use client";

import { useEffect } from "react";

// Registers public/sw.js. Production only, so the dev server's assets are never served from the cache.
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {
      // The app works without it; the service worker only adds the offline page and asset caching.
    });
  }, []);

  return null;
}
