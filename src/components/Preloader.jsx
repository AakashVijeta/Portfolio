import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { EASE_IN_OUT, skipPreloader } from '../utils/motion';
import '../styles/Preloader.css';

const LOG_LINES = [
  '> BOOT_SEQ_05',
  '> MOUNTING_DATASETS...',
  '> LOADING_MODEL_WEIGHTS',
  '> WARMING_FEATURE_CACHE',
  '> CALIBRATING_PROBABILITIES',
  '> RESOLVING_HOST',
  '> PACKET_LOSS_0%',
  '> AWAITING_DATABASE...',
  '> ESTABLISHING_SECURE_LINK',
  '> HANDSHAKE_COMPLETE',
];
// Top-right readouts: jittering latitude around IIT Guwahati and a 4x4 block of noise
const LAT_BASE = 26.18;
const GRID_CELLS = 16;
const rnd2 = () => String(Math.floor(Math.random() * 100));
const pad2 = (n) => String(n).padStart(2, '0');

// One timeline drives the whole sequence (seconds)
const SCAN_S   = 2.4;   // the signal flattens while the counter runs to 100
const HOLD_S   = 0.45;  // ACCESS GRANTED holds long enough to read
const FADE_S   = 0.25;  // everything but the hairline fades
const SPLIT_S  = 0.8;   // the two halves slide apart
const SVG_H    = 60;
const CY       = SVG_H / 2;          // 30
const MAX_AMP  = SVG_H - 2;          // 58px — fills the SVG height
const NUM_PTS  = 140;                 // dense enough to look electronic

// Rebuild signal path from scratch — pure Math.random() per point, no interpolation.
// Adjacent points are completely uncorrelated; that discontinuity IS the effect.
function buildPath(W, amp) {
  if (amp < 0.5) return `M 0,${CY} L ${W},${CY}`;

  // Occasionally vary step size so density fluctuates across the signal
  let d = `M 0,${CY + (Math.random() - 0.5) * amp}`;
  let x = 0;
  while (x < W) {
    // Variable step: usually tight, occasionally wider (creates sparse/dense regions)
    const step = Math.random() < 0.08
      ? W / NUM_PTS * (2 + Math.random() * 3)   // occasional large jump
      : W / NUM_PTS * (0.4 + Math.random() * 1.2);
    x = Math.min(x + step, W);

    const y = CY + (Math.random() - 0.5) * amp;

    // Packet loss: ~2% of segments become gaps (moveTo instead of lineTo)
    if (Math.random() < 0.02) {
      d += ` M ${x.toFixed(1)},${y.toFixed(2)}`;
    } else {
      d += ` L ${x.toFixed(1)},${y.toFixed(2)}`;
    }
  }
  return d;
}

