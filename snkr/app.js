import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const CW = [
  { name:'ROYAL',  body:'#2C63E8', trim:'#E8E8E4', line:'Court blue on black. The loudest blue on the rack, kept quiet everywhere else.' },
  { name:'CRIMSON',body:'#C8332E', trim:'#EFEAE4', line:'One red carries the whole shoe. Everything else steps back.' },
  { name:'BONE',   body:'#D8D4CB', trim:'#F2F0EA', line:'Off white head to toe. Quiet on purpose.' },
  { name:'ICE',    body:'#7FA8E8', trim:'#EAF1F8', line:'Ice blue under a cold light.' },
  { name:'COBALT', body:'#2743D0', trim:'#E6E9F2', line:'Deep blue, close to midnight.' },
  { name:'SILVER', body:'#9BA6AE', trim:'#E8EAEC', line:'Raw grey. No color to hide behind.' }
];
const ARCHIVE = [
  { img:'assets/aj1.webp', alt:'Air Jordan 1 High OG Royal', name:'AIR JORDAN 1 HIGH OG', year:'ORIGIN 1985', price:'FROM $185', accent:'#2C63E8',
    line:'The one that started it all. Royal blue took it off the court and made it street.',
    specs:[['SILHOUETTE','HIGH TOP BASKETBALL'],['CUSHIONING','ENCAPSULATED AIR'],['SIGNED','PETER MOORE, 1985']] },
  { img:'assets/aj5.webp', alt:'Air Jordan 5 Retro OG Halloween', name:'AIR JORDAN 5 RETRO OG', year:'ORIGIN 1990', price:'FROM $215', accent:'#C8332E',
    line:'Built like a fighter jet, dressed for midnight. Shark teeth on the midsole gave it away.',
    specs:[['SILHOUETTE','MID TOP BASKETBALL'],['CUSHIONING','VISIBLE AIR SOLE'],['SIGNED','TINKER HATFIELD, 1990']] },
  { img:'assets/af1.webp', alt:'Nike Air Force 1 07', name:'NIKE AIR FORCE 1 07', year:'ORIGIN 1982', price:'FROM $115', accent:'#D8D4CB',
    line:'First to carry Air, first to retire undefeated. Forty years, no redesign.',
    specs:[['SILHOUETTE','LOW TOP COURT'],['CUSHIONING','AIR SOLE UNIT'],['SIGNED','BRUCE KILGORE, 1982']] },
  { img:'assets/am270.webp', alt:'Nike Air Max 270', name:'NIKE AIR MAX 270', year:'ORIGIN 2018', price:'FROM $170', accent:'#6FB7FF',
    line:'Shaped by runner pressure maps, named for the degrees of Air it wraps around the heel.',
    specs:[['SILHOUETTE','LIFESTYLE RUNNER'],['CUSHIONING','270 HEEL AIR UNIT'],['SIGNED','NIKE AIR, 2018']] },
  { img:'assets/pegasus.webp', alt:'Nike Pegasus Plus 2', name:'NIKE PEGASUS PLUS 2', year:'LINE SINCE 1983', price:'FROM $170', accent:'#2743D0',
    line:'The everyday workhorse, tuned. ReactX foam is the current answer to tomorrow morning.',
    specs:[['SILHOUETTE','ROAD RUNNING'],['CUSHIONING','REACTX FOAM'],['SIGNED','PEGASUS LINE, 1983']] },
  { img:'assets/p6000.webp', alt:'Nike P-6000', name:'NIKE P-6000', year:'ORIGIN 2006', price:'FROM $110', accent:'#B9C4CC',
    line:'A 2006 runner pulled straight out of the vault, all lines and layered panels.',
    specs:[['SILHOUETTE','RETRO RUNNER'],['CUSHIONING','FOAM MIDSOLE'],['SIGNED','NIKE SPORTSWEAR, 2006']] }
];
const SWATCHES = [
  { name:'STUDIO',   bg:'#101114', key:'#FFFFFF', ki:1.6, hi:.5 },
  { name:'COURT',    bg:'#23100A', key:'#FFB37A', ki:1.8, hi:.42 },
  { name:'MIDNIGHT', bg:'#04060F', key:'#7AA0FF', ki:1.25, hi:.3 },
  { name:'DAYBREAK', bg:'#2A1108', key:'#FFC9A1', ki:2.0, hi:.55 }
];

