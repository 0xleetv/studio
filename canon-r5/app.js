import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/RoomEnvironment.js';

/* =========================================================================
   CANON EOS R5 MARK II | HIGH END PRODUCT DISSECTION
   Cinematic 360 spin intro, 3-movement staged dissection, frosted glass panels.
   ========================================================================= */

// Check WebGL availability
function checkWebGLSupport() {
  try {
    const cv = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (cv.getContext('webgl') || cv.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

if (!checkWebGLSupport()) {
  const fallback = document.getElementById('webgl-fallback');
  if (fallback) fallback.style.display = 'flex';
  throw new Error('WebGL hardware acceleration unavailable');
}

// DOM Elements
const canvas = document.getElementById('webgl-canvas');
const brandHeader = document.getElementById('brand-header');
const heroOverlay = document.getElementById('hero-overlay');
const introLines = [
  { id: 'intro-line-1', min: 0.00, max: 0.07, dom: document.getElementById('intro-line-1') },
  { id: 'intro-line-2', min: 0.07, max: 0.14, dom: document.getElementById('intro-line-2') },
  { id: 'intro-line-3', min: 0.14, max: 0.21, dom: document.getElementById('intro-line-3') },
  { id: 'intro-line-4', min: 0.21, max: 0.25, dom: document.getElementById('intro-line-4') }
];

const introLinesOverlay = document.getElementById('intro-lines-overlay');
const annotationsOverlay = document.getElementById('annotations-overlay');

const specScrim = document.getElementById('spec-scrim');
const specStage = document.getElementById('spec-stage');
const specGroups = [
  { id: 'spec-group-core', threshold: 0.882, dom: document.getElementById('spec-group-core') },
  { id: 'spec-group-capture', threshold: 0.896, dom: document.getElementById('spec-group-capture') },
  { id: 'spec-group-interface', threshold: 0.910, dom: document.getElementById('spec-group-interface') },
  { id: 'spec-group-body', threshold: 0.924, dom: document.getElementById('spec-group-body') }
];
const notableRows = [
  { id: 'notable-0', threshold: 0.940, dom: document.getElementById('notable-0') },
  { id: 'notable-1', threshold: 0.950, dom: document.getElementById('notable-1') },
  { id: 'notable-2', threshold: 0.960, dom: document.getElementById('notable-2') }
];
const closingSettlement = document.getElementById('closing-settlement');
const leaderDot = document.getElementById('leader-dot');
const leaderLine = document.getElementById('leader-line');
let previousStageIdx = -1;

const stageElements = [
  { id: 'ann-optical', min: 0.25, max: 0.35, dom: document.getElementById('ann-optical') },
  { id: 'ann-iris', min: 0.35, max: 0.45, dom: document.getElementById('ann-iris') },
  { id: 'ann-chassis', min: 0.45, max: 0.55, dom: document.getElementById('ann-chassis') },
  { id: 'ann-thermal', min: 0.55, max: 0.65, dom: document.getElementById('ann-thermal') },
  { id: 'ann-sensor', min: 0.65, max: 0.85, dom: document.getElementById('ann-sensor') }
];

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 1. PERFORMANCE ENGINE: CAP PIXEL RATIO AT 1.25 MAXIMUM
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: 'high-performance'
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.55;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Scene & Studio Atmosphere
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101216);
scene.fog = new THREE.FogExp2(0x101216, 0.032);

// Perspective Camera
const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(3.4, 1.4, 4.6);

// RoomEnvironment for realistic studio reflections
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();
const roomEnv = new RoomEnvironment();
scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;

/* =========================================================================
   STUDIO ENVIRONMENT: CYC WALL, METALLIC FLOOR & CONTACT SHADOW
   ========================================================================= */
const floorGeo = new THREE.PlaneGeometry(36, 36, 16, 16);
floorGeo.rotateX(-Math.PI / 2);
const floorMat = new THREE.MeshStandardMaterial({
  color: 0x14161a,
  roughness: 0.40,
  metalness: 0.25,
  envMapIntensity: 0.85
});
const floorMesh = new THREE.Mesh(floorGeo, floorMat);
floorMesh.position.y = -1.75;
floorMesh.receiveShadow = true;
scene.add(floorMesh);

const cycGeo = new THREE.CylinderGeometry(24, 24, 20, 36, 1, true, -Math.PI * 0.5, Math.PI);
const cycMat = new THREE.MeshStandardMaterial({
  color: 0x101216,
  roughness: 0.8,
  metalness: 0.1,
  side: THREE.BackSide
});
const cycMesh = new THREE.Mesh(cycGeo, cycMat);
cycMesh.position.set(0, 6.0, -8.0);
cycMesh.rotation.y = Math.PI;
scene.add(cycMesh);

// Preallocated soft contact shadow
function createContactShadowTexture() {
  const size = 512;
  const cv = document.createElement('canvas');
  cv.width = size;
  cv.height = size;
  const ctx = cv.getContext('2d');
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 10, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
  gradient.addColorStop(0.35, 'rgba(0, 0, 0, 0.55)');
  gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.15)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(cv);
}
const shadowPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(5.2, 4.4),
  new THREE.MeshBasicMaterial({
    map: createContactShadowTexture(),
    transparent: true,
    opacity: 0.75,
    depthWrite: false
  })
);
shadowPlane.rotation.x = -Math.PI / 2;
shadowPlane.position.set(0, -1.74, 0.3);
scene.add(shadowPlane);

/* =========================================================================
   STUDIO LIGHTING
   ========================================================================= */
const keyLight = new THREE.DirectionalLight(0xf2f6ff, 3.2);
keyLight.position.set(-6.0, 8.0, 6.0);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 1024;
keyLight.shadow.mapSize.height = 1024;
keyLight.shadow.camera.near = 2;
keyLight.shadow.camera.far = 24;
keyLight.shadow.camera.left = -4;
keyLight.shadow.camera.right = 4;
keyLight.shadow.camera.top = 4;
keyLight.shadow.camera.bottom = -4;
keyLight.shadow.bias = -0.0005;
scene.add(keyLight);

const amberRim1 = new THREE.DirectionalLight(0xffa244, 2.8);
amberRim1.position.set(6.5, 4.2, -6.0);
scene.add(amberRim1);

const amberRim2 = new THREE.DirectionalLight(0xffbe66, 1.8);
amberRim2.position.set(-6.0, 3.5, -7.0);
scene.add(amberRim2);

const tealAccent = new THREE.PointLight(0x22eeff, 2.4, 18);
tealAccent.position.set(-4.0, 0.2, 3.0);
scene.add(tealAccent);

const frontSweep = new THREE.DirectionalLight(0xffffff, 2.2);
frontSweep.position.set(3.5, 4.5, 7.5);
scene.add(frontSweep);

/* =========================================================================
   PBR TEXTURE LOADER & BAKED DECALS
   ========================================================================= */
const isMobile = window.innerWidth <= 768;
const texSuffix = isMobile ? '_1024.webp' : '.webp';
const textureLoader = new THREE.TextureLoader();
const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

