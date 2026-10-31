(() => {
"use strict";

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
const track = document.getElementById("track");
const veilCv = document.getElementById("veil");
const seamCv = document.getElementById("seamfx");
const blurband = document.getElementById("blurband");
const acts = Array.prototype.slice.call(document.querySelectorAll(".act"));

const CH = [
  { t: "ovt",   w: "SHADE",          l: "A monolith split into two realities.",                   yaw: 0,   pit: 0,   roll: 0,  zoom: 1.12, seam: 0,    shat: 0,    grain: .28, glow: .12, photo: 0,   scan: .08, deb: .18, fall: 0,   spin: .10 },
  { t: "slab",  w: "THE SLAB",       l: "One surface. One truth.",                                yaw: -6,  pit: 2,   roll: 1,  zoom: 1.00, seam: 0,    shat: 0,    grain: .30, glow: .15, photo: 0,   scan: .10, deb: .10, fall: 0,   spin: .08 },
  { t: "seam",  w: "THE SEAM",       l: "Drag it. Two realities share one stone.",                yaw: -14, pit: -3,  roll: -2, zoom: 0.97, seam: .55,  shat: 0,    grain: .35, glow: .60, photo: 0,   scan: .18, deb: .38, fall: .05, spin: .30 },
  { t: "noise", w: "NOISE",          l: "Grain is a fingerprint the sensor cannot help leaving.", yaw: 10,  pit: 4,   roll: 3,  zoom: 1.06, seam: .12,  shat: 0,    grain: 1,   glow: .30, photo: 0,   scan: .25, deb: .22, fall: 0,   spin: .15 },
  { t: "light", w: "LIGHT",          l: "Reflections obey geometry. Fakes forget the angle.",     yaw: -6,  pit: -6,  roll: -1, zoom: 0.88, seam: .70,  shat: 0,    grain: .50, glow: 1,   photo: .05, scan: .35, deb: .50, fall: .10, spin: .55 },
  { t: "tex",   w: "TEXTURE",        l: "Skin repeats when a machine imagines it.",               yaw: 16,  pit: 8,   roll: -6, zoom: 0.95, seam: .85,  shat: .75,  grain: .75, glow: .40, photo: .05, scan: .30, deb: 1,   fall: .55, spin: 1 },
  { t: "fine",  w: "THE FINE PRINT", l: "Small text betrays big models.",                         yaw: -8,  pit: -4,  roll: 2,  zoom: 1.25, seam: 1,    shat: 0,    grain: .55, glow: .35, photo: .10, scan: .15, deb: .30, fall: .20, spin: .30 },
  { t: "prov",  w: "PROVENANCE",     l: "Every image remembers where it was made.",               yaw: 10,  pit: 4,   roll: -2, zoom: 0.92, seam: .55,  shat: .30,  grain: .60, glow: .40, photo: .10, scan: .20, deb: .65, fall: .85, spin: .60 },
  { t: "unbr",  w: "UNBROKEN",       l: "Pull back. It was one photograph all along.",            yaw: 0,   pit: 0,   roll: 0,  zoom: 1.32, seam: 0,    shat: 0,    grain: .28, glow: .10, photo: 1,   scan: 0,   deb: .06, fall: 0,   spin: .05 }
];

let W = 0, H = 0, DPR = 1;
let warmTex = null, cyanTex = null, warmBase = null, cyanBase = null, grainPat = null;
let shards = [], orbit = [];
let dragging = false, dragX0 = 0, dragY0 = 0, orbY = 0, orbP = 0, yawVel = 0;
let lastIdx = -1, etchStep = -1, raf = false;
let cur = -1, prevCur = 0, smoothVel = 0;
let tx = 0, ty = 0, px = 0, py = 0;
let gSpin = 0, gFall = 0;
let idleOrbit = 0;
let monoPath = null;

function rand(a, b) { return a + Math.random() * (b - a); }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function sub3(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function dot3(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function cross3(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function norm3(a) { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
function rotAxis(v, ax, ang) {
  const c = Math.cos(ang), s = Math.sin(ang);
  const d = dot3(ax, v);
  const cr = cross3(ax, v);
  return [v[0] * c + cr[0] * s + ax[0] * d * (1 - c), v[1] * c + cr[1] * s + ax[1] * d * (1 - c), v[2] * c + cr[2] * s + ax[2] * d * (1 - c)];
}

const FINE_LINES = ["MADE WITH LIGHT, NOT PAINT", "35MM, F1.4, ISO 200", "GRAIN STRUCTURED, EVEN", "A SURFACE THAT REMEMBERS"];
const SUB = { A: "R", B: "8", C: "G", D: "0", E: "F", F: "E", G: "C", H: "N", I: "1", K: "X", L: "I", M: "N", N: "M", O: "0", P: "R", R: "P", S: "5", T: "7", U: "V", V: "U", W: "V", X: "K", Y: "V", Z: "2", "0": "O", "1": "I", "4": "A", "5": "S", "7": "T", "8": "B" };

function buildTextures() {
  warmTex = document.createElement("canvas");
  warmTex.width = 256; warmTex.height = 512;
  let g = warmTex.getContext("2d");
  let gr = g.createLinearGradient(0, 0, 256, 0);
  gr.addColorStop(0, "#140d08"); gr.addColorStop(.45, "#2e1c0c");
  gr.addColorStop(.7, "#5a3614"); gr.addColorStop(.9, "#8a5420"); gr.addColorStop(1, "#a86a28");
  g.fillStyle = gr; g.fillRect(0, 0, 256, 512);
  let img = g.getImageData(0, 0, 256, 512), d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = Math.random() * 40 - 20;
    d[i] += n; d[i + 1] += n * .8; d[i + 2] += n * .5;
  }
  g.putImageData(img, 0, 0);
  let e = g.createLinearGradient(170, 0, 256, 0);
  e.addColorStop(0, "rgba(229,139,53,0)"); e.addColorStop(1, "rgba(233,153,70,0.75)");
  g.fillStyle = e; g.fillRect(150, 0, 106, 512);
  warmBase = document.createElement("canvas");
  warmBase.width = 256; warmBase.height = 512;
  warmBase.getContext("2d").drawImage(warmTex, 0, 0);

  cyanTex = document.createElement("canvas");
  cyanTex.width = 256; cyanTex.height = 512;
  g = cyanTex.getContext("2d");
  gr = g.createLinearGradient(0, 0, 256, 0);
  gr.addColorStop(0, "#4fd2c2"); gr.addColorStop(.25, "#2a8d86");
  gr.addColorStop(.55, "#123c46"); gr.addColorStop(1, "#0b1a24");
  g.fillStyle = gr; g.fillRect(0, 0, 256, 512);
  img = g.getImageData(0, 0, 256, 512); d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = Math.random() * 30 - 15;
    d[i] += n * .4; d[i + 1] += n; d[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
  e = g.createLinearGradient(0, 0, 70, 0);
  e.addColorStop(0, "rgba(80,236,222,0.65)"); e.addColorStop(1, "rgba(60,228,214,0)");
  g.fillStyle = e; g.fillRect(0, 0, 90, 512);
  cyanBase = document.createElement("canvas");
  cyanBase.width = 256; cyanBase.height = 512;
  cyanBase.getContext("2d").drawImage(cyanTex, 0, 0);

  const gt = document.createElement("canvas");
  gt.width = gt.height = 160;
  const gg = gt.getContext("2d");
  const gi = gg.createImageData(160, 160);
  for (let i = 0; i < gi.data.length; i += 4) {
    const v = Math.random() * 255;
    gi.data[i] = gi.data[i + 1] = gi.data[i + 2] = v; gi.data[i + 3] = 255;
  }
  gg.putImageData(gi, 0, 0);
  grainPat = ctx.createPattern(gt, "repeat");
}

function etch(base, tex, align, x, color, decay) {
  if (decay <= 0.001) { return; }
  const g = tex.getContext("2d");
  g.clearRect(0, 0, 256, 512);
  g.drawImage(base, 0, 0);
  g.save();
  g.font = "10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  g.textAlign = align;
  g.fillStyle = color;
  for (let li = 0; li < FINE_LINES.length; li++) {
    const line = FINE_LINES[li];
    let s = "";
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === " ") { s += " "; continue; }
      const unstable = (li * 31 + i * 17) % 23 < decay * 23;
      s += unstable ? (SUB[ch] || "#") : ch;
    }
    g.fillText(s, x, 46 + li * 16);
  }
  g.restore();
}

function etchFine(step) {
  const decay = Math.min(1, step / 6);
  etch(warmBase, warmTex, "right", 246, "rgba(255,205,150,0.55)", decay);
  etch(cyanBase, cyanTex, "left", 10, "rgba(190,255,244,0.5)", decay);
}

const HH = 1.6, HW = 0.45, HD = 0.2;
const GRID_C = 4, GRID_R = 7;

function buildShards() {
  shards = [];
  for (let half = 0; half < 2; half++) {
    const kind = half === 0 ? 0 : 1;
    const cx = half === 0 ? -HW : HW;
    for (let side = 0; side < 2; side++) {
      const zn = side === 0 ? 1 : -1;
      const z0 = zn * HD;
      for (let i = 0; i < GRID_C; i++) {
        for (let j = 0; j < GRID_R; j++) {
          const x0 = cx - HW + (2 * HW) * i / GRID_C;
          const x1 = cx - HW + (2 * HW) * (i + 1) / GRID_C;
          const y0 = -HH + (2 * HH) * j / GRID_R;
          const y1 = -HH + (2 * HH) * (j + 1) / GRID_R;
          const fu0 = (x0 - (cx - HW)) / (2 * HW), fu1 = (x1 - (cx - HW)) / (2 * HW);
          const fv0 = (y0 + HH) / (2 * HH), fv1 = (y1 + HH) / (2 * HH);
          const tex = kind === 0 ? warmTex : cyanTex;
          shards.push({
            c: [(x0 + x1) / 2, (y0 + y1) / 2, z0],
            n: [0, 0, zn],
            u: [(x1 - x0) / 2, 0, 0],
            v: [0, (y1 - y0) / 2, 0],
            dr: rand(0.35, 1.3), dx: rand(-0.35, 0.35), dy: rand(-0.3, 0.3),
            r1: rand(0.0004, 0.0013) * (Math.random() < .5 ? -1 : 1),
            r2: rand(0.0003, 0.0009) * (Math.random() < .5 ? -1 : 1),
            k: rand(0, 1),
            rot1: 0, rot2: 0, fy: 0,
            tex, kind,
            u0: fu0 * tex.width, v0: fv0 * tex.height,
            u1: fu1 * tex.width, v1: fv1 * tex.height
          });
        }
      }
    }
  }
}

function buildOrbit() {
  orbit = [];
  for (let i = 0; i < 12; i++) {
    orbit.push({
      r0: rand(1.25, 2.45),
      w0: rand(0.05, 0.16) * (Math.random() < .5 ? -1 : 1),
      a0: rand(0, Math.PI * 2),
      y0: rand(-1.1, 1.1),
      ph: rand(0, Math.PI * 2),
      size: rand(0.14, 0.34),
      s1: rand(0.0005, 0.0016) * (Math.random() < .5 ? -1 : 1),
      s2: rand(0.0004, 0.001) * (Math.random() < .5 ? -1 : 1),
      k: rand(0, 1),
      rot1: 0, rot2: 0, fw: 0,
      kind: Math.random() < .55 ? 0 : 1
    });
  }
}

const lightDir = [-0.55, 0.5, 0.75];
const L2FIX = [0.7, 0.25, 0.55];

function shadeN(n) {
  const b = 0.34 + 0.52 * Math.max(0, dot3(n, lightDir)) + 0.22 * Math.max(0, dot3(n, L2FIX));
  return clamp(b, 0.08, 1.25);
}

function buildCam(yaw, pit, roll, R) {
  const cp = Math.cos(pit), sp = Math.sin(pit), cy = Math.cos(yaw), sy = Math.sin(yaw);
  const dir = [sy * cp, sp, cy * cp];
  const tgt = [0, 0.08, 0];
  const pos = [tgt[0] + R * dir[0], tgt[1] + R * dir[1], tgt[2] + R * dir[2]];
  const fw = norm3([-dir[0], -dir[1], -dir[2]]);
  let rt = norm3(cross3(fw, [0, 1, 0]));
  let up = norm3(cross3(rt, fw));
  if (roll) {
    rt = rotAxis(rt, fw, roll);
    up = rotAxis(up, fw, roll);
  }
  return { pos, fw, rt, up, f: Math.min(H * 0.8, W * 1.5) };
}

let CAM = null;

function proj(p) {
  const rx = p[0] - CAM.pos[0], ry = p[1] - CAM.pos[1], rz = p[2] - CAM.pos[2];
  const cz = dot3([rx, ry, rz], CAM.fw);
  if (cz < 0.25) return null;
  const cx = dot3([rx, ry, rz], CAM.rt);
  const cy = dot3([rx, ry, rz], CAM.up);
  return [W / 2 + CAM.f * cx / cz, H / 2 - CAM.f * cy / cz, cz];
}

let faces = [];

function quadFace(pts, n, opts) {
  faces.push(Object.assign({ pts, n }, opts));
}

function buildMonolithFaces(g, shat, glow) {
  for (let half = 0; half < 2; half++) {
    const sgn = half === 0 ? -1 : 1;
    const kind = half === 0 ? 0 : 1;
    const cx = sgn * (HW + g);
    const tex = kind === 0 ? warmTex : cyanTex;
    const x0 = cx - HW, x1 = cx + HW, yb = -HH, yt = HH, z0 = -HD, z1 = HD;
    const emis = kind === 0 ? "rgba(229,139,53," : "rgba(60,228,214,";
    if (shat <= 0.02) {
      quadFace([[x0, yb, z1], [x1, yb, z1], [x1, yt, z1], [x0, yt, z1]], [0, 0, 1], { tex, uvr: [0, 0, tex.width, tex.height], kind, solid: true });
      quadFace([[x1, yb, z0], [x0, yb, z0], [x0, yt, z0], [x1, yt, z0]], [0, 0, -1], { tex, uvr: [0, 0, tex.width, tex.height], kind, solid: true });
    }
    const ox = half === 0 ? x0 : x1;
    const onx = half === 0 ? -1 : 1;
    quadFace([[ox, yb, z1], [ox, yb, z0], [ox, yt, z0], [ox, yt, z1]], [onx, 0, 0], { tex, uvr: [0, 0, tex.width, tex.height], kind, solid: true });
    const ix = half === 0 ? x1 : x0;
    const inx = half === 0 ? 1 : -1;
    quadFace([[ix, yb, z1], [ix, yb, z0], [ix, yt, z0], [ix, yt, z1]], [inx, 0, 0], { emis: emis, glow: Math.max(0.12, glow), solid: true });
    quadFace([[x0, yt, z1], [x1, yt, z1], [x1, yt, z0], [x0, yt, z0]], [0, 1, 0], { tex, uvr: [0, 0, tex.width, tex.height], kind, solid: true });
    quadFace([[x0, yb, z0], [x1, yb, z0], [x1, yb, z1], [x0, yb, z1]], [0, -1, 0], { tex, uvr: [0, 0, tex.width, tex.height], kind, solid: true });
  }
  if (g > 0.02 && glow > 0.04) {
    quadFace([[-0.06, -HH, 0], [0.06, -HH, 0], [0.06, HH, 0], [-0.06, HH, 0]], [0, 0, 1], { grad: true, glow, two: true });
  }
}

function buildShardFaces(shat, g, spinA, fall) {
  if (shat <= 0.02) return;
  for (const p of shards) {
    const sgn = p.kind === 0 ? -1 : 1;
    const cx = p.c[0] + sgn * g;
    const cz = p.c[2];
    const cyw = p.c[1];
    const off = shat * p.dr;
    const ox = cx + shat * p.dx;
    const oy = cyw + shat * p.dy - p.fy * shat;
    const oz = cz + p.n[2] * off;
    const u1 = rotAxis(p.u, p.n, p.rot1 * shat);
    const v1 = rotAxis(p.v, p.n, p.rot1 * shat);
    const ua = norm3(u1);
    const v2 = rotAxis(v1, ua, p.rot2 * shat);
    const pts = [
      [ox - u1[0] - v2[0], oy - u1[1] - v2[1], oz - u1[2] - v2[2]],
      [ox + u1[0] - v2[0], oy + u1[1] - v2[1], oz + u1[2] - v2[2]],
      [ox + u1[0] + v2[0], oy + u1[1] + v2[1], oz + u1[2] + v2[2]],
      [ox - u1[0] + v2[0], oy - u1[1] + v2[1], oz - u1[2] + v2[2]]
    ];
    quadFace(pts, p.n, { tex: p.tex, uvr: [p.u0, p.v0, p.u1, p.v1], kind: p.kind, two: true, solid: true, shard: p });
  }
}

function buildOrbitFaces(deb, tNow) {
  if (deb < 0.04) return;
  for (const p of orbit) {
    const ang = p.a0 + tNow * 0.0001 * p.w0 * 60 * (1 + gSpin * 4);
    const r = p.r0 * (0.55 + deb * 0.9);
    const pxw = Math.cos(ang) * r;
    const pzw = Math.sin(ang) * r;
    const pyw = p.y0 + Math.sin(tNow * 0.0004 + p.ph) * 0.3 - p.fw;
    const tex = p.kind === 0 ? warmTex : cyanTex;
    const ax = norm3([Math.cos(p.a0), 0.3, Math.sin(p.a0)]);
    const u1 = rotAxis([1, 0, 0], ax, p.rot1);
    const v1 = rotAxis([0, 1, 0], ax, p.rot1);
    const ua = norm3(u1);
    const v2 = rotAxis(v1, ua, p.rot2);
    const s = p.size * (0.7 + deb * 0.5);
    const uu = [u1[0] * s, u1[1] * s, u1[2] * s];
    const vv = [v2[0] * s, v2[1] * s, v2[2] * s];
    const pts = [
      [pxw - uu[0] - vv[0], pyw - uu[1] - vv[1], pzw - uu[2] - vv[2]],
      [pxw + uu[0] - vv[0], pyw + uu[1] - vv[1], pzw + uu[2] - vv[2]],
      [pxw + uu[0] + vv[0], pyw + uu[1] + vv[1], pzw + uu[2] + vv[2]],
      [pxw - uu[0] + vv[0], pyw - uu[1] + vv[1], pzw - uu[2] + vv[2]]
    ];
    quadFace(pts, [0, 1, 0], { tex, uvr: [0, 0, tex.width, tex.height], kind: p.kind, two: true, shard: p });
  }
}

function drawShadow(cam, deb) {
  const c = proj([0, -HH, 0]);
  if (!c) return;
  const pts = [];
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2;
    const q = proj([Math.cos(a) * 1.0, -HH, Math.sin(a) * 1.0]);
    if (!q) return;
    pts.push(q);
  }
  let rad = 0;
  for (const q of pts) rad += Math.hypot(q[0] - c[0], q[1] - c[1]);
  rad = rad / pts.length;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  const gr = ctx.createRadialGradient(c[0], c[1], rad * 0.15, c[0], c[1], rad);
  gr.addColorStop(0, "rgba(1,1,3,0.6)");
  gr.addColorStop(1, "rgba(1,1,3,0)");
  ctx.fillStyle = gr;
  ctx.fill();
  ctx.restore();
}

function texTri(img, p0, p1, p2, t0, t1, t2, dark) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]);
  ctx.closePath();
  ctx.clip();
  const den = (t1[0] - t0[0]) * (t2[1] - t0[1]) - (t2[0] - t0[0]) * (t1[1] - t0[1]);
  if (Math.abs(den) > 1e-6) {
    const a = ((p1[0] - p0[0]) * (t2[1] - t0[1]) - (p2[0] - p0[0]) * (t1[1] - t0[1])) / den;
    const b = ((p2[0] - p0[0]) * (t1[0] - t0[0]) - (p1[0] - p0[0]) * (t2[0] - t0[0])) / den;
    const c = ((p1[1] - p0[1]) * (t2[1] - t0[1]) - (p2[1] - p0[1]) * (t1[1] - t0[1])) / den;
    const dd = ((p2[1] - p0[1]) * (t1[0] - t0[0]) - (p1[1] - p0[1]) * (t2[0] - t0[0])) / den;
    const e = p0[0] - a * t0[0] - b * t0[1];
    const f2 = p0[1] - c * t0[0] - dd * t0[1];
    ctx.transform(a, c, b, dd, e, f2);
    ctx.drawImage(img, 0, 0);
    if (dark > 0.02) {
      ctx.fillStyle = "rgba(5,3,2," + dark.toFixed(3) + ")";
      ctx.fillRect(0, 0, img.width, img.height);
    }
  }
  ctx.restore();
}

