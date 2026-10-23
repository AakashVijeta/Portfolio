import { useEffect, useRef } from 'react';
import { HDD_SVG, HDD_LIVE } from './hddArt';
import { mountHdd } from './hddLive';
import './iso.css';
import './hdd.css';

// Isometric 3.5" hard drive with its lid off: the actuator seeks across the
// platter, and the readout shows the track and the zoned data rate there.
export default function HardDrive() {
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const trackRef = useRef(null);
  const rateRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    // The art is injected here, not rendered, so React never swaps the nodes the live code holds
    stageRef.current.innerHTML = HDD_SVG;
    return mountHdd(root, HDD_LIVE, (trackText, rateText) => {
      if (trackRef.current) trackRef.current.textContent = trackText;
      if (rateRef.current) rateRef.current.textContent = rateText;
    });
  }, []);

  return (
    <figure className="hdd-figure" ref={rootRef}>
      <div className="hdd-head">
        <span>FIG.01</span>
      </div>
      <div className="hdd-card iso">
        <div
          className="hdd-stage"
          ref={stageRef}
          tabIndex={0}
          role="slider"
          aria-label="Hard drive: move across, or use the arrow keys, to seek the read head between the inner and outer tracks"
        />
      </div>
      <figcaption className="hdd-foot">
        <span className="hdd-readout">
          <span ref={trackRef}>PARKED</span>
          <span className="hdd-sep">·</span>
          <span ref={rateRef} />
        </span>
      </figcaption>
    </figure>
  );
}
