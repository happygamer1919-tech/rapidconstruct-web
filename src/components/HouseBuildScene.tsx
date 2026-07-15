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
import { useReducedMotion, type MotionValue } from "motion/react";
import {
  MeshBasicMaterial,
  type Group,
  type Mesh,
  type Material,
  type MeshStandardMaterial,
} from "three";

/**
 * HouseBuildScene — the homepage house as a DESIGN -> CONSTRUCTION story
 * (owner idea, after the two reference reels): at build = 0 the whole house
 * stands as a translucent blueprint (the 3D design); as the visitor scrolls,
 * each piece drops into place and turns real, phase by phase, lego-style:
 *   0 foundation -> 1 walls -> 2 roof -> 3 windows/doors -> 4 gutters/details.
 *
 * The build amount arrives as a MotionValue read inside useFrame, so scroll
 * updates never re-render the React tree. Pieces are the GLB's own named
 * nodes (plinth, main, roof_main, w1_f, gutter_e, ...) — no extra assets.
 * Reduced motion: rendered fully built, static (drag to rotate still works).
 */

const HOUSE_URL = "/models/house.glb";

// GLB node name -> build phase (0..4). Names come from HomeRC.blend.
const PHASES: RegExp[] = [
  /^(plinth)$/, // 0 fundația
  /^(main|wing|entry)$/, // 1 pereții
  /^(roof_|ridge_|entry_roof|chimney)/, // 2 acoperișul
  /^(w\d+_|sill|door|handle)/, // 3 ferestre + uși
  /^(gutter_|ds\d)/, // 4 jgheaburi + detalii
];
const PHASE_COUNT = PHASES.length;

function phaseOf(name: string) {
  for (let i = 0; i < PHASE_COUNT; i++) if (PHASES[i].test(name)) return i;
  return 1; // unknown pieces rise with the walls
}

type Piece = {
  mesh: Mesh;
  real: Material | Material[];
  y0: number;
  start: number; // build progress at which this piece starts
  dur: number; // how much progress its drop takes
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

function House({
  buildValue,
  fallback,
}: {
  buildValue?: MotionValue<number>;
  fallback: number;
}) {
  const { scene } = useGLTF(HOUSE_URL);
  const rootRef = useRef<Group>(null);

  const { prepared, pieces, ghost } = useMemo(() => {
    // Shared blueprint material: technical wireframe, reads as "the design".
    const ghostMat = new MeshBasicMaterial({
      color: "#5e7fa2",
      wireframe: true,
      transparent: true,
      opacity: 0.32,
    });

    // Bucket meshes per phase first so we can stagger inside each phase.
    const buckets: Mesh[][] = Array.from({ length: PHASE_COUNT }, () => []);
    scene.traverse((o) => {
      const m = o as Mesh;
      if (!m.isMesh) return;
      m.castShadow = true;
      m.receiveShadow = true;
      const mat = m.material as MeshStandardMaterial;
      if (mat && "envMapIntensity" in mat) mat.envMapIntensity = 0.9;
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
          // Pieces of a phase start one after another across the first 45%
          // of the phase window; each drop lasts 55% of it — pieces land
          // quickly and the phase never trails its text slide (owner: the
          // first pass took too long).
          start: phase * window + (j / n) * window * 0.45,
          dur: window * 0.55,
        });
      });
    });
    return { prepared: scene, pieces: list, ghost: ghostMat };
  }, [scene]);

  // useFrame mutates the three.js meshes directly every frame (the R3F
  // imperative pattern — no React re-renders on scroll), which the react
  // compiler's immutability lint cannot model.
  /* eslint-disable react-hooks/immutability */
  useFrame(() => {
    const b = buildValue ? buildValue.get() : fallback;
    for (const p of pieces) {
      const k = Math.min(1, Math.max(0, (b - p.start) / p.dur));
      if (k <= 0) {
        // Still on the drawing board: blueprint lines, exact position.
        if (p.mesh.material !== ghost) p.mesh.material = ghost;
        p.mesh.position.y = p.y0;
      } else {
        if (p.mesh.material !== p.real) p.mesh.material = p.real;
        // Drop in from slightly above and settle (lego snap). Short drop so
        // even a very fast scroll never scatters pieces far off the house.
        p.mesh.position.y = p.y0 + 0.4 * (1 - easeOutCubic(k));
      }
    }
  });
  /* eslint-enable react-hooks/immutability */

  return (
    <group ref={rootRef}>
      <primitive
        object={prepared}
        // Blender scene is ~13.5m wide, ground at y=0 after Y-up export.
        scale={0.3}
        position={[-0.2, -1.15, 0.1]}
      />
    </group>
  );
}

useGLTF.preload(HOUSE_URL);

export default function HouseBuildScene({
  buildValue,
  build = 0,
  active = true,
}: {
  buildValue?: MotionValue<number>;
  build?: number; // static fallback (reduced motion => fully built)
  active?: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <Canvas
      shadows="soft"
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 1.05;
      }}
      className="!absolute inset-0"
      aria-label="Model 3D: casa se construiește etapă cu etapă, de la proiect la predare"
    >
      <PerspectiveCamera makeDefault position={[4.6, 2.9, 5.4]} fov={40} />
      {/* Warm low sun + cool sky fill + soft rim — the golden-hour rig. */}
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
          buildValue={reduce ? undefined : buildValue}
          fallback={reduce ? 1 : build}
        />
      </Suspense>
      {/* Self-hosted HDR in its OWN Suspense so the house never waits on it. */}
      <Suspense fallback={null}>
        <Environment files="/hdri/venice_sunset_1k.hdr" />
      </Suspense>
      <ContactShadows
        position={[0, -1.16, 0]}
        opacity={0.35}
        scale={12}
        blur={2.4}
        far={5}
      />
      <OrbitControls
        makeDefault
        target={[0, 0.15, 0]}
        autoRotate={!reduce}
        autoRotateSpeed={0.4}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2.15}
      />
    </Canvas>
  );
}