function drawFace(f) {
  const sp = f.sp;
  const area = Math.abs((sp[1][0] - sp[0][0]) * (sp[2][1] - sp[0][1]) - (sp[2][0] - sp[0][0]) * (sp[1][1] - sp[0][1]));
  const b = f.grad ? 1 : shadeN(f.n);
  const dark = clamp(1 - b, 0, 0.86);
  if (f.grad) {
    ctx.save();
    if (f.two) ctx.globalCompositeOperation = "lighter";
    const gr = ctx.createLinearGradient(sp[0][0], sp[0][1], sp[1][0], sp[1][1]);
    gr.addColorStop(0, "rgba(229,139,53," + (0.8 * f.glow).toFixed(3) + ")");
    gr.addColorStop(1, "rgba(60,228,214," + (0.8 * f.glow).toFixed(3) + ")");
    ctx.fillStyle = gr;
    path(sp);
    ctx.fill();
    ctx.restore();
  } else if (f.tex && area > 60) {
    const uvr = f.uvr;
    texTri(f.tex, sp[0], sp[1], sp[2], [uvr[0], uvr[3]], [uvr[2], uvr[3]], [uvr[2], uvr[1]], dark);
    texTri(f.tex, sp[0], sp[2], sp[3], [uvr[0], uvr[3]], [uvr[2], uvr[1]], [uvr[0], uvr[1]], dark);
  } else if (f.emis) {
    ctx.fillStyle = f.emis + clamp(f.glow, 0.08, 1).toFixed(3) + ")";
    path(sp);
    ctx.fill();
  } else {
    ctx.fillStyle = f.kind === 0 ? "#4a2c10" : "#0e3438";
    path(sp);
    ctx.fill();
  }
  if (f.solid) {
    monoPath.moveTo(sp[0][0], sp[0][1]);
    for (let i = 1; i < sp.length; i++) monoPath.lineTo(sp[i][0], sp[i][1]);
    monoPath.closePath();
  }
}

