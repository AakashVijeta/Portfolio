import { useLayoutEffect, useRef } from 'react';
import KeyHints from '../KeyHints';
import { useLayoutMode } from '../../hooks/useLayoutMode';


const EMAIL = 'aakashvijeta2@gmail.com';
const GITHUB = 'https://github.com/AakashVijeta';
const LINKEDIN = 'https://www.linkedin.com/in/aakash-vijeta-1bb42b2b9';

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
      {/* Top classification */}
      <header className="contact-topbar section-enter-item">
        <div className="contact-topbar-row">
          <h2 className="contact-title-main">SOCIALS</h2>
          <div className="contact-topmeta">
            <div style={{ color: 'var(--color-accent)' }}>
              <span className="intro-dot" /> CHANNEL · OPEN
            </div>
          </div>
        </div>
        <hr className="profiler-rule" />
      </header>

      {/* Center: command + target */}
      <div className="contact-main">
        <div className="contact-content-inner">
          <div className="section-enter-item" style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            letterSpacing: '0.45em',
            color: 'var(--color-accent)',
            textTransform: 'uppercase',
            marginBottom: '24px',
          }}>
            <span className="contact-title">Initiate Contact</span>
          </div>

          <div className="section-enter-item contact-command">
            <span className="contact-prompt">&gt;</span>
            <span className="contact-verb">send</span>
            <span className="contact-target">{EMAIL}</span>
            <span className="contact-cursor">_</span>
          </div>

          <div className="section-enter-item" style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginTop: '32px' }}>
            <a href={`mailto:${EMAIL}`} className="contact-bracket-box">[ INITIATE CONTACT ]</a>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="contact-bracket-box">[ GITHUB ]</a>
            <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" className="contact-bracket-box">[ LINKEDIN ]</a>
          </div>

          <div className="section-enter-item contact-dossier" style={{ marginTop: '48px' }}>
            <div className="intro-dossier-line">
              <span>RESPONSE</span>
              <span>&lt; 24H</span>
            </div>
            <div className="intro-dossier-line">
              <span>TIMEZONE</span>
              <span>UTC+05:30 · IST</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom meta */}
      <footer className="contact-bottombar section-enter-item">
        <hr className="profiler-rule" />
        <div className="contact-bottombar-inner">
          <span>END · TRANSMISSION</span>
          <KeyHints />
          <span>PROTOCOL · SMTP</span>
        </div>
      </footer>
    </section>
  );
}
