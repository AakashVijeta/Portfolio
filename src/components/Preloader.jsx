import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import '../styles/Preloader.css';

const LOG_LINES = [
  '> PACKET_LOSS_0%',
  '> AWAITING_DATABASE...',
  '> DOWNLOADING_ASSETS...',
  '> ESTABLISHING_SECURE_LINK',
  '> HANDSHAKE_COMPLETE',
];

const TOTAL_MS = 2400;
const EXIT_MS  = 3000;
const DONE_MS  = 3800;
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
  const [stage, setStage]       = useState(() =>
    sessionStorage.getItem('preloaded') ? 'done' : 'active'
  );
  const [pct, setPct]           = useState(0);
  const [logCount, setLogCount] = useState(0);
  const [freq, setFreq]         = useState(12.4);

  const signalRef   = useRef(null);  // SVG <path> element
  const waveRafRef  = useRef(null);
  const ampRef      = useRef(MAX_AMP); // GSAP tweens this 58 → 0
  const contentRef  = useRef(null);
  const curtainTRef = useRef(null);
  const curtainBRef = useRef(null);
  const edgeTRef    = useRef(null);
  const edgeBRef    = useRef(null);

  // ── GSAP: amplitude collapse → curtain exit ────────────────────────────────
  useEffect(() => {
    if (!signalRef.current) return;
    const ctx = gsap.context(() => {
      gsap.timeline()
        .to(ampRef, {
          current: 0,
          duration: TOTAL_MS / 1000,
          ease: 'power2.inOut',
        })
        .to([edgeTRef.current, edgeBRef.current], {
          opacity: 1, duration: 0.12, ease: 'none',
        }, '<90%')
        .to(contentRef.current, {
          opacity: 0, duration: 0.15, ease: 'none',
        })
        .to(curtainTRef.current, {
          yPercent: -100, duration: 0.6, ease: 'power2.inOut',
        }, '<0.05')
        .to(curtainBRef.current, {
          yPercent:  100, duration: 0.6, ease: 'power2.inOut',
        }, '<')
        .to([edgeTRef.current, edgeBRef.current], {
          opacity: 0, duration: 0.3, ease: 'power2.in',
        }, '>-0.25');
    });
    return () => ctx.revert();
  }, []);

  // ── RAF: rebuild signal every frame ───────────────────────────────────────
  useEffect(() => {
    if (stage === 'done' || !signalRef.current) return;
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

  // ── Progress + log + freq readout ─────────────────────────────────────────
  useEffect(() => {
    if (stage === 'done') return;

    const lineInterval = (TOTAL_MS * 0.85) / LOG_LINES.length;
    const timers = LOG_LINES.map((_, i) =>
      setTimeout(() => setLogCount(i + 1), i * lineInterval + 300)
    );

    const start = performance.now();
    let lastFreqUpdate = 0;
    let pctRaf;
    const tick = (now) => {
      const p = Math.min((now - start) / TOTAL_MS, 1);
      setPct(Math.floor(p * 100));
      if (now - lastFreqUpdate > 60) {
        setFreq(+(8 + Math.random() * 18).toFixed(1));
        lastFreqUpdate = now;
      }
      if (p < 1) pctRaf = requestAnimationFrame(tick);
      else setPct(100);
    };
    pctRaf = requestAnimationFrame(tick);

    const t1 = setTimeout(() => {
      setStage('exit');
      window.dispatchEvent(new Event('preloader:done'));
    }, EXIT_MS);
    const t2 = setTimeout(() => {
      setStage('done');
      sessionStorage.setItem('preloaded', '1');
    }, DONE_MS);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(t1);
      clearTimeout(t2);
      cancelAnimationFrame(pctRaf);
    };
  }, [stage]);

  if (stage === 'done') return null;

  const W    = window.innerWidth;
  const done = pct === 100;

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
          <span className={`pl-badge ${done ? 'pl-badge--ok' : ''}`}>
            {done ? 'DECRYPTED' : 'ENCRYPTED'}
          </span>
        </div>

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
          <span className="pl-pct">{pct}%</span>
        </div>

        <div className="pl-log">
          {LOG_LINES.slice(0, logCount).map((line, i) => (
            <div key={i} className="pl-log-line">{line}</div>
          ))}
        </div>

      </div>
    </div>
  );
}
