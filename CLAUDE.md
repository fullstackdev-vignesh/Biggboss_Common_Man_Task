# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A single-page "Bigg Boss Season 10 — Task" interactive experience: splash → registration → spin-the-wheel challenge → coin flip → entry coupon. Built with Lovable (see `AGENTS.md` — avoid rewriting published git history on the connected branch; commits pushed here sync back into the Lovable editor).

## Commands

- `npm run dev` — start dev server (Vite)
- `npm run build` — production build
- `npm run build:dev` — development-mode build
- `npm run preview` — preview a production build
- `npm run lint` — ESLint over the whole project
- `npm run format` — Prettier write

No test suite is configured.

## Architecture

- **Stack**: TanStack Start (file-based routing) + TanStack Router + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui (Radix primitives) + Framer Motion.
- **Routing**: file-based under `src/routes/`. See `src/routes/README.md` for conventions (`$id` dynamic segments, `{-$category}` optional, `$` splat, `_layout.tsx`, `__root.tsx` app shell). `src/routeTree.gen.ts` is auto-generated — never edit by hand. Currently the app is effectively a single route (`src/routes/index.tsx`) that renders the whole experience as client-side stage machine rather than separate routes.
- **State machine**: `src/hooks/useExperience.tsx` (`ExperienceProvider`/`useExperience`) drives the entire flow via a `Stage` enum (`"splash" | "registration" | "wheel" | "coin"`) held in React context. `Participant` is persisted to `sessionStorage` (key `bb-common-man-participant`) so a refresh mid-flow restores name/phone. `src/routes/index.tsx` reads this context and swaps screens with `AnimatePresence`/`PageTransition`.
- **Screens** (`src/components/`): `SplashScreen` → `RegistrationScreen` → `WheelScreen` (uses `SpinWheel`, `ChallengeModal`, challenge data from `src/data/challenges.ts`) → `CoinScreen` (uses `CoinFlip`, `EntryCoupon`, coupon codes from `src/lib/coupon.ts`). `ParticipantBadge` overlays once registered. A "task closed" failure overlay in `routes/index.tsx` resets the whole experience after a timeout.
- **Types**: `src/types/index.ts` defines `Stage`, `Participant`, `ChallengeCategory`, `SpinResult`, `CoinFace` — shared across screens and the experience hook.
- **Assets**: branded artwork is not imported directly; it's referenced through `*.asset.json` files in `src/assets/` (Lovable's asset pipeline) and re-exported as plain URLs via `src/lib/assets.ts` (`ASSETS.eye`, `ASSETS.logo`, `ASSETS.registrationArt`). Swap artwork by editing the `.asset.json` files, not by adding new imports elsewhere.
- **Coupon generation**: `src/lib/coupon.ts` generates human-friendly codes (`BB-CM-XXXXXX`) client-side via `crypto.getRandomValues` (falls back to `Math.random`). `sendCouponToPhone` is a stub — no SMS provider wired yet.
- **Error reporting**: `src/lib/error-capture.ts`, `error-page.ts`, `lovable-error-reporting.ts` integrate with Lovable's error tracking; leave these as-is unless specifically asked to change error handling.
- **ui/ primitives**: `src/components/ui/*` are shadcn/ui-generated components (Radix + `class-variance-authority` + `tailwind-merge`). Treat these as generated/vendored — prefer composing them over editing internals.

## Conventions

- Path alias `@/*` maps to `src/*` (see `tsconfig.json`).
- `@typescript-eslint/no-unused-vars` is disabled project-wide; ESLint runs through `eslint-plugin-prettier`, so `npm run lint` also enforces Prettier formatting.
- Do not import the `server-only` package (Next.js convention) — TanStack Start uses `*.server.ts` filenames or `@tanstack/react-start/server-only` instead (enforced by ESLint `no-restricted-imports`).
