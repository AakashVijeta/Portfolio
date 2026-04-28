import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { scrambleText } from '../../utils/scramble';

export default function IntroSection({ isActive }) {
  const rootRef = useRef(null);

  const [preloaderDone, setPreloaderDone] = useState(() => !!sessionStorage.getItem('preloaded'));

  useEffect(() => {
    if (preloaderDone) return;
    const handleDone = () => setPreloaderDone(true);
    window.addEventListener('preloader:done', handleDone);
    return () => window.removeEventListener('preloader:done', handleDone);
  }, [preloaderDone]);

  // useLayoutEffect + CSS opacity:0 on .intro-anim-item (see sections.css)
  // prevents the ~1-frame flash where items were visible before GSAP reset
  // them to 0 and started the timeline.
  useLayoutEffect(() => {
    if (!isActive || !preloaderDone) return;
    const el = rootRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const stamp = el.querySelectorAll('.intro-stamp');
    const name1Chars = el.querySelectorAll('.intro-name-a .scramble-char');
    const name2Chars = el.querySelectorAll('.intro-name-b .scramble-char');
    const meta = el.querySelectorAll('.intro-meta-row');
    const dossierLines = el.querySelectorAll('.intro-dossier-line');
    const dossier = el.querySelector('.intro-dossier');
    const allItems = [stamp, el.querySelector('.intro-name-a'), el.querySelector('.intro-name-b'), meta, dossierLines, dossier];

    gsap.killTweensOf(allItems);

    if (prefersReduced) {
      gsap.set(allItems, { opacity: 1, x: 0, y: 0, skewX: 0, scaleY: 1, filter: 'blur(0px)' });
      return;
    }

    gsap.set(allItems, { opacity: 0 });
    gsap.set(stamp, { y: 8 });
    gsap.set([el.querySelector('.intro-name-a'), el.querySelector('.intro-name-b')], { y: 46, skewX: -5, filter: 'blur(5px)' });
    gsap.set(dossierLines, { x: 16 });
    gsap.set(meta, { y: 10 });
    gsap.set(dossier, { scaleY: 0, transformOrigin: 'center center' });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.addLabel('intro', 0)
      .to(stamp, { opacity: 1, y: 0, duration: 0.35, stagger: 0.05 }, 'intro')
      .to(el.querySelector('.intro-name-a'), {
        opacity: 1,
        y: 0,
        skewX: 0,
        filter: 'blur(0px)',
        duration: 0.72,
      }, 'intro+=0.19');
    
    // Staggered entrance scramble for name1
    name1Chars.forEach((char, i) => {
      tl.call(() => scrambleText(char, false, 0.25), null, `intro+=${0.19 + i * 0.04}`);
    });

    tl.to(el.querySelector('.intro-name-b'), {
        opacity: 1,
        y: 0,
        skewX: 0,
        filter: 'blur(0px)',
        duration: 0.72,
      }, 'intro+=0.27');

    // Staggered entrance scramble for name2
    name2Chars.forEach((char, i) => {
      tl.call(() => scrambleText(char, false, 0.25), null, `intro+=${0.27 + i * 0.04}`);
    });

    tl.to(dossier, { opacity: 1, scaleY: 1, duration: 0.52, ease: 'power3.inOut' }, 'intro+=0.37')
      .to(dossierLines, { opacity: 1, x: 0, duration: 0.35, stagger: 0.045 }, 'intro+=0.51')
      .to(meta, { opacity: 1, y: 0, duration: 0.38, stagger: 0.06, ease: 'power2.out' }, 'intro+=0.66');

    return () => { tl.kill(); };
  }, [isActive, preloaderDone]);

  const renderScrambleLetters = (text) => {
    return text.split('').map((char, i) => (
      <span 
        key={i} 
        className="scramble-char" 
        data-value={char}
        onMouseEnter={(e) => scrambleText(e.target, false, 0.45)}
      >
        {char}
      </span>
    ));
  };

  return (
    <section
      ref={rootRef}
      className="section section-stripe intro-hero"
      style={{
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'space-between',
        padding: '64px clamp(40px, 5vw, 80px) 56px',
        position: 'relative',
      }}
    >
      {/* Top classification bar */}
      <div className="intro-top-bar">
        <span className="intro-stamp" style={{ color: 'var(--color-accent)' }}>
          <span className="intro-dot" /> CLEARANCE · UNRESTRICTED
        </span>
        <span className="intro-stamp">REF · AV-07</span>
        <span className="intro-stamp intro-stamp-f1">AFFILIATION · INDEPENDENT</span>
        <span className="intro-stamp intro-stamp-terminal">TERMINAL · ACTIVE</span>
      </div>

      {/* Giant name-mark with dossier rail */}
      <div className="intro-center">
        <div className="intro-namewrap">
          <div className="intro-name-a intro-name" style={{ width: 'fit-content' }}>
            {renderScrambleLetters('AAKASH')}
          </div>
          <div className="intro-name-b intro-name" style={{ width: 'fit-content' }}>
            {renderScrambleLetters('VIJETA')}
            <span className="intro-name-cursor" aria-hidden="true">_</span>
          </div>
          <div className="intro-speedline" aria-hidden="true" />
        </div>

        {/* Dossier rail */}
        <aside className="intro-dossier">
          <div className="intro-dossier-line"><span>NAME</span><span>AAKASH VIJETA</span></div>
          <div className="intro-dossier-line"><span>ROLE</span><span>ENGINEER / BUILDER</span></div>
          <div className="intro-dossier-line"><span>BASE</span><span>IIT GUWAHATI · IND</span></div>
          <div className="intro-dossier-line"><span>STACK</span><span>ML · AI SYSTEMS · DATA SCIENCE</span></div>
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
          LOCATION · 26.14°N 91.65°E · INDIA
        </div>
        <div className="intro-meta-row" style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(0.6rem, 0.9vw, 0.7rem)',
          letterSpacing: '0.3em',
          color: 'var(--color-muted)',
          textTransform: 'uppercase',
        }}>
          {window.matchMedia('(hover: none)').matches
            ? 'SWIPE UP / DOWN TO NAVIGATE'
            : 'USE ARROW KEYS OR SCROLL TO NAVIGATE'}
        </div>
      </div>
    </section>
  );
}
