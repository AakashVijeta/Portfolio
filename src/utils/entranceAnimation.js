import gsap from 'gsap';
import { EASE_IN_OUT, EASE_OUT, prefersReducedMotion } from './motion';
import { scrambleTo } from './scramble';

const ITEM = '.section-enter-item';
// Media inside a reveal item that uncovers bottom to top as the item comes in
const WIPE = '.reveal-wipe';
const WIPE_HIDDEN = 'inset(100% 0% 0% 0%)';
// Heading lines that rise out of a mask (.reveal-line > span)
const LINE = '.reveal-line > span';
// Hairline rules that draw left to right
const RULE = '.reveal-rule';
// Small pieces (chips, log entries) that follow their item in, one after another
const CHILD = '.reveal-child';
// Text that scramble-decodes into place
const SCRAMBLE = '.reveal-scramble';

const parts = (items, sel) => items.flatMap((item) => [...item.querySelectorAll(sel)]);

// Where an item starts. Big blocks travel further than text rows (Linie: 50px vs 10px).
// data-enter-from="left|right" slides in sideways instead, but only while columns sit
// side by side (desktop); stacked on phones they fade up like everything else.
function fromState(item) {
  const side = item.dataset.enterFrom;
  if (side && window.matchMedia('(min-width: 901px)').matches) {
    return { opacity: 0, x: side === 'left' ? -40 : 40, y: 0 };
  }
  return { opacity: 0, x: 0, y: item.offsetHeight >= 200 ? 48 : 12 };
}

// Hide every reveal item inside `el` (they fade up as they enter the screen).
export function hideEntrance(el) {
  if (!el) return;
  el.querySelectorAll(ITEM).forEach((item) => gsap.set(item, fromState(item)));
  const wipes = el.querySelectorAll(WIPE);
  if (wipes.length) gsap.set(wipes, { clipPath: WIPE_HIDDEN });
  const lines = el.querySelectorAll(LINE);
  if (lines.length) gsap.set(lines, { yPercent: 105 });
  const rules = el.querySelectorAll(RULE);
  if (rules.length) gsap.set(rules, { scaleX: 0, transformOrigin: '0% 50%' });
  const kids = el.querySelectorAll(CHILD);
  if (kids.length) gsap.set(kids, { opacity: 0, y: 8 });
}

// Show items at once (scrolled past, or reduced motion)
export function showItems(items) {
  if (!items.length) return;
  gsap.set(items, { opacity: 1, x: 0, y: 0, clearProps: 'transform,opacity' });
  const wipes = parts(items, WIPE);
  if (wipes.length) gsap.set(wipes, { clearProps: 'clipPath' });
  const rest = parts(items, `${LINE}, ${RULE}, ${CHILD}`);
  if (rest.length) gsap.set(rest, { clearProps: 'transform,opacity' });
}

// Soft reveal for a batch of items entering together: fade up (or in from the side),
// staggered in DOM order. A section can change the step with data-enter-stagger.
export function revealItems(items) {
  if (!items.length) return;
  if (prefersReducedMotion()) {
    showItems(items);
    return;
  }
  const sorted = [...items].sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  sorted.forEach((item, i) => {
    const custom = parseFloat(item.closest('[data-enter-stagger]')?.dataset.enterStagger);
    const each = Number.isFinite(custom) ? custom : 0.06;
    const from = fromState(item);
    const delay = 0.08 + i * each;
    gsap.killTweensOf(item);
    // Suppress CSS transitions while GSAP drives the reveal (they fight frame by frame)
    item.style.setProperty('transition', 'none');
    gsap.fromTo(item, from, {
      opacity: 1,
      x: 0,
      y: 0,
      duration: from.y > 20 || from.x ? 0.85 : 0.65,
      delay,
      ease: EASE_OUT,
      force3D: true,
      onComplete: () => {
        gsap.set(item, { clearProps: 'transform,opacity' });
        item.style.removeProperty('transition');
      },
    });
    item.querySelectorAll(WIPE).forEach((wipe) => {
      gsap.fromTo(wipe, { clipPath: WIPE_HIDDEN }, {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 0.9,
        delay: delay + 0.15,
        ease: EASE_OUT,
        onComplete: () => gsap.set(wipe, { clearProps: 'clipPath' }),
      });
    });
    const lines = item.querySelectorAll(LINE);
    if (lines.length) {
      gsap.to(lines, { yPercent: 0, duration: 0.9, delay: delay + 0.05, stagger: 0.08, ease: EASE_OUT, clearProps: 'transform' });
    }
    // Rules draw with an even in-out sweep so the travel from left to right reads
    // (an out-curve covers most of the width in the first few frames)
    const rules = item.querySelectorAll(RULE);
    if (rules.length) {
      gsap.to(rules, { scaleX: 1, duration: 0.8, delay: delay + 0.1, ease: EASE_IN_OUT, clearProps: 'transform' });
    }
    const kids = item.querySelectorAll(CHILD);
    if (kids.length) {
      gsap.to(kids, { opacity: 1, y: 0, duration: 0.5, delay: delay + 0.25, stagger: 0.035, ease: EASE_OUT, clearProps: 'transform,opacity' });
    }
    item.querySelectorAll(SCRAMBLE).forEach((el) => {
      scrambleTo(el, el.textContent, { duration: 1.1, revealDelay: 0.35 })?.delay(delay + 0.1);
    });
  });
}

export const REVEAL_ITEM_SELECTOR = ITEM;
