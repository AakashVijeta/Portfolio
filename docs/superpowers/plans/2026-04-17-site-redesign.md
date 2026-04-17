# Site Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completely redesign aakashvijeta.me with a cinematic full-screen section layout, F1 Carbon Speed and Terminal CRT dual themes, GSAP-powered transitions (red wipe for F1, glitch cut for Terminal), keyboard/scroll-only navigation, and a new Contact section.

**Architecture:** Five full-screen sections managed by a `SectionManager` that intercepts scroll/swipe/keyboard and drives GSAP transitions. Theme is controlled by `data-theme="f1"|"terminal"` on `<html>` with CSS custom properties. All motion is owned by GSAP; CSS owns static appearance.

**Tech Stack:** React 19, Vite, GSAP (core + Observer + CustomEase), Google Fonts (Barlow Condensed, DM Sans, Share Tech Mono), existing react-typist-component. Bootstrap and MUI NavBar usages removed.

---

## File Map

### Create
| File | Responsibility |
|------|---------------|
| `src/context/SectionContext.jsx` | Active section index + `isTransitioning` state, shared via context |
| `src/hooks/useSectionManager.js` | Scroll interception logic: Observer, keyboard, trackpad accumulator, transition lock |
| `src/components/SectionManager.jsx` | Mounts `useSectionManager`, renders transition overlays + all sections |
| `src/components/WipeTransition.jsx` | F1 red wipe overlay driven by GSAP clip-path |
| `src/components/GlitchTransition.jsx` | Terminal glitch cut: RGB clone split + slice bands + scanline flash |
| `src/components/SectionCounter.jsx` | `01/05` counter pinned top-right, hidden on mobile |
| `src/components/KeyHints.jsx` | Fade-in key hints after 3s idle, hidden on mobile |
| `src/components/sections/IntroSection.jsx` | Full-screen intro: ParticlePortrait + Typist |
| `src/components/sections/ProjectsSection.jsx` | Full-screen projects: 2-col card grid, hover glow, opens ProjectOverlay |
| `src/components/sections/AboutSection.jsx` | Full-screen about: split portrait + bio + skills |
| `src/components/sections/ContactSection.jsx` | Full-screen contact: email copy + social links |
| `src/components/sections/CreditsSection.jsx` | Restyled credits |
| `src/components/ProjectOverlay.jsx` | Full-screen overlay for project detail (replaces hash routing + ProjectDetail) |
| `src/styles/themes.css` | All CSS custom properties for both themes + textures + fonts |
| `src/styles/sections.css` | Shared section layout rules (height, centering, entrance animation classes) |

### Modify
| File | What changes |
|------|-------------|
| `package.json` | Add `gsap` dependency |
| `src/index.css` | Google Fonts `@import`, remove `scroll-behavior: smooth`, add `overscroll-behavior: none` |
| `src/main.jsx` | Remove bootstrap import, import `themes.css` and `sections.css` |
| `src/App.jsx` | Replace entire layout with `<SectionManager>` + `<ProjectOverlay>` |
| `src/styles/Global.css` | Update `:root` and `[data-theme="f1"]` variables to match new palette |
| `src/components/ParticlePortrait.jsx` | Add `{ passive: true }` to touchmove; add mobile fps throttle in render loop |
| `src/components/ThemeToggle.jsx` | Remove visual nav positioning; keep toggle logic (SectionManager binds `T` key) |

### Delete (after their replacements are wired in App.jsx)
`src/components/NavBar.jsx`, `src/styles/NavBar.css`, `src/components/FadeInSection.jsx`, `src/components/RevealTitle.jsx`, `src/styles/RevealTitle.css`, `src/components/PageTransition.jsx`, `src/styles/PageTransition.css`, `src/components/ThemeTransition.jsx`, `src/components/Intro.jsx`, `src/styles/Intro.css`, `src/components/Projects.jsx`, `src/styles/Projects.css`, `src/components/ProjectDetail.jsx`, `src/styles/ProjectDetail.css`, `src/components/about.jsx`, `src/styles/About.css`, `src/components/Credits.jsx`, `src/styles/Credits.css`

---

## Task 1: Install GSAP and Add Google Fonts

**Files:**
- Modify: `package.json`
- Modify: `src/index.css`

- [ ] **Step 1: Install GSAP**

```bash
cd D:/aakash
npm install gsap
```

Expected output: `added 1 package` (gsap ~3.12.x)

- [ ] **Step 2: Add Google Fonts and reset scroll in `src/index.css`**

Replace the entire contents of `src/index.css` with:

```css
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700&family=DM+Sans:wght@400;500;600&family=Share+Tech+Mono&display=swap');

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  /* GSAP owns all scroll — no native smooth scroll */
  scroll-behavior: auto;
}

body {
  overscroll-behavior: none;
  overflow: hidden; /* SectionManager controls what's visible */
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 3: Verify dev server starts**

```bash
npm run dev
```

Expected: Vite dev server at http://localhost:5173 with no errors in terminal.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/index.css
git commit -m "feat: install gsap, add google fonts, reset scroll"
```

---

## Task 2: New CSS Theme System

**Files:**
- Create: `src/styles/themes.css`
- Create: `src/styles/sections.css`
- Modify: `src/styles/Global.css`

- [ ] **Step 1: Create `src/styles/themes.css`**

