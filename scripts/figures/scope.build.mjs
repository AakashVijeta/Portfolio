// Builds the signal-averager figure for the About section's equipment inventory.
// Run: node scripts/figures/scope.build.mjs [--preview]
// Writes src/components/figures/scopeArt.js (static SVG + the constants the live code needs);
// --preview also writes a standalone page to scripts/figures/out/ for screenshots.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "./kit/iso-kit.mjs";
import * as G from "./kit/lathe.mjs";
import { tubePieces, tubeSvg } from "./kit/tube.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "../..");

const WIDTH = 400;
const HEIGHT = 290;

// ── World layout (units ≈ px of the real thing, z up) ──────────────────────
const PLATE = { x: -86, y: -60, w: 198, d: 136, r: 8 };
const PLATE_H = 7;
const FOOT_H = 4;

const CASE = { x: -74, y: -52, w: 112, d: 80, r: 5 };
const FRONT = CASE.y + CASE.d; // the front panel, facing +y
const SIDE = CASE.x + CASE.w; // the right side, facing +x
const FEET_H = 3;
const PLINTH_H = 4;
const TOP = 76;

const BEZEL = { x0: -68, x1: 2, z0: 18, z1: 70, r: 3, depth: 1.4 };
const CRT = { x0: -64, x1: -2, z0: 22, z1: 66, r: 3, depth: 4 };
const DIV = 6.2; // one graticule division
const GRID = { cols: 10, rows: 7 };
const CRT_CX = (CRT.x0 + CRT.x1) / 2;
const CRT_CZ = (CRT.z0 + CRT.z1) / 2;

const KNOB = { x: 21, z: 52, r: 8.4, h: 6 }; // the AVG selector, the one lit part
const SMALL = [{ x: 12, z: 27.5 }, { x: 30, z: 27.5 }]; // volts/div and time/div
const BNC = { x: 21, z: 13 };
const LED = { x: 10, z: 68 };

// The detent positions of the AVG knob: 1 … 64 sweeps over a 270° arc
const STEPS = [1, 2, 4, 8, 16, 32, 64];
const SWEEP = (270 * Math.PI) / 180;
const angleOf = (index) => -SWEEP / 2 + (SWEEP * index) / (STEPS.length - 1); // 0 = straight up, clockwise

