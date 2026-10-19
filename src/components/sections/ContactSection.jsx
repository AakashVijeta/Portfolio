import { useLayoutEffect, useRef } from 'react';
import { useLayoutMode } from '../../hooks/useLayoutMode';
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
