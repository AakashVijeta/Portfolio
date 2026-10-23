// Builds the open-hard-drive figure for the About section's equipment inventory.
// Run: node scripts/figures/hdd.build.mjs [--preview]
// Writes src/components/figures/hddArt.js (static SVG + the constants the live code needs);
// --preview also writes a standalone page to scripts/figures/out/ for screenshots.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "./kit/iso-kit.mjs";
import * as G from "./kit/lathe.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "../..");

const WIDTH = 400;
const HEIGHT = 300;

// ── A 3.5" drive, 1 unit = 1 mm (101.6 × 147 × 26) ───────────────────────
const MAT = { x: -66, y: -90, w: 132, d: 178, r: 6 }; // an anti-static mat it lies on
const MAT_H = 2;
const CASE = { x: -51, y: -74, w: 102, d: 147, r: 3 };
const PCB_H = 4; // the logic board under the casting
const TOP = 26; // the casting's rim
const FLOOR = 15; // the floor of the platter pocket
const HUB = [0, -24];
const PLATTER_R = 47.5;
const PLATTER_Z = FLOOR + 2;
const PLATTER_T = 1.27;
const PLATTER_TOP = PLATTER_Z + PLATTER_T;
const SPINDLE_R = 12.5;
const PIVOT = [31, 37]; // actuator bearing
const ARM_Z = PLATTER_TOP + 1.4; // the arm rides just above the platter
const HEAD_REACH = 62; // pivot to read head
const TRACK_IN = 18; // innermost data radius
const TRACK_OUT = 45.5; // outermost
const RAMP_R = PLATTER_R + 1.5;

// The arm's geometry, shared with the live code: the angle that puts the head at radius r
const HUB_D = Math.hypot(HUB[0] - PIVOT[0], HUB[1] - PIVOT[1]);
const TO_HUB = Math.atan2(HUB[1] - PIVOT[1], HUB[0] - PIVOT[0]);
const angleFor = (r) => TO_HUB - Math.acos((HEAD_REACH ** 2 + HUB_D ** 2 - r * r) / (2 * HEAD_REACH * HUB_D));
const SWEEP_MID = angleFor((TRACK_IN + TRACK_OUT) / 2);
const headAt = (r) => [PIVOT[0] + Math.cos(angleFor(r)) * HEAD_REACH, PIVOT[1] + Math.sin(angleFor(r)) * HEAD_REACH];

