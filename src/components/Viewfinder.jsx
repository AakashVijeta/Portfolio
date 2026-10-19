import { useEffect, useRef } from 'react';

const pad = (n, l = 2) => String(n).padStart(l, '0');

// Camera viewfinder readouts pinned to the four screen corners for the whole page
// (desktop pointers; styles in desktop.css). The clock writes straight to the DOM each
// frame so it never re-renders React.
export default function Viewfinder() {
  const clockRef = useRef(null);

  useEffect(() => {
    let raf;
    const tick = () => {
      const now = new Date();
      if (clockRef.current) {
        clockRef.current.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.${pad(now.getMilliseconds(), 3)}`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="viewfinder" aria-hidden="true">
      <span className="vf-tl"><b>CAM_01 [REC]</b><i>SIGNAL_STRONG</i></span>
      <span className="vf-tr"><b ref={clockRef}>00:00:00.000</b><i>ISO 800</i></span>
      <span className="vf-bl"><b><span className="vf-dot" />LIVE FEED</b></span>
      <span className="vf-br"><b>SYS. DIAGNOSTIC</b><i>STABLE</i></span>
    </div>
  );
}
