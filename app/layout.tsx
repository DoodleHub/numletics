import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import { OfflineBanner } from "@/components/pwa/offline-banner";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Numletics — Your daily math",
  description: "Two math problems every day: one to read, one to listen to.",
  applicationName: "Numletics",
  // iOS reads these instead of the manifest when the app is added to the home screen.
  appleWebApp: { capable: true, title: "Numletics", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  // --color-canvas, light and dark
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fefdf8" },
    { media: "(prefers-color-scheme: dark)", color: "#121417" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${figtree.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <OfflineBanner />
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
