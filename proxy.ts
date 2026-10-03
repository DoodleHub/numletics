import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Skip static assets, images and the PWA files, which must load without a session.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|offline.html|launch.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
