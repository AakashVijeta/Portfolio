import gsap from 'gsap';

// Rise-and-fade every .section-enter-item inside `el`.
export function playEntrance(el) {
  if (!el) return;
  const items = el.querySelectorAll('.section-enter-item');
  if (!items.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    gsap.set(items, { opacity: 1, y: 0 });
    return;
  }

  // Kill any running tweens on these items before animating in
  gsap.killTweensOf(items);
  // Suppress CSS transitions — .profiler-module has transition:transform which
  // fights GSAP frame-by-frame and causes jank. Restore on complete.
  items.forEach(item => item.style.setProperty('transition', 'none'));
  gsap.fromTo(items,
    { opacity: 0, y: 28 },
    {
      opacity: 1,
      y: 0,
      duration: 0.68,
      stagger: { each: 0.07, from: 'start' },
      ease: 'power3.out',
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
  if (items.length) gsap.set(items, { opacity: 0, y: 28 });
}
