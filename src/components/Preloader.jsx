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
// Overall length = DONE_MS (was 4800ms, now 3800ms — 1s shorter).
const SVG_H    = 60;
const CY       = SVG_H / 2;

function lcg(seed) {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(1664525, s) + 1013904223 >>> 0;
    return s / 0xffffffff;
  };
}

function genNoiseLayers(W) {
  const rand = lcg(0xdeadbeef);
  const coarseStep  = 50;
  const coarseCount = Math.ceil(W / coarseStep) + 2;
  const coarse      = Array.from({ length: coarseCount }, () => rand() * 2 - 1);
  const fineStep    = 3;
  const fineCount   = Math.ceil(W / fineStep) + 2;
  const fine        = Array.from({ length: fineCount }, () => rand() * 2 - 1);
  return { coarse, coarseStep, fine, fineStep };
}

function lerp(a, b, t) { return a + (b - a) * t; }

function buildSignalPath(layers, amp = 24) {
  const W = window.innerWidth;
  const { coarse, coarseStep, fine, fineStep } = layers;
  const points = [];
  let fi = 0;

  for (let x = 0; x <= W; x += fineStep) {
    const ci        = x / coarseStep;
    const ciFlr     = Math.floor(ci);
    const coarseVal = lerp(coarse[ciFlr] ?? 0, coarse[ciFlr + 1] ?? 0, ci - ciFlr);
    const fineVal   = (fine[fi] ?? 0) * 0.25;
    fi++;
    const y = CY + amp * (coarseVal + fineVal);
    points.push(`${x.toFixed(0)},${y.toFixed(2)}`);
  }
  return 'M ' + points.join(' L ');
}

export default function Preloader() {
  const [stage, setStage]       = useState(() =>
    sessionStorage.getItem('preloaded') ? 'done' : 'active'
  );
  const [pct, setPct]           = useState(0);
  const [logCount, setLogCount] = useState(0);
  const [freq, setFreq]         = useState(12.4);
  const [amplitude, setAmplitude] = useState(24);

  const rafRef       = useRef(null);
  const layerRef     = useRef(null);
  const signalRef    = useRef(null);
  const contentRef   = useRef(null); // all visible HUD — fades out before curtains leave
  const curtainTRef  = useRef(null); // top half bg — slides up
  const curtainBRef  = useRef(null); // bottom half bg — slides down
  const edgeTRef     = useRef(null); // glowing bottom edge of top curtain
  const edgeBRef     = useRef(null); // glowing top edge of bottom curtain
  const pathRef      = useRef(null);

  if (!layerRef.current) layerRef.current = genNoiseLayers(window.innerWidth);
  if (!pathRef.current)  pathRef.current  = buildSignalPath(layerRef.current);

  useEffect(() => {
    if (!signalRef.current) return;
    const W = window.innerWidth;

    const ctx = gsap.context(() => {
      // Seamless horizontal scroll
      gsap.to(signalRef.current, {
        x: -W, duration: 4, ease: 'none', repeat: -1,
      });

      // Wave smoothly collapses by reducing amplitude instead of scaleY
      gsap.timeline()
        .to({ amp: 24 }, {
          amp: 0,
          duration: TOTAL_MS / 1000,
          ease: 'power2.inOut',
          onUpdate: function() {
            setAmplitude(this.targets()[0].amp);
          },
        })
        // Edges fade in as wave finishes — they inherit the flat line position
        .to([edgeTRef.current, edgeBRef.current], {
          opacity: 1,
          duration: 0.12,
          ease: 'none',
        }, '<90%') // Slightly later for smoother handoff
        // Content fades out
        .to(contentRef.current, {
          opacity: 0,
          duration: 0.15,
          ease: 'none',
        })
        // Curtains slide away — edges ride with them, splitting the flat line
        .to(curtainTRef.current, {
          yPercent: -100,
          duration: 0.6,
          ease: 'power2.inOut',
        }, '<0.05')
        .to(curtainBRef.current, {
          yPercent: 100,
          duration: 0.6,
          ease: 'power2.inOut',
        }, '<')
        // Edges fade out as they leave
        .to([edgeTRef.current, edgeBRef.current], {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
        }, '>-0.25');
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (stage === 'done') return;

    const lineInterval = (TOTAL_MS * 0.85) / LOG_LINES.length;
    const timers = LOG_LINES.map((_, i) =>
      setTimeout(() => setLogCount(i + 1), i * lineInterval + 300)
    );

    const start = performance.now();
    let lastFreqUpdate = 0;
    const tick = (now) => {
      const p = Math.min((now - start) / TOTAL_MS, 1);
      setPct(Math.floor(p * 100));
      if (now - lastFreqUpdate > 60) {
        setFreq(+(8 + Math.random() * 18).toFixed(1));
        lastFreqUpdate = now;
      }
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else setPct(100);
    };
    rafRef.current = requestAnimationFrame(tick);

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
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [stage]);

  if (stage === 'done') return null;

  const W    = window.innerWidth;
  const done = pct === 100;

  return (
    <div className={`pl ${stage === 'exit' ? 'pl--exit' : ''}`}>

      {/* Two curtains — together they ARE the dark background.
          They slide away from the center line (where the flat signal sits)
          to reveal the site from the inside out. */}
      <div className="pl-curtain-t" ref={curtainTRef}>
        <div className="pl-curtain-edge pl-curtain-edge--t" ref={edgeTRef} />
      </div>
      <div className="pl-curtain-b" ref={curtainBRef}>
        <div className="pl-curtain-edge pl-curtain-edge--b" ref={edgeBRef} />
      </div>

      {/* All visible HUD content — fades out just before curtains leave */}
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
              ref={signalRef}
              className="pl-signal-svg"
              width={W * 2}
              height={SVG_H}
              viewBox={`0 0 ${W * 2} ${SVG_H}`}
              preserveAspectRatio="none"
            >
              <path d={buildSignalPath(layerRef.current, amplitude)} className="pl-signal-path" />
              <g transform={`translate(${W}, 0)`}>
                <path d={buildSignalPath(layerRef.current, amplitude)} className="pl-signal-path" />
              </g>
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
