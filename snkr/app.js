import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const cv = document.getElementById('gl');
const giant = document.getElementById('giant');
const body = document.body;

const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;

const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(36, 1, .1, 80);
cam.position.set(0, .55, 4.7);

scene.add(new THREE.HemisphereLight(0xffffff, 0x191b20, 1.05));
const key = new THREE.DirectionalLight(0xffffff, 2.1); key.position.set(2.5, 3, 2.5); scene.add(key);
const fill = new THREE.DirectionalLight(0xffffff, .55); fill.position.set(-2.5, .5, 1.5); scene.add(fill);
const rim = new THREE.DirectionalLight(0xEDEDEA, 2.4); rim.position.set(-1.5, 2, -2.5); scene.add(rim);
const cursorL = new THREE.PointLight(0xffffff, 14, 6, 2); cursorL.position.set(0, 1, 2.2); scene.add(cursorL);

const MODELS = {
  shopify: { file: 'shoe2.glb' },
  aj1: { file: 'offwhite_jordan.glb' },
  dunk: { file: 'dunk.glb' },
  af1: { file: 'airforce1.glb' },
  travis: { file: 'travisAF1.glb' },
  peg: { file: 'pegasus.glb' }
};

const ACTS = [
  { id: 'hero', model: 'shopify', giant: 'AIRBORNE', acc: '#EDEDEA', kick: '0XLEETV STUDIO', name: 'AIRBORNE', line: 'A Nike concept store, five legends deep. Real pairs, real geometry, one stage.', cta: 'DRAG TO SPIN. CLICK A SHOE TO KNOW MORE.', price: 'CONCEPT' },
  { id: 'aj1', model: 'aj1', giant: 'THE TEN', acc: '#E23B30', kick: 'OFF WHITE X AIR JORDAN 1, 2017', name: 'THE TEN', line: 'Virgil Abloh cut the 1985 Chicago Jordan open in 2017 and taped it back together. Zip tie still on.', cta: 'CLICK THE SHOE.', price: 'RETAIL $160' },
  { id: 'dunk', model: 'dunk', giant: 'BEAR', acc: '#4CB878', kick: 'GRATEFUL DEAD X NIKE SB, 2020', name: 'THE GREEN BEAR', line: 'Fuzzy suede, a dancing bear on the tongue, and a stash pocket under it. July 2020.', cta: 'CLICK THE SHOE.', price: 'RETAIL $110' },
  { id: 'af1', model: 'af1', giant: 'AF1', acc: '#E58B35', kick: 'NIKE AIR FORCE 1, 1982', name: 'THE FORCE', line: 'Bruce Kilgore, 1982. The first basketball shoe with Air under the heel. Still the uniform.', cta: 'CLICK THE SHOE.', price: 'RETAIL $115' },
  { id: 'travis', model: 'travis', giant: 'CACTUS', acc: '#D9C6A5', kick: 'TRAVIS SCOTT X AIR FORCE 1, 2019', name: 'CACTUS JACK', line: 'Houston patchwork, corduroy, and a swoosh that comes off and flips. November 2019.', cta: 'CLICK THE SHOE.', price: 'RETAIL $160' },
  { id: 'peg', model: 'peg', giant: 'PEG 36', acc: '#3CE4D6', kick: 'NIKE AIR ZOOM PEGASUS 36, 2019', name: 'THE 36TH', line: 'The running line since 1983. Zoom Air under engineered mesh. 36 turns in.', cta: 'CLICK THE SHOE.', price: 'RETAIL $120' },
  { id: 'stage', model: null, giant: '', acc: '#EDEDEA' }
];

