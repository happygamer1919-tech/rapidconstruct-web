"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  useGLTF,
  ContactShadows,
  PerspectiveCamera,
  OrbitControls,
  Environment,
} from "@react-three/drei";
import { useReducedMotion } from "motion/react";

/**
 * Interactive 3D house — a real model built in Blender (via blender-mcp) and
 * exported as /public/models/house.glb (~65 KB): two-storey volume + wing,
 * gable roofs with true overhangs, framed windows, orange door, chimney.
 * Auto-rotates slowly; drag to spin. prefers-reduced-motion stops rotation.
 * Loaded client-only by Design3D (next/dynamic), frameloop freezes off-screen.
 */

const HOUSE_URL = "/models/house.glb";

function House() {
  const { scene } = useGLTF(HOUSE_URL);
  return (
    <primitive
      object={scene}
      // Blender scene is ~13.5m wide, ground at y=0 after Y-up export.
      scale={0.3}
      position={[-0.2, -1.15, 0.1]}
    />
  );
}

useGLTF.preload(HOUSE_URL);

export default function Model3D({ active = true }: { active?: boolean }) {
  const reduce = useReducedMotion();

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      className="!absolute inset-0"
      aria-label="Model 3D al unei case moderne"
    >
      <PerspectiveCamera makeDefault position={[4.6, 2.9, 5.4]} fov={40} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 8, 4]} intensity={1.5} castShadow />
      <directionalLight position={[-6, 3, -4]} intensity={0.4} />
      <Suspense fallback={null}>
        <House />
        <Environment preset="city" />
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
        autoRotateSpeed={0.6}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2.15}
      />
    </Canvas>
  );
}