function path(sp) {
  ctx.beginPath();
  ctx.moveTo(sp[0][0], sp[0][1]);
  for (let i = 1; i < sp.length; i++) ctx.lineTo(sp[i][0], sp[i][1]);
  ctx.closePath();
}

function drawFaces() {
  for (const f of faces) {
    f.sp = [];
    let zsum = 0, ok = true;
    for (const p of f.pts) {
      const q = proj(p);
      if (!q) { ok = false; break; }
      f.sp.push(q);
      zsum += q[2];
    }
    f.z = ok ? zsum / f.pts.length : -1;
    f.ok = ok;
  }
  faces = faces.filter(f => f.ok);
  for (const f of faces) {
    if (f.two) continue;
    const ctr = [(f.pts[0][0] + f.pts[2][0]) / 2, (f.pts[0][1] + f.pts[2][1]) / 2, (f.pts[0][2] + f.pts[2][2]) / 2];
    if (dot3(f.n, sub3(CAM.pos, ctr)) < 0) f.ok = false;
  }
  faces = faces.filter(f => f.ok);
  faces.sort((a, b) => b.z - a.z);
  const mx = (px + 1) * .5 * W, my = (py + 1) * .5 * H;
  for (const f of faces) {
    if (f.shard) {
      const cxp = (f.sp[0][0] + f.sp[2][0]) * .5, cyp = (f.sp[0][1] + f.sp[2][1]) * .5;
      const dxp = cxp - mx, dyp = cyp - my;
      const dist = Math.hypot(dxp, dyp);
      if (dist < 280 && dist > 0.01) {
        const push = Math.pow(1 - dist / 280, 2) * 52;
        const ox = dxp / dist * push, oy = dyp / dist * push;
        for (const q of f.sp) { q[0] += ox; q[1] += oy; }
      }
    }
    drawFace(f);
  }
}