```css
/* ── Terminal CRT (default) ─────────────────────────────────── */
:root {
  --color-bg:       #050905;
  --color-surface:  #070d07;
  --color-accent:   #00ff41;
  --color-text:     #00ff41;
  --color-muted:    #005a15;
  --color-border:   #002208;
  --color-white:    #e8ffe8;

  --font-display: 'Share Tech Mono', monospace;
  --font-body:    'Share Tech Mono', monospace;

  --glow: 0 0 8px rgba(0, 255, 65, 0.5);
  --glow-strong: 0 0 16px rgba(0, 255, 65, 0.35), 0 0 32px rgba(0, 255, 65, 0.15);
}

/* ── F1 Carbon Speed ────────────────────────────────────────── */
[data-theme="f1"] {
  --color-bg:       #0a0a0a;
  --color-surface:  #111111;
  --color-accent:   #e10600;
  --color-text:     #ffffff;
  --color-muted:    #444444;
  --color-border:   #1e1e1e;
  --color-white:    #ffffff;

  --font-display: 'Barlow Condensed', sans-serif;
  --font-body:    'DM Sans', sans-serif;

  --glow: 0 0 8px rgba(225, 6, 0, 0.5);
  --glow-strong: 0 0 16px rgba(225, 6, 0, 0.4), 0 0 32px rgba(225, 6, 0, 0.2);
}

/* ── Terminal: scanlines + CRT vignette overlays ─────────────── */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.15) 2px,
    rgba(0, 0, 0, 0.15) 4px
  );
  pointer-events: none;
  z-index: 9998;
  opacity: 1;
  transition: opacity 0.4s;
}

[data-theme="f1"] body::before {
  opacity: 0;
}

body::after {
  content: '';
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 55%, rgba(0, 0, 0, 0.55) 100%);
  pointer-events: none;
  z-index: 9997;
  opacity: 1;
  transition: opacity 0.4s;
}

[data-theme="f1"] body::after {
  opacity: 0;
}

/* ── F1: carbon fiber background ─────────────────────────────── */
[data-theme="f1"] .App {
  background-color: var(--color-bg);
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 4px,
    rgba(255, 255, 255, 0.015) 4px,
    rgba(255, 255, 255, 0.015) 5px
  );
}

/* ── Terminal: subtle character-grid background ───────────────── */
:root .App {
  background-color: var(--color-bg);
}

/* ── F1: left red stripe on sections ─────────────────────────── */
[data-theme="f1"] .section-stripe::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: var(--color-accent);
  pointer-events: none;
}

/* ── Reduced motion ──────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
}
```

- [ ] **Step 2: Create `src/styles/sections.css`**

```css
/* Each section is exactly one viewport tall */
.section {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: var(--color-bg);
  font-family: var(--font-body);
  color: var(--color-text);
}

/* Entrance animation utility classes — applied by GSAP after transition */
.section-enter-item {
  opacity: 0;
  transform: translateY(20px);
}
```

- [ ] **Step 3: Update `:root` and `[data-theme="f1"]` in `src/styles/Global.css`**

Find the existing `:root` block (line 87) and `[data-theme="f1"]` block (line 108). Replace them with:

```css
:root {
  /* Legacy aliases — kept for any old components during migration */
  --navy: #050905;
  --accent: #00ff41;
  --accent-glow: rgba(0, 255, 65, 0.4);
}

[data-theme="f1"] {
  --navy: #0a0a0a;
  --accent: #e10600;
  --accent-glow: rgba(225, 6, 0, 0.5);
}
```

Leave all other rules in Global.css as-is for now — old components still reference them and will be deleted section by section.

- [ ] **Step 4: Import new stylesheets in `src/main.jsx`**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/themes.css'
import './styles/sections.css'
import './styles/Global.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 5: Verify dev server still loads (no CSS errors)**

```bash
npm run dev
```

Open http://localhost:5173. The page should load (may look broken since we haven't wired sections yet — that's expected).

- [ ] **Step 6: Commit**

```bash
git add src/styles/themes.css src/styles/sections.css src/styles/Global.css src/main.jsx
git commit -m "feat: new theme CSS system, scanlines, carbon fiber, font variables"
```

---

## Task 3: SectionContext

**Files:**
- Create: `src/context/SectionContext.jsx`

- [ ] **Step 1: Create `src/context/SectionContext.jsx`**

```jsx
import { createContext, useContext, useState, useCallback } from 'react';

const SectionContext = createContext(null);

export const SECTIONS = ['intro', 'projects', 'about', 'contact', 'credits'];

export function SectionProvider({ children }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [overlayProject, setOverlayProject] = useState(null);

  const goTo = useCallback((index) => {
    if (index < 0 || index >= SECTIONS.length) return;
    setActiveIndex(index);
  }, []);

  return (
    <SectionContext.Provider value={{
      activeIndex,
      isTransitioning,
      setIsTransitioning,
      overlayProject,
      setOverlayProject,
      goTo,
      total: SECTIONS.length,
    }}>
      {children}
    </SectionContext.Provider>
  );
}

export function useSectionContext() {
  const ctx = useContext(SectionContext);
  if (!ctx) throw new Error('useSectionContext must be used within SectionProvider');
  return ctx;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/context/SectionContext.jsx
git commit -m "feat: SectionContext with activeIndex and transition lock"
```

---

## Task 4: useSectionManager Hook

**Files:**
- Create: `src/hooks/useSectionManager.js`

- [ ] **Step 1: Create `src/hooks/useSectionManager.js`**

