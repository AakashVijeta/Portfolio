import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function IntroSection({ isActive }) {
  const rootRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;
    const el = rootRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const stamp = el.querySelectorAll('.intro-stamp');
    const name1 = el.querySelector('.intro-name-a');
    const name2 = el.querySelector('.intro-name-b');
    const meta = el.querySelectorAll('.intro-meta-row');
    const dossierLines = el.querySelectorAll('.intro-dossier-line');

    gsap.killTweensOf([stamp, name1, name2, meta, dossierLines]);
    gsap.set([stamp, name1, name2, meta, dossierLines], { opacity: 0 });
    gsap.set([name1, name2], { y: 40, skewX: -6 });

    const tl = gsap.timeline();
    tl.to(stamp, { opacity: 1, duration: 0.35, stagger: 0.08, ease: 'none' }, 0)
      .to(name1, { opacity: 1, y: 0, skewX: 0, duration: 0.6, ease: 'power3.out' }, 0.25)
      .to(name2, { opacity: 1, y: 0, skewX: 0, duration: 0.6, ease: 'power3.out' }, 0.38)
      .to(dossierLines, { opacity: 1, duration: 0.3, stagger: 0.07, ease: 'none' }, 0.55)
      .to(meta, { opacity: 1, duration: 0.4, stagger: 0.08, ease: 'power2.out' }, 0.75);

    return () => { tl.kill(); };
  }, [isActive]);

  return (
    <section
      ref={rootRef}
      className="section section-stripe intro-hero"
      style={{
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'space-between',
        padding: '64px 6vw 56px',
        position: 'relative',
      }}
    >
      {/* Top classification bar */}
      <div className="intro-top-bar">
        <span className="intro-stamp" style={{ color: 'var(--color-accent)' }}>
          <span className="intro-dot" /> CLASSIFICATION · PUBLIC
        </span>
        <span className="intro-stamp">SIG · AV-07</span>
        <span className="intro-stamp">BUILD · 2026.04</span>
        <span className="intro-stamp intro-stamp-f1">TEAM · AAKASH RACING</span>
        <span className="intro-stamp intro-stamp-terminal">SESSION · CRT-ONLINE</span>
      </div>

      {/* Giant name-mark with dossier rail */}
      <div className="intro-center">
        <div className="intro-namewrap">
          <div className="intro-name-a intro-name">AAKASH</div>
          <div className="intro-name-b intro-name">
            VIJETA<span className="intro-name-cursor" aria-hidden="true">_</span>
          </div>
          <div className="intro-speedline" aria-hidden="true" />
        </div>

        {/* Dossier rail */}
        <aside className="intro-dossier">
          <div className="intro-dossier-line"><span>NAME</span><span>AAKASH VIJETA</span></div>
          <div className="intro-dossier-line"><span>ROLE</span><span>ENGINEER / BUILDER</span></div>
          <div className="intro-dossier-line"><span>BASE</span><span>IIT GUWAHATI · IND</span></div>
          <div className="intro-dossier-line"><span>STACK</span><span>ML · SYSTEMS · APPLIED MATH</span></div>
          <div className="intro-dossier-line"><span>STATUS</span><span className="intro-status-live">ON TRACK</span></div>
        </aside>
      </div>

      {/* Bottom meta row */}
      <div className="intro-bottom-bar">
        <div className="intro-meta-row" style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(0.6rem, 0.9vw, 0.7rem)',
          letterSpacing: '0.3em',
          color: 'var(--color-muted)',
          textTransform: 'uppercase',
        }}>
          COORD · 26.14°N · 91.65°E
        </div>
        <div className="intro-meta-row" style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(0.6rem, 0.9vw, 0.7rem)',
          letterSpacing: '0.3em',
          color: 'var(--color-muted)',
          textTransform: 'uppercase',
        }}>
          SCROLL · NAVIGATE
        </div>
      </div>
    </section>
  );
}
