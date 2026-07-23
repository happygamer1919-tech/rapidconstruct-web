"use client";

/**
 * HeroBuild3D — RapidConstruct homepage intro
 *
 * A stylized house assembles itself from blueprint to finished build while the
 * camera pulls back into a drone view. Deliberately NOT photoreal: clean matte
 * shapes read as intentional, load fast, and never fall into uncanny valley.
 *
 * Massing is derived from the owner's real drone photos (2-storey block + hip
 * roof, single-storey wing, carport, covered porch, grey scored panels, brick
 * chimney) — recognisable as "our build", not a generic house.
 *
 * Deps: @react-three/fiber + three (already in the project). No drei needed.
 *
 * Usage:
 *   <HeroBuild3D onRested={() => setHeroDone(true)} />
 */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/* ---------------------------------------------------------------- tuning -- */

/** Brand orange, eyedropped from the logo. */
const BRAND = "#E08039";

/**
 * Blueprint line colour.
 * Classic technical blue by default. Flip to BRAND for an all-orange blueprint
 * that mirrors the roofline in the logo — one-line change, try both.
 */
const BLUEPRINT = "#1F4FD6";
// const BLUEPRINT = BRAND;

const PALETTE = {
  wall: "#F8F6F2", // white stucco
  roof: "#22272B", // near-black tile
  panel: "#333B44", // grey scored panels
  plinth: "#272D34", // dark base trim
  brick: "#9A5A46", // chimney
  dark: "#161B1F", // windows + doors
  slab: "#D6D6D2", // foundation
  bg: "#EEF2F6",
};

const BUILD_END = 3.7; // seconds until the build + camera settle
const HOLD = 1.5; // pause before the loop restarts

const PHASES: Array<[number, string]> = [
  [0.0, "Proiect"],
  [0.55, "Fundație"],
  [0.82, "Pereți"],
  [1.8, "Acoperiș"],
  [2.35, "Finisaje"],
  [2.9, "RapidConstruct"],
];

/* --------------------------------------------------------------- geometry -- */

type Part = {
  kind: "box" | "hip";
  color: string;
  /** final centre position */
  pos: [number, number, number];
  /** box: w/h/d — hip: halfX/halfZ/height (overhang folded in) */
  size: [number, number, number];
  /** offset the piece flies in from */
  from: [number, number, number];
  start: number;
  dur: number;
  panel?: boolean;
  /**
   * Force the ridge axis instead of letting it follow the longer footprint
   * side. The main block and wing are nearly square, so "longer side" is a
   * coin-flip that pointed the ridge at the camera; the photos show every ridge
   * running parallel to the facade (the X axis here).
   */
  ridgeAlongX?: boolean;
};