function render(cf) {
  const i = Math.min(CH.length - 2, Math.floor(cf));
  let fr = cf - i; fr = fr * fr * (3 - 2 * fr);
  const a = CH[i], b = CH[i + 1];
  const L = k => a[k] + (b[k] - a[k]) * fr;

  const idx = Math.round(cf);
  if (idx !== lastIdx) {
    lastIdx = idx;
    actLive(idx);
  }
  gSpin = L("spin"); gFall = L("fall");
  const tNow = performance.now();
  lightDir[0] = -0.55 + px * 0.7; lightDir[1] = 0.5 + py * 0.4; lightDir[2] = 0.75;
  const ll = Math.hypot(lightDir[0], lightDir[1], lightDir[2]) || 1;
  lightDir[0] /= ll; lightDir[1] /= ll; lightDir[2] /= ll;

  const yawDeg = L("yaw") + orbY + idleOrbit + px * 3 + Math.sin(tNow * 0.00035) * 1.2;
  const pitDeg = clamp(L("pit") + orbP - py * 2 + Math.cos(tNow * 0.00023) * 0.7, -55, 55);
  const roll = (L("roll") + clamp(smoothVel * 220, -9, 9)) * Math.PI / 180;
  const R = 5.0 / L("zoom");
  CAM = buildCam(yawDeg * Math.PI / 180, pitDeg * Math.PI / 180, roll, R);

  const seam = L("seam"), shat = L("shat"), grain = L("grain");
  const glow = L("glow"), tint = L("photo"), scan = L("scan"), deb = L("deb");

  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, W, H);

  faces = [];
  monoPath = new Path2D();

  drawShadow(0, 0);

  buildMonolithFaces(seam * 0.3, shat, glow);
  buildShardFaces(shat, seam * 0.3);
  buildOrbitFaces(deb, tNow);

  drawFaces();

  ctx.save();
  ctx.clip(monoPath);
  ctx.globalCompositeOperation = "lighter";
  const lx = (px + 1) * .5 * W, ly = (py + 1) * .5 * H;
  const lr = Math.min(W, H) * .42;
  const lg = ctx.createRadialGradient(lx, ly, 0, lx, ly, lr);
  lg.addColorStop(0, "rgba(255,238,214,0.20)");
  lg.addColorStop(.5, "rgba(255,214,160,0.08)");
  lg.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = lg;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  if (scan > 0.01) {
    const sy2 = H * (0.15 + 0.7 * ((cf % 1 + 1) % 1));
    const sg = ctx.createLinearGradient(0, sy2 - 90, 0, sy2 + 90);
    sg.addColorStop(0, "rgba(180,220,255,0)");
    sg.addColorStop(.5, "rgba(180,220,255," + (scan * 0.10).toFixed(3) + ")");
    sg.addColorStop(1, "rgba(180,220,255,0)");
    ctx.fillStyle = sg;
    ctx.fillRect(0, sy2 - 90, W, 180);
  }

  if (grain > 0.01 && grainPat) {
    ctx.save();
    ctx.globalAlpha = grain * 0.16;
    const off = (tNow * 0.06) % 160;
    ctx.translate(-off, -off * 0.6);
    ctx.fillStyle = grainPat;
    ctx.fillRect(0, 0, W + 160, H + 160);
    ctx.restore();
  }

  const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .35, W / 2, H / 2, Math.max(W, H) * .75);
  vg.addColorStop(0, "rgba(4,5,8,0)");
  vg.addColorStop(1, "rgba(2,3,5,0.55)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  if (tint > 0.01) {
    ctx.save();
    ctx.globalAlpha = tint * 0.65;
    ctx.globalCompositeOperation = "soft-light";
    ctx.fillStyle = "rgb(214,146,74)"; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = tint * 0.25;
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = "rgb(120,84,40)"; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  const seamP = proj([0, 0, 0]);
  const seamX = seamP ? clamp(seamP[0] / W, 0.04, 0.96) : 0.5;
  veilUpdate(tNow, seamX, seam, glow, 0.35 + scan * 0.65);
  seamfxDraw(tNow, seamX, seam);
  blurband.style.transform = "translateX(" + (seamX * W - 48).toFixed(1) + "px)";
  blurband.classList.toggle("on", seam > 0.04);
}

