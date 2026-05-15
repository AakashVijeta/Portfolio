import { useEffect, useRef } from 'react';
import { Observer } from 'gsap/Observer';
import gsap from 'gsap';

gsap.registerPlugin(Observer);

const WHEEL_THRESHOLD = 100;  // px accumulated before advancing
const WHEEL_COOLDOWN_MS = 1200; // ignore wheel events after advancing once
const SWIPE_THRESHOLD = 80;   // px minimum swipe travel
const GESTURE_COOLDOWN_MS = 900; // ignore new swipes briefly after one fires

const getActiveScrollable = () => {
  const activeSection = document.querySelector('[data-section-active="true"]');
  if (!activeSection) return null;
  return activeSection.querySelector('.section-scroll');
};

export function useSectionManager({ activeIndex, isTransitioning, advance }) {
  const wheelAccRef = useRef(0);
  const wheelLastFiredRef = useRef(0);
  const observerRef = useRef(null);

  useEffect(() => {
    const onWheel = (e) => {
      if (isTransitioning) return;
      if (Date.now() - wheelLastFiredRef.current < WHEEL_COOLDOWN_MS) {
        wheelAccRef.current = 0; // drain momentum during cooldown so it can't retrigger immediately after
        return;
      }
      wheelAccRef.current += e.deltaY;
      if (Math.abs(wheelAccRef.current) >= WHEEL_THRESHOLD) {
        const dir = wheelAccRef.current > 0 ? 1 : -1;
        wheelAccRef.current = 0;
        wheelLastFiredRef.current = Date.now();
        advance(dir);
      }
    };

    const onKey = (e) => {
      if (isTransitioning) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') advance(1);
      if (e.key === 'ArrowUp' || e.key === 'PageUp') advance(-1);
      if (e.key === 't' || e.key === 'T') {
        const current = document.documentElement.getAttribute('data-theme');
        document.documentElement.setAttribute(
          'data-theme',
          current === 'f1' ? 'terminal' : 'f1'
        );
      }
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('keydown', onKey);

    // Dominant-axis gate: record gesture start and, when onUp/onDown fires,
    // only advance if the vertical displacement clearly exceeded horizontal.
    // This lets a user scroll horizontally in the projects slider AND swipe
    // vertically to change section — whichever axis dominates wins.
    const gesture = { startX: 0, startY: 0, lastFiredAt: 0 };
    const isVerticallyDominant = (self) => {
      const dx = Math.abs(self.x - gesture.startX);
      const dy = Math.abs(self.y - gesture.startY);
      return dy > dx * 2.5 && dy > 80;
    };
    const inCooldown = () => Date.now() - gesture.lastFiredAt < GESTURE_COOLDOWN_MS;

    observerRef.current = Observer.create({
      type: 'touch',
      tolerance: 5,
      dragMinimum: 5,
      onPress: (self) => {
        gesture.startX = self.x;
        gesture.startY = self.y;
      },
      // Swipe UP (finger up) → advance to NEXT section
      onUp: (self) => {
        if (isTransitioning || inCooldown()) return;
        if (!isVerticallyDominant(self)) return;
        const scrollable = getActiveScrollable();
        if (scrollable) {
          const { scrollTop, scrollHeight, clientHeight } = scrollable;
          if (scrollTop + clientHeight < scrollHeight - 80) return;
        }
        gesture.lastFiredAt = Date.now();
        advance(1);
      },
      // Swipe DOWN (finger down) → advance to PREVIOUS section
      onDown: (self) => {
        if (isTransitioning || inCooldown()) return;
        if (!isVerticallyDominant(self)) return;
        const scrollable = getActiveScrollable();
        if (scrollable && scrollable.scrollTop > 80) return;
        gesture.lastFiredAt = Date.now();
        advance(-1);
      },
      minimumMovement: SWIPE_THRESHOLD,
      preventDefault: false,
    });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      observerRef.current?.kill();
    };
  }, [isTransitioning, advance]);

  // Reset wheel accumulator on section change
  useEffect(() => {
    wheelAccRef.current = 0;
    wheelLastFiredRef.current = Date.now();
  }, [activeIndex]);
}
