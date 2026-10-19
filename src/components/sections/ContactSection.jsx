import { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { useLayoutMode } from '../../hooks/useLayoutMode';
import { prefersReducedMotion } from '../../utils/motion';
import RollText from '../RollText';


const EMAIL = 'aakashvijeta2@gmail.com';
const GITHUB = 'https://github.com/AakashVijeta';
const LINKEDIN = 'https://www.linkedin.com/in/aakash-vijeta-1bb42b2b9';
const RESUME = '/Aakash_Vijeta_Resume.pdf';

export default function ContactSection({ isActive }) {
  const mode = useLayoutMode();
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    if (!isActive) return;
  }, [isActive]);

  // Desktop pointers: the send button and the bracket links lean a few pixels toward
  // the pointer while it is over them, and settle back when it leaves
  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const ctx = gsap.context(() => {
      const offs = [...root.querySelectorAll('.cm-primary, .cm-secondary a')].map((el) => {
        // GSAP owns transform here; the site-wide link transition would trail every frame
        el.style.transitionProperty = 'color, background-color, border-color, box-shadow, opacity';
        const x = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
        const y = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
        const reach = el.matches('.cm-primary') ? 6 : 4;
        const move = (e) => {
          const r = el.getBoundingClientRect();
          const cx = r.left + r.width / 2 - gsap.getProperty(el, 'x');
          const cy = r.top + r.height / 2 - gsap.getProperty(el, 'y');
          x(gsap.utils.clamp(-1, 1, (e.clientX - cx) / (r.width / 2)) * reach);
          y(gsap.utils.clamp(-1, 1, (e.clientY - cy) / (r.height / 2)) * reach);
        };
        const leave = () => { x(0); y(0); };
        el.addEventListener('pointermove', move);
        el.addEventListener('pointerleave', leave);
        return () => {
          el.removeEventListener('pointermove', move);
          el.removeEventListener('pointerleave', leave);
          el.style.removeProperty('transition-property');
        };
      });
      return () => offs.forEach((off) => off());
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="section section-stripe contact-section"
      style={mode === 'paged' ? {
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'center',
        padding: 0,
        overflow: 'hidden',
      } : undefined}
    >

      {/* A huge, barely-there line of text tilted behind everything */}
      <div className="contact-ghost" aria-hidden="true" data-parallax="120">LET&apos;S BUILD // OPEN TO WORK // LET&apos;S BUILD //</div>

      <div className="contact-main">
        <div className="contact-content-inner">
          <div className="section-enter-item contact-line">
            <span className="contact-line-dot" />LINE OPEN
          </div>

          <h2 className="section-enter-item contact-heading">
            <span className="reveal-line"><span>Got an idea?</span></span>
            <span className="reveal-line"><span>Let&apos;s build it.</span></span>
          </h2>

          <div className="section-enter-item contact-command">
            <span className="contact-prompt">&gt;</span>
            <span className="contact-verb">send</span>
            <span className="contact-target reveal-scramble">{EMAIL}</span>
            <span className="contact-cursor">_</span>
          </div>

          <div className="section-enter-item cm-actions">
            <a href={`mailto:${EMAIL}`} className="cm-primary" aria-label="Send email"><RollText text="[ SEND EMAIL → ]" /></a>
            <div className="cm-secondary">
              <a href={GITHUB} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><span className="cm-br">[</span>GITHUB<span className="cm-br">]</span></a>
              <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><span className="cm-br">[</span>LINKEDIN<span className="cm-br">]</span></a>
              <a href={RESUME} target="_blank" rel="noopener" aria-label="Résumé (PDF)"><span className="cm-br">[</span>RÉSUMÉ<span className="cm-br">]</span></a>
            </div>
          </div>

          <div className="section-enter-item contact-sign">
            <span>© 2026 AAKASH VIJETA</span>
          </div>
        </div>
      </div>

      {/* Bottom meta */}
      <footer className="contact-bottombar section-enter-item">
        <hr className="profiler-rule reveal-rule" />
        <div className="contact-bottombar-inner">
          <span>END · TRANSMISSION</span>
          <span>PROTOCOL · SMTP</span>
        </div>
      </footer>
    </section>
  );
}