function loadPBRTexture(filename, repeatX = 1, repeatY = 1) {
  const tex = textureLoader.load(`./assets/textures/${filename}${texSuffix}`);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

const leatheretteNormal = loadPBRTexture('leatherette_normal', 6, 6);
const leatheretteRoughness = loadPBRTexture('leatherette_roughness', 6, 6);
const knurlingBump = loadPBRTexture('knurling_bump', 16, 1);
const sensorWaferMap = loadPBRTexture('sensor_wafer', 1, 1);
const sensorWaferRoughness = loadPBRTexture('sensor_wafer_roughness', 1, 1);
const brushedMetalMap = loadPBRTexture('brushed_metal', 3, 3);
const brushedMetalRoughness = loadPBRTexture('brushed_metal_roughness', 3, 3);

// Baked Lens Barrel Typography Decal Texture (baked once at init)
function createLensDecalTexture() {
  const cv = document.createElement('canvas');
  cv.width = 1024;
  cv.height = 128;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#15171a';
  ctx.fillRect(0, 0, cv.width, cv.height);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '4px';
  ctx.fillText('CANON LENS RF 50mm F1.2 L USM', 512, 64);

  // Red accent dot
  ctx.fillStyle = '#d10818';
  ctx.beginPath();
  ctx.arc(180, 64, 6, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}
const lensDecalTexture = createLensDecalTexture();

/* =========================================================================
   PBR MATERIALS LIBRARY
   ========================================================================= */
const materials = {
  // Magnesium Monocoque Body with Brushed Metal Grain
  magnesium: new THREE.MeshPhysicalMaterial({
    color: 0x24272c,
    map: brushedMetalMap,
    roughnessMap: brushedMetalRoughness,
    metalness: 0.75,
    roughness: 0.46,
    clearcoat: 0.16,
    clearcoatRoughness: 0.35
  }),
  // Ergonomic Grip with Realistic Pebble Leatherette Normal & Roughness
  rubberGrip: new THREE.MeshStandardMaterial({
    color: 0x141518,
    normalMap: leatheretteNormal,
    normalScale: new THREE.Vector2(1.2, 1.2),
    roughnessMap: leatheretteRoughness,
    roughness: 0.88,
    metalness: 0.06
  }),
  // Signature Canon Anodized Red Ring
  anodizedRed: new THREE.MeshPhysicalMaterial({
    color: 0xd10818,
    metalness: 0.92,
    roughness: 0.15,
    clearcoat: 0.9,
    clearcoatRoughness: 0.1
  }),
  // Stainless Steel Bayonet Mount with Brushed Anisotropic Finish
  stainlessSteel: new THREE.MeshPhysicalMaterial({
    color: 0xe5eaf2,
    map: brushedMetalMap,
    roughnessMap: brushedMetalRoughness,
    metalness: 0.96,
    roughness: 0.16,
    clearcoat: 0.65
  }),
  // Knurled Metal Dials & Control Rings with Precision Machined Ridges
  metalDial: new THREE.MeshStandardMaterial({
    color: 0x282b30,
    bumpMap: knurlingBump,
    bumpScale: 0.05,
    metalness: 0.85,
    roughness: 0.32
  }),
  // Dark Matte Barrel
  lensBarrel: new THREE.MeshStandardMaterial({
    color: 0x15171a,
    bumpMap: knurlingBump,
    bumpScale: 0.04,
    roughness: 0.62,
    metalness: 0.55
  }),
  // Lens Barrel Markings Decal Material
  lensDecal: new THREE.MeshBasicMaterial({
    map: lensDecalTexture
  }),
  // Multi-Coated Refractive Optical Fluorite Glass with Spectral Thin-Film Sheen
  fluoriteGlass: new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 0.96,
    opacity: 1.0,
    transparent: true,
    roughness: 0.02,
    ior: 1.54,
    thickness: 0.55,
    specularColor: new THREE.Color(0x8aeaff), // Multi-layer anti-reflective cyan/magenta sheen
    specularIntensity: 1.5,
    attenuationColor: new THREE.Color(0xfde8ff), // Violet/magenta fringe
    attenuationDistance: 1.8,
    iridescence: 0.72,
    iridescenceIOR: 1.38,
    iridescenceThicknessRange: [220, 480], // Optical wave interference
    clearcoat: 0.35,
    clearcoatRoughness: 0.04,
    envMapIntensity: 2.6
  }),
  // Internal Stepped Baffle Rings
  baffleMat: new THREE.MeshStandardMaterial({
    color: 0x0c0d0f,
    roughness: 0.9,
    metalness: 0.3
  }),
  // Aperture Iris Blades
  irisBlades: new THREE.MeshStandardMaterial({
    color: 0x24272c,
    metalness: 0.88,
    roughness: 0.32,
    side: THREE.DoubleSide
  }),
  // Stacked CMOS Silicon Die with PBR Circuit Grid & Iridescence
  sensorSilicon: new THREE.MeshPhysicalMaterial({
    color: 0x0a2215,
    map: sensorWaferMap,
    roughnessMap: sensorWaferRoughness,
    metalness: 0.94,
    roughness: 0.08,
    iridescence: 0.96,
    iridescenceIOR: 1.38,
    iridescenceThicknessRange: [220, 640],
    clearcoat: 0.96,
    clearcoatRoughness: 0.04
  }),
  // Gold Wire-Bonds & Contacts
  goldBond: new THREE.MeshPhysicalMaterial({
    color: 0xebb438,
    metalness: 0.96,
    roughness: 0.14,
    clearcoat: 0.5
  }),
  // Pure Copper IBIS & Heat Pipes
  pureCopper: new THREE.MeshPhysicalMaterial({
    color: 0xc86a2d,
    metalness: 0.94,
    roughness: 0.18,
    clearcoat: 0.35
  }),
  // Logic Motherboard PCB
  logicPCB: new THREE.MeshStandardMaterial({
    color: 0x0d2216,
    roughness: 0.65,
    metalness: 0.3
  }),
  // DIGIC BGA Processor Lid
  digicChip: new THREE.MeshPhysicalMaterial({
    color: 0x1a1c20,
    metalness: 0.9,
    roughness: 0.2,
    clearcoat: 0.6
  }),
  // Rear LCD Display Glass
  displayGlass: new THREE.MeshPhysicalMaterial({
    color: 0x08090b,
    roughness: 0.04,
    metalness: 0.1,
    clearcoat: 1.0
  }),
  // Precision Torx Fastener Materials
  torxScrew: new THREE.MeshPhysicalMaterial({
    color: 0xd8dde6,
    metalness: 0.94,
    roughness: 0.20,
    clearcoat: 0.4
  }),
  torxRecess: new THREE.MeshStandardMaterial({
    color: 0x14161a,
    metalness: 0.85,
    roughness: 0.55
  })
};