const BOARD = { x: 58, y: 18, w: 46, d: 36, r: 2 };
const STANDOFF_H = 4;
const BOARD_T = 1.6;
const BOARD_TOP = STANDOFF_H + BOARD_T;
const POST = { x: 68, y: 46 };
const PROBE_Z = BOARD_TOP + 5;
const PROBE_TAIL = 47;
const POST_TOP = BOARD_TOP + 7;
const CABLE_R = 1.15;

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), ...k.boxCorners(CASE, 0, TOP + 2)],
  WIDTH,
  HEIGHT,
  { pad: 8, azimuth: 54 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const planeOf = (y) => k.sideMatrix([0, y], 0, P, "left");
const flat = (x0, z0, x1, z1, r, steps = 6) =>
  k.pathOf(k.roundedPlan({ x: x0, y: z0, w: x1 - x0, d: z1 - z0, r }, steps).map(([u, z]) => [u, -z]), true);
const onFace = (y, inner) => `<g transform="${planeOf(y)}">${inner}</g>`;
const sideSlot = (y, z0, z1, half = 0.7) =>
  k.pathOf(k.roundedPlan({ x: y - half, y: z0, w: half * 2, d: z1 - z0, r: half }, 4).map(([u, z]) => at([SIDE, u, z])), true);
const along = (o, a) => G.frameAlong(o, a);

let clips = 0;
// A rounded opening in the front face with its inner walls drawn (after the desk-computer example)
function recess({ x0, x1, z0, z1, r, depth }, y, back = "", backClass = "sc-well", inside = "") {
  const id = `sc-clip-${clips++}`;
  const ring = k.roundedPlan({ x: x0, y: z0, w: x1 - x0, d: z1 - z0, r }, 6);
  const cx = (x0 + x1) / 2;
  const cz = (z0 + z1) / 2;
  const { sinA } = k.cameraOf(P);
  const tops = [];
  const sides = [[], [], [], []];
  ring.forEach(([ax, az], index) => {
    const [bx, bz] = ring[(index + 1) % ring.length];
    const length = Math.hypot(bx - ax, bz - az) || 1;
    let [nx, nz] = [(bz - az) / length, -(bx - ax) / length];
    if (nx * (cx - (ax + bx) / 2) + nz * (cz - (az + bz) / 2) < 0) [nx, nz] = [-nx, -nz];
    if (nx <= 0 && nz <= 0) return;
    const quad = k.pathOf([at([ax, y, az]), at([bx, y, bz]), at([bx, y - depth, bz]), at([ax, y - depth, az])], true);
    if (nz >= nx) tops.push(quad);
    else sides[Math.min(3, Math.max(0, Math.floor(((nx * -sinA + 1) / 2) * 4)))].push(quad);
  });
  const shape = flat(x0, z0, x1, z1, r);
  return [
    `<clipPath id="${id}"><path transform="${planeOf(y)}" d="${shape}"/></clipPath>`,
    `<g clip-path="url(#${id})">`,
    `<path class="iso-top" d="${tops.join("")}"/>`,
    ...sides.map((d, shade) => (d.length ? `<path class="iso-shade" data-shade="${shade}" d="${d.join("")}"/>` : "")),
    `<g transform="${planeOf(y - depth)}"><path class="${backClass}" d="${shape}"/>${back}<path class="iso-line" data-tone="faint" d="${shape}"/></g>`,
    inside,
    `</g>`,
    onFace(y, `<path class="iso-line" data-tone="lo" d="${shape}"/>`),
  ].join("");
}

// ── Bench plate ──────────────────────────────────────────────────────────
function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 18))) {
    out.push(S(k.cylinder(x, y, 6, -PLATE_H - FOOT_H, 1.4, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 4.6, -PLATE_H - FOOT_H + 1.4, FOOT_H - 1.4, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.4), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 4.5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 9);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // Ruler strip along the front edge, ticks hanging from its back edge
  const strip = { x: -70, y: PLATE.y + PLATE.d - 12, w: 120, d: 6, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.6, 0.6, [1.8, 3.4], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([strip.x + 2, strip.y + 3, 0.6]), at([strip.x + strip.w - 2, strip.y + 3, 0.6])], { size: 0.45 }));
  // Label plate at the back right of the bench
  const label = { x: 62, y: -44, w: 34, d: 12, r: 1.2 };
  out.push(S(k.slabOf(label, 0, 0.8, P, 3), { tone: "lo", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(label, 1.4), 0.8, P, 3), { tone: "faint" }));
  out.push(L([24, 18, 12].map((w, i) => k.lineOnTop([label.x + 4, label.y + 3.4 + i * 2.6], [label.x + 4 + w, label.y + 3.4 + i * 2.6], 0.8, P)).join(""), { tone: "lo", free: true }));
  out.push(D([at([label.x + label.w - 3, label.y + 3, 0.8]), at([label.x + label.w - 3, label.y + label.d - 3, 0.8])], { size: 0.4 }));
  return out.join("");
}

// ── The oscilloscope case ─────────────────────────────────────────────────
function scopeCase() {
  const out = [`<path class="iso-halo" d="${k.haloOf(CASE, 0, 8, P)}"/>`];
  // feet: four rubber pads under the plinth
  for (const [x, y] of byDepth(k.corners(CASE, 9))) out.push(S(k.cylinder(x, y, 3.4, 0, FEET_H, P, 20), { tone: "lo" }));
  out.push(S(k.slabOf(k.insetPlan(CASE, 2.5), FEET_H, PLINTH_H, P, 6), { tone: "lo" }));
  const body0 = FEET_H + PLINTH_H;
  const seamZ = TOP - 10;
  out.push(
    S(k.slabOf(CASE, body0, TOP - body0, P, 6, 1.2), {
      tone: "mid",
      inner: L(k.sideSeam(CASE, seamZ, P, 6), { tone: "faint" }),
    }),
  );
  // carry handle recessed in the lid, and lid vents as closed slots
  const handle = { x: -54, y: CASE.y + 6, w: 72, d: 10, r: 5 };
  out.push(L(k.planOutline(handle, TOP, P, 8), { tone: "lo" }));
  out.push(L(k.planOutline(k.insetPlan(handle, 2), TOP, P, 8), { tone: "faint" }));
  out.push(L(Array.from({ length: 8 }, (_, i) => k.planOutline({ x: -50 + i * 0, y: CASE.y + 24 + i * 3.6, w: 64, d: 1.3, r: 0.65 }, TOP, P, 4)).join(""), { tone: "faint" }));
  out.push(D([at([CASE.x + 5, CASE.y + 5, TOP]), at([SIDE - 5, CASE.y + 5, TOP]), at([CASE.x + 5, FRONT - 5, TOP]), at([SIDE - 5, FRONT - 5, TOP])], { size: 0.45 }));
  // side vents in two banks
  const rowOf = (from, to, gap) => Array.from({ length: Math.floor((to - from) / gap + 1e-9) + 1 }, (_, i) => from + i * gap);
  out.push(L(rowOf(CASE.y + 12, CASE.y + 48, 3.2).map((y) => sideSlot(y, 40, 58)).join(""), { tone: "faint" }));
  out.push(L(rowOf(CASE.y + 12, CASE.y + 48, 3.2).map((y) => sideSlot(y, 16, 30)).join(""), { tone: "faint" }));
  // the front panel: a thin inset panel line round the controls
  out.push(onFace(FRONT, `<path class="iso-line" data-tone="faint" d="${flat(CASE.x + 3, body0 + 3, SIDE - 3, seamZ - 2, 3)}"/>`));
  out.push(onFace(FRONT, `<path class="iso-line" data-tone="faint" d="M${BEZEL.x1 + 3} ${-(body0 + 3)}V${-(seamZ - 2)}"/>`));
  out.push(screen());
  return out.join("");
}

