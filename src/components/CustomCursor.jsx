import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const posRef = useRef({ x: -100, y: -100 });
  const dotRef = useRef(null);
  const labelRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const rafRef = useRef(null);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const onMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      setCoords({ x: e.clientX, y: window.innerHeight - e.clientY });

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const { x, y } = posRef.current;
        if (dotRef.current) {
          dotRef.current.style.transform = `translate(${x}px, ${y}px)`;
        }
        if (labelRef.current) {
          labelRef.current.style.transform = `translate(${x + 14}px, ${y + 2}px)`;
        }
      });
    };

    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return null;

  return (
    <>
      {/* Square cursor dot */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '8px',
          height: '8px',
          background: 'var(--color-accent)',
          pointerEvents: 'none',
          zIndex: 99999,
          willChange: 'transform',
          transform: 'translate(-100px, -100px)',
        }}
      />
      {/* Coordinate label */}
      <div
        ref={labelRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6rem',
          letterSpacing: '0.08em',
          color: 'var(--color-accent)',
          pointerEvents: 'none',
          zIndex: 99999,
          willChange: 'transform',
          transform: 'translate(-100px, -100px)',
          textShadow: '0 1px 4px rgba(0,0,0,0.9)',
          lineHeight: 1.4,
          whiteSpace: 'nowrap',
        }}
      >
        X: {coords.x} Y: {coords.y}
      </div>
    </>
  );
}
