"use client";

import { useState, type ComponentProps } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/ui/icons";
import { TextInput } from "@/components/ui/text-input";

type PasswordInputProps = Omit<ComponentProps<typeof TextInput>, "type">;

export function PasswordInput({ className = "", ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      {/* Hide Edge's built-in reveal button so there is only one toggle. */}
      <TextInput
        type={visible ? "text" : "password"}
        className={`pr-16 md:pr-18 [&::-ms-reveal]:hidden ${className}`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-2 my-auto flex size-11 items-center justify-center rounded-control text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ink md:right-3 md:size-12"
      >
        {visible ? <EyeOffIcon className="size-6" /> : <EyeIcon className="size-6" />}
      </button>
    </div>
  );
}
