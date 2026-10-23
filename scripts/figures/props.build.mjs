// Builds the three evidence props pinned around the name in the intro.
// Run: node scripts/figures/props.build.mjs [--preview]
// Writes src/components/figures/propsArt.js; --preview also writes scripts/figures/out/props.html.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "./kit/iso-kit.mjs";
import * as G from "./kit/lathe.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "../..");

const toolsFor = (P) => ({
  at: (point) => k.iso(point, P),
  S: (paths, style) => k.solidSvg(paths, style),
  L: (d, style) => k.lineSvg(d, style),
  D: (points, style) => k.dotsSvg(points, style),
  topAt: (z) => k.topMatrix([0, 0], z, P, "x"),
});

// ── Exhibit A: a single-board computer, 85 × 56 mm (a generic Pi-style board) ─
function sbc() {
  const W = 200;
  const H = 140;
  const B = { x: 0, y: 0, w: 85, d: 56, r: 3 };
  const T = 1.4;
  const P = k.fitProjection([...k.boxCorners({ x: 0, y: -1, w: 88, d: 57, r: 1 }, 0, 16.5)], W, H, { pad: 8, azimuth: 36, elevation: 44 });
  const { at, S, L, D } = toolsFor(P);
  const depthOf = (plan, z = T) => k.depthOf([plan.x + plan.w / 2, plan.y + plan.d / 2, z], P);
  const items = [];
  const put = (plan, svg) => items.push({ key: depthOf(plan), svg });

  const out = [`<path class="iso-halo" d="${k.haloOf(B, 0, 3, P)}" style="filter:blur(5px)"/>`];
  out.push(S(k.slabOf(B, 0, T, P, 4, 0.3), { tone: "mid" }));
  // mounting holes with their copper rings, 58 × 49 apart
  const holes = [[3.5, 3.5], [61.5, 3.5], [3.5, 52.5], [61.5, 52.5]];
  out.push(`<g transform="${k.topMatrix([0, 0], T, P, "x")}"><path class="pr-dark" d="${holes.map(([x, y]) => `M${x + 1.35} ${y}a1.35 1.35 0 1 0 -2.7 0a1.35 1.35 0 1 0 2.7 0Z`).join("")}"/></g>`);
  out.push(L(holes.map(([x, y]) => k.ring(x, y, 3, T, P, 16)).join(""), { tone: "lo" }));
  // etched traces between the SoC, the RAM and the header, ending on parts
  out.push(L(k.onTop([[33.5, 26], [38, 26]], T, P) + k.onTop([[33.5, 30], [38, 30]], T, P) + k.onTop([[26, 37.5], [26, 47.9]], T, P) + k.onTop([[20, 37.5], [16, 41], [16, 47.9]], T, P), { tone: "faint" }));

  // the 40-pin header along the far edge: a black shroud with two rows of pins
  const header = { x: 7.1, y: 47.9, w: 50.8, d: 5.1, r: 0.3 };
  put(header, S(k.slabOf(header, T, 2.5, P, 1), { tone: "lo" }) + D(Array.from({ length: 40 }, (_, i) => at([header.x + 1.27 + Math.floor(i / 2) * 2.54, header.y + 1.27 + (i % 2) * 2.54, T + 2.5])), { size: 0.55, tone: "hi" }));
  // the SoC under its metal lid, the one lit part, and the RAM beside it
  const soc = { x: 18.5, y: 22.5, w: 15, d: 15, r: 0.8 };
  put(soc, S(k.slabOf(k.insetPlan(soc, -0.8), T, 0.4, P, 2), { tone: "lo", crease: "none" }) + S(k.slabOf(soc, T + 0.4, 1.4, P, 3, 0.4), { tone: "hi", lit: true }));
  const ram = { x: 38, y: 23, w: 10, d: 14, r: 0.4 };
  put(ram, S(k.slabOf(ram, T, 1.1, P, 2, 0.2), { tone: "lo" }) + D([at([ram.x + 1.4, ram.y + 1.4, T + 1.1])], { size: 0.4, tone: "mid" }));
  // the wireless module's shield can
  const can = { x: 6, y: 30, w: 11, d: 11, r: 0.4 };
  put(can, S(k.slabOf(can, T, 1.4, P, 2, 0.3), { tone: "mid" }) + D(k.corners(can, 1.4).map(([x, y]) => at([x, y, T + 1.4])), { size: 0.35, tone: "lo" }));
  // the USB/Ethernet controller and two status LEDs
  const ctl = { x: 54, y: 30, w: 8, d: 8, r: 0.3 };
  put(ctl, S(k.slabOf(ctl, T, 0.9, P, 2), { tone: "lo" }));
  put({ x: 3, y: 7, w: 2, d: 5, r: 0 }, S(k.slabOf({ x: 2, y: 7, w: 2, d: 1.6, r: 0.3 }, T, 0.6, P, 1), { tone: "hi", lit: true }) + S(k.slabOf({ x: 2, y: 10, w: 2, d: 1.6, r: 0.3 }, T, 0.6, P, 1), { tone: "mid" }));

  // the right edge: two stacked USB ports and the Ethernet jack, overhanging the board,
  // each with its openings on the outward face
  const face = 87.2;
  const right = (inner) => `<g transform="${k.sideMatrix([face, 0], 0, P, "right")}">${inner}</g>`;
  const port = (y0, d, h, openings) => {
    const plan = { x: 69.5, y: y0, w: face - 69.5, d, r: 0.4 };
    let svg = S(k.slabOf(plan, T, h, P, 2, 0.4), { tone: "mid" });
    svg += right(openings.map(([y, z, w, hh]) => `<path class="pr-dark" d="M${-(y + w)} ${-(z + hh)}h${w}v${hh}h${-w}Z"/><path class="iso-line" data-tone="lo" d="M${-(y + w)} ${-(z + hh)}h${w}v${hh}h${-w}Z"/>`).join(""));
    put(plan, svg);
  };
  port(2, 14.6, 15.6, [[3.5, T + 2.6, 7.6, 3], [3.5, T + 10.2, 7.6, 3]]);
  port(20, 14.6, 15.6, [[21.5, T + 2.6, 7.6, 3], [21.5, T + 10.2, 7.6, 3]]);
  port(38, 16, 13.5, [[40.5, T + 3, 11, 8.4]]);

  // the near edge: USB-C power, two micro-HDMI and the audio jack, each a short block
  const near = (x, w, h) => put({ x, y: -1.2, w, d: 7.4, r: 0.6 }, S(k.slabOf({ x, y: -1.2, w, d: 7.4, r: 0.6 }, T, h, P, 2, 0.3), { tone: "mid" }));
  near(7.2, 9, 3.2);
  near(21.4, 6.6, 3);
  near(34.8, 6.6, 3);
  put({ x: 50, y: -2, w: 7, d: 12, r: 0 }, S(k.cylinder(53.5, 1.5, 3, T, 5.6, P, 20), { tone: "mid" }) + S(k.slabOf({ x: 50, y: 1.5, w: 7, d: 6, r: 0.6 }, T, 5.6, P, 2), { tone: "mid" }));

  out.push(...items.sort((a, b) => a.key - b.key).map((it) => it.svg));
  return k.figureSvg({ width: W, height: H, className: "pr-svg", label: "A credit-card-sized single-board computer.", body: [out.join("")] });
}

