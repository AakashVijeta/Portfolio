import gsap from 'gsap';
import { EASE_OUT, prefersReducedMotion } from './motion';

// Rise-and-fade every .section-enter-item inside `el`, in DOM order.
// A section can slow its stagger with data-enter-stagger="<seconds>".
export function playEntrance(el) {
  if (!el) return;
  const items = el.querySelectorAll('.section-enter-item');
  if (!items.length) return;

  if (prefersReducedMotion()) {
    gsap.set(items, { opacity: 1, y: 0 });
    return;
  }

  const custom = parseFloat(el.querySelector('[data-enter-stagger]')?.dataset.enterStagger);
  const each = Number.isFinite(custom) ? custom : 0.06;

  // Kill any running tweens on these items before animating in
  gsap.killTweensOf(items);
  // Suppress CSS transitions — .profiler-module has transition:transform which
  // fights GSAP frame-by-frame and causes jank. Restore on complete.
  items.forEach(item => item.style.setProperty('transition', 'none'));
  gsap.fromTo(items,
    { opacity: 0, y: 16 },
    {
      opacity: 1,
      y: 0,
      duration: 0.55,
      stagger: { each, from: 'start' },
      ease: EASE_OUT,
      force3D: true,
      onComplete: () => {
        gsap.set(items, { clearProps: 'transform,opacity' });
        items.forEach(item => item.style.removeProperty('transition'));
      },
    }
  );
}

export function hideEntrance(el) {
  if (!el) return;
  const items = el.querySelectorAll('.section-enter-item');
  if (items.length) gsap.set(items, { opacity: 0, y: 16 });
}