```js
import { useEffect, useRef } from 'react';
import { Observer } from 'gsap/Observer';
import gsap from 'gsap';
import { SECTIONS } from '../context/SectionContext';

gsap.registerPlugin(Observer);

const WHEEL_THRESHOLD = 80;   // px accumulated before advancing
const SWIPE_THRESHOLD = 50;   // px minimum swipe travel
const isMobile = () => window.innerWidth <= 768;

export function useSectionManager({ activeIndex, isTransitioning, advance }) {
  const wheelAccRef = useRef(0);
  const observerRef = useRef(null);

  useEffect(() => {
    const onWheel = (e) => {
      if (isTransitioning) return;
      wheelAccRef.current += e.deltaY;
      if (Math.abs(wheelAccRef.current) >= WHEEL_THRESHOLD) {
        const dir = wheelAccRef.current > 0 ? 1 : -1;
        wheelAccRef.current = 0;
        advance(dir);
      }
    };

    const onKey = (e) => {
      if (isTransitioning) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') advance(1);
      if (e.key === 'ArrowUp' || e.key === 'PageUp') advance(-1);
      if (e.key === 't' || e.key === 'T') {
        const current = document.documentElement.getAttribute('data-theme');
        document.documentElement.setAttribute(
          'data-theme',
          current === 'f1' ? 'terminal' : 'f1'
        );
      }
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('keydown', onKey);

    // GSAP Observer for touch/swipe
    observerRef.current = Observer.create({
      type: 'touch',
      onDown: () => { if (!isTransitioning) advance(1); },
      onUp:   () => { if (!isTransitioning) advance(-1); },
      minimumMovement: SWIPE_THRESHOLD,
      preventDefault: true,
    });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      observerRef.current?.kill();
    };
  }, [isTransitioning, advance]);

  // Reset wheel accumulator on section change
  useEffect(() => {
    wheelAccRef.current = 0;
  }, [activeIndex]);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useSectionManager.js
git commit -m "feat: useSectionManager with trackpad accumulator, swipe, keyboard"
```

---

## Task 5: WipeTransition Component (F1)

**Files:**
- Create: `src/components/WipeTransition.jsx`

- [ ] **Step 1: Create `src/components/WipeTransition.jsx`**

```jsx
import { forwardRef, useImperativeHandle, useRef } from 'react';
import gsap from 'gsap';
import CustomEase from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);
CustomEase.create('wipeIn',  'M0,0 C0.76,0 0.24,1 1,1');
CustomEase.create('wipeOut', 'M0,0 C0.76,0 0.24,1 1,1');

// play() returns a Promise that resolves when the wipe is at mid-point (section swap moment)
// and resolves fully when the wipe has retracted.
const WipeTransition = forwardRef(function WipeTransition(_, ref) {
  const divRef = useRef(null);

  useImperativeHandle(ref, () => ({
    play() {
      const el = divRef.current;
      return new Promise((resolve) => {
        // Wipe in: reveal covers screen from left
        gsap.fromTo(el,
          { clipPath: 'inset(0 100% 0 0)', display: 'block' },
          {
            clipPath: 'inset(0 0% 0 0)',
            duration: 0.18,
            ease: 'wipeIn',
            onComplete: () => {
              resolve(); // caller swaps section NOW
              // Wipe out: cover retracts to right
              gsap.to(el, {
                clipPath: 'inset(0 0 0 100%)',
                duration: 0.18,
                ease: 'wipeOut',
                onComplete: () => {
                  gsap.set(el, { display: 'none' });
                },
              });
            },
          }
        );
      });
    }
  }));

  return (
    <div
      ref={divRef}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#e10600',
        zIndex: 9999,
        display: 'none',
        pointerEvents: 'none',
      }}
    />
  );
});

export default WipeTransition;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/WipeTransition.jsx
git commit -m "feat: WipeTransition GSAP clip-path wipe for F1 mode"
```

---

## Task 6: GlitchTransition Component (Terminal)

**Files:**
- Create: `src/components/GlitchTransition.jsx`

- [ ] **Step 1: Create `src/components/GlitchTransition.jsx`**

