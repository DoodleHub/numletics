import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function BookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...props}>
      <path d="M12 6.5C10.2 5 7.6 4.5 3 4.5v14c4.6 0 7.2.5 9 2 1.8-1.5 4.4-2 9-2v-14c-4.6 0-7.2.5-9 2Z" />
      <path d="M12 6.5v14" />
    </svg>
  );
}

export function HeadphonesIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...props}>
      <path d="M3.5 17v-4.5a8.5 8.5 0 0 1 17 0V17" />
      <rect x="3.5" y="14" width="3" height="6.5" rx="1.5" />
      <rect x="17.5" y="14" width="3" height="6.5" rx="1.5" />
    </svg>
  );
}

export function PlayGlyph(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" {...props}>
      <path d="M6 3.5v17L21 12 6 3.5Z" />
    </svg>
  );
}

export function StopGlyph(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" {...props}>
      <rect x="5" y="4" width="5" height="16" rx="1" />
      <rect x="14" y="4" width="5" height="16" rx="1" />
    </svg>
  );
}

export function TrophyIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...props}>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3" />
      <path d="M12 14v4M8 20.5h8" />
    </svg>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...props}>
      <path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function EyeOffIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...props}>
      <path d="M10.6 5.1A9.8 9.8 0 0 1 12 5c6 0 9.5 7 9.5 7a16.6 16.6 0 0 1-2.4 3.3M6.6 6.6C3.9 8.4 2.5 12 2.5 12S6 19 12 19a9.4 9.4 0 0 0 5.4-1.6" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18" />
    </svg>
  );
}
