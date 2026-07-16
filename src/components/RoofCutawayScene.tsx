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
 * RoofCutawayScene — a realistic roof section, FULLY BUILT when closed
 * (explode = 0), that lifts apart layer-by-layer as the visitor scrolls
 * (explode 0 -> 1). Owner direction: "a full built one, and on scrolling it
 * starts opening up, when it opens the description appears" + "more detailed
 * and realistic".
 *
 * 5 layers, matching the legend copy:
 *   0 Căpriori (rafters, ridge board, fascia, blocking)
 *   1 Termoizolație (mineral-wool batts between rafters)
 *   2 Membrană (breathable underlay, overlapping rolls)
 *   3 Șipci (counter-battens + tile battens)
 *   4 Țiglă metalică (modular metal tiles + ridge cap + gutter + snow guard)
 * Reduced motion: rendered fully built, static (drag to rotate still works).
 */

// panel footprint (X across, Z up-slope)
const W = 3.6;
const D = 2.8;
const HALF_W = W / 2;
const HALF_D = D / 2;

const RAFTER_X = [-1.65, -1.1, -0.55, 0, 0.55, 1.1, 1.65];
const BAY = 0.55;

// seated height of each layer when closed (bottom of the stack = 0)
const BASE_Y = [0, 0.02, 0.2, 0.24, 0.34];
const LIFT = 0.54; // per-index lift at full explode

export function layerY(i: number, explode: number) {
  return BASE_Y[i] + i * LIFT * explode;
}

// tones
const OAK = "#b98a5f";
const OAK_2 = "#af7f54";
const OAK_DK = "#996d45";
const PINE = "#caa274";
const WOOL = "#e4c56d";
const WOOL_DK = "#d3b158";
const MEMBRANE = "#414d59";
const MEMBRANE_2 = "#495663";
const TILE = "#34312d";
const TILE_DK = "#292724";
const METAL = "#3a3733";

function Rafters() {
  return (
    <group>
      {/* wall plate (eave) + top plate (ridge line) across X */}
      {[HALF_D - 0.08, -HALF_D + 0.08].map((z) => (
        <mesh key={z} position={[0, 0.02, z]} castShadow receiveShadow>
          <boxGeometry args={[W + 0.24, 0.16, 0.16]} />
          <meshStandardMaterial color={OAK_DK} roughness={0.85} />
        </mesh>
      ))}
      {/* ridge board sitting a touch proud at the top edge */}
      <mesh position={[0, 0.14, -HALF_D + 0.02]} castShadow>
        <boxGeometry args={[W + 0.24, 0.14, 0.05]} />
        <meshStandardMaterial color={OAK_DK} roughness={0.8} />
      </mesh>
      {/* fascia board on the eave face */}
      <mesh position={[0, -0.02, HALF_D + 0.06]} castShadow>
        <boxGeometry args={[W + 0.24, 0.24, 0.04]} />
        <meshStandardMaterial color={OAK_2} roughness={0.8} />
      </mesh>
      {/* rafters along Z, slightly alternating tone */}
      {RAFTER_X.map((x, i) => (
        <mesh key={x} position={[x, 0.05, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.12, 0.2, D]} />
          <meshStandardMaterial color={i % 2 ? OAK : OAK_2} roughness={0.85} />
        </mesh>
      ))}
      {/* staggered cross-blocking between rafters */}
      {RAFTER_X.slice(0, -1).map((x, i) => (
        <mesh
          key={"blk" + x}
          position={[x + BAY / 2, 0.05, i % 2 ? 0.5 : -0.5]}
          castShadow
        >
          <boxGeometry args={[BAY - 0.12, 0.16, 0.08]} />
          <meshStandardMaterial color={OAK_DK} roughness={0.9} />
        </mesh>
      ))}
      {/* a collar tie across the middle */}
      <mesh position={[0, 0.16, 0]} castShadow>
        <boxGeometry args={[W - 0.2, 0.05, 0.1]} />
        <meshStandardMaterial color={PINE} roughness={0.85} />
      </mesh>
    </group>
  );
}