function screen() {
  const W = DIV * GRID.cols;
  const H = DIV * GRID.rows;
  const x0 = CRT_CX - W / 2;
  const z0 = CRT_CZ - H / 2;
  const grid = [];
  for (let i = 1; i < GRID.cols; i++) if (i !== GRID.cols / 2) grid.push(`M${(x0 + i * DIV).toFixed(2)} ${-(z0)}V${-(z0 + H)}`);
  for (let j = 1; j < GRID.rows; j++) if (j !== (GRID.rows - 1) / 2 + 0.5) grid.push(`M${x0} ${-(z0 + j * DIV).toFixed(2)}H${x0 + W}`);
  const axes = `M${x0} ${-CRT_CZ}H${x0 + W}M${CRT_CX} ${-z0}V${-(z0 + H)}`;
  const minor = [];
  for (let x = x0 + DIV / 5; x < x0 + W - 0.01; x += DIV / 5) minor.push(`M${x.toFixed(2)} ${-(CRT_CZ - 0.7)}V${-(CRT_CZ + 0.7)}`);
  for (let z = z0 + DIV / 5; z < z0 + H - 0.01; z += DIV / 5) minor.push(`M${CRT_CX - 0.7} ${(-z).toFixed(2)}H${CRT_CX + 0.7}`);
  const back = [
    `<path class="sc-glow" d="${flat(CRT.x0 + 6, CRT.z0 + 5, CRT.x1 - 6, CRT.z1 - 5, 14, 8)}"/>`,
    `<path class="sc-grid" d="${grid.join("")}"/>`,
    `<path class="sc-axis" d="${axes}${minor.join("")}"/>`,
    `<path class="sc-trace-halo" data-part="trace-halo" d=""/>`,
    `<path class="sc-trace" data-part="trace" d=""/>`,
    `<path class="sc-truth" data-part="truth" d=""/>`,
    // a faint reflection across the glass
    `<path class="iso-line" data-tone="faint" d="M${CRT.x0 + 4} ${-(CRT.z1 - 12)}Q${CRT.x0 + 5} ${-(CRT.z1 - 4)} ${CRT.x0 + 13} ${-(CRT.z1 - 3.4)}"/>`,
  ].join("");
  return recess(BEZEL, FRONT, "", "sc-bezel", recess(CRT, FRONT - BEZEL.depth, back, "sc-glass"));
}

