const EMAIL = 'aakashvijeta2@gmail.com';
const GITHUB = 'https://github.com/AakashVijeta';
const LINKEDIN = 'https://linkedin.com/in/aakashvijeta';

export default function ContactSection() {
  return (
    <section
      className="section section-stripe"
      style={{
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'space-between',
        padding: '64px 6vw 56px',
      }}
    >
      {/* Top classification */}
      <div className="section-enter-item" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        paddingBottom: '12px',
        borderBottom: '1px solid var(--color-border)',
        fontFamily: 'var(--font-display)',
        fontSize: '0.8rem',
        letterSpacing: '0.35em',
        color: 'var(--color-muted)',
        textTransform: 'uppercase',
      }}>
        <span style={{ color: 'var(--color-accent)' }}>
          <span className="intro-dot" /> CHANNEL · OPEN
        </span>
        <span>PROTOCOL · SMTP</span>
      </div>

      {/* Center: command + target */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        alignItems: 'flex-start',
      }}>
        <div className="section-enter-item" style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1rem',
          letterSpacing: '0.45em',
          color: 'var(--color-accent)',
          textTransform: 'uppercase',
        }}>
          Initiate Contact
          <div className="speed-line" />
        </div>

        <div className="section-enter-item contact-command">
          <span className="contact-prompt">&gt;</span>
          <span className="contact-verb">send</span>
          <span className="contact-target">{EMAIL}</span>
          <span className="contact-cursor">_</span>
        </div>

        <div className="section-enter-item" style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginTop: '8px' }}>
          <a
            href={`mailto:${EMAIL}`}
            className="contact-bracket-box"
          >
            [ INITIATE CONTACT ] 
          </a>
          <a
            href={GITHUB}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-bracket-box"
          >
            [ GITHUB ]
          </a>
          <a
            href={LINKEDIN}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-bracket-box"
          >
            [ LINKEDIN ]
          </a>
        </div>

        <div className="section-enter-item contact-dossier">
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

      {/* Bottom meta */}
      <div className="section-enter-item" style={{
        display: 'flex',
        justifyContent: 'space-between',
        paddingTop: '12px',
        borderTop: '1px solid var(--color-border)',
        fontFamily: 'var(--font-display)',
        fontSize: '0.8rem',
        letterSpacing: '0.3em',
        color: 'var(--color-muted)',
        textTransform: 'uppercase',
      }}>
        <span>END · TRANSMISSION</span>
        <span>SIG · AV-07</span>
      </div>
    </section>
  );
}
