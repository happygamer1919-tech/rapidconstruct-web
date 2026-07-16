"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  ContactShadows,
  PerspectiveCamera,
  OrbitControls,
  Environment,
} from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import { useReducedMotion } from "motion/react";
import {
  Color,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
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

const T_BLUEPRINT = 0.35; // brief blueprint hold before pieces land
const T_BUILD = 3; // the build itself (owner: faster)

// GLB node name -> build phase (0..4). Names come from HomeRC.blend.
const PHASES: RegExp[] = [
  /^plinth/, // incl. plinth_lawn
  /^(main|wing|entry)$|_interior$/,
  /^(roof_|ridge_|entry_roof|chimney)/,
  /^(w\d+_|sill|door|handle)/,
  /^(gutter_|ds\d)/,
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
  scale,
  position,
}: {
  playing: boolean;
  highlightPhase: number; // -1 = none
  onDone?: () => void;
  scale: number;
  position: [number, number, number];
}) {
  const { scene: cached } = useGLTF(HOUSE_URL);
  const rootRef = useRef<Group>(null);
  const clockRef = useRef(0);
  const doneRef = useRef(false);

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

    const buckets: Mesh[][] = Array.from({ length: PHASE_COUNT }, () => []);
    scene.traverse((o) => {
      const m = o as Mesh;
      if (!m.isMesh) return;
      m.castShadow = true;
      m.receiveShadow = true;
      // Cheap reflective glass (real transmission re-rendered the scene every
      // frame — the lag source). Dark interior liners sell it as real glazing.
      if (/^w\d+_g$/.test(m.name)) {
        m.material = new MeshPhysicalMaterial({
          color: "#a8c4d8",
          metalness: 0,
          roughness: 0.08,
          transparent: true,
          opacity: 0.45,
          reflectivity: 1,
          envMapIntensity: 1.4,
        });
      }
      const mat0 = m.material as MeshStandardMaterial;
      if (mat0 && "envMapIntensity" in mat0 && !mat0.transparent)
        mat0.envMapIntensity = 0.9;
      buckets[phaseOf(m.name)].push(m);
    });

    const window = 1 / PHASE_COUNT;
    const list: Piece[] = [];
    buckets.forEach((bucket, phase) => {
      const n = bucket.length || 1;
      bucket.forEach((mesh, j) => {
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
          start: phase * window + (j / n) * window * 0.45,
          dur: window * 0.55,
          real: mesh.material,
          colors,
        });
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
    for (const p of pieces) {
      const k = Math.min(1, Math.max(0, (build - p.start) / p.dur));
      if (k <= 0) {
        if (p.mesh.material !== ghost) p.mesh.material = ghost;
        p.mesh.position.y = p.y0;
        p.mesh.scale.set(p.s0[0], p.s0[1], p.s0[2]);
        continue;
      }
      if (p.mesh.material !== p.real) p.mesh.material = p.real;

      if (p.phase === 1) {
        p.mesh.position.y = p.y0 - 0.7 * (1 - easeOutCubic(k)); // walls rise
      } else if (p.phase === 2) {
        p.mesh.position.y = p.y0 + 1.1 * (1 - easeOutBack(k)); // roof drops
      } else if (p.phase === 3) {
        const s = 0.5 + 0.5 * easeOutBack(k); // windows/doors pop
        p.mesh.scale.set(p.s0[0] * s, p.s0[1] * s, p.s0[2] * s);
        p.mesh.position.y = p.y0;
      } else {
        p.mesh.position.y = p.y0 + 0.3 * (1 - easeOutCubic(k)); // foundation/details
      }

      if (p.colors.length) {
        const dim = hl >= 0 && p.phase !== hl;
        for (const c of p.colors) c.mat.color.lerp(dim ? FADE : c.orig, 0.1);
      }
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
    scale: 0.32,
    position: [1.15, -1.45, 0.1] as [number, number, number],
    camera: [2.6, 1.35, 7.6] as [number, number, number],
    target: [0.9, 0.35, 0] as [number, number, number],
  },
  box: {
    scale: 0.3,
    position: [0, -1.35, 0.1] as [number, number, number],
    camera: [3.4, 1.9, 7.2] as [number, number, number],
    target: [0, 0.3, 0] as [number, number, number],
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

  return (
    <Canvas
      shadows="soft"
      dpr={[1, 1.5]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 1.05;
      }}
      className="!absolute inset-0"
      aria-label="Model 3D: casa se construiește singură, etapă cu etapă"
    >
      <PerspectiveCamera makeDefault position={L.camera} fov={40} />
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[5, 8, 4]}
        intensity={2.2}
        color="#ffe6c2"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-6, 3, -4]} intensity={0.5} color="#cddcff" />
      <Suspense fallback={null}>
        <House
          playing={play && !reduce}
          highlightPhase={highlightPhase}
          onDone={onDone}
          scale={L.scale}
          position={L.position}
        />
      </Suspense>
      {/* Self-hosted HDR in its OWN Suspense so the house never waits on it. */}
      <Suspense fallback={null}>
        <Environment files="/hdri/venice_sunset_1k.hdr" />
      </Suspense>
      <ContactShadows
        position={[0, -1.51, 0]}
        opacity={0.35}
        scale={14}
        blur={2.4}
        far={5}
        frames={1}
      />
      <OrbitControls
        makeDefault
        target={L.target}
        autoRotate={false}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2.15}
      />
    </Canvas>
  );
}