// ── Front-panel controls ─────────────────────────────────────────────────
function panel() {
  const out = [];
  // LED and power key across the top of the panel
  out.push(S(G.disc(0, 0.8, 2, along([LED.x, FRONT, LED.z], [0, 1, 0]), P), { tone: "lo" }));
  out.push(`<g data-part="led">${S(G.disc(0.8, 1.6, 1.2, along([LED.x, FRONT, LED.z], [0, 1, 0]), P), { tone: "hi" })}</g>`);
  const key = { x: 26, w: 10, z: LED.z - 2.2, h: 4.4 };
  out.push(S(k.slabOf({ x: key.x, y: FRONT, w: key.w, d: 1.8, r: 0.9 }, key.z, key.h, P, 3, 0.3), { tone: "mid" }));

  // detent scale round the AVG knob, printed on the panel
  const ticks = [];
  STEPS.forEach((_, index) => {
    const a = angleOf(index);
    const [s, c] = [Math.sin(a), Math.cos(a)];
    const r0 = KNOB.r + 1.6;
    const r1 = KNOB.r + (index % 2 === 0 ? 3.6 : 2.8);
    ticks.push(`M${(KNOB.x + s * r0).toFixed(2)} ${(-(KNOB.z + c * r0)).toFixed(2)}L${(KNOB.x + s * r1).toFixed(2)} ${(-(KNOB.z + c * r1)).toFixed(2)}`);
  });
  const arcR = KNOB.r + 1.6;
  const a0 = angleOf(0);
  const a1 = angleOf(STEPS.length - 1);
  const arc = `M${(KNOB.x + Math.sin(a0) * arcR).toFixed(2)} ${(-(KNOB.z + Math.cos(a0) * arcR)).toFixed(2)}A${arcR} ${arcR} 0 1 1 ${(KNOB.x + Math.sin(a1) * arcR).toFixed(2)} ${(-(KNOB.z + Math.cos(a1) * arcR)).toFixed(2)}`;
  out.push(onFace(FRONT, `<path class="iso-line" data-tone="lo" d="${arc}"/><path class="iso-line" data-tone="mid" d="${ticks.join("")}"/>`));
  out.push(k.faceTextSvg(planeOf(FRONT) + ` translate(${KNOB.x} ${-(KNOB.z - KNOB.r - 4.4)})`, "AVG", { size: 2.6, tone: "lo", anchor: "middle" }));

  // the AVG knob: skirt, knurled body, cap; its pointer is drawn live
  const F = along([KNOB.x, FRONT, KNOB.z], [0, 1, 0]);
  out.push(S(G.disc(0, 1.2, KNOB.r + 0.9, F, P), { tone: "lo" }));
  const ribs = G.ribsOf(F, 1.2, KNOB.h, KNOB.r, 40, P, { fade: [0.1, 0.55], seams: true });
  out.push(S(G.disc(1.2, KNOB.h, KNOB.r, F, P), { tone: "hi", lit: true, inner: k.fadedSvg(ribs, { tone: "lo" }) }));
  out.push(onFace(FRONT + KNOB.h, `<circle class="sc-cap" cx="${KNOB.x}" cy="${-KNOB.z}" r="${KNOB.r - 2.2}"/><g data-part="pointer"><path class="iso-line" data-tone="lit" d="M${KNOB.x} ${-(KNOB.z + 1.4)}V${-(KNOB.z + KNOB.r - 1.2)}" style="stroke-width:1.1"/></g>`));
  out.push(D([at([KNOB.x, FRONT + KNOB.h, KNOB.z])], { size: 0.5, tone: "mid" }));

  // two small knobs
  for (const { x, z } of SMALL) {
    const f = along([x, FRONT, z], [0, 1, 0]);
    out.push(S(G.disc(0, 0.8, 5.2, f, P), { tone: "lo" }));
    const r = G.ribsOf(f, 0.8, 4.4, 4.2, 24, P, { fade: [0.1, 0.55], seams: true });
    out.push(S(G.disc(0.8, 4.4, 4.2, f, P), { tone: "mid", inner: k.fadedSvg(r, { tone: "lo" }) }));
    out.push(onFace(FRONT + 4.4, `<path class="iso-line" data-tone="hi" d="M${x} ${-(z + 0.8)}L${x + 2.4} ${-(z + 2.6)}"/>`));
    // a short scale above each
    const tk = [];
    for (let i = -3; i <= 3; i++) {
      const a = (i * Math.PI) / 8;
      tk.push(`M${(x + Math.sin(a) * 6).toFixed(2)} ${(-(z + Math.cos(a) * 6)).toFixed(2)}L${(x + Math.sin(a) * 7.4).toFixed(2)} ${(-(z + Math.cos(a) * 7.4)).toFixed(2)}`);
    }
    out.push(onFace(FRONT, `<path class="iso-line" data-tone="lo" d="${tk.join("")}"/>`));
  }

  // BNC input: hex nut, barrel, bayonet pins
  const B = along([BNC.x, FRONT, BNC.z], [0, 1, 0]);
  out.push(onFace(FRONT, `<circle class="iso-line" data-tone="faint" cx="${BNC.x}" cy="${-BNC.z}" r="5.6"/>`));
  out.push(S(G.prismOf(B, Array.from({ length: 6 }, (_, i) => [Math.cos((i * Math.PI) / 3) * 4.2, Math.sin((i * Math.PI) / 3) * 4.2]), 0, 1.6, P), { tone: "lo" }));
  out.push(S(G.disc(1.6, 6.4, 2.6, B, P), { tone: "mid", inner: L(G.arcOf(B, 4.6, 2.6, P), { tone: "faint" }) }));
  return out.join("");
}

