import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useLayoutMode } from '../../hooks/useLayoutMode';
import { prefersReducedMotion } from '../../utils/motion';
import { scrambleTo } from '../../utils/scramble';

const STATUS_WORDS    = ['ON TRACK', 'BUILDING', 'SHIPPING', 'TRAINING', 'COMPILING'];
const STATUS_HOLD_S   = 2.2;   // seconds each status word stays decoded

// Case-file scraps pinned around the name on desktop; each leans a little and tilts
// toward the pointer by its own depth
const FLOATS = [
  { id: 'loc',   depth: 1.0, lean: 2.2,  lines: ['LAT: 26.1878 N', 'LON: 91.6916 E', 'SITE_IIT_GUWAHATI'] },
  { id: 'log',   depth: 1.3, lean: -1.2, lines: ['>> fitting model...', '>> calibrating probs'], status: true },
];

export default function IntroSection({ isActive }) {
  const rootRef = useRef(null);
  const nameRef = useRef(null);
  const mode = useLayoutMode();

  const [preloaderDone, setPreloaderDone] = useState(() => !!sessionStorage.getItem('preloaded'));

  const [timeStr, setTimeStr] = useState('00:00:00.000');
  useEffect(() => {
    let reqId;
    const update = () => {
      const now = new Date();
      setTimeStr(
        String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0') + ':' +
        String(now.getSeconds()).padStart(2, '0') + '.' +
        String(now.getMilliseconds()).padStart(3, '0')
      );
      reqId = requestAnimationFrame(update);
    };
    reqId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(reqId);
  }, []);

  // STATUS line: scramble-decode from one word to the next, on a loop
  const statusRef = useRef(null);
  useEffect(() => {
    const el = statusRef.current;
    if (!el || prefersReducedMotion()) return;
    const tl = gsap.timeline({ repeat: -1 });
    STATUS_WORDS.forEach((_, i) => {
      tl.to({}, { duration: STATUS_HOLD_S });
      tl.add(scrambleTo(el, STATUS_WORDS[(i + 1) % STATUS_WORDS.length], { tweenLength: true }));
    });
    return () => tl.kill();
  }, [preloaderDone]);

  useEffect(() => {
    if (preloaderDone) return;
    const handle = () => setPreloaderDone(true);
    window.addEventListener('preloader:done', handle);
    return () => window.removeEventListener('preloader:done', handle);
  }, [preloaderDone]);

  useLayoutEffect(() => {
    if (!preloaderDone) return;

    const ctx = gsap.context(() => {
      const root = rootRef.current;
      if (!root) return;

      const topbar = root.querySelector('.ihyb-topbar');
      const bottombar = root.querySelector('.ihyb-bottombar');
      const nameA = root.querySelector('.ihyb-name-a');
      const nameB = root.querySelector('.ihyb-name-b');
      const tagline = root.querySelector('.ihyb-tagline');
      const extras = [...root.querySelectorAll('.ihyb-float-in')];
      const targets = [topbar, bottombar, nameA, nameB, tagline, ...extras].filter(Boolean);
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      gsap.killTweensOf(targets);

      if (!isActive) {
        gsap.set(targets, { autoAlpha: 0 });
        return;
      }

      if (prefersReduced) {
        gsap.set(targets, { autoAlpha: 1, x: 0, y: 0, yPercent: 0 });
        return;
      }

      gsap.set([topbar, bottombar, nameA, nameB, tagline, ...extras].filter(Boolean), { autoAlpha: 0 });

      // Cards pop in first, then the stamp fades up, then each name line comes into
      // focus out of a blur, then the tagline rises (about 2.3s in all)
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .fromTo(extras, { autoAlpha: 0, scale: 0.8, rotation: 4 }, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.35, stagger: 0.1, clearProps: 'transform' }, 0)
        .fromTo(topbar, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: 'power1.out' }, 0.7)
        .fromTo([nameA, nameB],
          { autoAlpha: 0, scale: 0.9, filter: 'blur(20px)' },
          { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: 0.8, stagger: 0.2, ease: 'expo.out', clearProps: 'transform,filter' }, 1.0)
        .fromTo(tagline, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.6, clearProps: 'transform' }, 1.7)
        .fromTo(bottombar, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.34 }, 1.8);
    }, rootRef);

    return () => ctx.revert();
  }, [isActive, preloaderDone]);

  // Desktop pointers: the hero sits in the dark and a soft spotlight follows the cursor;
  // the pinned scraps tilt toward it, each by its own depth
  useEffect(() => {
    const root = rootRef.current;
    if (!preloaderDone || !root || mode !== 'paged') return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const floats = [...root.querySelectorAll('.ihyb-float')];
    const still = prefersReducedMotion();
    const tilts = floats.map((el) => ({
      depth: Number(el.dataset.depth),
      rx: gsap.quickTo(el, 'rotationX', { duration: 0.8, ease: 'power3.out' }),
      ry: gsap.quickTo(el, 'rotationY', { duration: 0.8, ease: 'power3.out' }),
    }));
    let raf = 0;
    let px = window.innerWidth / 2;
    let py = window.innerHeight / 2;
    const paint = () => {
      raf = 0;
      const r = root.getBoundingClientRect();
      root.style.setProperty('--sx', `${px - r.left}px`);
      root.style.setProperty('--sy', `${py - r.top}px`);
      if (still) return;
      const nx = (px - window.innerWidth / 2) / (window.innerWidth / 2);
      const ny = (py - window.innerHeight / 2) / (window.innerHeight / 2);
      tilts.forEach((t) => { t.ry(nx * 10 * t.depth); t.rx(-ny * 8 * t.depth); });
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };
    const move = (e) => { px = e.clientX; py = e.clientY; schedule(); };
    // Scrolling moves the hero under a still pointer, so re-aim the light then too
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('scroll', schedule, { passive: true });
    root.classList.add('has-spotlight');
    paint();
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('scroll', schedule);
      cancelAnimationFrame(raf);
      root.classList.remove('has-spotlight');
    };
  }, [mode, preloaderDone]);

  // One size for both lines: AAKASH (the wider word) spans 85% of the content on phones,
  // about half the screen on desktop.
  useLayoutEffect(() => {
    if (!preloaderDone || !nameRef.current) return;
    const wrap = nameRef.current;
    const lines = wrap.querySelectorAll('.ihyb-name-a, .ihyb-name-b');
    const fit = () => {
      const target = mode === 'flow' ? wrap.clientWidth * 0.85 : Math.min(wrap.clientWidth, window.innerWidth * 0.48);
      const cap = window.innerHeight * 0.26;
      lines.forEach((el) => el.style.setProperty('font-size', '100px', 'important'));
      const range = document.createRange();
      range.selectNodeContents(lines[0]);
      const width = range.getBoundingClientRect().width;
      if (!width) return;
      const size = `${Math.min((100 * target) / width, cap)}px`;
      lines.forEach((el) => el.style.setProperty('font-size', size, 'important'));
    };
    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    return () => {
      ro.disconnect();
      lines.forEach((el) => el.style.removeProperty('font-size'));
    };
  }, [mode, preloaderDone]);

  if (!preloaderDone) return <section className="section intro-hero" />;

  return (
    <section ref={rootRef} className="section intro-hero">
      {/* Darkness with a hole at the pointer (desktop pointers; see has-spotlight) */}
      <div className="ihyb-spotlight" aria-hidden="true" />

      {/* Scan beam sweeping the hero top to bottom (same beam as the profile scanner) */}
      <div className="ihyb-scan" aria-hidden="true"><div className="ihyb-scan-beam" /></div>

      {/* Pinned case-file scraps (desktop) */}
      {FLOATS.map((f) => (
        <div key={f.id} className={`ihyb-float-in ihyb-float-in-${f.id}`} aria-hidden="true">
          <div className="ihyb-float" data-depth={f.depth} style={{ '--lean': `${f.lean}deg` }}>
            {f.lines.map((l) => <span key={l}>{l}</span>)}
            {f.status && (
              <span className="ihyb-status-line">
                &gt;&gt; status: <span className="ihyb-dos-live"><span ref={statusRef} className="ihyb-status-text">{STATUS_WORDS[0]}</span><span className="ihyb-cursor">_</span></span>
              </span>
            )}
          </div>
        </div>
      ))}

      <header className="ihyb-topbar">
        <div className="ihyb-topbar-left">
          <span className="ihyb-accent">TOP SECRET // CASE #2026</span>
        </div>
      </header>

      <div className="ihyb-center">
        <h1 ref={nameRef} className="ihyb-namewrap" aria-label="Aakash Vijeta">
          <span className="ihyb-name-a">AAKASH</span>
          <span className="ihyb-name-b">VIJETA</span>
        </h1>

        <p className="ihyb-tagline">
          Building at the intersection of <em>statistical inference</em> and <em>production engineering</em>.
          <br />Models that ship, not notebooks that sit.
        </p>

      </div>

      <footer className="ihyb-bottombar">
        <span className="ihyb-clock">SYS_TIME · {timeStr}</span>
        <span className="ihyb-clock">USE ARROW KEYS OR SCROLL TO NAVIGATE</span>
      </footer>

    </section>
  );
}