const P = k.fitProjection(
  [...k.boxCorners(MAT, -MAT_H, 0), ...k.boxCorners(CASE, 0, TOP + 4)],
  WIDTH,
  HEIGHT,
  { pad: 8, azimuth: 36, elevation: 52 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const topAt = (z) => k.topMatrix([0, 0], z, P, "x"); // local (x, y) = world (x, y) on the plane at z
const onTopAt = (z, inner, attrs = "") => `<g transform="${topAt(z)}"${attrs}>${inner}</g>`;
const circle = (cx, cy, r) => `M${(cx + r).toFixed(2)} ${cy.toFixed(2)}A${r} ${r} 0 1 0 ${(cx - r).toFixed(2)} ${cy.toFixed(2)}A${r} ${r} 0 1 0 ${(cx + r).toFixed(2)} ${cy.toFixed(2)}Z`;
const ringPts = (cx, cy, r, n = 96) => Array.from({ length: n }, (_, i) => [cx + Math.cos((i / n) * 2 * Math.PI) * r, cy + Math.sin((i / n) * 2 * Math.PI) * r]);

// ── Mat ───────────────────────────────────────────────────────────────────
function mat() {
  const out = [`<path class="iso-halo" d="${k.haloOf(MAT, -MAT_H, MAT_H, P)}"/>`];
  out.push(S(k.slabOf(MAT, -MAT_H, MAT_H, P, 8, 0.6), { tone: "lo" }));
  // a printed grid, edge to edge inside a border
  const inner = k.insetPlan(MAT, 5);
  out.push(L(k.planOutline(inner, 0, P, 6), { tone: "faint" }));
  const grid = [];
  for (let x = inner.x + 10; x < inner.x + inner.w - 1; x += 10) grid.push(k.lineOnTop([x, inner.y], [x, inner.y + inner.d], 0, P));
  for (let y = inner.y + 10; y < inner.y + inner.d - 1; y += 10) grid.push(k.lineOnTop([inner.x, y], [inner.x + inner.w, y], 0, P));
  out.push(L(grid.join(""), { tone: "faint" }));
  // the grounding stud in a corner
  out.push(S(k.cylinder(MAT.x + 8, MAT.y + MAT.d - 8, 2.4, 0, 1.6, P, 16), { tone: "mid" }));
  return out.join("");
}

// ── Casting, with the platter pocket and the lid screw holes ──────────────
function casting() {
  const out = [`<path class="iso-halo" d="${k.haloOf(CASE, 0, 8, P)}" style="filter:blur(5px)"/>`];
  // the logic board on the underside, a little smaller than the casting
  out.push(S(k.slabOf(k.insetPlan(CASE, 1.5), 0, PCB_H, P, 3), { tone: "lo" }));
  out.push(
    S(k.slabOf(CASE, PCB_H, TOP - PCB_H, P, 3, 0.8), {
      tone: "mid",
      inner: L(k.sideSeam(CASE, TOP - 3, P, 3), { tone: "faint" }),
    }),
  );
  // the lid's gasket groove round the rim
  out.push(L(k.planOutline(k.insetPlan(CASE, 2.2), TOP, P, 3), { tone: "lo" }));
  // lid screw holes along the rim, each a ring with its thread dot
  const holes = [
    [-47, -70], [47, -70], [-47, 69], [47, 69], [-47, -2], [47, -2], [0, -70.5], [-47, 34],
  ];
  out.push(L(holes.map(([x, y]) => k.ring(x, y, 1.6, TOP, P, 12)).join(""), { tone: "lo" }));
  out.push(D(holes.map(([x, y]) => at([x, y, TOP])), { size: 0.4, tone: "lo" }));
  // the pockets: the platter's round one and the actuator's bay beside it. Each
  // far wall shows between its rim and its floor; walls go down first so the
  // floors of both open into one another where they meet
  const pocketR = PLATTER_R + 2.5;
  const bay = { x: PIVOT[0] - 15, y: 6, w: 31, d: CASE.y + CASE.d - 4 - 6, r: 6 };
  const shapes = [
    (z) => k.pathOf(ringPts(HUB[0], HUB[1], pocketR).map(([x, y]) => at([x, y, z])), true),
    (z) => k.pathOf(k.roundedPlan(bay, 6).map(([x, y]) => at([x, y, z])), true),
  ];
  shapes.forEach((shape, i) => out.push(`<clipPath id="hdd-pocket-${i}"><path d="${shape(TOP)}"/></clipPath>`));
  // everything that sits below the rim is seen only through the openings
  out.push(`<clipPath id="hdd-open"><path d="${shapes[0](TOP)}"/><path d="${shapes[1](TOP)}"/></clipPath>`);
  shapes.forEach((shape) => out.push(`<path class="hdd-wall" d="${shape(TOP)}"/>`));
  shapes.forEach((shape, i) => out.push(`<g clip-path="url(#hdd-pocket-${i})"><path class="hdd-floor" d="${shape(FLOOR)}"/></g>`));
  out.push(`<g clip-path="url(#hdd-pocket-0)"><path class="iso-line" data-tone="faint" d="${shapes[0](FLOOR)}"/></g>`);
  // each rim is drawn only where it isn't inside the other opening
  const box = `M${-WIDTH} ${-HEIGHT}H${2 * WIDTH}V${2 * HEIGHT}H${-WIDTH}Z`;
  shapes.forEach((shape, i) => out.push(`<clipPath id="hdd-rim-${i}"><path clip-rule="evenodd" d="${box}${shapes[1 - i](TOP)}"/></clipPath>`));
  shapes.forEach((shape, i) => out.push(`<g clip-path="url(#hdd-rim-${i})">${L(shape(TOP), { tone: "lo" })}</g>`));
  // breather filter in the far corner
  const filter = { x: -44, y: 36, w: 14, d: 24, r: 2 };
  out.push(S(k.slabOf(filter, TOP, 1.2, P, 3), { tone: "lo", crease: "none" }));
  out.push(D(k.dotGrid(filter.x + 3, filter.y + 3, 4, 8, 2.6, TOP + 1.2, P), { size: 0.35, tone: "lo" }));
  return out.join("");
}

// ── Spindle and platter ───────────────────────────────────────────────────
function platter() {
  const [x, y] = HUB;
  const out = [];
  out.push(S(k.cylinder(x, y, PLATTER_R, PLATTER_Z, PLATTER_T, P, 128, 0.4), { tone: "hi", crease: "lo" }));
  return out.join("");
}

// What turns with the platter is drawn live in its plane: the data zone, the
// servo wedges and a reflection that stays put while the surface turns
function platterFace() {
  const [x, y] = HUB;
  const zones = [TRACK_IN, 26, 33, 39.5, TRACK_OUT].map((r) => circle(x, y, r)).join("");
  const wedges = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * 2 * Math.PI;
    // servo wedges curve, as they follow the head's arc across the tracks
    const pts = [];
    for (let s = 0; s <= 6; s++) {
      const r = TRACK_IN + ((TRACK_OUT - TRACK_IN) * s) / 6;
      const b = a + 0.18 * (s / 6) ** 1.4;
      pts.push(`${(x + Math.cos(b) * r).toFixed(2)} ${(y + Math.sin(b) * r).toFixed(2)}`);
    }
    wedges.push(`M${pts.join("L")}`);
  }
  return onTopAt(
    PLATTER_TOP + 0.01,
    `<path class="hdd-sheen" d="M${x - 40} ${y - 18}A44 44 0 0 1 ${x - 10} ${y - 43}L${x - 6} ${y - 30}A31 31 0 0 0 ${x - 27} ${y - 13}Z"/>` +
      `<path class="iso-line" data-tone="faint" d="${zones}"/>` +
      `<g data-part="spin"><path class="hdd-wedge" d="${wedges.join("")}"/></g>` +
      `<path class="hdd-track" data-part="track" d="${circle(x, y, 30)}"/>`,
  );
}

function spindle() {
  const [x, y] = HUB;
  const out = [];
  out.push(S(k.cylinder(x, y, SPINDLE_R, PLATTER_TOP, 2.2, P, 56, 0.4), { tone: "mid" }));
  const clampTop = PLATTER_TOP + 2.2;
  out.push(S(k.cylinder(x, y, 10, clampTop, 1.2, P, 48, 0.3), { tone: "hi" }));
  // the six clamp screws turn with the platter, so they are drawn live
  out.push(onTopAt(clampTop + 1.2, `<g data-part="spin"><g class="hdd-screws">${Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * 2 * Math.PI; return `<circle cx="${(x + Math.cos(a) * 6.4).toFixed(2)}" cy="${(y + Math.sin(a) * 6.4).toFixed(2)}" r="1.2"/>`; }).join("")}</g></g>`));
  out.push(S(k.cylinder(x, y, 2.6, clampTop + 1.2, 0.8, P, 20), { tone: "mid" }));
  out.push(L(k.ring(x, y, 1, clampTop + 2, P, 10), { tone: "lo" }));
  return out.join("");
}

// ── Parking ramp at the platter's edge, on the head's path ────────────────
function ramp() {
  // the ramp sits where the head's arc leaves the platter: the head parks on its lip
  const [cx, cy] = headAt(RAMP_R + 2.5);
  const out = [];
  out.push(S(k.slabOf({ x: cx - 4, y: cy - 6, w: 8, d: 12, r: 1.4 }, FLOOR, ARM_Z + 2 - FLOOR, P, 3, 0.3), { tone: "mid" }));
  out.push(L(k.lineOnTop([cx - 4, cy], [cx + 4, cy], ARM_Z + 2, P), { tone: "lo" }));
  out.push(D([at([cx + 2.4, cy + 4, ARM_Z + 2])], { size: 0.4 }));
  return out.join("");
}

// ── Actuator: bearing, voice coil under its magnet, arm and head ─────────
function bearing() {
  const [x, y] = PIVOT;
  const out = [];
  out.push(S(k.cylinder(x, y, 7.5, FLOOR, ARM_Z - FLOOR - 0.6, P, 40), { tone: "mid" }));
  return out.join("");
}

// The moving parts, drawn flat in the arm's plane and turned live about the pivot.
// Two copies a millimetre apart give the arm its edge.
function arm() {
  const [x, y] = PIVOT;
  const reach = HEAD_REACH;
  // the arm points along local +x from the pivot at rest; live code rotates the group
  const blade = `M${x} ${y - 5.6}L${x + 14} ${y - 4.2}L${x + reach - 6} ${y - 1.4}L${x + reach - 6} ${y + 1.4}L${x + 14} ${y + 4.2}L${x} ${y + 5.6}Z`;
  const holes = [circle(x + 17, y, 2), `M${x + 25} ${y - 1.6}L${x + 38} ${y - 1}L${x + 38} ${y + 1}L${x + 25} ${y + 1.6}Z`];
  const flexure = `M${x + reach - 9} ${y - 1.2}L${x + reach} ${y - 0.6}L${x + reach} ${y + 0.6}L${x + reach - 9} ${y + 1.2}Z`;
  const slider = `M${x + reach - 1.6} ${y - 1.1}h3.2v2.2h-3.2Z`;
  // the voice coil behind the pivot: a flat wound loop in a fan-shaped yoke
  const coil = `M${x - 6} ${y - 6}L${x - 22} ${y - 12}A24 24 0 0 0 ${x - 22} ${y + 12}L${x - 6} ${y + 6}Z`;
  const coilIn = `M${x - 10} ${y - 5}L${x - 19} ${y - 8.4}A19 19 0 0 0 ${x - 19} ${y + 8.4}L${x - 10} ${y + 5}Z`;
  const layer = (dz, cls) =>
    onTopAt(
      ARM_Z + dz,
      `<g data-part="arm" data-layer="${cls}"><path class="hdd-arm-${cls}" d="${coil}${blade}"/>${cls === "top" ? `<path class="hdd-hole" d="${coilIn}${holes.join("")}"/><path class="hdd-flex" d="${flexure}"/><path class="hdd-slider" d="${slider}"/><path class="iso-line" data-tone="lo" d="M${x + 38} ${y}L${x + reach - 9} ${y}"/>` : ""}</g>`,
    );
  return layer(0, "edge") + layer(0.7, "top");
}

function magnet() {
  // the top magnet plate over the coil: a fan-shaped plate on two posts
  const [x, y] = PIVOT;
  const ring = [];
  for (let i = 0; i <= 16; i++) {
    const a = SWEEP_MID + Math.PI - 0.62 + (1.24 * i) / 16;
    ring.push([x + Math.cos(a) * 27, y + Math.sin(a) * 27]);
  }
  const back = SWEEP_MID + Math.PI;
  const across = SWEEP_MID + Math.PI / 2;
  const near = (along, off) => [x + Math.cos(back) * along + Math.cos(across) * off, y + Math.sin(back) * along + Math.sin(across) * off];
  ring.push(near(8, -9), near(8, 9));
  const z0 = ARM_Z + 3.4;
  const out = [];
  const posts = [near(24, -12), near(24, 12)];
  for (const [px, py] of byDepth(posts)) out.push(S(k.cylinder(px, py, 1.6, FLOOR, z0 - FLOOR, P, 14), { tone: "lo" }));
  out.push(S(k.extrude(ring, z0, 2.4, P, { convex: true, bevel: 0.4 }), { tone: "mid" }));
  out.push(D(posts.map(([px, py]) => at([px, py, z0 + 2.4])), { size: 0.45, tone: "mid" }));
  // the bearing cap and its screw sit above everything at the pivot
  out.push(S(k.cylinder(x, y, 5, ARM_Z + 2, 2.6, P, 32), { tone: "mid" }));
  out.push(S(k.cylinder(x, y, 2.4, ARM_Z + 4.6, 0.8, P, 18), { tone: "hi" }));
  out.push(L(k.lineOnTop([x - 1.6, y], [x + 1.6, y], ARM_Z + 5.4, P), { tone: "lo" }));
  return out.join("");
}

// ── Flex ribbon from the arm block to the bulkhead connector ─────────────
function flex() {
  const [x, y] = PIVOT;
  const pts = [[x + 4, y + 7, ARM_Z], [x + 7, y + 12, ARM_Z - 1], [x + 9, y + 17, FLOOR + 4], [x + 10, y + 21, FLOOR + 2]];
  const out = [];
  out.push(`<path class="hdd-ribbon" d="${k.pathOf(pts.map(at))}"/>`);
  out.push(S(k.slabOf({ x: x + 5, y: y + 20, w: 10, d: 5, r: 0.6 }, FLOOR, 3, P, 2), { tone: "lo" }));
  return out.join("");
}

// ── The end face: SATA data and power connectors and the activity LED ───
function connectors() {
  const end = CASE.y + CASE.d;
  const out = [];
  const plug = (x0, w) => {
    out.push(S(k.slabOf({ x: x0, y: end - 0.2, w, d: 3, r: 0.6 }, 1, 6, P, 2, 0.3), { tone: "lo" }));
    out.push(L(k.planOutline({ x: x0 + 1, y: end + 0.6, w: w - 2, d: 1.6, r: 0.4 }, 7, P, 2), { tone: "faint" }));
  };
  plug(-40, 14);
  plug(-22, 24);
  // jumper pins and the LED, small and on the casting's end face
  out.push(D(Array.from({ length: 4 }, (_, i) => at([10 + i * 2.4, end, 4])), { size: 0.4, tone: "mid" }));
  const lf = G.frameAlong([38, end, 14], [0, 1, 0]);
  out.push(S(G.disc(0, 0.6, 2.2, lf, P), { tone: "lo" }));
  out.push(`<g data-part="led-off">${S(G.disc(0.6, 1.4, 1.3, lf, P), { tone: "mid" })}</g>`);
  out.push(`<g data-part="led-on" style="display:none">${S(G.disc(0.6, 1.4, 1.3, lf, P), { tone: "hi", lit: true })}</g>`);
  return out.join("");
}

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  className: "hdd-svg",
  label:
    "A 3.5 inch hard drive with its lid off on an anti-static mat: a platter spinning on its spindle, and a voice-coil actuator that swings the read head across the tracks. Outer tracks pass more data under the head each turn, so the readout's throughput rises as the head moves outward.",
  body: [mat(), casting(), connectors(), `<g clip-path="url(#hdd-open)">`, platter(), platterFace(), ramp(), bearing(), flex(), arm(), spindle(), magnet(), `</g>`],
});

