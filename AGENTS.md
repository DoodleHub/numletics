<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.
<!-- END:nextjs-agent-rules -->

# Numletics

A daily math app. Each day it serves two word problems: a sport-themed one to **read**, and a shopping or percentage one to **listen** to through browser text-to-speech. Each problem has its own answer box, and answers are checked on the server.

Stack: Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4, TypeScript, Supabase Auth (`@supabase/ssr`, email and password), and Supabase Postgres for the leaderboard (`supabase/migrations/`).

## App logic

1. **Auth.** Every page requires a signed-in user except `/login` and `/signup`. `proxy.ts` refreshes the Supabase session on each request and redirects signed-out visitors to `/login`. That redirect is only optimistic, so every signed-in page also calls `requireUser()` and `checkAnswer` calls `getCurrentUser()` (both in `lib/supabase/user.ts`, which verifies the JWT with `getClaims()`). Sign in, sign up and sign out are Server Actions in `app/auth/actions.ts`, and they validate email, password and (on sign-up) display name on the server. The display name goes into sign-up metadata, and the `on_auth_user_created` trigger copies it into `public.profiles`. Display names are unique ignoring case; `signUp` checks with the `display_name_available` RPC first. "Confirm email" is disabled in Supabase, so sign-up signs the user in right away and there is no email-confirmation route or "check your email" state.
2. `app/(app)/(home)/page.tsx` is a dynamic Server Component. It calls `await connection()` so it renders per request, which keeps the daily rotation on the current date instead of the build date. It then calls `getDailyProblem("read")` and `getDailyProblem("listen")`, and `getSolvedToday()` (`lib/leaderboard.ts`, the user's own `results` rows for today) so a problem already solved today renders locked, with its answer and a "Solved" button. `getStreak()` counts consecutive UTC days with a solve (alive until 00:00 UTC if yesterday was solved) for `StreakStatus` under the countdown; `checkAnswer` calls `refresh()` after a correct answer to today's problem so it updates right away.
3. `lib/problems.ts` (`server-only`) holds two hard-coded banks, `READ` and `LISTEN`. Today's problem is `bank[floor(Date.now() / 86_400_000) % bank.length]`, so it rotates at **00:00 UTC**. Only `{ id, text }` (`PublicProblem`) leaves the server. Answers never reach the client.
4. `components/problem/answer-form.tsx` (client) submits to the `checkAnswer` Server Action (`app/actions.ts`) through `useActionState`. The problem id is bound with `.bind(null, problemId)`.
5. `checkAnswer` looks up the problem by id, then extracts the first number from the input with `lib/answer.ts` (`parseNumericAnswer`). It accepts inputs like "20", "20 minutes", "1,500" and "4.5h", and compares with `1e-6` tolerance. If the problem is one of today's (`getDailyMode`) and already solved, it returns `correct` without checking again. Otherwise it records the attempt with `recordAttempt` (`lib/leaderboard.ts`, the `record_attempt` RPC). It returns `{ status: "invalid" | "incorrect" | "correct", value, message }`. `value` echoes the raw input, because React resets forms after an action and the input refills from `defaultValue={state.value}`.
6. `components/problem/listen-card.tsx` (client) speaks the problem with `window.speechSynthesis` (en-US, rate 0.9). The play button toggles play and stop, and speech is cancelled on unmount. If speech synthesis isn't available, the card shows the problem text instead.
7. **PWA and daily push.** The app installs from `app/manifest.ts` and `public/sw.js` (offline page, asset cache, push display). The manifest's `start_url` is `public/launch.html`, a static launch screen the service worker serves from the cache: it paints at once, stays up at least 800ms, then `location.replace`s itself with `/` and crossfades in (cross-document view transition, the logo slides into the header), so opening the app doesn't show a blank screen while the server refreshes the session. `experimental.useOffline` keeps navigations and answer submissions pending while offline; `OfflineBanner` and `AnswerForm` show it. `useDailyPush` (`components/pwa/use-daily-push.ts`) holds this browser's subscription state, shared by `PushPrompt` and the profile menu. Browsers only show the permission prompt after a tap, so on open `PushPrompt` shows a dismissible banner (snoozed 14 days) whose Turn on button asks, when permission has never been asked; the profile menu's Daily reminders switch turns pushes on and off later. Subscribing saves the subscription with its IANA time zone through `app/push/actions.ts` (`save_push_subscription` RPC), re-saving when the zone changes. Every hour pg_cron calls the `daily-push` Edge Function (`supabase/functions/daily-push`). `private.claim_due_pushes()` picks, in each subscription's time zone, a morning push (once per problem set, 08:00–11:59 local, mentioning a leaderboard drop since the last one) or an evening reminder (once per set, only when both problems aren't solved, at 19:00 local or 2 hours before the set changes, with a streak warning when nothing is solved yet). It marks each push sent, so extra calls send nothing. Expired subscriptions are deleted. On mobile, `InstallPrompt` shows a dismissible banner under the header (snoozed 14 days in `localStorage`): Chromium browsers get an Install button that opens the saved `beforeinstallprompt` dialog, and iOS gets Share → Add to Home Screen instructions, since iOS has no install API and only allows web push for installed apps. The VAPID private key is an Edge Function secret; the Next app has only `NEXT_PUBLIC_VAPID_PUBLIC_KEY`.
8. **Leaderboard.** `app/(app)/leaderboard/page.tsx` calls `getLeaderboard()`, which uses the `leaderboard` RPC to get the top 20 players plus the current user's row. Players are ranked by all-time problems solved, then fewer wrong attempts, then who reached that total first. `public.results` holds one row per user, UTC day and mode. RLS lets users write only today's row, which caps the score at 2 points a day, and read only their own rows. Other players' names and totals come only from the `security definer` `leaderboard` function.

