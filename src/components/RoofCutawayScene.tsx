"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  ContactShadows,
  PerspectiveCamera,
  OrbitControls,
} from "@react-three/drei";
import { Suspense, useRef } from "react";
import { useReducedMotion, type MotionValue } from "motion/react";
import type { Group } from "three";

/**
 * RoofCutawayScene — a realistic roof section that is FULLY BUILT when closed
 * (explode = 0) and lifts apart layer-by-layer as the visitor scrolls
 * (explode 0 -> 1). Owner direction: "a full built one, and on scrolling it
 * starts opening up, when it opens the description appears."
 *
 * The explode amount arrives as a MotionValue read inside useFrame, so scroll
 * updates never re-render the React tree. 5 layers, matching the legend copy:
 *   0 Căpriori (rafters + plates)  1 Termoizolație (insulation)
 *   2 Membrană  3 Șipci (battens)  4 Țiglă metalică (tile + ridge + gutter)
 * Reduced motion: rendered fully built, static (drag to rotate still works).
 */

// panel footprint (X across, Z up-slope)
const W = 3.6;
const D = 2.8;
const HALF_W = W / 2;
const HALF_D = D / 2;

// rafters run along Z, spaced across X
const RAFTER_X = [-1.5, -0.9, -0.3, 0.3, 0.9, 1.5];
const BAY = 0.6; // spacing between rafter centres

// seated height of each layer when closed (bottom of the stack = 0)
const BASE_Y = [0, 0.02, 0.2, 0.24, 0.34];
const LIFT = 0.52; // per-index lift at full explode

export function layerY(i: number, explode: number) {
  return BASE_Y[i] + i * LIFT * explode;
}

// wood + material tones
const OAK = "#b98a5f";
const OAK_DK = "#9c6f47";
const PINE = "#caa274";
const WOOL = "#e3c46b";
const MEMBRANE = "#3f4a56";
const TILE = "#35322e";
const TILE_DK = "#2b2825";
const METAL = "#3a3733";