const INFO = [
  { kick: 'AIRBORNE CONCEPT, 2026', name: 'THE CONCEPT', line: 'An original studio shoe that opens the store. Six colorways were never the point. Five legends are.', specs: [['YEAR', '2026'], ['SILHOUETTE', 'STUDIO CONCEPT'], ['STATUS', 'CONCEPT STUDY'], ['MODEL', 'SHOPIFY, CC BY 4.0']] },
  { kick: 'OFF WHITE X AIR JORDAN 1, 2017', name: 'THE TEN', line: 'Virgil Abloh deconstructed the 1985 Chicago Jordan 1: cut leather, exposed foam, an industrial zip tie, Helvetica quotes. One of ten shoes that reset sneaker culture in 2017.', specs: [['YEAR', '2017'], ['SILHOUETTE', 'AIR JORDAN 1'], ['RETAIL', '$160'], ['DESIGNER', 'VIRGIL ABLOH']] },
  { kick: 'GRATEFUL DEAD X NIKE SB, 2020', name: 'THE GREEN BEAR', line: 'Fuzzy green faux fur, suede overlays, a jagged swoosh cut like the dancing bear chest, and a stash pocket hidden under the tongue. Released July 2020 in a trio.', specs: [['YEAR', '2020'], ['SILHOUETTE', 'SB DUNK LOW'], ['RETAIL', '$110'], ['ORIGIN', 'GRATEFUL DEAD']] },
  { kick: 'NIKE AIR FORCE 1, 1982', name: 'THE FORCE', line: 'Bruce Kilgore drew the first basketball shoe with Air under the heel. Baltimore shops kept it alive off court until it became the uniform it is now.', specs: [['YEAR', '1982'], ['SILHOUETTE', 'AIR FORCE 1 LOW'], ['RETAIL', '$115'], ['DESIGNER', 'BRUCE KILGORE']] },
  { kick: 'TRAVIS SCOTT X AIR FORCE 1, 2019', name: 'CACTUS JACK', line: 'Houston patchwork: corduroy, camo, NRG prints, and a removable swoosh that flips to reveal Cactus Jack underneath. November 2019.', specs: [['YEAR', '2019'], ['SILHOUETTE', 'AIR FORCE 1 LOW'], ['RETAIL', '$160'], ['ORIGIN', 'CACTUS JACK RECORDS']] },
  { kick: 'NIKE AIR ZOOM PEGASUS 36, 2019', name: 'THE 36TH', line: 'The 36th turn of a line that started in 1983. Engineered mesh, exposed Flywire, Zoom Air under the forefoot. The workhorse.', specs: [['YEAR', '2019'], ['SILHOUETTE', 'AIR ZOOM PEGASUS'], ['RETAIL', '$120'], ['LINE SINCE', '1983']] }
];

const POSE = [
  [.95, -.02, 0, .45, -.55, .12, 1],
  [-.85, .05, 0, .25, .35, .06, 1],
  [.85, 0, 0, .2, -.3, .05, 1],
  [-.85, -.02, 0, .3, 2.7, .1, 1],
  [.85, .03, 0, .35, -2.5, .12, 1],
  [-.85, .05, 0, .3, 2.2, .05, 1],
  [0, -.1, 0, .3, 2.2, 0, 1]
];

const mob = matchMedia('(max-width: 720px)').matches;
const MS = mob ? .62 : 1;
const MX = mob ? .3 : 1;
const MY = mob ? .5 : 0;

const loader = new GLTFLoader();
const cache = {};
const queue = [];

function build(id, obj) {
  const g = new THREE.Group();
  const box = new THREE.Box3().setFromObject(obj);
  const s = box.getSize(new THREE.Vector3());
  const c = box.getCenter(new THREE.Vector3());
  const k = 2.35 / Math.max(s.x, s.z, .0001);
  obj.scale.setScalar(k);
  obj.position.set(-c.x * k, -c.y * k, -c.z * k);
  g.add(obj);
  g.visible = false;
  scene.add(g);
  return g;
}

function pump() {
  while (queue.length) {
    const [id, done] = queue.shift();
    if (cache[id]) { done(cache[id]); continue; }
    loader.load('assets/' + MODELS[id].file,
      gltf => { try { cache[id] = build(id, gltf.scene); done(cache[id]); } catch (e) { console.error('BUILDFAIL', id); } },
      undefined,
      () => { console.error('LOADFAIL', id); });
  }
}
function requestModel(id, done) {
  if (cache[id]) { done(cache[id]); return; }
  queue.push([id, done]); pump();
}

let cur = null, curId = null, prev = null;
let phase = 2, phaseT = 0;
const PHASE_DUR = .62;

function swapTo(id) {
  if (!cache[id] || curId === id) return;
  if (cur && cur !== cache[id]) { prev = cur; }
  cur = cache[id]; curId = id;
  cur.visible = true;
  phase = 1; phaseT = 0;
  rotU = 0;
}

const easeIO = f => f * f * (3 - 2 * f);

function poseAt(i, f) {
  const a = POSE[i];
  const b = POSE[Math.min(POSE.length - 1, i + 1)];
  const h = easeIO(f);
  const L = (x, y) => x + (y - x) * h;
  return [L(a[0], b[0]) * MX, L(a[1], b[1]) + MY, L(a[2], b[2]), L(a[3], b[3]), L(a[4], b[4]), L(a[5], b[5]), L(a[6], b[6]) * MS];
}

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h);
  cam.aspect = w / h;
  cam.updateProjectionMatrix();
  measure();
}
addEventListener('resize', resize);

