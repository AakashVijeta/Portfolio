import ParticlePortrait from '../ParticlePortrait';

const skills = [
  'Python', 'React', 'TypeScript', 'FastAPI', 'scikit-learn',
  'XGBoost', 'PostgreSQL', 'Docker', 'Vite', 'GSAP',
];

export default function AboutSection() {
  return (
    <section
      className="section section-stripe about-section"
      style={{
        flexDirection: 'row',
        gap: '60px',
        padding: '0 8vw',
        alignItems: 'center',
      }}
    >
      <div
        className="section-enter-item about-portrait"
        style={{ flexShrink: 0 }}
      >
        <ParticlePortrait />
      </div>

      <div style={{ maxWidth: '480px' }}>
        <div
          className="section-enter-item"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.65rem',
            letterSpacing: '0.4em',
            color: 'var(--color-accent)',
            textTransform: 'uppercase',
            marginBottom: '20px',
          }}
        >
          About
        </div>

        <p
          className="section-enter-item"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(0.85rem, 1.5vw, 0.95rem)',
            lineHeight: 1.75,
            color: 'var(--color-text)',
            marginBottom: '28px',
          }}
        >
          I build intelligent systems at the intersection of machine learning,
          software engineering, and applied mathematics. Currently studying
          Data Science &amp; AI at IIT Guwahati — shipping things that are
          both technically rigorous and actually useful.
        </p>

        <div className="section-enter-item" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {skills.map(skill => (
            <span
              key={skill}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.65rem',
                letterSpacing: '0.15em',
                color: 'var(--color-accent)',
                border: '1px solid var(--color-border)',
                padding: '4px 10px',
                textTransform: 'uppercase',
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
