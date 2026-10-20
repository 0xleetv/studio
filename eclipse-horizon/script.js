(() => {
  "use strict";

  const canvas = document.getElementById("sky");
  const ctx = canvas.getContext("2d");
  const film = document.getElementById("film");

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const RM = () => reduced.matches;

  /* ---------- master timeline (p 0..1 across the film) ---------- */
  const smooth = (a, b, x) => {
    if (b <= a) return x >= b ? 1 : 0;
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };

  let W = 0, H = 0, DPR = 1;
  const CX = () => W / 2;
  const CY = () => H * 0.5;

  /* stars, fixed seed */
  const stars = [];
  (function seed(s) { return s; })(42);
  let rngState = 42;
  const rnd = () => {
    rngState = (rngState * 1103515245 + 12345) & 0x7fffffff;
    return rngState / 0x7fffffff;
  };
  for (let i = 0; i < 150; i++) {
    stars.push({ x: rnd(), y: rnd(), r: 0.5 + rnd() * 1.1, a: 0.15 + rnd() * 0.6, sp: 0.4 + rnd() * 1.4, ph: rnd() * 6.28 });
  }

  /* widget state */
  const state = { ms: 1.047, t2: 0.5 };

  /* text bands: [id, start, end, fadeIn, fadeOut] */
  const bandDefs = [
    ["b-hero", 0.0],
    ["b-geom", 0.13],
    ["b-tot", 0.36],
    ["b-flash", 0.50],
    ["b-shadow", 0.67],
    ["b-dur", 0.735],
    ["b-cor", 0.845],
    ["b-fut", 0.923]
  ];
  const bands = bandDefs.map(([id, a]) => {
    const el = document.getElementById(id);
    el.style.top = `calc(${a * 100}%)`;
    return { el, a };
  });

  /* bands scroll through the viewport; opacity polishes the edges.
     100vh crossing = 0.0952 of the film span (film is 1150vh). */
  const CROSS = 100 / 1300;
  function layoutBands(p) {
    for (const bd of bands) {
      const last = bd.a > 0.9;
      const hero = bd.a < 0.001;
      const fadeIn = hero ? 1 : smooth(bd.a - CROSS, bd.a - CROSS * 0.72, p);
      const fadeOut = last ? 1 : 1 - smooth(bd.a + 0.03, bd.a + 0.075, p);
      const op = Math.max(0, Math.min(1, fadeIn * fadeOut));
      bd.el.style.opacity = op.toFixed(3);
      bd.el.style.transform = `translateY(${(1 - op) * 26}px)`;
      bd.el.style.pointerEvents = op > 0.6 ? "auto" : "none";
    }
  }

  /* ---------- canvas physics ---------- */
  const SUN_ANG = 32.0;
  const MOON_R_KM = 1737.4;

  function moonScaleFromDist(km) {
    const ma = 2 * Math.atan(MOON_R_KM / km) * (3437.75);
    return ma / SUN_ANG;
  }

  function drawStars(p, t) {
    const w = smooth(0.565, 0.63, p) * (1 - smooth(0.83, 0.88, p));
    if (w <= 0.002) return;
    ctx.globalAlpha = 1;
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      let tw = 1;
      if (!RM()) tw = 0.7 + 0.3 * Math.sin(t * s.sp + s.ph);
      ctx.globalAlpha = s.a * w * tw;
      ctx.fillStyle = "#e8e6e0";
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H * 0.92, s.r, 0, 6.283);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /* the eclipse close-up: sun, moon, corona, flash. cam = {s, alpha} */
  function drawEclipse(p, t, cam) {
    if (cam.alpha <= 0.002) return;
    const cx = CX() + (px - 0.5) * W * 0.05;
    const cy = CY() + (py - 0.5) * H * 0.05;
    const R = Math.min(W, H) * 0.155 * cam.s;

    const wob = RM() ? 0 : Math.sin(t * 0.7) * 0.4 + Math.sin(t * 1.9 + 1.7) * 0.2;
    const approach = smooth(0.08, 0.34, p);
    const moonX = cx + (1 - approach) * W * 0.8;
    const moonY = cy;

    const ms = state.ms;                       // moon-to-sun angular ratio
    const annular = ms < 0.995;
    const mr = R * 1.045 * ms;
    const totality = approach >= 0.999 && !annular;
    const coronaBloom = smooth(0.32, 0.40, p) * (1 - smooth(0.50, 0.56, p))
      + smooth(0.80, 0.86, p) * (1 - smooth(0.94, 0.99, p));
    const flash = smooth(0.50, 0.535, p) * (1 - smooth(0.555, 0.59, p));

    ctx.save();
    ctx.globalAlpha = cam.alpha;

    /* sun disc */
    const sg = ctx.createRadialGradient(cx, cy, R * 0.4, cx, cy, R * 1.15);
    sg.addColorStop(0, "rgba(255,232,190,1)");
    sg.addColorStop(0.75, "rgba(255,176,96,1)");
    sg.addColorStop(1, "rgba(255,140,60,0.15)");
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, 6.283);
    ctx.fill();

    /* corona bloom behind moon */
    if (coronaBloom > 0.003 || totality || (annular && approach >= 0.999)) {
      const strength = annular ? coronaBloom * 0.35 : Math.max(coronaBloom, totality ? 0.12 : 0);
      const sh = RM() ? 0 : Math.sin(t * 2.1) * 0.5 + Math.sin(t * 0.53) * 0.5;
      for (let k = 0; k < 3; k++) {
        const base = [R * 1.25, R * 1.75, R * 2.45][k];
        const g = ctx.createRadialGradient(cx, cy, R * 0.98, cx, cy, base * (1 + 0.03 * sh * wob));
        const a = strength * [0.55, 0.28, 0.13][k];
        g.addColorStop(0, `rgba(235,238,255,${a})`);
        g.addColorStop(1, "rgba(235,238,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, base * (1 + 0.03 * sh * wob), 0, 6.283);
        ctx.fill();
      }
      /* tendrils */
      const n = 56;
      for (let i = 0; i < n; i++) {
        const th = (i / n) * 6.283;
        const len = base1Len(i, R, t, coronaBloom, annular);
        const g2 = ctx.createRadialGradient(cx, cy, R * 1.0, cx, cy, R + len);
        g2.addColorStop(0, `rgba(232,236,255,${(annular ? 0.07 : 0.30) * Math.max(coronaBloom, 0.25) * cam.alpha})`);
        g2.addColorStop(1, "rgba(228,232,252,0)");
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(th) * R * 0.99, cy + Math.sin(th) * R * 0.99);
        ctx.arc(cx, cy, R + len, th - 0.035, th + 0.035);
        ctx.closePath();
        ctx.fill();
      }
    }

    /* ambient glow */
    const ag = ctx.createRadialGradient(cx, cy, R, cx, cy, R * 3.4);
    ag.addColorStop(0, "rgba(255,214,150,0.12)");
    ag.addColorStop(1, "rgba(255,214,150,0)");
    ctx.fillStyle = ag;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 3.4, 0, 6.283);
    ctx.fill();

    /* moon, sliding in */
    ctx.fillStyle = "#050506";
    ctx.beginPath();
    ctx.arc(moonX, moonY, mr, 0, 6.283);
    ctx.fill();
    /* thin crescent edge while approaching */
    if (approach > 0.02 && !totality && !annular) {
      const bite = Math.min(1, approach);
      const lg = ctx.createRadialGradient(moonX - mr * 0.5, moonY - mr * 0.5, mr * 0.2, moonX, moonY, mr);
      lg.addColorStop(0, "rgba(255,200,130,0.22)");
      lg.addColorStop(1, "rgba(255,200,130,0)");
      ctx.globalAlpha = cam.alpha * bite * 0.5;
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.arc(moonX, moonY, mr, 0, 6.283);
      ctx.fill();
      ctx.globalAlpha = cam.alpha;
    }

    /* chromosphere rim: thin hot ring at the moon edge during totality */
    if (totality) {
      const cg = ctx.createRadialGradient(cx, cy, mr * 0.96, cx, cy, mr * 1.09);
      cg.addColorStop(0, "rgba(255,190,140,0)");
      cg.addColorStop(0.5, "rgba(255,196,150,0.85)");
      cg.addColorStop(1, "rgba(255,190,140,0)");
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(cx, cy, mr * 1.09, 0, 6.283);
      ctx.fill();
    }

    /* annular ring of remaining sun */
    if (annular && approach >= 0.999) {
      ctx.strokeStyle = "rgba(255,196,110,0.9)";
      ctx.lineWidth = Math.max(1.5, (R - mr) * 0.9);
      ctx.beginPath();
      ctx.arc(cx, cy, (R + mr) / 2, 0, 6.283);
      ctx.stroke();
    }

    /* diamond ring flash */
    if (flash > 0.003) {
      const fx = cx + mr * 0.98, fy = cy - mr * 0.15;
      const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, R * 2.2 * flash);
      g.addColorStop(0, `rgba(255,255,250,${0.95 * flash})`);
      g.addColorStop(0.25, `rgba(255,226,160,${0.5 * flash})`);
      g.addColorStop(1, "rgba(255,226,160,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(fx, fy, R * 2.2 * flash, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(fx, fy, R * 0.05 * flash + 1.5, 0, 6.283);
      ctx.fill();
    }

    ctx.restore();
  }

  function base1Len(i, R, t, bloom, annular) {
    const th = i * 2.399;
    const wob = RM() ? 0 : Math.sin(t * 0.9 + th) * 0.18 + Math.sin(t * 0.31 + th * 0.7) * 0.12;
    const petal = 0.55 + 0.45 * Math.abs(Math.sin(th * 2.5 + 1.3));
    const cap = annular ? R * 0.35 : R * 1.55;
    return (R * (0.35 + 1.05 * petal) * wob01(petal) + cap * 0.22) * Math.max(bloom, annular ? 0.25 : 0.12) * (1 + wob);
  }
  function wob01(x) { return 0.7 + 0.3 * x; }

  /* the wide shot: Earth limb + racing umbra */
  function drawEarth(p, t) {
    const w = smooth(0.585, 0.64, p) * (1 - smooth(0.80, 0.84, p));
    if (w <= 0.002) return;
    const recede = smooth(0.72, 0.80, p);
    const er = Math.max(W, H) * (1.15 - 0.62 * recede);
    const ecx = CX();
    const ecy = H * (0.62 + 0.28 * recede);

    /* limb: dark disc, atmosphere rim fading out past the edge */
    ctx.globalAlpha = w;
    const lg = ctx.createRadialGradient(ecx, ecy, er * 0.82, ecx, ecy, er * 1.12);
    lg.addColorStop(0, "rgba(4,8,14,1)");
    lg.addColorStop(0.86, "rgba(6,12,20,1)");
    lg.addColorStop(0.93, "rgba(38,64,96,0.85)");
    lg.addColorStop(0.96, "rgba(70,110,160,0.5)");
    lg.addColorStop(1, "rgba(70,110,160,0)");
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.arc(ecx, ecy, er * 1.12, 0, 6.283);
    ctx.fill();



    /* umbra */
    const phi = state.t2 * 2.0;
    const ux = ecx + er * Math.sin(-Math.PI / 2 + phi);
    const uy = ecy - er * Math.cos(-Math.PI / 2 + phi);
    const rx = er * 0.06, ry = rx * 0.42;
    const ug = ctx.createRadialGradient(ux, uy, 0, ux, uy, rx * 1.6);
    ug.addColorStop(0, "rgba(0,0,0,0.92)");
    ug.addColorStop(0.6, "rgba(0,0,0,0.55)");
    ug.addColorStop(1, "rgba(0,0,0,0)");
    ctx.save();
    ctx.translate(ux, uy);
    ctx.scale(1, ry / rx);
    ctx.fillStyle = ug;
    ctx.beginPath();
    ctx.arc(0, 0, rx * 1.6, 0, 6.283);
    ctx.fill();
    ctx.restore();

    /* sunlit haze bleeding over the limb */
    const hg = ctx.createRadialGradient(ecx, ecy - er, 0, ecx, ecy - er, er * 0.5);
    hg.addColorStop(0, "rgba(255,205,150,0.16)");
    hg.addColorStop(1, "rgba(255,205,150,0)");
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(ecx, ecy - er, er * 0.5, 0, 6.283);
    ctx.fill();

    ctx.globalAlpha = 1;
  }

  /* ---------- widget wiring ---------- */
  const $ = (id) => document.getElementById(id);
  const distSlider = $("dist-slider");
  const distVerdict = $("dist-verdict");
  const distStatement = $("dist-statement");
  const distRead = $("dist-read");

  function updateDist() {
    const km = Number(distSlider.value);
    const ms = moonScaleFromDist(km);
    state.ms = Math.min(1.08, Math.max(0.85, ms));
    const ma = ms * SUN_ANG;
    const total = state.ms >= 0.995;
    distVerdict.textContent = total ? "Total" : "Annular";
    distVerdict.classList.toggle("warn", !total);
    distStatement.textContent = total
      ? "Full cover. Daylight collapses."
      : "Too far. A ring of sun survives.";
    distRead.textContent = `MOON ${Math.round(km).toLocaleString("en-US")} KM · ${ma.toFixed(1)} ARCMIN VS SUN ${SUN_ANG.toFixed(1)}`;
  }
  distSlider.addEventListener("input", updateDist);
  updateDist();

  const sweepSlider = $("sweep-slider");
  const sweepVerdict = $("sweep-verdict");
  const sweepRead = $("sweep-read");
  function updateSweep() {
    const t = Number(sweepSlider.value) / 100;
    state.t2 = t;
    const edge = t < 0.42 || t > 0.58;
    sweepVerdict.textContent = edge ? "Edge of path" : "Path centre";
    sweepVerdict.classList.toggle("warn", !edge);
    const width = Math.round(120 + 150 * (1 - Math.abs(t - 0.5) * 2 / 0.5));
    const speed = Math.round(5000 - 3300 * (1 - Math.abs(t - 0.5) * 2 / 0.5));
    const mins = edge ? 0 : Math.round(Math.abs(t - 0.5) < 0.04 ? 2 : 2.5 - Math.abs(t - 0.5) * 2);
    sweepRead.textContent = `UMBRA ${width} KM · ${speed.toLocaleString("en-US")} KM/H · ${Math.max(mins, 0)} MIN OVERHEAD`;
  }
  sweepSlider.addEventListener("input", updateSweep);
  updateSweep();

  /* ---------- chapter label ---------- */
  const chapterEl = $("chapter");
  const chapterDefs = [
    ["Approach", 0.055, 0.335],
    ["Totality", 0.345, 0.495],
    ["Diamond ring", 0.505, 0.615],
    ["The shadow", 0.625, 0.795],
    ["The corona", 0.805, 0.90],
    ["The clock", 0.915, 1.01]
  ];
  function layoutChapter(p) {
    let best = "", bestOp = 0;
    for (const [label, a, b] of chapterDefs) {
      const op = smooth(a, a + 0.02, p) * (b >= 1 ? 1 : 1 - smooth(b - 0.02, b, p));
      if (op > bestOp) { bestOp = op; best = label; }
    }
    if (best) chapterEl.textContent = best;
    chapterEl.style.opacity = bestOp.toFixed(3);
  }

  /* ---------- tap-to-name the totality layers ---------- */
  const tags = $("tags");
  let tagsOn = false;
  document.addEventListener("click", (e) => {
    if (e.target.closest("input, .chip, .pick")) return;
    if (cur > 0.315 && cur < 0.505) tagsOn = !tagsOn;
  });

  /* ---------- chips and bars ---------- */
  document.querySelectorAll(".chip").forEach((ch) => {
    ch.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      ch.classList.add("active");
      $("next-line").textContent = ch.dataset.line;
    });
  });
  document.querySelectorAll(".pick").forEach((row) => {
    row.addEventListener("click", () => {
      document.querySelectorAll(".pick").forEach((r) => r.classList.remove("active"));
      row.classList.add("active");
      $("dur-note").textContent = row.dataset.note;
    });
  });

  /* ---------- pointer parallax ---------- */
  let mx = 0.5, my = 0.5, px = 0.5, py = 0.5;
  window.addEventListener("pointermove", (e) => {
    mx = e.clientX / Math.max(1, W);
    my = e.clientY / Math.max(1, H);
  });

  /* ---------- master loop ---------- */
  let target = 0, cur = 0, tGlobal = 0, lastT = 0;

  function readScroll() {
    const span = Math.max(1, film.offsetHeight - window.innerHeight);
    target = Math.min(1, Math.max(0, window.scrollY / span));
  }

  function frame(ts) {
    const dt = Math.min(0.05, (ts - lastT) / 1000 || 0.016);
    lastT = ts;
    if (!RM()) tGlobal += dt;

    readScroll();
    if (RM()) { cur = target; }
    else {
      const k = 1 - Math.pow(0.001, dt);
      cur += (target - cur) * k;
      if (Math.abs(target - cur) < 0.0002) cur = target;
    }

    layoutBands(cur);
    layoutChapter(cur);

    const tagWin = cur > 0.315 && cur < 0.505;
    tags.classList.toggle("on", tagsOn && tagWin);
    if (!tagWin) tagsOn = false;

    px += (mx - px) * 0.06;
    py += (my - py) * 0.06;

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);

    drawStars(cur, tGlobal);

    /* eclipse camera: full -> pull back -> zoom back in */
    const pull = smooth(0.56, 0.64, cur);
    const zoom = smooth(0.80, 0.86, cur);
    const camS = 1 - 0.5 * pull + 0.7 * zoom;
    const camA = 1 - 0.55 * pull * (1 - zoom) - smooth(0.94, 0.99, cur) * 0.9;
    drawEclipse(cur, tGlobal, { s: Math.max(0.45, camS), alpha: Math.max(0, camA) });

    drawEarth(cur, tGlobal);

    requestAnimationFrame(frame);
  }

  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
  }

  window.addEventListener("resize", resize);
  resize();
  readScroll();
  cur = target;
  requestAnimationFrame(frame);
})();