function tick() {
  raf = false;
  const max = Math.max(1, track.offsetHeight - H);
  const target = clamp(window.scrollY / max, 0, 1) * (CH.length - 1);
  if (cur < 0) { cur = target; prevCur = target; }
  const step = (target - cur) * 0.085;
  if (Math.abs(target - cur) < 0.0004) cur = target; else cur += step;
  const dCur = cur - prevCur; prevCur = cur;
  smoothVel += (dCur - smoothVel) * 0.2;
  px += (tx - px) * 0.07; py += (ty - py) * 0.07;

  if (!dragging) { orbY += yawVel; yawVel *= 0.93; idleOrbit += 0.012; }

  for (const p of shards) {
    p.rot1 += p.r1 * (1 + gSpin * 3);
    p.rot2 += p.r2 * (1 + gSpin * 3);
    if (gFall > 0.01 || Math.abs(dCur) > 0.002) p.fy += (gFall * 0.0045 + Math.abs(dCur) * 0.05) * (0.5 + p.k);
    if (p.fy > 1.6) p.fy -= 3.2; else if (p.fy < -1.6) p.fy += 3.2;
  }
  for (const p of orbit) {
    p.rot1 += p.s1 * (1 + gSpin * 3);
    p.rot2 += p.s2 * (1 + gSpin * 3);
    p.fw += gFall * 0.004 + Math.abs(dCur) * 0.03;
    if (p.fw > 1.7) p.fw -= 3.4;
  }
  const st = clamp(Math.round((cur - 5.8) * 2), 0, 6);
  if (st !== etchStep) { etchStep = st; etchFine(st); }

  render(cur);
  poke();
}

