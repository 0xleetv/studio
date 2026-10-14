# CANON EOS R5 MARK II | PROJECT STATE (POLISH PASS: ALIVE INTRO, TYPOGRAPHIC TEXTURE, SEAMLESS TRANSITIONS)

## Current Build Status (Verified & Solid)
- **Local Port & Serving**: Live on `http://localhost:12420` (Python static server background daemon active, vendored offline Three.js r160 in `lib/`). Pure static deployment ready: zero server logic, zero build steps, hostable on any static platform.
- **Round 2 Material Realism**:
  - **Spectral Thin-Film Anti-Reflective Sheen**: Upgraded optical fluorite glass with physical thin-film interference (`iridescence: 0.72`, `iridescenceIOR: 1.38`, `iridescenceThicknessRange: [220, 480]`, cyan/magenta specular highlights `0x8aeaff`, clearcoat `0.35`). Sweeping highlights produce genuine chromatic optical dispersion fringes.
  - **Precision Torx Fasteners**: Procedurally modeled 6-point Torx screws (`torxScrew` physical metal and `torxRecess` dark matte core):
    - 4 Torx fasteners spaced around the stainless steel bayonet flange face at radius 0.72.
    - 4 Torx fasteners anchored on the corner brackets of the copper IBIS sensor carrier plate.
- **High-Resolution PBR Texture Maps**:
  - Synthesized via Python NumPy/PIL as seamless, tileable 2048x2048 PNGs in `assets/textures/`:
    - `leatherette_normal.png` (2048x2048, 9,040 KB) & `leatherette_roughness.png` (2048x2048, 1,568 KB): Realistic pebble grain with Sobel gradient normals and height-dependent roughness (shiny peaks, matte valleys).
    - `knurling_bump.png` (2048x2048, 8.3 KB): Precision machined vertical ridges with even pitch and crisp edges for RF focus/control rings.
    - `sensor_wafer.png` (2048x2048, 51.7 KB) & `sensor_wafer_roughness.png` (2048x2048, 15.0 KB): Emerald, gold, and cyan micro-circuit photodiode Bayer matrix with edge bond pads.
    - `brushed_metal.png` (2048x2048, 291.1 KB) & `brushed_metal_roughness.png` (2048x2048, 92.2 KB): Horizontal anisotropic grain for magnesium chassis and bayonet mount.
  - Loaded with Three.js `TextureLoader`, `RepeatWrapping`, and maximum hardware anisotropy. Zero runtime texture computation in the browser.
- **60 FPS Zero-Lag Spin & Performance Engine**:
  - `renderer.setPixelRatio` capped at `1.25` maximum; `powerPreference: 'high-performance'`.
  - The 360-degree intro spin is driven purely by the smoothed scroll value with zero per-frame geometry or material allocations, only matrix updates.
  - Full shader precompilation with `renderer.compile(scene, camera)` on initialization to eliminate runtime compilation hitches.
  - Preallocated SVG leader line elements (`#leader-dot`, `#leader-line`) and DOM nodes.
  - All scroll and pointer listeners are passive.
  - Smooth scroll lerp with damping `0.05` for weighted mechanical feel.
  - Pure GPU CSS transitions (`transform: translate3d(...)` and `opacity` only) with `will-change: transform, opacity`.
  - Silent adaptive quality monitor: drops pixel ratio to 1.0 if frame rate drops below 45 FPS for 2 seconds.

- **Alive Intro Lines (0.00 to 0.25)**:
  - 360-degree continuous rotation on Y-axis with camera fully assembled (zero premature disassembly).
  - Spin decelerates smoothly near 0.25, eliminating any hard snap as it transitions into Movement One.
  - Bold editorial brand set: red `CANON`, large `EOS R5 MARK II`, subtitle `READ FROM THE OUTSIDE IN`. Holds through 0.20, then releases gracefully.
  - Spoken lines drift continuously with the pointer and scene parallax (`translate3d(driftX, driftY, 0)`), riding the drag inertia subtly without fighting the inspection drag or adding scroll friction.
  - Words arrive one by one via preallocated `.word` elements with a soft 40ms stagger.
  - Letter spacing eases smoothly from wide (`0.08em`) to natural (`0.02em`) as each line settles.
  - Lines dissolve while still drifting on exit rather than suffering flat static fades.
  - Lines:
    - `FRONT VIEW. Engineered to be held. Every curve on this body has a reason.`
    - `TOP AND GRIP. Magnesium bones under leatherette skin, sealed against weather and time.`
    - `MOUNT AND RED RING. Behind this ring the machine begins. What you never see is what makes the image.`
    - `NOW WE GO INSIDE.`

