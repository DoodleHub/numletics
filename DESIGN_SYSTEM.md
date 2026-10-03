# Numletics Design System

Source of truth: `ss-mocks/main-design.png` (1536×1024). Tokens live in `app/globals.css` under `@theme`, so each one is also a Tailwind utility (`bg-canvas`, `text-title`, `rounded-card`, `h-control`, …). Use the tokens. Don't hard-code hex values or one-off sizes in components.

Tone: calm, sporty, minimal. Warm off-white canvas, white cards, near-black ink, and one lime accent. A dark theme follows the device setting (`prefers-color-scheme`).

## Color

Each token has a light and a dark value. The dark values are redefined on `:root` in a `prefers-color-scheme: dark` block in `app/globals.css`, so components use the same utilities in both themes and need no `dark:` variants.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `canvas` | `#fefdf8` | `#121417` | Page background |
| `surface` | `#ffffff` | `#1b1e23` | Cards, inputs, text on ink |
| `ink` | `#0f1216` | `#f3f2ec` | Primary text, buttons. Buttons are `bg-ink text-surface`, so they turn light in dark mode. |
| `muted` | `#4b4e5a` | `#a9abb5` | Captions, footer |
| `subtle` | `#7c7d88` | `#80828d` | Placeholders |
| `line` | `#e5e5e6` | `#2c3038` | Card borders, skeletons |
| `line-strong` | `#c8c8ce` | `#464b55` | Input borders |
| `accent` | `#bef62e` | `#bef62e` | Brand lime. Use it only for the logo stem and the play button. Never use it for text on canvas, because the contrast is too low in light mode. |
| `play` | `#0f1216` | `#bef62e` | Play button fill. In dark mode it flips to lime, because a lime glyph on light ink would be unreadable. |
| `play-glyph` | `#bef62e` | `#0f1216` | Play button glyph |
| `success` | `#2f7a1f` | `#7ccf5a` | Correct-answer feedback and border |
| `danger` | `#c2362b` | `#f2766c` | Wrong or invalid answer feedback and border |
| `shadow` | `rgba(15,18,22,.12)` | `rgba(0,0,0,.5)` | Color inside `shadow-popover` and `shadow-play`. Tailwind inlines `--shadow-*` values, so shadows must take their color from this variable to switch themes. |

`public/launch.html` and `public/offline.html` can't load the app's CSS, so they copy these values, dark block included. The manifest takes a single color, so it uses the dark canvas: the OS splash before `launch.html` is always dark.

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
- Card borders are 1px `line`. Cards have no shadow. Dropdown menus (the profile menu) are bordered surface panels with `shadow-popover`.
- Auth pages (`/login`, `/signup`) center a single card in `max-w-auth` (512px).
- The leaderboard centers one card in `max-w-board` (720px). Rows are split by 1px `line` borders, and the current user's row is bold with a muted "(you)".

## Iconography

Inline SVG, 24×24 viewBox, 2px round strokes, `currentColor`. They render at 44px in card headers (36px on mobile). Available icons are in `components/ui/icons.tsx`: `BookIcon`, `HeadphonesIcon`, `TrophyIcon`, `EyeIcon`, `EyeOffIcon`, `BellIcon`, `BellOffIcon`, `FlameIcon`, `ShareIcon`, `CloseIcon`, `UserIcon`, `SignOutIcon`, `PlayGlyph` and `StopGlyph`.

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