function poke() {
  if (!raf) { raf = true; requestAnimationFrame(tick); }
}

canvas.addEventListener("pointerdown", e => {
  dragging = true; dragX0 = e.clientX; dragY0 = e.clientY; yawVel = 0;
  document.body.classList.add("drag");
  try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
  poke();
});
window.addEventListener("pointermove", e => {
  tx = (e.clientX / Math.max(1, W) - .5) * 2; ty = (e.clientY / Math.max(1, H) - .5) * 2;
  if (!dragging) { poke(); return; }
  const dx = e.clientX - dragX0, dy = e.clientY - dragY0;
  dragX0 = e.clientX; dragY0 = e.clientY;
  orbY += dx * 0.28;
  yawVel = dx * 0.28;
  orbP = clamp(orbP - dy * 0.16, -40, 40);
  poke();
});
window.addEventListener("pointerup", () => { dragging = false; document.body.classList.remove("drag"); poke(); });
window.addEventListener("pointercancel", () => { dragging = false; document.body.classList.remove("drag"); poke(); });
window.addEventListener("scroll", poke, { passive: true });
window.addEventListener("resize", () => { resize(); veilResize(); seamResize(); poke(); });

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth; H = window.innerHeight;
  canvas.width = W * DPR; canvas.height = H * DPR;
  canvas.style.width = W + "px"; canvas.style.height = H + "px";
}


