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

function House() {
  return (
    <group rotation={[0, -0.6, 0]} position={[0, -0.15, 0]}>
      {/* Left wing (two-storey block) */}
      <Wing position={[-1.5, 0.5, 0]} size={[1.3, 1.5, 1.7]} />
      {/* Right wing (single-storey block) */}
      <Wing position={[1.5, 0.25, 0.1]} size={[1.5, 1, 1.9]} />
      {/* Low front block */}
      <Wing position={[0.2, 0.15, 1.1]} size={[1.6, 0.7, 0.8]} />

      {/* Central glass atrium */}
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

      {/* Orange accent — entrance canopy (brand cue) */}
      <mesh position={[0, 0.06, 1.55]}>
        <boxGeometry args={[1.1, 0.08, 0.5]} />
        <meshStandardMaterial color={ACCENT} roughness={0.6} />
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

export default function Model3D() {
  const reduce = useReducedMotion();

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
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
