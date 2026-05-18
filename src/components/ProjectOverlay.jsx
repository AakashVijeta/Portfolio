import { useEffect } from 'react';
import gsap from 'gsap';
import { useSectionContext } from '../context/SectionContext';

export default function ProjectOverlay() {
  const { overlayProject, setOverlayProject } = useSectionContext();

  useEffect(() => {
    if (!overlayProject) return;
    gsap.fromTo('.project-overlay-inner',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
    );
    const onKey = (e) => { if (e.key === 'Escape') setOverlayProject(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [overlayProject, setOverlayProject]);

  if (!overlayProject) return null;
  const p = overlayProject;

  return (
    <div
      onClick={() => setOverlayProject(null)}
      style={{
        position: 'fixed', inset: 0, zIndex: 10001,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="project-overlay-inner"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '6px',
          maxWidth: '720px',
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          padding: 'clamp(20px, 5vw, 36px) clamp(18px, 5vw, 40px)',
          fontFamily: 'var(--font-body)',
          color: 'var(--color-text)',
          position: 'relative',
        }}
      >
        <button
          onClick={() => setOverlayProject(null)}
          style={{
            all: 'unset', cursor: 'pointer',
            position: 'absolute', top: '16px', right: '20px',
            fontFamily: 'var(--font-display)', fontSize: '0.75rem',
            letterSpacing: '0.2em', color: 'var(--color-muted)',
          }}
        >
          [ ESC ]
        </button>

        <div style={{ fontSize: '0.65rem', letterSpacing: '0.3em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '8px' }}>
          {p.tag}
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.1rem, 3vw, 1.6rem)', marginBottom: '16px', letterSpacing: '0.05em' }}>
          {p.title}
        </h2>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', marginBottom: '20px', lineHeight: 1.6 }}>
          {p.subtitle}
        </p>

        <div className="overlay-links">
          {p.repos && p.repos.map(r => (
            <a key={r.label} href={r.href} target="_blank" rel="noopener noreferrer"
              className="overlay-link overlay-link-secondary">
              {r.label}
            </a>
          ))}
          {p.liveDemo && (
            <a href={p.liveDemo} target="_blank" rel="noopener noreferrer"
              className="overlay-link overlay-link-primary">
              Live Demo →
            </a>
          )}
        </div>

        {p.overview && p.overview.map((para, i) => (
          <p key={i} style={{ fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '12px', color: 'var(--color-text)' }}>
            {para}
          </p>
        ))}
      </div>
    </div>
  );
}
