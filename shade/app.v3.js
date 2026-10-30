(() => {
"use strict";

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
const wordEl = document.getElementById("word");
const capEl = document.getElementById("caption");
const track = document.getElementById("track");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

const AMBER = "229,139,53";
const CYAN = "60,228,214";

const CH = [
  { w: "THE SLAB",       l: "One surface. One truth.",                                split: .50, shatter: 0,   grain: .22, scan: 0,   tilt: 0,    zoom: 1.00, seamA: .35, photo: 0,   caustic: 0 },
  { w: "THE SEAM",       l: "Drag it. Two realities share one stone.",                split: .50, shatter: 0,   grain: .30, scan: .18, tilt: .02,  zoom: 1.02, seamA: 1,   photo: 0,   caustic: 0 },
  { w: "NOISE",          l: "Grain is a fingerprint the sensor cannot help leaving.", split: .50, shatter: 0,   grain: .70, scan: .10, tilt: -.03, zoom: 1.05, seamA: .60, photo: 0,   caustic: 0 },
  { w: "LIGHT",          l: "Reflections obey geometry. Fakes forget the angle.",     split: .62, shatter: 0,   grain: .26, scan: .14, tilt: .05,  zoom: 1.08, seamA: .60, photo: 0,   caustic: 1 },
  { w: "TEXTURE",        l: "Skin repeats when a machine imagines it.",               split: .50, shatter: .55, grain: .40, scan: .30, tilt: 0,    zoom: 1.05, seamA: .30, photo: 0,   caustic: 0 },
  { w: "THE FINE PRINT", l: "Small text betrays big models.",                         split: .50, shatter: .90, grain: .42, scan: .34, tilt: -.04, zoom: 1.10, seamA: 0,   photo: 0,   caustic: 0 },
  { w: "PROVENANCE",     l: "Every image remembers where it was made.",               split: .35, shatter: .45, grain: .34, scan: .24, tilt: .03,  zoom: 1.02, seamA: .40, photo: .25, caustic: 0 },
  { w: "UNBROKEN",       l: "Pull back. It was one photograph all along.",            split: .50, shatter: 0,   grain: .16, scan: 0,   tilt: 0,    zoom: .88,  seamA: 0,   photo: 1,   caustic: 0 }
];

let W = 0, H = 0, DPR = 1;
let warmPat = null, cyanPat = null;
let facets = [];
let slabW = 0, slabH = 0;

let scrollP = 0, smoothP = 0;
let seam = .5, seamTarget = .5, userDragged = false;
let dragging = false;

function rand(a, b) { return a + Math.random() * (b - a); }

function buildNoise() {
  const warmTile = document.createElement("canvas");
  warmTile.width = warmTile.height = 128;
  const wc = warmTile.getContext("2d");
  const wi = wc.createImageData(128, 128);
  for (let i = 0; i < wi.data.length; i += 4) {
    wi.data[i] = 229; wi.data[i + 1] = 139; wi.data[i + 2] = 53;
    wi.data[i + 3] = Math.random() * 255 * 0.6;
  }
  wc.putImageData(wi, 0, 0);

  const cyanTile = document.createElement("canvas");
  cyanTile.width = cyanTile.height = 128;
  const cc = cyanTile.getContext("2d");
  const ci = cc.createImageData(128, 128);
  for (let i = 0; i < ci.data.length; i += 4) {
    const on = Math.random() < 0.10 ? 255 : 0;
    ci.data[i] = 60; ci.data[i + 1] = 228; ci.data[i + 2] = 214;
    ci.data[i + 3] = on * 0.75;
  }
  cc.putImageData(ci, 0, 0);

  warmPat = ctx.createPattern(warmTile, "repeat");
  cyanPat = ctx.createPattern(cyanTile, "repeat");
}

function clipHalf(poly, ax, ay, nx, ny) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length];
    const dp = (p[0] - ax) * nx + (p[1] - ay) * ny;
    const dq = (q[0] - ax) * nx + (q[1] - ay) * ny;
    if (dp <= 0) out.push(p);
    if ((dp < 0 && dq > 0) || (dp > 0 && dq < 0)) {
      const t = dp / (dp - dq);
      out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
    }
  }
  return out;
}

