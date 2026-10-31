(() => {
"use strict";
const SHOES = [
  {
    id: "aj1", img: "assets/aj1.webp", alt: "Air Jordan 1 High OG Royal",
    giant: "AJ1", name: "AIR JORDAN 1 HIGH OG", cw: "ROYAL. 1985.",
    price: "$185", year: "ORIGIN 1985", accent: "#2C63E8",
    line: "The one that started it all.",
    story: "A basketball boot cut loose from its leather. Royal blue took it off the court and made it street.",
    specs: [["SILHOUETTE", "HIGH TOP BASKETBALL"], ["CUSHIONING", "ENCAPSULATED AIR"], ["SIGNED", "PETER MOORE, 1985"]]
  },
  {
    id: "aj5", img: "assets/aj5.webp", alt: "Air Jordan 5 Retro OG Halloween",
    giant: "AJ5", name: "AIR JORDAN 5 RETRO OG", cw: "HALLOWEEN. 1990.",
    price: "$215", year: "ORIGIN 1990", accent: "#C8332E",
    line: "Built like a fighter jet, dressed for midnight.",
    story: "The sole borrows a WWII fighter plane. Shark teeth on the midsole gave it away.",
    specs: [["SILHOUETTE", "MID TOP BASKETBALL"], ["CUSHIONING", "VISIBLE AIR SOLE"], ["SIGNED", "TINKER HATFIELD, 1990"]]
  },
  {
    id: "af1", img: "assets/af1.webp", alt: "Nike Air Force 1 07",
    giant: "FORCE 1", name: "NIKE AIR FORCE 1 07", cw: "TRIPLE WHITE.",
    price: "$115", year: "ORIGIN 1982", accent: "#D8D4CB",
    line: "Forty years of staying exactly the same.",
    story: "First to carry Air, first to retire undefeated. Forty years, no redesign.",
    specs: [["SILHOUETTE", "LOW TOP COURT"], ["CUSHIONING", "AIR SOLE UNIT"], ["SIGNED", "BRUCE KILGORE, 1982"]]
  },
  {
    id: "am270", img: "assets/am270.webp", alt: "Nike Air Max 270",
    giant: "AIR 270", name: "NIKE AIR MAX 270", cw: "BLACK AND VOLT.",
    price: "$170", year: "ORIGIN 2018", accent: "#6FB7FF",
    line: "270 degrees of air, angled for impact.",
    story: "Shaped by runner pressure maps, named for the 270 degrees of Air it wraps around the heel.",
    specs: [["SILHOUETTE", "LIFESTYLE RUNNER"], ["CUSHIONING", "270 HEEL AIR UNIT"], ["SIGNED", "NIKE AIR, 2018"]]
  },
  {
    id: "pegasus", img: "assets/pegasus.webp", alt: "Nike Pegasus Plus 2",
    giant: "PEGASUS", name: "NIKE PEGASUS PLUS 2", cw: "DEEP ROYAL.",
    price: "$170", year: "LINE SINCE 1983", accent: "#2743D0",
    line: "The everyday workhorse, tuned.",
    story: "One question since 1983: what does tomorrow morning need. ReactX foam is the current answer.",
    specs: [["SILHOUETTE", "ROAD RUNNING"], ["CUSHIONING", "REACTX FOAM"], ["SIGNED", "PEGASUS LINE, 1983"]]
  },
  {
    id: "p6000", img: "assets/p6000.webp", alt: "Nike P-6000",
    giant: "P6000", name: "NIKE P-6000", cw: "METALLIC SILVER.",
    price: "$115", year: "ORIGIN 2006", accent: "#B9C4CC",
    line: "A mid-2000s racer, resurfaced.",
    story: "Track tooling from 2006, resurfaced for the street. Layered mesh, racing lines.",
    specs: [["SILHOUETTE", "RETRO RUNNER"], ["CUSHIONING", "FOAM MIDSOLE"], ["SIGNED", "TRACK SERIES, 2006"]]
  }
];
window.__SHOES = SHOES;

const flow = document.getElementById("flow");
const rail = document.getElementById("rail");
const detail = document.getElementById("detail");
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;

function buildActs() {
  SHOES.forEach((s, i) => {
    if (i === 0) return;
    const act = document.createElement("section");
    act.className = "act";
    act.dataset.i = i;
    act.innerHTML =
      '<div class="stage">' +
        '<span class="giant" aria-hidden="true">' + s.giant + "</span>" +
        '<div class="glow"></div>' +
        '<img class="shoe" src="' + s.img + '" alt="' + s.alt + '" loading="lazy" draggable="false">' +
      "</div>" +
      '<div class="copy">' +
        '<h3 class="name" style="font-size:15px;font-weight:700;letter-spacing:0.04em;margin-bottom:10px">' + s.name + "</h3>" +
        '<p class="line">' + s.line + "</p>" +
        '<p class="price">' + s.cw + " " + s.price + "</p>" +
        '<p class="cta">CLICK THE SHOE TO KNOW MORE</p>' +
      "</div>";
    flow.appendChild(act);
  });
}

function buildRail() {
  SHOES.forEach((s, i) => {
    const card = document.createElement("button");
    card.className = "card";
    card.style.setProperty("--c", s.accent);
    card.style.setProperty("--k", i);
    card.setAttribute("aria-label", "Know more, " + s.name);
    card.innerHTML =
      '<img src="' + s.img + '" alt="" loading="lazy" draggable="false">' +
      '<p class="cn">' + s.name + "</p>" +
      '<p class="cp">' + s.cw + " " + s.price + "</p>";
    card.addEventListener("click", () => openDetail(i));
    rail.appendChild(card);
  });
}

let openIdx = -1;
function openDetail(i) {
  const s = SHOES[i];
  openIdx = i;
  document.documentElement.style.setProperty("--acc", s.accent);
  const frgb = hexToRgb(s.accent);
  detail.style.background =
    "radial-gradient(110% 90% at 72% 18%, rgba(" + frgb.join(",") + ",0.2), rgba(6, 7, 9, 0.94) 60%)";
  detail.querySelector(".dwrap").style.background =
    "linear-gradient(165deg, rgba(" + frgb.join(",") + ",0.14), #0D0E11 48%)";
  document.getElementById("dShoe").src = s.img;
  document.getElementById("dShoe").alt = s.alt;
  document.getElementById("dName").textContent = s.name;
  document.getElementById("dCw").textContent = s.cw;
  document.getElementById("dLine").textContent = s.story;
  document.getElementById("dPrice").textContent = s.price;
  document.getElementById("dYear").textContent = s.year;
  document.getElementById("dSpecs").innerHTML = s.specs
    .map(r => '<div><span class="k">' + r[0] + '</span><span class="v">' + r[1] + "</span></div>").join("");
  document.getElementById("dNote").hidden = true;
  detail.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeDetail() {
  detail.classList.remove("open");
  openIdx = -1;
  document.body.style.overflow = "";
}
document.getElementById("detailClose").addEventListener("click", closeDetail);
detail.addEventListener("click", e => { if (e.target === detail) closeDetail(); });
window.addEventListener("keydown", e => { if (e.key === "Escape" && detail.classList.contains("open")) closeDetail(); });
document.getElementById("dBag").addEventListener("click", () => {
  document.getElementById("dNote").hidden = false;
});

const shoeIdx = [0, 1, 2, 3, 4, 5];

let mx = 0.5, my = 0.5, sx = 0.5, sy = 0.5;
window.addEventListener("pointermove", e => {
  mx = e.clientX / window.innerWidth;
  my = e.clientY / window.innerHeight;
});

function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [n >> 16 & 255, n >> 8 & 255, n & 255];
}
let cur = hexToRgb("#2C63E8");
function mixTo(target, t) {
  const to = hexToRgb(target);
  for (let c = 0; c < 3; c++) cur[c] = lerp(cur[c], to[c], t);
  return "rgb(" + cur.map(v => Math.round(v)).join(",") + ")";
}

function frame() {
  sx = lerp(sx, mx, 0.075);
  sy = lerp(sy, my, 0.075);
  const vh = window.innerHeight;
  const px = sx - 0.5, py = sy - 0.5;
  let best = 0, bd = 1e9;
  acts.forEach((a, k) => {
    const el = shoesEls[k], g = giantEls[k];
    if (!el) return;
    const r = a.getBoundingClientRect();
    const p = clamp((r.top + r.height * 0.5 - vh * 0.5) / vh, -1.2, 1.2);
    const off = p * vh;
    if (Math.abs(off) > vh * 1.35) {
      a.style.visibility = "hidden";
      return;
    }
    a.style.visibility = "visible";
    const near = 1 - Math.min(1, Math.abs(p));
    el.style.transform =
      "translate(calc(-50% + " + (px * 16).toFixed(1) + "px), calc(-50% + " + (py * 11 - off * 0.32).toFixed(1) + "px))" +
      " perspective(900px) rotateY(" + (px * 8).toFixed(2) + "deg) rotateX(" + (-py * 5).toFixed(2) + "deg)" +
      " rotate(" + (p * -3.5).toFixed(2) + "deg) scale(" + (0.94 + near * 0.1).toFixed(3) + ")";
    g.style.transform =
      "translate(calc(-50% + " + (-px * 30).toFixed(1) + "px), calc(-50% - " + (off * 0.16).toFixed(1) + "px))";
    if (glowEls[k]) glowEls[k].style.transform =
      "translate(calc(-50% + " + (px * 46).toFixed(1) + "px), calc(-50% + " + (py * 34).toFixed(1) + "px))";
    const d = Math.abs(r.top + r.height * 0.5 - vh * 0.5);
    if (d < bd) { bd = d; best = k; }
  });
  const target = SHOES[shoeIdx[best]] ? SHOES[shoeIdx[best]].accent : "#2C63E8";
  document.documentElement.style.setProperty("--acc", mixTo(target, 0.055));
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

buildActs();
buildRail();

const acts = Array.from(document.querySelectorAll(".act"));
const shoesEls = acts.map(a => a.querySelector(".shoe"));
const giantEls = acts.map(a => a.querySelector(".giant"));
acts.forEach((a, k) => a.style.setProperty("--a2", SHOES[shoeIdx[k]].accent));
acts.forEach((a, k) => {
  const shoe = shoesEls[k];
  if (!shoe) return;
  shoe.addEventListener("pointerenter", e => { if (e.pointerType !== "touch") a.classList.add("hover"); });
  shoe.addEventListener("pointerleave", () => a.classList.remove("hover"));
  shoe.addEventListener("click", () => openDetail(shoeIdx[k]));
});
const glowEls = acts.map(a => a.querySelector(".glow"));

const YEARS = [
  { y: "1982", img: "assets/af1.webp", n: "AIR FORCE 1", l: "Air enters the court." },
  { y: "1985", img: "assets/aj1.webp", n: "AIR JORDAN 1", l: "The blueprint drops." },
  { y: "1990", img: "assets/aj5.webp", n: "AIR JORDAN 5", l: "The fighter jet lands." },
  { y: "2006", img: "assets/p6000.webp", n: "P-6000", l: "The racer is born." },
  { y: "2018", img: "assets/am270.webp", n: "AIR MAX 270", l: "The tallest heel Air yet." },
  { y: "2026", img: "assets/pegasus.webp", n: "PEGASUS PLUS 2", l: "The workhorse, tuned." }
];
const strip = document.getElementById("strip");
YEARS.forEach((t, i) => {
  const plate = document.createElement("div");
  plate.className = "plate";
  plate.style.setProperty("--k", i);
  plate.innerHTML =
    '<p class="yr">' + t.y + "</p>" +
    '<img src="' + t.img + '" alt="' + t.n + '" loading="lazy" draggable="false">' +
    '<p class="pn">' + t.n + "</p>" +
    '<p class="pl">' + t.l + "</p>";
  strip.appendChild(plate);
});

function swipeInto(el, suppressClicks) {
  let held = false, sx = 0, lx = 0, v = 0;
  el.addEventListener("pointerdown", e => {
    held = true; sx = lx = e.clientX; v = 0;
    el.classList.add("grab");
    try { el.setPointerCapture(e.pointerId); } catch (err) {}
  });
  el.addEventListener("pointermove", e => {
    if (!held) return;
    v = e.clientX - lx;
    lx = e.clientX;
    el.scrollLeft -= v;
  });
  window.addEventListener("pointerup", () => {
    if (!held) return;
    held = false;
    el.classList.remove("grab");
    const glide = () => {
      if (held || Math.abs(v) < 0.35) return;
      el.scrollLeft -= v;
      v *= 0.93;
      requestAnimationFrame(glide);
    };
    glide();
  });
  if (suppressClicks) {
    el.addEventListener("click", e => {
      if (Math.abs(e.clientX - sx) > 8) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
  }
}
swipeInto(rail, true);
swipeInto(strip, false);

document.querySelectorAll("#workshop .dot").forEach(d => {
  d.addEventListener("click", () => {
    const on = d.classList.contains("on");
    document.querySelectorAll("#workshop .dot").forEach(o => o.classList.remove("on"));
    if (!on) d.classList.add("on");
  });
});

const swrap = document.getElementById("stagewrap");
const sshoe = document.getElementById("stageShoe");
const bgA = document.getElementById("bgA");
const bgB = document.getElementById("bgB");
const bgs = [bgA, bgB];
let bgOn = 0;
bgs[1].style.opacity = "0";
function setStageBG(hex) {
  const next = bgs[1 - bgOn];
  next.style.background = "radial-gradient(circle at 50% 45%, " + hex + ", transparent 72%)";
  next.style.opacity = "1";
  bgs[bgOn].style.opacity = "0";
  bgOn = 1 - bgOn;
}
document.getElementById("swatches").addEventListener("click", e => {
  const b = e.target.closest(".sw");
  if (!b) return;
  setStageBG(b.dataset.bg);
  document.querySelectorAll(".sw").forEach(s => s.classList.toggle("on", s === b));
});
swrap.addEventListener("pointermove", e => {
  const r = swrap.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5;
  const y = (e.clientY - r.top) / r.height - 0.5;
  sshoe.style.transform =
    "translate(calc(-50% + " + (x * 24).toFixed(1) + "px), calc(-50% + " + (y * 16).toFixed(1) + "px))" +
    " perspective(800px) rotateY(" + (x * 10).toFixed(2) + "deg) rotateX(" + (-y * 7).toFixed(2) + "deg)";
});
swrap.addEventListener("pointerleave", () => {
  sshoe.style.transform = "translate(-50%, -50%)";
});

const io = new IntersectionObserver(entries => {
  entries.forEach(en => en.target.classList.toggle("live", en.isIntersecting));
}, { threshold: 0.3 });
acts.forEach(a => io.observe(a));
io.observe(document.getElementById("railsec"));
io.observe(document.getElementById("workshop"));
io.observe(document.getElementById("timeline"));
})();
