// Live behaviour for the open-hard-drive figure. Framework-free so the React
// component and the standalone preview share it. The arm seeks like a voice
// coil (fast, with a slight overshoot that settles), and the readout comes from
// where the head actually is: track number and the zoned data rate at that radius.

const TRACKS_PER_MM = 15750; // ≈ 400k tracks per inch
const RATE_OUT = 270; // MB/s on the outermost track; it falls in proportion to radius
const SPIN_DEG_S = 48; // the platter's drawn turn rate (the real 7,200 rpm would only blur)
const OMEGA = 26; // seek spring: natural frequency, rad/s
const ZETA = 0.62; // and damping: a small overshoot, then settle
const DWELL = [0.9, 2.2]; // seconds the idle tour reads before the next seek

export function mountHdd(root, LIVE, say) {
  const svg = root.querySelector("svg");
  const stage = root.querySelector(".hdd-stage") || root;
  const spins = [...svg.querySelectorAll('[data-part="spin"]')];
  const arms = [...svg.querySelectorAll('[data-part="arm"]')];
  const track = svg.querySelector('[data-part="track"]');
  const ledOn = svg.querySelector('[data-part="led-on"]');
  const ledOff = svg.querySelector('[data-part="led-off"]');
  const still = window.matchMedia("(prefers-reduced-motion: reduce)");
  const { hub, pivot, reach, trackIn, trackOut, rampR } = LIVE;

  // Arm angle for a head radius r: where the circle of the arm's reach meets
  // the circle of radius r about the spindle
  const dx = hub[0] - pivot[0];
  const dy = hub[1] - pivot[1];
  const d = Math.hypot(dx, dy);
  const toHub = Math.atan2(dy, dx);
  const spread = (r) => Math.acos(Math.max(-1, Math.min(1, (reach * reach + d * d - r * r) / (2 * reach * d))));
  // of the two solutions, the one that swings the head across the platter's near side
  const side = -1;
  const angleFor = (r) => toHub + side * spread(r);

  let r = rampR; // head radius: it starts parked on the ramp
  let v = 0;
  let target = (trackIn + trackOut) / 2;
  let spin = 0;
  let touring = true;
  let dwell = 0.8;
  let frame = 0;
  let last = 0;
  let visible = false;
  let idle = 0;
  let flicker = 0;

  const draw = () => {
    const deg = (angleFor(r) * 180) / Math.PI;
    for (const g of arms) g.setAttribute("transform", `rotate(${deg.toFixed(2)} ${pivot[0]} ${pivot[1]})`);
    for (const g of spins) g.setAttribute("transform", `rotate(${spin.toFixed(2)} ${hub[0]} ${hub[1]})`);
    const onData = r >= trackIn - 0.2 && r <= trackOut + 0.2;
    const seeking = Math.abs(v) > 3 || Math.abs(target - r) > 0.4;
    const rr = Math.max(trackIn, Math.min(trackOut, r));
    track.setAttribute("d", `M${hub[0] + rr} ${hub[1]}A${rr} ${rr} 0 1 0 ${hub[0] - rr} ${hub[1]}A${rr} ${rr} 0 1 0 ${hub[0] + rr} ${hub[1]}Z`);
    track.style.opacity = onData ? (seeking ? "0.25" : "1") : "0";
    const reading = onData && !seeking;
    const lit = reading && flicker % 4 !== 3;
    ledOn.style.display = lit ? "" : "none";
    ledOff.style.display = lit ? "none" : "";
    if (!onData) say("PARKED", "0 MB/s");
    else {
      const trk = Math.round((trackOut - rr) * TRACKS_PER_MM).toLocaleString("en-US");
      say(`TRK ${trk}`, seeking ? "SEEK" : `${Math.round((RATE_OUT * rr) / trackOut)} MB/s`);
    }
  };

  const tick = (now) => {
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    last = now;
    spin = (spin + SPIN_DEG_S * dt) % 360;
    flicker += 1;
    if (touring) {
      dwell -= dt;
      if (dwell <= 0 && Math.abs(target - r) < 0.4) {
        target = trackIn + Math.random() * (trackOut - trackIn);
        dwell = DWELL[0] + Math.random() * (DWELL[1] - DWELL[0]);
      }
    }
    // a voice-coil seek: a damped spring toward the target radius, sub-stepped
    for (let i = 0; i < 4; i++) {
      const h = dt / 4;
      const a = OMEGA * OMEGA * (target - r) - 2 * ZETA * OMEGA * v;
      v += a * h;
      r += v * h;
    }
    draw();
    frame = visible ? requestAnimationFrame(tick) : 0;
  };
  const run = () => {
    if (!frame && visible && !still.matches) {
      last = 0;
      frame = requestAnimationFrame(tick);
    }
  };
  const steer = (next) => {
    touring = false;
    target = Math.max(trackIn, Math.min(trackOut, next));
    clearTimeout(idle);
    idle = setTimeout(() => {
      touring = true;
      dwell = 0.6;
    }, 3500);
    if (still.matches) {
      r = target;
      v = 0;
      draw();
    }
    run();
  };

  if (still.matches) {
    r = target;
    touring = false;
  }
  draw();

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries[entries.length - 1].isIntersecting;
      if (visible) run();
    },
    { rootMargin: "80px 0px" },
  );
  io.observe(stage);

  const onMove = (event) => {
    const box = stage.getBoundingClientRect();
    const share = Math.max(0, Math.min(1, (event.clientX - box.left) / box.width));
    // left of the card is the inner edge of the data zone, right is the outer
    steer(trackIn + share * (trackOut - trackIn));
  };
  const onKey = (event) => {
    const stepMm = (trackOut - trackIn) / 8;
    let to = null;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") to = target + stepMm;
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") to = target - stepMm;
    if (event.key === "Home") to = trackIn;
    if (event.key === "End") to = trackOut;
    if (to === null) return;
    event.preventDefault();
    steer(to);
  };
  stage.addEventListener("pointermove", onMove);
  stage.addEventListener("keydown", onKey);

  return () => {
    cancelAnimationFrame(frame);
    clearTimeout(idle);
    io.disconnect();
    stage.removeEventListener("pointermove", onMove);
    stage.removeEventListener("keydown", onKey);
  };
}
