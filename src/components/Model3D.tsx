"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import {
  useGLTF,
  ContactShadows,
  PerspectiveCamera,
  OrbitControls,
  Environment,
} from "@react-three/drei";
import { useReducedMotion } from "motion/react";
import { MeshStandardMaterial, type Mesh } from "three";

/**
 * Interactive 3D house — a real model built in Blender (via blender-mcp) and
 * exported as /public/models/house.glb (~1.15 MB): two-storey volume + wing,
 * anthracite metal-tile hip roofs, white quoins and window surrounds, dark
 * bronze muntin windows, a timber entry gablet and a stone base course.
 * Auto-rotates slowly; drag to spin. prefers-reduced-motion stops rotation.
 * Loaded client-only by Design3D (next/dynamic), frameloop freezes off-screen.
 */

const HOUSE_URL = "/models/house.glb";

function House() {
  const { scene } = useGLTF(HOUSE_URL);
  // Let every surface cast/receive shadows and pick up the environment so the
  // model reads with real light instead of flat shading.
  const prepared = useMemo(() => {
    scene.traverse((o) => {
      const m = o as Mesh;
      if (!m.isMesh) return;
      m.castShadow = true;
      m.receiveShadow = true;
      const mat = m.material as MeshStandardMaterial;
      if (mat && "envMapIntensity" in mat) mat.envMapIntensity = 0.9;
    });
    return scene;
  }, [scene]);
  return (
    <primitive
      object={prepared}
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
      shadows="soft"
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 1.05;
      }}
      className="!absolute inset-0"
      aria-label="Model 3D al unei case moderne"
    >
      <PerspectiveCamera makeDefault position={[4.6, 2.9, 5.4]} fov={40} />
      {/* warm low sun key + cool sky fill + a soft back-rim to lift the house
          off the background; low ambient so form reads. */}
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
      <directionalLight
        position={[-6, 3, -4]}
        intensity={0.5}
        color="#cddcff"
      />
      <directionalLight
        position={[-3, 5, -6]}
        intensity={0.7}
        color="#ffd9a0"
      />
      {/* Environment gets its OWN Suspense and a self-hosted HDR: drei's
          `preset` pulls from a CDN that rate-limits and returns 0 bytes, and a
          SHARED Suspense would then blank the whole house with no error. */}
      <Suspense fallback={null}>
        <House />
      </Suspense>
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
        autoRotateSpeed={0.6}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2.15}
      />
    </Canvas>
  );
}
