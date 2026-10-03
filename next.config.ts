import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Keeps navigations and Server Actions (answer submissions) pending while offline and retries
    // them on reconnect. Enables useOffline() from next/offline.
    useOffline: true,
  },
  async headers() {
    return [
      {
        // Browsers must always fetch the latest service worker, or users get stuck on an old one.
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
};

export default nextConfig;