/* ===== acts, split text, decrypt, reveal ===== */
function actLive(i) {
  for (let k = 0; k < acts.length; k++) acts[k].classList.toggle("live", k === i);
}
document.querySelectorAll(".split").forEach(function (el) {
  const txt = el.textContent;
  el.textContent = "";
  const chars = txt.split("");
  for (let i = 0; i < chars.length; i++) {
    const s = document.createElement("span");
    s.className = "ch";
    s.textContent = chars[i] === " " ? "\u00A0" : chars[i];
    s.style.transitionDelay = (i * 0.028).toFixed(3) + "s";
    el.appendChild(s);
  }
});
const DGL = "!<>[]{}=+*#%AXZ";
function decrypt(el) {
  if (el._dec) return; el._dec = true;
  const txt = el.textContent;
  const t0 = performance.now();
  (function step() {
    const p = Math.min(1, (performance.now() - t0) / 750);
    const solid = Math.floor(txt.length * p);
    let s = "";
    for (let i = 0; i < txt.length; i++) {
      const c = txt[i];
      s += (c === " " || i < solid) ? c : DGL[(Math.random() * DGL.length) | 0];
    }
    el.textContent = s;
    if (p < 1) requestAnimationFrame(step); else { el.textContent = txt; el._dec = false; }
  })();
}
const io = new IntersectionObserver(function (es) {
  for (const e of es) if (e.isIntersecting) {
    e.target.classList.add("in");
    const ds = e.target.querySelectorAll("[data-dec]");
    for (const d of ds) decrypt(d);
    io.unobserve(e.target);
  }
}, { threshold: 0.22 });
document.querySelectorAll(".bone").forEach(function (b) { io.observe(b); });
decrypt(document.querySelector("header .mark"));
decrypt(document.querySelector("header .mk-sub"));

/* ===== magnet link ===== */
const mag = document.querySelector(".maglink");
if (mag) {
  let mrx = 0, mry = 0, mtx = 0, mty = 0, mraf = false;
  function magLoop() {
    mrx += (mtx - mrx) * 0.22; mry += (mty - mry) * 0.22;
    mag.style.transform = "translate(" + mrx.toFixed(2) + "px," + mry.toFixed(2) + "px)";
    if (Math.abs(mtx - mrx) > 0.15 || Math.abs(mty - mry) > 0.15) requestAnimationFrame(magLoop); else mraf = false;
  }
  function magKick() { if (!mraf) { mraf = true; requestAnimationFrame(magLoop); } }
  window.addEventListener("pointermove", function (e) {
    const r = mag.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    const d = Math.hypot(dx, dy);
    if (d < 90) { mtx = dx * 0.35; mty = dy * 0.35; } else { mtx = 0; mty = 0; }
    magKick();
  }, { passive: true });
}

