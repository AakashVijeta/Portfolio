import { useCallback, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useSectionContext, SECTIONS } from '../context/SectionContext';
import { useSectionManager } from '../hooks/useSectionManager';
import WipeTransition from './WipeTransition';
import GlitchTransition from './GlitchTransition';
import SectionCounter from './SectionCounter';
import { playEntrance, hideEntrance } from '../utils/entranceAnimation';

const isF1 = () => document.documentElement.getAttribute('data-theme') === 'f1';
const isMobile = () => window.innerWidth <= 768;

export default function SectionManager({ sections }) {
  const { activeIndex, isTransitioning, setIsTransitioning, goTo, navigateToRef } = useSectionContext();
  const wipeRef   = useRef(null);
  const glitchRef = useRef(null);
  const sectionRefs = useRef([]);

  const runEntranceAnimation = useCallback((index) => {
    playEntrance(sectionRefs.current[index]);
  }, []);

  const resetSection = useCallback((index) => {
    hideEntrance(sectionRefs.current[index]);
  }, []);

  const advance = useCallback(async (dir) => {
    if (isTransitioningRef.current) return;
    const nextIndex = activeIndexRef.current + dir;
    if (nextIndex < 0 || nextIndex >= SECTIONS.length) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsTransitioning(true);
    isTransitioningRef.current = true;
    resetSection(nextIndex);

    try {
      if (prefersReduced || isMobile()) {
        const current = sectionRefs.current[activeIndexRef.current];
        const next    = sectionRefs.current[nextIndex];
        gsap.to(current, { opacity: 0, duration: 0.15 });
        await new Promise(r => setTimeout(r, 150));
        goTo(nextIndex);
        gsap.set(next, { opacity: 1 });
        await new Promise(r => setTimeout(r, 50));
      } else if (isF1()) {
        await wipeRef.current.play();
        goTo(nextIndex);
      } else {
        await glitchRef.current.play(sectionRefs.current[activeIndexRef.current]);
        goTo(nextIndex);
      }
      runEntranceAnimation(nextIndex);
    } finally {
      setIsTransitioning(false);
      isTransitioningRef.current = false;
    }
  }, [goTo, setIsTransitioning, runEntranceAnimation, resetSection]);

  // Keep live refs so navigateTo never captures stale closure values
  const activeIndexRef = useRef(activeIndex);
  const isTransitioningRef = useRef(isTransitioning);
  useEffect(() => { activeIndexRef.current = activeIndex; }, [activeIndex]);
  useEffect(() => { isTransitioningRef.current = isTransitioning; }, [isTransitioning]);

  // Register navigateTo on mount — reads state via refs to avoid stale closures
  useEffect(() => {
    navigateToRef.current = async (nextIndex) => {
      if (isTransitioningRef.current) return;
      if (nextIndex === activeIndexRef.current) return;
      if (nextIndex < 0 || nextIndex >= SECTIONS.length) return;

      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setIsTransitioning(true);
      isTransitioningRef.current = true;
      resetSection(nextIndex);

      try {
        if (prefersReduced || isMobile()) {
          const current = sectionRefs.current[activeIndexRef.current];
          const next = sectionRefs.current[nextIndex];
          gsap.to(current, { opacity: 0, duration: 0.15 });
          await new Promise(r => setTimeout(r, 150));
          goTo(nextIndex);
          gsap.set(next, { opacity: 1 });
          await new Promise(r => setTimeout(r, 50));
        } else if (isF1()) {
          await wipeRef.current.play();
          goTo(nextIndex);
        } else {
          await glitchRef.current.play(sectionRefs.current[activeIndexRef.current]);
          goTo(nextIndex);
        }
        runEntranceAnimation(nextIndex);
      } finally {
        setIsTransitioning(false);
        isTransitioningRef.current = false;
      }
    };
  }, [goTo, setIsTransitioning, resetSection, runEntranceAnimation, navigateToRef]);

  // Animate the current section on first mount (index 0 on a fresh load)
  useEffect(() => {
    runEntranceAnimation(activeIndexRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useSectionManager({ activeIndex, isTransitioning, advance });

  return (
    <>
      <WipeTransition ref={wipeRef} />
      <GlitchTransition ref={glitchRef} />
      <SectionCounter />

      <div style={{ position: 'relative', width: '100%', height: '100dvh', overflow: 'hidden' }}>
        {sections.map((Section, i) => (
          <div
            key={SECTIONS[i]}
            ref={el => sectionRefs.current[i] = el}
            data-section-active={i === activeIndex ? 'true' : undefined}
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