let nx = 0, ny = 0;
addEventListener('pointermove', e => {
  nx = (e.clientX / innerWidth) * 2 - 1;
  ny = -((e.clientY / innerHeight) * 2 - 1);
});

let dX = 0, dY = 0, moved = 0, rotX = 0, rotU = 0, dragging = false;
addEventListener('pointerdown', e => {
  if (e.target.closest('button, a, #detail, #dback, #rooms, #intro')) return;
  dragging = true; moved = 0; dX = e.clientX; dY = e.clientY;
});
addEventListener('pointermove', e => {
  if (!dragging) return;
  const dx = e.clientX - dX, dy = e.clientY - dY;
  moved += Math.abs(dx) + Math.abs(dy);
  rotU += dx * .006;
  rotX = Math.max(-.5, Math.min(.5, rotX + dy * .004));
  dX = e.clientX; dY = e.clientY;
});
addEventListener('pointerup', e => {
  if (!dragging) return;
  dragging = false;
  if (moved < 7 && cur) {
    const r = cv.getBoundingClientRect();
    const p = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    const ray = new THREE.Raycaster(); ray.setFromCamera(p, cam);
    const hitMesh = ray.intersectObject(cur, true).length > 0;
    const center = new THREE.Vector3(); cur.getWorldPosition(center);
    const near = ray.ray.distanceToPoint(center) < 1.15;
    if (hitMesh || near) openInfo(actIdxOfCur());
  }
});

const dback = document.getElementById('dback');
const detail = document.getElementById('detail');
function openInfo(i) {
  const d = INFO[i]; if (!d) return;
  document.getElementById('dkick').textContent = d.kick;
  document.getElementById('dname').textContent = d.name;
  document.getElementById('dline').textContent = d.line;
  const sp = document.getElementById('dspecs'); sp.innerHTML = '';
  d.specs.forEach(([k, v]) => { const el = document.createElement('div'); el.innerHTML = '<b>' + k + '</b>' + v; sp.appendChild(el); });
  const pal = document.getElementById('dpal'); pal.innerHTML = '';
  [ACTS[i].acc, '#EDEDEA', '#3A3F47'].forEach(c => { const dot = document.createElement('i'); dot.style.background = c; pal.appendChild(dot); });
  document.getElementById('dnote').textContent = '3D MODELS FROM PUBLIC LIBRARIES. CONCEPT STUDY, NOT AFFILIATED WITH NIKE, INC.';
  detail.style.setProperty('--acc', ACTS[i].acc);
  detail.classList.add('open'); dback.classList.add('on');
  detail.setAttribute('aria-hidden', 'false');
}
function actIdxOfCur() {
  const k = ACTS.findIndex(a => a.model === curId);
  return k >= 0 ? k : Math.min(gi, INFO.length - 1);
}
function closeInfo() {
  detail.classList.remove('open'); dback.classList.remove('on');
  detail.setAttribute('aria-hidden', 'true');
}
document.getElementById('dclose').addEventListener('click', closeInfo);
dback.addEventListener('click', closeInfo);

const sw = document.getElementById('swatches');
const LIGHTS = [
  ['STUDIO', '#FFFFFF', '#FFFFFF', 1.12],
  ['COURT', '#FFB46B', '#FFD9A0', 1.2],
  ['MIDNIGHT', '#6E8BFF', '#B9C6FF', 1.05],
  ['DAYBREAK', '#FF8A5C', '#FFC98F', 1.18]
];
LIGHTS.forEach((l, i) => {
  const b = document.createElement('button');
  b.className = 'sw' + (i === 0 ? ' on' : '');
  b.innerHTML = '<i style="--c:' + l[1] + '"></i><span>' + l[0] + '</span>';
  b.addEventListener('click', () => {
    document.querySelectorAll('.sw').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    key.color.set(l[1]); fill.color.set(l[2]); renderer.toneMappingExposure = l[3];
  });
  sw.appendChild(b);
});

const roomsEl = document.getElementById('rooms');
const roomBtns = [];
ACTS.forEach((a, k) => {
  const b = document.createElement('button');
  b.textContent = k === 6 ? 'STAGE' : a.giant;
  b.addEventListener('click', () => scrollTo({ top: k * actH, behavior: 'smooth' }));
  roomsEl.appendChild(b); roomBtns.push(b);
});

const io = new IntersectionObserver(es => {
  es.forEach(en => { if (en.isIntersecting) en.target.classList.add('in'); });
}, { threshold: .3 });
document.querySelectorAll('.copy').forEach(c => io.observe(c));

