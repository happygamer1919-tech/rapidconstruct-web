"use client";

/**
 * HeroScene — mounts the approved RapidConstruct 3D hero.
 *
 * The model itself is NOT defined here. It lives verbatim in
 * `src/scenes/rapidconstruct-scene.js` (byte-identical to the supplied source)
 * and is treated as read-only: this file only creates a renderer/scene/camera,
 * calls `buildScene` once, and drives the API it returns.
 *
 *   api.update(t)      — per frame
 *   api.cameraAt(t)    — camera position + lookAt
 *   api.phaseAt(t)     — Romanian caption + its colour
 *   api.applyRenderer  — tone mapping, exposure, shadows (called by buildScene
 *                        when a renderer is passed in; never overridden here)
 *
 * Props match the previous hero component exactly so the page layout, copy,
 * nav and CTAs are untouched by the swap.
 */

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { buildScene } from "@/scenes/rapidconstruct-scene";
import { skipHeavy3d } from "@/lib/audit";

export type HeroSceneProps = {
  /** Fired once the build has settled — the page uses it to reveal the copy. */
  onRested?: () => void;
  /** Restart the build after BUILD_END + HOLD. The hero passes false. */
  loop?: boolean;
  className?: string;
};

/**
 * Skip WebGL entirely on machines that cannot do it justice.
 *
 * Three separate reasons, all resolved before the canvas is created so a weak
 * device never pays for a context it will not use:
 *   1. no WebGL at all (locked-down browsers, some corporate profiles);
 *   2. `?no3d=1` — the explicit audit opt-out (see src/lib/audit.ts);
 *   3. low-end hardware — ≤2 logical cores or ≤2 GB reported memory. The scene
 *      builds several hundred meshes with 2048² shadows, which is exactly the
 *      class of device where that turns into a frozen tab.
 * `deviceMemory` is Chromium-only; absent elsewhere, so it is only ever used to
 * rule a device OUT, never to rule one in.
 */
function useSkipCanvas() {
  return useState(() => {
    if (typeof window === "undefined") return false;
    if (skipHeavy3d()) return true;
    try {
      const c = document.createElement("canvas");
      if (!(c.getContext("webgl2") || c.getContext("webgl"))) return true;
    } catch {
      return true;
    }
    const nav = navigator as Navigator & { deviceMemory?: number };
    if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 2)
      return true;
    if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2) return true;
    return false;
  })[0];
}

