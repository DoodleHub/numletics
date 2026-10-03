import type { MetadataRoute } from "next";

// Served at /manifest.webmanifest. Colors match the dark --color-canvas in app/globals.css (the manifest can't read CSS).
// It takes one color, not one per scheme, so the OS splash before launch.html is always dark.
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
    background_color: "#121417",
    theme_color: "#121417",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // The mark sits inside the maskable safe zone, so the same files work when the OS crops them.
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