function Rafters() {
  return (
    <group>
      {/* wall plate (eave) + ridge plate, running across X */}
      <mesh position={[0, 0.02, HALF_D - 0.08]} castShadow receiveShadow>
        <boxGeometry args={[W + 0.2, 0.16, 0.16]} />
        <meshStandardMaterial color={OAK_DK} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.02, -HALF_D + 0.08]} castShadow receiveShadow>
        <boxGeometry args={[W + 0.2, 0.16, 0.16]} />
        <meshStandardMaterial color={OAK_DK} roughness={0.85} />
      </mesh>
      {/* rafters along Z */}
      {RAFTER_X.map((x) => (
        <mesh key={x} position={[x, 0.05, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.13, 0.2, D]} />
          <meshStandardMaterial color={OAK} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function Insulation() {
  // mineral-wool batts filling the bays between rafters
  return (
    <group>
      {RAFTER_X.slice(0, -1).map((x) => (
        <mesh key={x} position={[x + BAY / 2, 0.04, 0]} castShadow>
          <boxGeometry args={[BAY - 0.13, 0.17, D - 0.1]} />
          <meshStandardMaterial color={WOOL} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function Membrane() {
  // breathable underlay draped over the rafters, gentle sag between them
  return (
    <mesh position={[0, 0, 0]} castShadow receiveShadow>
      <boxGeometry args={[W + 0.06, 0.02, D + 0.06]} />
      <meshStandardMaterial color={MEMBRANE} roughness={0.7} metalness={0.05} />
    </mesh>
  );
}

function Battens() {
  return (
    <group>
      {/* counter-battens up-slope, over each rafter */}
      {RAFTER_X.map((x) => (
        <mesh key={"c" + x} position={[x, -0.01, 0]} castShadow>
          <boxGeometry args={[0.06, 0.05, D]} />
          <meshStandardMaterial color={PINE} roughness={0.85} />
        </mesh>
      ))}
      {/* tile battens across X */}
      {[-1.1, -0.55, 0, 0.55, 1.1].map((z) => (
        <mesh key={"b" + z} position={[0, 0.03, z]} castShadow>
          <boxGeometry args={[W, 0.05, 0.07]} />
          <meshStandardMaterial color={OAK} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function Tile() {
  // metal-tile pans running down-slope (Z), with raised standing seams,
  // a ridge trim across the top edge and a gutter at the eave.
  const seams = [-1.5, -1.05, -0.6, -0.15, 0.3, 0.75, 1.2, 1.65];
  return (
    <group>
      {/* base pan */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[W + 0.12, 0.045, D + 0.12]} />
        <meshStandardMaterial color={TILE} roughness={0.42} metalness={0.55} />
      </mesh>
      {/* standing seams */}
      {seams.map((x) => (
        <mesh key={x} position={[x, 0.05, 0]} castShadow>
          <boxGeometry args={[0.05, 0.055, D + 0.12]} />
          <meshStandardMaterial color={TILE_DK} roughness={0.35} metalness={0.6} />
        </mesh>
      ))}
      {/* horizontal tile-step ribs (reads as modular tiles) */}
      {[-1.0, -0.4, 0.2, 0.8].map((z) => (
        <mesh key={"r" + z} position={[0, 0.035, z]} castShadow>
          <boxGeometry args={[W + 0.12, 0.02, 0.05]} />
          <meshStandardMaterial color={TILE_DK} roughness={0.4} metalness={0.55} />
        </mesh>
      ))}
      {/* ridge trim across the top edge */}
      <mesh position={[0, 0.08, -HALF_D - 0.02]} castShadow>
        <boxGeometry args={[W + 0.18, 0.1, 0.22]} />
        <meshStandardMaterial color={METAL} roughness={0.4} metalness={0.55} />
      </mesh>
      {/* gutter + a downspout at the eave (front) */}
      <mesh position={[0, -0.06, HALF_D + 0.12]} castShadow>
        <boxGeometry args={[W + 0.1, 0.1, 0.12]} />
        <meshStandardMaterial color={METAL} roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[HALF_W - 0.1, -0.7, HALF_D + 0.14]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 1.3, 12]} />
        <meshStandardMaterial color={METAL} roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  );
}

function Roof({
  explodeValue,
  fallback,
}: {
  explodeValue?: MotionValue<number>;
  fallback: number;
}) {
  const rootRef = useRef<Group>(null);
  useFrame(() => {
    const e = explodeValue ? explodeValue.get() : fallback;
    const root = rootRef.current;
    if (!root) return;
    root.children.forEach((child, i) => {
      child.position.y = layerY(i, e);
    });
  });
  // slight pitch + yaw so the finished tile reads as a real roof, not a slab
  return (
    <group
      ref={rootRef}
      rotation={[-0.19, 0.6, 0]}
      position={[0, -0.35, 0]}
    >
      <group position={[0, layerY(0, fallback), 0]}>
        <Rafters />
      </group>
      <group position={[0, layerY(1, fallback), 0]}>
        <Insulation />
      </group>
      <group position={[0, layerY(2, fallback), 0]}>
        <Membrane />
      </group>
      <group position={[0, layerY(3, fallback), 0]}>
        <Battens />
      </group>
      <group position={[0, layerY(4, fallback), 0]}>
        <Tile />
      </group>
    </group>
  );
}

export default function RoofCutawayScene({
  explodeValue,
  explode = 0,
  active = true,
}: {
  explodeValue?: MotionValue<number>;
  explode?: number; // static fallback (reduced motion => fully built)
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
      aria-label="Secțiune 3D printr-un acoperiș care se desface pe straturi"
    >
      <PerspectiveCamera makeDefault position={[3.7, 2.7, 4.9]} fov={40} />
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[4, 8, 5]}
        intensity={2.2}
        color="#ffe6c2"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-5, 3, -3]} intensity={0.5} color="#cddcff" />
      <Suspense fallback={null}>
        <Roof
          explodeValue={reduce ? undefined : explodeValue}
          fallback={reduce ? 1 : explode}
        />
        <Environment preset="sunset" />
      </Suspense>
      <ContactShadows position={[0, -1.5, 0]} opacity={0.3} scale={12} blur={2.6} far={5} />
      <OrbitControls
        makeDefault
        target={[0, 0.4, 0]}
        autoRotate={false}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2.1}
      />
    </Canvas>
  );
}
