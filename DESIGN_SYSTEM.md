# Numletics Design System

Source of truth: `ss-mocks/main-design.png` (1536×1024). Tokens live in `app/globals.css` under `@theme`, so each one is also a Tailwind utility (`bg-canvas`, `text-title`, `rounded-card`, `h-control`, …). Use the tokens. Don't hard-code hex values or one-off sizes in components.

Tone: calm, sporty, minimal. Warm off-white canvas, white cards, near-black ink, and one lime accent. Light theme only.

## Color

| Token | Value | Use |
| --- | --- | --- |
| `canvas` | `#fefdf8` | Page background |
| `surface` | `#ffffff` | Cards, inputs, text on ink |
| `ink` | `#0f1216` | Primary text, buttons, play button |
| `muted` | `#4b4e5a` | Captions, footer |
| `subtle` | `#7c7d88` | Placeholders |
| `line` | `#e5e5e6` | Card borders |
| `line-strong` | `#c8c8ce` | Input borders |
| `accent` | `#bef62e` | Brand lime. Use it only for the logo stem and the play glyph. Never use it for text on canvas, because the contrast is too low. |
| `success` | `#2f7a1f` | Correct-answer feedback and border |
| `danger` | `#c2362b` | Wrong or invalid answer feedback and border |

## Typography

Font: **Figtree** (`next/font/google`, exposed as `--font-figtree`, mapped to `font-sans`).

| Token | Desktop (≥ md) | Mobile | Weight | Use |
| --- | --- | --- | --- | --- |
| `text-display` | 72px / 1.1, −0.02em | 40px | 700 | Page headline |
| `text-title` | 37px / 1.2, −0.01em | 26px | 700 | Card titles |
| `text-wordmark` | 31px / 1, −0.01em | 24px | 700 | Logo wordmark |
| `text-problem` | 30px / 1.47 | 22px | 400 | Problem statement |
| `text-control` | 26px / 1.2 | 18px | 400 / 500 | Input text, button label (500) |
| `text-caption` | 21px / 1.4 | 16px | 400 | Captions, footer, feedback |

## Shape, size and spacing

- Radii: `rounded-card` 16px for cards and `rounded-control` 8px for inputs and buttons. The play button is a full circle.
- Control height: `h-control` 66px on desktop and 56px on mobile.
- Play button: `size-play` 112px on desktop and 96px on mobile, with a soft shadow.
- Page: 77px side gutter on desktop and 16px on mobile. The card grid is `max-w-page` (1260px) wide, has two columns with a 20px gap, and stacks below `md`.
- Card padding is 45px top, 38px sides and 34px bottom on desktop. Header-to-content gap is 50px, and input-to-button gap is 20px.
- Vertical rhythm on desktop: about 50px between headline and cards, and about 50px between cards and footer.
- Card borders are 1px `line`. Cards have no shadow.
- Auth pages (`/login`, `/signup`) center a single card in `max-w-auth` (512px).

## Iconography

Inline SVG, 24×24 viewBox, 2px round strokes, `currentColor`. They render at 44px in card headers (36px on mobile). Available icons are in `components/ui/icons.tsx`: `BookIcon`, `HeadphonesIcon`, `PlayGlyph` and `StopGlyph`.

## Components (`components/ui/`)

| Component | Notes |
| --- | --- |
| `Logo` | Lime-stem "N" mark plus the "Numletics" wordmark |
| `Card`, `CardHeader` | White bordered panel with a flex column. `CardHeader` takes an `icon` and a `title` and renders an `h2`. |
| `Button` | Full-width ink button with a white label. Hover lowers opacity, and disabled sets it to 60%. |
| `TextInput` | Full-width input. `tone` is `default`, `success` or `danger` and sets the border color. |
| `PlayButton` | Ink circle with a lime play glyph. While `playing`, it shows the stop glyph and sets `aria-pressed`. |

## States and accessibility

- Every interactive element shows a 2px ink `focus-visible` outline. Inputs show focus by turning the border `ink`.
- Feedback appears in an `aria-live="polite"` line under the button, and the input border takes the matching tone.
- Every input has an `aria-label`, because the design shows no visible labels.
