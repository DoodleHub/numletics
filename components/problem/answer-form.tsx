"use client";

import { useActionState, useId } from "react";
import { checkAnswer, type CheckState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { TextInput, type InputTone } from "@/components/ui/text-input";

const initialState: CheckState = { status: "idle", value: "" };

const tones: Record<CheckState["status"], InputTone> = {
  idle: "default",
  invalid: "danger",
  incorrect: "danger",
  correct: "success",
};

export function AnswerForm({ problemId, label }: { problemId: string; label: string }) {
  const [state, formAction, pending] = useActionState(checkAnswer.bind(null, problemId), initialState);
  const feedbackId = useId();

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
        required
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Checking…" : "Check answer"}
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
