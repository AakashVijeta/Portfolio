import { createContext, useContext, useState, useCallback, useRef } from 'react';

const SectionContext = createContext(null);

export const SECTIONS = ['intro', 'projects', 'about', 'socials'];
export const SECTION_LABELS = ['INTRO', 'PROJECTS', 'PROFILE', 'SOCIALS'];

export function SectionProvider({ children }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [overlayProject, setOverlayProject] = useState(null);
  const navigateToRef = useRef(null);

  const goTo = useCallback((index) => {
    if (index < 0 || index >= SECTIONS.length) return;
    setActiveIndex(index);
  }, []);

  // Called by NavDots — routes through SectionManager's full transition logic
  const navigateTo = useCallback((index) => {
    if (navigateToRef.current) navigateToRef.current(index);
  }, []);

  return (
    <SectionContext.Provider value={{
      activeIndex,
      isTransitioning,
      setIsTransitioning,
      overlayProject,
      setOverlayProject,
      goTo,
      navigateTo,
      navigateToRef,
      total: SECTIONS.length,
    }}>
      {children}
    </SectionContext.Provider>
  );
}

export function useSectionContext() {
  const ctx = useContext(SectionContext);
  if (!ctx) throw new Error('useSectionContext must be used within SectionProvider');
  return ctx;
}
