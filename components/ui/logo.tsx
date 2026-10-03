// view-transition-name pairs it with the logo on public/launch.html, so it slides into place on launch.
export function Logo() {
  return (
    <span className="inline-flex items-center gap-3 [view-transition-name:logo] md:gap-[18px]">
      <svg viewBox="0 0 32 32" aria-hidden="true" className="size-8 md:size-[34px]">
        <rect x="0" y="7" width="11" height="25" rx="2" className="fill-accent" />
        <path d="M1 0h9l11 16V0h10v28h-8L11 10 1 3V0Z" className="fill-ink" />
      </svg>
      <span className="text-[1.5rem] font-bold tracking-[-0.01em] md:text-wordmark">Numletics</span>
    </span>
  );
}