// ── Probe cable from the BNC to the board ────────────────────────────────
const BNC_END = 9.6; // the probe's plug ends here, along +y from the panel
const ROUTE = G.fillet(
  [
    [BNC.x, FRONT + BNC_END, BNC.z],
    [BNC.x, FRONT + 17, BNC.z],
    [BNC.x + 3, FRONT + 25, CABLE_R],
    [34, FRONT + 27, CABLE_R],
    [39, POST.y, PROBE_Z],
    [PROBE_TAIL, POST.y, PROBE_Z],
  ],
  5,
  9,
  { P, tube: CABLE_R },
);

function plug() {
  // the probe's BNC plug: a knurled coupling ring and a strain relief that the cable leaves
  const F = along([BNC.x, FRONT, BNC.z], [0, 1, 0]);
  const out = [];
  const ribs = G.ribsOf(F, 6.4, 8.4, 3.4, 22, P, { fade: [0.1, 0.55], seams: true });
  out.push(S(G.disc(6.4, 8.4, 3.4, F, P), { tone: "mid", inner: k.fadedSvg(ribs, { tone: "lo" }) }));
  out.push(S(G.solidOf([[8.4, 2.6], [9.6, 2.2, 1], [11, 1.6, 1]], F, P), { tone: "lo" }));
  return out.join("");
}

function board() {
  const items = [];
  const put = (point, svg) => items.push({ key: k.depthOf(point, P), svg });
  // standoffs and the board
  const body = [];
  body.push(`<path class="iso-halo" d="${k.haloOf(BOARD, 0, 4, P)}" style="filter:blur(5px)"/>`);
  for (const [x, y] of byDepth(k.corners(BOARD, 3.2))) body.push(S(k.cylinder(x, y, 1.6, 0, STANDOFF_H, P, 16), { tone: "lo" }));
  body.push(S(k.slabOf(BOARD, STANDOFF_H, BOARD_T, P, 3, 0.4), { tone: "mid" }));
  body.push(D(k.corners(BOARD, 3.2).map(([x, y]) => at([x, y, BOARD_TOP])), { size: 0.5, tone: "mid" }));
  // traces etched on the board, ending on pads
  const pads = [[64, 24], [98, 48], [64, 34]];
  // etched traces, each running from a pad ring to the next part's edge
  body.push(L(k.onTop([[POST.x + 2.4, POST.y], [76, POST.y], [80, 42]], BOARD_TOP, P) + k.onTop([[65.4, 24], [76, 24]], BOARD_TOP, P) + k.onTop([[65.4, 34], [76, 34]], BOARD_TOP, P) + k.onTop([[96.6, 48], [92, 48]], BOARD_TOP, P), { tone: "faint" }));
  body.push(L(pads.map(([x, y]) => k.ring(x, y, 1.4, BOARD_TOP, P, 12)).join(""), { tone: "lo" }));
  // the chip with its pins as dots along two sides
  const chip = { x: 76, y: 22, w: 16, d: 20, r: 0.6 };
  body.push(S(k.slabOf(chip, BOARD_TOP, 2.6, P, 2, 0.3), { tone: "mid" }));
  body.push(D([...Array.from({ length: 6 }, (_, i) => at([chip.x + 2 + i * 2, chip.y + chip.d + 0.8, BOARD_TOP])), ...Array.from({ length: 7 }, (_, i) => at([chip.x + chip.w + 0.8, chip.y + 2 + i * 2, BOARD_TOP]))], { size: 0.4, tone: "mid" }));
  body.push(L(k.ring(chip.x + 3, chip.y + 3, 0.9, BOARD_TOP + 2.6, P, 10), { tone: "lo" }));
  // a crystal can
  body.push(S(k.slabOf({ x: 83, y: 46, w: 9, d: 4, r: 2 }, BOARD_TOP, 3, P, 4), { tone: "mid" }));
  items.push({ key: -Infinity, svg: body.join("") });
  // the test post the probe hooks on
  put([POST.x, POST.y, POST_TOP], S(k.cylinder(POST.x, POST.y, 2.4, BOARD_TOP, 1.2, P, 16), { tone: "lo" }) + S(k.cylinder(POST.x, POST.y, 0.9, BOARD_TOP + 1.2, POST_TOP - BOARD_TOP - 1.2, P, 12), { tone: "hi" }) + S(k.cylinder(POST.x, POST.y, 1.5, POST_TOP - 1.4, 1.4, P, 14), { tone: "hi" }) + L(k.sideArc(POST.x, POST.y, 1.25, PROBE_Z, P, 14), { tone: "hi" }));
  // the probe: a turned body lying toward the post, its hook tip on the post
  // strain relief, grip with a finger ring, slim nose, and a sprung hook round the post
  const F = along([PROBE_TAIL, POST.y, PROBE_Z], [1, 0, 0]);
  const len = POST.x - 1.2 - PROBE_TAIL;
  const probe = [
    S(G.solidOf([[0, 1.25], [3, 1.7, 1], [4, 1.9]], F, P), { tone: "lo" }),
    S(G.disc(4, 11, 1.9, F, P), { tone: "mid", inner: L(G.arcOf(F, 7.5, 1.9, P), { tone: "faint" }) }),
    S(G.disc(11, 12.4, 2.6, F, P), { tone: "mid" }),
    S(G.solidOf([[12.4, 1.5], [len - 3, 1.1, 1], [len - 1.2, 0.7, 1], [len, 0.35]], F, P), { tone: "hi" }),
  ].join("");
  put(G.pointOf(F, len / 2, 0, 0), probe);
  // the cable, in depth-sorted chunks
  for (const piece of tubePieces(ROUTE, CABLE_R, P, { maxLength: 12 })) put(piece.mid, tubeSvg(piece, { tone: "mid" }));
  return items.sort((a, b) => a.key - b.key).map((it) => it.svg).join("");
}

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  className: "sc-svg",
  label:
    "A bench oscilloscope with a signal averager. A probe hooked on a test post of a small circuit board feeds the scope; the AVG knob sets how many noisy sweeps are averaged, and the trace on the screen settles from noise onto the true signal as the count rises.",
  body: [plate(), scopeCase(), panel(), plug(), board()],
});

