import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const cv = document.getElementById('gl');
const giant = document.getElementById('giant');
const body = document.body;

const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x08090B);
const bgT = new THREE.Color(0x08090B);
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
  { id: 'hero', model: 'shopify', giant: 'AIRBORNE', acc: '#EDEDEA', lk: '#FFFFFF', lf: '#FFFFFF', kick: '0XLEETV STUDIO', name: 'AIRBORNE', line: 'A Nike concept store, five legends deep. Real pairs, real geometry, one stage.', cta: 'DRAG TO SPIN. CLICK A SHOE TO KNOW MORE.', price: 'CONCEPT' },
  { id: 'aj1', model: 'aj1', giant: 'THE TEN', acc: '#E23B30', lk: '#FF7A66', lf: '#8A2E24', kick: 'OFF WHITE X AIR JORDAN 1, 2017', name: 'THE TEN', line: 'Virgil Abloh cut the 1985 Chicago Jordan open in 2017 and taped it back together. Zip tie still on.', cta: 'CLICK THE SHOE.', price: 'RETAIL $160' },
  { id: 'dunk', model: 'dunk', giant: 'BEAR', acc: '#4CB878', lk: '#7DE8A4', lf: '#2E7A50', kick: 'GRATEFUL DEAD X NIKE SB, 2020', name: 'THE GREEN BEAR', line: 'Fuzzy suede, a dancing bear on the tongue, and a stash pocket under it. July 2020.', cta: 'CLICK THE SHOE.', price: 'RETAIL $110' },
  { id: 'af1', model: 'af1', giant: 'AF1', acc: '#E58B35', lk: '#FFC078', lf: '#8A5A20', kick: 'NIKE AIR FORCE 1, 1982', name: 'THE FORCE', line: 'Bruce Kilgore, 1982. The first basketball shoe with Air under the heel. Still the uniform.', cta: 'CLICK THE SHOE.', price: 'RETAIL $115' },
  { id: 'travis', model: 'travis', giant: 'CACTUS', acc: '#D9C6A5', lk: '#F2E2C4', lf: '#8A7A55', kick: 'TRAVIS SCOTT X AIR FORCE 1, 2019', name: 'CACTUS JACK', line: 'Houston patchwork, corduroy, and a swoosh that comes off and flips. November 2019.', cta: 'CLICK THE SHOE.', price: 'RETAIL $160' },
  { id: 'peg', model: 'peg', giant: 'PEG 36', acc: '#3CE4D6', lk: '#7CF0E4', lf: '#1E8A80', kick: 'NIKE AIR ZOOM PEGASUS 36, 2019', name: 'THE 36TH', line: 'The running line since 1983. Zoom Air under engineered mesh. 36 turns in.', cta: 'CLICK THE SHOE.', price: 'RETAIL $120' },
  { id: 'stage', model: null, giant: '', acc: '#EDEDEA', lk: '#FFFFFF', lf: '#FFFFFF' }
];