// Helper: Procedural Torx Fastener Assembly
function createTorxScrew(radius = 0.034) {
  const screwGroup = new THREE.Group();
  const head = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius * 0.9, 0.015, 16),
    materials.torxScrew
  );
  head.rotation.x = Math.PI / 2;
  screwGroup.add(head);

  // 6-point Torx recess
  const recess = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.44, radius * 0.44, 0.018, 6),
    materials.torxRecess
  );
  recess.rotation.x = Math.PI / 2;
  screwGroup.add(recess);
  return screwGroup;
}

/* =========================================================================
   ASSEMBLY ROOT (CINEMATIC 360 SPIN TARGET)
   ========================================================================= */
const cameraRoot = new THREE.Group();
scene.add(cameraRoot);

/* =========================================================================
   1. GROUP 1: FRONT RF OPTICAL BARREL
   ========================================================================= */
const group1 = new THREE.Group();
cameraRoot.add(group1);

// Outer Barrel Main Cylinder
const barrelMain = new THREE.Mesh(new THREE.CylinderGeometry(1.02, 1.05, 1.5, 48, 1, true), materials.lensBarrel);
barrelMain.rotation.x = Math.PI / 2;
group1.add(barrelMain);

// Baked Decal Ring on Barrel
const decalRing = new THREE.Mesh(new THREE.CylinderGeometry(1.028, 1.028, 0.22, 48, 1, true), materials.lensDecal);
decalRing.rotation.x = Math.PI / 2;
decalRing.position.z = -0.15;
group1.add(decalRing);

// High-Density Ribbed Knurling Rings
const ribCount = 72;
const ribGroup = new THREE.Group();
for (let i = 0; i < ribCount; i++) {
  const angle = (i / ribCount) * Math.PI * 2;
  const rib = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.42, 0.02), materials.metalDial);
  rib.position.set(Math.cos(angle) * 1.035, Math.sin(angle) * 1.035, 0.22);
  rib.rotation.z = angle;
  ribGroup.add(rib);
}
group1.add(ribGroup);

// Brushed Metallic Distance Window
const distWindowGroup = new THREE.Group();
const distFrame = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.04), materials.metalDial);
distFrame.position.set(0, 1.03, 0.22);
distWindowGroup.add(distFrame);
const distGlass = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.12, 0.02), materials.displayGlass);
distGlass.position.set(0, 1.04, 0.22);
distWindowGroup.add(distGlass);
group1.add(distWindowGroup);

// Signature Canon Anodized Red Metallic Ring
const redRing = new THREE.Mesh(new THREE.CylinderGeometry(1.045, 1.045, 0.06, 64), materials.anodizedRed);
redRing.rotation.x = Math.PI / 2;
redRing.position.z = 0.55;
group1.add(redRing);

// Front Bevel Ring & Filter Flange
const frontFlange = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 0.94, 0.16, 48), materials.metalDial);
frontFlange.rotation.x = Math.PI / 2;
frontFlange.position.z = 0.72;
group1.add(frontFlange);

// Internal Stepped Baffle Rings
const baffleGroup = new THREE.Group();
for (let b = 0; b < 4; b++) {
  const baffle = new THREE.Mesh(new THREE.RingGeometry(0.68 + b * 0.04, 0.96, 36), materials.baffleMat);
  baffle.position.z = 0.5 - b * 0.15;
  baffleGroup.add(baffle);
}
group1.add(baffleGroup);

// 3 Curved Fluorite Glass Lenses
function createConvexLensGeometry(radius, thickness) {
  const points = [];
  const segments = 16;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const r = radius * Math.sin(t * Math.PI * 0.5);
    const z = thickness * Math.cos(t * Math.PI * 0.5);
    points.push(new THREE.Vector2(r, z));
  }
  for (let i = segments; i >= 0; i--) {
    const t = i / segments;
    const r = radius * Math.sin(t * Math.PI * 0.5);
    const z = -thickness * 0.55 * Math.cos(t * Math.PI * 0.5);
    points.push(new THREE.Vector2(r, z));
  }
  return new THREE.LatheGeometry(points, 36);
}

function createConcaveLensGeometry(radius, thickness) {
  const points = [];
  const segments = 16;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const r = radius * t;
    const z = (thickness * 0.2) + (thickness * 0.8 * (t * t));
    points.push(new THREE.Vector2(r, z));
  }
  for (let i = segments; i >= 0; i--) {
    const t = i / segments;
    const r = radius * t;
    const z = -((thickness * 0.2) + (thickness * 0.8 * (t * t)));
    points.push(new THREE.Vector2(r, z));
  }
  return new THREE.LatheGeometry(points, 36);
}

const lens1Mesh = new THREE.Mesh(createConvexLensGeometry(0.88, 0.24), materials.fluoriteGlass);
lens1Mesh.rotation.x = Math.PI / 2;
const lensCollar1 = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.92, 0.1, 32, 1, true), materials.lensBarrel);
lensCollar1.rotation.x = Math.PI / 2;
const lens1Group = new THREE.Group();
lens1Group.add(lens1Mesh);
lens1Group.add(lensCollar1);
group1.add(lens1Group);

const lens2Mesh = new THREE.Mesh(createConcaveLensGeometry(0.78, 0.18), materials.fluoriteGlass);
lens2Mesh.rotation.x = Math.PI / 2;
const lensCollar2 = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.82, 0.1, 32, 1, true), materials.lensBarrel);
lensCollar2.rotation.x = Math.PI / 2;
const lens2Group = new THREE.Group();
lens2Group.add(lens2Mesh);
lens2Group.add(lensCollar2);
group1.add(lens2Group);

const lens3Mesh = new THREE.Mesh(createConvexLensGeometry(0.72, 0.16), materials.fluoriteGlass);
lens3Mesh.rotation.x = Math.PI / 2;
const lensCollar3 = new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.76, 0.1, 32, 1, true), materials.lensBarrel);
lensCollar3.rotation.x = Math.PI / 2;
const lens3Group = new THREE.Group();
lens3Group.add(lens3Mesh);
lens3Group.add(lensCollar3);
group1.add(lens3Group);

const anchor1 = new THREE.Object3D();
anchor1.position.set(0.0, 1.05, 0.3);
group1.add(anchor1);

/* =========================================================================
   2. GROUP 2: APERTURE IRIS UNIT
   ========================================================================= */
const group2 = new THREE.Group();
cameraRoot.add(group2);

const irisHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.92, 0.14, 36, 1, true), materials.metalDial);
irisHousing.rotation.x = Math.PI / 2;
group2.add(irisHousing);

const irisInnerRing = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.92, 36), materials.lensBarrel);
group2.add(irisInnerRing);

const bladeCount = 9;
const bladeShape = new THREE.Shape();
bladeShape.moveTo(0, 0);
bladeShape.quadraticCurveTo(0.35, 0.22, 0.58, 0.08);
bladeShape.quadraticCurveTo(0.42, 0.02, 0.15, -0.05);
bladeShape.lineTo(0, 0);

const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, {
  depth: 0.005,
  bevelEnabled: true,
  bevelSegments: 1,
  bevelSize: 0.002,
  bevelThickness: 0.002
});