export default function Preloader() {
  const [stage, setStage]       = useState(() => (skipPreloader() ? 'done' : 'active'));
  const [done, setDone]         = useState(false);
  const [logCount, setLogCount] = useState(0);
  const [freq, setFreq]         = useState(12.4);
  const [lat, setLat]           = useState(LAT_BASE.toFixed(4));
  const [grid, setGrid]         = useState(() => Array.from({ length: GRID_CELLS }, rnd2));

  const signalRef   = useRef(null);  // SVG <path> element
  const waveRafRef  = useRef(null);
  const ampRef      = useRef(MAX_AMP); // GSAP tweens this 58 → 0
  const pctRef      = useRef(null);
  const contentRef  = useRef(null);
  const curtainTRef = useRef(null);
  const curtainBRef = useRef(null);
  const edgeTRef    = useRef(null);
  const edgeBRef    = useRef(null);

  // ── GSAP: the signal collapses as the counter and log run → ACCESS GRANTED holds →
  // everything but the hairline fades → the hairline splits and the two halves slide
  // apart, opening the site between them ─────────────────────────────────────────
  useEffect(() => {
    if (!signalRef.current) return;
    const edges = [edgeTRef.current, edgeBRef.current];
    const count = { v: 0 };
    const lineStep = (SCAN_S * 0.85) / LOG_LINES.length;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          sessionStorage.setItem('preloaded', '1');
          setStage('done');
        },
      });
      tl.to(ampRef, { current: 0, duration: SCAN_S, ease: 'power2.inOut' }, 0)
        // the counter is written straight to the DOM, so it never re-renders React
        .to(count, {
          v: 100,
          duration: SCAN_S,
          ease: 'none',
          onUpdate: () => {
            if (pctRef.current) pctRef.current.textContent = `${count.v >= 100 ? 100 : pad2(Math.floor(count.v))}%`;
          },
        }, 0);
      LOG_LINES.forEach((_, i) => tl.call(setLogCount, [i + 1], 0.3 + i * lineStep));
      tl.call(setDone, [true], SCAN_S)
        .addLabel('exit', `+=${HOLD_S}`)
        // the hero mounts under the fading HUD and starts unfolding as the halves part
        .call(() => {
          setStage('exit');
          window.dispatchEvent(new CustomEvent('preloader:done', { detail: { openIn: FADE_S } }));
        }, null, 'exit')
        // the curtain edges sit exactly on the hairline, so swapping them in is invisible
        .set(edges, { opacity: 1 }, 'exit')
        .to(contentRef.current, { opacity: 0, duration: FADE_S, ease: 'power1.out' }, 'exit')
        .addLabel('split')
        .to(curtainTRef.current, { yPercent: -100, duration: SPLIT_S, ease: EASE_IN_OUT }, 'split')
        .to(curtainBRef.current, { yPercent: 100, duration: SPLIT_S, ease: EASE_IN_OUT }, 'split')
        .to(edges, { opacity: 0, duration: 0.25, ease: 'power2.in' }, `split+=${SPLIT_S - 0.25}`);
    });
    return () => ctx.revert();
  }, []);

  // ── RAF: rebuild signal every frame (only while the HUD is up) ─────────────
  useEffect(() => {
    if (stage !== 'active' || !signalRef.current) return;
    const W = window.innerWidth;

    const tick = () => {
      if (signalRef.current) {
        signalRef.current.setAttribute('d', buildPath(W, ampRef.current));
      }
      waveRafRef.current = requestAnimationFrame(tick);
    };
    waveRafRef.current = requestAnimationFrame(tick);
    return () => { if (waveRafRef.current) cancelAnimationFrame(waveRafRef.current); };
  }, [stage]);

  // ── Freq / latitude / noise readouts jitter until the scan locks ───────────
  useEffect(() => {
    if (stage !== 'active' || done) return;
    const id = setInterval(() => {
      setFreq(+(8 + Math.random() * 18).toFixed(1));
      setLat((LAT_BASE + Math.random() * 0.01).toFixed(4));
      setGrid(Array.from({ length: GRID_CELLS }, rnd2));
    }, 60);
    return () => clearInterval(id);
  }, [stage, done]);

  if (stage === 'done') return null;

  const W = window.innerWidth;

  return (
    <div className={`pl ${stage === 'exit' ? 'pl--exit' : ''}`}>

      <div className="pl-curtain-t" ref={curtainTRef}>
        <div className="pl-curtain-edge pl-curtain-edge--t" ref={edgeTRef} />
      </div>
      <div className="pl-curtain-b" ref={curtainBRef}>
        <div className="pl-curtain-edge pl-curtain-edge--b" ref={edgeBRef} />
      </div>

      <div className="pl-content" ref={contentRef}>

        <div className="pl-scan-box" />
        <div className="pl-corner pl-corner--tl" />
        <div className="pl-corner pl-corner--br" />

        <div className="pl-hud-tr">
          <div className="pl-radar">
            <div className="pl-radar-sweep" />
          </div>
          <span className="pl-coord">LAT: {lat} N</span>
          <span className={`pl-badge ${done ? 'pl-badge--ok' : ''}`}>
            {done ? 'DECRYPTED' : 'ENCRYPTED'}
          </span>
          <div className="pl-grid" aria-hidden="true">
            {grid.map((n, i) => <span key={i}>{n}</span>)}
          </div>
        </div>

        {/* Hairline across the screen through the counter */}
        <div className="pl-hairline" />

        <div className="pl-centerline">
          <div className="pl-freq-label">FREQ: {freq} Hz</div>
          <div className="pl-signal-wrap">
            <svg
              className="pl-signal-svg"
              width={W}
              height={SVG_H}
              viewBox={`0 0 ${W} ${SVG_H}`}
              preserveAspectRatio="none"
            >
              <path
                ref={signalRef}
                d={`M 0,${CY} L ${W},${CY}`}
                className="pl-signal-path"
              />
            </svg>
          </div>
          <div className={`pl-status-label ${done ? 'pl-status-label--done' : ''}`}>
            {done ? 'ACCESS GRANTED' : 'SIGNAL TRACING...'}
          </div>
        </div>

        <div className="pl-pct-wrap">
          <span ref={pctRef} className="pl-pct">00%</span>
        </div>

        <div className="pl-log">
          {/* Older lines fade back as new ones arrive */}
          {LOG_LINES.slice(0, logCount).map((line, i) => (
            <div key={i} className="pl-log-line" style={{ '--age': logCount - 1 - i }}>{line}</div>
          ))}
        </div>

      </div>
    </div>
  );
}
