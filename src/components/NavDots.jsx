import { useState } from 'react';
import { useSectionContext, SECTIONS, SECTION_LABELS } from '../context/SectionContext';

export default function NavDots() {
  const { activeIndex, isTransitioning, navigateTo } = useSectionContext();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <nav
      aria-label="Section navigation"
      style={{
        position: 'fixed',
        right: '8px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 10002,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      {SECTIONS.map((_, i) => {
        const isActive = i === activeIndex;
        const isHovered = i === hoveredIndex;

        return (
          <button
            key={i}
            className="nav-dot-btn"
            aria-label={`Go to ${SECTION_LABELS[i]}`}
            disabled={isTransitioning}
            onClick={() => navigateTo(i)}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{
              all: 'unset',
              cursor: isTransitioning ? 'default' : 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: isHovered ? '6px' : '0px',
              // Fixed-width column so the dots hug the edge; the hover label overflows centred
              width: '40px',
              boxSizing: 'border-box',
              padding: '11px 0',
              transition: 'gap 0.2s ease',
            }}
          >
            {/* Dot */}
            <span style={{
              display: 'block',
              width: isActive ? '9px' : '7px',
              height: isActive ? '9px' : '7px',
              borderRadius: '50%',
              flexShrink: 0,
              background: isActive ? 'var(--color-accent)' : isHovered ? 'var(--color-text)' : 'transparent',
              border: isActive ? 'none' : `1px solid ${isHovered ? 'var(--color-text)' : 'var(--color-muted)'}`,
              opacity: isActive ? 1 : isHovered ? 0.85 : 0.45,
              boxShadow: isActive
                ? '0 0 8px var(--color-accent), 0 0 0 3px rgba(0,0,0,0.8)'
                : '0 0 0 3px rgba(0,0,0,0.8)',
              transition: 'all 0.25s',
            }} />

            {/* Label — slides in below */}
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.55rem',
              letterSpacing: '0.12em',
              color: isActive ? 'var(--color-accent)' : 'var(--color-text)',
              textTransform: 'uppercase',
              textShadow: '0 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.9)',
              maxHeight: isHovered ? '20px' : '0px',
              opacity: isHovered ? 1 : 0,
              overflow: 'hidden',
              transition: 'max-height 0.22s ease, opacity 0.18s ease',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}>
              {SECTION_LABELS[i]}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
