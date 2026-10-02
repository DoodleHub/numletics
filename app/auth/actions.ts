"use server";

import { redirect } from "next/navigation";
import { DISPLAY_NAME_MAX, DISPLAY_NAME_MIN } from "@/lib/display-name";
import { createClient } from "@/lib/supabase/server";

export type AuthField = "displayName" | "email" | "password";

export type AuthState =
  | { status: "idle"; email: string; displayName: string }
  | { status: "error"; email: string; displayName: string; message: string; field?: AuthField };

// Matches Supabase's default minimum. Raise both together (Dashboard → Authentication → Providers → Email).
const MIN_PASSWORD_LENGTH = 6;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Email and password are required for sign in and sign up, and sign up also needs a display name.
// The form also marks them `required`, but that check runs only in the browser, so it's repeated here.
function readCredentials(formData: FormData, mode: "login" | "signup") {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  // Collapse runs of whitespace so names look the same everywhere.
  const displayName = String(formData.get("displayName") ?? "").trim().replace(/\s+/g, " ");
  const fail = (field: AuthField, message: string) => ({
    error: { status: "error", email, displayName, message, field } as const,
  });

  if (mode === "signup") {
    if (!displayName) return fail("displayName", "Enter a display name.");
    if (displayName.length < DISPLAY_NAME_MIN || displayName.length > DISPLAY_NAME_MAX) {
      return fail("displayName", `Use ${DISPLAY_NAME_MIN} to ${DISPLAY_NAME_MAX} characters for your display name.`);
    }
  }
  if (!email) return fail("email", "Enter your email.");
  if (!EMAIL_PATTERN.test(email)) return fail("email", "Enter a valid email address.");
  if (!password.trim()) return fail("password", "Enter your password.");
  if (mode === "signup" && password.length < MIN_PASSWORD_LENGTH) {
    return fail("password", `Use at least ${MIN_PASSWORD_LENGTH} characters for your password.`);
  }
  return { email, password, displayName };
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const credentials = readCredentials(formData, "login");
  if ("error" in credentials) return credentials.error;
  const { email, password } = credentials;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { status: "error", email, displayName: "", message: error.message };

  redirect("/");
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const credentials = readCredentials(formData, "signup");
  if ("error" in credentials) return credentials.error;
  const { email, password, displayName } = credentials;

  const supabase = await createClient();
  // A database trigger copies display_name into public.profiles.
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: displayName } } });
  if (error) return { status: "error", email, displayName, message: error.message };

  // "Confirm email" is disabled in Supabase, so sign-up returns a session and the user is signed in right away.
  // A missing session means the project settings changed; there's no confirmation flow to fall back on.
  if (!data.session) return { status: "error", email, displayName, message: "We couldn't sign you in. Try signing in instead." };
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