const secs = [...document.querySelectorAll('main > section')];
let actH = 1;
function measure() {
  actH = Math.max(1, secs[0].offsetHeight);
}

let gi = 0, vG = 0;
let giantHold = null, giantHoldOn = true, giantTimer = 0;
function setGiant(txt, on) {
  if (giantHold === txt && giantHoldOn === on) return;
  giantHold = txt; giantHoldOn = on;
  giant.style.opacity = 0;
  clearTimeout(giantTimer);
  giantTimer = setTimeout(() => { giant.textContent = txt; giant.style.opacity = on ? 1 : 0; }, 260);
}

let accTarget = new THREE.Color(0xEDEDEA);
function onScroll() {
  const v = scrollY / actH;
  const i = Math.min(6, Math.max(0, Math.floor(v)));
  const f = Math.max(0, Math.min(1, v - i));
  vG = i + f;
  if (i !== gi) {
    gi = i;
    const a = ACTS[i];
    body.style.setProperty('--acc', a.acc);
    accTarget.set(a.acc);
    roomBtns.forEach((b, k) => b.classList.toggle('on', k === i));
  }
  setGiant(ACTS[i].giant, i < 6);
}
addEventListener('scroll', onScroll, { passive: true });

const intro = document.getElementById('intro');
const ibarf = document.getElementById('ibarf');
const ienter = document.getElementById('ienter');
let loadedN = 0;
function bootTick() {
  loadedN++;
  ibarf.style.width = Math.min(100, (loadedN / 6) * 100) + '%';
  ienter.textContent = 'LOADING THE PAIRS ' + loadedN + '/6';
  if (loadedN >= 6) openDoor();
}
function openDoor() {
  if (!ienter.disabled) return;
  ienter.disabled = false;
  ienter.textContent = 'ENTER THE STORE';
}
const ib = document.getElementById('ib');
'AIRBORNE'.split('').forEach((ch, i) => {
  const s = document.createElement('span');
  s.textContent = ch;
  s.style.animationDelay = (200 + i * 75) + 'ms';
  ib.appendChild(s);
});
ienter.addEventListener('click', () => {
  intro.classList.add('off');
  body.style.overflow = '';
  setTimeout(() => intro.remove(), 800);
});
setTimeout(openDoor, 14000);

body.style.overflow = 'hidden';
resize();
onScroll();
requestModel('shopify', g => { swapTo('shopify'); bootTick(); cv.style.opacity = 1; openDoor(); });
['aj1', 'dunk', 'af1', 'travis', 'peg'].forEach(id => requestModel(id, bootTick));

const clock = new THREE.Clock();
function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(.05, clock.getDelta());
  const now = clock.elapsedTime;

  for (const idk in cache) { if (cache[idk] !== cur && cache[idk] !== prev) cache[idk].visible = false; }

  let desired = 0;
  for (let k = 1; k <= 5; k++) if (vG >= k - .12) desired = k;
  if (desired && cache[ACTS[desired].model] && curId !== ACTS[desired].model) swapTo(ACTS[desired].model);

  if (phase === 1) {
    phaseT += dt / PHASE_DUR;
    if (phaseT >= 1) { phase = 2; if (prev) prev.visible = false; prev = null; }
  }

  if (cur) {
    const p = poseAt(Math.min(gi, POSE.length - 1), vG - Math.floor(vG));
    const tp = phase === 1 ? Math.min(1, phaseT) : 1;
    const inE = 1 - Math.pow(1 - Math.min(1, tp * 1.15), 3);
    cur.position.set(p[0], p[1] + Math.sin(now * .8) * .025, p[2]);
    cur.rotation.set(p[3] + rotX, p[4] + rotU + Math.sin(now * .35) * .03, p[5]);
    const sc = (phase === 1 ? inE : 1) * p[6];
    cur.scale.setScalar(Math.max(.0001, sc));
    if (phase !== 1 && prev) {
      prev.scale.multiplyScalar(Math.max(.0001, 1 - dt * 4.5));
      prev.rotation.y += dt * 2.2;
      if (prev.scale.x < .02) { prev.visible = false; prev = null; }
    }
  }

  rim.color.lerp(accTarget, dt * 3);
  cam.position.x += ((nx * .28) - cam.position.x) * dt * 4;
  cam.position.y += ((.55 + ny * .16) - cam.position.y) * dt * 4;
  cam.lookAt(0, .35, 0);
  cursorL.position.set(nx * 3.4, ny * 2 + .6, 2.1);
  if (!dragging) rotU *= (1 - dt * 1.6);
  renderer.render(scene, cam);
}
tick();
