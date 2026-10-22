// Live behaviour for the signal-averager figure. Framework-free so the React
// component and the standalone preview share it. Every number on the card comes
// from the same sweeps the trace is drawn from.

const SAMPLES = 150;
const NOISE = 1.05; // σ of each sweep's noise, in screen divisions
const SWEEPS_PER_S = 30;
const KEEP = 64;
const DWELL = 1.8; // seconds per detent on the idle tour

// The signal under the noise, in divisions: a slow carrier with a faster harmonic riding on it,
// the harmonic in anti-phase so the trace leaves the centre line almost level at t = 0
const signal = (t) => 1.55 * Math.sin(2 * Math.PI * 2 * t) - 0.6 * Math.sin(2 * Math.PI * 5 * t);

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function mountScope(root, LIVE, say) {
  const svg = root.querySelector("svg");
  const trace = svg.querySelector('[data-part="trace"]');
  const halo = svg.querySelector('[data-part="trace-halo"]');
  const truthEl = svg.querySelector('[data-part="truth"]');
  const pointer = svg.querySelector('[data-part="pointer"]');
  const stage = root.querySelector(".sc-stage") || root;
  const { screen, knob, steps, sweep } = LIVE;
  const still = window.matchMedia("(prefers-reduced-motion: reduce)");

  const random = rng(20261022);
  const gauss = () => {
    const u = 1 - random();
    const v = random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const truth = Float32Array.from({ length: SAMPLES }, (_, i) => signal(i / (SAMPLES - 1)));
  const power = Math.sqrt(truth.reduce((s, v) => s + v * v, 0) / SAMPLES);
  const ring = Array.from({ length: KEEP }, () => new Float32Array(SAMPLES));
  const sum = new Float64Array(SAMPLES);
  let filled = 0;
  let head = 0;
  let windowN = 0; // sweeps currently inside the running sum

  const capture = () => {
    const sweepData = ring[head];
    for (let i = 0; i < SAMPLES; i++) sweepData[i] = truth[i] + NOISE * gauss();
    head = (head + 1) % KEEP;
    filled = Math.min(KEEP, filled + 1);
  };
  // Recompute the running sum over the newest n sweeps
  const resum = (n) => {
    sum.fill(0);
    windowN = Math.min(n, filled);
    for (let j = 1; j <= windowN; j++) {
      const s = ring[(head - j + KEEP) % KEEP];
      for (let i = 0; i < SAMPLES; i++) sum[i] += s[i];
    }
  };

  const half = (screen.rows * screen.div) / 2 - 0.6;
  const yOf = (v) => {
    const z = screen.cz + Math.max(-half, Math.min(half, v * screen.div));
    return (-z).toFixed(2);
  };
  const xOf = (i) => (screen.x0 + (screen.w * i) / (SAMPLES - 1)).toFixed(2);
  const pathOf = (values) => {
    let d = `M${xOf(0)} ${yOf(values[0])}`;
    for (let i = 1; i < SAMPLES; i++) d += `L${xOf(i)} ${yOf(values[i])}`;
    return d;
  };
  truthEl.setAttribute("d", pathOf(truth));

  let index = 4; // detent, 0..6
  let angle = -sweep / 2 + (sweep * index) / (steps.length - 1);
  let touring = true;
  let clock = 0;
  let sweepClock = 0;
  let last = 0;
  let frame = 0;
  let visible = false;
  let idle = 0;
  const avg = new Float32Array(SAMPLES);

  const draw = () => {
    const n = steps[index];
    resum(n);
    let err = 0;
    for (let i = 0; i < SAMPLES; i++) {
      avg[i] = sum[i] / Math.max(1, windowN);
      err += (avg[i] - truth[i]) ** 2;
    }
    const d = pathOf(avg);
    trace.setAttribute("d", d);
    halo.setAttribute("d", d);
    const rms = Math.sqrt(err / SAMPLES);
    const snr = 20 * Math.log10(power / Math.max(rms, 1e-6));
    pointer.setAttribute("transform", `rotate(${((angle * 180) / Math.PI).toFixed(2)} ${knob.x} ${-knob.z})`);
    say(`AVG ×${n}`, `SNR ${snr.toFixed(1)} dB`);
    stage.setAttribute("aria-valuenow", String(n));
    stage.setAttribute("aria-valuetext", `${n} sweeps averaged, signal to noise ${snr.toFixed(1)} decibels`);
  };

  const tourIndex = (t) => {
    const k = Math.floor(t / DWELL) % (2 * (steps.length - 1));
    return k < steps.length ? k : 2 * (steps.length - 1) - k;
  };

  const tick = (now) => {
    const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 1 / 60;
    last = now;
    if (touring) {
      clock += dt;
      index = tourIndex(clock);
    }
    const target = -sweep / 2 + (sweep * index) / (steps.length - 1);
    angle += (target - angle) * (1 - Math.exp(-dt / 0.12));
    sweepClock += dt;
    while (sweepClock > 1 / SWEEPS_PER_S) {
      sweepClock -= 1 / SWEEPS_PER_S;
      capture();
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
    index = Math.max(0, Math.min(steps.length - 1, next));
    clearTimeout(idle);
    idle = setTimeout(() => {
      touring = true;
      clock = index * DWELL;
    }, 4000);
    if (still.matches) {
      angle = -sweep / 2 + (sweep * index) / (steps.length - 1);
      draw();
    }
    run();
  };

  // Fill the history so the first frame already averages real sweeps
  for (let i = 0; i < KEEP; i++) capture();
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
    const share = Math.max(0, Math.min(0.999, (event.clientX - box.left) / box.width));
    steer(Math.floor(share * steps.length));
  };
  const onKey = (event) => {
    let to = null;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") to = index + 1;
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") to = index - 1;
    if (event.key === "Home") to = 0;
    if (event.key === "End") to = steps.length - 1;
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
