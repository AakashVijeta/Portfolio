import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);

// The same curves as the CSS tokens in themes.css (--ease-out, --ease-in-out)
export const EASE_OUT = CustomEase.create('ui-out', '0.23, 1, 0.32, 1');
export const EASE_IN_OUT = CustomEase.create('ui-in-out', '0.77, 0, 0.175, 1');

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