export default function HeroScene({
  onRested,
  loop = true,
  className,
}: HeroSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<{ label: string; color: number }>({
    label: "Proiect",
    color: 0x1f4fd6,
  });

  const skip = useSkipCanvas();

  // Read reduced-motion lazily: a synchronous setState in an effect trips the
  // project's lint gate, and lazy init avoids rendering one wrong first frame.
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onRm = () => setReduced(rm.matches);
    rm.addEventListener("change", onRm);
    return () => rm.removeEventListener("change", onRm);
  }, []);

  // Kept in a ref so changing the callback identity never tears down the scene.
  const onRestedRef = useRef(onRested);
  useEffect(() => {
    onRestedRef.current = onRested;
  }, [onRested]);

  useEffect(() => {
    const mount = mountRef.current;
    if (skip || !mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      // The scene file defines camera POSITION and lookAt but not the lens.
      // 40° / 0.1 / 1200 carries over from the previous hero so the framing the
      // owner already signed off on is unchanged.
      40,
      1,
      0.1,
      1200,
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    mount.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, {
      display: "block",
      width: "100%",
      height: "100%",
    });

    // buildScene calls applyRenderer itself (tone mapping, exposure, shadows).
    // Nothing below may override those.
    const api = buildScene(THREE, scene, renderer);

    /**
     * Keep the HORIZONTAL field of view constant instead of the vertical one.
     *
     * three.js `fov` is vertical, so a fixed value crops the frame horizontally
     * as the viewport narrows. This scene is not a single object — it is a site
     * roughly 30 m wide (house, carport, fence, gate, garage, paving, trees) —
     * so on a portrait phone a fixed 40° sliced straight through the building.
     * Widening the lens as the aspect narrows keeps the same horizontal extent
     * visible at every viewport, which is what makes one fixed camera path work
     * on both a desktop and a phone.
     *
     * The camera POSITION and lookAt still come untouched from api.cameraAt();
     * only the lens adapts. The scene file never specifies a lens.
     */
    const BASE_FOV = 40; // vertical fov at the reference aspect
    const REF_ASPECT = 16 / 9;
    const RAD = Math.PI / 180;
    const H_FOV = 2 * Math.atan(Math.tan((BASE_FOV / 2) * RAD) * REF_ASPECT);

    // Vertical fov that preserves the reference horizontal extent at `aspect`.
    // Clamped: past ~74° the perspective distortion bows the roof lines, which
    // reads as a modelling defect rather than a wide shot.
    const fovFor = (aspect: number) =>
      aspect >= REF_ASPECT
        ? BASE_FOV
        : Math.min(74, (2 * Math.atan(Math.tan(H_FOV / 2) / aspect)) / RAD);

    /**
     * On a portrait phone the copy block (eyebrow + headline + service list +
     * guarantee + two CTAs) fills most of the screen, so a centred house lands
     * directly behind the text — the service list sat on the dark roof at about
     * 1.5:1 contrast.
     *
     * Rather than crop the scene (the old sub-box approach, which sliced the
     * site in half) we render the TOP slice of a taller virtual frame. The house
     * sits at the virtual centre, so showing the upper portion pushes it into
     * the lower third of the canvas, under the copy, with sky behind the text.
     * setViewOffset only moves the projection window — camera position and
     * lookAt still come untouched from api.cameraAt().
     */
    const PORTRAIT_LIFT = 1.3;

    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);

      if (w / h < 1) {
        const virtualH = h * PORTRAIT_LIFT;
        camera.aspect = w / virtualH;
        camera.fov = fovFor(camera.aspect);
        camera.setViewOffset(w, virtualH, 0, 0, w, h);
      } else {
        camera.clearViewOffset();
        camera.aspect = w / h;
        camera.fov = fovFor(camera.aspect);
      }
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    const LOOP_AT = api.BUILD_END + api.HOLD;
    let raf = 0;
    let start = 0;
    let lastLabel = "";
    let restedFired = false;
    let cancelled = false;

    const applyFrame = (t: number) => {
      api.update(t);
      const cam = api.cameraAt(t);
      camera.position.set(cam.position[0], cam.position[1], cam.position[2]);
      camera.lookAt(cam.lookAt[0], cam.lookAt[1], cam.lookAt[2]);
      // The scene file's PHASES is an untyped mixed array, so TS widens both
      // fields to `string | number`. Narrow here rather than edit the scene:
      // that file is a verbatim copy and stays byte-identical to the source.
      const ph = api.phaseAt(t);
      const label = String(ph.label);
      if (label !== lastLabel) {
        lastLabel = label;
        setPhase({ label, color: Number(ph.color) });
      }
      renderer.render(scene, camera);
    };

    const tick = () => {
      // §10 render-loop guard: schedule the next frame FIRST, then do the
      // work in a try/catch. An uncaught throw otherwise kills rAF for good
      // and leaves a black canvas with no explanation.
      raf = requestAnimationFrame(tick);
      try {
        let t = (performance.now() - start) / 1000;
        if (loop) {
          if (t > LOOP_AT) {
            start = performance.now();
            t = 0;
          }
        } else if (t >= api.BUILD_END) {
          // Build once, then stay built: draw the settled frame and stop.
          // Leaving a render loop running forever behind the copy is the
          // battery/lag problem the hero has always avoided.
          t = api.BUILD_END;
          applyFrame(t);
          cancelAnimationFrame(raf);
          raf = 0;
          if (!restedFired) {
            restedFired = true;
            onRestedRef.current?.();
          }
          return;
        }
        applyFrame(t);
      } catch {
        // Swallow one bad frame rather than kill the loop.
      }
    };

    /**
     * Warm the shaders BEFORE the clock starts.
     *
     * Measured without this: the first frame after mount took 3.4s, the next
     * 1.0s, the next 0.5s — three.js compiles a shader program per material
     * lazily, on the frame that first draws it, and this scene has hundreds.
     * The clock ran through all of it, so by the second drawn frame the 4.3s
     * build was already ~80% over and the animation was effectively invisible:
     * the house simply appeared. Since the build animation is the entire reason
     * the 3D exists, that is a defect, not a rough edge.
     *
     * compileAsync (three r165+) does the work off the critical path; compile()
     * is the synchronous fallback. Either way `start` is set afterwards, so
     * t=0 is the first frame the visitor actually sees.
     */
    const beginLoop = () => {
      if (cancelled) return;
      start = performance.now();
      if (reduced) {
        // Reduced motion: the finished house, rendered once. No rAF, no build.
        applyFrame(api.BUILD_END);
        if (!restedFired) {
          restedFired = true;
          onRestedRef.current?.();
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    // Pose the camera at t=0 and draw the opening state once, so the warm-up
    // compiles the programs the first real frames will need.
    applyFrame(reduced ? api.BUILD_END : 0);

    const r = renderer as THREE.WebGLRenderer & {
      compileAsync?: (s: THREE.Object3D, c: THREE.Camera) => Promise<unknown>;
    };
    if (typeof r.compileAsync === "function") {
      r.compileAsync(scene, camera).then(beginLoop, beginLoop);
    } else {
      try {
        renderer.compile(scene, camera);
      } catch {
        // A compile failure must not stop the hero from running.
      }
      beginLoop();
    }

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose();
      });
      if (scene.background instanceof THREE.Texture) scene.background.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount)
        mount.removeChild(renderer.domElement);
    };
  }, [skip, reduced, loop]);

  if (skip) {
    // No canvas at all — the hero's own gradient background shows through, so
    // the section keeps its exact size and the copy/CTAs are unaffected.
    return <div className={className} aria-hidden />;
  }

  const hex = `#${phase.color.toString(16).padStart(6, "0")}`;

  return (
    <div
      className={className}
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />

      {/* Phase caption — bottom-left, clear of the hero copy at every
          breakpoint. Label and colour both come from api.phaseAt(). */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: 26,
          display: "flex",
          alignItems: "center",
          gap: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          fontSize: 12,
          fontWeight: 600,
          color: "#5a6472",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: hex,
            boxShadow: `0 0 0 4px ${hex}2e`,
            transition: "background .3s, box-shadow .3s",
          }}
        />
        <span>{phase.label}</span>
      </div>
    </div>
  );
}