/* ===== veil: dark veil, grid motion, beams, iridescent seam (one quad) ===== */
const gl = veilCv.getContext("webgl", { alpha: false, antialias: false, depth: false });
let veilOk = false, uT, uRes, uSx, uSa, uBm, uGd;
const VEIL_FS = [
  "precision mediump float;",
  "uniform vec2 r;uniform float t,sx,sa,bm,gd;",
  "float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}",
  "float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);",
  "return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}",
  "float fbm(vec2 p){float v=0.,a=.5;for(int k=0;k<4;k++){v+=a*n(p);p*=2.03;a*=.5;}return v;}",
  "void main(){",
  "vec2 uv=gl_FragCoord.xy/r;float asp=r.x/r.y;",
  "float veil=fbm(vec2(uv.x*asp*2.2,uv.y*1.7)+vec2(t*0.018,-t*0.011));",
  "vec3 col=mix(vec3(0.024,0.028,0.038),vec3(0.052,0.056,0.072),veil*0.9);",
  "float hor=0.34;float g=0.;",
  "if(uv.y<hor){float d=hor-uv.y;float gz=d*9.+t*0.35;",
  "float lx=abs(fract((uv.x-0.5)*(2.+d*7.)/max(d,0.02)*0.35+0.5)-0.5);",
  "float lz=abs(fract(gz)-0.5);",
  "g+=(smoothstep(0.06,0.,lx)+smoothstep(0.05,0.,lz))*smoothstep(0.34,0.02,d);}",
  "float gv=abs(fract(uv.x*asp*5.-t*0.05)-0.5);g+=smoothstep(0.015,0.,gv)*0.5;",
  "col+=vec3(0.05,0.10,0.11)*g*gd*0.5;",
  "float b1=exp(-pow((uv.x-0.30-0.06*sin(t*0.21))*7.,2.));",
  "float b2=exp(-pow((uv.x-0.72+0.05*sin(t*0.17+2.))*7.,2.));",
  "float beam=(b1*0.55+b2*0.45)*(0.35+0.65*fbm(vec2(uv.y*3.-t*0.1,t*0.05)));",
  "col+=mix(vec3(0.55,0.30,0.10),vec3(0.10,0.42,0.44),uv.x)*beam*bm*0.16;",
  "if(sa>0.003){float dx=(uv.x-sx)*asp;float band=exp(-dx*dx*180.);",
  "vec2 sp=vec2(uv.x*asp*3.,uv.y*2.);",
  "float w=fbm(sp+vec2(t*0.06,0.));",
  "float film=fbm(vec2(sp.x+w*2.2,sp.y*0.6+w*1.4-t*0.05));",
  "vec3 iri=0.5+0.5*cos(6.2831*(film*1.6+vec3(0.,0.33,0.67))+t*0.15);",
  "col=mix(col,iri*0.85,band*sa*0.55);",
  "col+=vec3(0.6,0.7,0.8)*band*sa*0.12*(0.5+0.5*film);}",
  "float vg=smoothstep(1.25,0.35,length((uv-0.5)*vec2(asp,1.)));",
  "col*=0.35+0.65*vg;",
  "gl_FragColor=vec4(col,1.);}"
].join("\n");
if (gl) {
  function mkShader(tp, src) { const o = gl.createShader(tp); gl.shaderSource(o, src); gl.compileShader(o); return o; }
  const prog = gl.createProgram();
  gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}"));
  gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, VEIL_FS));
  gl.linkProgram(prog);
  if (gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const la = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(la);
    gl.vertexAttribPointer(la, 2, gl.FLOAT, false, 0, 0);
    uT = gl.getUniformLocation(prog, "t");
    uRes = gl.getUniformLocation(prog, "r");
    uSx = gl.getUniformLocation(prog, "sx");
    uSa = gl.getUniformLocation(prog, "sa");
    uBm = gl.getUniformLocation(prog, "bm");
    uGd = gl.getUniformLocation(prog, "gd");
    veilOk = true;
  }
}
function veilResize() {
  if (!gl) return;
  veilCv.width = Math.round(W * DPR); veilCv.height = Math.round(H * DPR);
  gl.viewport(0, 0, veilCv.width, veilCv.height);
}
function veilUpdate(tNow, sx, sa, bm, gd) {
  if (!veilOk) return;
  gl.uniform1f(uT, tNow * 0.001);
  gl.uniform2f(uRes, veilCv.width, veilCv.height);
  gl.uniform1f(uSx, sx);
  gl.uniform1f(uSa, sa);
  gl.uniform1f(uBm, bm);
  gl.uniform1f(uGd, gd);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

/* ===== seamfx: magnet lines along the seam ===== */
const sctx = seamCv.getContext("2d");
function seamResize() {
  seamCv.width = Math.round(W * DPR); seamCv.height = Math.round(H * DPR);
}
function seamfxDraw(tNow, seamX, sa) {
  sctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  sctx.clearRect(0, 0, W, H);
  if (sa <= 0.03) return;
  const cxp = seamX * W;
  const half = Math.min(92, W * 0.11);
  const N = 22;
  const mpx = (px + 1) * .5 * W, mpy = (py + 1) * .5 * H;
  for (let i = 0; i < N; i++) {
    const f = i / (N - 1);
    const bx = cxp - half + 2 * half * f;
    sctx.beginPath();
    for (let y = 0; y <= H + 24; y += 24) {
      const d = Math.hypot(bx - mpx, y - mpy);
      const x = bx + (mpx - bx) * Math.exp(-d / 190) * 0.55 * sa
        + Math.sin(y * 0.012 + tNow * 0.0012 + i * 0.7) * 2.4 * sa;
      if (y === 0) sctx.moveTo(x, y); else sctx.lineTo(x, y);
    }
    const a = 0.08 + 0.16 * sa;
    sctx.strokeStyle = f < 0.5
      ? "rgba(229,139,53," + (a + (1 - f) * 0.04 * sa).toFixed(3) + ")"
      : "rgba(60,228,214," + (a + f * 0.04 * sa).toFixed(3) + ")";
    sctx.lineWidth = 1;
    sctx.stroke();
  }
}


etchFine(0);
buildShards();
buildOrbit();
poke();
})();

