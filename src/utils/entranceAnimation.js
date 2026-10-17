import gsap from 'gsap';
import { EASE_OUT, prefersReducedMotion } from './motion';

const ITEM = '.section-enter-item';

// Hide every reveal item inside `el` (they fade up as they enter the screen).
export function hideEntrance(el) {
  if (!el) return;
  const items = el.querySelectorAll(ITEM);
  if (items.length) gsap.set(items, { opacity: 0, y: 15 });
}

// Soft reveal for a batch of items entering together: fade up 15px, ~650ms,
// staggered in DOM order. A section can change the step with data-enter-stagger.
export function revealItems(items) {
  if (!items.length) return;
  if (prefersReducedMotion()) {
    gsap.set(items, { opacity: 1, y: 0 });
    return;
  }
  const sorted = [...items].sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  sorted.forEach((item, i) => {
    const custom = parseFloat(item.closest('[data-enter-stagger]')?.dataset.enterStagger);
    const each = Number.isFinite(custom) ? custom : 0.06;
    gsap.killTweensOf(item);
    // Suppress CSS transitions while GSAP drives the reveal (they fight frame by frame)
    item.style.setProperty('transition', 'none');
    gsap.fromTo(item,
      { opacity: 0, y: 15 },
      {
        opacity: 1,
        y: 0,
        duration: 0.65,
        delay: 0.08 + i * each,
        ease: EASE_OUT,
        force3D: true,
        onComplete: () => {
          gsap.set(item, { clearProps: 'transform,opacity' });
          item.style.removeProperty('transition');
        },
      }
    );
  });
}

export const REVEAL_ITEM_SELECTOR = ITEM;