// ── Exhibit B: a CPU on its substrate, 37.5 × 37.5 mm ─────────────────────
function cpu() {
  const W = 180;
  const H = 130;
  const SUB = { x: -19, y: -19, w: 38, d: 38, r: 1 };
  const SUB_T = 1.6;
  const IHS = { x: -13.5, y: -15, w: 27, d: 30, r: 1.6 };
  const IHS_T = 2.4;
  const P = k.fitProjection([...k.boxCorners(SUB, 0, SUB_T + IHS_T + 1)], W, H, { pad: 10, azimuth: 40, elevation: 40 });
  const { at, S, L, D } = toolsFor(P);
  const top = SUB_T + IHS_T;
  const out = [`<path class="iso-halo" d="${k.haloOf(SUB, 0, 3, P)}" style="filter:blur(5px)"/>`];
  out.push(S(k.slabOf(SUB, 0, SUB_T, P, 2, 0.3), { tone: "mid" }));
  // land-side capacitors in rows along two edges, each a tiny slab with end caps
  const caps = [];
  for (let i = 0; i < 6; i++) caps.push([-16.6, -12 + i * 4.4]);
  for (let i = 0; i < 6; i++) caps.push([15.2, -12 + i * 4.4]);
  for (const [x, y] of caps.sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P))) {
    out.push(S(k.slabOf({ x, y, w: 1.4, d: 2.4, r: 0.2 }, SUB_T, 0.7, P, 1), { tone: "lo", crease: "none" }));
  }
  // the alignment triangle in a corner of the substrate
  out.push(L(k.onTop([[-18, 18], [-14.5, 18], [-18, 14.5], [-18, 18]], SUB_T, P), { tone: "hi" }));
  // the heat spreader: a skirt, then the raised plateau, the one lit part
  out.push(S(k.slabOf(k.insetPlan(IHS, -1.2), SUB_T, 0.8, P, 3, 0.2), { tone: "mid" }));
  out.push(S(k.slabOf(IHS, SUB_T + 0.8, IHS_T - 0.8, P, 4, 0.5), { tone: "hi", lit: true }));
  out.push(L(k.planOutline(k.insetPlan(IHS, 2), top, P, 3), { tone: "faint" }));
  out.push(k.faceTextSvg(k.topMatrix([IHS.x + 4, IHS.y + 10], top, P, "x"), "AV-2005", { size: 3.6, tone: "lo" }));
  out.push(L([0, 1].map((i) => k.lineOnTop([IHS.x + 4, IHS.y + 14 + i * 3.4], [IHS.x + (i ? 15 : 21), IHS.y + 14 + i * 3.4], top, P)).join(""), { tone: "lo", free: true }));
  out.push(D(k.corners(SUB, 1.8).map(([x, y]) => at([x, y, SUB_T])), { size: 0.45, tone: "mid" }));
  return k.figureSvg({ width: W, height: H, className: "pr-svg", label: "A processor with its heat spreader on a substrate.", body: [out.join("")] });
}