function Insulation() {
  // mineral-wool batts filling the bays, slightly recessed + two-tone
  return (
    <group>
      {RAFTER_X.slice(0, -1).map((x, i) => (
        <mesh key={x} position={[x + BAY / 2, 0.03, 0]} castShadow>
          <boxGeometry args={[BAY - 0.12, 0.16, D - 0.12]} />
          <meshStandardMaterial color={i % 2 ? WOOL : WOOL_DK} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function Membrane() {
  // breathable underlay in three overlapping horizontal rolls (visible laps)
  const rolls = [-0.82, 0, 0.82];
  return (
    <group>
      {rolls.map((z, i) => (
        <mesh key={z} position={[0, i * 0.006, z]} castShadow receiveShadow>
          <boxGeometry args={[W + 0.06, 0.016, D / 2.7]} />
          <meshStandardMaterial
            color={i % 2 ? MEMBRANE_2 : MEMBRANE}
            roughness={0.7}
            metalness={0.04}
          />
        </mesh>
      ))}
    </group>
  );
}

function Battens() {
  return (
    <group>
      {/* counter-battens up-slope, over each rafter */}
      {RAFTER_X.map((x) => (
        <mesh key={"c" + x} position={[x, -0.02, 0]} castShadow>
          <boxGeometry args={[0.05, 0.05, D]} />
          <meshStandardMaterial color={PINE} roughness={0.85} />
        </mesh>
      ))}
      {/* tile battens across X */}
      {[-1.15, -0.7, -0.25, 0.2, 0.65, 1.1].map((z) => (
        <mesh key={"b" + z} position={[0, 0.03, z]} castShadow>
          <boxGeometry args={[W, 0.05, 0.06]} />
          <meshStandardMaterial color={OAK} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function Tile() {
  // modular metal tiles: courses across the slope, each course a pan with a
  // raised front step (the shingle lip); vertical seam ribs; ridge; gutter.
  const courses = [1.15, 0.6, 0.05, -0.5, -1.05]; // Z centre of each course (eave -> ridge)
  const seams = [-1.5, -1.05, -0.6, -0.15, 0.3, 0.75, 1.2, 1.65];
  return (
    <group>
      {courses.map((z) => (
        <group key={z}>
          {/* course pan */}
          <mesh position={[0, 0, z]} castShadow receiveShadow>
            <boxGeometry args={[W + 0.12, 0.04, 0.5]} />
            <meshStandardMaterial color={TILE} roughness={0.42} metalness={0.55} />
          </mesh>
          {/* raised front step (down-slope lip) */}
          <mesh position={[0, 0.045, z + 0.22]} castShadow>
            <boxGeometry args={[W + 0.12, 0.05, 0.09]} />
            <meshStandardMaterial color={TILE_DK} roughness={0.4} metalness={0.6} />
          </mesh>
        </group>
      ))}
      {/* vertical seam ribs running down-slope */}
      {seams.map((x) => (
        <mesh key={x} position={[x, 0.05, 0]} castShadow>
          <boxGeometry args={[0.045, 0.055, D + 0.12]} />
          <meshStandardMaterial color={TILE_DK} roughness={0.35} metalness={0.62} />
        </mesh>
      ))}
      {/* ridge cap across the top edge */}
      <mesh position={[0, 0.09, -HALF_D - 0.02]} castShadow>
        <boxGeometry args={[W + 0.2, 0.1, 0.24]} />
        <meshStandardMaterial color={METAL} roughness={0.4} metalness={0.55} />
      </mesh>
      {/* snow-guard bar near the eave */}
      <mesh position={[0, 0.11, HALF_D - 0.35]} castShadow>
        <boxGeometry args={[W, 0.015, 0.02]} />
        <meshStandardMaterial color={METAL} roughness={0.5} metalness={0.5} />
      </mesh>
      {[-1.2, -0.4, 0.4, 1.2].map((x) => (
        <mesh key={"sg" + x} position={[x, 0.08, HALF_D - 0.35]} castShadow>
          <boxGeometry args={[0.02, 0.07, 0.02]} />
          <meshStandardMaterial color={METAL} roughness={0.5} metalness={0.5} />
        </mesh>
      ))}
      {/* gutter + downspout at the eave (front) */}
      <mesh position={[0, -0.06, HALF_D + 0.13]} castShadow>
        <boxGeometry args={[W + 0.1, 0.1, 0.12]} />
        <meshStandardMaterial color={METAL} roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[HALF_W - 0.1, -0.72, HALF_D + 0.15]} castShadow>
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
  return (
    <group ref={rootRef} rotation={[-0.19, 0.6, 0]} position={[0, -0.35, 0]}>
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
      {/* Environment gets its OWN Suspense and a self-hosted HDR: drei's
          `preset` pulls from a CDN that rate-limits and returns 0 bytes, and a
          SHARED Suspense would then blank the whole roof with no error. */}
      <Suspense fallback={null}>
        <Roof
          explodeValue={reduce ? undefined : explodeValue}
          fallback={reduce ? 1 : explode}
        />
      </Suspense>
      <Suspense fallback={null}>
        <Environment files="/hdri/venice_sunset_1k.hdr" />
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