const canvas = document.getElementById('gl');
const giant = document.getElementById('giant');
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const scene = new THREE.Scene();
scene.background = null;
const camera = new THREE.PerspectiveCamera(34, innerWidth/innerHeight, .1, 60);
camera.position.set(0, .5, 5.2);

const hemi = new THREE.HemisphereLight('#D7DEEA', '#0A0B0E', .5);
const key = new THREE.DirectionalLight('#FFFFFF', 1.6);
key.position.set(2.6, 3.8, 2.2);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
Object.assign(key.shadow.camera, { left:-3, right:3, top:3, bottom:-3, near:.5, far:14 });
const rim = new THREE.PointLight('#2C63E8', 14, 10, 2);
rim.position.set(-2.4, 1.4, -1.8);
const cursorL = new THREE.PointLight('#FFFFFF', 7, 7, 2);
cursorL.position.set(0, .6, 2.4);
scene.add(hemi, key, rim, cursorL);

let wrap = null, bodyMat = null, trimMat = null;
const tgtBody = new THREE.Color(CW[0].body), tgtTrim = new THREE.Color(CW[0].trim), tgtRim = new THREE.Color(CW[0].body);
const tgtBg = new THREE.Color('#08090B'), tgtKey = new THREE.Color('#FFFFFF');
let tgtKi = 1.6, tgtHi = .5;

new GLTFLoader().load('assets/shoe.glb', (g) => {
  const root = g.scene;
  root.traverse((o) => {
    if (!o.isMesh) return;
    if (/lConv/i.test(o.name)) { o.visible = false; return; }
    o.castShadow = true;
    const m = o.material;
    if (m && !Array.isArray(m)) {
      if (m.name === 'Mat.3') bodyMat = m; else trimMat = m;
    }
  });
  root.updateMatrixWorld(true);
  const bb = new THREE.Box3();
  root.traverse((o) => { if (o.isMesh && o.visible) bb.expandByObject(o); });
  const size = bb.getSize(new THREE.Vector3());
  const s = 1.55 / Math.max(size.x, size.y, size.z);
  root.scale.setScalar(s);
  root.updateMatrixWorld(true);
  const bb2 = new THREE.Box3();
  root.traverse((o) => { if (o.isMesh && o.visible) bb2.expandByObject(o); });
  const c2 = bb2.getCenter(new THREE.Vector3());
  root.position.x -= c2.x; root.position.z -= c2.z; root.position.y -= bb2.min.y;
  if (bodyMat) { bodyMat.roughness = .48; bodyMat.metalness = .08; }
  if (trimMat) { trimMat.roughness = .62; trimMat.metalness = .02; }
  wrap = new THREE.Group();
  wrap.add(root);
  scene.add(wrap);
}, undefined, (e) => { console.warn('glb', e); });

const acts = Array.from(document.querySelectorAll('.act'));
acts.forEach((a, i) => a.style.setProperty('--acc', CW[i].body));
const archiveEl = document.getElementById('archive');

function poses() {
  const mob = innerWidth < 720;
  return [
    [0, 0, 1.0, -0.55],
    [0, 0, 1.06, 0.40],
    [0, 0, 1.0, -1.25],
    [0, 0, 1.04, 0.75],
    [0, 0, 1.0, -2.05],
    [0, 0, 1.04, 1.15],
    mob ? [0, .55, .5, -.5] : [1.15, .15, .72, -.5]
  ];
}
function stopPos() {
  const s = acts.map((a) => a.offsetTop + a.offsetHeight * .85 - innerHeight * .5);
  s.push(Math.max(s[5] + innerHeight * .5, archiveEl.offsetTop - innerHeight * .35));
  s[0] = 0;
  return s;
}
let stops = stopPos();
const smooth = (f) => f * f * (3 - 2 * f);
function targetT() {
  const y = scrollY;
  if (y <= stops[0]) return 0;
  for (let k = 0; k < stops.length - 1; k++) {
    if (y < stops[k + 1]) {
      const span = Math.max(1, stops[k + 1] - stops[k]);
      return k + smooth(Math.min(1, Math.max(0, (y - stops[k]) / span)));
    }
  }
  return stops.length - 1;
}

let t = 0, cur = [0, 0, 1, -0.55];
let dragging = false, px = 0, vel = 0, userRot = 0, lastMove = 0, downInfo = null;
let tilt = 0, tiltT = 0, cx = .5, cy = .5;