const PARTS: Part[] = [
  // foundation
  {
    kind: "box",
    color: PALETTE.slab,
    pos: [-0.5, 0.18, 0.1],
    size: [15, 0.35, 9.5],
    from: [0, -2.6, 0],
    start: 0.55,
    dur: 0.4,
  },

  // main 2-storey block + hip roof
  {
    kind: "box",
    color: PALETTE.wall,
    pos: [4, 3.1, 0],
    size: [6, 6.2, 6.5],
    from: [0, -6.5, 0],
    start: 0.82,
    dur: 0.42,
  },
  {
    kind: "hip",
    color: PALETTE.roof,
    pos: [4, 7.15, 0],
    size: [3.5, 3.75, 1.9],
    from: [0, 9, 0],
    start: 1.8,
    dur: 0.46,
    ridgeAlongX: true,
  },

  // single-storey wing + hip roof
  {
    kind: "box",
    color: PALETTE.wall,
    pos: [-2.5, 1.7, 0.3],
    size: [6, 3.4, 6],
    from: [0, -6.5, 0],
    start: 1.02,
    dur: 0.38,
  },
  {
    kind: "hip",
    color: PALETTE.roof,
    pos: [-2.5, 4.075, 0.3],
    size: [3.45, 3.45, 1.35],
    from: [0, 9, 0],
    start: 2.1,
    dur: 0.4,
    ridgeAlongX: true,
  },

  // dark plinth
  {
    kind: "box",
    color: PALETTE.plinth,
    pos: [4, 0.34, 3.27],
    size: [6, 0.32, 0.16],
    from: [0, -2, 0],
    start: 1.3,
    dur: 0.25,
  },
  {
    kind: "box",
    color: PALETTE.plinth,
    pos: [-2.5, 0.34, 3.32],
    size: [6, 0.32, 0.16],
    from: [0, -2, 0],
    start: 1.36,
    dur: 0.25,
  },

  // grey scored accent panels
  {
    kind: "box",
    color: PALETTE.panel,
    pos: [2.6, 3.1, 3.28],
    size: [1.8, 5.6, 0.18],
    from: [0, 0, 2.4],
    start: 1.3,
    dur: 0.28,
    panel: true,
  },
  {
    kind: "box",
    color: PALETTE.panel,
    pos: [7.02, 3.1, 1.2],
    size: [0.18, 5.6, 1.6],
    from: [2.4, 0, 0],
    start: 1.36,
    dur: 0.28,
    panel: true,
  },
  {
    kind: "box",
    color: PALETTE.panel,
    pos: [-2.5, 1.7, 3.32],
    size: [1.5, 2.9, 0.16],
    from: [0, 0, 2.4],
    start: 1.42,
    dur: 0.28,
    panel: true,
  },

  // carport
  {
    kind: "box",
    color: PALETTE.wall,
    pos: [-6.3, 1.55, 2.6],
    size: [0.4, 3.1, 0.4],
    from: [0, -3, 0],
    start: 1.35,
    dur: 0.26,
  },
  {
    kind: "box",
    color: PALETTE.wall,
    pos: [-4.5, 1.55, 2.6],
    size: [0.4, 3.1, 0.4],
    from: [0, -3, 0],
    start: 1.41,
    dur: 0.26,
  },
  {
    kind: "box",
    color: PALETTE.roof,
    pos: [-5.4, 3.2, 1.1],
    size: [4.4, 0.34, 3.2],
    from: [0, 6, 0],
    start: 1.6,
    dur: 0.3,
  },

  // covered porch
  {
    kind: "box",
    color: PALETTE.wall,
    pos: [-0.6, 1.5, 4.0],
    size: [0.34, 3.0, 0.34],
    from: [0, -3, 0],
    start: 1.45,
    dur: 0.26,
  },
  {
    kind: "box",
    color: PALETTE.wall,
    pos: [1.6, 1.5, 4.0],
    size: [0.34, 3.0, 0.34],
    from: [0, -3, 0],
    start: 1.51,
    dur: 0.26,
  },
  {
    kind: "box",
    color: PALETTE.wall,
    pos: [3.7, 1.5, 4.0],
    size: [0.34, 3.0, 0.34],
    from: [0, -3, 0],
    start: 1.57,
    dur: 0.26,
  },
  {
    kind: "hip",
    color: PALETTE.roof,
    pos: [1.5, 3.4, 3.7],
    size: [3.05, 1.85, 0.8],
    from: [0, 6, 0],
    start: 1.72,
    dur: 0.3,
  },

  // brand accent fascia on the porch eave
  {
    kind: "box",
    color: BRAND,
    pos: [1.5, 3.02, 5.02],
    size: [4.6, 0.13, 0.12],
    from: [0, 6, 0],
    start: 1.95,
    dur: 0.26,
  },

  // chimney
  {
    kind: "box",
    color: PALETTE.brick,
    pos: [5, 7.95, -1.0],
    size: [0.7, 1.7, 0.7],
    from: [0, 6, 0],
    start: 2.35,
    dur: 0.28,
  },
  {
    kind: "box",
    color: PALETTE.roof,
    pos: [5, 8.9, -1.0],
    size: [0.95, 0.22, 0.95],
    from: [0, 6, 0],
    start: 2.48,
    dur: 0.22,
  },

  // openings
  {
    kind: "box",
    color: PALETTE.dark,
    pos: [5.2, 4.4, 3.3],
    size: [1.3, 1.6, 0.12],
    from: [0, 0, 1.6],
    start: 2.36,
    dur: 0.24,
  },
  {
    kind: "box",
    color: PALETTE.dark,
    pos: [2.6, 2.5, 3.34],
    size: [1.0, 1.4, 0.14],
    from: [0, 0, 1.6],
    start: 2.44,
    dur: 0.24,
  },
  {
    kind: "box",
    color: PALETTE.dark,
    pos: [7.05, 4.3, 1.0],
    size: [0.12, 1.4, 1.2],
    from: [1.6, 0, 0],
    start: 2.5,
    dur: 0.24,
  },
  {
    kind: "box",
    color: PALETTE.dark,
    pos: [-2.5, 2.0, 3.36],
    size: [1.0, 1.1, 0.14],
    from: [0, 0, 1.6],
    start: 2.56,
    dur: 0.24,
  },
  {
    kind: "box",
    color: PALETTE.dark,
    pos: [1.0, 1.1, 3.34],
    size: [1.1, 2.2, 0.14],
    from: [0, -2.5, 0],
    start: 2.62,
    dur: 0.24,
  },
];

