"use client";

import { useOffline } from "next/offline";
import { useActionState, useId } from "react";
import { checkAnswer, type CheckState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { TextInput, type InputTone } from "@/components/ui/text-input";
import type { SolvedProblem } from "@/lib/problems";

const initialState: CheckState = { status: "idle", value: "" };

const tones: Record<CheckState["status"], InputTone> = {
  idle: "default",
  invalid: "danger",
  incorrect: "danger",
  correct: "success",
};

/** A problem solved earlier today (`solved`) or just now stays locked, so it can't be answered again. */
export function AnswerForm({ problemId, label, solved }: { problemId: string; label: string; solved?: SolvedProblem }) {
  const [state, formAction, pending] = useActionState<CheckState, FormData>(
    checkAnswer.bind(null, problemId),
    solved ? { status: "correct", value: solved.answer, message: solved.message } : initialState,
  );
  const feedbackId = useId();
  const done = state.status === "correct";
  // While offline, a submitted answer stays pending and is sent when the connection returns.
  const isOffline = useOffline();

  return (
    <form action={formAction} className="mt-auto flex flex-col gap-5 pt-8">
      <TextInput
        name="answer"
        defaultValue={state.value}
        inputMode="decimal"
        autoComplete="off"
        placeholder="Your answer"
        aria-label={label}
        aria-describedby={feedbackId}
        aria-invalid={state.status === "invalid" || state.status === "incorrect"}
        tone={tones[state.status]}
        readOnly={done}
        required
      />
      <Button type="submit" disabled={pending || done}>
        {done ? "Solved" : pending ? (isOffline ? "Waiting for connection…" : "Checking…") : "Check answer"}
      </Button>
      <p
        id={feedbackId}
        aria-live="polite"
        className={`-mt-1 text-center text-base md:text-caption ${
          state.status === "correct" ? "text-success" : "text-danger"
        } ${state.status === "idle" ? "hidden" : ""}`}
      >
        {state.status === "idle" ? "" : state.message}
      </p>
    </form>
  );
}
