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
  { w: "THE SLAB",      l: "One surface. One truth.",                          split: .50, shatter: 0,   grain: .10, scan: .04, tilt: 0,    zoom: 1.00, seamA: .35, photo: 0,   caustic: 0 },
  { w: "THE SEAM",      l: "Drag it. Two realities share one stone.",          split: .50, shatter: 0,   grain: .18, scan: .14, tilt: .02,  zoom: 1.02, seamA: .90, photo: 0,   caustic: 0 },
  { w: "NOISE",         l: "Grain is a fingerprint the sensor cannot help leaving.", split: .50, shatter: 0, grain: .55, scan: .08, tilt: -.03, zoom: 1.05, seamA: .50, photo: 0,   caustic: 0 },
  { w: "LIGHT",         l: "Reflections obey geometry. Fakes forget the angle.", split: .62, shatter: 0,  grain: .16, scan: .12, tilt: .05,  zoom: 1.08, seamA: .50, photo: 0,   caustic: 1 },
  { w: "TEXTURE",       l: "Skin repeats when a machine imagines it.",         split: .50, shatter: .50, grain: .30, scan: .22, tilt: 0,    zoom: 1.05, seamA: .40, photo: 0,   caustic: 0 },
  { w: "THE FINE PRINT",l: "Small text betrays big models.",                   split: .50, shatter: .85, grain: .32, scan: .26, tilt: -.04, zoom: 1.10, seamA: .35, photo: 0,   caustic: 0 },
  { w: "PROVENANCE",    l: "Every image remembers where it was made.",         split: .35, shatter: .40, grain: .24, scan: .18, tilt: .03,  zoom: 1.02, seamA: .45, photo: .25, caustic: 0 },
  { w: "UNBROKEN",      l: "Pull back. It was one photograph all along.",      split: .50, shatter: 0,   grain: .12, scan: 0,   tilt: 0,    zoom: .88,  seamA: 0,   photo: 1,   caustic: 0 }
];

let W = 0, H = 0, DPR = 1;
let warmTile = null, cyanTile = null;
let warmPat = null, cyanPat = null;

let facets = [];
let slabW = 0, slabH = 0;

let scrollP = 0, smoothP = 0;
let seam = .5, seamTarget = .5, userDragged = false;
let dragging = false;

function rand(a, b) { return a + Math.random() * (b - a); }

function buildNoise() {
  warmTile = document.createElement("canvas");
  warmTile.width = warmTile.height = 128;
  const wc = warmTile.getContext("2d");
  const wi = wc.createImageData(128, 128);
  for (let i = 0; i < wi.data.length; i += 4) {
    const v = Math.random() * 255;
    wi.data[i] = 229; wi.data[i + 1] = 139; wi.data[i + 2] = 53;
    wi.data[i + 3] = v * 0.55;
  }
  wc.putImageData(wi, 0, 0);

  cyanTile = document.createElement("canvas");
  cyanTile.width = cyanTile.height = 128;
  const cc = cyanTile.getContext("2d");
  const ci = cc.createImageData(128, 128);
  for (let i = 0; i < ci.data.length; i += 4) {
    const v = Math.random() < 0.12 ? 255 : 0;
    ci.data[i] = 60; ci.data[i + 1] = 228; ci.data[i + 2] = 214;
    ci.data[i + 3] = v * 0.7;
  }
  cc.putImageData(ci, 0, 0);

  warmPat = ctx.createPattern(warmTile, "repeat");
  cyanPat = ctx.createPattern(cyanTile, "repeat");
}

function buildSites(n) {
  const cols = 6, rows = 6, sites = [];
  const cellW = 1 / cols, cellH = 1 / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      sites.push({ x: (c + 0.15 + Math.random() * 0.7) * cellW, y: (r + 0.15 + Math.random() * 0.7) * cellH });
    }
  }
  while (sites.length > n) sites.splice(Math.floor(Math.random() * sites.length), 1);
  return sites;
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
  const sites = buildSites(32).map(s => ({ x: s.x * slabW, y: s.y * slabH }));
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
      rot: rand(-0.35, 0.35),
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
  const oldW = slabW, oldH = slabH;
  slabH = H * 0.60; slabW = Math.min(slabH * 0.44, W * 0.72);
  slabH = Math.min(slabH, slabW / 0.44);
  if (Math.abs(oldW - slabW) > 2 || Math.abs(oldH - slabH) > 2 || !facets.length) buildFacets();
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
    idx: i, frac: f - i,
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