/* --------------------------------------------------------------- textures -- */

function useScoredTexture() {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 512;
    const x = c.getContext("2d");
    if (!x) return null;
    x.fillStyle = PALETTE.panel;
    x.fillRect(0, 0, 128, 512);
    x.strokeStyle = "rgba(233,233,229,0.8)";
    x.lineWidth = 2;
    for (let y = 44; y < 512; y += 52) {
      x.beginPath();
      x.moveTo(0, y);
      x.lineTo(128, y);
      x.stroke();
    }
    return new THREE.CanvasTexture(c);
  }, []);
}

/**
 * Metal-tile courses for the roof.
 *
 * Without this the roof is one flat near-black fill, which at hero distance
 * reads as a dark blob rather than a roof — the single loudest "toy" cue after
 * the pyramid silhouette. The owner's photos show a strongly banded profile:
 * horizontal courses with a bright step where each row laps the one below, plus
 * a subtle vertical seam every panel width.
 *
 * Drawn light-on-dark so the base tone stays the approved anthracite.
 */
function useTileTexture() {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const x = c.getContext("2d");
    if (!x) return null;

    x.fillStyle = PALETTE.roof;
    x.fillRect(0, 0, 256, 256);

    // six courses; each gets a lit upper lip and a shadowed underside so the
    // profile reads at a glance
    const rows = 6;
    const step = 256 / rows;
    for (let i = 0; i < rows; i++) {
      const y = i * step;
      x.fillStyle = "rgba(255,255,255,0.16)";
      x.fillRect(0, y, 256, Math.max(2, step * 0.16));
      x.fillStyle = "rgba(0,0,0,0.34)";
      x.fillRect(0, y + step - 3, 256, 3);
    }
    // vertical panel seams
    x.fillStyle = "rgba(0,0,0,0.20)";
    for (let vx = 0; vx < 256; vx += 64) x.fillRect(vx, 0, 2, 256);

    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(4, 3);
    return t;
  }, []);
}

function usePaverTexture() {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const x = c.getContext("2d");
    if (!x) return null;
    const n = 8;
    const s = 512 / n;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        x.fillStyle = (i + j) % 2 ? "#C6CACE" : "#EDEFF0";
        x.fillRect(i * s, j * s, s, s);
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(16, 16);
    return t;
  }, []);
}