// Screen geometry the live code needs, in the face plane's local (x, -z) units
const LIVE = {
  screen: { x0: CRT_CX - (DIV * GRID.cols) / 2, w: DIV * GRID.cols, cz: CRT_CZ, div: DIV, rows: GRID.rows },
  knob: { x: KNOB.x, z: KNOB.z },
  steps: STEPS,
  sweep: SWEEP,
};

mkdirSync(join(ROOT, "src/components/figures"), { recursive: true });
writeFileSync(
  join(ROOT, "src/components/figures/scopeArt.js"),
  `// Generated by scripts/figures/scope.build.mjs — do not edit by hand.\nexport const SCOPE_SVG = ${JSON.stringify(svg)};\nexport const SCOPE_LIVE = ${JSON.stringify(LIVE)};\n`,
);
console.log("wrote src/components/figures/scopeArt.js", (svg.length / 1024).toFixed(1), "KB");

if (process.argv.includes("--preview")) {
  const css = readFileSync(join(HERE, "kit/iso.css"), "utf8") + readFileSync(join(ROOT, "src/components/figures/scope.css"), "utf8");
  const live = readFileSync(join(ROOT, "src/components/figures/scopeLive.js"), "utf8").replace(/^export /gm, "");
  const page = `<!doctype html><meta charset="utf-8"><title>scope</title><style>${css}
body{margin:0;background:#020402;padding:24px;font-family:monospace}.wrap{width:${process.env.W || 340}px}</style>
<div class="wrap"><div class="sc-card iso"><div class="sc-stage" tabindex="0">${svg}</div><div class="sc-foot"><span>AVG ×1</span><span data-readout></span></div></div></div>
<script>${live}
mountScope(document.querySelector(".sc-card"), ${JSON.stringify(LIVE)}, (a, b) => document.querySelector("[data-readout]").textContent = a + " · " + b);</script>`;
  mkdirSync(join(HERE, "out"), { recursive: true });
  writeFileSync(join(HERE, "out/scope.html"), page);
  console.log("wrote scripts/figures/out/scope.html");
}