```jsx
import { forwardRef, useImperativeHandle, useRef } from 'react';
import gsap from 'gsap';

// Creates a glitch-cut effect: RGB split + slice bands + scanline flash, then resolves.
// Caller swaps section when promise resolves (at the hard-cut moment).
const GlitchTransition = forwardRef(function GlitchTransition(_, ref) {
  const containerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    play() {
      const container = containerRef.current;

      return new Promise((resolve) => {
        // 1. Snapshot current viewport via screenshot-like div clones with CSS offsets
        const red   = container.querySelector('.glitch-r');
        const blue  = container.querySelector('.glitch-b');
        const s1    = container.querySelector('.glitch-s1');
        const s2    = container.querySelector('.glitch-s2');
        const flash = container.querySelector('.glitch-flash');

        gsap.set(container, { display: 'block' });

        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(container, { display: 'none' });
            gsap.set([red, blue, s1, s2, flash], { clearProps: 'all' });
          }
        });

        // RGB channel split (80ms)
        tl.to(red,  { x:  4, opacity: 0.5, duration: 0.04, ease: 'none' })
          .to(blue, { x: -4, opacity: 0.5, duration: 0.04, ease: 'none' }, '<')
          // Random slice bands
          .to(s1, {
            scaleY: 1,
            y: `${20 + Math.random() * 40}%`,
            duration: 0.06,
            ease: 'none',
          })
          .to(s2, {
            scaleY: 1,
            y: `${50 + Math.random() * 30}%`,
            duration: 0.06,
            ease: 'none',
          }, '<')
          // Hard cut moment — caller swaps section
          .call(resolve)
          // Scanline flash
          .to(flash, { opacity: 0.6, duration: 0.02, ease: 'none' })
          .to(flash, { opacity: 0, duration: 0.04, ease: 'none' })
          // Retract RGB split
          .to(red,  { x: 0, opacity: 0, duration: 0.04, ease: 'none' }, '<')
          .to(blue, { x: 0, opacity: 0, duration: 0.04, ease: 'none' }, '<')
          .to([s1, s2], { scaleY: 0, duration: 0.02 }, '<');
      });
    }
  }));

  return (
    <div
      ref={containerRef}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'none', pointerEvents: 'none' }}
    >
      {/* Red channel ghost */}
      <div className="glitch-r" style={{
        position: 'absolute', inset: 0,
        background: 'rgba(255,0,0,0)', mixBlendMode: 'screen',
        outline: '9999px solid rgba(255,40,40,0)',
      }} />
      {/* Blue channel ghost */}
      <div className="glitch-b" style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,255,0)', mixBlendMode: 'screen',
        outline: '9999px solid rgba(40,40,255,0)',
      }} />
      {/* Horizontal slice bands */}
      <div className="glitch-s1" style={{
        position: 'absolute', left: 0, right: 0, height: '4px',
        background: '#00ff41', opacity: 0.7, scaleY: 0, transformOrigin: 'top',
      }} />
      <div className="glitch-s2" style={{
        position: 'absolute', left: 0, right: 0, height: '2px',
        background: '#00ff41', opacity: 0.5, scaleY: 0, transformOrigin: 'top',
      }} />
      {/* Scanline flash overlay */}
      <div className="glitch-flash" style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,255,65,0.15)', opacity: 0,
      }} />
    </div>
  );
});

export default GlitchTransition;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/GlitchTransition.jsx
git commit -m "feat: GlitchTransition RGB split + slice + scanline flash for Terminal mode"
```

---

## Task 7: SectionCounter and KeyHints

**Files:**
- Create: `src/components/SectionCounter.jsx`
- Create: `src/components/KeyHints.jsx`

- [ ] **Step 1: Create `src/components/SectionCounter.jsx`**

```jsx
import { useSectionContext } from '../context/SectionContext';

export default function SectionCounter() {
  const { activeIndex, total } = useSectionContext();
  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '24px',
      fontFamily: 'var(--font-display)',
      fontSize: '11px',
      letterSpacing: '3px',
      color: 'var(--color-muted)',
      zIndex: 1000,
      userSelect: 'none',
    }} className="section-counter">
      <span style={{ color: 'var(--color-accent)' }}>{pad(activeIndex + 1)}</span>
      <span>/{pad(total)}</span>
    </div>
  );
}
```

Add to `src/styles/sections.css`:
```css
@media (max-width: 768px) {
  .section-counter,
  .key-hints {
    display: none;
  }
}
```

- [ ] **Step 2: Create `src/components/KeyHints.jsx`**

```jsx
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function KeyHints() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);
  const hiddenRef = useRef(false);

  useEffect(() => {
    const show = () => {
      if (hiddenRef.current) return;
      timerRef.current = setTimeout(() => {
        setVisible(true);
        gsap.fromTo(ref.current, { opacity: 0 }, { opacity: 1, duration: 0.6 });
      }, 3000);
    };

    const hide = () => {
      clearTimeout(timerRef.current);
      if (visible) {
        hiddenRef.current = true;
        gsap.to(ref.current, { opacity: 0, duration: 0.3 });
      }
    };

    show();
    window.addEventListener('keydown', hide);
    window.addEventListener('wheel', hide, { passive: true });
    window.addEventListener('touchstart', hide);

    return () => {
      clearTimeout(timerRef.current);
      window.removeEventListener('keydown', hide);
      window.removeEventListener('wheel', hide);
      window.removeEventListener('touchstart', hide);
    };
  }, [visible]);

  return (
    <div
      ref={ref}
      className="key-hints"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        fontFamily: 'var(--font-display)',
        fontSize: '10px',
        letterSpacing: '2px',
        color: 'var(--color-muted)',
        zIndex: 1000,
        opacity: 0,
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    >
      <span>↑↓ navigate</span>
      <span style={{ color: 'var(--color-border)' }}>·</span>
      <span>T toggle mode</span>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/SectionCounter.jsx src/components/KeyHints.jsx src/styles/sections.css
git commit -m "feat: SectionCounter and KeyHints UI chrome"
```

---

## Task 8: SectionManager Component

**Files:**
- Create: `src/components/SectionManager.jsx`

- [ ] **Step 1: Create `src/components/SectionManager.jsx`**

