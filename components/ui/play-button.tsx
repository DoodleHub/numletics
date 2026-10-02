import { PlayGlyph, StopGlyph } from "./icons";

export function PlayButton({
  playing,
  label,
  onClick,
}: {
  playing: boolean;
  label: string;
  onClick: () => void;
}) {
  const Glyph = playing ? StopGlyph : PlayGlyph;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={playing}
      className="grid size-24 place-items-center rounded-full bg-ink text-accent shadow-[0_2px_6px_rgba(15,18,22,0.12)] transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink md:size-play"
    >
      <Glyph className={`size-9 md:size-10 ${playing ? "" : "translate-x-[2px]"}`} />
    </button>
  );
}