function overShoe(x, y) {
  if (!wrap) return false;
  const v = new THREE.Vector3();
  wrap.getWorldPosition(v);
  v.project(camera);
  const sx = (v.x * .5 + .5) * innerWidth, sy = (-v.y * .5 + .5) * innerHeight;
  const r = Math.min(innerWidth, innerHeight) * .3 * wrap.scale.x;
  const dx = x - sx, dy = y - sy;
  return dx * dx + dy * dy < r * r;
}
window.addEventListener('pointerdown', (e) => {
  if (!overShoe(e.clientX, e.clientY)) return;
  dragging = true; px = e.clientX; vel = 0;
  downInfo = { x: e.clientX, y: e.clientY, t: performance.now() };
});
window.addEventListener('pointermove', (e) => {
  cx = e.clientX / innerWidth; cy = e.clientY / innerHeight;
  tiltT = (cy - .5) * .24;
  if (dragging) {
    const dx = e.clientX - px; px = e.clientX;
    userRot += dx * .006; vel = dx * .006;
    lastMove = performance.now();
  }
});
window.addEventListener('pointerup', (e) => {
  if (dragging && downInfo) {
    const d = Math.hypot(e.clientX - downInfo.x, e.clientY - downInfo.y);
    const dt = performance.now() - downInfo.t;
    if (d < 8 && dt < 450) openCw(Math.min(5, Math.round(t)));
  }
  dragging = false;
});

const dback = document.getElementById('dback');
const detail = document.getElementById('detail');
const dkick = document.getElementById('dkick'), dname = document.getElementById('dname');
const dline = document.getElementById('dline'), dpal = document.getElementById('dpal');
const dspecs = document.getElementById('dspecs'), dnote = document.getElementById('dnote');
function showDetail(o) {
  dkick.textContent = o.kick; dname.textContent = o.name; dline.textContent = o.line;
  dpal.innerHTML = o.pal.map((c) => '<i style="background:' + c + '"></i>').join('');
  dspecs.innerHTML = o.specs.map((r) => '<div><b>' + r[0] + '</b><span>' + r[1] + '</span></div>').join('');
  dnote.textContent = o.note;
  detail.style.setProperty('--acc', o.acc);
  dback.classList.add('on'); detail.classList.add('open');
  detail.setAttribute('aria-hidden', 'false');
}
function closeDetail() {
  dback.classList.remove('on'); detail.classList.remove('open');
  detail.setAttribute('aria-hidden', 'true');
}
function openCw(i) {
  const c = CW[i];
  showDetail({
    kick: 'COLORWAY 0' + (i + 1), name: c.name, line: c.line,
    pal: [c.body, c.trim, '#08090B'],
    specs: [['BASE', c.body.toUpperCase()], ['TRIM', c.trim.toUpperCase()], ['FINISH', 'MATTE. LOW SHEEN']],
    note: 'CONCEPT SILHOUETTE. NOTHING SHIPS.', acc: c.body
  });
}
function openArc(i) {
  const s = ARCHIVE[i];
  showDetail({
    kick: 'FROM THE ARCHIVE', name: s.name, line: s.line,
    pal: [s.accent],
    specs: [['ORIGIN', s.year], ['PRICE', s.price]].concat(s.specs),
    note: 'PHOTOS BELONG TO NIKE. THIS IS A STUDY.', acc: s.accent
  });
}
document.getElementById('dclose').addEventListener('click', closeDetail);
dback.addEventListener('click', closeDetail);
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDetail(); });

const strip = document.getElementById('strip');
ARCHIVE.forEach((s, i) => {
  const d = document.createElement('div');
  d.className = 'plate';
  d.style.setProperty('--acc', s.accent);
  d.innerHTML = '<img src="' + s.img + '" alt="' + s.alt + '"><h4>' + s.name + '</h4><p>' + s.year + '</p>';
  let mx = 0;
  d.addEventListener('pointerdown', () => { mx = 0; });
  d.addEventListener('click', () => { if (mx < 8) openArc(i); });
  d.addEventListener('pointermove', (e) => { mx = Math.max(mx, Math.abs(e.movementX)); });
  strip.appendChild(d);
});
strip.addEventListener('wheel', (e) => {
  const max = strip.scrollWidth - strip.clientWidth;
  if (max <= 0) return;
  const d = e.deltaX || e.deltaY;
  const atStart = strip.scrollLeft <= 0 && d < 0;
  const atEnd = strip.scrollLeft >= max - 1 && d > 0;
  if (!atStart && !atEnd) { e.preventDefault(); strip.scrollLeft += d; }
}, { passive: false });
let sd = false, sx2 = 0, sv = 0;
strip.addEventListener('pointerdown', (e) => { sd = true; sx2 = e.clientX; sv = 0; strip.classList.add('grab'); });
window.addEventListener('pointerup', () => { sd = false; strip.classList.remove('grab'); });
strip.addEventListener('pointermove', (e) => {
  if (!sd) return;
  const dx = e.clientX - sx2; sx2 = e.clientX; sv = dx;
  strip.scrollLeft -= dx;
});

