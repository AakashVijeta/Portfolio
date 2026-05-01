# Aakash Vijeta — Cinematic Portfolio

<div align="center">
  <p align="center">
    <a href="https://aakashvijeta.me"><b>Live Demo</b></a> •
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

The portfolio leverages a **"Cinematic Tech-Noir"** aesthetic, blending industrial F1-inspired UI with terminal-grade digital elements. Every interaction is designed to feel tactile, weighted, and responsive.

### Key Features

*   **🌑 Atmospheric Noise Engine:** A custom canvas-based animated grain atmosphere that provides depth and texture without sacrificing performance.
*   **🌓 Dual-Persona Themes:** 
    *   `TERMINAL` — A phosphor green, CRT-inspired aesthetic for the builder/engineer.
    *   `F1` — A high-contrast, carbon fibre and racing-red aesthetic for the performance-driven professional.
*   **⚡ GSAP-Powered Motion System:** Deep integration with GSAP (ScrollTrigger, Observer) for smooth, logic-based section transitions and entrance animations.
*   **🧩 Text Scramble Logic:** A custom "hacker-style" scramble effect used for headings and interactive elements, providing a sense of real-time decryption.
*   **⏳ Signal-Tracing Preloader:** A sophisticated entry sequence featuring a collapsing frequency wave and a curtain-split reveal. It uses `sessionStorage` persistence to respect user time on return visits.

---

## 🛠 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) |
| **Animation** | [GSAP](https://gsap.com/) (ScrollTrigger, CustomEase, Observer) |
| **Styling** | Vanilla CSS (CSS Variables for dynamic theming) |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 📂 Project Structure

```bash
src/
├── components/        
│   ├── sections/      # Intro, Projects (Evidence Board), About, Contact
│   ├── ProjectOverlay.jsx # Detailed project view (Decryption Mode)
│   ├── Preloader.jsx  # Signal-tracing entry sequence
│   └── ThemeToggle.jsx # Aesthetic mode switcher
├── hooks/             
│   └── useSectionManager.js # Wheel/touch/keyboard navigation logic
├── utils/             
│   └── scramble.js    # Character-shuffling animation engine
├── context/           
│   └── SectionContext.jsx   # Global state for sections and overlays
└── styles/            
    ├── main.css       # Core design system & layout
    └── sections.css   # Section-specific cinematic styling
```

---

## ⌨️ Interaction Controls

| Action | Control |
| :--- | :--- |
| **Navigation** | Scroll Wheel / Arrow Keys / Swipe (Mobile) |
| **Theme Toggle** | Press `T` or use the top-left toggle |
| **Decrypt Project** | Click any card on the **Evidence Board** |
| **Exit Overlay** | Press `ESC` or click outside the briefing |

---

## 🚀 Getting Started

```bash
# Clone and install
npm install

# Start development
npm run dev

# Build for production
npm run build
```

---

## ⚖️ License

Personal project — feel free to explore the source for architectural reference. Please do not redeploy the design or content as your own.

&copy; 2026 Aakash Vijeta
