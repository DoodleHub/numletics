import type { InputHTMLAttributes } from "react";

export type InputTone = "default" | "success" | "danger";

const toneBorder: Record<InputTone, string> = {
  default: "border-line-strong focus:border-ink",
  success: "border-success",
  danger: "border-danger",
};

export function TextInput({
  tone = "default",
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { tone?: InputTone }) {
  return (
    <input
      className={`h-14 w-full rounded-control border bg-surface px-6 text-lg text-ink outline-none transition-colors placeholder:text-subtle md:h-control md:text-control ${toneBorder[tone]} ${className}`}
      {...props}
    />
  );
}
