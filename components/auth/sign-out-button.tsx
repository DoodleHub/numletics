"use client";

import { useFormStatus } from "react-dom";

export function SignOutButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 rounded-control text-base font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink disabled:text-muted disabled:no-underline md:text-caption"
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