/* ------------------------------------------------------------------ scene -- */

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeIO = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * A real HIP roof: a horizontal RIDGE with two trapezoidal slopes and two
 * triangular hip ends.
 *
 * This used to be `ConeGeometry(1, height, 4)` — a four-sided cone, i.e. a
 * square PYRAMID converging to a single point. That is the classic Monopoly-
 * house silhouette and it was on every roof in the scene, which is why the
 * building read as a toy. Not one roof in the owner's drone photos is a
 * pyramid: they all have a ridge line.
 *
 * The ridge automatically runs along the LONGER footprint axis, which is what a
 * roofer would do. `ridgeFrac` is the ridge length as a fraction of that axis —
 * 0 would collapse back to a pyramid, ~0.4 matches the photos.
 *
 * UVs: u runs along the ridge, v runs up the slope, so a tile texture lays in
 * horizontal courses parallel to the eave (see useTileTexture).
 */
function hipGeometry(
  halfX: number,
  halfZ: number,
  height: number,
  ridgeFrac = 0.58,
  forceAlongX?: boolean,
) {
  const alongX = forceAlongX ?? halfX >= halfZ;
  const h = height;
  const r = (alongX ? halfX : halfZ) * ridgeFrac;

  // base corners, counter-clockwise seen from above
  const p0: [number, number, number] = [-halfX, 0, -halfZ];
  const p1: [number, number, number] = [halfX, 0, -halfZ];
  const p2: [number, number, number] = [halfX, 0, halfZ];
  const p3: [number, number, number] = [-halfX, 0, halfZ];
  // ridge ends
  const a: [number, number, number] = alongX ? [-r, h, 0] : [0, h, -r];
  const b: [number, number, number] = alongX ? [r, h, 0] : [0, h, r];

  const pos: number[] = [];
  const uv: number[] = [];
  // u along the ridge axis, v up the slope — flat-shaded, so non-indexed.
  const uvFor = (p: [number, number, number]) =>
    alongX
      ? [(p[0] + halfX) / (2 * halfX), p[1] / h]
      : [(p[2] + halfZ) / (2 * halfZ), p[1] / h];
  const tri = (
    x: [number, number, number],
    y: [number, number, number],
    z: [number, number, number],
  ) => {
    pos.push(...x, ...y, ...z);
    uv.push(...uvFor(x), ...uvFor(y), ...uvFor(z));
  };

  if (alongX) {
    tri(p3, p2, b); // +Z slope
    tri(p3, b, a);
    tri(p1, p0, a); // -Z slope
    tri(p1, a, b);
    tri(p2, p1, b); // +X hip end
    tri(p0, p3, a); // -X hip end
  } else {
    tri(p2, p1, a); // +X slope
    tri(p2, a, b);
    tri(p0, p3, b); // -X slope
    tri(p0, b, a);
    tri(p3, p2, b); // +Z hip end
    tri(p1, p0, a); // -Z hip end
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals(); // non-indexed ⇒ crisp flat faces
  // Geometry is built around its own base centre; the PARTS table positions the
  // roof by its centre height, so lift it half its height to match the old cone.
  g.translate(0, -h / 2, 0);
  return g;
}

type SceneProps = {
  onPhase: (label: string) => void;
  onRested?: () => void;
  loop: boolean;
  reduced: boolean;
};

function Scene({ onPhase, onRested, loop, reduced }: SceneProps) {
  const { camera } = useThree();
  const scored = useScoredTexture();
  const pavers = usePaverTexture();
  const tiles = useTileTexture();

  const groupRefs = useRef<(THREE.Group | null)[]>([]);
  const matRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const lineRefs = useRef<(THREE.LineBasicMaterial | null)[]>([]);
  const groundRef = useRef<THREE.MeshStandardMaterial>(null);
  const gridRef = useRef<THREE.LineBasicMaterial>(null);

  const startRef = useRef<number | null>(null);
  const phaseRef = useRef(-1);
  const restedRef = useRef(false);

  const geoms = useMemo(
    () =>
      PARTS.map((p) =>
        p.kind === "hip"
          ? hipGeometry(p.size[0], p.size[1], p.size[2], 0.58, p.ridgeAlongX)
          : new THREE.BoxGeometry(p.size[0], p.size[1], p.size[2]),
      ),
    [],
  );

  const edges = useMemo(
    () => geoms.map((g) => new THREE.EdgesGeometry(g)),
    [geoms],
  );

  useEffect(() => {
    return () => {
      geoms.forEach((g) => g.dispose());
      edges.forEach((e) => e.dispose());
      scored?.dispose();
      tiles?.dispose();
      pavers?.dispose();
    };
  }, [geoms, edges, scored, pavers, tiles]);

  useFrame((state) => {
    // reduced motion: render the finished house, no animation
    const t = reduced
      ? BUILD_END
      : (() => {
          if (startRef.current === null)
            startRef.current = state.clock.elapsedTime;
          let el = state.clock.elapsedTime - startRef.current;
          if (loop && el > BUILD_END + HOLD) {
            startRef.current = state.clock.elapsedTime;
            restedRef.current = false;
            el = 0;
          }
          return el;
        })();

    // ground + grid
    const g = clamp((t - 0.55) / 0.5, 0, 1);
    if (groundRef.current) groundRef.current.opacity = 0.92 * g;
    if (gridRef.current) {
      gridRef.current.opacity =
        lerp(0.34, 0.1, clamp((t - 1.1) / 2.2, 0, 1)) * clamp(t / 0.55, 0, 1);
    }

    // parts
    const bp = clamp(t / 0.55, 0, 1);
    for (let i = 0; i < PARTS.length; i++) {
      const p = PARTS[i];
      const prog = clamp((t - p.start) / p.dur, 0, 1);
      const e = easeOut(prog);

      const grp = groupRefs.current[i];
      if (grp) {
        grp.position.set(
          p.from[0] * (1 - e),
          p.from[1] * (1 - e),
          p.from[2] * (1 - e),
        );
      }
      const mat = matRefs.current[i];
      if (mat) {
        mat.opacity = e;
        mat.emissiveIntensity = (1 - e) * 0.95;
      }
      const line = lineRefs.current[i];
      if (line) line.opacity = (1.0 * (1 - prog) + 0.22 * prog) * bp;
    }

    // camera: close & low -> drone 3/4 pull-back
    const cp = easeIO(clamp((t - 0.12) / (BUILD_END - 0.4), 0, 1));
    const radius = lerp(15.5, 31, cp);
    const height = lerp(3.6, 18.5, cp);
    const ang = -0.55 + cp * 0.62;
    camera.position.set(Math.sin(ang) * radius, height, Math.cos(ang) * radius);
    camera.lookAt(0, 3, 0);

    // phase label
    let idx = 0;
    for (let i = 0; i < PHASES.length; i++) if (t >= PHASES[i][0]) idx = i;
    if (idx !== phaseRef.current) {
      phaseRef.current = idx;
      onPhase(PHASES[idx][1]);
    }

    if (!restedRef.current && t >= BUILD_END) {
      restedRef.current = true;
      onRested?.();
    }
  });

  return (
    <>
      <hemisphereLight args={["#ffffff", "#C6CCD2", 1.0]} />
      {/* Key light lifted 1.15 -> 1.45 (with exposure 1.06 -> 1.12): the facade
          rendered mid-grey when the palette calls for white stucco, which is
          what the owner's houses actually are. */}
      <directionalLight
        position={[-16, 26, 13]}
        intensity={1.45}
        color="#FFF3E2"
      />
      <directionalLight
        position={[15, 11, -13]}
        intensity={0.4}
        color="#DFE8FF"
      />

      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[220, 220]} />
        <meshStandardMaterial
          ref={groundRef}
          color={pavers ? "#ffffff" : "#E9EDF1"}
          map={pavers ?? undefined}
          roughness={1}
          metalness={0}
          transparent
          opacity={0}
        />
      </mesh>

      {/* blueprint grid */}
      <gridHelper args={[96, 96, BLUEPRINT, "#C0CAD4"]}>
        <lineBasicMaterial
          ref={gridRef}
          attach="material"
          transparent
          opacity={0}
        />
      </gridHelper>

      {PARTS.map((p, i) => (
        <group
          key={i}
          ref={(el) => {
            groupRefs.current[i] = el;
          }}
        >
          <mesh geometry={geoms[i]} position={p.pos}>
            <meshStandardMaterial
              ref={(el) => {
                matRefs.current[i] = el;
              }}
              // Roof pieces take the tile-course map; the scored panels take
              // their stripe map. Both drive colour from the texture, so the
              // material colour goes white to avoid double-darkening.
              color={
                (p.panel && scored) || (p.color === PALETTE.roof && tiles)
                  ? "#ffffff"
                  : p.color
              }
              map={
                p.panel
                  ? (scored ?? undefined)
                  : p.color === PALETTE.roof
                    ? (tiles ?? undefined)
                    : undefined
              }
              roughness={0.9}
              metalness={0}
              transparent
              opacity={0}
              emissive={BLUEPRINT}
              emissiveIntensity={0}
            />
          </mesh>
          <lineSegments geometry={edges[i]} position={p.pos}>
            <lineBasicMaterial
              ref={(el) => {
                lineRefs.current[i] = el;
              }}
              color={BLUEPRINT}
              transparent
              opacity={0}
            />
          </lineSegments>
        </group>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ shell -- */

export type HeroBuild3DProps = {
  /** fires once when the build + camera settle */
  onRested?: () => void;
  /** loop the animation (default true) */
  loop?: boolean;
  className?: string;
};

export default function HeroBuild3D({
  onRested,
  loop = true,
  className,
}: HeroBuild3DProps) {
  const [phase, setPhase] = useState(PHASES[0][1]);

  // Both of these are read LAZILY instead of being set from inside an effect.
  // The project's eslint config errors on a synchronous setState in an effect
  // body (cascading renders) and it fails the blocking CI lint gate. Lazy init
  // is also the better behaviour: the right value is present on the very first
  // render, so a reduced-motion visitor never sees a frame of animation before
  // it is cancelled, and a WebGL-less browser never flashes a live canvas.
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  // graceful fallback if WebGL is unavailable
  const [failed] = useState(() => {
    if (typeof document === "undefined") return false;
    try {
      const c = document.createElement("canvas");
      return !(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // setState inside a subscription callback is fine — the rule (and React)
    // objects only to the synchronous call in the effect body.
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  if (failed) {
    return (
      <div
        className={className}
        style={{ background: PALETTE.bg, width: "100%", height: "100%" }}
        aria-hidden
      />
    );
  }

  return (
    <div
      className={className}
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ fov: 38, near: 0.1, far: 500, position: [8, 4, 14] }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(PALETTE.bg);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.12;
          scene.fog = new THREE.Fog(PALETTE.bg, 50, 130);
        }}
      >
        <Scene
          onPhase={setPhase}
          onRested={onRested}
          loop={loop}
          reduced={reduced}
        />
      </Canvas>

      {/* Phase caption. Pinned to the BOTTOM, not the top: the hero sizes this
          component's box to the lower half on mobile, so a top-anchored caption
          landed on top of the hero's trust line. The bottom edge is clear at
          every breakpoint. */}
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
          color: "#6B7785",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: phase === "RapidConstruct" ? BRAND : BLUEPRINT,
            boxShadow: `0 0 0 4px ${phase === "RapidConstruct" ? "rgba(224,128,57,.18)" : "rgba(31,79,214,.18)"}`,
            transition: "background .3s, box-shadow .3s",
          }}
        />
        <span>{phase}</span>
      </div>
    </div>
  );
}
