import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import KeyHints from '../KeyHints';

const STATUS_WORDS    = ['ON TRACK', 'BUILDING', 'SHIPPING', 'TRAINING', 'COMPILING'];
const TYPE_SPEED      = 80;
const DELETE_SPEED    = 45;
const HOLD_DURATION   = 2200;
const PAUSE_BEFORE_TYPE = 400;

const DOS_TERMINAL = [
  { key: 'BASE',  val: 'IIT GUWAHATI · IND' },
  { key: 'STACK', val: 'DS · ML · AI SYS' },
];

const DOS_F1 = [
  { key: 'TEAM', val: 'INDEPENDENT' },
  { key: 'BASE', val: 'IIT GUWAHATI · IND' },
];

function useTheme() {
  const [isF1, setIsF1] = useState(
    () => document.documentElement.getAttribute('data-theme') === 'f1'
  );
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setIsF1(document.documentElement.getAttribute('data-theme') === 'f1')
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  return isF1;
}

export default function IntroSection({ isActive }) {
  const rootRef = useRef(null);
  const isF1 = useTheme();

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

  const [statusText, setStatusText] = useState('');
  const wordIdxRef    = useRef(0);
  const charIdxRef    = useRef(0);
  const isDeletingRef = useRef(false);
  const twTimerRef    = useRef(null);

  useEffect(() => {
    const typewriterTick = () => {
      const word = STATUS_WORDS[wordIdxRef.current];
      if (!isDeletingRef.current) {
        charIdxRef.current += 1;
        setStatusText(word.slice(0, charIdxRef.current));
        if (charIdxRef.current >= word.length) {
          twTimerRef.current = setTimeout(() => {
            isDeletingRef.current = true;
            typewriterTick();
          }, HOLD_DURATION);
          return;
        }
        twTimerRef.current = setTimeout(typewriterTick, TYPE_SPEED + Math.random() * 40);
      } else {
        charIdxRef.current -= 1;
        setStatusText(word.slice(0, charIdxRef.current));
        if (charIdxRef.current <= 0) {
          isDeletingRef.current = false;
          wordIdxRef.current = (wordIdxRef.current + 1) % STATUS_WORDS.length;
          twTimerRef.current = setTimeout(typewriterTick, PAUSE_BEFORE_TYPE);
          return;
        }
        twTimerRef.current = setTimeout(typewriterTick, DELETE_SPEED);
      }
    };

    twTimerRef.current = setTimeout(typewriterTick, PAUSE_BEFORE_TYPE);
    return () => clearTimeout(twTimerRef.current);
  }, []);

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
      const dossier = root.querySelector('.ihyb-dossier');
      const dossierRows = root.querySelectorAll('.ihyb-dos-row');
      const targets = [topbar, bottombar, nameA, nameB, dossier, ...dossierRows].filter(Boolean);
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

      gsap.set([topbar, bottombar, nameA, nameB, dossier], { autoAlpha: 0 });
      gsap.set(dossierRows, { autoAlpha: 0, x: 12 });

      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .fromTo(topbar, { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 0.34 }, 0)
        .fromTo(nameA, { autoAlpha: 0, x: -20 }, { autoAlpha: 1, x: 0, duration: 0.5 }, 0.08)
        .fromTo(nameB, { autoAlpha: 0, x: 20 }, { autoAlpha: 1, x: 0, duration: 0.5 }, 0.1)
        .fromTo(
          dossier,
          { autoAlpha: 0, x: 18 },
          { autoAlpha: 1, x: 0, duration: 0.48 },
          0.34
        )
        .to(dossierRows, { autoAlpha: 1, x: 0, stagger: 0.06, duration: 0.28 }, 0.44)
        .fromTo(bottombar, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.34 }, 0.5);
    }, rootRef);

    return () => ctx.revert();
  }, [isActive, preloaderDone]);

  if (!preloaderDone) return <section className="section intro-hero" />;

  const dosRows = isF1 ? DOS_F1 : DOS_TERMINAL;

  return (
    <section ref={rootRef} className="section intro-hero">

      <header className="ihyb-topbar">
        <div className="ihyb-topbar-left">
          <span className="intro-dot" />
          <span className="ihyb-accent">AUTH · ROOT_ACCESS</span>
          <span className="ihyb-sep">·</span>
          <span>{isF1 ? 'F1_MODE · ACTIVE' : 'TERMINAL · ACTIVE'}</span>
        </div>
      </header>

      <div className="ihyb-center">
        <h1 className="ihyb-namewrap" aria-label="Aakash Vijeta">
          <span className="ihyb-name-a">AAKASH</span>
          <span className="ihyb-name-b">VIJETA</span>
        </h1>

        <aside className="ihyb-dossier">
          {dosRows.map((r) => (
            <div key={r.key} className="ihyb-dos-row">
              <span className="ihyb-dos-key">{r.key}</span>
              <span className="ihyb-dos-val">{r.val}</span>
            </div>
          ))}
          <div className="ihyb-dos-row">
            <span className="ihyb-dos-key">STATUS</span>
            <span className="ihyb-dos-val ihyb-dos-live">
              {statusText}<span className="ihyb-cursor">_</span>
            </span>
          </div>
        </aside>
      </div>

      <footer className="ihyb-bottombar">
        <span className="ihyb-clock">SYS_TIME · {timeStr}</span>
        <KeyHints revealDelay={0} />
        <span className="ihyb-clock">USE ARROW KEYS OR SCROLL TO NAVIGATE</span>
      </footer>

    </section>
  );
}
