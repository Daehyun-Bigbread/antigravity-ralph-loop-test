# PRD — Static Landing Page (Ralph Loop Test)

## Goal
Build a single-page, dependency-free **static website** (`index.html` + CSS + minimal JS)
that demonstrates a polished, non-template landing page. No frameworks, no build step —
it must open correctly by double-clicking `index.html`.

This file is the single source of truth. The agent reads it every iteration.

## Agent Operating Rules (Ralph Loop)
- Complete **exactly ONE unchecked task** per iteration (the lowest-numbered `[ ]`).
- After finishing, mark it `[x]` here, then **append** a line to `progress.txt`
  (format: `TASK <n> DONE — <one-line summary>`). Never delete progress history.
- Commit the changes for that single task with message `feat: task <n> — <summary>`.
- Verify each task against its **Done when** criteria before marking complete.
- Do NOT start the next task in the same iteration. Stop after one.
- If all tasks are `[x]`, append `ALL TASKS COMPLETE` to `progress.txt` and stop.

## Design Direction (do NOT produce a generic template)
Style: **Editorial / Swiss** — confident type, generous asymmetric whitespace, one accent.
Not dark-mode by default; warm-paper light theme.

### Palette (define as CSS custom properties, use oklch)
- `--color-surface: oklch(97% 0.01 90)`  (warm paper)
- `--color-text: oklch(22% 0.02 60)`     (near-black ink)
- `--color-muted: oklch(52% 0.02 60)`
- `--color-accent: oklch(62% 0.19 25)`   (vermilion)
- `--color-line: oklch(88% 0.01 90)`

### Typography (max two families, `font-display: swap`)
- Display/headings: a serif (e.g. "Fraunces" or system serif fallback) — high scale contrast.
- Body/UI: a grotesque sans (e.g. "Inter" or system-ui).
- Use `clamp()` for a fluid type scale; hero should be dramatically larger than body.

### Non-negotiables
- Semantic HTML: `<header><nav><main><section><footer>`, one `<h1>`.
- Animate only `transform` / `opacity`. No layout-property animation.
- Respect `prefers-reduced-motion`.
- Design tokens centralized — no repeated hardcoded colors/spacing.

## Target Structure
```
index.html
styles/tokens.css
styles/global.css
styles/typography.css
scripts/main.js
```

## Tasks
- [x] 1. Create `index.html` skeleton: semantic `<header><main><footer>`, `<meta viewport>`,
      lang attr, and `<link>`s to the three CSS files + `<script defer>` to `scripts/main.js`.
      **Done when:** page opens with valid structure and no console errors (empty sections OK).
- [x] 2. Create `styles/tokens.css` with the full palette + a fluid type scale + spacing tokens
      as `:root` custom properties (use the values above).
      **Done when:** tokens exist and index.html links it.
- [x] 3. Create `styles/global.css`: modern reset, `box-sizing`, base `body` using surface/text
      tokens, sensible container max-width, and `prefers-reduced-motion` guard.
      **Done when:** page renders with warm-paper background and ink text.
- [x] 4. Create `styles/typography.css`: load two web fonts with `font-display: swap`, wire the
      clamp() type scale to headings/body, real display-vs-body pairing.
      **Done when:** headings use the serif, body uses the sans, sizes are fluid.
- [x] 5. Build the `<header>` with `<nav aria-label="Main navigation">`: brand mark + 3 links,
      designed hover/focus states.
      **Done when:** nav is keyboard-focusable with visible focus rings.
- [x] 6. Build the hero `<section aria-labelledby="hero-heading">`: oversized `<h1 id="hero-heading">`,
      supporting paragraph, primary + ghost CTA. Asymmetric editorial layout, not centered-generic.
      **Done when:** hero has clear scale contrast and two working CTAs.
- [x] 7. Build a features/bento `<section>`: 3–4 cards with intentional rhythm (not uniform grid),
      hover elevation via transform only.
      **Done when:** cards show hierarchy + designed hover, no layout-prop animation.
- [x] 8. Build the `<footer>`: contact/links, fine top border using `--color-line`.
      **Done when:** footer is present and styled with tokens.
- [x] 9. Responsive pass at 320 / 375 / 768 / 1024 / 1440: no horizontal overflow, readable line
      lengths, nav adapts on small screens.
      **Done when:** no overflow at any listed width.
- [x] 10. `scripts/main.js`: one tasteful entrance reveal (opacity/transform) via IntersectionObserver,
      fully disabled under `prefers-reduced-motion`.
      **Done when:** sections fade/rise in once; reduced-motion shows them instantly.
- [x] 11. Accessibility + polish pass: check color contrast (AA), all interactive elements have
      focus states, images (if any) have alt text, headings are ordered.
      **Done when:** no obvious a11y violations; keyboard nav works end to end.

## Definition of Done (whole project)
All 11 tasks `[x]`, site opens from `index.html` with no console errors, looks intentional
(not a default template), and is keyboard-accessible at all target breakpoints.