## Structure

```
app/
  layout.tsx        Figtree font (--font-figtree), metadata, body shell
  (app)/            Signed-in pages. layout.tsx holds SiteHeader and the footer, so they persist across navigation
    (home)/         page.tsx (headline, 2-col card grid) and loading.tsx; the group scopes the skeleton to /
    leaderboard/    Leaderboard page (all-time and monthly tabs) and loading.tsx
  actions.ts        "use server": checkAnswer
  manifest.ts       Web app manifest (/manifest.webmanifest); apple-icon.png is the iOS home-screen icon
  (auth)/           Signed-out pages sharing one layout and loading.tsx: login, signup
  auth/             actions.ts (signIn, signUp, signOut)
  push/             actions.ts (subscribeToDailyPush, unsubscribeFromDailyPush)
  globals.css       Design tokens (@theme) plus their dark values, the only place colors and sizes are defined
components/
  ui/               Design-system primitives: Logo, Card/CardHeader, Button, TextInput, PlayButton, Skeleton, icons
  problem/          Feature components: ReadCard (server), ListenCard (client), AnswerForm (client), NextProblems (client countdown), StreakStatus, HomeIntro and card skeletons
  auth/             AuthForm (client), AuthFormSkeleton (client), UserMenu (streams the user in), ProfileMenu (client dropdown: leaderboard, daily reminders, sign out)
  leaderboard/      LeaderboardIntro, PeriodTabs (client), LeaderboardSkeleton, MonthReset (client, monthly reset time in the viewer's time zone)
  layout/           SiteHeader (logo, profile menu)
  pwa/              ServiceWorkerRegistration (client, production only), OfflineBanner, useDailyPush (shared push state), PushPrompt (reminders banner), InstallPrompt (mobile install banner)
lib/
  problems.ts       Problem banks and daily selection (server-only)
  answer.ts         Numeric parsing and comparison (shared, pure)
  leaderboard.ts    recordAttempt, getSolvedToday, getStreak and getLeaderboard (server-only)
  push.ts           Push subscription save/delete (server-only)
  display-name.ts   Display-name length limits (shared)
  supabase/         env, server client, proxy session refresh, getCurrentUser/requireUser (server-only)
supabase/
  migrations/       SQL applied to the Supabase project: profiles, results, RPCs, push subscriptions and cron
  functions/        Deno Edge Functions (excluded from tsc and ESLint): daily-push
public/
  sw.js             Service worker: offline fallback for navigations, cache-first for /_next/static and icons
  offline.html      Self-contained offline page (inline styles copy the tokens)
  launch.html       Self-contained launch screen (the manifest's start_url), redirects to /
  icons/            Manifest icons (192, 512), also used as maskable
proxy.ts            Next 16 proxy (formerly middleware): session refresh and sign-in redirect
ss-mocks/           Design mocks; main-design.png is the source of truth
DESIGN_SYSTEM.md    Tokens, type scale, spacing, component specs
```

