import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSectionContext, SECTIONS } from '../context/SectionContext';
import { playEntrance, hideEntrance } from '../utils/entranceAnimation';

const hasIO = typeof IntersectionObserver !== 'undefined';

// Mobile (≤ 900px): every section in normal document flow with native scroll.
export default function MobileFlow({ sections }) {
  const { activeIndex, goTo } = useSectionContext();
  const refs = useRef([]);
  const startIndexRef = useRef(activeIndex);
  // Without IntersectionObserver every section counts as entered up front.
  const [entered, setEntered] = useState(() => SECTIONS.map((_, i) => !hasIO || i === 0 || i === activeIndex));

  // Before paint: hide entrance items of sections not yet on screen, and
  // restore the scroll position when arriving from the paged layout.
  useLayoutEffect(() => {
    const start = startIndexRef.current;
    refs.current.forEach((el, i) => { if (i !== 0 && i !== start) hideEntrance(el); });
    if (start > 0) refs.current[start]?.scrollIntoView({ block: 'start' });
  }, []);

  useEffect(() => {
    const els = refs.current.filter(Boolean);
    if (!hasIO) {
      els.forEach((el) => playEntrance(el));
      return;
    }
    playEntrance(els[startIndexRef.current]);

    // Fires when a section's top crosses 75% of the viewport — works for any section height.
    const enterObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const i = Number(e.target.dataset.sectionIndex);
        enterObs.unobserve(e.target);
        if (i !== 0 && i !== startIndexRef.current) playEntrance(e.target);
        setEntered((prev) => (prev[i] ? prev : prev.map((v, j) => (j === i ? true : v))));
      });
    }, { rootMargin: '0px 0px -25% 0px' });

    // Scroll-spy: the section crossing the 40% line is "current".
    const spyObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) goTo(Number(e.target.dataset.sectionIndex)); });
    }, { rootMargin: '-40% 0px -59% 0px' });

    els.forEach((el) => { enterObs.observe(el); spyObs.observe(el); });
    return () => { enterObs.disconnect(); spyObs.disconnect(); };
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
