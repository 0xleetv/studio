(() => {
  "use strict";

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smoothstep = (a, b, t) => {
    const x = clamp((t - a) / (b - a), 0, 1);
    return x * x * (3 - 2 * x);
  };
  const inOut = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const win = (p, a, b, c, d) => smoothstep(a, b, p) * (1 - smoothstep(c, d, p));

  const moonDisc = document.getElementById("moon-disc");
  const moonRim = document.getElementById("moon-rim");
  const sunDisc = document.getElementById("sun-disc");
  const corona = {
    c1: document.getElementById("corona-1"),
    c2: document.getElementById("corona-2"),
    c3: document.getElementById("corona-3"),
    group: document.getElementById("corona-group")
  };
  const diamondPlate = document.getElementById("diamond-plate");
  const diamondGroup = document.getElementById("diamond-group");
  const horizonStage = document.getElementById("horizon-stage");
  const captions = {
    hero: document.getElementById("caption-hero"),
    contact: document.getElementById("caption-contact"),
    totality: document.getElementById("caption-totality"),
    diamond: document.getElementById("caption-diamond")
  };
  const video = document.getElementById("sun-video");

  const setX = (el, px) => { el.style.transform = "translate3d(" + px.toFixed(1) + "px,0,0)"; };
  const setO = (el, a) => { el.style.opacity = clamp(a, 0, 1).toFixed(3); };

  function placeDisc(el, centerX) {
    const halfVw = window.innerWidth / 2;
    setX(el, centerX - halfVw);
  }

  function apply(p) {
    // moon: entrance 0.05-0.50, hold 0.50-0.80, exit 0.80-0.96
    const mIn = inOut(smoothstep(0.05, 0.50, p));
    const mOut = smoothstep(0.80, 0.96, p);
    const mCentered = mIn * (1 - mOut);
    if (mCentered > 0.0001) {
      moonDisc.style.visibility = "visible";
      const halfVw = window.innerWidth / 2;
      const disc = moonDisc.offsetWidth || 1;
      const centerX = halfVw + (1 - mCentered) * (disc + 40) * (1 - mOut) - mOut * (halfVw + disc + 40);
      placeDisc(moonDisc, centerX);
    } else {
      moonDisc.style.visibility = "hidden";
    }
    // lit rim during first contact only
    setO(moonRim, win(p, 0.12, 0.30, 0.40, 0.50) * 0.9);

    // sun: full until first contact completes, then gone for good
    const sAlpha = (1 - smoothstep(0.42, 0.50, p));
    setO(sunDisc, sAlpha);

    // corona: rises with totality, dies as diamond begins
    setO(corona.c1, win(p, 0.42, 0.49, 0.56, 0.64) * 0.85);
    setO(corona.c2, win(p, 0.45, 0.53, 0.56, 0.66) * 0.95);
    setO(corona.c3, win(p, 0.48, 0.54, 0.55, 0.63) * 0.85);

    // diamond ring: third contact flare on the trailing limb
    const dIn = smoothstep(0.64, 0.70, p);
    const dOut = smoothstep(0.76, 0.84, p);
    setO(diamondPlate, Math.max(dIn * (1 - dOut), 0) * 0.95);
    diamondGroup.style.visibility = (dIn > 0.001 && dOut < 0.999) ? "visible" : "hidden";

    // horizon rises under the moon's exit
    const hUp = smoothstep(0.84, 0.98, p);
    horizonStage.style.transform = "translateY(" + (102 - hUp * 102).toFixed(2) + "%)";
    setO(document.getElementById("horizon-glow"), hUp * 0.9);

    // captions
    setO(captions.hero, 1 - smoothstep(0.10, 0.15, p));
    setO(captions.contact, win(p, 0.19, 0.24, 0.37, 0.42));
    setO(captions.totality, win(p, 0.46, 0.50, 0.59, 0.64));
    setO(captions.diamond, win(p, 0.66, 0.70, 0.76, 0.80));
  }

  // scroll plumbing
  const track = document.querySelector(".scroll-track");
  const urlP = new URLSearchParams(location.search).get("progress");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (urlP !== null) {
    document.body.style.overflow = "hidden";
  }
  const readP = () => urlP !== null ? parseFloat(urlP) : clamp(window.scrollY / Math.max(1, track.offsetHeight - window.innerHeight), 0, 1);

  let current = readP();
  let target = current;
  // Scroll scrub always runs. Reduced motion only softens it: no eased
  // glide, states snap to the scroll position, ambient layers stay still.
  const calm = reduced && urlP === null;
  if (urlP !== null) {
    current = target = readP();
    apply(current);
  } else {
    window.addEventListener("scroll", () => { target = readP(); }, { passive: true });
    const tick = () => {
      target = readP();
      if (calm) {
        current = target;
      } else {
        current = lerp(current, target, 0.15);
        if (Math.abs(current - target) < 0.0005) current = target;
      }
      apply(current);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    if (video && video.play) video.play().catch(() => {});
  }

  // ===== teaching widgets: user-driven input, reduced-motion safe =====
  const SUN_ANG = 32.0;      // sun's average apparent diameter, arcminutes
  const MOON_R_KM = 1737.4;  // moon radius, km

  const distSlider = document.getElementById("dist-slider");
  const distRead = document.getElementById("dist-read");
  const distVerdict = document.getElementById("dist-verdict");
  const distHint = document.getElementById("dist-hint");
  const wMoon = document.getElementById("w-moon");

  const fmt = n => Math.round(n).toLocaleString("en-US");

  function updateDist() {
    if (!distSlider) return;
    const d = parseFloat(distSlider.value);
    const ang = 2 * Math.atan(MOON_R_KM / d) * (180 / Math.PI) * 60;
    const total = ang >= SUN_ANG;
    distRead.textContent = fmt(d) + " km · " + ang.toFixed(1) + " arcmin";
    distVerdict.textContent = total ? "TOTAL ECLIPSE" : "ANNULAR";
    distVerdict.className = "verdict" + (total ? " total" : "");
    distHint.textContent = total
      ? "The moon covers the sun completely."
      : "The moon leaves a ring of the sun showing.";
    wMoon.setAttribute("r", (48 * ang / SUN_ANG).toFixed(2));
  }
  if (distSlider) {
    distSlider.addEventListener("input", updateDist);
    updateDist();
  }

  const sweepSlider = document.getElementById("sweep-slider");
  const sweepRead = document.getElementById("sweep-read");
  const sweepVerdict = document.getElementById("sweep-verdict");
  const wUmbra = document.getElementById("w-umbra");
  const wPenumbra = document.getElementById("w-penumbra");

  function updateSweep() {
    if (!sweepSlider) return;
    const t = (parseFloat(sweepSlider.value) - 50) / 50; // -1 edge .. 1 edge
    const a = t * 0.6; // radians along the limb
    const x = 160 + 250 * Math.sin(a);
    const y = 320 - 250 * Math.cos(a);
    wUmbra.setAttribute("cx", x.toFixed(1));
    wUmbra.setAttribute("cy", y.toFixed(1));
    wPenumbra.setAttribute("cx", x.toFixed(1));
    wPenumbra.setAttribute("cy", y.toFixed(1));
    const speed = 1700 + 3300 * Math.pow(Math.abs(t), 0.6);
    const width = 120 + 150 * (1 - Math.abs(t));
    sweepRead.textContent = "ground speed about " + fmt(speed) + " km/h · umbra about " + fmt(width) + " km wide";
    const at = Math.abs(t);
    sweepVerdict.textContent = at < 0.15 ? "PATH CENTRE" : (at > 0.85 ? "PATH EDGE" : "INNER PATH");
  }
  if (sweepSlider) {
    sweepSlider.addEventListener("input", updateSweep);
    updateSweep();
  }
})();
