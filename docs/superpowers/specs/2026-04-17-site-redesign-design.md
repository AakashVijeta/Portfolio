# aakashvijeta.me Full Redesign — Design Spec
**Date:** 2026-04-17  
**Status:** Approved

---

## Overview

Complete visual redesign of aakashvijeta.me. Keeps the Particle Portrait and dual-theme system. Replaces the current layout and animations with a cinematic full-screen architecture and two distinct, high-fidelity theme identities: **F1 Carbon Speed** and **Terminal CRT**.

---

## 1. Architecture

Single-page React app (existing stack). Five full-screen sections stacked vertically, each `height: 100dvh`.

**Scroll interception:** One scroll gesture or swipe = one section advance. Native scroll is disabled; a `SectionManager` component owns the active section index, drives all transitions, and exposes a context to children.

**Theme system:** `data-theme="f1" | "terminal"` attribute on `<html>`. All colors defined as CSS custom properties scoped to each theme value. Toggle swaps the attribute — no JS repaints, pure CSS cascade.

**Animation library:** GSAP core + ScrollTrigger + CustomEase (~35KB gzipped). CSS owns static theme properties; GSAP owns all motion.

---

## 2. Sections

| # | Name | Route key |
|---|------|-----------|
| 1 | Intro | `/` |
| 2 | Projects | `/projects` |
| 3 | About | `/about` |
| 4 | Contact | `/contact` |
| 5 | Credits | `/credits` |

### 2.1 Intro
- Particle Portrait centered, full viewport
- Name typed in below via Typist (kept)
- Section counter `01/05` top-right
- Key hints (`↑↓ navigate · T toggle mode`) fade in after 3s idle, fade out on first interaction
- No other UI elements

### 2.2 Projects
- Desktop: 2-column card grid. Mobile: single column
- Each card: full-bleed project screenshot, title, tag line
- Hover: card lifts with accent-color glow shadow
- Click: full-screen overlay with description, tech stack, links

### 2.3 About
- Desktop: two-column split — Particle Portrait (~30vw) pinned left, content right
- Mobile: stacked, portrait on top
- Right column: bio text typed in terminal style (Terminal mode) / clean bold serif (F1 mode)
- Skills rendered as a tag cloud

### 2.4 Contact
- Email address large and centered
- Click email: copy to clipboard
- GitHub and social links below
- Terminal mode: shell prompt aesthetic
- F1 mode: team radio frequency display aesthetic

### 2.5 Credits
- Existing content restyled to match new theme system

---

## 3. Navigation

**Keyboard / scroll only — no visible navbar.**

- Scroll wheel or swipe up/down: advance/retreat one section
- Arrow keys (↑↓): same
- `T` key: toggle theme
- Section counter `01/05` pinned top-right (hidden on mobile)
- Key hints fade in after 3s idle, fade out on first interaction (hidden on mobile)
- GSAP Observer used for swipe detection — replaces Bootstrap collapse nav entirely

---

## 4. Transitions

### F1 Mode — Red Wipe
A `<div>` fixed over the viewport with `clip-path: inset(0 100% 0 0)`.

1. Animate clip to `inset(0 0% 0 0)` — wipe in (~180ms, CustomEase "power3.in")
2. Swap active section
3. Animate clip to `inset(0 0 0 100%)` — wipe out (~180ms, power3.out)

Total: ~360ms.

### Terminal Mode — Glitch Cut
1. RGB channel split on outgoing section: 3 stacked clones offset ±4px (80ms)
2. Two random horizontal slice bands displace (60ms)
3. Hard cut — new section renders
4. Scanline flash: green overlay, 40ms fade

Total: ~200ms.

### Section Entrance Animations (after transition)
- Text elements: `gsap.from({ y: 20, opacity: 0 }, { stagger: 0.08 })`
- Particle Portrait: fade in independently on Intro
- Project cards: stagger from bottom on Projects section

### Reduced Motion
`prefers-reduced-motion` check:
- F1 wipe → instant cut
- Glitch cut → skipped entirely
- Stagger delay → 0

---

## 5. Mobile & Performance

### Bug Fixes (existing)
- `ParticlePortrait` touchmove: add `{ passive: true }` — unblocks scroll on mobile
- Remove `scroll-behavior: smooth` from `html` — GSAP owns all scroll
- Add `overscroll-behavior: none` on `body` — eliminates iOS bounce
- GSAP Observer replaces Bootstrap collapse nav

### Performance
- Particle Portrait canvas capped at 30fps on mobile via `gsap.ticker.fps(30)`
- `blur(100px)` on `.intro-simulation::before` stays disabled on mobile (already in place)
- Glitch cut replaced with 150ms fast fade on mobile (too GPU-intensive)
- GSAP ticker pauses on `visibilitychange` when tab is hidden

---

## 6. Typography & Color System

### F1 Mode — Carbon Speed

**Fonts:**
- Display: **Barlow Condensed** 700, uppercase — names, section headers
- Body: **DM Sans** — readable, geometric
- Telemetry readouts: system monospace only

**Colors:**
```
--color-bg:       #0a0a0a
--color-surface:  #111111
--color-accent:   #e10600
--color-text:     #ffffff
--color-muted:    #444444
--color-border:   #1e1e1e
```

**Textures:**
- Carbon fiber: CSS `repeating-linear-gradient(45deg, ...)` — no image asset
- Corner/edge accents: `::before` / `::after` pseudo-elements in `--color-accent`
- Speed lines: `linear-gradient(to right, #e10600, transparent)`

---

### Terminal Mode — Classic CRT

**Fonts:**
- Display + body: **Share Tech Mono** — phosphor-era monospace, no secondary font

**Colors:**
```
--color-bg:       #050905
--color-surface:  #070d07
--color-accent:   #00ff41
--color-text:     #00ff41
--color-muted:    #005a15
--color-border:   #002208
```

**Textures:**
- Scanlines: `repeating-linear-gradient(0deg, transparent 2px, rgba(0,0,0,0.15) 4px)`
- CRT vignette: `radial-gradient` on a fixed `::after` overlay on `body`
- Phosphor glow: `text-shadow: 0 0 8px rgba(0,255,65,0.5)` on key text

---

## 7. Out of Scope

- Backend changes
- New projects content (cards use existing project data)
- SEO / meta changes
- Any section not listed above
