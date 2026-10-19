import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);

// The same curves as the CSS tokens in themes.css (--ease-out, --ease-in-out)
export const EASE_OUT = CustomEase.create('ui-out', '0.23, 1, 0.32, 1');
export const EASE_IN_OUT = CustomEase.create('ui-in-out', '0.77, 0, 0.175, 1');

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Tick the first number in `el`'s text up from zero, keeping its decimals and the text
// around it ("+22.4%", "11/17", "99.9%"). Writes to the existing text node so React
// keeps owning it, and stops if React rewrites the text mid-count.
export function countUp(el, { duration = 1.2 } = {}) {
  const node = el?.firstChild;
  if (!node || node.nodeType !== Node.TEXT_NODE || prefersReducedMotion()) return null;
  const text = node.nodeValue;
  const m = text.match(/\d+(?:\.\d+)?/);
  if (!m) return null;
  const decimals = m[0].split('.')[1]?.length ?? 0;
  const head = text.slice(0, m.index);
  const tail = text.slice(m.index + m[0].length);
  const n = { v: 0 };
  // Zero straight away, so a delayed count never shows the real value first
  let last = node.nodeValue = head + (0).toFixed(decimals) + tail;
  const tween = gsap.to(n, {
    v: parseFloat(m[0]),
    duration,
    ease: 'expo.out',
    onUpdate: () => {
      if (node.nodeValue !== last) { tween.kill(); return; }
      last = node.nodeValue = head + n.v.toFixed(decimals) + tail;
    },
  });
  // Put the real text back if the count is cut short (a context revert skips onUpdate)
  tween.restore = () => { if (node.nodeValue === last) node.nodeValue = text; };
  return tween;
}

// The boot screen plays once per session, and never with reduced motion
export const skipPreloader = () =>
  !!sessionStorage.getItem('preloaded') || prefersReducedMotion();
