/** A pulsing placeholder block. Size comes from `className`; `round` makes it a circle. Hidden from assistive tech. */
export function Skeleton({ round = false, className = "" }: { round?: boolean; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block animate-pulse bg-line motion-reduce:animate-none ${round ? "rounded-full" : "rounded-control"} ${className}`}
    />
  );
}

/** Screen-reader-only announcement for a loading page, since the skeleton itself is hidden. */
export function LoadingStatus({ label }: { label: string }) {
  return (
    <p role="status" className="sr-only">
      {label}
    </p>
  );
}