const swWrap = document.getElementById('swatches');
SWATCHES.forEach((s, i) => {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'sw' + (i === 0 ? ' on' : '');
  b.style.setProperty('--c', s.bg);
  b.innerHTML = '<i></i><span>' + s.name + '</span>';
  b.addEventListener('click', () => {
    swWrap.querySelectorAll('.sw').forEach((el) => el.classList.remove('on'));
    b.classList.add('on');
    tgtBg.set(s.bg); tgtKey.set(s.key); tgtKi = s.ki; tgtHi = s.hi;
    document.body.style.backgroundColor = s.bg;
  });
  swWrap.appendChild(b);
});

const io = new IntersectionObserver((es) => es.forEach((en) => {
  if (en.isIntersecting) en.target.classList.add('in');
}), { threshold: .3 });
document.querySelectorAll('.copy').forEach((c) => {
  Array.from(c.children).forEach((el, i) => el.style.setProperty('--k', i));
  io.observe(c);
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  stops = stopPos();
});

let prev = performance.now(), lastCw = 0;
function tick(now) {
  requestAnimationFrame(tick);
  const dt = Math.min(.05, (now - prev) / 1000); prev = now;
  t += (targetT() - t) * Math.min(1, dt * 4);
  const P = poses();
  const i = Math.min(P.length - 2, Math.floor(t));
  const f = smooth(Math.min(1, Math.max(0, t - i)));
  const A = P[i], B = P[i + 1];
  for (let k = 0; k < 4; k++) cur[k] += ((A[k] + (B[k] - A[k]) * f) - cur[k]) * Math.min(1, dt * 5);
  if (!dragging) { userRot += vel; vel *= .94; if (now - lastMove > 2200) auto += dt * .22; }
  tilt += (tiltT - tilt) * Math.min(1, dt * 4);
  if (wrap) {
    wrap.position.set(cur[0], cur[1], 0);
    wrap.scale.setScalar(cur[2]);
    wrap.rotation.y = cur[3] + userRot + auto;
    wrap.rotation.x = tilt * .4;
  }
  const ci = Math.min(5, Math.round(t));
  tgtBody.set(CW[ci].body); tgtTrim.set(CW[ci].trim); tgtRim.set(CW[ci].body);
  const label = t > 5.55 ? 'AIRBORNE' : (t < .45 ? 'AIRBORNE' : CW[ci].name);
  if (label !== giant.textContent) giant.textContent = label;
  giant.style.opacity = t > 5.55 ? .5 : 1;
  lastCw = ci;
  if (bodyMat) bodyMat.color.lerp(tgtBody, dt * 3);
  if (trimMat) trimMat.color.lerp(tgtTrim, dt * 3);
  rim.color.lerp(tgtRim, dt * 3);
  key.color.lerp(tgtKey, dt * 3);
  key.intensity += (tgtKi - key.intensity) * Math.min(1, dt * 3);
  hemi.intensity += (tgtHi - hemi.intensity) * Math.min(1, dt * 3);
  cursorL.position.set((cx - .5) * 3.6, .6 - (cy - .5) * 2.6, 2.4);
  camera.position.x += ((cx - .5) * .4 - camera.position.x) * Math.min(1, dt * 3);
  camera.position.y += ((.5 - (cy - .5) * .25) - camera.position.y) * Math.min(1, dt * 3);
  camera.lookAt(0, .15, 0);
  if (!sd && Math.abs(sv) > .1) { strip.scrollLeft -= sv; sv *= .94; }
  renderer.render(scene, camera);
}
let auto = 0;
requestAnimationFrame(tick);
