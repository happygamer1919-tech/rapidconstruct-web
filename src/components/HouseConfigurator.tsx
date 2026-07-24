"use client";

/**
 * HouseConfigurator — interactive 3D house configurator (feature/configurator).
 *
 * Mounts the same scene engine as the hero (`buildScene`) but with a config:
 * every selection calls `api.setConfig(patch)`, which rebuilds ONLY the
 * affected geometry (roof / fence / walls) and replays a short fly-in — the
 * scene never reloads. The initial mount plays the full signature build
 * animation once, then hands the camera to OrbitControls.
 *
 * Rendering is on-demand: the rAF loop always ticks (cheap bookkeeping) but
 * the GPU only renders while something moves — the initial build, a rebuild
 * fly-in, or the user dragging the camera. An idle configurator draws no
 * frames (the hero's battery rule, kept).
 *
 * Reduced motion: no build animation, config changes snap instead of flying.
 * No WebGL / low-end device / ?no3d=1: the canvas is skipped entirely but the
 * whole configuration UI (prices, specs, totals) keeps working.
 */

import { useEffect, useId, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buildScene } from "@/scenes/rapidconstruct-scene";
import { skipHeavy3d } from "@/lib/audit";
import {
  AREA_PRESETS,
  DEFAULT_CONFIG,
  ROOF_MATERIALS_3D,
  ROOF_MATERIAL_ORDER,
  ROOF_TYPES,
  type HouseConfig,
  type RoofMaterialId,
  type RoofTypeId,
} from "@/config/configurator";

/** Sane bounds for the free-input roof area (m²). */
const MIN_AREA = 30;
const MAX_AREA = 2000;

/** The engine is plain JS — type the slice of its API the component drives. */
type SceneApi = {
  update: (t: number) => void;
  cameraAt: (t: number) => { position: number[]; lookAt: number[] };
  phaseAt: (t: number) => { label: unknown; color: unknown };
  setConfig: (patch: Partial<HouseConfig>) => string[];
  isSettled: () => boolean;
  BUILD_END: number;
  HOLD: number;
};