const irisBladesGroup = new THREE.Group();
const irisBlades = [];
for (let i = 0; i < bladeCount; i++) {
  const angle = (i / bladeCount) * Math.PI * 2;
  const blade = new THREE.Mesh(bladeGeo, materials.irisBlades);
  blade.position.set(Math.cos(angle) * 0.42, Math.sin(angle) * 0.42, (i * 0.004) - 0.02);
  blade.rotation.z = angle + 0.35;
  blade.userData = { baseAngle: angle + 0.35, posX: Math.cos(angle) * 0.42, posY: Math.sin(angle) * 0.42 };
  irisBlades.push(blade);
  irisBladesGroup.add(blade);
}
group2.add(irisBladesGroup);

const actuatorMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.25, 20), materials.stainlessSteel);
actuatorMotor.position.set(0.85, 0.35, 0.0);
group2.add(actuatorMotor);

const anchor2 = new THREE.Object3D();
anchor2.position.set(0.0, 0.95, 0.0);
group2.add(anchor2);

/* =========================================================================
   3. GROUP 3: MAGNESIUM BODY & RF MOUNT
   ========================================================================= */
const group3 = new THREE.Group();
cameraRoot.add(group3);

const bw = 2.4, bh = 1.6, cr = 0.28;
const bodyShape = new THREE.Shape();
bodyShape.moveTo(-bw * 0.5 + cr, -bh * 0.5);
bodyShape.lineTo(bw * 0.5 - cr, -bh * 0.5);
bodyShape.quadraticCurveTo(bw * 0.5, -bh * 0.5, bw * 0.5, -bh * 0.5 + cr);
bodyShape.lineTo(bw * 0.5, bh * 0.5 - cr);
bodyShape.quadraticCurveTo(bw * 0.5, bh * 0.5, bw * 0.5 - cr, bh * 0.5);
bodyShape.lineTo(-bw * 0.5 + cr, bh * 0.5);
bodyShape.quadraticCurveTo(-bw * 0.5, bh * 0.5, -bw * 0.5, bh * 0.5 - cr);
bodyShape.lineTo(-bw * 0.5, -bh * 0.5 + cr);
bodyShape.quadraticCurveTo(-bw * 0.5, -bh * 0.5, -bw * 0.5 + cr, -bh * 0.5);

const bodyMesh = new THREE.Mesh(
  new THREE.ExtrudeGeometry(bodyShape, {
    depth: 0.65,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.09,
    bevelThickness: 0.09
  }),
  materials.magnesium
);
bodyMesh.position.set(0, 0, -0.32);
group3.add(bodyMesh);

const gripShape = new THREE.Shape();
gripShape.moveTo(0, -bh * 0.5);
gripShape.lineTo(0.55, -bh * 0.5);
gripShape.quadraticCurveTo(0.74, 0.0, 0.55, bh * 0.45);
gripShape.lineTo(0, bh * 0.45);
gripShape.lineTo(0, -bh * 0.5);

const gripMesh = new THREE.Mesh(
  new THREE.ExtrudeGeometry(gripShape, {
    depth: 0.72,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.09,
    bevelThickness: 0.09
  }),
  materials.rubberGrip
);
gripMesh.position.set(bw * 0.5 - 0.58, 0, -0.28);
group3.add(gripMesh);

const evfShape = new THREE.Shape();
evfShape.moveTo(-0.48, 0);
evfShape.lineTo(0.48, 0);
evfShape.lineTo(0.34, 0.42);
evfShape.lineTo(-0.34, 0.42);
evfShape.lineTo(-0.48, 0);

const evfHump = new THREE.Mesh(
  new THREE.ExtrudeGeometry(evfShape, {
    depth: 0.68,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.05,
    bevelThickness: 0.05
  }),
  materials.magnesium
);
evfHump.position.set(0, bh * 0.5 - 0.02, -0.34);
group3.add(evfHump);

const hotShoeBase = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.03, 0.34), materials.stainlessSteel);
hotShoeBase.position.set(0, bh * 0.5 + 0.46, 0.0);
const hotShoeRailL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.34), materials.stainlessSteel);
hotShoeRailL.position.set(-0.13, bh * 0.5 + 0.48, 0.0);
const hotShoeRailR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.34), materials.stainlessSteel);
hotShoeRailR.position.set(0.13, bh * 0.5 + 0.48, 0.0);
group3.add(hotShoeBase);
group3.add(hotShoeRailL);
group3.add(hotShoeRailR);

const modeDial = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.16, 28), materials.metalDial);
modeDial.position.set(-0.85, bh * 0.5 + 0.08, -0.05);
group3.add(modeDial);

const modeDialTop = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.02, 28), materials.magnesium);
modeDialTop.position.set(-0.85, bh * 0.5 + 0.17, -0.05);
group3.add(modeDialTop);

const shutterCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.08, 20), materials.stainlessSteel);
shutterCollar.position.set(0.92, bh * 0.5 + 0.06, 0.22);
shutterCollar.rotation.x = -0.25;
const shutterBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.06, 20), materials.magnesium);
shutterBtn.position.set(0, 0.04, 0);
shutterCollar.add(shutterBtn);
group3.add(shutterCollar);

const bayonetGroup = new THREE.Group();
const bayonetRing = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.82, 0.12, 36, 1, true), materials.stainlessSteel);
bayonetRing.rotation.x = Math.PI / 2;
bayonetRing.position.z = 0.38;
bayonetGroup.add(bayonetRing);

const bayonetFace = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.82, 36), materials.stainlessSteel);
bayonetFace.position.z = 0.44;
bayonetGroup.add(bayonetFace);

// Torx Fasteners around Bayonet Flange Ring
for (let i = 0; i < 4; i++) {
  const angle = Math.PI * 0.25 + i * (Math.PI * 0.5);
  const screw = createTorxScrew(0.032);
  screw.position.set(Math.cos(angle) * 0.72, Math.sin(angle) * 0.72, 0.446);
  bayonetGroup.add(screw);
}

for (let i = 0; i < 3; i++) {
  const angle = (i / 3) * Math.PI * 2;
  const tab = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.16), materials.stainlessSteel);
  tab.position.set(Math.cos(angle) * 0.60, Math.sin(angle) * 0.60, 0.38);
  tab.rotation.z = angle;
  bayonetGroup.add(tab);
}

for (let i = 0; i < 12; i++) {
  const pinAngle = -Math.PI * 0.5 + (i - 5.5) * 0.08;
  const pin = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, 0.03), materials.goldBond);
  pin.position.set(Math.cos(pinAngle) * 0.64, Math.sin(pinAngle) * 0.64, 0.43);
  bayonetGroup.add(pin);
}

const shutterBox = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.0, 0.15), materials.lensBarrel);
shutterBox.position.set(0, 0, 0.18);
bayonetGroup.add(shutterBox);

for (let i = 0; i < 4; i++) {
  const slat = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.18, 0.008), materials.irisBlades);
  slat.position.set(0, (i - 1.5) * 0.16, 0.22);
  bayonetGroup.add(slat);
}
group3.add(bayonetGroup);