```jsx
import { useCallback, useRef } from 'react';
import gsap from 'gsap';
import { useSectionContext, SECTIONS } from '../context/SectionContext';
import { useSectionManager } from '../hooks/useSectionManager';
import WipeTransition from './WipeTransition';
import GlitchTransition from './GlitchTransition';
import SectionCounter from './SectionCounter';
import KeyHints from './KeyHints';

const isF1 = () => document.documentElement.getAttribute('data-theme') === 'f1';
const isMobile = () => window.innerWidth <= 768;

export default function SectionManager({ sections }) {
  const { activeIndex, isTransitioning, setIsTransitioning, goTo } = useSectionContext();
  const wipeRef  = useRef(null);
  const glitchRef = useRef(null);
  const sectionRefs = useRef([]);

  const runEntranceAnimation = useCallback((index) => {
    const el = sectionRefs.current[index];
    if (!el) return;
    const items = el.querySelectorAll('.section-enter-item');
    if (!items.length) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      gsap.set(items, { opacity: 1, y: 0 });
      return;
    }

    gsap.fromTo(items,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
    );
  }, []);

  const advance = useCallback(async (dir) => {
    if (isTransitioning) return;
    const nextIndex = activeIndex + dir;
    if (nextIndex < 0 || nextIndex >= SECTIONS.length) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsTransitioning(true);

    if (prefersReduced || isMobile()) {
      // Fast fade on reduced motion / mobile
      const current = sectionRefs.current[activeIndex];
      const next    = sectionRefs.current[nextIndex];
      gsap.to(current, { opacity: 0, duration: 0.15 });
      await new Promise(r => setTimeout(r, 150));
      goTo(nextIndex);
      gsap.fromTo(next, { opacity: 0 }, { opacity: 1, duration: 0.15 });
      await new Promise(r => setTimeout(r, 150));
    } else if (isF1()) {
      await wipeRef.current.play();  // resolves at mid-point
      goTo(nextIndex);
    } else {
      await glitchRef.current.play(); // resolves at hard-cut
      goTo(nextIndex);
    }

    runEntranceAnimation(nextIndex);
    setIsTransitioning(false);
  }, [activeIndex, isTransitioning, goTo, setIsTransitioning, runEntranceAnimation]);

  useSectionManager({ activeIndex, isTransitioning, advance });

  return (
    <>
      <WipeTransition ref={wipeRef} />
      <GlitchTransition ref={glitchRef} />
      <SectionCounter />
      <KeyHints />

      <div style={{ position: 'relative', width: '100%', height: '100dvh', overflow: 'hidden' }}>
        {sections.map((Section, i) => (
          <div
            key={SECTIONS[i]}
            ref={el => sectionRefs.current[i] = el}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: i === activeIndex ? 1 : 0,
              pointerEvents: i === activeIndex ? 'auto' : 'none',
              transition: 'none', // GSAP handles this
            }}
          >
            <Section isActive={i === activeIndex} />
          </div>
        ))}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SectionManager.jsx
git commit -m "feat: SectionManager orchestrates transitions and entrance animations"
```

---

## Task 9: IntroSection

**Files:**
- Create: `src/components/sections/IntroSection.jsx`

- [ ] **Step 1: Create `src/components/sections/IntroSection.jsx`**

```jsx
import { useEffect, useState } from 'react';
import Typist from 'react-typist-component';
import ParticlePortrait from '../ParticlePortrait';

export default function IntroSection({ isActive }) {
  const [ready, setReady] = useState(() =>
    typeof window !== 'undefined' && !!sessionStorage.getItem('preloaded')
  );

  useEffect(() => {
    if (ready) return;
    const handler = () => setReady(true);
    window.addEventListener('preloader:done', handler);
    return () => window.removeEventListener('preloader:done', handler);
  }, [ready]);

  return (
    <section
      className="section section-stripe"
      style={{
        flexDirection: 'column',
        gap: '32px',
        position: 'relative',
      }}
    >
      {/* Particle Portrait */}
      <div className="section-enter-item" style={{ display: 'flex', justifyContent: 'center' }}>
        <ParticlePortrait />
      </div>

      {/* Name + tagline */}
      <div className="section-enter-item" style={{ textAlign: 'center' }}>
        {isActive && ready ? (
          <Typist typingDelay={100} cursor={<span style={{ color: 'var(--color-accent)' }}>|</span>}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.4rem, 4vw, 2.6rem)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--color-text)',
              textShadow: 'var(--glow)',
            }}>
              Aakash Vijeta
            </span>
          </Typist>
        ) : (
          <span aria-hidden="true">&nbsp;</span>
        )}

        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.75rem',
          letterSpacing: '0.3em',
          color: 'var(--color-muted)',
          marginTop: '8px',
          textTransform: 'uppercase',
        }}>
          Full Stack Developer · IIT Guwahati
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/IntroSection.jsx
git commit -m "feat: IntroSection full-screen with ParticlePortrait and Typist"
```

---

## Task 10: ProjectsSection + ProjectOverlay

**Files:**
- Create: `src/components/sections/ProjectsSection.jsx`
- Create: `src/components/ProjectOverlay.jsx`

- [ ] **Step 1: Create `src/components/sections/ProjectsSection.jsx`**

```jsx
import { useSectionContext } from '../../context/SectionContext';
import { projectDetails } from '../../data/projects';

export default function ProjectsSection() {
  const { setOverlayProject } = useSectionContext();

  return (
    <section className="section section-stripe" style={{ flexDirection: 'column', padding: '0 5vw' }}>
      <h2
        className="section-enter-item"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(0.65rem, 1.5vw, 0.8rem)',
          letterSpacing: '0.4em',
          color: 'var(--color-accent)',
          textTransform: 'uppercase',
          marginBottom: '40px',
          alignSelf: 'flex-start',
        }}
      >
        Projects
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: '20px',
          width: '100%',
          maxWidth: '900px',
        }}
      >
        {projectDetails.map((project) => (
          <button
            key={project.slug}
            className="section-enter-item"
            onClick={() => setOverlayProject(project)}
            style={{
              all: 'unset',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '4px',
              overflow: 'hidden',
              transition: 'transform 0.25s, box-shadow 0.25s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = 'var(--glow-strong)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <img
              src={project.image}
              alt={project.title}
              style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }}
            />
            <div style={{ padding: '16px 18px' }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.65rem',
                letterSpacing: '0.3em',
                color: 'var(--color-accent)',
                textTransform: 'uppercase',
                marginBottom: '6px',
              }}>
                {project.tag}
              </div>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.95rem',
                color: 'var(--color-text)',
                lineHeight: 1.4,
              }}>
                {project.title}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `src/components/ProjectOverlay.jsx`**

```jsx
import { useEffect } from 'react';
import gsap from 'gsap';
import { useSectionContext } from '../context/SectionContext';

