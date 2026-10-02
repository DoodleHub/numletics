"use client";

import Link from "next/link";
import { useActionState, useId } from "react";
import { signIn, signUp, type AuthField, type AuthState } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/password-input";
import { TextInput } from "@/components/ui/text-input";
import { DISPLAY_NAME_MAX } from "@/lib/display-name";

const copy = {
  login: {
    title: "Sign in",
    submit: "Sign in",
    pending: "Signing in…",
    switchText: "New here?",
    switchLink: "Create an account",
    switchHref: "/signup",
  },
  signup: {
    title: "Create account",
    submit: "Create account",
    pending: "Creating account…",
    switchText: "Already have an account?",
    switchLink: "Sign in",
    switchHref: "/login",
  },
} as const;

const initialState: AuthState = { status: "idle", email: "", displayName: "" };

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [state, formAction, pending] = useActionState(mode === "login" ? signIn : signUp, initialState);
  const feedbackId = useId();
  const text = copy[mode];
  // Highlight only the field that failed. Errors from Supabase (e.g. wrong password) have no field and mark
  // email and password.
  const invalid = (field: AuthField) =>
    state.status === "error" && (state.field === undefined ? field !== "displayName" : state.field === field);

  return (
    <Card>
      <h1 className="text-[1.625rem] font-bold leading-tight tracking-[-0.01em] md:text-title">{text.title}</h1>
      <form action={formAction} className="flex flex-col gap-5 pt-8">
        {mode === "signup" && (
          <TextInput
            name="displayName"
            defaultValue={state.displayName}
            autoComplete="nickname"
            placeholder="Display name"
            aria-label="Display name, shown on the leaderboard"
            aria-describedby={feedbackId}
            aria-invalid={invalid("displayName")}
            tone={invalid("displayName") ? "danger" : "default"}
            maxLength={DISPLAY_NAME_MAX}
            required
          />
        )}
        <TextInput
          name="email"
          type="email"
          defaultValue={state.email}
          autoComplete="email"
          placeholder="Email"
          aria-label="Email"
          aria-describedby={feedbackId}
          aria-invalid={invalid("email")}
          tone={invalid("email") ? "danger" : "default"}
          required
        />
        <PasswordInput
          name="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          placeholder="Password"
          aria-label="Password"
          aria-describedby={feedbackId}
          aria-invalid={invalid("password")}
          tone={invalid("password") ? "danger" : "default"}
          minLength={mode === "signup" ? 6 : undefined}
          required
        />
        <Button type="submit" disabled={pending}>
          {pending ? text.pending : text.submit}
        </Button>
        <p
          id={feedbackId}
          aria-live="polite"
          className={`-mt-1 text-center text-base text-danger md:text-caption ${state.status === "idle" ? "hidden" : ""}`}
        >
          {state.status === "idle" ? "" : state.message}
        </p>
      </form>
      <p className="mt-6 text-center text-base text-muted md:text-caption">
        {text.switchText}{" "}
        <Link
          href={text.switchHref}
          className="rounded-control font-medium text-ink underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          {text.switchLink}
        </Link>
      </p>
    </Card>
  );
}