function onTop(transform, inner) {
  return inner ? `<g transform="${transform}">${inner}</g>` : "";
}

const PROPS = { sbc: sbc(), cpu: cpu() };

mkdirSync(join(ROOT, "src/components/figures"), { recursive: true });
writeFileSync(
  join(ROOT, "src/components/figures/propsArt.js"),
  `// Generated by scripts/figures/props.build.mjs — do not edit by hand.\n${Object.entries(PROPS).map(([name, svg]) => `export const ${name.toUpperCase()}_SVG = ${JSON.stringify(svg)};`).join("\n")}\n`,
);
console.log("wrote src/components/figures/propsArt.js", (Object.values(PROPS).join("").length / 1024).toFixed(1), "KB");

if (process.argv.includes("--preview")) {
  const css = readFileSync(join(HERE, "kit/iso.css"), "utf8") + readFileSync(join(ROOT, "src/components/figures/props.css"), "utf8");
  const page = `<!doctype html><meta charset="utf-8"><title>props</title><style>${css}
body{margin:0;background:#020402;padding:24px;display:flex;gap:24px;align-items:flex-start}.pr-card{width:420px}</style>
${Object.values(PROPS).map((svg) => `<div class="pr-card iso">${svg}</div>`).join("")}`;
  mkdirSync(join(HERE, "out"), { recursive: true });
  writeFileSync(join(HERE, "out/props.html"), page);
  console.log("wrote scripts/figures/out/props.html");
}