const INFO = [
  { kick: 'AIRBORNE CONCEPT, 2026', name: 'THE CONCEPT', line: 'An original studio shoe that opens the store. Six colorways were never the point. Five legends are.', specs: [['YEAR', '2026'], ['SILHOUETTE', 'STUDIO CONCEPT'], ['STATUS', 'CONCEPT STUDY'], ['MODEL', 'SHOPIFY, CC BY 4.0']], more: 'One canvas, four light moods, no badging. The chips below retint the real geometry on stage.', cw: [['OG', null], ['SAIL', '#EFE6D8'], ['INK', '#3A4048'], ['RUST', '#C96A3B']] },
  { kick: 'OFF WHITE X AIR JORDAN 1, 2017', name: 'THE TEN', line: 'Virgil Abloh deconstructed the 1985 Chicago Jordan 1: cut leather, exposed foam, an industrial zip tie, Helvetica quotes. One of ten shoes that reset sneaker culture in 2017.', specs: [['YEAR', '2017'], ['SILHOUETTE', 'AIR JORDAN 1'], ['RETAIL', '$160'], ['DESIGNER', 'VIRGIL ABLOH']], more: 'Abloh restyled ten Nike icons for The Ten in 2017. This AJ1 kept its panels exposed, added a red zip tie and printed quotation marks around every word.', cw: [['OG', null], ['SAIL', '#EDE3CF'], ['INK', '#34383E'], ['RUST', '#C2503A']] },
  { kick: 'GRATEFUL DEAD X NIKE SB, 2020', name: 'THE GREEN BEAR', line: 'Fuzzy green faux fur, suede overlays, a jagged swoosh cut like the dancing bear chest, and a stash pocket hidden under the tongue. Released July 2020 in a trio.', specs: [['YEAR', '2020'], ['SILHOUETTE', 'SB DUNK LOW'], ['RETAIL', '$110'], ['ORIGIN', 'GRATEFUL DEAD']], more: 'The partnership nods to the band dancing bears. Three colorways landed in July 2020 and the green pair became one of the hardest SB Dunks to find at retail.', cw: [['OG', null], ['SAIL', '#EFE0C8'], ['INK', '#2E3238'], ['MOSS', '#6E7A4A']] },
  { kick: 'NIKE AIR FORCE 1, 1982', name: 'THE FORCE', line: 'Bruce Kilgore drew the first basketball shoe with Air under the heel. Baltimore shops kept it alive off court until it became the uniform it is now.', specs: [['YEAR', '1982'], ['SILHOUETTE', 'AIR FORCE 1 LOW'], ['RETAIL', '$115'], ['DESIGNER', 'BRUCE KILGORE']], more: 'Released in 1982, the AF1 was the first basketball shoe with Nike Air. Production paused in 1984 until Baltimore retailers brought it back, and it never left.', cw: [['OG', null], ['SAIL', '#EDE6D4'], ['INK', '#3A3D42'], ['RUST', '#C74A44']] },
  { kick: 'TRAVIS SCOTT X AIR FORCE 1, 2019', name: 'CACTUS JACK', line: 'Houston patchwork: corduroy, camo, NRG prints, and a removable swoosh that flips to reveal Cactus Jack underneath. November 2019.', specs: [['YEAR', '2019'], ['SILHOUETTE', 'AIR FORCE 1 LOW'], ['RETAIL', '$160'], ['ORIGIN', 'CACTUS JACK RECORDS']], more: 'The Cactus Jack AF1 carries a detachable swoosh that flips to reveal hidden branding. Corduroy and NRG prints pull straight from Houston.', cw: [['OG', null], ['MOCHA', '#8A6A4A'], ['SAIL', '#EFE4CC'], ['CACTUS', '#7A8C5A']] },
  { kick: 'NIKE AIR ZOOM PEGASUS 36, 2019', name: 'THE 36TH', line: 'The 36th turn of a line that started in 1983. Engineered mesh, exposed Flywire, Zoom Air under the forefoot. The workhorse.', specs: [['YEAR', '2019'], ['SILHOUETTE', 'AIR ZOOM PEGASUS'], ['RETAIL', '$120'], ['LINE SINCE', '1983']], more: 'The line started in 1983 and the 36 arrived in 2019 with engineered mesh, Cushlon foam and forefoot Zoom Air. Still the daily trainer benchmark.', cw: [['OG', null], ['GHOST', '#DDE2E6'], ['INK', '#2E3440'], ['FLAME', '#E0642F']] }
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
loader.setMeshoptDecoder(MeshoptDecoder);
const cache = {};
const queue = [];
let loadingNow = false;

function build(id, obj) {
  const g = new THREE.Group();
  const box = new THREE.Box3().setFromObject(obj);
  const s = box.getSize(new THREE.Vector3());
  const c = box.getCenter(new THREE.Vector3());
  const k = 2.35 / Math.max(s.x, s.z, .0001);
  obj.scale.setScalar(k);
  obj.position.set(-c.x * k, -c.y * k, -c.z * k);
  g.add(obj);
  const mats = [];
  obj.traverse(x => {
    if (!x.isMesh || !x.material) return;
    (Array.isArray(x.material) ? x.material : [x.material]).forEach(m => {
      if (m.color && !mats.some(q => q.m === m)) mats.push({ m, oc: m.color.clone() });
    });
  });
  g.userData.mats = mats;
  g.visible = false;
  scene.add(g);
  return g;
}

function pump() {
  if (loadingNow || !queue.length) return;
  const [id, done] = queue.shift();
  if (cache[id]) { done(cache[id]); return; }
  loadingNow = true;
  loader.load('assets/' + MODELS[id].file,
    gltf => { try { cache[id] = build(id, gltf.scene); done(cache[id]); } catch (e) { console.error('BUILDFAIL', id); } loadingNow = false; pump(); },
    undefined,
    () => { console.error('LOADFAIL', id); loadingNow = false; pump(); });
}
function requestModel(id, done) {
  if (cache[id]) { done(cache[id]); return; }
  queue.push([id, done]); pump();
}

let cur = null, curId = null, prev = null;
let phase = 0, phaseT = 0; // 0 steady, 1 the old pair exits, 2 the new pair enters
const EXIT_DUR = .38, ENTER_DUR = 1.05;
const cwSel = {};

function swapTo(id) {
  if (!cache[id] || curId === id) return;
  if (cur && cur !== cache[id]) { prev = cur; }
  cur = cache[id]; curId = id;
  cur.visible = !prev;
  applyTint(cwSel[id] || null);
  phase = prev ? 1 : 2; phaseT = 0;
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
let curSize = null, bagTimer = 0;
function applyTint(hex) {
  if (!cur || !cur.userData.mats) return;
  cur.userData.mats.forEach(x => x.m.color.copy(hex ? new THREE.Color(hex) : x.oc));
}
function openInfo(i) {
  const d = INFO[i]; if (!d) return;
  document.getElementById('dkick').textContent = d.kick;
  document.getElementById('dname').textContent = d.name;
  document.getElementById('dline').textContent = d.line;
  document.getElementById('dmore').textContent = d.more || '';
  const sp = document.getElementById('dspecs'); sp.innerHTML = '';
  d.specs.forEach(([k, v]) => { const el = document.createElement('div'); el.innerHTML = '<b>' + k + '</b>' + v; sp.appendChild(el); });
  const cwEl = document.getElementById('dcw'); cwEl.innerHTML = '';
  const selHex = cwSel[ACTS[i].model] !== undefined ? cwSel[ACTS[i].model] : null;
  (d.cw || []).forEach(([nm, hex], k) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'cw' + ((hex || null) === selHex ? ' on' : '');
    b.innerHTML = '<i style="background:' + (hex || '#B9BDC4') + '"></i>' + nm;
    b.addEventListener('click', () => {
      cwEl.querySelectorAll('.cw').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      cwSel[curId] = hex || null;
      applyTint(hex);
    });
    cwEl.appendChild(b);
  });
  applyTint(selHex);
  const szEl = document.getElementById('dsz'); szEl.innerHTML = '';
  curSize = null;
  ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13'].forEach(s => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'sz'; b.textContent = s;
    b.addEventListener('click', () => {
      curSize = s;
      szEl.querySelectorAll('.sz').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
    });
    szEl.appendChild(b);
  });
  document.getElementById('dprice').textContent = ACTS[i].price || '';
  const bag = document.getElementById('dbag'); bag.textContent = 'ADD TO BAG';
  clearTimeout(bagTimer);
  bag.onclick = () => {
    bag.textContent = curSize ? 'ADDED' : 'PICK A SIZE';
    clearTimeout(bagTimer);
    bagTimer = setTimeout(() => { bag.textContent = 'ADD TO BAG'; }, 1300);
  };
  document.getElementById('dnote').textContent = '3D MODELS FROM PUBLIC LIBRARIES. CONCEPT STUDY, NOT AFFILIATED WITH NIKE, INC.';
  detail.style.setProperty('--acc', ACTS[i].acc);
  detail.classList.add('open'); dback.classList.add('on');
  document.body.classList.add('lock');
  detail.setAttribute('aria-hidden', 'false');
}
function actIdxOfCur() {
  const k = ACTS.findIndex(a => a.model === curId);
  return k >= 0 ? k : Math.min(gi, INFO.length - 1);
}
function closeInfo() {
  detail.classList.remove('open'); dback.classList.remove('on');
  document.body.classList.remove('lock');
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
    swatchSel = [l[1], l[2], l[3]];
    keyT.set(l[1]); fillT.set(l[2]); key.color.set(l[1]); fill.color.set(l[2]); renderer.toneMappingExposure = l[3];
    bgT.set(l[1]).lerp(new THREE.Color(0x08090B), .84);
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

let gi = 0, vG = 0, lastVG = 0, vgVel = 0;
let giantHold = null, giantHoldOn = true, giantTimer = 0;
function setGiant(txt, on) {
  if (giantHold === txt && giantHoldOn === on) return;
  giantHold = txt; giantHoldOn = on;
  giant.style.opacity = 0;
  clearTimeout(giantTimer);
  giantTimer = setTimeout(() => { giant.textContent = txt; giant.style.opacity = on ? 1 : 0; }, 260);
}

let accTarget = new THREE.Color(0xEDEDEA);
let keyT = new THREE.Color(0xFFFFFF), fillT = new THREE.Color(0xFFFFFF);
let swatchSel = ['#FFFFFF', '#FFFFFF', 1.12];
function onScroll() {
  const v = scrollY / actH;
  const i = Math.min(6, Math.max(0, Math.floor(v)));
  const f = Math.max(0, Math.min(1, v - i));
  vG = i + f;
  if (i !== gi) {
    closeInfo();
    gi = i;
    const a = ACTS[i];
    body.style.setProperty('--acc', a.acc);
    accTarget.set(a.acc);
    const BASE = new THREE.Color(0x08090B);
    if (i === 6) { keyT.set(swatchSel[0]); fillT.set(swatchSel[1]); renderer.toneMappingExposure = swatchSel[2]; bgT.set(swatchSel[0]).lerp(BASE, .84); }
    else if (i === 0) { keyT.set(a.lk); fillT.set(a.lf); bgT.set(BASE); }
    else { keyT.set(a.lk); fillT.set(a.lf); bgT.set(a.acc).lerp(BASE, .86); }
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
  const vgInst = (vG - lastVG) / Math.max(dt, .001);
  vgVel += (vgInst - vgVel) * Math.min(1, dt * 8);
  lastVG = vG;
  if (Math.abs(vgVel) < 3 && cache[ACTS[desired].model] && curId !== ACTS[desired].model) swapTo(ACTS[desired].model);

  if (phase === 1) {
    phaseT += dt / EXIT_DUR;
    if (prev) {
      prev.position.y -= dt * 2.0;
      prev.scale.multiplyScalar(Math.max(.0001, 1 - dt * 4.6));
      prev.rotation.y += dt * 6.5;
      if (prev.scale.x < .02 || phaseT >= 1) { prev.visible = false; prev = null; }
    }
    if (!prev && phaseT >= .5) { cur.visible = true; phase = 2; phaseT = 0; }
  }
  if (phase === 2) {
    phaseT += dt / ENTER_DUR;
    if (phaseT >= 1) { phase = 0; phaseT = 0; }
  }

  if (cur) {
    const p = poseAt(Math.min(gi, POSE.length - 1), vG - Math.floor(vG));
    const tp = phase === 2 ? Math.min(1, phaseT) : 1;
    let scMul = 1, dropY = 0, sweep = 0;
    if (phase === 2) {
      const e = 1 - Math.pow(1 - tp, 3);
      const c1 = 1.35, c3 = c1 + 1;
      scMul = 1 + c3 * Math.pow(tp - 1, 3) + c1 * Math.pow(tp - 1, 2);
      dropY = (1 - e) * 1.35;
      sweep = (1 - e) * -3.2;
    }
    cur.position.set(p[0], p[1] + dropY + Math.sin(now * .8) * .025, p[2]);
    cur.rotation.set(p[3] + rotX, p[4] + rotU + sweep + Math.sin(now * .35) * .03, p[5]);
    const sc = Math.max(.0001, scMul) * p[6];
    cur.scale.setScalar(sc);
  }

  rim.color.lerp(accTarget, dt * 1.8);
  key.color.lerp(keyT, dt * 1.8);
  fill.color.lerp(fillT, dt * 1.8);
  scene.background.lerp(bgT, dt * 1.8);
  cam.position.x += ((nx * .28) - cam.position.x) * dt * 4;
  cam.position.y += ((.55 + ny * .16) - cam.position.y) * dt * 4;
  cam.lookAt(0, .35, 0);
  cursorL.position.set(nx * 3.4, ny * 2 + .6, 2.1);
  if (!dragging) rotU *= (1 - dt * 1.6);
  renderer.render(scene, cam);
}
tick();
