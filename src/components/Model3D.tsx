"use client";

import { Canvas } from "@react-three/fiber";
import {
  Edges,
  ContactShadows,
  PerspectiveCamera,
  OrbitControls,
} from "@react-three/drei";
import { useReducedMotion } from "motion/react";

/**
 * Interactive 3D architectural massing model (design ref Reel 1: the white 3D
 * building model). Clean modern volumes with highlighted edges + one glass
 * volume, gently auto-rotating. On prefers-reduced-motion it holds a static
 * three-quarter angle (no rotation). Loaded client-only via next/dynamic by the
 * caller so it never blocks SSR / LCP.
 */

const SHELL = "#ece7de"; // warm off-white walls
const EDGE = "#3a3733"; // charcoal edge lines
const GLASS = "#8fb3c4";
const ACCENT = "#f26419"; // brand orange
const ROOF = "#35322e"; // graphite metal tile (their signature roofs)

function Wing({
  position,
  size,
}: {
  position: [number, number, number];
  size: [number, number, number];
}) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={SHELL} roughness={0.85} metalness={0.05} />
      <Edges threshold={15} color={EDGE} />
    </mesh>
  );
}

/**
 * Gable roof: a 45°-rotated box whose lower half is buried in the wing below,
 * leaving a clean triangular-prism roofline (their trade is roofs — graphite
 * like the metal tile they install). `width` is the wing width it must span.
 */
function GableRoof({
  position,
  width,
  depth,
}: {
  position: [number, number, number]; // center = ridge line at wing-top height
  width: number;
  depth: number;
}) {
  const side = width / Math.SQRT2;
  return (
    <mesh position={position} rotation={[0, 0, Math.PI / 4]} castShadow>
      <boxGeometry args={[side, side, depth]} />
      <meshStandardMaterial color={ROOF} roughness={0.7} metalness={0.15} />
      <Edges threshold={15} color="#1c1a18" />
    </mesh>
  );
}

function House() {
  return (
    <group rotation={[0, -0.6, 0]} position={[0, -0.15, 0]}>
      {/* Left wing (two-storey block) + gable roof */}
      <Wing position={[-1.5, 0.5, 0]} size={[1.3, 1.5, 1.7]} />
      <GableRoof position={[-1.5, 1.25, 0]} width={1.36} depth={1.8} />

      {/* Right wing (single-storey block) + gable roof */}
      <Wing position={[1.5, 0.25, 0.1]} size={[1.5, 1, 1.9]} />
      <GableRoof position={[1.5, 0.75, 0.1]} width={1.56} depth={2} />

      {/* Low front block (flat-roof entrance volume) */}
      <Wing position={[0.2, 0.15, 1.1]} size={[1.6, 0.7, 0.8]} />

      {/* Central glass atrium (flat modern contrast between the roofed wings) */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[1.5, 1.65, 1.5]} />
        <meshStandardMaterial
          color={GLASS}
          transparent
          opacity={0.4}
          roughness={0.1}
          metalness={0.2}
        />
        <Edges threshold={15} color="#ffffff" />
      </mesh>

      {/* Orange front door on the entrance volume (brand accent, clearly a door) */}
      <mesh position={[0.2, 0.02, 1.505]}>
        <boxGeometry args={[0.32, 0.46, 0.04]} />
        <meshStandardMaterial color={ACCENT} roughness={0.55} />
      </mesh>

      {/* Ground pad */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.22, 0]}
        receiveShadow
      >
        <planeGeometry args={[7, 7]} />
        <meshStandardMaterial color="#d8d2c7" roughness={1} />
      </mesh>
    </group>
  );
}

export default function Model3D({ active = true }: { active?: boolean }) {
  const reduce = useReducedMotion();

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      // Freeze the render loop while the model is off-screen (GPU idle).
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      className="!absolute inset-0"
      aria-label="Model 3D al unei case moderne"
    >
      <PerspectiveCamera makeDefault position={[4.5, 3.2, 5.5]} fov={38} />
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[5, 8, 4]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-6, 3, -4]} intensity={0.4} />
      <House />
      <ContactShadows
        position={[0, -0.36, 0]}
        opacity={0.35}
        scale={10}
        blur={2.4}
        far={4}
      />
      <OrbitControls
        makeDefault
        autoRotate={!reduce}
        autoRotateSpeed={0.8}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
      />
    </Canvas>
  );
}
