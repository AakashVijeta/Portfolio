import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { useLayoutMode } from '../../hooks/useLayoutMode';
import { prefersReducedMotion } from '../../utils/motion';
import { scrambleTo } from '../../utils/scramble';
import RollText from '../RollText';


const EMAIL = 'aakashvijeta2@gmail.com';
const GITHUB = 'https://github.com/AakashVijeta';
const LINKEDIN = 'https://www.linkedin.com/in/aakash-vijeta-1bb42b2b9';
const RESUME = '/Aakash_Vijeta_Resume.pdf';

// What the command line says for each action: hovering or focusing a link rewrites it
const COMMANDS = {
  email:    { verb: 'send',  target: EMAIL },
  github:   { verb: 'open',  target: 'github.com/AakashVijeta' },
  linkedin: { verb: 'open',  target: 'linkedin.com/in/aakash-vijeta' },
  resume:   { verb: 'fetch', target: 'Aakash_Vijeta_Resume.pdf' },
  copied:   { verb: 'copied', target: 'to clipboard ✓' },
};
const COPIED_HOLD_MS = 1600;

// Copy text, falling back to a hidden textarea where the async clipboard isn't allowed
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}

export default function ContactSection({ isActive }) {
  const mode = useLayoutMode();
  const rootRef = useRef(null);
  const verbRef = useRef(null);
  const targetRef = useRef(null);
  const statusRef = useRef(null);
  const shown = useRef('email');
  const timers = useRef({ leave: 0, copied: 0 });

  // Rewrite the command line, scrambling only the parts that change
  const say = useCallback((key) => {
    if (shown.current === key) return;
    shown.current = key;
    const { verb, target } = COMMANDS[key];
    for (const [el, text] of [[verbRef.current, verb], [targetRef.current, target]]) {
      if (!el || el.textContent === text) continue;
      gsap.killTweensOf(el);
      scrambleTo(el, text, { duration: 0.5, revealDelay: 0.15, tweenLength: true });
    }
  }, []);
  const show = useCallback((key) => {
    clearTimeout(timers.current.leave);
    if (shown.current !== 'copied') say(key);
  }, [say]);
  // Leaving a link waits a beat, so moving between neighbours doesn't flash the default
  const rest = useCallback(() => {
    clearTimeout(timers.current.leave);
    timers.current.leave = setTimeout(() => { if (shown.current !== 'copied') say('email'); }, 180);
  }, [say]);
  const copy = useCallback(async () => {
    if (!(await copyText(EMAIL))) return;
    clearTimeout(timers.current.copied);
    say('copied');
    if (statusRef.current) statusRef.current.textContent = 'Email address copied to clipboard';
    timers.current.copied = setTimeout(() => {
      say('email');
      if (statusRef.current) statusRef.current.textContent = '';
    }, COPIED_HOLD_MS);
  }, [say]);
  useEffect(() => () => { clearTimeout(timers.current.leave); clearTimeout(timers.current.copied); }, []);
  const hover = (key) => ({ onPointerEnter: () => show(key), onPointerLeave: rest, onFocus: () => show(key), onBlur: rest });

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
        const x = gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power2.out' });
        const y = gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power2.out' });
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
            <span className="reveal-line"><span className="reveal-chars">Got an idea?</span></span>
            <span className="reveal-line"><span className="reveal-chars">Let&apos;s build it.</span></span>
          </h2>

          <div className="section-enter-item contact-command">
            <span className="contact-prompt">&gt;</span>
            <span ref={verbRef} className="contact-verb">send</span>
            <button
              type="button"
              ref={targetRef}
              className="contact-target contact-copy reveal-scramble"
              onClick={copy}
              title="Copy email address"
              aria-label={`Copy ${EMAIL} to the clipboard`}
            >
              {EMAIL}
            </button>
            <span className="contact-cursor">_</span>
            <span ref={statusRef} className="contact-sr" role="status" aria-live="polite" />
          </div>

          <div className="section-enter-item cm-actions">
            <a href={`mailto:${EMAIL}`} className="cm-primary" aria-label="Send email" {...hover('email')}><RollText text="[ SEND EMAIL → ]" /></a>
            <div className="cm-secondary">
              <a href={GITHUB} target="_blank" rel="noopener noreferrer" aria-label="GitHub" {...hover('github')}><span className="cm-br">[</span>GITHUB<span className="cm-br">]</span></a>
              <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" {...hover('linkedin')}><span className="cm-br">[</span>LINKEDIN<span className="cm-br">]</span></a>
              <a href={RESUME} target="_blank" rel="noopener" aria-label="Résumé (PDF)" {...hover('resume')}><span className="cm-br">[</span>RÉSUMÉ<span className="cm-br">]</span></a>
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
