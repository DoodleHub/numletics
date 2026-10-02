<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.
<!-- END:nextjs-agent-rules -->

# Numletics

A daily math app. Each day it serves two sport-themed word problems: one to **read** and one to **listen** to through browser text-to-speech. Each problem has its own answer box, and answers are checked on the server.

Stack: Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4, TypeScript, Supabase Auth (`@supabase/ssr`, email and password). There is no database of our own.

## App logic

1. **Auth.** Every page requires a signed-in user except `/login` and `/signup`. `proxy.ts` refreshes the Supabase session on each request and redirects signed-out visitors to `/login`. That redirect is only optimistic, so `app/page.tsx` also calls `requireUser()` and `checkAnswer` calls `getCurrentUser()` (both in `lib/supabase/user.ts`, which verifies the JWT with `getClaims()`). Sign in, sign up and sign out are Server Actions in `app/auth/actions.ts`, and they validate email and password on the server. "Confirm email" is disabled in Supabase, so sign-up signs the user in right away and there is no email-confirmation route or "check your email" state.
2. `app/page.tsx` is a dynamic Server Component. It calls `await connection()` so it renders per request, which keeps the daily rotation on the current date instead of the build date. It then calls `getDailyProblem("read")` and `getDailyProblem("listen")`.
3. `lib/problems.ts` (`server-only`) holds two hard-coded banks, `READ` and `LISTEN`. Today's problem is `bank[floor(Date.now() / 86_400_000) % bank.length]`, so it rotates at **00:00 UTC**. Only `{ id, text }` (`PublicProblem`) leaves the server. Answers never reach the client.
4. `components/problem/answer-form.tsx` (client) submits to the `checkAnswer` Server Action (`app/actions.ts`) through `useActionState`. The problem id is bound with `.bind(null, problemId)`.
5. `checkAnswer` looks up the problem by id, then extracts the first number from the input with `lib/answer.ts` (`parseNumericAnswer`). It accepts inputs like "20", "20 minutes", "1,500" and "4.5h", and compares with `1e-6` tolerance. It returns `{ status: "invalid" | "incorrect" | "correct", value, message }`. `value` echoes the raw input, because React resets forms after an action and the input refills from `defaultValue={state.value}`.
6. `components/problem/listen-card.tsx` (client) speaks the problem with `window.speechSynthesis` (en-US, rate 0.9). The play button toggles play and stop, and speech is cancelled on unmount. If speech synthesis isn't available, the card shows the problem text instead.

## Structure

```
app/
  layout.tsx        Figtree font (--font-figtree), metadata, body shell
  page.tsx          Header (Logo), headline, 2-col card grid, footer
  actions.ts        "use server": checkAnswer
  (auth)/           Signed-out pages sharing one layout: login, signup
  auth/             actions.ts (signIn, signUp, signOut)
  globals.css       Design tokens (@theme), the only place colors and sizes are defined
components/
  ui/               Design-system primitives: Logo, Card/CardHeader, Button, TextInput, PlayButton, icons
  problem/          Feature components: ReadCard (server), ListenCard (client), AnswerForm (client)
  auth/             AuthForm (client), UserMenu
lib/
  problems.ts       Problem banks and daily selection (server-only)
  answer.ts         Numeric parsing and comparison (shared, pure)
  supabase/         env, server client, proxy session refresh, getCurrentUser/requireUser (server-only)
proxy.ts            Next 16 proxy (formerly middleware): session refresh and sign-in redirect
ss-mocks/           Design mocks; main-design.png is the source of truth
DESIGN_SYSTEM.md    Tokens, type scale, spacing, component specs
```

## Constraints and conventions

- **Follow the mock and `DESIGN_SYSTEM.md`.** Style with token-backed Tailwind utilities such as `bg-canvas`, `text-ink`, `text-title`, `rounded-card` and `h-control`. Add any new color or size to `@theme` in `app/globals.css` first. Don't hard-code hex values in components.
- Desktop values apply at `md` and above. Below `md` the cards stack and the type scales down (see the mobile column in `DESIGN_SYSTEM.md`). Layouts must work at 390px wide with no horizontal scroll.
- The theme is light only. There are no dark-mode styles.
- **Never send answers to the client.** Keep `lib/problems.ts` behind `import "server-only"`, and import only its *types* (`import type`) from client components. Check answers only in `checkAnswer`.
- **Auth checks run on the server with `getClaims()`, never `getSession()`.** Gate new pages with `requireUser()` and new Server Actions with `getCurrentUser()`. To make a page public, add it to `isPublicPath` in `lib/supabase/proxy.ts`. Supabase settings live in `.env.local` (see `.env.example`), and only the publishable key belongs there.
- Every problem needs a single numeric answer. `unit` is optional and is used only in the success message (`"%"` attaches without a space).
- Listen problems are spoken aloud. Keep them short and easy to do as mental math, and avoid symbols or notation that TTS reads badly.
- Problem ids must be unique across both banks, because `findProblem` searches both. Changing a bank's length reshuffles which problem falls on which day.
- Prefer Server Components. Add `"use client"` only for state, effects or browser APIs, as in `AnswerForm` and `ListenCard`.
- Accessibility: inputs need `aria-label`s (the design has no visible labels), feedback uses `aria-live="polite"`, and focus outlines must stay visible.
- Before finishing, run `npx tsc --noEmit`, `npm run lint` and `npm run build`.
