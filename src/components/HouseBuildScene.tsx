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
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  type Group,
  type Mesh,
  type Material,
  type MeshStandardMaterial,
} from "three";

/**
 * HouseBuildScene — the homepage hero house that BUILDS ITSELF (owner
 * direction: "the home should motion by itself", no scroll needed). A looping
 * timeline plays like a short film:
 *   blueprint hold -> pieces drop in phase by phase -> finished house holds
 *   and rotates -> quick un-build back to blueprint -> repeat.
 *
 * Phases (GLB node names from HomeRC.blend):
 *   0 foundation -> 1 walls -> 2 roof -> 3 windows/doors -> 4 gutters/details.
 * The parent gets onStage(stage) callbacks (-1 = blueprint) to sync its big
 * caption. Reduced motion: fully built, static (drag to rotate still works).
 */

const HOUSE_URL = "/models/house.glb";

// Timeline (seconds)
const T_BLUEPRINT = 2.2; // hold the design
const T_BUILD = 11; // the build itself
const T_DONE = 6; // hold the finished house
const T_UNBUILD = 1.8; // dissolve back to the blueprint
const T_TOTAL = T_BLUEPRINT + T_BUILD + T_DONE + T_UNBUILD;

// GLB node name -> build phase (0..4). Names come from HomeRC.blend.
const PHASES: RegExp[] = [
  /^plinth/, // incl. plinth_lawn
  /^(main|wing|entry)$/,
  /^(roof_|ridge_|entry_roof|chimney)/,
  /^(w\d+_|sill|door|handle)/,
  /^(gutter_|ds\d)/,
];
const PHASE_COUNT = PHASES.length;

function phaseOf(name: string) {
  for (let i = 0; i < PHASE_COUNT; i++) if (PHASES[i].test(name)) return i;
  return 1;
}

type Piece = {
  mesh: Mesh;
  real: Material | Material[];
  y0: number;
  start: number;
  dur: number;
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Timeline position (s) -> build progress 0..1 and stage (-1..4). */
function timeline(t: number): { build: number; stage: number } {
  const tt = t % T_TOTAL;
  if (tt < T_BLUEPRINT) return { build: 0, stage: -1 };
  if (tt < T_BLUEPRINT + T_BUILD) {
    const b = (tt - T_BLUEPRINT) / T_BUILD;
    return {
      build: b,
      stage: Math.min(PHASE_COUNT - 1, Math.floor(b * PHASE_COUNT)),
    };
  }
  if (tt < T_BLUEPRINT + T_BUILD + T_DONE)
    return { build: 1, stage: PHASE_COUNT - 1 };
  const back = (tt - T_BLUEPRINT - T_BUILD - T_DONE) / T_UNBUILD;
  return { build: 1 - back, stage: -1 };
}

function House({
  playing,
  fallback,
  onStage,
}: {
  playing: boolean;
  fallback: number;
  onStage?: (stage: number) => void;
}) {
  const { scene } = useGLTF(HOUSE_URL);
  const rootRef = useRef<Group>(null);
  const clockRef = useRef(0);
  const stageRef = useRef(-2);

  const { prepared, pieces, ghost } = useMemo(() => {
    // Blueprint material: brighter technical wireframe (owner liked the blue
    // line look — make it clearly visible on big screens).
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
      // Realistic glass for the window panes (nodes named w*_g) — only if
      // the GLB didn't already ship real transmissive glass (v5 does).
      const already = m.material as MeshPhysicalMaterial;
      if (/^w\d+_g$/.test(m.name) && !(already && already.transmission > 0)) {
        m.material = new MeshPhysicalMaterial({
          color: "#cfe4f0",
          metalness: 0,
          roughness: 0.08,
          transmission: 0.85,
          ior: 1.45,
          thickness: 0.02,
          envMapIntensity: 1.2,
        });
      }
      const mat = m.material as MeshStandardMaterial;
      if (mat && "envMapIntensity" in mat && !("transmission" in mat))
        mat.envMapIntensity = 0.9;
      buckets[phaseOf(m.name)].push(m);
    });

    const window = 1 / PHASE_COUNT;
    const list: Piece[] = [];
    buckets.forEach((bucket, phase) => {
      const n = bucket.length || 1;
      bucket.forEach((mesh, j) => {
        list.push({
          mesh,
          real: mesh.material,
          y0: mesh.position.y,
          start: phase * window + (j / n) * window * 0.45,
          dur: window * 0.55,
        });
      });
    });
    return { prepared: scene, pieces: list, ghost: ghostMat };
  }, [scene]);

  // useFrame mutates the three.js meshes directly every frame (the R3F
  // imperative pattern — no React re-renders), which the react compiler's
  // immutability lint cannot model.
  /* eslint-disable react-hooks/immutability */
  useFrame((_, dt) => {
    let build = fallback;
    let stage = PHASE_COUNT - 1;
    if (playing) {
      clockRef.current += dt;
      const s = timeline(clockRef.current);
      build = s.build;
      stage = s.stage;
    }
    if (onStage && stage !== stageRef.current) {
      stageRef.current = stage;
      onStage(stage);
    }
    for (const p of pieces) {
      const k = Math.min(1, Math.max(0, (build - p.start) / p.dur));
      if (k <= 0) {
        if (p.mesh.material !== ghost) p.mesh.material = ghost;
        p.mesh.position.y = p.y0;
      } else {
        if (p.mesh.material !== p.real) p.mesh.material = p.real;
        p.mesh.position.y = p.y0 + 0.4 * (1 - easeOutCubic(k));
      }
    }
  });
  /* eslint-enable react-hooks/immutability */

  return (
    <group ref={rootRef}>
      <primitive
        object={prepared}
        // Bigger on screen (full-viewport hero), shifted right of the copy.
        scale={0.32}
        position={[1.15, -1.45, 0.1]}
      />
    </group>
  );
}

useGLTF.preload(HOUSE_URL);

export default function HouseBuildScene({
  build = 0,
  active = true,
  onStage,
}: {
  build?: number; // static fallback when not playing (reduced motion => 1)
  active?: boolean;
  onStage?: (stage: number) => void;
}) {
  const reduce = useReducedMotion();

  return (
    <Canvas
      shadows="soft"
      dpr={[1, 2]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 1.05;
      }}
      className="!absolute inset-0"
      aria-label="Model 3D: casa se construiește singură, de la proiect la predare"
    >
      <PerspectiveCamera makeDefault position={[5.0, 2.9, 5.6]} fov={40} />
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[5, 8, 4]}
        intensity={2.2}
        color="#ffe6c2"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-6, 3, -4]} intensity={0.5} color="#cddcff" />
      <directionalLight position={[-3, 5, -6]} intensity={0.7} color="#ffd9a0" />
      <Suspense fallback={null}>
        <House
          playing={!reduce}
          fallback={reduce ? 1 : build}
          onStage={onStage}
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
      />
      <OrbitControls
        makeDefault
        target={[0.8, 0.15, 0]}
        autoRotate={!reduce}
        autoRotateSpeed={0.35}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2.15}
      />
    </Canvas>
  );
}
