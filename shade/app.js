(() => {
"use strict";

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
const wordEl = document.getElementById("word");
const wl = document.getElementById("wl");
const wr = document.getElementById("wr");
const capEl = document.getElementById("caption");
const track = document.getElementById("track");
const slL = document.getElementById("slL");
const slR = document.getElementById("slR");
const hintEl = document.getElementById("hint");
const provEl = document.getElementById("prov");

const CYN = [60, 228, 214];

const CH = [
  { t: "ovt",   w: "SHADE",          l: "A monolith split into two realities.",                   yaw: 0,   pit: 0,   roll: 0,  zoom: 1.12, seam: 0,    shat: 0,    grain: .28, glow: .12, photo: 0,   scan: .08 },
  { t: "slab",  w: "THE SLAB",       l: "One surface. One truth.",                                yaw: -6,  pit: 2,   roll: 1,  zoom: 1.00, seam: 0,    shat: 0,    grain: .30, glow: .15, photo: 0,   scan: .10 },
  { t: "seam",  w: "THE SEAM",       l: "Drag it. Two realities share one stone.",                yaw: -14, pit: -3,  roll: -2, zoom: 0.97, seam: .55,  shat: 0,    grain: .35, glow: .60, photo: 0,   scan: .18 },
  { t: "noise", w: "NOISE",          l: "Grain is a fingerprint the sensor cannot help leaving.", yaw: 10,  pit: 4,   roll: 3,  zoom: 1.06, seam: .12,  shat: 0,    grain: 1,   glow: .30, photo: 0,   scan: .25 },
  { t: "light", w: "LIGHT",          l: "Reflections obey geometry. Fakes forget the angle.",     yaw: -6,  pit: -6,  roll: -1, zoom: 0.88, seam: .70,  shat: 0,    grain: .50, glow: 1,   photo: .05, scan: .35 },
  { t: "tex",   w: "TEXTURE",        l: "Skin repeats when a machine imagines it.",               yaw: 16,  pit: 8,   roll: -6, zoom: 0.95, seam: .85,  shat: .75,  grain: .75, glow: .40, photo: .05, scan: .30 },
  { t: "fine",  w: "THE FINE PRINT", l: "Small text betrays big models.",                         yaw: -8,  pit: -4,  roll: 2,  zoom: 1.25, seam: 1,    shat: 0,    grain: .55, glow: .35, photo: .10, scan: .15 },
  { t: "prov",  w: "PROVENANCE",     l: "Every image remembers where it was made.",               yaw: 10,  pit: 4,   roll: -2, zoom: 0.92, seam: .55,  shat: .30,  grain: .60, glow: .40, photo: .10, scan: .20 },
  { t: "unbr",  w: "UNBROKEN",       l: "Pull back. It was one photograph all along.",            yaw: 0,   pit: 0,   roll: 0,  zoom: 1.32, seam: 0,    shat: 0,    grain: .28, glow: .10, photo: 1,   scan: 0 }
];

let W = 0, H = 0, DPR = 1;
let warmTex = null, cyanTex = null, warmBase = null, cyanBase = null, grainPat = null;
let facets = [];
let dragging = false, dragX0 = 0, dragYaw = 0;
let lastIdx = -1;
let etchStep = -1;

function rand(a, b) { return a + Math.random() * (b - a); }

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

function buildFacets() {
  const w2 = .485, h2 = 1.1, COLS = 6, ROWS = 7;
  const xs = [-w2], ys = [-h2];
  for (let i = 1; i < COLS; i++) xs.push(-w2 + 2 * w2 * i / COLS + rand(-.03, .03));
  xs.push(w2);
  for (let j = 1; j < ROWS; j++) ys.push(-h2 + 2 * h2 * j / ROWS + rand(-.025, .025));
  ys.push(h2);
  for (let i = 0; i < COLS; i++) {
    for (let j = 0; j < ROWS; j++) {
      const pts = [[xs[i], ys[j]], [xs[i + 1], ys[j]], [xs[i + 1], ys[j + 1]], [xs[i], ys[j + 1]]];
      const cx = (xs[i] + xs[i + 1]) / 2, cy = (ys[j] + ys[j + 1]) / 2;
      const side = cx < 0 ? -1 : 1;
      facets.push({
        pts, cx, cy, side,
        rot: rand(-.5, .5), ry: rand(-.8, .8),
        dx: side * rand(.2, .8), dy: rand(-.55, .55), dz: rand(-.2, 1.1)
      });
    }
  }
}

function proj(p, cam) {
  let x = p[0] * cam.cy + p[2] * cam.sy;
  let z = -p[0] * cam.sy + p[2] * cam.cy;
  let y = p[1] * cam.cp - z * cam.sp;
  z = p[1] * cam.sp + z * cam.cp;
  const xr = x * cam.cr - y * cam.sr, yr = x * cam.sr + y * cam.cr;
  const dz = cam.d - z;
  const s = cam.f / Math.max(.35, dz);
  return [W / 2 + xr * s, H / 2 - yr * s, dz];
}

function shade(n, base) {
  const L1 = [-.55, .5, .65], L2 = [.7, .25, .55];
  const d1 = Math.max(0, n[0] * L1[0] + n[1] * L1[1] + n[2] * L1[2]);
  const d2 = Math.max(0, n[0] * L2[0] + n[1] * L2[1] + n[2] * L2[2]);
  const k = .35 + .65 * d1;
  const r = Math.min(255, base[0] * k + CYN[0] * d2 * .28);
  const g = Math.min(255, base[1] * k + CYN[1] * d2 * .28);
  const b = Math.min(255, base[2] * k + CYN[2] * d2 * .28);
  return "rgb(" + (r | 0) + "," + (g | 0) + "," + (b | 0) + ")";
}

function facePath(pp) {
  const P = new Path2D();
  P.moveTo(pp[0][0], pp[0][1]);
  for (let k = 1; k < pp.length; k++) P.lineTo(pp[k][0], pp[k][1]);
  P.closePath();
  return P;
}

function strokeLine(a, b, style) {
  ctx.strokeStyle = style; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
}

function loupe(x, y, r, tex, sx0, sy0, label, col, v) {
  ctx.save();
  ctx.globalAlpha = v;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.save(); ctx.clip();
  ctx.drawImage(tex, sx0, sy0, 46, 46, x - r, y - r, r * 2, r * 2);
  ctx.restore();
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = "rgba(" + col + "," + (0.75 * v) + ")";
  ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, r + 6, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(" + col + "," + (0.3 * v) + ")";
  ctx.stroke();
  ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(" + col + "," + (0.95 * v) + ")";
  ctx.fillText(label, x, y + r + 24);
  ctx.restore();
}

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth; H = window.innerHeight;
  canvas.width = W * DPR; canvas.height = H * DPR;
  canvas.style.width = W + "px"; canvas.style.height = H + "px";
}

function render() {
  const max = Math.max(1, track.offsetHeight - H);
  const P = Math.min(1, Math.max(0, window.scrollY / max));
  const cf = P * (CH.length - 1);
  const i = Math.min(CH.length - 2, Math.floor(cf));
  let fr = cf - i; fr = fr * fr * (3 - 2 * fr);
  const a = CH[i], b = CH[i + 1];
  const L = k => a[k] + (b[k] - a[k]) * fr;

  const idx = Math.round(cf);
  if (idx !== lastIdx) {
    lastIdx = idx;
    const c = CH[idx];
    wl.textContent = c.w; wr.textContent = c.w;
    capEl.textContent = c.l;
    slL.classList.toggle("on", c.t === "seam");
    slR.classList.toggle("on", c.t === "seam");
    hintEl.classList.toggle("on", c.t === "light");
    provEl.classList.toggle("on", c.t === "prov");
  }

  const yaw = (L("yaw") + dragYaw) * Math.PI / 180;
  const pit = L("pit") * Math.PI / 180;
  const roll = L("roll") * Math.PI / 180;
  const cam = {
    sy: Math.sin(yaw), cy: Math.cos(yaw),
    sp: Math.sin(pit), cp: Math.cos(pit),
    sr: Math.sin(roll), cr: Math.cos(roll),
    d: 3.2 / L("zoom"),
    f: (W < 640 ? .74 : .87) * H
  };
  const seam = L("seam"), shat = L("shat"), grain = L("grain");
  const glow = L("glow"), tint = L("photo"), scan = L("scan");
  const w2 = .485, h2 = 1.1, t2 = .09, g2 = seam * .045;

  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.globalAlpha = 1;
  ctx.clearRect(0, 0, W, H);

  const sb = proj([0, -h2 - .18, 0], cam);
  const sw = w2 * 1.5 * (cam.f / cam.d);
  ctx.save();
  ctx.translate(sb[0], sb[1]); ctx.scale(1, .16); ctx.translate(-sb[0], -sb[1]);
  const shG = ctx.createRadialGradient(sb[0], sb[1], 0, sb[0], sb[1], sw);
  shG.addColorStop(0, "rgba(0,0,0,0.55)"); shG.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = shG;
  ctx.beginPath(); ctx.arc(sb[0], sb[1], sw, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  const FL = [[-w2 - g2, h2, t2], [-g2, h2, t2], [-g2, -h2, t2], [-w2 - g2, -h2, t2]];
  const FR = [[g2, h2, t2], [w2, h2, t2], [w2, -h2, t2], [g2, -h2, t2]];
  const BK = [[-w2 - g2, h2, -t2], [w2, h2, -t2], [w2, -h2, -t2], [-w2 - g2, -h2, -t2]];
  const RS = [[w2, h2, t2], [w2, h2, -t2], [w2, -h2, -t2], [w2, -h2, t2]];
  const LS = [[-w2 - g2, h2, t2], [-w2 - g2, h2, -t2], [-w2 - g2, -h2, -t2], [-w2 - g2, -h2, t2]];
  const TP = [[-w2 - g2, h2, t2], [w2, h2, t2], [w2, h2, -t2], [-w2 - g2, h2, -t2]];
  const BT = [[-w2 - g2, -h2, t2], [w2, -h2, t2], [w2, -h2, -t2], [-w2 - g2, -h2, -t2]];

  const faces = [];
  const addP = (pp, kind, data) => {
    let dz = 0;
    for (const q of pp) dz += q[2];
    faces.push({ pp, dz: dz / pp.length, kind, data });
  };
  const addW = (pts3, kind, data) => addP(pts3.map(q => proj(q, cam)), kind, data);

  if (shat < .02) {
    addW(FL, "texL"); addW(FR, "texR");
  } else {
    for (const f of facets) {
      const cR = Math.cos(f.rot * shat), sR = Math.sin(f.rot * shat);
      const cY = Math.cos(f.ry * shat), sY = Math.sin(f.ry * shat);
      const ox = f.cx + f.dx * shat * .55, oy = f.cy + f.dy * shat * .55, oz = f.dz * shat * .5;
      const pp = f.pts.map(pt => {
        let x = pt[0] - f.cx, y = pt[1] - f.cy;
        const xr = x * cR - y * sR, yr = x * sR + y * cR;
        const z2 = xr * sY;
        const wx = ox + xr * cY, wy = oy + yr, wz = oz + z2;
        return proj([wx, wy, wz], cam);
      });
      addP(pp, "fac", f);
    }
  }
  addW(BK, "solid", { n: [0, 0, -1], base: [10, 12, 14] });
  addW(RS, "solid", { n: [1, 0, 0], base: [26, 15, 7] });
  addW(LS, "solid", { n: [-1, 0, 0], base: [8, 11, 13] });
  addW(TP, "solid", { n: [0, 1, 0], base: [30, 20, 10] });
  addW(BT, "solid", { n: [0, -1, 0], base: [8, 9, 10] });
  faces.sort((u, v) => v.dz - u.dz);

  const clip = new Path2D();
  for (const f of faces) {
    const path = facePath(f.pp);
    if (f.kind === "texL" || f.kind === "texR") {
      const tex = f.kind === "texL" ? warmTex : cyanTex;
      const P0 = f.pp[0], P1 = f.pp[1], P2 = f.pp[3];
      const m11 = (P1[0] - P0[0]) / 256, m12 = (P1[1] - P0[1]) / 256;
      const m21 = (P2[0] - P0[0]) / 512, m22 = (P2[1] - P0[1]) / 512;
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.transform(m11, m12, m21, m22, P0[0], P0[1]);
      ctx.drawImage(tex, 0, 0);
      ctx.restore();
      clip.addPath(path);
    } else if (f.kind === "fac") {
      const fd = f.data;
      const n = [Math.sin(fd.ry * shat), 0, Math.cos(fd.ry * shat)];
      ctx.fillStyle = shade(n, fd.side < 0 ? [96, 58, 24] : [24, 74, 80]);
      ctx.fill(path);
      ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.lineWidth = 1;
      ctx.stroke(path);
      clip.addPath(path);
    } else {
      ctx.fillStyle = shade(f.data.n, f.data.base);
      ctx.fill(path);
    }
  }

  if (g2 > 0.001) {
    const sT = proj([0, h2, t2], cam), sB = proj([0, -h2, t2], cam);
    const aa = Math.min(1, glow) * .9;
    const lg = ctx.createLinearGradient(sT[0], sT[1], sB[0], sB[1]);
    lg.addColorStop(0, "rgba(229,139,53," + (aa * .7) + ")");
    lg.addColorStop(.5, "rgba(255,214,160," + aa + ")");
    lg.addColorStop(1, "rgba(60,228,214," + (aa * .6) + ")");
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = lg;
    ctx.lineWidth = Math.max(1.5, g2 * cam.f / cam.d * 2.2);
    ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(sT[0], sT[1]); ctx.lineTo(sB[0], sB[1]); ctx.stroke();
    ctx.restore();
    if (shat < .02) {
      strokeLine(proj([-g2, h2, t2], cam), proj([-g2, -h2, t2], cam), "rgba(229,139,53," + (.25 + .45 * glow) + ")");
      strokeLine(proj([g2, h2, t2], cam), proj([g2, -h2, t2], cam), "rgba(60,228,214," + (.25 + .45 * glow) + ")");
    }
  }

  if (scan > 0.01) {
    ctx.save();
    ctx.clip(clip);
    ctx.globalCompositeOperation = "lighter";
    const bx = (P * 1.6 - .3) * W;
    const bg = ctx.createLinearGradient(bx - 180, 0, bx + 180, 0);
    bg.addColorStop(0, "rgba(255,255,255,0)");
    bg.addColorStop(.5, "rgba(255,244,220," + (.10 * scan) + ")");
    bg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  if (grain > 0.01) {
    ctx.save();
    ctx.clip(clip);
    ctx.globalAlpha = grain * .5;
    ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = grainPat; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  if (tint > 0.01) {
    ctx.save();
    ctx.clip(clip);
    ctx.globalAlpha = tint * .65;
    ctx.globalCompositeOperation = "soft-light";
    ctx.fillStyle = "rgb(214,146,74)"; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = tint * .25;
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = "rgb(120,84,40)"; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  const nearN = 1 - Math.min(1, Math.abs(cf - 3));
  if (nearN > 0.02) {
    const sy0 = 128 + Math.round((cf % 1) * 180);
    const r = Math.min(W, H) * 0.135;
    const y = H * 0.44;
    loupe(W * 0.30, y, r, warmTex, 64, sy0, "RENDER", "229,139,53", nearN);
    loupe(W * 0.70, y, r, cyanTex, 92, sy0, "PHOTOGRAPH", "60,228,214", nearN);
  }

  const nearF = 1 - Math.min(1, Math.abs(cf - 6));
  const st = Math.round(nearF * 6);
  if (st !== etchStep) { etchStep = st; etchFine(st); }

  const sxA = proj([-g2, 0, t2], cam)[0], sxB = proj([g2, 0, t2], cam)[0];
  const sx = (sxA + sxB) / 2;
  const gapPx = Math.abs(sxB - sxA);
  const drift = Math.min(64, gapPx * .55);
  const wy = (0.5 - cf / (CH.length - 1)) * 44;
  const wr_ = wordEl.getBoundingClientRect();
  const lx = sx - wr_.left;
  wl.style.clipPath = "polygon(0 0," + lx + "px 0," + lx + "px 100%,0 100%)";
  wr.style.clipPath = "polygon(" + lx + "px 0,100% 0,100% 100%," + lx + "px 100%)";
  wl.style.transform = "translateY(" + wy + "px) translateX(" + (-drift) + "px)";
  wr.style.transform = "translateY(" + wy + "px) translateX(" + drift + "px)";
}

canvas.addEventListener("pointerdown", e => {
  dragging = true; dragX0 = e.clientX;
  document.body.classList.add("drag");
  try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
});
window.addEventListener("pointermove", e => {
  if (!dragging) return;
  dragYaw = Math.max(-32, Math.min(32, (e.clientX - dragX0) * .12));
  render();
});
window.addEventListener("pointerup", () => { dragging = false; document.body.classList.remove("drag"); });
window.addEventListener("pointercancel", () => { dragging = false; document.body.classList.remove("drag"); });
window.addEventListener("scroll", render, { passive: true });
window.addEventListener("resize", () => { resize(); render(); });

resize();
buildTextures();
etchFine(0);
buildFacets();
render();
})();