## Constraints and conventions

- **Follow the mock and `DESIGN_SYSTEM.md`.** Style with token-backed Tailwind utilities such as `bg-canvas`, `text-ink`, `text-title`, `rounded-card` and `h-control`. Add any new color or size to `@theme` in `app/globals.css` first. Don't hard-code hex values in components.
- Desktop values apply at `md` and above. Below `md` the cards stack and the type scales down (see the mobile column in `DESIGN_SYSTEM.md`). Layouts must work at 390px wide with no horizontal scroll.
- Light and dark themes follow the device setting (`prefers-color-scheme`); there is no in-app toggle. Dark values live in the `:root` block under `@theme` in `app/globals.css`. A new color token needs both values, and components should use tokens rather than `dark:` variants. Keep the copies in `public/launch.html` and `public/offline.html` in step.
- **Never send answers to the client.** Keep `lib/problems.ts` behind `import "server-only"`, and import only its *types* (`import type`) from client components. Check answers only in `checkAnswer`.
- **Auth checks run on the server with `getClaims()`, never `getSession()`.** Gate new pages with `requireUser()` and new Server Actions with `getCurrentUser()`. To make a page public, add it to `isPublicPath` in `lib/supabase/proxy.ts`. Supabase settings live in `.env.local` (see `.env.example`), and only the publishable key belongs there.
- **Database changes go in a new file in `supabase/migrations/`.** Enable RLS on every table and wrap `auth.uid()` in `(select …)` in policies. Don't widen read access to `results` or `profiles`; expose other users' data only through aggregate functions like `leaderboard`.
- Every problem needs a single numeric answer. `unit` is optional and is used only in the success message (`"%"` attaches without a space).
- Listen problems are spoken aloud. Keep them short and easy to do as mental math, and avoid symbols or notation that TTS reads badly.
- Problem ids must be unique across both banks, because `findProblem` searches both. Changing a bank's length reshuffles which problem falls on which day.
- Prefer Server Components. Add `"use client"` only for state, effects or browser APIs, as in `AnswerForm` and `ListenCard`.
- Accessibility: inputs need `aria-label`s (the design has no visible labels), feedback uses `aria-live="polite"`, and focus outlines must stay visible.
- **Loading states.** Each signed-in route has a `loading.tsx` that reuses the page's static parts (headline, card headers, tabs) and swaps only data for `Skeleton`s, plus a `LoadingStatus` for screen readers. Keep skeletons in step with the layout they stand in for. Don't put blocking data in `app/(app)/layout.tsx`; it would hold up every navigation. Stream it in `<Suspense>` as `UserMenu` does.
- **PWA.** The service worker must never cache HTML, RSC payloads or Server Action responses: pages are per-user and per-day. Bump `VERSION` in `public/sw.js` when its precached files change. PWA files (`manifest.webmanifest`, `sw.js`, `offline.html`, `launch.html`, icons) must load without a session, so keep them out of the `proxy.ts` matcher.
- Before finishing, run `npx tsc --noEmit`, `npm run lint` and `npm run build`.
