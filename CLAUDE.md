# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # dev server at http://localhost:3000
npm run build    # production build
npm run lint     # ESLint (flat config, eslint.config.mjs)
```

No test runner is configured yet.

## Stack

- **Next.js 16.2.6** with App Router — `src/app/`
- **React 19.2.4**
- **TypeScript 5**
- **Tailwind CSS 4** (PostCSS via `@tailwindcss/postcss`)

## Architecture

App Router conventions live under `src/app/`. Routes are folders; `layout.tsx` wraps children, `page.tsx` renders the leaf. Components default to Server Components — add `"use client"` only when browser APIs or React hooks are needed.

## Important: read docs before coding

Next.js 16 and Tailwind 4 have breaking changes vs prior versions. Before writing any code that touches routing, data fetching, or styling primitives, read the relevant guide:

- Next.js: `node_modules/next/dist/docs/`
- Tailwind: `node_modules/tailwindcss/` (check changelog/migration guide)

ESLint uses the flat config format (ESLint 9) — `eslint.config.mjs`, not `.eslintrc`.
