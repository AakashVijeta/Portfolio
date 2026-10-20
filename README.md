# Aakash Vijeta — Cinematic Portfolio

<div align="center">
  <p align="center">
    <a href="https://aakashvijeta.me"><b>Live Site</b></a> •
    <a href="#-the-experience">The Experience</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-interaction-controls">Controls</a>
  </p>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/GSAP-3.15-88CE02?style=for-the-badge&logo=greensock&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-7.3-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white" />
</div>

---

## 🎬 The Experience

A single-page portfolio with a **"Cinematic Tech-Noir"** look: phosphor-green terminal type on near-black, fine film grain, and camera-viewfinder chrome. The site is the proof of work. Motion is mechanical and deliberate (ease-out, no bounce), and every section is built as an instrument panel rather than a template.

### Key Features

*   **⏳ Signal-Tracing Preloader:** A boot sequence with a jittering signal line, live coordinate readouts and a counter. On exit the page opens along the counter's seam and the hero name unfolds out of it. It plays once per session (`sessionStorage`) and never with `prefers-reduced-motion`.
*   **🗂 Evidence Board:** Projects are a quiet four-column list rather than cards. On desktop a row's case file opens in place while you point at it, and on phones you tap the row. Each row shows a headline stat. The F1 predictor's stat updates live from the season scoreboard API and falls back to a fixed value if the API is unavailable.
*   **📁 Project Files with Shareable Links:** A full-screen case file for each project, with prev/next navigation. Every file has its own URL (`/#f1-podium-predictor`). Opening a file adds a history entry, so the browser Back button closes it.
*   **⚡ GSAP Motion System:** Reveals start as an element scrolls into view. Headings rise letter by letter (SplitText), hairline rules draw left to right, numbers count up, labels decode with ScrambleText, and media uncovers from the bottom. The curves are shared CSS/GSAP tokens (`--ease-out`, `--ease-in-out`).
*   **🧭 Smooth Scroll, Two Designs:** The page is one natural-scroll document at every width. Desktop (≥ 901px) adds Lenis smooth scrolling, side nav dots, viewfinder corner readouts and a custom cursor with live X/Y coordinates. Mobile (≤ 900px) keeps native touch scrolling with a lighter design and drops effects that are expensive on iOS.
*   **🔎 SEO Without SSR:** A Vite plugin injects JSON-LD (Person, ProfilePage, projects) and a static HTML fallback built from the project data. Crawlers and link-preview bots get real content, and React replaces it on mount.
*   **🎨 Branding Details:** A waveform favicon (SVG, ICO and Apple touch icon), an accent scrollbar that stays hidden during the preloader, and a large Open Graph preview image.

---

## 🛠 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | [React 19](https://react.dev/) + [Vite 7](https://vite.dev/) |
| **Animation** | [GSAP](https://gsap.com/) (ScrollTrigger, SplitText, ScrambleText, CustomEase) |
| **Scrolling** | [Lenis](https://lenis.darkroom.engineering/) (desktop only) |
| **Typography** | Geist + Geist Mono (self-hosted via Fontsource) |
| **Styling** | Vanilla CSS with design tokens, split by layout (desktop / mobile) |
| **Deployment** | [Vercel](https://vercel.com/) (SPA rewrite + `/api/f1` proxy) |

---

## 📂 Project Structure

```bash
src/
├── components/
│   ├── sections/
│   │   ├── IntroSection.jsx     # Hero name + pointer-tilting case-file scraps
│   │   ├── ProjectsSection.jsx  # Evidence Board (with live headline stats)
│   │   ├── AboutSection.jsx     # Subject profile, capabilities, status
│   │   └── ContactSection.jsx   # Email, GitHub, LinkedIn, résumé
│   ├── ScrollFlow.jsx           # Stacks sections, Lenis, scroll-in reveals
│   ├── ProjectViewer.jsx        # Full-screen project file, hash routing
│   ├── Preloader.jsx            # Signal-tracing boot sequence
│   ├── NavDots.jsx              # Section dots (desktop)
│   ├── Viewfinder.jsx           # Corner camera readouts (desktop)
│   ├── CustomCursor.jsx         # Accent dot + coordinates (pointer devices)
│   └── RollText.jsx             # Letter-roll button labels
├── context/
│   └── SectionContext.jsx       # Active section, open project, navigation
├── hooks/
│   └── useLayoutMode.js         # 'paged' (desktop) vs 'flow' (≤ 900px)
├── utils/
│   ├── entranceAnimation.js     # Reveal choreography
│   ├── motion.js                # Shared eases, count-up, reduced-motion checks
│   └── scramble.js              # Scramble-decode text effect
├── data/
│   └── projects.js              # Project catalogue (also feeds SEO output)
└── styles/
    ├── themes.css               # Color, type and motion tokens; film grain
    ├── Global.css               # Resets, base layout, mobile perf guards
    ├── flow.css                 # Scroll layout shared by all widths
    ├── desktop.css              # Desktop design (≥ 901px)
    ├── mobile.css               # Mobile design (≤ 900px)
    ├── sections.css             # Section styling
    ├── hero-contact.css         # Hero and contact
    ├── cases.css                # Evidence Board
    ├── project-viewer.css       # Project file
    └── Preloader.css            # Boot sequence

public/                          # Favicons, OG image, résumé, project images, robots/sitemap
vite.config.js                   # SEO plugin + /api/f1 dev proxy
vercel.json                      # SPA rewrite + /api/f1 production proxy
```

---

## ⌨️ Interaction Controls

| Action | Control |
| :--- | :--- |
| **Navigate** | Scroll / trackpad / swipe, or click the side nav dots (desktop) |
| **Open a project** | Point at a row on the **Evidence Board** (desktop) or tap it (mobile) |
| **Browse projects** | Prev / next inside a project file |
| **Close a project** | `ESC`, the close button, or the browser Back button |
| **Share a project** | Copy the URL while a file is open (e.g. `aakashvijeta.me/#niftyedge`) |

---

## 🚀 Getting Started

```bash
# Install
npm install

# Start development (proxies /api/f1 to the scoreboard API)
npm run dev

# Lint
npm run lint

# Build and preview the production bundle
npm run build
npm run preview
```

To add or edit a project, change `src/data/projects.js`. The Evidence Board, project files, JSON-LD and crawler fallback all read from it.

---

## ⚖️ License

Personal project. You are welcome to read the source for architectural reference, but please don't redeploy the design or content as your own.

&copy; 2026 Aakash Vijeta

---

## 🧹 Note on local tooling

Local AI/agent config (`.claude/`, `.codex/`, `.cursor/`, `.superpowers/`, `.impeccable/`, `CLAUDE.md`, `AGENTS.md`, `DESIGN.md`, `PRODUCT.md`, etc.) and graphify artifacts (`graphify-out/`) are git-ignored. If any slip into a commit, run `git rm --cached -r <path>` and re-commit.