const anchor3 = new THREE.Object3D();
anchor3.position.set(0.85, 0.85, 0.2);
group3.add(anchor3);

/* =========================================================================
   4. GROUP 4: FULL FRAME STACKED CMOS SENSOR
   ========================================================================= */
const group4 = new THREE.Group();
cameraRoot.add(group4);

const sensorDie = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.90, 0.03), materials.sensorSilicon);
group4.add(sensorDie);

const olpfGlass = new THREE.Mesh(new THREE.BoxGeometry(1.37, 0.92, 0.015), materials.fluoriteGlass);
olpfGlass.position.z = 0.025;
group4.add(olpfGlass);

const ceramicSubstrate = new THREE.Mesh(new THREE.BoxGeometry(1.58, 1.15, 0.04), materials.lensBarrel);
ceramicSubstrate.position.z = -0.02;
group4.add(ceramicSubstrate);

const wireBondsGroup = new THREE.Group();
const bondCountX = 24;
for (let i = 0; i < bondCountX; i++) {
  const x = -0.64 + (i / (bondCountX - 1)) * 1.28;
  const bondTop = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.08, 0.01), materials.goldBond);
  bondTop.position.set(x, 0.49, 0.005);
  wireBondsGroup.add(bondTop);
  const bondBtm = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.08, 0.01), materials.goldBond);
  bondBtm.position.set(x, -0.49, 0.005);
  wireBondsGroup.add(bondBtm);
}
group4.add(wireBondsGroup);

const ibisPlate = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.45, 0.05), materials.pureCopper);
ibisPlate.position.z = -0.06;
group4.add(ibisPlate);

const corners = [[-0.82, 0.6], [0.82, 0.6], [-0.82, -0.6], [0.82, -0.6]];
corners.forEach(([cx, cy]) => {
  const coil = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16), materials.pureCopper);
  coil.rotation.x = Math.PI / 2;
  coil.position.set(cx, cy, -0.03);
  group4.add(coil);

  const magnetBracket = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.08), materials.stainlessSteel);
  magnetBracket.position.set(cx, cy, -0.08);
  group4.add(magnetBracket);

  // Precision Torx Fastener on Sensor Carrier Bracket
  const screw = createTorxScrew(0.030);
  screw.position.set(cx, cy, 0.012);
  group4.add(screw);
});

const flexRibbon = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.7, 0.008), materials.goldBond);
flexRibbon.position.set(0.75, -0.8, -0.06);
group4.add(flexRibbon);

const anchor4_sensor = new THREE.Object3D();
anchor4_sensor.position.set(0.0, 0.75, 0.0);
group4.add(anchor4_sensor);

/* =========================================================================
   5. GROUP 5: REAR THERMAL & DIGIC ENGINE
   ========================================================================= */
const group5 = new THREE.Group();
cameraRoot.add(group5);

const heatsinkGroup = new THREE.Group();
const vaporPlate = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.25, 0.04), materials.pureCopper);
heatsinkGroup.add(vaporPlate);

const heatPipe1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 12), materials.pureCopper);
heatPipe1.rotation.z = Math.PI / 4;
heatPipe1.position.set(0.1, 0.0, 0.03);
heatsinkGroup.add(heatPipe1);

const heatPipe2 = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.2, 12), materials.pureCopper);
heatPipe2.rotation.z = -Math.PI / 3;
heatPipe2.position.set(-0.2, 0.1, 0.03);
heatsinkGroup.add(heatPipe2);

for (let i = 0; i < 14; i++) {
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.015, 0.12), materials.stainlessSteel);
  fin.position.set(0.65, -0.45 + i * 0.065, 0.06);
  heatsinkGroup.add(fin);
}
group5.add(heatsinkGroup);

const anchor5_thermal = new THREE.Object3D();
anchor5_thermal.position.set(0.1, 0.75, 0.0);
heatsinkGroup.add(anchor5_thermal);

const pcbGroup = new THREE.Group();
const pcbMain = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.4, 0.04), materials.logicPCB);
pcbGroup.add(pcbMain);

const digic1 = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.48, 0.05), materials.digicChip);
digic1.position.set(-0.35, 0.15, 0.03);
pcbGroup.add(digic1);

const digicTrim1 = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.52, 0.02), materials.goldBond);
digicTrim1.position.set(-0.35, 0.15, 0.01);
pcbGroup.add(digicTrim1);

const digic2 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.05), materials.digicChip);
digic2.position.set(0.35, -0.15, 0.03);
pcbGroup.add(digic2);
group5.add(pcbGroup);

const rearHousingGroup = new THREE.Group();
const rearBackplate = new THREE.Mesh(new THREE.BoxGeometry(2.35, 1.55, 0.12), materials.magnesium);
rearHousingGroup.add(rearBackplate);

const lcdFrame = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.05, 0.06), materials.magnesium);
lcdFrame.position.set(-0.25, -0.05, -0.06);
const lcdScreen = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.92, 0.02), materials.displayGlass);
lcdScreen.position.set(0, 0, -0.03);
lcdFrame.add(lcdScreen);
rearHousingGroup.add(lcdFrame);

const joystick = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.12, 16), materials.metalDial);
joystick.rotation.x = Math.PI / 2;
joystick.position.set(0.75, 0.35, -0.08);
rearHousingGroup.add(joystick);

const evfEyepiece = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.16, 20), materials.rubberGrip);
evfEyepiece.rotation.x = Math.PI / 2;
evfEyepiece.position.set(0, bh * 0.5 + 0.12, -0.12);
rearHousingGroup.add(evfEyepiece);
group5.add(rearHousingGroup);

// Link 3D anchors to stageElements:
// Stage 0: RF Optical Group -> anchor1
// Stage 1: Iris Unit -> anchor2
// Stage 2: Magnesium Chassis -> anchor3
// Stage 3: Thermal Core -> anchor5_thermal
// Stage 4: Stacked Sensor -> anchor4_sensor
stageElements[0].anchor = anchor1;
stageElements[1].anchor = anchor2;
stageElements[2].anchor = anchor3;
stageElements[3].anchor = anchor5_thermal;
stageElements[4].anchor = anchor4_sensor;

// Precompile shaders on init for zero runtime stutter
renderer.compile(scene, camera);

/* =========================================================================
   SCROLL ENGINE & POINTER PARALLAX / DRAG INERTIA
   ========================================================================= */
let targetScroll = 0.0;
let currentScroll = 0.0;

function updateScrollProgress() {
  const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  const docH = Math.max(
    document.documentElement.scrollHeight || 0,
    document.body ? document.body.scrollHeight : 0,
    document.documentElement.clientHeight * 10
  );
  const winH = window.innerHeight || document.documentElement.clientHeight || 1;
  const maxScroll = docH - winH;
  if (maxScroll > 0) {
    targetScroll = Math.max(0, Math.min(1, scrollY / maxScroll));
  }
}
window.addEventListener('scroll', updateScrollProgress, { passive: true });
document.addEventListener('scroll', updateScrollProgress, { passive: true });
updateScrollProgress();

