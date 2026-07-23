"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useGLTF,
  ContactShadows,
  PerspectiveCamera,
  OrbitControls,
  Environment,
} from "@react-three/drei";
import { Suspense, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import {
  ACESFilmicToneMapping,
  Color,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Vector3,
  type Group,
  type Mesh,
  type Material,
} from "three";

/**
 * HouseBuildScene v3 — the hero house builds itself ONCE, lego-style, then
 * STAYS built (owner: no loop, no text during the build). Per-phase motion:
 *   0 foundation: slabs drop + settle
 *   1 walls: rise up out of the ground
 *   2 roof: pieces drop from the sky with a lego-snap
 *   3 windows/doors: pop-scale into their openings
 *   4 gutters/details: short drop, last click
 * onDone fires once when the build finishes (parent fades its text in).
 * highlightPhase (from the scroll story) keeps that phase full-colour and
 * fades the rest toward the page tone. Reduced motion: fully built, static.
 */

const HOUSE_URL = "/models/house.glb";

// Owner: "without pauses, more faster". The blueprint hold was a literal dead
// beat — 0.35s where nothing moved — so it is gone: pieces start landing at once
// and the not-yet-placed ones still read as the blueprint ghost, which is the
// look we wanted from the hold anyway, without stopping the build.
const T_BLUEPRINT = 0;
// 4s, deliberately SLOWER than the 1.2s it was. Owner asked for "faster" four
// times (6.5 -> 3 -> 2.2 -> 1.6 -> 1.2) while the model grew 84 -> 313 pieces.
// Together those made the thing he actually wanted — watching it build piece by
// piece — physically impossible: at 1.2s a piece started every 3.2ms, i.e. ~5 per
// 16.7ms frame, so the roof assembled in 0.27s and read as a sheet appearing
// rather than assembly. He picked seeing every piece over raw speed.
//   1.2s -> 3.2ms apart, 5.2 pieces/frame, roof in 0.27s  (blur)
//   4.0s -> 10.8ms apart, 1.6 pieces/frame, roof in 0.89s (nearly one-by-one)
// Literal one-piece-per-frame needs ~6.3s at 313 pieces — the speed he rejected.
// If piece count changes a lot, re-do this arithmetic; it is what makes or breaks
// the whole effect.
//
// 2.2s. Getting here meant noticing the knob I had been ignoring: what makes the
// build read as a WAVE is not its length, it is how many pieces are in the air at
// once (= flight / spacing). At 3.4s with a 544ms flight, 59 pieces were airborne
// simultaneously — a swarm. Shorten each piece's FLIGHT and the same build reads
// as distinct pieces landing, which frees the total to come down:
//   3.4s, flight 544ms -> 59 airborne, roof 0.76s (wave)
//   2.2s, flight 110ms -> 16 airborne, roof 0.56s (distinct pieces, and faster)
// Floor: below ~100ms of flight the piece is gone before the eye catches it (~6
// frames), so do not chase speed by cutting PIECE_DUR further — cut piece count
// or accept the blur.
const T_BUILD = 2.2;

// Fraction of the build each piece spends in flight. 0.05 of 2.2s = ~110ms, about
// 6 frames — brief, but enough to see the piece travel and snap.
//
// This was 0.16 (a 544ms flight) and that was the real bug behind "it doesn't
// build like the walls". Flight/spacing = how many pieces are airborne at once:
// 0.16 put 59 in the air simultaneously, so the eye saw a moving cloud instead of
// pieces landing. 0.05 puts 16 up — the same "every brick in motion" feel the
// owner asked for, but legible as a sequence. Raising this back up makes the
// build mushier, not richer.
const PIECE_DUR = 0.05;

// Owner: "I want the blue lines to stay a bit longer". Each piece keeps the
// blueprint-wireframe material through the first part of its FLIGHT and only
// materialises at this fraction of it — so the blue lingers on screen well into
// the build without slowing anything down (motion is untouched).
const GHOST_UNTIL = 0.55;

// GLB node name -> build phase (0..4). Names come from HomeRC.blend.
//
// The garden (path, trees, shrubs, hedge) is named `plinth_*` in the .blend, so a
// bare /^plinth/ swept it into phase 0 and planted a mature garden *while pouring
// the foundation* — and the tour then highlighted it as "Fundația". Landscaping is
// the LAST thing a builder does, which is exactly what phase 4 says ("Ultimele
// detalii… apoi predăm cheia"). So phase 0 is now explicit about which plinth
// pieces are groundworks, and the planting lands in phase 4.
// Order matters: phaseOf returns the FIRST match.
const PHASES: RegExp[] = [
  /^plinth$|^plinth_lawn$|^plinth_base/, // groundworks: slab, lawn, stone base course
  /^(main|wing|entry)$|_interior$/,
  /^(roof_|ridge_|entry_roof|chimney)/,
  /^(w\d+_|sill|door|handle)/,
  /^(gutter_|ds\d)|^plinth_(path|tree|shrub|hedge)/, // details + landscaping
];
const PHASE_COUNT = PHASES.length;

function phaseOf(name: string) {
  for (let i = 0; i < PHASE_COUNT; i++) if (PHASES[i].test(name)) return i;
  return 1;
}

type PieceColor = { mat: MeshStandardMaterial; orig: Color };
type Piece = {
  mesh: Mesh;
  phase: number;
  y0: number;
  s0: [number, number, number];
  r0: [number, number, number];
  spin: number; // deterministic tumble, settles to r0 on landing
  start: number; // 0..1 within the build
  dur: number;
  real: Material | Material[];
  colors: PieceColor[];
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
// lego-snap overshoot on landing
function easeOutBack(t: number) {
  const c1 = 1.2;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

const FADE = new Color("#e7e1d6"); // page-ish tone for de-highlighted phases

function House({
  playing,
  highlightPhase,
  onDone,
  onRest,
  scale,
  position,
}: {
  playing: boolean;
  highlightPhase: number; // -1 = none
  onDone?: () => void;
  /** fires when nothing is animating any more, so the canvas can stop drawing */
  onRest?: () => void;
  scale: number;
  position: [number, number, number];
}) {
  const { scene: cached } = useGLTF(HOUSE_URL);
  const rootRef = useRef<Group>(null);
  const clockRef = useRef(0);
  const doneRef = useRef(false);
  const restedRef = useRef(false);
  const prevHlRef = useRef(highlightPhase);

  const { prepared, pieces, ghost } = useMemo(() => {
    // useGLTF caches ONE scene per URL, and this component now mounts twice on
    // the homepage (hero + tour). Both instances animate positions and lerp
    // material colours every frame, so sharing the graph makes them fight —
    // the tour's phase dimming bled onto the hero. Clone per instance; geometry
    // is still shared by reference, and materials get cloned per piece below.
    const scene = cached.clone(true);

    const ghostMat = new MeshBasicMaterial({
      color: "#4f7dbd",
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });

    // Small pieces do not cast shadows. The 3D session profiled the real build:
    // ~480 draw calls per frame, of which ~165 were the shadow pass re-drawing
    // every mesh — and the hero is draw-call-bound (only ~24k triangles). Tiny
    // pieces (muntins, trims, sills, quoin blocks, snow guards, fence pickets,
    // handles, downspouts) contribute no readable shadow at hero distance, so
    // excluding them cuts shadow-caster draws with zero visual cost.
    const NO_SHADOW =
      /^(w\d+_(mun|trim)|sill|quoin|roof_snowguards|plinth_hedge_fence|handle|ds\d)/;

    const buckets: Mesh[][] = Array.from({ length: PHASE_COUNT }, () => []);
    scene.traverse((o) => {
      const m = o as Mesh;
      if (!m.isMesh) return;
      m.castShadow = !NO_SHADOW.test(m.name);
      m.receiveShadow = true;
      // Cheap reflective glass (real transmission re-rendered the scene every
      // frame — the lag source). Dark interior liners sell it as real glazing.
      if (/^w\d+_g$/.test(m.name)) {
        m.material = new MeshPhysicalMaterial({
          color: "#a8c4d8",
          metalness: 0,
          roughness: 0.08,
          transparent: true,
          opacity: 0.3,
          reflectivity: 1,
          envMapIntensity: 1.4,
          // Warm "lights are on" glow. This HAS to live here, not in Blender: the
          // scene swaps the glass material at runtime, so an emissive authored in
          // the .blend would be thrown away. Sells a lived-in house, costs nothing.
          emissive: new Color("#ffcf8f"),
          emissiveIntensity: 0.22,
        });
      }
      const mat0 = m.material as MeshStandardMaterial;
      if (mat0 && "envMapIntensity" in mat0 && !mat0.transparent)
        mat0.envMapIntensity = 0.9;
      buckets[phaseOf(m.name)].push(m);
    });

    // CONVEYOR TIMING (owner: "more lego, without pauses, every brick in motion").
    //
    // The old scheme gave every phase a fixed 1/5 of the build no matter how many
    // pieces it held — phase 0 has 5 pieces, phase 3 has 46. So the sparse phases
    // crawled and the dense ones rushed, which is what read as pauses.
    //
    // Now every piece gets the SAME short flight and starts are spread evenly
    // across the whole build, so the number of bricks in the air stays roughly
    // constant end to end: a conveyor, not five bursts. Story order is preserved
    // (foundation -> walls -> roof -> openings -> details) and, within a phase,
    // pieces land BOTTOM-UP like real courses.
    //
    // Order by world-space bounding-box centre, not node.position: only 52 of the
    // 84 nodes carry a translation — the other 32 have their transform baked into
    // the geometry and would all sort as y=0.
    scene.updateMatrixWorld(true);
    const centreY = (m: Mesh) => {
      if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
      const c = m.geometry.boundingBox!.getCenter(new Vector3());
      return c.applyMatrix4(m.matrixWorld).y;
    };

    // Ridge/hip caps go on LAST, after the slope courses they sit on — that is
    // the order a real roofer works in: tile up the slope, then cap the hips.
    // Height alone interleaves them, because a hip cap runs UP the hip so its
    // centre sits mid-slope. (The 3D session flagged this as an alphabetical
    // sort problem — it isn't, we never sort by name — but it was right that caps
    // were landing among the courses.)
    const isCap = (m: Mesh) => /^(ridge_|chimney_cap)/.test(m.name);

    const ordered: { mesh: Mesh; phase: number }[] = [];
    buckets.forEach((bucket, phase) => {
      bucket
        .slice()
        .sort(
          (a, b) =>
            Number(isCap(a)) - Number(isCap(b)) || centreY(a) - centreY(b),
        )
        .forEach((mesh) => ordered.push({ mesh, phase }));
    });

    const list: Piece[] = [];
    const last = Math.max(1, ordered.length - 1);
    ordered.forEach(({ mesh, phase }, i) => {
      // Clone materials per piece so highlight fading is independent.
      const mats = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      const colors: PieceColor[] = [];
      const cloned = mats.map((mm) => {
        const c = (mm as MeshStandardMaterial).clone();
        if ((c as MeshStandardMaterial).color)
          colors.push({ mat: c, orig: c.color.clone() });
        return c;
      });
      mesh.material = Array.isArray(mesh.material) ? cloned : cloned[0];
      list.push({
        mesh,
        phase,
        y0: mesh.position.y,
        s0: [mesh.scale.x, mesh.scale.y, mesh.scale.z],
        r0: [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z],
        // deterministic per-piece tumble — no Math.random, so every visitor and
        // every screenshot sees the identical build
        spin: (((i * 2654435761) % 1000) / 1000 - 0.5) * 0.5,
        start: (i / last) * (1 - PIECE_DUR),
        dur: PIECE_DUR,
        real: mesh.material,
        colors,
      });
    });
    return { prepared: scene, pieces: list, ghost: ghostMat };
  }, [cached]);

  /* eslint-disable react-hooks/immutability */
  useFrame((_, dt) => {
    let build = 1;
    if (playing && !doneRef.current) {
      clockRef.current += dt;
      const t = clockRef.current;
      build = t < T_BLUEPRINT ? 0 : Math.min(1, (t - T_BLUEPRINT) / T_BUILD);
      if (build >= 1) {
        doneRef.current = true;
        onDone?.();
      }
    } else if (!doneRef.current) {
      doneRef.current = true;
      onDone?.();
    }

    const hl = highlightPhase;
    // A new highlight means the colours must travel again — un-rest so the parent
    // puts the loop back to "always" until they settle.
    if (hl !== prevHlRef.current) {
      prevHlRef.current = hl;
      restedRef.current = false;
    }
    let maxColorDelta = 0;
    for (const p of pieces) {
      const k = Math.min(1, Math.max(0, (build - p.start) / p.dur));
      if (k <= 0) {
        // not placed yet: sits as the blueprint ghost, in its authored pose
        if (p.mesh.material !== ghost) p.mesh.material = ghost;
        p.mesh.position.y = p.y0;
        p.mesh.scale.set(p.s0[0], p.s0[1], p.s0[2]);
        p.mesh.rotation.set(p.r0[0], p.r0[1], p.r0[2]);
        continue;
      }
      // Materialise mid-flight (GHOST_UNTIL), not at launch: the piece flies in
      // as blue wireframe first, then becomes real as it settles.
      const want = k < GHOST_UNTIL && !doneRef.current ? ghost : p.real;
      if (p.mesh.material !== want) p.mesh.material = want;

      // Every piece now FLIES IN and snaps — the lego read the owner asked for.
      // Walls still rise out of the ground (a wall does not fall from the sky);
      // everything else drops from above with an overshoot click.
      const settle = 1 - easeOutBack(k);
      if (p.phase === 1) {
        p.mesh.position.y = p.y0 - 0.7 * (1 - easeOutCubic(k)); // walls rise
      } else if (p.phase === 2) {
        p.mesh.position.y = p.y0 + 1.4 * settle; // roof drops
      } else if (p.phase === 3) {
        const s = 0.55 + 0.45 * easeOutBack(k); // openings pop into their holes
        p.mesh.scale.set(p.s0[0] * s, p.s0[1] * s, p.s0[2] * s);
        p.mesh.position.y = p.y0 + 0.5 * settle;
      } else {
        p.mesh.position.y = p.y0 + 0.6 * settle; // groundworks + details/garden
      }
      // Tumble that settles exactly onto the authored rotation. Walls are left
      // alone: a rotating wall reads as broken, not as assembly.
      if (p.phase !== 1) {
        const t = p.spin * settle;
        p.mesh.rotation.set(p.r0[0] + t, p.r0[1], p.r0[2] + t);
      }

      if (p.colors.length) {
        const dim = hl >= 0 && p.phase !== hl;
        for (const c of p.colors) {
          const target = dim ? FADE : c.orig;
          c.mat.color.lerp(target, 0.1);
          // how far this colour still has to travel — drives the rest check below
          const d =
            Math.abs(c.mat.color.r - target.r) +
            Math.abs(c.mat.color.g - target.g) +
            Math.abs(c.mat.color.b - target.b);
          if (d > maxColorDelta) maxColorDelta = d;
        }
      }
    }

    // PERF: once the build has settled and the colours have stopped moving, this
    // scene is a STILL IMAGE — but the canvas kept re-rendering it forever at full
    // rate, shadow pass and all, for 313 meshes. That was the lag.
    //
    // The old check was `hl < 0`, which only ever let the HERO rest. The tour
    // passes highlightPhase={segment} — 0 on arrival — so it never rested, and it
    // mounts at page load (useInView has a 200px margin, so it is "in view" behind
    // the hero). Two 313-mesh canvases, both looping, from the first second.
    //
    // A lerp toward a target never mathematically arrives, so waiting for hl < 0
    // was never going to work for the tour. Instead: rest when every colour is
    // within a delta nobody can see. A new highlight re-arms it (below).
    const settled = maxColorDelta < 0.004;
    if (doneRef.current && settled && !restedRef.current) {
      restedRef.current = true;
      onRest?.();
    }
  });
  /* eslint-enable react-hooks/immutability */

  return (
    <group ref={rootRef}>
      <primitive object={prepared} scale={scale} position={position} />
    </group>
  );
}

useGLTF.preload(HOUSE_URL);

/**
 * layout "hero" offsets the house right so the headline has clear space on the
 * left; "box" centres it for the boxed scroll tour, which has its own column.
 */
const LAYOUT = {
  hero: {
    scale: 0.28,
    // Shifted right (was x=3) once the jerkinhead landed. The gable face sits on
    // the MAIN block — the LEFT end of the house — so it fell under the text
    // scrim, which washed the near-black timber truss to pale grey (measured on
    // the gable: darkest pixel 13 with no scrim, 28 with it). Weakening the scrim
    // instead dropped the headline to 1.25 contrast, i.e. the "text disappears"
    // bug again. So the house moves, not the scrim.
    position: [3.9, -0.75, 0.1] as [number, number, number],
    camera: [2.6, 1.35, 7.6] as [number, number, number],
    target: [3.3, 0.3, 0] as [number, number, number],
    shadowY: -0.81, // must track position.y or the house floats off its shadow
  },
  // A phone has no room beside the copy, so the house drops into the bottom
  // half and the copy takes the top — no scrim heavy enough to fix the overlap
  // would leave the house visible, and the house is the point of the hero.
  heroMobile: {
    scale: 0.34,
    // Owner, twice: the phone hero "looks ugly, bring it more up". Raised and
    // enlarged so the house fills the space under the copy instead of sitting
    // small and low with dead screen beneath it.
    position: [0.15, -1.55, 0.1] as [number, number, number],
    // Pulled back hard: at a 390px width the 40deg VERTICAL fov leaves only
    // ~19deg horizontally, so the desktop camera crops the house to a wall.
    camera: [2.2, 1.1, 13.5] as [number, number, number],
    target: [0.15, -0.75, 0] as [number, number, number],
    shadowY: -1.61,
  },
  box: {
    scale: 0.3,
    position: [0, -1.35, 0.1] as [number, number, number],
    camera: [3.4, 1.9, 7.2] as [number, number, number],
    target: [0, 0.3, 0] as [number, number, number],
    shadowY: -1.41,
  },
};

export default function HouseBuildScene({
  active = true,
  highlightPhase = -1,
  onDone,
  play = true,
  layout = "hero",
}: {
  active?: boolean;
  highlightPhase?: number;
  onDone?: () => void;
  /** false = skip the build, render the finished house (the boxed tour). */
  play?: boolean;
  layout?: keyof typeof LAYOUT;
}) {
  const reduce = useReducedMotion();
  const L = LAYOUT[layout];

  // PERF: a FINISHED, motionless house was rendering forever at full rate — 313
  // meshes plus a shadow pass, every frame, for a still image. That was the lag.
  // Once the build settles AND the phase colours stop moving we drop to "demand":
  // R3F only redraws when asked, and drei's OrbitControls invalidates on drag, so
  // spinning the house still works.
  //
  // This used to rest the hero only. The tour never rested (its highlight is
  // always set), and it MOUNTS AT PAGE LOAD — useInView's 200px margin makes it
  // "in view" right behind the hero — so two 313-mesh canvases looped from the
  // first second. Changing the highlight re-arms the loop below.
  const [rested, setRested] = useState(false);
  // React's "adjust state when a prop changes" pattern (previous value in state,
  // not a ref — refs may not be read during render). A new phase means the colours
  // must travel again, so re-arm the loop.
  const [seenHl, setSeenHl] = useState(highlightPhase);
  if (seenHl !== highlightPhase) {
    setSeenHl(highlightPhase);
    if (rested) setRested(false);
  }
  const frameloop = !active ? "never" : rested ? "demand" : "always";

  return (
    <Canvas
      frameloop={frameloop}
      shadows="soft"
      dpr={[1, 1.5]}
      // Staying on ACES. The 3D session recommended AgX, arguing ACES "washes the
      // warm palette" — but that was researched, not verified, and it does not
      // survive the real render. Measured on a tight roof/wall crop (page
      // background excluded; including it dilutes the numbers to noise):
      //   ACES 1.05 -> mean luminance 155.9, saturation 0.131, contrast range 216
      //   AgX  1.10 -> mean luminance 159.9, saturation 0.100, contrast range 197
      // AgX came out brighter, 24% LESS saturated and lower contrast — it is what
      // made the house look washed out. Exactly backwards. Re-measure before
      // changing this, don't re-argue it from theory.
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1.18,
      }}
      className="!absolute inset-0"
      aria-label="Model 3D: casa se construiește singură, etapă cu etapă"
    >
      <PerspectiveCamera makeDefault position={L.camera} fov={40} />
      {/* Lighting matched to the reference photo (docs/reference-match/). Measured
          on the house area, our render vs the photo:
            before: mean 197.5, std-dev 43.7, deep shadow 0.5%, bright 53.4%
            photo : mean 130.2, std-dev 71.8, deep shadow 19.6%, bright 19.3%
          i.e. the house had essentially NO shadows and half of it was blown out.
          That flatness is what read as "plastic" — not the geometry, which is why
          five sessions of adding detail never fixed it. Ambient was the culprit:
          0.3 of flat fill erases the shadows a hard sun would carve. */}
      <ambientLight intensity={0.12} />
      {/* PERF: shadow-autoUpdate stops once the house has settled. Nothing moves
          after that, so re-rendering the shadow map for 240 casters every frame
          was pure waste. `needsUpdate` forces exactly one final map. */}
      {/* Key sun: high front-LEFT, matching where the sun sits in the reference
          photo. Harder and warmer than before so the eaves, the porch and the
          gable trusses actually cast. */}
      <directionalLight
        position={[-6, 8, 5]}
        intensity={3.2}
        color="#ffdcae"
        castShadow
        // 512, was 1024: the profile showed the hero is draw-call-bound, and at
        // this scene scale the soft shadows read identically at half resolution
        // (verified side by side before shipping). Quarter the shadow fill cost.
        shadow-mapSize={[512, 512]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-autoUpdate={!rested}
        shadow-needsUpdate={rested}
      />
      <directionalLight
        position={[-6, 3, -4]}
        intensity={0.5}
        color="#cddcff"
      />
      {/* Dim back-rim: lifts the roofline off the page tone so the silhouette
          reads. Free — one light, no shadow map. (No SSAO/postprocessing here on
          purpose: it would sink the low-end phone that already cannot finish a
          Lighthouse run. Ambient occlusion belongs baked in the texture.) */}
      <directionalLight
        position={[-3, 4, -7]}
        intensity={0.35}
        color="#ffd9a0"
      />
      <Suspense fallback={null}>
        <House
          playing={play && !reduce}
          highlightPhase={highlightPhase}
          onDone={onDone}
          onRest={() => setRested(true)}
          scale={L.scale}
          position={L.position}
        />
      </Suspense>
      {/* Self-hosted HDR in its OWN Suspense so the house never waits on it.
          environmentIntensity is the other free lever the 3D session flagged:
          the default 1.0 under-lights the plaster. Zero bytes. */}
      <Suspense fallback={null}>
        <Environment
          files="/hdri/venice_sunset_1k.hdr"
          environmentIntensity={0.55}
        />
      </Suspense>
      <ContactShadows
        position={[0, L.shadowY, 0]}
        opacity={0.35}
        scale={14}
        blur={2.4}
        far={5}
        frames={1}
      />
      <Controls target={L.target} />
    </Canvas>
  );
}

/**
 * OrbitControls that explicitly redraws on drag.
 *
 * Once the build settles the canvas drops to frameloop="demand", and dragging
 * silently stopped rotating the house — the controls moved the camera but
 * nothing asked for a new frame, so the picture never changed. Caught by driving
 * a real drag and diffing the pixels; it would have shipped as "the house is
 * frozen". invalidate() on change is what makes on-demand rendering interactive.
 */
function Controls({ target }: { target: [number, number, number] }) {
  const invalidate = useThree((s) => s.invalidate);
  return (
    <OrbitControls
      makeDefault
      target={target}
      onChange={() => invalidate()}
      autoRotate={false}
      enableZoom={false}
      enablePan={false}
      minPolarAngle={Math.PI / 5}
      maxPolarAngle={Math.PI / 2.15}
    />
  );
}
