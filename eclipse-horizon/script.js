(() => {
  "use strict";
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, x) => { x = clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- stage scrub canvas ---------- */
  const track = document.getElementById("track");
  const sky = document.getElementById("sky");
  const ctx = sky.getContext("2d");
  const cap = document.getElementById("hero-caption");
  let w = 0, h = 0, dpr = 1;

  const fit = () => {
    w = sky.clientWidth; h = sky.clientHeight;
    dpr = Math.min(devicePixelRatio || 1, 2);
    sky.width = w * dpr; sky.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  addEventListener("resize", fit);
  fit();

  const readP = () => {
    const span = track.offsetHeight - innerHeight;
    return span > 0 ? clamp(scrollY / span, 0, 1) : 0;
  };
  let target = readP(), cur = target;

  const wob = (a, t) =>
    Math.sin(a * 3 + t * 0.55) * 0.5 +
    Math.sin(a * 7 - t * 0.9) * 0.3 +
    Math.sin(a * 15 + t * 0.25) * 0.2;

  function draw(p, t) {
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h * 0.44;
    const R = Math.min(w, h) * 0.27;
    const fade = 1 - smooth(0.80, 0.96, p);
    const approach = smooth(0.04, 0.5, p);
    const corona = smooth(0.52, 0.62, p) * (1 - smooth(0.85, 0.95, p)) * fade;
    const flash = smooth(0.66, 0.705, p) * (1 - smooth(0.73, 0.8, p)) * fade;

    let g = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 3.4);
    g.addColorStop(0, `rgba(255,170,90,${0.07 * fade})`);
    g.addColorStop(1, "rgba(255,170,90,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    if (corona > 0.002) {
      const N = 56;
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        const L = R * (1.35 + wob(a, t) * 0.6);
        const x1 = cx + Math.cos(a) * R * 1.02, y1 = cy + Math.sin(a) * R * 1.02;
        const x2 = cx + Math.cos(a) * L, y2 = cy + Math.sin(a) * L;
        const al = (0.09 + 0.16 * Math.abs(wob(a, t))) * corona;
        const lg = ctx.createLinearGradient(x1, y1, x2, y2);
        lg.addColorStop(0, `rgba(255,225,190,${al})`);
        lg.addColorStop(1, "rgba(255,190,120,0)");
        ctx.strokeStyle = lg;
        ctx.lineWidth = 1.2 + 2.2 * Math.abs(wob(a * 2, t));
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      }
      g = ctx.createRadialGradient(cx, cy, R, cx, cy, R * 1.9);
      g.addColorStop(0, `rgba(255,235,205,${0.34 * corona})`);
      g.addColorStop(1, "rgba(255,235,205,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.9, 0, 7); ctx.fill();
    }

    g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    g.addColorStop(0, `rgba(255,248,232,${0.98 * fade})`);
    g.addColorStop(0.72, `rgba(255,206,150,${0.96 * fade})`);
    g.addColorStop(1, `rgba(244,150,70,${0.95 * fade})`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();

    const mx = cx + (1 - approach) * w * 0.62;
    const my = cy + (1 - approach) * h * 0.06;
    const mr = R * 1.045;
    ctx.fillStyle = "#000";
    ctx.beginPath(); ctx.arc(mx, my, mr, 0, 7); ctx.fill();

    const rim = Math.max(approach, corona * 0.9);
    if (rim > 0.002) {
      ctx.strokeStyle = `rgba(255,214,170,${0.9 * rim})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(mx, my, mr - 0.8, Math.PI * 0.62, Math.PI * 1.38); ctx.stroke();
    }

    if (flash > 0.003) {
      const fx = mx - Math.cos(-0.9) * mr * 0.92;
      const fy = my - Math.sin(-0.9) * mr * 0.92;
      const r = R * 0.16 * flash;
      g = ctx.createRadialGradient(fx, fy, 0, fx, fy, r * 3);
      g.addColorStop(0, `rgba(255,255,250,${0.95 * flash})`);
      g.addColorStop(0.35, `rgba(255,230,190,${0.5 * flash})`);
      g.addColorStop(1, "rgba(255,230,190,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(fx, fy, r * 3, 0, 7); ctx.fill();
      ctx.fillStyle = `rgba(255,255,250,${0.9 * flash})`;
      ctx.beginPath(); ctx.arc(fx, fy, r * 0.5, 0, 7); ctx.fill();
      const sw = w * 0.5 * flash;
      g = ctx.createLinearGradient(fx - sw, 0, fx + sw, 0);
      g.addColorStop(0, "rgba(255,240,210,0)");
      g.addColorStop(0.5, `rgba(255,240,210,${0.5 * flash})`);
      g.addColorStop(1, "rgba(255,240,210,0)");
      ctx.fillStyle = g;
      ctx.fillRect(fx - sw, fy - 1, sw * 2, 2);
      const sh = h * 0.3 * flash;
      g = ctx.createLinearGradient(0, fy - sh, 0, fy + sh);
      g.addColorStop(0, "rgba(255,240,210,0)");
      g.addColorStop(0.5, `rgba(255,240,210,${0.35 * flash})`);
      g.addColorStop(1, "rgba(255,240,210,0)");
      ctx.fillStyle = g;
      ctx.fillRect(fx - 1, fy - sh, 2, sh * 2);
    }

    const capFade = 1 - smooth(0.05, 0.22, p);
    cap.style.opacity = capFade.toFixed(3);
    cap.style.visibility = capFade > 0.01 ? "visible" : "hidden";
  }

  const t0 = performance.now();
  function loop(now) {
    target = readP();
    cur += (target - cur) * (reduced ? 1 : 0.14);
    if (Math.abs(target - cur) < 0.0004) cur = target;
    draw(cur, reduced ? 0 : (now - t0) / 1000);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* ---------- widget 1: coincidence ---------- */
  const SUN_ANG = 32.0, RM = 1737.4;
  const sl1 = document.getElementById("dist-slider");
  const v1 = document.getElementById("dist-verdict");
  const st1 = document.getElementById("dist-statement");
  const rd1 = document.getElementById("dist-read");
  const pair = document.getElementById("solar-pair");
  const sunUi = document.getElementById("ui-sun");
  const moonUi = document.getElementById("ui-moon");

  function upd1() {
    const d = +sl1.value;
    const ma = 2 * Math.atan(RM / d) * 3437.75;
    const total = ma >= SUN_ANG;
    v1.textContent = total ? "Total" : "Annular";
    st1.textContent = total
      ? "Full cover. Daylight collapses."
      : "A ring of sun survives. The moon sits too far.";
    rd1.textContent = `${d.toLocaleString("en-US")} km · ${ma.toFixed(1)} arcmin vs 32.0`;
    v1.classList.toggle("warn", !total);
    const base = pair.clientWidth * 0.52;
    sunUi.style.width = sunUi.style.height = base + "px";
    const ms = clamp(ma / SUN_ANG, 0.8, 1.08);
    moonUi.style.width = moonUi.style.height = (base * ms) + "px";
  }
  sl1.addEventListener("input", upd1);

  /* ---------- widget 2: umbra sweep ---------- */
  const sl2 = document.getElementById("sweep-slider");
  const v2 = document.getElementById("sweep-verdict");
  const rd2 = document.getElementById("sweep-read");
  const earthScene = document.getElementById("earth-scene");
  const earth = document.getElementById("earth");
  const umbra = document.getElementById("umbra");

  function upd2() {
    const t = (+sl2.value - 50) / 50;
    const at = Math.abs(t);
    const width = Math.round(270 - 150 * at);
    const speed = Math.round(1700 + 3300 * at);
    v2.textContent = at < 0.34 ? "Path centre" : at < 0.85 ? "Inner path" : "Path edge";
    rd2.textContent = `about ${width.toLocaleString("en-US")} km wide · ground speed about ${speed.toLocaleString("en-US")} km/h`;
    const scW = earthScene.clientWidth, scH = earthScene.clientHeight;
    const er = Math.min(scH * 2.2, scW * 2.6);
    earth.style.width = earth.style.height = (er * 2) + "px";
    earth.style.top = (scH * 0.56) + "px";
    const phiMax = Math.asin(clamp(0.4 * scW / er, 0.02, 0.5));
    const phi = t * phiMax;
    const x = scW / 2 + er * Math.sin(phi);
    const y = scH * 0.56 + er * (1 - Math.cos(phi));
    const wFrac = 0.55 + 0.45 * ((width - 120) / 150);
    const uw = er * 0.11 * wFrac;
    umbra.style.width = uw + "px";
    umbra.style.height = (uw * 0.45) + "px";
    umbra.style.left = x + "px";
    umbra.style.top = y + "px";
  }
  sl2.addEventListener("input", upd2);

  /* ---------- corona canvas for scene 4 ---------- */
  const c2 = document.getElementById("corona2");
  const c2ctx = c2.getContext("2d");
  let c2w = 0, c2h = 0;

  function fitC2() {
    c2w = c2.clientWidth; c2h = c2.clientHeight;
    const d2 = Math.min(devicePixelRatio || 1, 2);
    c2.width = c2w * d2; c2.height = c2h * d2;
    c2ctx.setTransform(d2, 0, 0, d2, 0, 0);
    drawCorona(0.35);
  }

  function drawCorona(t) {
    if (!c2w) return;
    const x = c2ctx;
    x.clearRect(0, 0, c2w, c2h);
    const cx = c2w / 2, cy = c2h * 0.42;
    const R = Math.min(c2w, c2h) * 0.34;
    let g = x.createRadialGradient(cx, cy, R * 0.4, cx, cy, R * 4);
    g.addColorStop(0, "rgba(255,170,90,0.16)");
    g.addColorStop(1, "rgba(255,170,90,0)");
    x.fillStyle = g; x.fillRect(0, 0, c2w, c2h);
    const N = 72;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const L = R * (1.3 + wob(a, t) * 0.75);
      const x1 = cx + Math.cos(a) * R, y1 = cy + Math.sin(a) * R;
      const x2 = cx + Math.cos(a) * L, y2 = cy + Math.sin(a) * L;
      const al = 0.05 + 0.10 * Math.abs(wob(a, t));
      const lg = x.createLinearGradient(x1, y1, x2, y2);
      lg.addColorStop(0, `rgba(255,228,195,${al})`);
      lg.addColorStop(1, "rgba(255,190,120,0)");
      x.strokeStyle = lg;
      x.lineWidth = 1.4 + 2.6 * Math.abs(wob(a * 2, t));
      x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke();
    }
    g = x.createRadialGradient(cx, cy, R * 0.2, cx, cy, R);
    g.addColorStop(0, "rgba(255,246,228,0.95)");
    g.addColorStop(0.7, "rgba(255,206,150,0.9)");
    g.addColorStop(1, "rgba(244,150,70,0.85)");
    x.fillStyle = g;
    x.beginPath(); x.arc(cx, cy, R, 0, 7); x.fill();
  }

  /* ---------- scene reveals ---------- */
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.25 });
  document.querySelectorAll(".scene").forEach((s) => io.observe(s));

  addEventListener("resize", () => { upd1(); upd2(); fitC2(); });
  upd1(); upd2(); fitC2();
})();
