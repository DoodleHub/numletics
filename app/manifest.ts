import type { MetadataRoute } from "next";

// Served at /manifest.webmanifest. Colors match --color-canvas in app/globals.css (the manifest can't read CSS).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Numletics — Your daily math",
    short_name: "Numletics",
    description: "Two math problems every day: one to read, one to listen to.",
    id: "/",
    // A static launch screen the service worker serves from the cache. It paints instantly and then
    // replaces itself with "/", so opening the app never shows a blank screen while the server responds.
    start_url: "/launch.html",
    scope: "/",
    display: "standalone",
    background_color: "#fefdf8",
    theme_color: "#fefdf8",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // The mark sits inside the maskable safe zone, so the same files work when the OS crops them.
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
