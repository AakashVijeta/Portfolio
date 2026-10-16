import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function KeyHints({ revealDelay = 1500 }) {
  const ref = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      gsap.fromTo(ref.current, { opacity: 0 }, { opacity: 1, duration: 0.6 });
    }, revealDelay);

    return () => clearTimeout(timer);
  }, [revealDelay]);

  return (
    <div
      ref={ref}
      className="key-hints"
      style={{
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(0.55rem, 0.9vw, 0.7rem)',
        letterSpacing: '0.3em',
        color: 'var(--color-muted)',
        textTransform: 'uppercase',
        opacity: 0,
        userSelect: 'none',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      <span>[↑][↓] navigate</span>
    </div>
  );
}