/** Group thousands with a thin non-breaking space, locale-agnostic. */
function fmt(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/** Same skip logic as the hero (no WebGL / ?no3d=1 / low-end device). */
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

export default function HouseConfigurator() {
  const t = useTranslations("configuratorPage");
  const skip = useSkipCanvas();

  const mountRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<SceneApi | null>(null);
  /** Wall-clock seconds on the scene's own timeline (never loops). */
  const tRef = useRef(0);
  /** Set by `apply`; the rAF loop turns it into a render window (the loop
   *  owns all clocks — React Compiler purity keeps them out of handlers). */
  const kickRef = useRef(false);
  const needsRenderRef = useRef(true);

  const [config, setConfig] = useState<HouseConfig>(DEFAULT_CONFIG);
  const [building, setBuilding] = useState(true);
  /** Roof area as typed (string, so the field can be cleared); presets write
   *  into the same state — one source of truth for the estimate. */
  const [areaInput, setAreaInput] = useState("150");
  const areaId = useId();

  /** Apply a config patch to state + scene; rebuilt pieces fly in (~1.2 s). */
  const apply = (patch: Partial<HouseConfig>) => {
    setConfig((prev) => ({
      model: patch.model ?? prev.model,
      roof: { ...prev.roof, ...patch.roof },
      walls: { ...prev.walls, ...patch.walls },
      fence: { ...prev.fence, ...patch.fence },
    }));
    apiRef.current?.setConfig(patch);
    kickRef.current = true;
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (skip || !mount) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 1200);
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

    const api = buildScene(THREE, scene, renderer, DEFAULT_CONFIG) as SceneApi;
    apiRef.current = api;

    // Same portrait-safe lens as the hero: constant HORIZONTAL fov, clamped.
    const BASE_FOV = 40;
    const REF_ASPECT = 16 / 9;
    const RAD = Math.PI / 180;
    const H_FOV = 2 * Math.atan(Math.tan((BASE_FOV / 2) * RAD) * REF_ASPECT);
    const fovFor = (aspect: number) =>
      aspect >= REF_ASPECT
        ? BASE_FOV
        : Math.min(74, (2 * Math.atan(Math.tan(H_FOV / 2) / aspect)) / RAD);

    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = fovFor(camera.aspect);
      camera.updateProjectionMatrix();
      needsRenderRef.current = true;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    // Camera controls take over AFTER the build lands (drone view handoff).
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 14;
    controls.maxDistance = 70;
    // Never below the pavement, never straight overhead.
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.minPolarAngle = Math.PI * 0.14;
    controls.target.set(-0.5, 3.3, 0.5);
    controls.addEventListener("change", () => {
      needsRenderRef.current = true;
    });

    let raf = 0;
    let start = 0;
    let handedOff = false;
    let cancelled = false;
    let animUntil = 0; // render frames until this performance.now() timestamp

    const poseFromPath = (tt: number) => {
      const cam = api.cameraAt(tt);
      camera.position.set(cam.position[0], cam.position[1], cam.position[2]);
      camera.lookAt(cam.lookAt[0], cam.lookAt[1], cam.lookAt[2]);
    };

    const handOff = () => {
      handedOff = true;
      poseFromPath(api.BUILD_END);
      controls.enabled = true;
      controls.update();
      needsRenderRef.current = true;
      setBuilding(false);
    };

    const tick = () => {
      // Render-loop guard (§10): schedule first, work in try/catch.
      raf = requestAnimationFrame(tick);
      try {
        const now = performance.now();
        if (kickRef.current) {
          kickRef.current = false;
          if (reduced) {
            // Snap: jump past every rebased fly-in, draw one frame.
            tRef.current += 6;
            needsRenderRef.current = true;
          } else {
            animUntil = now + 1800;
          }
        }
        // tRef only moves forward; reduced-motion "snap" jumps are additive.
        const base = (now - start) / 1000;
        if (base > tRef.current) tRef.current = base;
        const tt = tRef.current;

        if (!handedOff) {
          api.update(tt);
          poseFromPath(Math.min(tt, api.BUILD_END));
          if (tt >= api.BUILD_END) handOff();
          renderer.render(scene, camera);
          return;
        }
        api.update(tt);
        controls.update();
        if (needsRenderRef.current || now < animUntil) {
          needsRenderRef.current = false;
          renderer.render(scene, camera);
        }
      } catch {
        // Swallow one bad frame rather than kill the loop.
      }
    };

    const beginLoop = () => {
      if (cancelled) return;
      start = performance.now();
      if (reduced) {
        // No build animation: settled house, controls live immediately.
        tRef.current = api.BUILD_END;
        api.update(api.BUILD_END);
        handOff();
        renderer.render(scene, camera);
      }
      raf = requestAnimationFrame(tick);
    };

    // Warm the shaders before the clock starts (hero rule — without this the
    // build is ~80% over by the second drawn frame on first visit).
    api.update(reduced ? api.BUILD_END : 0);
    poseFromPath(reduced ? api.BUILD_END : 0);
    const r = renderer as THREE.WebGLRenderer & {
      compileAsync?: (s: THREE.Object3D, c: THREE.Camera) => Promise<unknown>;
    };
    if (typeof r.compileAsync === "function") {
      r.compileAsync(scene, camera).then(beginLoop, beginLoop);
    } else {
      try {
        renderer.compile(scene, camera);
      } catch {
        // A compile failure must not stop the configurator from running.
      }
      beginLoop();
    }

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      apiRef.current = null;
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
    // Mount once — config changes go through api.setConfig, never a remount.
  }, [skip]);

  const material = ROOF_MATERIALS_3D[config.roof.material];

  const areaNum = Number(areaInput.replace(",", "."));
  const areaValid =
    Number.isFinite(areaNum) && areaNum >= MIN_AREA && areaNum <= MAX_AREA;
  const estimate =
    areaValid && material.band
      ? {
          low: material.band.min * areaNum,
          high: material.band.max * areaNum,
        }
      : null;

  const chip = (selected: boolean) =>
    `rounded-lg border px-3 py-2 text-left text-caption font-medium transition-colors ${
      selected
        ? "border-accent bg-accent/10 text-foreground"
        : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
    }`;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      {/* 3D viewer */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="relative h-[420px] overflow-hidden rounded-xl border border-border bg-muted lg:h-[560px]">
          {skip ? (
            <div className="flex h-full items-center justify-center p-8 text-center text-body text-muted-foreground">
              {t("viewer.fallback")}
            </div>
          ) : (
            <>
              <div ref={mountRef} className="absolute inset-0" />
              {!building && (
                <p className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-caption text-muted-foreground">
                  {t("viewer.hint")}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Control panel */}
      <div className="flex flex-col gap-8">
        {/* ROOF */}
        <section aria-label={t("roof.title")}>
          <h2 className="micro-label mb-3 text-muted-foreground">
            {t("roof.title")}
          </h2>

          <p className="mb-2 text-caption font-medium text-foreground">
            {t("roof.typeLabel")}
          </p>
          <div className="mb-5 grid grid-cols-2 gap-2">
            {ROOF_TYPES.map((id: RoofTypeId) => (
              <button
                key={id}
                type="button"
                className={chip(config.roof.type === id)}
                aria-pressed={config.roof.type === id}
                onClick={() => apply({ roof: { ...config.roof, type: id } })}
              >
                {t(`roof.types.${id}`)}
              </button>
            ))}
          </div>

          <p className="mb-2 text-caption font-medium text-foreground">
            {t("roof.materialLabel")}
          </p>
          <div className="grid grid-cols-1 gap-2">
            {ROOF_MATERIAL_ORDER.map((id: RoofMaterialId) => {
              const m = ROOF_MATERIALS_3D[id];
              return (
                <button
                  key={id}
                  type="button"
                  className={`${chip(config.roof.material === id)} flex items-baseline justify-between gap-3`}
                  aria-pressed={config.roof.material === id}
                  onClick={() =>
                    apply({ roof: { ...config.roof, material: id } })
                  }
                >
                  <span>{t(`roof.materials.${id}`)}</span>
                  <span className="shrink-0 text-caption text-muted-foreground">
                    {m.band
                      ? t("price.from", { price: fmt(m.band.min) })
                      : t("price.onRequest")}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* SPEC PANEL */}
        <section
          aria-label={t("specs.title")}
          className="rounded-xl border border-border bg-muted/40 p-5"
        >
          <h2 className="micro-label mb-3 text-muted-foreground">
            {t("specs.title")}
          </h2>
          <p className="mb-4 font-serif text-2xl text-foreground">
            {material.band
              ? t("price.from", { price: fmt(material.band.min) })
              : t("price.onRequest")}
          </p>
          <dl className="grid gap-2 text-caption">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{t("specs.durability")}</dt>
              <dd className="font-medium text-foreground">
                {t("specs.durabilityValue", { value: material.specs.durability })}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{t("specs.warranty")}</dt>
              <dd className="font-medium text-foreground">
                {t("specs.warrantyValue", { value: material.specs.warranty })}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{t("specs.weight")}</dt>
              <dd className="font-medium text-foreground">
                {t("specs.weightValue", { value: material.specs.weight })}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-caption text-muted-foreground">
            {material.band ? t("specs.note") : t("price.onRequestNote")}
          </p>
        </section>

        {/* AREA */}
        <section aria-label={t("area.title")}>
          <h2 className="micro-label mb-3 text-muted-foreground">
            {t("area.title")}
          </h2>
          <p className="mb-2 text-caption font-medium text-foreground">
            {t("area.label")}
          </p>
          <div className="mb-3 grid grid-cols-5 gap-2">
            {AREA_PRESETS.map((v) => (
              <button
                key={v}
                type="button"
                className={`${chip(areaNum === v)} whitespace-nowrap px-2 text-center`}
                aria-pressed={areaNum === v}
                onClick={() => setAreaInput(String(v))}
              >
                {t("area.preset", { value: v })}
              </button>
            ))}
          </div>
          <label
            htmlFor={areaId}
            className="mb-1 block text-caption text-muted-foreground"
          >
            {t("area.customLabel")}
          </label>
          <input
            id={areaId}
            type="text"
            inputMode="decimal"
            value={areaInput}
            onChange={(e) => setAreaInput(e.target.value)}
            placeholder={t("area.customPlaceholder")}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-body text-foreground outline-none transition-colors focus:border-accent"
          />
        </section>

        {/* ESTIMATE */}
        <section
          aria-label={t("estimate.title")}
          className="rounded-xl border border-border bg-inverse-background p-5 text-inverse-foreground"
        >
          <h2 className="micro-label mb-3 text-inverse-muted-foreground">
            {t("estimate.title")}
          </h2>
          {estimate ? (
            <>
              <p
                className="font-serif text-2xl"
                aria-live="polite"
              >
                {t("estimate.range", {
                  low: fmt(estimate.low),
                  high: fmt(estimate.high),
                })}
              </p>
              <p className="mt-1 text-caption text-inverse-muted-foreground">
                {t("estimate.breakdown", {
                  area: areaNum,
                  material: t(`roof.materials.${config.roof.material}`),
                })}
              </p>
              <p className="mt-4 text-caption text-inverse-muted-foreground">
                {t("estimate.disclaimer")}
              </p>
            </>
          ) : (
            <p className="text-caption text-inverse-muted-foreground">
              {material.band ? t("estimate.disclaimer") : t("estimate.onRequest")}
            </p>
          )}
          <Link
            href="/contact"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-caption font-semibold text-accent-foreground transition-opacity hover:opacity-90"
          >
            {t("estimate.cta")}
          </Link>
        </section>
      </div>
    </div>
  );
}