function buildFacets() {
  const cols = 6, rows = 6, sites = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      sites.push({ x: (c + 0.15 + Math.random() * 0.7) / cols * slabW, y: (r + 0.15 + Math.random() * 0.7) / rows * slabH });
    }
  }
  while (sites.length > 32) sites.splice(Math.floor(Math.random() * sites.length), 1);
  const rect = [[0, 0], [slabW, 0], [slabW, slabH], [0, slabH]];
  facets = sites.map(s => {
    let poly = rect;
    for (const o of sites) {
      if (o === s) continue;
      poly = clipHalf(poly, (s.x + o.x) / 2, (s.y + o.y) / 2, o.x - s.x, o.y - s.y);
      if (!poly.length) break;
    }
    let cx = 0, cy = 0;
    for (const p of poly) { cx += p[0]; cy += p[1]; }
    cx /= poly.length || 1; cy /= poly.length || 1;
    const d = Math.hypot(cx - slabW / 2, cy - slabH / 2) / (slabW * 0.7);
    return {
      poly, cx, cy,
      dirx: (cx - slabW / 2) / (slabW / 2 || 1),
      diry: (cy - slabH / 2) / (slabH / 2 || 1),
      rot: rand(-0.4, 0.4),
      jx: rand(-1, 1), jy: rand(-1, 1),
      power: 0.35 + d * 0.9
    };
  });
}

function resize() {
  DPR = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  canvas.width = Math.round(W * DPR);
  canvas.height = Math.round(H * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  slabH = H * 0.60;
  slabW = Math.min(slabH * 0.44, W * 0.72);
  slabH = Math.min(slabH, slabW / 0.44);
  buildFacets();
  buildNoise();
  needsDraw = true;
}

function state() {
  const f = smoothP * (CH.length - 1);
  const i = Math.min(CH.length - 2, Math.floor(f));
  const t = f - i;
  const a = CH[i], b = CH[i + 1];
  const L = (x, y) => x + (y - x) * t;
  return {
    split: L(a.split, b.split), shatter: L(a.shatter, b.shatter),
    grain: L(a.grain, b.grain), scan: L(a.scan, b.scan),
    tilt: L(a.tilt, b.tilt), zoom: L(a.zoom, b.zoom),
    seamA: L(a.seamA, b.seamA), photo: L(a.photo, b.photo),
    caustic: t < .5 ? a.caustic : b.caustic
  };
}

function facetPath(poly) {
  ctx.beginPath();
  ctx.moveTo(poly[0][0], poly[0][1]);
  for (let k = 1; k < poly.length; k++) ctx.lineTo(poly[k][0], poly[k][1]);
  ctx.closePath();
}

function fillWarm(x0, y0, x1, y1, grain, caustic) {
  const g = ctx.createLinearGradient(x0, 0, x1, 0);
  g.addColorStop(0, "#120E0B");
  g.addColorStop(0.55, "#1A1410");
  g.addColorStop(1, "#2A1D12");
  ctx.fillStyle = g;
  ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  if (grain > 0.01) {
    ctx.globalAlpha = grain;
    ctx.fillStyle = warmPat;
    ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    ctx.globalAlpha = 1;
  }
  if (caustic) {
    ctx.strokeStyle = "rgba(" + AMBER + ",0.13)";
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(x0, y0 + (y1 - y0) * 0.25);
    ctx.quadraticCurveTo((x0 + x1) / 2, y0 + (y1 - y0) * 0.16, x1, y0 + (y1 - y0) * 0.34);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x0, y0 + (y1 - y0) * 0.74);
    ctx.quadraticCurveTo((x0 + x1) * 0.55, y0 + (y1 - y0) * 0.62, x1, y0 + (y1 - y0) * 0.80);
    ctx.stroke();
  }
}

function fillCyan(x0, y0, x1, y1, scan) {
  const g = ctx.createLinearGradient(x1, 0, x0, 0);
  g.addColorStop(0, "#081114");
  g.addColorStop(0.55, "#0B181C");
  g.addColorStop(1, "#102428");
  ctx.fillStyle = g;
  ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  if (scan > 0.01) {
    ctx.globalAlpha = scan;
    ctx.fillStyle = cyanPat;
    ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(" + CYAN + ",0.10)";
    ctx.lineWidth = 1;
    for (let y = 6; y < y1; y += 26) {
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x1, y);
      ctx.stroke();
    }
  }
}

