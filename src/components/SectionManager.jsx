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
  const wipeRef   = useRef(null);
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
      const current = sectionRefs.current[activeIndex];
      const next    = sectionRefs.current[nextIndex];
      gsap.to(current, { opacity: 0, duration: 0.15 });
      await new Promise(r => setTimeout(r, 150));
      goTo(nextIndex);
      gsap.fromTo(next, { opacity: 0 }, { opacity: 1, duration: 0.15 });
      await new Promise(r => setTimeout(r, 150));
    } else if (isF1()) {
      await wipeRef.current.play();
      goTo(nextIndex);
    } else {
      await glitchRef.current.play();
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
              transition: 'none',
            }}
          >
            <Section isActive={i === activeIndex} />
          </div>
        ))}
      </div>
    </>
  );
}
