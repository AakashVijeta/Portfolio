import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { useSectionContext, SECTIONS } from '../context/SectionContext';
import { useLayoutMode } from '../hooks/useLayoutMode';
import { hideEntrance, revealItems, REVEAL_ITEM_SELECTOR } from '../utils/entranceAnimation';
import { prefersReducedMotion } from '../utils/motion';

const hasIO = typeof IntersectionObserver !== 'undefined';

// Every section in normal document flow with native scroll (desktop and mobile).
// Desktop adds Lenis smooth scrolling; every reveal item fades up on its own as it
// reaches the screen.
export default function ScrollFlow({ sections }) {
  const { activeIndex, goTo, navigateToRef, overlayProject } = useSectionContext();
  const mode = useLayoutMode();
  const refs = useRef([]);
  const lenisRef = useRef(null);
  // Sections report `isActive` once they have been on screen (drives section-internal effects)
  const [entered, setEntered] = useState(() => SECTIONS.map((_, i) => !hasIO || i === 0 || i === activeIndex));

  // Before paint: every reveal item starts hidden
  useLayoutEffect(() => {
    // Child layout effects run before App's, so flow styles must be on before measuring.
    document.documentElement.classList.add('is-flow');
    if (hasIO && !prefersReducedMotion()) refs.current.forEach((el) => hideEntrance(el));
  }, []);

  // Desktop: Lenis smooth scrolling (touch keeps native scrolling; reduced motion opts out)
  useEffect(() => {
    if (mode !== 'paged' || prefersReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenisRef.current = lenis;
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [mode]);

  // Hold the page still while a project panel is open
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (overlayProject) lenis.stop(); else lenis.start();
  }, [overlayProject]);

  // Section dots (desktop) scroll to a section
  useEffect(() => {
    navigateToRef.current = (i) => {
      const el = refs.current[i];
      if (!el) return;
      if (lenisRef.current) { lenisRef.current.scrollTo(el, { duration: 1.2 }); return; }
      el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    };
    return () => { navigateToRef.current = null; };
  }, [navigateToRef]);

  useEffect(() => {
    const els = refs.current.filter(Boolean);
    const allItems = els.flatMap((el) => [...el.querySelectorAll(REVEAL_ITEM_SELECTOR)]);
    if (!hasIO) { revealItems(allItems); return; }

    // Per-item reveal, checked every scroll frame: anything 40px into view OR already
    // scrolled past is revealed, so a jump (dot click, fast fling) can't skip items.
    // Only the vertical position counts, so slider cards reveal with their row.
    let pending = allItems;
    let raf = 0;
    const check = () => {
      raf = 0;
      const line = window.innerHeight - 40;
      const due = pending.filter((item) => item.getBoundingClientRect().top < line);
      if (!due.length) return;
      pending = pending.filter((item) => !due.includes(item));
      // Items already scrolled past appear instantly; only on-screen ones animate
      const passed = due.filter((item) => item.getBoundingClientRect().bottom <= 0);
      if (passed.length) gsap.set(passed, { opacity: 1, y: 0, clearProps: 'transform,opacity' });
      revealItems(due.filter((item) => !passed.includes(item)));
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(check); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();

    // Sections count as entered once 40px into view
    const enterObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const i = Number(e.target.dataset.sectionIndex);
        enterObs.unobserve(e.target);
        setEntered((prev) => (prev[i] ? prev : prev.map((v, j) => (j === i ? true : v))));
      });
    }, { rootMargin: '0px 0px -40px 0px' });

    // Scroll-spy: the section crossing the 40% line is "current".
    const spyObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) goTo(Number(e.target.dataset.sectionIndex)); });
    }, { rootMargin: '-40% 0px -59% 0px' });

    els.forEach((el) => { enterObs.observe(el); spyObs.observe(el); });
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(raf);
      enterObs.disconnect();
      spyObs.disconnect();
    };
  }, [goTo]);

  return (
    <main className="layout-flow">
      {sections.map((Section, i) => (
        <div
          key={SECTIONS[i]}
          ref={(el) => { refs.current[i] = el; }}
          id={`sec-${SECTIONS[i]}`}
          data-section-index={i}
          className="flow-section"
        >
          <Section isActive={entered[i]} />
        </div>
      ))}
    </main>
  );
}
