"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  Edges,
  Html,
  ContactShadows,
  PerspectiveCamera,
  OrbitControls,
  Environment,
} from "@react-three/drei";
import { Suspense, useRef } from "react";
import { useReducedMotion, type MotionValue } from "motion/react";
import type { Group } from "three";

/**
 * WebGL scene for RoofCutaway v3 — SCROLL-DRIVEN disassembly (owner idea:
 * "auto disassemble when scrolling, descriptions appear"). The explode amount
 * arrives as a MotionValue read inside useFrame, so scroll updates never
 * re-render the React tree. Layers spread symmetrically around the stack
 * center; drag-to-rotate stays. Reduced motion: static exploded, no motion.
 */

const W = 2.6;
const D = 1.9;

const BASE_Y = [0, 0.17, 0.3, 0.4, 0.53];
const MID = 1.5;
const GAP = 0.46;

export function layerY(i: number, explode: number) {
  return BASE_Y[i] + (i - MID) * GAP * explode;
}

function Chip({ n }: { n: number }) {
  return (
    <Html center distanceFactor={7} zIndexRange={[10, 0]}>
      <span
        style={{
          display: "grid",
          placeItems: "center",
          width: 26,
          height: 26,
          borderRadius: 999,
          background: "#141414",
          color: "#fafafa",
          fontSize: 13,
          fontWeight: 700,
          border: "1.5px solid #f26419",
          pointerEvents: "none",
        }}
      >
        {n}
      </span>
    </Html>
  );
}

function ChipAnchor({ n }: { n: number }) {
  return (
    <mesh position={[-W / 2 - 0.22, 0, D / 2 - 0.2]}>
      <boxGeometry args={[0.001, 0.001, 0.001]} />
      <meshBasicMaterial visible={false} />
      <Chip n={n} />
    </mesh>
  );
}

const RAFTER_Z = [-0.8, -0.48, -0.16, 0.16, 0.48, 0.8];

function Layers({
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
    // Direct children are the 5 layer groups, in declaration order.
    root.children.forEach((child, i) => {
      child.position.y = layerY(i, e);
    });
  });

  return (
    <group ref={rootRef} rotation={[0, 0.55, 0]} position={[0, -0.15, 0]}>
      {/* 1 — Rafters + cross-blocking */}
      <group position={[0, layerY(0, fallback), 0]}>
        {RAFTER_Z.map((z) => (
          <mesh key={z} position={[0, 0, z]} castShadow>
            <boxGeometry args={[W, 0.16, 0.09]} />
            <meshStandardMaterial color="#a9805a" roughness={0.9} />
            <Edges threshold={20} color="#6e4f33" />
          </mesh>
        ))}
        {RAFTER_Z.slice(0, -1).map((z) => (
          <mesh key={"blk" + z} position={[0.55, 0, z + 0.16]} castShadow>
            <boxGeometry args={[0.09, 0.14, 0.23]} />
            <meshStandardMaterial color="#96714e" roughness={0.9} />
            <Edges threshold={20} color="#6e4f33" />
          </mesh>
        ))}
        <ChipAnchor n={1} />
      </group>

      {/* 2 — Mineral wool between rafters */}
      <group position={[0, layerY(1, fallback), 0]}>
        {RAFTER_Z.slice(0, -1).map((z) => (
          <mesh key={z} position={[0, 0, z + 0.16]} castShadow>
            <boxGeometry args={[W - 0.06, 0.15, 0.22]} />
            <meshStandardMaterial color="#e3c46b" roughness={1} />
            <Edges threshold={20} color="#b9993f" />
          </mesh>
        ))}
        <ChipAnchor n={2} />
      </group>

      {/* 3 — Membrane: three overlapping strips */}
      <group position={[0, layerY(2, fallback), 0]}>
        {[-0.62, 0, 0.62].map((z, i) => (
          <mesh key={z} position={[0, i * 0.008, z]} castShadow>
            <boxGeometry args={[W, 0.015, 0.72]} />
            <meshStandardMaterial
              color={i % 2 ? "#4b5a68" : "#46525f"}
              roughness={0.45}
              metalness={0.1}
            />
            <Edges threshold={20} color="#2f3742" />
          </mesh>
        ))}
        <ChipAnchor n={3} />
      </group>

      {/* 4 — Counter-battens + battens grid */}
      <group position={[0, layerY(3, fallback), 0]}>
        {RAFTER_Z.map((z) => (
          <mesh key={"c" + z} position={[0, -0.03, z]} castShadow>
            <boxGeometry args={[W, 0.05, 0.06]} />
            <meshStandardMaterial color="#b98a5f" roughness={0.9} />
            <Edges threshold={20} color="#7d5c3c" />
          </mesh>
        ))}
        {[-1, -0.6, -0.2, 0.2, 0.6, 1].map((x) => (
          <mesh key={"b" + x} position={[x * (W / 2.3), 0.03, 0]} castShadow>
            <boxGeometry args={[0.07, 0.05, D]} />
            <meshStandardMaterial color="#c99a6b" roughness={0.9} />
            <Edges threshold={20} color="#7d5c3c" />
          </mesh>
        ))}
        <ChipAnchor n={4} />
      </group>

      {/* 5 — Metal tile rows + ridges lying along the sheet */}
      <group position={[0, layerY(4, fallback), 0]}>
        {[-1, -0.5, 0, 0.5, 1].map((x, i) => (
          <mesh
            key={"row" + x}
            position={[x * (W / 2.6), 0.02 - i * 0.004, 0]}
            castShadow
          >
            <boxGeometry args={[W / 4.6, 0.035, D]} />
            <meshStandardMaterial
              color={i % 2 ? "#3d3934" : "#35322e"}
              roughness={0.4}
              metalness={0.5}
            />
            <Edges threshold={20} color="#1c1a18" />
          </mesh>
        ))}
        {[-0.95, -0.55, -0.15, 0.25, 0.65].map((x) => (
          <mesh
            key={"ridge" + x}
            position={[x * (W / 2.4), 0.05, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.026, 0.026, D, 10]} />
            <meshStandardMaterial
              color="#3d3934"
              roughness={0.35}
              metalness={0.55}
            />
          </mesh>
        ))}
        <ChipAnchor n={5} />
      </group>
    </group>
  );
}

export default function RoofCutawayScene({
  explodeValue,
  explode = 1,
  active = true,
}: {
  explodeValue?: MotionValue<number>;
  explode?: number; // static fallback (reduced motion)
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
      aria-label="Secțiune 3D prin straturile unui acoperiș"
    >
      <PerspectiveCamera makeDefault position={[3.4, 2.3, 4.4]} fov={42} />
      {/* Warm low sun as key, cool sky fill, low ambient — form reads instead
          of washing flat. IBL (sunset) gives the metal tiles real reflections. */}
      <ambientLight intensity={0.28} />
      <directionalLight
        position={[4, 7, 5]}
        intensity={2.1}
        color="#ffe6c2"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-5, 3, -3]} intensity={0.5} color="#cddcff" />
      <Suspense fallback={null}>
        <Environment preset="sunset" />
      </Suspense>

      <Layers
        explodeValue={reduce ? undefined : explodeValue}
        fallback={explode}
      />

      <ContactShadows
        position={[0, -1.15, 0]}
        opacity={0.28}
        scale={11}
        blur={2.6}
        far={5}
      />
      <OrbitControls
        makeDefault
        target={[0, 0.3, 0]}
        autoRotate={false}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.05}
      />
    </Canvas>
  );
}
