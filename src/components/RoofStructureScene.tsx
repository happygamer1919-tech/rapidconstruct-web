"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  ContactShadows,
  PerspectiveCamera,
  OrbitControls,
} from "@react-three/drei";
import { Suspense, useRef } from "react";
import { useReducedMotion } from "motion/react";
import type { Group } from "three";

/**
 * RoofStructureScene — a realistic gable-roof SECTION built procedurally
 * (owner direction: "more detailed and structural", used as a full-bleed
 * background with subtle ambient drift, NOT a scroll-driven explode).
 *
 * Story in one frame: the LEFT slope is finished (membrane -> battens ->
 * metal tile -> ridge + gutter), the RIGHT slope is left open so you read the
 * bones underneath (trusses -> purlins -> battens). One quiet auto-rotate;
 * prefers-reduced-motion holds it still (drag still works).
 */

// --- geometry constants (metres-ish, model units) ---------------------------
const HALF = 3; // half span (full span = 6)
const RISE = 2.35; // ridge height above the eaves
const LEN = 5.6; // length along Z
const HALF_LEN = LEN / 2;
const SLOPE_LEN = Math.hypot(HALF, RISE);
const SLOPE_ANG = Math.atan2(RISE, HALF); // left-slope pitch (~38 deg)

// wood tones
const OAK = "#b98a5f";
const OAK_DK = "#9c6f47";
const PINE = "#c99a6b";

// left-slope point at parameter u in [0,1] (eave -> ridge)
function leftPt(u: number): [number, number] {
  return [-HALF + u * HALF, u * RISE];
}
// outward (up-left) unit normal of the left slope
const LN: [number, number] = [-RISE / SLOPE_LEN, HALF / SLOPE_LEN];
function leftOffset(u: number, d: number): [number, number] {
  const [x, y] = leftPt(u);
  return [x + LN[0] * d, y + LN[1] * d];
}

/** A structural member spanning two points in the X-Y plane, at depth z. */
function Beam({
  a,
  b,
  z,
  w = 0.14,
  d = 0.12,
  color = OAK,
  roughness = 0.85,
}: {
  a: [number, number];
  b: [number, number];
  z: number;
  w?: number;
  d?: number;
  color?: string;
  roughness?: number;
}) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const cx = (a[0] + b[0]) / 2;
  const cy = (a[1] + b[1]) / 2;
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  return (
    <mesh position={[cx, cy, z]} rotation={[0, 0, ang]} castShadow receiveShadow>
      <boxGeometry args={[len, w, d]} />
      <meshStandardMaterial color={color} roughness={roughness} />
    </mesh>
  );
}

/** A member running the full length along Z, at an X-Y point. */
function ZBeam({
  p,
  w = 0.1,
  h = 0.1,
  color = OAK,
  ang = 0,
  roughness = 0.85,
  metalness = 0,
  len = LEN,
}: {
  p: [number, number];
  w?: number;
  h?: number;
  color?: string;
  ang?: number;
  roughness?: number;
  metalness?: number;
  len?: number;
}) {
  return (
    <mesh position={[p[0], p[1], 0]} rotation={[0, 0, ang]} castShadow receiveShadow>
      <boxGeometry args={[w, h, len]} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
    </mesh>
  );
}

const TRUSS_Z = [-2.4, -1.2, 0, 1.2, 2.4];

/** One triangular truss (king post + two diagonal webs) at depth z. */
function Truss({ z }: { z: number }) {
  const apex: [number, number] = [0, RISE];
  const eaveL: [number, number] = [-HALF, 0];
  const eaveR: [number, number] = [HALF, 0];
  const midL = leftPt(0.5); // mid of left rafter
  const midR: [number, number] = [-midL[0], midL[1]];
  return (
    <group>
      {/* bottom chord (tie beam) */}
      <Beam a={eaveL} b={eaveR} z={z} w={0.16} d={0.14} color={OAK_DK} />
      {/* rafters */}
      <Beam a={eaveL} b={apex} z={z} w={0.16} d={0.14} />
      <Beam a={eaveR} b={apex} z={z} w={0.16} d={0.14} />
      {/* king post */}
      <Beam a={[0, 0]} b={apex} z={z} w={0.12} d={0.12} color={OAK_DK} />
      {/* diagonal webs to rafter mid-points */}
      <Beam a={[0, 0.05]} b={midL} z={z} w={0.1} d={0.1} color={PINE} />
      <Beam a={[0, 0.05]} b={midR} z={z} w={0.1} d={0.1} color={PINE} />
    </group>
  );
}

/** A sheet lying parallel to the left slope, offset d along its normal. */
function LeftSlopeSheet({
  d,
  thick,
  color,
  roughness = 0.7,
  metalness = 0,
  lenScale = 1,
}: {
  d: number;
  thick: number;
  color: string;
  roughness?: number;
  metalness?: number;
  lenScale?: number;
}) {
  const [cx, cy] = leftOffset(0.5, d);
  return (
    <mesh position={[cx, cy, 0]} rotation={[0, 0, SLOPE_ANG]} castShadow receiveShadow>
      <boxGeometry args={[SLOPE_LEN, thick, LEN * lenScale]} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
    </mesh>
  );
}

