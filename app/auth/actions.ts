"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthField = "email" | "password";

export type AuthState =
  | { status: "idle"; email: string }
  | { status: "error"; email: string; message: string; field?: AuthField };

// Matches Supabase's default minimum. Raise both together (Dashboard → Authentication → Providers → Email).
const MIN_PASSWORD_LENGTH = 6;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Both fields are required for sign in and sign up. The form also marks them `required`,
// but that check runs only in the browser, so it's repeated here.
function readCredentials(formData: FormData, mode: "login" | "signup") {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fail = (field: AuthField, message: string) => ({ error: { status: "error", email, message, field } as const });

  if (!email) return fail("email", "Enter your email.");
  if (!EMAIL_PATTERN.test(email)) return fail("email", "Enter a valid email address.");
  if (!password.trim()) return fail("password", "Enter your password.");
  if (mode === "signup" && password.length < MIN_PASSWORD_LENGTH) {
    return fail("password", `Use at least ${MIN_PASSWORD_LENGTH} characters for your password.`);
  }
  return { email, password };
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const credentials = readCredentials(formData, "login");
  if ("error" in credentials) return credentials.error;
  const { email, password } = credentials;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { status: "error", email, message: error.message };

  redirect("/");
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const credentials = readCredentials(formData, "signup");
  if ("error" in credentials) return credentials.error;
  const { email, password } = credentials;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { status: "error", email, message: error.message };

  // "Confirm email" is disabled in Supabase, so sign-up returns a session and the user is signed in right away.
  // A missing session means the project settings changed; there's no confirmation flow to fall back on.
  if (!data.session) return { status: "error", email, message: "We couldn't sign you in. Try signing in instead." };
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
