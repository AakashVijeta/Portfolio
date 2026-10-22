import { useEffect, useRef } from 'react';
import { SCOPE_SVG, SCOPE_LIVE } from './scopeArt';
import { mountScope } from './scopeLive';
import './iso.css';
import './scope.css';

// Isometric bench oscilloscope: the AVG knob sets how many noisy sweeps are
// averaged, and the trace settles onto the true signal as the count rises.
export default function SignalScope() {
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const countRef = useRef(null);
  const snrRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    // The art is injected here, not rendered, so React never swaps the nodes the live code holds
    stageRef.current.innerHTML = SCOPE_SVG;
    return mountScope(root, SCOPE_LIVE, (count, snr) => {
      if (countRef.current) countRef.current.textContent = count;
      if (snrRef.current) snrRef.current.textContent = snr;
    });
  }, []);

  return (
    <figure className="scope-figure" ref={rootRef}>
      <div className="scope-head">
        <span>FIG.01</span>
      </div>
      <div className="sc-card iso">
        <div
          className="sc-stage"
          ref={stageRef}
          tabIndex={0}
          role="slider"
          aria-label="Signal averager: move across or use the arrow keys to set how many sweeps are averaged"
          aria-valuemin={1}
          aria-valuemax={64}
        />
      </div>
      <figcaption className="scope-foot">
        <span className="scope-readout">
          <span ref={countRef}>AVG ×16</span>
          <span className="scope-sep">·</span>
          <span ref={snrRef} />
        </span>
      </figcaption>
    </figure>
  );
}
