import { useEffect, useRef } from 'react';

// Pointer devices only: an accent dot that follows the mouse with a live X/Y readout.
// No hover or press states; coordinates are written straight to the DOM each frame
// (no React re-render per mouse move).
export default function CustomCursor() {
  const dotRef = useRef(null);
  const labelRef = useRef(null);
  const enabled = typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  useEffect(() => {
    if (!enabled) return;
    const pos = { x: -100, y: -100 };
    let raf = 0;
    let dirty = false;

    const onMove = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      dirty = true;
    };

    const tick = () => {
      if (dirty) {
        dirty = false;
        if (dotRef.current) dotRef.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
        if (labelRef.current) {
          labelRef.current.style.transform = `translate(${pos.x + 14}px, ${pos.y + 8}px)`;
          labelRef.current.textContent = `X: ${pos.x} Y: ${pos.y}`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={dotRef} className="cc-dot" aria-hidden="true" />
      <div ref={labelRef} className="cc-label" aria-hidden="true">X: 0 Y: 0</div>
    </>
  );
}