function draw() {
  const s = state();
  const cx = W / 2, cy = H * 0.47;
  const sw = slabW * s.zoom, sh = slabH * s.zoom;

  ctx.clearRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(cx - sw * 0.25, cy, 10, cx - sw * 0.25, cy, Math.max(W, H) * 0.7);
  glow.addColorStop(0, "rgba(" + AMBER + ",0.07)");
  glow.addColorStop(1, "rgba(" + AMBER + ",0)");
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
  const glow2 = ctx.createRadialGradient(cx + sw * 0.25, cy, 10, cx + sw * 0.25, cy, Math.max(W, H) * 0.7);
  glow2.addColorStop(0, "rgba(" + CYAN + ",0.06)");
  glow2.addColorStop(1, "rgba(" + CYAN + ",0)");
  ctx.fillStyle = glow2; ctx.fillRect(0, 0, W, H);

  const photoAll = s.photo > 0.5;
  const seamX = seam * sw;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(s.tilt * 0.6);
  ctx.translate(-sw / 2, -sh / 2);

  for (const f of facets) {
    const side = photoAll || f.cx < seamX ? "warm" : "cyan";
    const amt = s.shatter;
    const dx = f.dirx * 0.22 * amt * f.power * sw + (side === "cyan" ? f.jx * 8 * amt : 0);
    const dy = f.diry * 0.22 * amt * f.power * sh + (side === "cyan" ? f.jy * 8 * amt : 0);
    const rot = side === "warm" ? f.rot * amt : 0;

    ctx.save();
    ctx.translate(f.cx + dx, f.cy + dy);
    if (rot) ctx.rotate(rot);
    ctx.translate(-f.cx, -f.cy);

    facetPath(f.poly);
    ctx.save();
    ctx.clip();
    ctx.fillStyle = side === "warm" ? "#181310" : "#0B1417";
    ctx.fillRect(0, 0, sw, sh);

    if (side === "warm") {
      ctx.globalAlpha = s.grain;
      ctx.fillStyle = warmPat;
      ctx.fillRect(0, 0, sw, sh);
      ctx.globalAlpha = 1;
      if (s.caustic) {
        ctx.strokeStyle = "rgba(" + AMBER + ",0.10)";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(0, sh * 0.25);
        ctx.quadraticCurveTo(sw * 0.5, sh * 0.18, sw, sh * 0.34);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, sh * 0.72);
        ctx.quadraticCurveTo(sw * 0.55, sh * 0.60, sw, sh * 0.78);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(232,225,214,0.05)";
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, sw - 1, sh - 1);
    } else {
      ctx.globalAlpha = Math.max(s.scan, 0.10);
      ctx.fillStyle = cyanPat;
      ctx.fillRect(0, 0, sw, sh);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "rgba(" + CYAN + ",0.16)";
      ctx.lineWidth = 1;
      for (let y = 6; y < sh; y += 26) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(sw, y + (f.jy > 0 ? 1.5 : -1.5));
        ctx.stroke();
      }
    }
    ctx.restore();

    if (side === "cyan") {
      facetPath(f.poly);
      ctx.strokeStyle = "rgba(" + CYAN + ",0.28)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();
  }

  if (s.seamA > 0.01 && s.photo < 0.95) {
    ctx.globalAlpha = s.seamA * (1 - s.photo);
    const g = ctx.createLinearGradient(seamX, 0, seamX, sh);
    g.addColorStop(0, "rgba(" + AMBER + ",0.9)");
    g.addColorStop(1, "rgba(" + CYAN + ",0.9)");
    ctx.fillStyle = g;
    ctx.fillRect(seamX - 1, 0, 2, sh);
    ctx.globalAlpha = 1;
  }

  if (s.photo > 0.01) {
    const pg = ctx.createLinearGradient(0, 0, 0, sh);
    pg.addColorStop(0, "rgba(229,139,53,0)");
    pg.addColorStop(0.5, "rgba(229,139,53," + (0.16 * s.photo).toFixed(3) + ")");
    pg.addColorStop(1, "rgba(229,139,53,0)");
    ctx.fillStyle = pg;
    ctx.fillRect(0, 0, sw, sh);
  }

  ctx.restore();
}

let curText = -1;
function setTexts(i) {
  if (i === curText || i < 0 || i > CH.length - 1) return;
  curText = i;
  wordEl.textContent = CH[i].w;
  capEl.textContent = CH[i].l;
}

let needsDraw = true, raf = 0;
function loop() {
  raf = requestAnimationFrame(loop);
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
  if (!userDragged) { const s = state(); seamTarget = s.split; }
  needsDraw = true;
}

function pointToSeam(e) {
  const rect = canvas.getBoundingClientRect();
  const cx = rect.width / 2;
  const sw = slabW * state().zoom;
  const local = e.clientX - (cx - sw / 2);
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
