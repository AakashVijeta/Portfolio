import gsap from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { prefersReducedMotion } from './motion';

gsap.registerPlugin(ScrambleTextPlugin);

// Glyph pool for the scramble-decode effect
export const SCRAMBLE_CHARS = 'Ñ@#W$9876543210?!abcxyz;:+=-,._ ';

// Decode `el` into `text` (default: its current text): ~half the time pure scramble,
// then the real letters lock in left to right.
export function scrambleTo(el, text = el.textContent, { duration = 1, revealDelay = 0.5, tweenLength = false } = {}) {
  if (!el) return null;
  if (prefersReducedMotion()) {
    el.textContent = text;
    return null;
  }
  return gsap.to(el, {
    duration,
    ease: 'none',
    scrambleText: { text, chars: SCRAMBLE_CHARS, revealDelay, tweenLength },
  });
}