window.setDissectionProgress = (p) => {
  targetScroll = Math.max(0, Math.min(1, p));
  currentScroll = targetScroll;
};

// Pointer Parallax (tilt rig smoothly across all phases)
let targetMouseX = 0;
let targetMouseY = 0;
let currentMouseX = 0;
let currentMouseY = 0;

window.addEventListener('mousemove', (e) => {
  targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
}, { passive: true });

// Drag Orbit Inspection with Inertia
let isDragging = false;
let prevPointerX = 0;
let prevPointerY = 0;
let orbitYaw = 0;
let orbitPitch = 0;
let dragVelocityX = 0;
let dragVelocityY = 0;

canvas.addEventListener('pointerdown', (e) => {
  isDragging = true;
  canvas.classList.add('dragging');
  prevPointerX = e.clientX;
  prevPointerY = e.clientY;
});

window.addEventListener('pointermove', (e) => {
  if (!isDragging) return;
  const dx = e.clientX - prevPointerX;
  const dy = e.clientY - prevPointerY;
  prevPointerX = e.clientX;
  prevPointerY = e.clientY;

  dragVelocityX = dx * 0.005;
  dragVelocityY = dy * 0.005;
  orbitYaw += dragVelocityX;
  orbitPitch = Math.max(-0.55, Math.min(0.55, orbitPitch + dragVelocityY));
});

window.addEventListener('pointerup', () => {
  if (isDragging) {
    isDragging = false;
    canvas.classList.remove('dragging');
  }
});
window.addEventListener('pointercancel', () => {
  if (isDragging) {
    isDragging = false;
    canvas.classList.remove('dragging');
  }
});

/* =========================================================================
   STAGED CAMERA CHOREOGRAPHY
   - 0.00 to 0.25: Assembled hero view (360 continuous spin on Y axis)
   - 0.25 to 0.45: Movement 1 (Side optical profile)
   - 0.45 to 0.65: Movement 2 (Three-quarter interior view)
   - 0.65 to 0.85: Movement 3 (Sensor macro zoom dolly)
   - 0.85 to 1.00: Final composition (Wide isometric overview)
   ========================================================================= */
const tempVec = new THREE.Vector3();

const camKeyframes = [
  // 0.00 - Intro Hero
  { pos: new THREE.Vector3(3.4, 1.4, 4.6), target: new THREE.Vector3(0.0, 0.1, 0.5) },
  // 0.25 - Intro End
  { pos: new THREE.Vector3(3.4, 1.4, 4.6), target: new THREE.Vector3(0.0, 0.1, 0.5) },
  // 0.35 - Optical Mid
  { pos: new THREE.Vector3(4.8, 0.6, 3.8), target: new THREE.Vector3(0.0, 0.0, 3.2) },
  // 0.45 - Movement 1 End (Side optical profile)
  { pos: new THREE.Vector3(5.2, 0.4, 3.4), target: new THREE.Vector3(0.0, 0.0, 3.0) },
  // 0.55 - Interior Mid
  { pos: new THREE.Vector3(3.6, 1.8, 2.2), target: new THREE.Vector3(0.2, 0.1, 0.8) },
  // 0.65 - Movement 2 End (Three quarter interior view)
  { pos: new THREE.Vector3(3.2, 1.6, 1.8), target: new THREE.Vector3(0.1, 0.0, 0.4) },
  // 0.75 - Movement 3 Peak (Sensor macro zoom)
  { pos: new THREE.Vector3(1.2, 0.7, -0.4), target: new THREE.Vector3(0.0, 0.0, -1.1) },
  // 0.85 - Movement 3 Ease Back into Wide Isometric
  { pos: new THREE.Vector3(6.4, 4.2, 2.2), target: new THREE.Vector3(0.0, 0.1, 0.4) },
  // 1.00 - The Specification (Holds wide isometric framing, easing slightly upward so content below has room)
  { pos: new THREE.Vector3(7.2, 4.8, 2.2), target: new THREE.Vector3(0.0, -0.65, 0.4) }
];

const splitPoints = [0.00, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 1.00];

function evaluateStagedCamera(p) {
  let seg = 0;
  for (let s = 0; s < splitPoints.length - 1; s++) {
    if (p >= splitPoints[s] && p <= splitPoints[s + 1]) {
      seg = s;
      break;
    }
  }

  const p0 = splitPoints[seg];
  const p1 = splitPoints[seg + 1];
  const rawT = (p - p0) / Math.max(0.0001, (p1 - p0));
  const t = THREE.MathUtils.smoothstep(rawT, 0, 1);

  const kf0 = camKeyframes[seg];
  const kf1 = camKeyframes[seg + 1];

  const basePos = new THREE.Vector3().lerpVectors(kf0.pos, kf1.pos, t);
  const baseTarget = new THREE.Vector3().lerpVectors(kf0.target, kf1.target, t);

  return { basePos, baseTarget };
}

/* =========================================================================
   ADAPTIVE QUALITY MONITOR
   ========================================================================= */
let lastFrameTime = performance.now();
let lowFpsAccumulator = 0;
let qualityDowngraded = false;
let fpsHistory = [];

function checkAdaptiveQuality(deltaSeconds) {
  const fps = 1 / Math.max(deltaSeconds, 0.001);
  fpsHistory.push(fps);
  if (fpsHistory.length > 60) fpsHistory.shift();

  if (qualityDowngraded) return;
  if (fps < 45) {
    lowFpsAccumulator += deltaSeconds;
    if (lowFpsAccumulator >= 2.0) {
      qualityDowngraded = true;
      renderer.setPixelRatio(1.0);
    }
  } else {
    lowFpsAccumulator = Math.max(0, lowFpsAccumulator - deltaSeconds * 0.5);
  }
}

window.getFPS = () => {
  if (fpsHistory.length === 0) return 60.0;
  return fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length;
};

/* =========================================================================
   MAIN 60FPS ANIMATION LOOP
   Smooth damping 0.05
   ========================================================================= */
let idleClock = 0;