function draw() {
  const s = state();
  const cx = W / 2, cy = H * 0.47;
  const sw = slabW * s.zoom, sh = slabH * s.zoom;
  const depth = Math.max(10, sw * 0.07);

  ctx.clearRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(cx - sw * 0.3, cy, 10, cx - sw * 0.3, cy, Math.max(W, H) * 0.75);
  glow.addColorStop(0, "rgba(" + AMBER + ",0.10)");
  glow.addColorStop(1, "rgba(" + AMBER + ",0)");
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
  const glow2 = ctx.createRadialGradient(cx + sw * 0.3, cy, 10, cx + sw * 0.3, cy, Math.max(W, H) * 0.75);
  glow2.addColorStop(0, "rgba(" + CYAN + ",0.09)");
  glow2.addColorStop(1, "rgba(" + CYAN + ",0)");
  ctx.fillStyle = glow2; ctx.fillRect(0, 0, W, H);

  const vig = ctx.createRadialGradient(cx, cy, Math.min(W, H) * 0.25, cx, cy, Math.max(W, H) * 0.85);
  vig.addColorStop(0, "rgba(8,9,11,0)");
  vig.addColorStop(1, "rgba(3,4,5,0.55)");
  ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);

  const shadow = ctx.createRadialGradient(cx, cy + sh * 0.56, 4, cx, cy + sh * 0.56, sw * 0.9);
  shadow.addColorStop(0, "rgba(0,0,0,0.5)");
  shadow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.save();
  ctx.translate(0, sh * 0.06);
  ctx.scale(1, 0.16);
  ctx.fillStyle = shadow;
  ctx.fillRect(cx - sw, -sw * 0.9, sw * 2, sw * 2);
  ctx.restore();

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(s.tilt * 0.6);
  ctx.translate(-sw / 2, -sh / 2);

  const seamX = seam * sw;
  const photoAll = s.photo > 0.5;
  const shattered = s.shatter > 0.02;

  if (!shattered) {
    fillWarm(0, 0, seamX, sh, s.grain, s.caustic);
    fillCyan(seamX, 0, sw, sh, s.scan);

    const rimL = ctx.createLinearGradient(seamX - sw * 0.22, 0, seamX, 0);
    rimL.addColorStop(0, "rgba(" + AMBER + ",0)");
    rimL.addColorStop(1, "rgba(" + AMBER + ",0.16)");
    ctx.fillStyle = rimL; ctx.fillRect(seamX - sw * 0.22, 0, sw * 0.22, sh);
    const rimR = ctx.createLinearGradient(seamX + sw * 0.22, 0, seamX, 0);
    rimR.addColorStop(0, "rgba(" + CYAN + ",0)");
    rimR.addColorStop(1, "rgba(" + CYAN + ",0.13)");
    ctx.fillStyle = rimR; ctx.fillRect(seamX, 0, sw * 0.22, sh);

    ctx.strokeStyle = "rgba(0,0,0,0.55)";
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, sw - 1, sh - 1);
  } else {
    for (const f of facets) {
      const side = photoAll || f.cx < seamX ? "warm" : "cyan";
      const amt = s.shatter;
      const dx = f.dirx * 0.24 * amt * f.power * sw + (side === "cyan" ? f.jx * 5 * amt : 0);
      const dy = f.diry * 0.24 * amt * f.power * sh + (side === "cyan" ? f.jy * 5 * amt : 0);
      const rot = side === "warm" ? f.rot * amt : 0;

      ctx.save();
      ctx.translate(f.cx + dx, f.cy + dy);
      if (rot) ctx.rotate(rot);
      ctx.translate(-f.cx, -f.cy);

      facetPath(f.poly);
      ctx.save();
      ctx.clip();
      if (side === "warm") fillWarm(0, 0, sw, sh, s.grain * 0.8, s.caustic);
      else fillCyan(0, 0, sw, sh, s.scan);
      ctx.restore();

      if (side === "cyan") {
        facetPath(f.poly);
        ctx.strokeStyle = "rgba(" + CYAN + "," + (0.10 + 0.22 * amt).toFixed(3) + ")";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  if (s.photo > 0.01) {
    const pg = ctx.createLinearGradient(0, 0, 0, sh);
    pg.addColorStop(0, "rgba(229,139,53,0)");
    pg.addColorStop(0.5, "rgba(229,139,53," + (0.18 * s.photo).toFixed(3) + ")");
    pg.addColorStop(1, "rgba(229,139,53,0)");
    ctx.fillStyle = pg;
    ctx.fillRect(0, 0, sw, sh);
    if (s.photo > 0.5) {
      ctx.globalAlpha = (s.photo - 0.5) * 0.5;
      ctx.fillStyle = warmPat;
      ctx.fillRect(0, 0, sw, sh);
      ctx.globalAlpha = 1;
    }
  }

  const seamGlow = s.seamA * (1 - s.photo) * (shattered ? 0.35 : 1);
  if (seamGlow > 0.01) {
    const band = ctx.createLinearGradient(seamX - 5, 0, seamX + 5, 0);
    band.addColorStop(0, "rgba(" + AMBER + ",0)");
    band.addColorStop(0.5, "rgba(" + AMBER + "," + (0.5 * seamGlow).toFixed(3) + ")");
    band.addColorStop(0.52, "rgba(" + CYAN + "," + (0.5 * seamGlow).toFixed(3) + ")");
    band.addColorStop(1, "rgba(" + CYAN + ",0)");
    ctx.fillStyle = band;
    ctx.fillRect(seamX - 5, 0, 10, sh);
    ctx.fillStyle = "rgba(240,238,232," + (0.75 * seamGlow).toFixed(3) + ")";
    ctx.fillRect(seamX - 0.5, 0, 1, sh);
  }

  ctx.fillStyle = "rgba(10,12,15,0.9)";
  ctx.beginPath();
  ctx.moveTo(sw, 0);
  ctx.lineTo(sw + depth, depth * 0.5);
  ctx.lineTo(sw + depth, sh + depth * 0.4);
  ctx.lineTo(sw, sh);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(24,20,16,0.9)";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(depth, -depth * 0.45);
  ctx.lineTo(sw + depth, -depth * 0.45);
  ctx.lineTo(sw, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(229,139,53,0.18)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(depth, -depth * 0.45);
  ctx.lineTo(sw + depth, -depth * 0.45);
  ctx.lineTo(sw + depth, sh + depth * 0.4);
  ctx.stroke();

  ctx.restore();
}

let curText = -1;
function setTexts(i) {
  if (i === curText || i < 0 || i > CH.length - 1) return;
  curText = i;
  wordEl.textContent = CH[i].w;
  capEl.textContent = CH[i].l;
}

let needsDraw = true;
function loop() {
  requestAnimationFrame(loop);
  const p = scrollP;
  if (!reduced) {
    smoothP += (p - smoothP) * 0.14;
    seam += (seamTarget - seam) * 0.18;
    if (Math.abs(p - smoothP) < 0.0004 && Math.abs(seamTarget - seam) < 0.0008) {
      smoothP = p; seam = seamTarget;
      if (!needsDraw) return;
    }
  } else {
    smoothP = p; seam = seamTarget;
    if (!needsDraw) return;
  }
  needsDraw = false;
  draw();

  const f = smoothP * (CH.length - 1);
  const i = Math.min(CH.length - 2, Math.floor(f));
  const fr = f - i;
  const vis = fr < 0.5 ? 1 - fr * 2 : (fr - 0.5) * 2;
  wordEl.style.opacity = (0.15 + 0.85 * Math.max(0, vis)).toFixed(3);
  capEl.style.opacity = (0.2 + 0.8 * Math.max(0, vis)).toFixed(3);
  setTexts(fr >= 0.5 ? i + 1 : i);
}

function onScroll() {
  const max = track.offsetHeight - innerHeight;
  scrollP = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
  if (!userDragged) { seamTarget = state().split; }
  needsDraw = true;
}

function pointToSeam(e) {
  const rect = canvas.getBoundingClientRect();
  const sw = slabW * state().zoom;
  const local = e.clientX - (rect.width / 2 - sw / 2);
  seamTarget = Math.min(1, Math.max(0, local / sw));
  userDragged = true;
  needsDraw = true;
}

canvas.addEventListener("pointerdown", e => { dragging = true; pointToSeam(e); });
addEventListener("pointermove", e => { if (dragging) pointToSeam(e); });
addEventListener("pointerup", () => { dragging = false; });
addEventListener("pointercancel", () => { dragging = false; });

addEventListener("scroll", onScroll, { passive: true });
addEventListener("resize", resize);

resize();
onScroll();
loop();
})();