const LIVE = {
  hub: HUB,
  pivot: PIVOT,
  reach: HEAD_REACH,
  trackIn: TRACK_IN,
  trackOut: TRACK_OUT,
  rampR: RAMP_R,
};

mkdirSync(join(ROOT, "src/components/figures"), { recursive: true });
writeFileSync(
  join(ROOT, "src/components/figures/hddArt.js"),
  `// Generated by scripts/figures/hdd.build.mjs — do not edit by hand.\nexport const HDD_SVG = ${JSON.stringify(svg)};\nexport const HDD_LIVE = ${JSON.stringify(LIVE)};\n`,
);
console.log("wrote src/components/figures/hddArt.js", (svg.length / 1024).toFixed(1), "KB");

if (process.argv.includes("--preview")) {
  const css = readFileSync(join(HERE, "kit/iso.css"), "utf8") + readFileSync(join(ROOT, "src/components/figures/hdd.css"), "utf8");
  const live = readFileSync(join(ROOT, "src/components/figures/hddLive.js"), "utf8").replace(/^export /gm, "");
  const page = `<!doctype html><meta charset="utf-8"><title>hdd</title><style>${css}
body{margin:0;background:#020402;padding:24px;font-family:monospace;color:#b7f5c3}.wrap{width:${process.env.W || 340}px}</style>
<div class="wrap hdd-figure"><div class="hdd-card iso"><div class="hdd-stage" tabindex="0">${svg}</div></div><div data-readout></div></div>
<script>${live}
mountHdd(document.querySelector(".hdd-figure"), ${JSON.stringify(LIVE)}, (a, b) => document.querySelector("[data-readout]").textContent = a + " · " + b);</script>`;
  mkdirSync(join(HERE, "out"), { recursive: true });
  writeFileSync(join(HERE, "out/hdd.html"), page);
  console.log("wrote scripts/figures/out/hdd.html");
}
