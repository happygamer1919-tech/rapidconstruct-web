"use client";

import { Canvas } from "@react-three/fiber";
import {
  Edges,
  Html,
  ContactShadows,
  PerspectiveCamera,
  OrbitControls,
} from "@react-three/drei";
import { useReducedMotion } from "motion/react";

/**
 * The WebGL scene for RoofCutaway: a pitched roof section built as its 5 real
 * layers (rafters → mineral wool → membrane → battens → metal tile), pulled
 * apart along the roof's normal by `explode` (0..1). Numbered chips match the
 * legend. Same perf pattern as Model3D: frameloop freezes off-screen.
 */

const W = 2.6; // roof section width (along slope)
const D = 1.8; // depth (along ridge)
const PITCH = -0.42; // radians, roof slope

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

export default function RoofCutawayScene({
  explode,
  active = true,
}: {
  explode: number; // 0 = assembled, 1 = fully exploded
  active?: boolean;
}) {
  const reduce = useReducedMotion();
  // Per-layer lift along Y in exploded state (cumulative spacing).
  const lift = (i: number) => i * 0.42 * explode;

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      className="!absolute inset-0"
      aria-label="Secțiune 3D prin straturile unui acoperiș"
    >
      <PerspectiveCamera makeDefault position={[3.6, 2.6, 4.6]} fov={40} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 7, 5]} intensity={1.5} castShadow />
      <directionalLight position={[-5, 3, -3]} intensity={0.35} />

      <group rotation={[0, 0.35, PITCH]} position={[0, 0.1, 0]}>
        {/* 1 — Rafters (căpriori): five timber beams */}
        <group position={[0, lift(0), 0]}>
          {[-0.72, -0.36, 0, 0.36, 0.72].map((z) => (
            <mesh key={z} position={[0, 0, z]} castShadow>
              <boxGeometry args={[W, 0.14, 0.08]} />
              <meshStandardMaterial color="#a9805a" roughness={0.9} />
              <Edges threshold={20} color="#6e4f33" />
            </mesh>
          ))}
          <mesh position={[-W / 2 - 0.12, 0, 0]}>
            <boxGeometry args={[0.001, 0.001, 0.001]} />
            <meshBasicMaterial visible={false} />
            <Chip n={1} />
          </mesh>
        </group>

        {/* 2 — Mineral wool (termoizolație): thick soft slab */}
        <group position={[0, 0.18 + lift(1), 0]}>
          <mesh castShadow>
            <boxGeometry args={[W, 0.18, D]} />
            <meshStandardMaterial color="#e3c46b" roughness={1} />
            <Edges threshold={20} color="#b9993f" />
          </mesh>
          <mesh position={[-W / 2 - 0.12, 0, 0]}>
            <boxGeometry args={[0.001, 0.001, 0.001]} />
            <meshBasicMaterial visible={false} />
            <Chip n={2} />
          </mesh>
        </group>

        {/* 3 — Anti-condensation membrane: thin dark sheet */}
        <group position={[0, 0.32 + lift(2), 0]}>
          <mesh castShadow>
            <boxGeometry args={[W, 0.02, D]} />
            <meshStandardMaterial color="#4b5563" roughness={0.6} />
            <Edges threshold={20} color="#2f3742" />
          </mesh>
          <mesh position={[-W / 2 - 0.12, 0, 0]}>
            <boxGeometry args={[0.001, 0.001, 0.001]} />
            <meshBasicMaterial visible={false} />
            <Chip n={3} />
          </mesh>
        </group>

        {/* 4 — Battens + counter-battens (șipci): crosswise strips */}
        <group position={[0, 0.42 + lift(3), 0]}>
          {[-0.8, -0.4, 0, 0.4, 0.8].map((x) => (
            <mesh key={x} position={[x, 0, 0]} castShadow>
              <boxGeometry args={[0.07, 0.06, D]} />
              <meshStandardMaterial color="#b98a5f" roughness={0.9} />
              <Edges threshold={20} color="#7d5c3c" />
            </mesh>
          ))}
          <mesh position={[-W / 2 - 0.12, 0, 0]}>
            <boxGeometry args={[0.001, 0.001, 0.001]} />
            <meshBasicMaterial visible={false} />
            <Chip n={4} />
          </mesh>
        </group>

        {/* 5 — Metal tile (țiglă metalică): graphite panel with ridges */}
        <group position={[0, 0.55 + lift(4), 0]}>
          <mesh castShadow>
            <boxGeometry args={[W, 0.04, D]} />
            <meshStandardMaterial
              color="#35322e"
              roughness={0.45}
              metalness={0.5}
            />
            <Edges threshold={20} color="#1c1a18" />
          </mesh>
          {[-1, -0.6, -0.2, 0.2, 0.6, 1].map((x) => (
            <mesh key={x} position={[x * (W / 2.3), 0.035, 0]}>
              <cylinderGeometry args={[0.028, 0.028, D, 10]} />
              <meshStandardMaterial
                color="#3d3934"
                roughness={0.4}
                metalness={0.55}
              />
            </mesh>
          ))}
          <mesh position={[-W / 2 - 0.12, 0, 0]}>
            <boxGeometry args={[0.001, 0.001, 0.001]} />
            <meshBasicMaterial visible={false} />
            <Chip n={5} />
          </mesh>
        </group>
      </group>

      <ContactShadows
        position={[0, -0.9, 0]}
        opacity={0.3}
        scale={11}
        blur={2.6}
        far={4}
      />
      <OrbitControls
        makeDefault
        autoRotate={!reduce}
        autoRotateSpeed={0.5}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2.1}
      />
    </Canvas>
  );
}