- **Gradual Mature Dissection with Fluid Transitions (0.25 to 0.85)**:
  - **Movement 1 (0.25 to 0.45)**: Front RF optical barrel and 3 fluorite convex elements glide forward smoothly along the Z-axis, revealing the electro iris unit. Iris blades fan open (`0.35 - 0.45`). Camera transitions to a side optical profile.
  - **Movement 2 (0.45 to 0.65)**: Magnesium monocoque body and grip lift upward and separate from the optical core, exposing internal copper heat pipes, logic board, and bayonet mount. Camera frames a three-quarter interior view.
  - **Movement 3 (0.65 to 0.85)**: Chassis parts settle further apart. Iridescent stacked CMOS sensor on copper IBIS plate floats forward into center of frame. Camera dollies into macro sensor framing, then eases back.
  - Active spatial annotation panels drift with the pointer at a shallow depth (4 to 6px), feeling responsive without detaching from what they point to.
  - Panels styled for peak legibility: larger titles (`17px`), tight leading, comfortable body font (`14px`) with generous line height (`1.65`), key technical terms emphasized in monospace capitals (`<span class="ann-term">`), generous padding (`24px 32px`), and contrast ratio $\ge 12:1$ (exceeding the 7:1 threshold).
  - Leader line retracts and fades smoothly between beats (`transition: opacity 0.35s`), while the target anchor dot pulses once upon arrival (`@keyframes dotPulseAnim`).

- **Typographic Texture in The Final Act (0.85 to 1.00)**:
  - **Beat One (0.85 to 0.88)**: Exploded array settles into final balanced arrangement. Camera holds wide isometric framing, easing slightly upward so content has room. Monospace label arrives: `THE SPECIFICATION`, stretching its letter spacing from `0.36em` on arrival and relaxing to `0.22em`.
  - **Beat Two (0.88 to 0.94)**: Specification sheet fades in as a slim frosted glass panel, hairline border, high-contrast type. Desktop displays two columns (`CORE` and `CAPTURE` left, `INTERFACE` and `BODY` right); mobile displays single column. Groups arrive sequentially with an 80ms stagger between rows.
  - **Beat Three (0.94 to 0.97)**: Label `NOTABLE` stretches and relaxes its tracking, and three official feature lines arrive one at a time:
    - `Eye Control AF.` The camera focuses where you look.
    - `Pre continuous shooting.` It begins capturing from 15 frames before the shutter is fully pressed.
    - `In camera upscaling.` Neural network processing to approx 179 megapixels.
  - **Beat Four (0.97 to 1.00)**: Specification sheet and notable lines ease upward and away (`transform: translate3d(-50%, -60px, 0); opacity: 0;`). The closing statement arrives as the typographic centerpiece:
    - `A photograph begins where the eye cannot reach.` Rendered in large light display face, arriving word by word (`.closing-word`) with a soft 3D rotation (`rotateX(40deg)` -> `0deg`), staggered timing, and tracking tightening as it settles (`0.16em` -> `0.05em`).
    - Hairline rule (`90px`, `1px`, `rgba(255, 255, 255, 0.18)`).
    - Monospace footer in wide-tracked typography (`letter-spacing: 0.36em`): `CONCEPT DISSECTION STUDY`.

- **Device Readiness & Strict Typography Guardrails**:
  - Full automated verification via Chrome DevTools Protocol (`test_cdp.py`):
    - 0 console errors or warnings.
    - 0 forbidden characters in visible DOM text (`/`, `-`, `—`, `–`, `%`, `°`).
    - Verified smooth 60 FPS performance.
    - Verified full support for `prefers-reduced-motion` (transforms disabled, graceful simple fades).
    - Verified responsive single-column layout on mobile (375px) with zero horizontal overflow.

## Round 2 Next Refinements Roadmap
- **Interactive Component Spotlight**: Click/tap to focus on any exploded component to orbit directly around that individual part.
- **Internal Shutter Curtain Micro-Animation**: Trigger high-speed shutter curtain cycle on pointer click.
- **Heat Pipe Thermal Gradient Shading**: Add subtle hot-to-cold thermal color shift across the copper heat sink.