function Roof() {
  return (
    <group position={[0, -0.75, 0]} rotation={[0, -0.5, 0]}>
      {/* ---- structural frame (both slopes read as bones) ---- */}
      {TRUSS_Z.map((z) => (
        <Truss key={z} z={z} />
      ))}

      {/* purlins running the length, on both rafters */}
      {[0.22, 0.5, 0.78].map((u) => {
        const [lx, ly] = leftPt(u);
        return (
          <group key={u}>
            <ZBeam p={[lx, ly + 0.12]} w={0.09} h={0.09} color={OAK} />
            <ZBeam p={[-lx, ly + 0.12]} w={0.09} h={0.09} color={OAK} />
          </group>
        );
      })}

      {/* ---- RIGHT slope: leave the frame exposed, only a peeled membrane strip ---- */}
      {/* a short membrane flap near the ridge on the right, half-laid */}
      <mesh
        position={[HALF * 0.28, RISE * 0.74, 0]}
        rotation={[0, 0, Math.PI - SLOPE_ANG]}
        castShadow
      >
        <boxGeometry args={[SLOPE_LEN * 0.42, 0.02, LEN * 0.9]} />
        <meshStandardMaterial color="#3f4a56" roughness={0.6} metalness={0.05} />
      </mesh>

      {/* ---- LEFT slope: fully built up membrane -> battens -> metal tile ---- */}
      <LeftSlopeSheet d={0.12} thick={0.02} color="#3f4a56" roughness={0.6} metalness={0.05} />
      {/* tile battens running along Z */}
      {[0.15, 0.32, 0.49, 0.66, 0.83].map((u) => {
        const [bx, by] = leftOffset(u, 0.2);
        return <ZBeam key={u} p={[bx, by]} w={0.07} h={0.05} color={PINE} ang={SLOPE_ANG} />;
      })}
      {/* metal-tile pan + standing seams running up the slope */}
      <LeftSlopeSheet d={0.28} thick={0.04} color="#35322e" roughness={0.4} metalness={0.55} />
      {[-2.3, -1.7, -1.1, -0.5, 0.1, 0.7, 1.3, 1.9, 2.5].map((z) => {
        const [sx, sy] = leftOffset(0.5, 0.33);
        return (
          <mesh
            key={z}
            position={[sx, sy, z * (HALF_LEN / 2.6)]}
            rotation={[0, 0, SLOPE_ANG]}
            castShadow
          >
            <boxGeometry args={[SLOPE_LEN, 0.05, 0.05]} />
            <meshStandardMaterial color="#2c2926" roughness={0.35} metalness={0.6} />
          </mesh>
        );
      })}

      {/* ---- ridge cap over the apex ---- */}
      <mesh position={[-0.14, RISE + 0.14, 0]} rotation={[0, 0, SLOPE_ANG]} castShadow>
        <boxGeometry args={[0.5, 0.06, LEN + 0.1]} />
        <meshStandardMaterial color="#2c2926" roughness={0.38} metalness={0.55} />
      </mesh>
      <mesh position={[0.16, RISE + 0.12, 0]} rotation={[0, 0, Math.PI - SLOPE_ANG]} castShadow>
        <boxGeometry args={[0.42, 0.06, LEN + 0.1]} />
        <meshStandardMaterial color="#33302c" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* ---- fascia + gutter + downspout along the left (finished) eave ---- */}
      <ZBeam p={[-HALF - 0.02, -0.12]} w={0.05} h={0.28} color="#4a4540" roughness={0.6} />
      <mesh position={[-HALF - 0.12, -0.24, 0]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.14, 0.12, LEN]} />
        <meshStandardMaterial color="#3a3733" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* downspout at the near end */}
      <mesh position={[-HALF - 0.12, -1.0, HALF_LEN - 0.3]} castShadow>
        <cylinderGeometry args={[0.055, 0.055, 1.5, 12]} />
        <meshStandardMaterial color="#3a3733" roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  );
}

function Drift({ children, spin }: { children: React.ReactNode; spin: boolean }) {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => {
    if (spin && ref.current) ref.current.rotation.y += dt * 0.06;
  });
  return <group ref={ref}>{children}</group>;
}

export default function RoofStructureScene({ active = true }: { active?: boolean }) {
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
      aria-label="Structura 3D a unui acoperiș: ferme, astereală, membrană și țiglă metalică"
    >
      <PerspectiveCamera makeDefault position={[6.2, 3.4, 6.6]} fov={38} />
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
      <Suspense fallback={null}>
        <Drift spin={!reduce}>
          <Roof />
        </Drift>
        <Environment preset="sunset" />
      </Suspense>
      <ContactShadows position={[0, -1.9, 0]} opacity={0.3} scale={16} blur={2.6} far={6} />
      <OrbitControls
        makeDefault
        target={[0, 0.2, 0]}
        autoRotate={false}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2.1}
      />
    </Canvas>
  );
}