export default function ProjectOverlay() {
  const { overlayProject, setOverlayProject } = useSectionContext();

  useEffect(() => {
    if (!overlayProject) return;
    gsap.fromTo('.project-overlay-inner',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
    );
    const onKey = (e) => { if (e.key === 'Escape') setOverlayProject(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [overlayProject, setOverlayProject]);

  if (!overlayProject) return null;
  const p = overlayProject;

  return (
    <div
      onClick={() => setOverlayProject(null)}
      style={{
        position: 'fixed', inset: 0, zIndex: 5000,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="project-overlay-inner"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '6px',
          maxWidth: '720px',
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          padding: '36px 40px',
          fontFamily: 'var(--font-body)',
          color: 'var(--color-text)',
          position: 'relative',
        }}
      >
        <button
          onClick={() => setOverlayProject(null)}
          style={{
            all: 'unset', cursor: 'pointer',
            position: 'absolute', top: '16px', right: '20px',
            fontFamily: 'var(--font-display)', fontSize: '0.75rem',
            letterSpacing: '0.2em', color: 'var(--color-muted)',
          }}
        >
          [ ESC ]
        </button>

        <div style={{ fontSize: '0.65rem', letterSpacing: '0.3em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '8px' }}>
          {p.tag}
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.1rem, 3vw, 1.6rem)', marginBottom: '16px', letterSpacing: '0.05em' }}>
          {p.title}
        </h2>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', marginBottom: '24px', lineHeight: 1.6 }}>
          {p.subtitle}
        </p>

        {p.overview.map((para, i) => (
          <p key={i} style={{ fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '12px', color: 'var(--color-text)' }}>
            {para}
          </p>
        ))}

        <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {p.repos.map(r => (
            <a key={r.label} href={r.href} target="_blank" rel="noopener noreferrer"
              style={{
                fontFamily: 'var(--font-display)', fontSize: '0.7rem',
                letterSpacing: '0.2em', color: 'var(--color-accent)',
                border: '1px solid var(--color-accent)', padding: '6px 14px',
                textDecoration: 'none', textTransform: 'uppercase',
              }}>
              {r.label}
            </a>
          ))}
          {p.liveDemo && (
            <a href={p.liveDemo} target="_blank" rel="noopener noreferrer"
              style={{
                fontFamily: 'var(--font-display)', fontSize: '0.7rem',
                letterSpacing: '0.2em', color: 'var(--color-bg)',
                background: 'var(--color-accent)', padding: '6px 14px',
                textDecoration: 'none', textTransform: 'uppercase',
              }}>
              Live Demo
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/ProjectsSection.jsx src/components/ProjectOverlay.jsx
git commit -m "feat: ProjectsSection card grid and ProjectOverlay detail panel"
```

---

## Task 11: AboutSection

**Files:**
- Create: `src/components/sections/AboutSection.jsx`

- [ ] **Step 1: Create `src/components/sections/AboutSection.jsx`**

```jsx
import ParticlePortrait from '../ParticlePortrait';

const skills = [
  'Python', 'React', 'TypeScript', 'FastAPI', 'scikit-learn',
  'XGBoost', 'PostgreSQL', 'Docker', 'Vite', 'GSAP',
];

export default function AboutSection() {
  return (
    <section
      className="section section-stripe"
      style={{
        flexDirection: 'row',
        gap: '60px',
        padding: '0 8vw',
        alignItems: 'center',
      }}
    >
      {/* Portrait — hidden on mobile, shown above content via CSS order */}
      <div
        className="section-enter-item about-portrait"
        style={{ flexShrink: 0 }}
      >
        <ParticlePortrait />
      </div>

      {/* Content */}
      <div style={{ maxWidth: '480px' }}>
        <div
          className="section-enter-item"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.65rem',
            letterSpacing: '0.4em',
            color: 'var(--color-accent)',
            textTransform: 'uppercase',
            marginBottom: '20px',
          }}
        >
          About
        </div>

        <p
          className="section-enter-item"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(0.85rem, 1.5vw, 0.95rem)',
            lineHeight: 1.75,
            color: 'var(--color-text)',
            marginBottom: '28px',
          }}
        >
          I build intelligent systems at the intersection of machine learning,
          software engineering, and applied mathematics. Currently studying
          Data Science &amp; AI at IIT Guwahati — shipping things that are
          both technically rigorous and actually useful.
        </p>

        <div className="section-enter-item" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {skills.map(skill => (
            <span
              key={skill}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.65rem',
                letterSpacing: '0.15em',
                color: 'var(--color-accent)',
                border: '1px solid var(--color-border)',
                padding: '4px 10px',
                textTransform: 'uppercase',
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
```

Add to `src/styles/sections.css`:
```css
@media (max-width: 768px) {
  /* About: stack portrait above content */
  section.section[data-section="about"] {
    flex-direction: column;
    padding: 40px 6vw;
    justify-content: center;
    gap: 28px;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/AboutSection.jsx src/styles/sections.css
git commit -m "feat: AboutSection split layout with portrait and skill tags"
```

---

## Task 12: ContactSection

**Files:**
- Create: `src/components/sections/ContactSection.jsx`

- [ ] **Step 1: Create `src/components/sections/ContactSection.jsx`**

```jsx
import { useState } from 'react';

const EMAIL = 'aakashvijeta2@gmail.com';
const GITHUB = 'https://github.com/AakashVijeta';

export default function ContactSection() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    await navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      className="section section-stripe"
      style={{ flexDirection: 'column', gap: '32px', textAlign: 'center' }}
    >
      <div
        className="section-enter-item"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.65rem',
          letterSpacing: '0.4em',
          color: 'var(--color-accent)',
          textTransform: 'uppercase',
        }}
      >
        Contact
      </div>

      {/* Email — large, clickable */}
      <button
        className="section-enter-item"
        onClick={copyEmail}
        style={{
          all: 'unset',
          cursor: 'pointer',
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1rem, 3vw, 1.8rem)',
          letterSpacing: '0.1em',
          color: 'var(--color-text)',
          textShadow: 'var(--glow)',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text)'}
      >
        {EMAIL}
      </button>

      <div
        className="section-enter-item"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.65rem',
          letterSpacing: '0.25em',
          color: 'var(--color-muted)',
          height: '14px',
        }}
      >
        {copied ? '[ copied ]' : '[ click to copy ]'}
      </div>

      {/* Social links */}
      <div className="section-enter-item" style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <a
          href={GITHUB}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.65rem',
            letterSpacing: '0.3em',
            color: 'var(--color-muted)',
            textDecoration: 'none',
            textTransform: 'uppercase',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '2px',
            transition: 'color 0.2s, border-color 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--color-accent)';
            e.currentTarget.style.borderColor = 'var(--color-accent)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--color-muted)';
            e.currentTarget.style.borderColor = 'var(--color-border)';
          }}
        >
          GitHub
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/ContactSection.jsx
git commit -m "feat: ContactSection with clipboard email copy and social links"
```

---

## Task 13: CreditsSection

**Files:**
- Create: `src/components/sections/CreditsSection.jsx`

- [ ] **Step 1: Create `src/components/sections/CreditsSection.jsx`**

```jsx
export default function CreditsSection() {
  return (
    <section
      className="section section-stripe"
      style={{ flexDirection: 'column', gap: '16px', textAlign: 'center' }}
    >
      <div
        className="section-enter-item"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.65rem',
          letterSpacing: '0.4em',
          color: 'var(--color-accent)',
          textTransform: 'uppercase',
          marginBottom: '8px',
        }}
      >
        Credits
      </div>

      <p
        className="section-enter-item"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.8rem',
          color: 'var(--color-muted)',
          lineHeight: 1.8,
          maxWidth: '400px',
        }}
      >
        Designed &amp; built by Aakash Vijeta.<br />
        Built with React, Vite, and GSAP.<br />
        Deployed on Vercel.
      </p>

      <div
        className="section-enter-item"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.6rem',
          letterSpacing: '0.3em',
          color: 'var(--color-border)',
          marginTop: '16px',
        }}
      >
        © {new Date().getFullYear()} Aakash Vijeta
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/CreditsSection.jsx
git commit -m "feat: CreditsSection restyled for new theme system"
```

---

## Task 14: Wire Everything in App.jsx

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Rewrite `src/App.jsx`**

```jsx
import { SectionProvider } from './context/SectionContext';
import SectionManager from './components/SectionManager';
import ProjectOverlay from './components/ProjectOverlay';
import Preloader from './components/Preloader';
import StatusChrome from './components/StatusChrome';
import ThemeToggle from './components/ThemeToggle';
import IntroSection from './components/sections/IntroSection';
import ProjectsSection from './components/sections/ProjectsSection';
import AboutSection from './components/sections/AboutSection';
import ContactSection from './components/sections/ContactSection';
import CreditsSection from './components/sections/CreditsSection';
import './App.css';

const SECTION_COMPONENTS = [
  IntroSection,
  ProjectsSection,
  AboutSection,
  ContactSection,
  CreditsSection,
];

function App() {
  return (
    <SectionProvider>
      <div className="App">
        <Preloader />
        <StatusChrome />
        <ThemeToggle />
        <SectionManager sections={SECTION_COMPONENTS} />
        <ProjectOverlay />
      </div>
    </SectionProvider>
  );
}

export default App;
```

- [ ] **Step 2: Remove bootstrap import from `src/main.jsx`**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/themes.css'
import './styles/sections.css'
import './styles/Global.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 3: Start dev server and verify all five sections render**

```bash
npm run dev
```

- Open http://localhost:5173
- Scroll or press arrow keys to advance sections
- Verify: Intro → Projects → About → Contact → Credits
- Verify: T key toggles theme (F1 red / Terminal green)
- Verify: Section counter `01/05` visible top-right on desktop
- Expected: transitions may not be pixel-perfect yet — that's fine

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx src/main.jsx
git commit -m "feat: wire SectionManager into App, remove Bootstrap nav"
```

---

## Task 15: Fix ParticlePortrait (Mobile + Passive Touch)

**Files:**
- Modify: `src/components/ParticlePortrait.jsx`

- [ ] **Step 1: Add `{ passive: true }` to touchmove and fps throttle**

In `src/components/ParticlePortrait.jsx`, find the `handleTouchMove` section and the canvas event listeners. Replace from line 239 to line 257:

```jsx
const handleTouchMove = (e) => {
  // passive listener — do NOT call e.preventDefault()
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  mouseRef.current.x = touch.clientX - rect.left;
  mouseRef.current.y = touch.clientY - rect.top;
  mouseRef.current.active = true;
  wake();
};

const handleLeave = () => {
  mouseRef.current.active = false;
};

canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseleave', handleLeave);
canvas.addEventListener('touchmove', handleTouchMove, { passive: true }); // passive: unblocks scroll
canvas.addEventListener('touchend', handleLeave);
```

Also add mobile fps throttle inside the `draw` function. Find the `const draw = () => {` line and add at the top of the function body:

```jsx
const draw = () => {
  // Throttle to 30fps on mobile to save GPU
  const isMobileDevice = window.innerWidth <= 768;
  if (isMobileDevice) {
    const now = performance.now();
    if (now - lastMobileFrame < 33) { // 33ms = ~30fps
      animationId = requestAnimationFrame(draw);
      return;
    }
    lastMobileFrame = now;
  }

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  // ... rest of existing draw function unchanged
```

- [ ] **Step 2: Verify canvas still renders in browser**

```bash
npm run dev
```

Open http://localhost:5173, check the Intro section. ParticlePortrait should render and animate. On mobile (or dev tools mobile viewport), scroll should not be blocked.

- [ ] **Step 3: Commit**

```bash
git add src/components/ParticlePortrait.jsx
git commit -m "fix: passive touchmove on ParticlePortrait, 30fps throttle on mobile"
```

---

## Task 16: Delete Replaced Files

**Files:**
- Delete all old components replaced by the new section architecture

- [ ] **Step 1: Delete old component files**

```bash
cd D:/aakash
rm src/components/NavBar.jsx src/styles/NavBar.css
rm src/components/FadeInSection.jsx
rm src/components/RevealTitle.jsx src/styles/RevealTitle.css
rm src/components/PageTransition.jsx src/styles/PageTransition.css
rm src/components/ThemeTransition.jsx
rm src/components/Intro.jsx src/styles/Intro.css
rm src/components/Projects.jsx src/styles/Projects.css
rm src/components/ProjectDetail.jsx src/styles/ProjectDetail.css
rm src/components/about.jsx src/styles/About.css
rm src/components/Credits.jsx src/styles/Credits.css
```

- [ ] **Step 2: Verify no import errors**

```bash
npm run dev
```

Expected: no errors in Vite terminal about missing modules. Browser should still show all five sections.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: delete replaced components and styles"
```

---

## Task 17: Full Visual QA Pass

- [ ] **Step 1: Desktop QA — Terminal mode**

Open http://localhost:5173 (no `?theme=f1`).
- [ ] Scanlines visible over entire page
- [ ] CRT vignette darkening edges
- [ ] Section counter `01/05` visible top-right
- [ ] Key hints fade in after 3s of no interaction
- [ ] Arrow keys advance sections
- [ ] Glitch cut fires on each transition (RGB split visible for ~200ms)
- [ ] Entrance stagger animation plays after each transition
- [ ] Projects section: 2-col card grid, hover lifts + green glow
- [ ] Projects section: clicking a card opens ProjectOverlay
- [ ] ProjectOverlay: ESC key and backdrop click both close it
- [ ] About section: portrait left, bio right, skill tags render
- [ ] Contact section: email click copies to clipboard, `[ copied ]` feedback shows
- [ ] Credits section: renders correctly

- [ ] **Step 2: Desktop QA — F1 mode**

Press `T` key to toggle to F1 mode.
- [ ] Scanlines disappear, carbon fiber texture visible
- [ ] Section counter accent color changes to red
- [ ] Red wipe transition fires on each section advance
- [ ] All text uses Barlow Condensed for headings, DM Sans for body
- [ ] Accent color is `#e10600` throughout

- [ ] **Step 3: Mobile QA (dev tools, 390px viewport)**

- [ ] Section counter and key hints hidden
- [ ] Swipe up/down advances sections
- [ ] Fast fade used instead of wipe/glitch
- [ ] ParticlePortrait renders; scrolling page is not blocked
- [ ] About section stacks vertically
- [ ] Projects section: single column

- [ ] **Step 4: Reduced motion QA**

In Chrome: Settings → Rendering → Emulate CSS media feature `prefers-reduced-motion: reduce`
- [ ] No wipe or glitch animations — instant cut only
- [ ] Entrance stagger disabled

- [ ] **Step 5: Trackpad scroll QA**

Use trackpad (or Chrome devtools touch emulation):
- [ ] Fast flick does not skip two sections
- [ ] Held arrow key advances one section per transition completion

- [ ] **Step 6: Commit final fixes from QA**

```bash
git add -A
git commit -m "fix: visual QA corrections from full pass"
```

---

## Task 18: Production Build Check

- [ ] **Step 1: Run production build**

```bash
npm run build
```

Expected: no errors, `dist/` folder created.

- [ ] **Step 2: Preview production build**

```bash
npm run preview
```

Open the preview URL. Verify transitions and all sections work in the production bundle (GSAP tree-shaking sometimes drops plugins if not imported correctly).

- [ ] **Step 3: Commit if any build fixes were needed**

```bash
git add -A
git commit -m "fix: production build issues"
```