function animate() {
  requestAnimationFrame(animate);

  const now = performance.now();
  const deltaSeconds = (now - lastFrameTime) / 1000;
  lastFrameTime = now;
  checkAdaptiveQuality(deltaSeconds);
  idleClock += deltaSeconds;

  // Smooth scroll lerp (damping 0.05 as requested)
  currentScroll += (targetScroll - currentScroll) * 0.05;
  window.currentScroll = currentScroll;
  window.targetScroll = targetScroll;

  // Pointer parallax lerp
  currentMouseX += (targetMouseX - currentMouseX) * 0.05;
  currentMouseY += (targetMouseY - currentMouseY) * 0.05;

  // Inertia damping for drag rotation
  if (!isDragging) {
    orbitYaw += dragVelocityX;
    orbitPitch = Math.max(-0.55, Math.min(0.55, orbitPitch + dragVelocityY));
    dragVelocityX *= 0.92;
    dragVelocityY *= 0.92;
  }

  const p = currentScroll;

  // -----------------------------------------------------------------------
  // 1. THE CINEMATIC 360 SPIN INTRO (0.00 TO 0.25)
  // Camera sits fully assembled; continuous 360 degree spin on Y axis,
  // easing out gently near 0.25 so the release into Movement 1 has zero snap.
  // -----------------------------------------------------------------------
  if (p <= 0.25) {
    const spinT = p / 0.25;
    const easedSpin = spinT < 0.75
      ? (spinT / 0.75) * 0.75
      : 0.75 + (1 - Math.pow(1 - (spinT - 0.75) / 0.25, 2)) * 0.25;
    cameraRoot.rotation.y = easedSpin * Math.PI * 2;
  } else {
    cameraRoot.rotation.y = 0.0;
  }

  // Hero title holds through first quarter then releases gracefully
  if (p < 0.20) {
    heroOverlay.classList.add('active');
    brandHeader.classList.remove('visible');
  } else {
    heroOverlay.classList.remove('active');
    brandHeader.classList.add('visible');
  }

  // INTRO EDITORIAL SPOKEN BEATS (0.00 - 0.25)
  // 3 editorial lines arrive and release one at a time, timed to where
  // the camera is facing, plus the promise: NOW WE GO INSIDE.
  let activeIntroIdx = -1;
  if (p <= 0.25) {
    for (let i = 0; i < introLines.length; i++) {
      if (p >= introLines[i].min && p < introLines[i].max) {
        activeIntroIdx = i;
        break;
      }
    }
  }
  introLines.forEach((item, i) => {
    if (item.dom) {
      if (i === activeIntroIdx) {
        item.dom.classList.add('active');
      } else {
        item.dom.classList.remove('active');
      }
    }
  });

  // Pointer & drag parallax drift on intro text (transform & opacity only, zero reflow)
  if (introLinesOverlay) {
    if (prefersReducedMotion) {
      introLinesOverlay.style.transform = 'none';
    } else {
      const driftX = (currentMouseX * 18 + orbitYaw * 22).toFixed(2);
      const driftY = (currentMouseY * 12 + orbitPitch * 14).toFixed(2);
      introLinesOverlay.style.transform = `translate3d(${driftX}px, ${driftY}px, 0)`;
    }
  }

  // -----------------------------------------------------------------------
  // 2. GRADUAL MATURE DISSECTION (0.25 TO 0.85)
  // NO early disassembly during 0.00 to 0.25!
  // -----------------------------------------------------------------------
  let m1 = 0.0; // Movement 1: 0.25 to 0.45
  let m2 = 0.0; // Movement 2: 0.45 to 0.65
  let m3 = 0.0; // Movement 3: 0.65 to 0.85

  if (p > 0.25) {
    m1 = THREE.MathUtils.smoothstep(Math.min(1.0, (p - 0.25) / 0.20), 0, 1);
  }
  if (p > 0.45) {
    m2 = THREE.MathUtils.smoothstep(Math.min(1.0, (p - 0.45) / 0.20), 0, 1);
  }
  if (p > 0.65) {
    m3 = THREE.MathUtils.smoothstep(Math.min(1.0, (p - 0.65) / 0.20), 0, 1);
  }

  // MOVEMENT ONE (0.25 - 0.45):
  // RF lens barrel and 3 fluorite elements glide forward smoothly along axis,
  // revealing electro iris behind them.
  group1.position.z = THREE.MathUtils.lerp(1.5, 4.2, m1) + m2 * 0.8 + m3 * 0.4;
  lens1Group.position.z = THREE.MathUtils.lerp(0.55, 1.5, m1);
  lens2Group.position.z = THREE.MathUtils.lerp(0.15, 0.7, m1);
  lens3Group.position.z = THREE.MathUtils.lerp(-0.25, -0.15, m1);

  // Aperture iris unit behind barrel
  group2.position.z = THREE.MathUtils.lerp(0.85, 2.6, m1) + m2 * 0.4;

  // Iris blades fan open during second half of movement one (0.35 - 0.45)
  let irisOpen = 0.0;
  if (p >= 0.35) {
    irisOpen = THREE.MathUtils.smoothstep(Math.min(1.0, (p - 0.35) / 0.10), 0, 1);
  }
  irisBlades.forEach((b) => {
    b.rotation.z = b.userData.baseAngle + irisOpen * 0.72;
    b.position.x = b.userData.posX * (1.0 + irisOpen * 0.28);
    b.position.y = b.userData.posY * (1.0 + irisOpen * 0.28);
  });

  // MOVEMENT TWO (0.45 - 0.65):
  // Magnesium body separates from optical core, exposing internal thermal architecture,
  // copper heat pipes and bayonet mount.
  group3.position.z = THREE.MathUtils.lerp(0.1, 0.75, m2);
  bodyMesh.position.y = m2 * 0.42;
  bodyMesh.position.x = m2 * 0.12;
  gripMesh.position.y = m2 * 0.42;
  gripMesh.position.x = bw * 0.5 - 0.58 + m2 * 0.12;
  evfHump.position.y = bh * 0.5 - 0.02 + m2 * 0.42;
  hotShoeBase.position.y = bh * 0.5 + 0.46 + m2 * 0.42;
  hotShoeRailL.position.y = bh * 0.5 + 0.48 + m2 * 0.42;
  hotShoeRailR.position.y = bh * 0.5 + 0.48 + m2 * 0.42;
  modeDial.position.y = bh * 0.5 + 0.08 + m2 * 0.42;
  modeDialTop.position.y = bh * 0.5 + 0.17 + m2 * 0.42;
  shutterCollar.position.y = bh * 0.5 + 0.06 + m2 * 0.42;

  // MOVEMENT THREE (0.65 - 0.85):
  // Chassis parts settle further apart. Golden stacked CMOS sensor on copper plate
  // floats forward into center of frame. Rear thermal engine swings clear.
  group4.position.z = THREE.MathUtils.lerp(-0.2, -1.45, m2) + m3 * 0.85;
  group4.rotation.y = m3 * 0.18;

  group5.position.z = THREE.MathUtils.lerp(-0.7, -4.2, m2 + m3 * 0.5);
  group5.rotation.y = -m3 * 0.42;
  heatsinkGroup.position.z = THREE.MathUtils.lerp(0.25, 0.8, m2) + m3 * 0.5;
  pcbGroup.position.z = THREE.MathUtils.lerp(0.05, 0.25, m2) + m3 * 0.25;

  // Traveling studio highlight across front lens element
  frontSweep.position.x = 3.5 + Math.sin(idleClock * 0.8 + p * Math.PI * 2) * 2.2;
  frontSweep.position.y = 4.5 + Math.cos(idleClock * 0.5) * 0.6;

  // -----------------------------------------------------------------------
  // 3. ANNOTATIONS: NO NUMBERS, SLIM FROSTED GLASS PANELS
  // Beat mapping:
  // 0.25 - 0.35: RF OPTICAL GROUP
  // 0.35 - 0.45: IRIS UNIT
  // 0.45 - 0.55: MAGNESIUM CHASSIS
  // 0.55 - 0.65: THERMAL CORE
  // 0.65 - 0.85: STACKED SENSOR
  // Only ONE annotation on screen, crossfading between beats.
  // -----------------------------------------------------------------------
  let activeStageIdx = -1;
  for (let i = 0; i < stageElements.length; i++) {
    if (p >= stageElements[i].min && p < stageElements[i].max) {
      activeStageIdx = i;
      break;
    }
  }

  // Trigger single smooth pulse on arrival when active stage changes
  if (activeStageIdx !== previousStageIdx) {
    if (activeStageIdx !== -1 && leaderDot) {
      leaderDot.classList.remove('pulse');
      void leaderDot.offsetWidth;
      leaderDot.classList.add('pulse');
    }
    previousStageIdx = activeStageIdx;
  }

  stageElements.forEach((stage, i) => {
    if (stage.dom) {
      if (i === activeStageIdx) {
        stage.dom.classList.add('active');
      } else {
        stage.dom.classList.remove('active');
      }
    }
  });

  // Active annotation panel drifts with pointer at shallow depth (4-6px)
  if (annotationsOverlay) {
    if (prefersReducedMotion) {
      annotationsOverlay.style.transform = 'none';
    } else {
      const annDriftX = (currentMouseX * 5.2).toFixed(2);
      const annDriftY = (currentMouseY * 4.0).toFixed(2);
      annotationsOverlay.style.transform = `translate3d(${annDriftX}px, ${annDriftY}px, 0)`;
    }
  }

  // Mutate Preallocated SVG Leader Line Elements
  if (activeStageIdx !== -1) {
    const activeStage = stageElements[activeStageIdx];
    if (activeStage.anchor && activeStage.dom) {
      activeStage.anchor.getWorldPosition(tempVec);
      tempVec.project(camera);

      const inFront = tempVec.z < 1.0;
      const screenX = (tempVec.x * 0.5 + 0.5) * window.innerWidth;
      const screenY = (-tempVec.y * 0.5 + 0.5) * window.innerHeight;

      if (inFront && screenX >= -40 && screenX <= window.innerWidth + 40 && screenY >= -40 && screenY <= window.innerHeight + 40) {
        const rect = activeStage.dom.getBoundingClientRect();
        const textX = (screenX < rect.left) ? rect.left : rect.right;
        const textY = rect.top + 20;
        const midX = screenX + (textX - screenX) * 0.5;

        leaderDot.setAttribute('cx', screenX.toFixed(1));
        leaderDot.setAttribute('cy', screenY.toFixed(1));
        leaderDot.style.opacity = '1';

        leaderLine.setAttribute('points', `${screenX.toFixed(1)},${screenY.toFixed(1)} ${midX.toFixed(1)},${screenY.toFixed(1)} ${textX.toFixed(1)},${textY.toFixed(1)}`);
        leaderLine.style.opacity = '1';
      } else {
        leaderDot.style.opacity = '0';
        leaderLine.style.opacity = '0';
      }
    }
  } else {
    leaderDot.style.opacity = '0';
    leaderLine.style.opacity = '0';
  }

  // -----------------------------------------------------------------------
  // 4. THE FINAL ACT (0.85 - 1.00): FOUR BEATS
  // Beat 1 (0.85 - 0.88): Isometric array settles, camera holds, THE SPECIFICATION label arrives
  // Beat 2 (0.88 - 0.94): Spec sheet fades in, groups arrive one at a time, scene dims gently
  // Beat 3 (0.94 - 0.97): NOTABLE label and 3 official feature lines arrive one at a time
  // Beat 4 (0.97 - 1.00): Sheet and lines ease upward and away, final statement settles
  // -----------------------------------------------------------------------
  if (p >= 0.85) {
    if (specScrim) {
      if (p >= 0.88 && p < 0.97) {
        specScrim.classList.add('active');
      } else {
        specScrim.classList.remove('active');
      }
    }

    // BEAT 1 & 2: SPECIFICATION STAGE (0.85 - 0.97)
    if (specStage) {
      if (p >= 0.85 && p < 0.97) {
        specStage.classList.add('active');
        specStage.classList.remove('ease-away');
      } else if (p >= 0.97) {
        specStage.classList.add('ease-away');
      } else {
        specStage.classList.remove('active');
        specStage.classList.remove('ease-away');
      }
    }

    // Group arrivals (CORE, CAPTURE, INTERFACE, BODY)
    specGroups.forEach((group) => {
      if (group.dom) {
        if (p >= group.threshold && p < 0.97) {
          group.dom.classList.add('active');
        } else {
          group.dom.classList.remove('active');
        }
      }
    });

    // BEAT 3: NOTABLE LINES ARRIVAL (0.94 - 0.97)
    notableRows.forEach((row) => {
      if (row.dom) {
        if (p >= row.threshold && p < 0.97) {
          row.dom.classList.add('active');
        } else {
          row.dom.classList.remove('active');
        }
      }
    });

    // BEAT 4: CLOSING SETTLEMENT (0.97 - 1.00)
    if (closingSettlement) {
      if (p >= 0.97) {
        closingSettlement.classList.add('active');
      } else {
        closingSettlement.classList.remove('active');
      }
    }
  } else {
    if (specScrim) specScrim.classList.remove('active');
    if (specStage) {
      specStage.classList.remove('active');
      specStage.classList.remove('ease-away');
    }
    specGroups.forEach((g) => { if (g.dom) g.dom.classList.remove('active'); });
    notableRows.forEach((r) => { if (r.dom) r.dom.classList.remove('active'); });
    if (closingSettlement) closingSettlement.classList.remove('active');
  }

  // -----------------------------------------------------------------------
  // CAMERA POSITION & PARALLAX CHOREOGRAPHY
  // -----------------------------------------------------------------------
  const { basePos, baseTarget } = evaluateStagedCamera(p);

  const offset = new THREE.Vector3().subVectors(basePos, baseTarget);

  // Yaw rotation around Y axis with pointer parallax
  offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), orbitYaw + currentMouseX * 0.08);

  // Pitch rotation around horizontal right axis
  const rightAxis = new THREE.Vector3().crossVectors(offset, new THREE.Vector3(0, 1, 0)).normalize();
  offset.applyAxisAngle(rightAxis, orbitPitch + currentMouseY * 0.05);

  camera.position.copy(baseTarget).add(offset);
  camera.lookAt(baseTarget);

  // Render Frame
  renderer.render(scene, camera);
}

// Window resize and orientation change handlers
function handleResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, qualityDowngraded ? 1.0 : 1.25));
  updateScrollProgress();
}
window.addEventListener('resize', handleResize, { passive: true });
window.addEventListener('orientationchange', () => {
  setTimeout(handleResize, 100);
}, { passive: true });

// Launch 60FPS animation loop
requestAnimationFrame(animate);
