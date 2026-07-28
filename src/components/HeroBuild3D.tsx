"use client";

/**
 * HeroBuild3D — RapidConstruct homepage intro.
 *
 * Built to docs/3D-HERO-SPEC.md (mirrored from the owner's spec). Stylized-
 * realistic: clean parametric geometry, real materials, real light — NOT a
 * photogrammetry scan (the scan is dimensionally accurate but wobbly; kept only
 * as a measurement reference). Two stepped volumes — a long single-storey wing
 * on the left, a taller two-storey block with a cross gable on the right — build
 * themselves from blueprint wireframe into finished house while the camera pulls
 * back to a drone three-quarter view.
 *
 * Coordinate system (spec §2): Y up, +Z front (street/camera side), +X right,
 * metres.
 *
 * Deps: three, @react-three/fiber, @react-three/postprocessing (SSAO + DOF).
 */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  EffectComposer,
  SSAO,
  DepthOfField,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/* ------------------------------------------------------------------ brand -- */

const BRAND = "#E08039"; // §9 — eyedropped from the logo
const BLUEPRINT = "#1F4FD6"; // §9 — wireframe draw-in colour

const COL = {
  render: 0xf1eee6, // §5 warm off-white — never pure white (read blue/clinical)
  stone: 0xc6bfb1, // §5 stone base + quoins
  band: 0xd8cfbf, // banding / string course
  greyBand: 0x8c8f92, // §5 painted grey vertical strips (NOT wood)
  plinth: 0x1d2227, // §5 dark base line
  roof: 0x757b78, // §4 matte dark neutral grey, trace of green
  fascia: 0x131719, // §4 dark eave rim
  soffit: 0xece7dd, // §4 white soffit inset (else you see through the hip)
  timber: 0xd8b98a, // §4.1 warm timber soffit
  glass: 0x1b232b,
  brick: 0x9c5a44, // §4 chimney brick
  mortar: 0xc9bfae,
  dark: 0x161b1f, // doors, car
  slab: 0xd0cec8, // foundation slab
  paveA: 0xcfd2d4,
  paveB: 0x9fa4a8,
  gravel: 0xb9b3a6,
  grass: 0x6f7d4c,
  fence: 0x8a8d90,
} as const;

/* ------------------------------------------------------ procedural canvases -- */

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
}

/** §4 roof: pan tiles, crown highlight, deep row shadow, vertical seams. */
function roofTexture() {
  const [c, x] = makeCanvas(256, 256);
  x.fillStyle = "#6f7572";
  x.fillRect(0, 0, 256, 256);
  const cols = 12;
  const rows = 12;
  const cw = 256 / cols;
  const rh = 256 / rows;
  for (let r = 0; r < rows; r++) {
    const y = r * rh;
    // deep shadow between rows
    x.fillStyle = "rgba(0,0,0,0.42)";
    x.fillRect(0, y + rh - 3, 256, 3);
    for (let cc = 0; cc < cols; cc++) {
      const px = cc * cw;
      // quadratic crown highlight
      const g = x.createLinearGradient(px, y, px + cw, y);
      g.addColorStop(0, "rgba(0,0,0,0.20)");
      g.addColorStop(0.5, "rgba(255,255,255,0.14)");
      g.addColorStop(1, "rgba(0,0,0,0.20)");
      x.fillStyle = g;
      x.fillRect(px, y, cw, rh - 3);
    }
  }
  // vertical sheet seams
  x.fillStyle = "rgba(0,0,0,0.22)";
  for (let sx = 0; sx <= 256; sx += cw * 3) x.fillRect(sx, 0, 2, 256);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** §5 render: warm off-white noise + faint grime gradient near the base. */
function renderTexture() {
  const [c, x] = makeCanvas(256, 256);
  x.fillStyle = "#f1eee6";
  x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 5200; i++) {
    const a = Math.floor(Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 18);
    x.fillStyle = `rgba(150,140,120,0.05)`;
    const px = (Math.sin(i * 1.7) * 0.5 + 0.5) * 256;
    const py = (Math.cos(i * 2.3) * 0.5 + 0.5) * 256;
    x.fillRect(px, py, 1 + (a % 2), 1);
  }
  const grime = x.createLinearGradient(0, 200, 0, 256);
  grime.addColorStop(0, "rgba(120,110,95,0)");
  grime.addColorStop(1, "rgba(120,110,95,0.18)");
  x.fillStyle = grime;
  x.fillRect(0, 200, 256, 56);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** §5 stone: staggered large-format courses, per-block tonal variation. */
function stoneTexture() {
  const [c, x] = makeCanvas(256, 256);
  x.fillStyle = "#c6bfb1";
  x.fillRect(0, 0, 256, 256);
  const rh = 42;
  let row = 0;
  for (let y = 0; y < 256; y += rh, row++) {
    const bw = 62;
    const off = row % 2 ? -bw / 2 : 0;
    for (let bx = off; bx < 256; bx += bw) {
      const tone = 0.82 + (Math.abs(Math.sin((bx + y) * 0.05)) % 1) * 0.3;
      const base = Math.floor(178 * tone);
      const gr = x.createLinearGradient(bx, y, bx, y + rh);
      gr.addColorStop(0, `rgb(${base + 14},${base + 8},${base - 4})`);
      gr.addColorStop(1, `rgb(${base - 16},${base - 20},${base - 28})`);
      x.fillStyle = gr;
      x.fillRect(bx + 1, y + 1, bw - 2, rh - 2);
      // vertical veining
      x.strokeStyle = "rgba(90,84,74,0.25)";
      x.beginPath();
      x.moveTo(bx + bw * 0.5, y + 2);
      x.lineTo(bx + bw * 0.5 + 3, y + rh - 2);
      x.stroke();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** §4 chimney brick: running bond, terracotta with pale mortar. */
function brickTexture() {
  const [c, x] = makeCanvas(128, 128);
  x.fillStyle = "#c9bfae";
  x.fillRect(0, 0, 128, 128);
  const bh = 16;
  const bw = 32;
  let row = 0;
  for (let y = 0; y < 128; y += bh, row++) {
    const off = row % 2 ? -bw / 2 : 0;
    for (let bx = off; bx < 128; bx += bw) {
      x.fillStyle = `rgb(${150 + ((bx * 7) % 20)},${88 + ((y * 5) % 14)},68)`;
      x.fillRect(bx + 1.5, y + 1.5, bw - 3, bh - 3);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** §6 paving: checkerboard, rotated 45° at the mesh (runs diagonal in photos). */
function paveTexture() {
  const [c, x] = makeCanvas(256, 256);
  const n = 8;
  const s = 256 / n;
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      x.fillStyle = (i + j) % 2 ? "#cfd2d4" : "#9fa4a8";
      x.fillRect(i * s, j * s, s, s);
    }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(20, 20);
  t.rotation = Math.PI / 4; // §6 diagonal
  t.center.set(0.5, 0.5);
  return t;
}

/** §6 grass: procedural noise with dirt patches. */
function grassTexture() {
  const [c, x] = makeCanvas(256, 256);
  x.fillStyle = "#6f7d4c";
  x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 6000; i++) {
    const px = (Math.sin(i * 3.1) * 0.5 + 0.5) * 256;
    const py = (Math.cos(i * 4.7) * 0.5 + 0.5) * 256;
    const g = 60 + ((i * 13) % 40);
    x.fillStyle = `rgba(${g},${g + 30},${40 + (i % 20)},0.5)`;
    x.fillRect(px, py, 2, 2);
  }
  for (let i = 0; i < 22; i++) {
    const px = (Math.sin(i * 9.1) * 0.5 + 0.5) * 256;
    const py = (Math.cos(i * 5.3) * 0.5 + 0.5) * 256;
    x.fillStyle = "rgba(120,104,74,0.35)";
    x.beginPath();
    x.arc(px, py, 6 + (i % 5), 0, Math.PI * 2);
    x.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(60, 60);
  return t;
}

/* ------------------------------------------------------- geometry helpers -- */

/**
 * §10 hip roof with a REAL ridge (six triangles), ridge along the X axis.
 * hx/hz are half-footprint, h the rise, rx the ridge half-length. UVs from the
 * footprint so tiles lay in courses parallel to the eave. Non-indexed ⇒ flat
 * faces. Built around its own base centre (y 0 at eave, +h at ridge).
 */
function hipR(hx: number, hz: number, h: number, rx: number) {
  const p0: THREE.Vector3Tuple = [-hx, 0, -hz];
  const p1: THREE.Vector3Tuple = [hx, 0, -hz];
  const p2: THREE.Vector3Tuple = [hx, 0, hz];
  const p3: THREE.Vector3Tuple = [-hx, 0, hz];
  const a: THREE.Vector3Tuple = [-rx, h, 0];
  const b: THREE.Vector3Tuple = [rx, h, 0];
  const pos: number[] = [];
  const uv: number[] = [];
  const uvFor = (p: THREE.Vector3Tuple): [number, number] => [
    (p[0] + hx) / (2 * hx),
    p[1] / h,
  ];
  const tri = (
    x: THREE.Vector3Tuple,
    y: THREE.Vector3Tuple,
    z: THREE.Vector3Tuple,
  ) => {
    pos.push(...x, ...y, ...z);
    uv.push(...uvFor(x), ...uvFor(y), ...uvFor(z));
  };
  tri(p3, p2, b); // +Z slope
  tri(p3, b, a);
  tri(p1, p0, a); // -Z slope
  tri(p1, a, b);
  tri(p2, p1, b); // +X hip end
  tri(p0, p3, a); // -X hip end
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}

/** §10 gable prism, ridge along Z. DoubleSide material — winding is unreliable. */
function gable(hx: number, hz: number, h: number) {
  const g = new THREE.BufferGeometry();
  const v = [
    -hx,
    0,
    -hz,
    hx,
    0,
    -hz,
    0,
    h,
    -hz,
    -hx,
    0,
    hz,
    hx,
    0,
    hz,
    0,
    h,
    hz,
  ];
  const idx = [
    0, 1, 2, 3, 5, 4, 0, 2, 5, 0, 5, 3, 1, 4, 5, 1, 5, 2, 0, 3, 4, 0, 4, 1,
  ];
  g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/* --------------------------------------------------------- animatable parts -- */

type Kind = "box" | "hip" | "gable";
type Part = {
  id: string;
  kind: Kind;
  color: number;
  /** final centre position */
  pos: THREE.Vector3Tuple;
  /** box: w/h/d — hip/gable: hx/hz/h (rise) */
  size: THREE.Vector3Tuple;
  /** ridge half-length for hips */
  rx?: number;
  from: THREE.Vector3Tuple; // fly-in offset
  start: number;
  dur: number;
  tex?: "roof" | "render" | "stone" | "brick";
  double?: boolean;
  /** rotate Y (radians) applied BEFORE translate (§10) */
  rotY?: number;
};

// §3 massing anchors
const WING_X = -3.7;
const BLOCK_X = 5.9;

const PARTS: Part[] = [
  // ---- §6 foundation slab (lands first with the ground) ----
  {
    id: "slab",
    kind: "box",
    color: COL.slab,
    pos: [1, 0.15, 0.1],
    size: [26, 0.3, 12],
    from: [0, -3, 0],
    start: 0.5,
    dur: 0.4,
  },

  // ---- §3.1 WING (left, single storey) ----
  {
    id: "wing-stone",
    kind: "box",
    color: COL.stone,
    pos: [WING_X, 0.825, -0.1],
    size: [10.6, 1.05, 5.2],
    from: [0, -6, 0],
    start: 0.85,
    dur: 0.4,
    tex: "stone",
  },
  {
    id: "wing-band",
    kind: "box",
    color: COL.band,
    pos: [WING_X, 1.415, -0.1],
    size: [10.72, 0.13, 5.32],
    from: [0, -6, 0],
    start: 0.95,
    dur: 0.3,
  },
  {
    id: "wing-render",
    kind: "box",
    color: COL.render,
    pos: [WING_X, 2.64, -0.1],
    size: [10.6, 2.32, 5.2],
    from: [0, -6, 0],
    start: 1.0,
    dur: 0.42,
    tex: "render",
  },
  // §3.1 ONE continuous roof plane forward past the wall to the carport/entrance
  {
    id: "wing-roof",
    kind: "hip",
    color: COL.roof,
    pos: [WING_X, 3.8, 0.55],
    size: [5.95, 4.15, 1.35],
    rx: 2.9,
    from: [0, 8, 0],
    start: 1.7,
    dur: 0.5,
    tex: "roof",
  },

  // ---- §3.2 BLOCK (right, two storeys, "cu fronton") ----
  {
    id: "block-stone",
    kind: "box",
    color: COL.stone,
    pos: [BLOCK_X, 0.725, 0.2],
    size: [8.2, 0.85, 6.8],
    from: [0, -7, 0],
    start: 0.9,
    dur: 0.42,
    tex: "stone",
  },
  {
    id: "block-band",
    kind: "box",
    color: COL.band,
    pos: [BLOCK_X, 1.215, 0.2],
    size: [8.32, 0.13, 6.92],
    from: [0, -7, 0],
    start: 1.0,
    dur: 0.3,
  },
  {
    id: "block-render",
    kind: "box",
    color: COL.render,
    pos: [BLOCK_X, 3.94, 0.2],
    size: [8.2, 5.32, 6.8],
    from: [0, -7, 0],
    start: 1.05,
    dur: 0.46,
    tex: "render",
  },
  {
    id: "block-string",
    kind: "box",
    color: COL.band,
    pos: [BLOCK_X, 3.6, 0.2],
    size: [8.34, 0.1, 6.94],
    from: [0, -7, 0],
    start: 1.2,
    dur: 0.3,
  },
  {
    id: "block-roof",
    kind: "hip",
    color: COL.roof,
    pos: [BLOCK_X, 6.6, 0.2],
    size: [4.85, 4.15, 2.05],
    rx: 3.3,
    from: [0, 9, 0],
    start: 1.85,
    dur: 0.5,
    tex: "roof",
  },

  // §3.2 cross gable (breaks the roof; subordinate ridge)
  {
    id: "gable-bay",
    kind: "box",
    color: COL.render,
    pos: [7.5, 3.45, 4.4],
    size: [3.6, 6.3, 1.6],
    from: [0, -6, 0],
    start: 1.35,
    dur: 0.4,
    tex: "render",
  },
  {
    id: "gable-roof",
    kind: "gable",
    color: COL.roof,
    pos: [7.5, 6.6, 2.8],
    size: [2.05, 2.6, 1.55],
    from: [0, 8, 0],
    start: 2.0,
    dur: 0.42,
    tex: "roof",
    double: true,
  },

  // ---- §3.1 carport columns carrying the wing roof front edge ----
  {
    id: "col1",
    kind: "box",
    color: COL.render,
    pos: [-8.1, 1.9, 3.9],
    size: [0.4, 3.4, 0.4],
    from: [0, -4, 0],
    start: 1.45,
    dur: 0.28,
  },
  {
    id: "col2",
    kind: "box",
    color: COL.render,
    pos: [-6.0, 1.9, 3.9],
    size: [0.4, 3.4, 0.4],
    from: [0, -4, 0],
    start: 1.5,
    dur: 0.28,
  },
  {
    id: "col3",
    kind: "box",
    color: COL.render,
    pos: [-3.9, 1.9, 3.9],
    size: [0.4, 3.4, 0.4],
    from: [0, -4, 0],
    start: 1.55,
    dur: 0.28,
  },
  {
    id: "col4",
    kind: "box",
    color: COL.render,
    pos: [-1.8, 1.9, 3.9],
    size: [0.4, 3.4, 0.4],
    from: [0, -4, 0],
    start: 1.6,
    dur: 0.28,
  },

  // ---- §5 grey vertical accent bands (painted render, NOT wood) ----
  {
    id: "band-blockcorner",
    kind: "box",
    color: COL.greyBand,
    pos: [9.95, 3.94, 3.5],
    size: [0.16, 5.0, 1.4],
    from: [2, 0, 0],
    start: 1.55,
    dur: 0.3,
  },
  {
    id: "band-entry",
    kind: "box",
    color: COL.greyBand,
    pos: [7.5, 3.0, 5.22],
    size: [1.4, 5.2, 0.16],
    from: [0, 0, 2],
    start: 1.6,
    dur: 0.3,
  },

  // ---- §4 chimneys (brick) ----
  {
    id: "chimney1",
    kind: "box",
    color: COL.brick,
    pos: [5.9, 8.3, -1.2],
    size: [0.85, 1.9, 0.85],
    from: [0, 6, 0],
    start: 2.35,
    dur: 0.3,
    tex: "brick",
  },
  {
    id: "chimney1-cap",
    kind: "box",
    color: 0x9aa0a2,
    pos: [5.9, 9.4, -1.2],
    size: [1.05, 0.14, 1.05],
    from: [0, 6, 0],
    start: 2.5,
    dur: 0.22,
  },
  {
    id: "chimney2",
    kind: "box",
    color: COL.brick,
    pos: [-5.4, 5.1, -1.0],
    size: [0.72, 1.7, 0.72],
    from: [0, 6, 0],
    start: 2.4,
    dur: 0.3,
    tex: "brick",
  },
  {
    id: "chimney2-cap",
    kind: "box",
    color: 0x9aa0a2,
    pos: [-5.4, 6.05, -1.0],
    size: [0.9, 0.14, 0.9],
    from: [0, 6, 0],
    start: 2.55,
    dur: 0.22,
  },

  // ---- §9 brand accent fascia on the porch eave ----
  {
    id: "brand-fascia",
    kind: "box",
    color: 0xe08039,
    pos: [WING_X, 3.72, 4.66],
    size: [8.0, 0.14, 0.12],
    from: [0, 5, 0],
    start: 2.1,
    dur: 0.3,
  },
];

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** §8 camera quad ease — accelerates, then settles rather than stops hard. */
const quadSettle = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

/* ---------------------------------------------------------------- timeline -- */

const BUILD_END = 4.3; // §8
const HOLD = 2.1;
const PHASES: Array<[number, string]> = [
  [0.0, "Proiect"],
  [0.5, "Fundație"],
  [0.85, "Pereți"],
  [1.7, "Acoperiș"],
  [2.3, "Finisaje"],
  [3.5, "RapidConstruct"],
];

/* ------------------------------------------------- window ring (§5.1) -- */

/**
 * §5.1 CRITICAL — a window is a RING of four bars around recessed glass, NEVER
 * a solid box (a box sits in front of the glass and hides it). Front-facing
 * (+Z) elevation. `flip` mirrors it to the -Z rear.
 */
function Window({
  cx,
  cy,
  cz,
  w,
  h,
  wallFace,
  mullion = false,
}: {
  cx: number;
  cy: number;
  cz: number;
  w: number;
  h: number;
  wallFace: number;
  mullion?: boolean;
}) {
  const bar = 0.09;
  const depth = 0.15;
  const z = wallFace - 0.02;
  return (
    <group position={[cx, cy, cz]}>
      {/* recessed glass */}
      <mesh position={[0, 0, wallFace - 0.1 - cz]}>
        <planeGeometry args={[w - bar, h - bar]} />
        <meshStandardMaterial
          color={COL.glass}
          roughness={0.04}
          metalness={0.95}
        />
      </mesh>
      {/* four frame bars */}
      <mesh position={[0, h / 2, z - cz]}>
        <boxGeometry args={[w, bar, depth]} />
        <meshStandardMaterial color={0x2a2f34} roughness={0.5} />
      </mesh>
      <mesh position={[0, -h / 2, z - cz]}>
        <boxGeometry args={[w, bar, depth]} />
        <meshStandardMaterial color={0x2a2f34} roughness={0.5} />
      </mesh>
      <mesh position={[-w / 2, 0, z - cz]}>
        <boxGeometry args={[bar, h, depth]} />
        <meshStandardMaterial color={0x2a2f34} roughness={0.5} />
      </mesh>
      <mesh position={[w / 2, 0, z - cz]}>
        <boxGeometry args={[bar, h, depth]} />
        <meshStandardMaterial color={0x2a2f34} roughness={0.5} />
      </mesh>
      {mullion && (
        <mesh position={[0, 0, z - cz]}>
          <boxGeometry args={[bar, h, depth]} />
          <meshStandardMaterial color={0x2a2f34} roughness={0.5} />
        </mesh>
      )}
      {/* projecting sill */}
      <mesh position={[0, -h / 2 - 0.06, z - cz + 0.04]}>
        <boxGeometry args={[w + 0.38, 0.1, 0.24]} />
        <meshStandardMaterial color={COL.band} roughness={0.7} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ scene -- */

type SceneProps = {
  onPhase: (label: string) => void;
  onRested?: () => void;
  loop: boolean;
  reduced: boolean;
  /** §11 mobile fallback: skip the heavy SSAO + DOF passes on small screens. */
  heavyFx: boolean;
};

function Scene({ onPhase, onRested, loop, reduced, heavyFx }: SceneProps) {
  const { camera } = useThree();

  const roofTex = useMemo(() => roofTexture(), []);
  const renderTex = useMemo(() => renderTexture(), []);
  const stoneTex = useMemo(() => stoneTexture(), []);
  const brickTex = useMemo(() => brickTexture(), []);
  const paveTex = useMemo(() => paveTexture(), []);
  const grassTex = useMemo(() => grassTexture(), []);
  const texFor = (t?: Part["tex"]) =>
    t === "roof"
      ? roofTex
      : t === "render"
        ? renderTex
        : t === "stone"
          ? stoneTex
          : t === "brick"
            ? brickTex
            : undefined;

  const geoms = useMemo(
    () =>
      PARTS.map((p) =>
        p.kind === "hip"
          ? hipR(p.size[0], p.size[1], p.size[2], p.rx ?? p.size[0] * 0.55)
          : p.kind === "gable"
            ? gable(p.size[0], p.size[1], p.size[2])
            : new THREE.BoxGeometry(p.size[0], p.size[1], p.size[2]),
      ),
    [],
  );
  const edges = useMemo(
    () => geoms.map((g) => new THREE.EdgesGeometry(g)),
    [geoms],
  );

  const groupRefs = useRef<(THREE.Group | null)[]>([]);
  const matRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const lineRefs = useRef<(THREE.LineBasicMaterial | null)[]>([]);
  const detailRef = useRef<THREE.Group>(null);
  const groundRef = useRef<THREE.MeshStandardMaterial>(null);
  const gridRef = useRef<THREE.LineBasicMaterial>(null);

  const startRef = useRef<number | null>(null);
  const phaseRef = useRef(-1);
  const restedRef = useRef(false);

  useEffect(
    () => () => {
      geoms.forEach((g) => g.dispose());
      edges.forEach((e) => e.dispose());
      [roofTex, renderTex, stoneTex, brickTex, paveTex, grassTex].forEach((t) =>
        t.dispose(),
      );
    },
    [geoms, edges, roofTex, renderTex, stoneTex, brickTex, paveTex, grassTex],
  );

  useFrame((state) => {
    // §10 render-loop guard — an uncaught throw kills rAF permanently and
    // leaves a black canvas with no explanation.
    try {
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

      const bp = clamp(t / 0.55, 0, 1);

      // ground + blueprint grid
      const g = clamp((t - 0.5) / 0.5, 0, 1);
      if (groundRef.current) groundRef.current.opacity = g;
      if (gridRef.current)
        gridRef.current.opacity =
          lerp(0.34, 0.08, clamp((t - 1.1) / 2.4, 0, 1)) * clamp(t / 0.5, 0, 1);

      // animated structural parts
      for (let i = 0; i < PARTS.length; i++) {
        const p = PARTS[i];
        const prog = clamp((t - p.start) / p.dur, 0, 1);
        const e = easeOut(prog);
        const grp = groupRefs.current[i];
        if (grp)
          grp.position.set(
            p.pos[0] + p.from[0] * (1 - e),
            p.pos[1] + p.from[1] * (1 - e),
            p.pos[2] + p.from[2] * (1 - e),
          );
        const mat = matRefs.current[i];
        if (mat) {
          mat.opacity = e;
          mat.emissiveIntensity = (1 - e) * 0.9;
        }
        const line = lineRefs.current[i];
        if (line) line.opacity = (1 - prog) * bp;
      }

      // detail + site fade in over the finishing phase
      if (detailRef.current) {
        const d = clamp((t - 2.3) / 1.2, 0, 1);
        detailRef.current.traverse((o) => {
          const m = (o as THREE.Mesh).material as
            THREE.MeshStandardMaterial | undefined;
          if (m && "opacity" in m) {
            m.transparent = d < 1;
            m.opacity = d;
          }
        });
      }

      // §8 camera: low & close → drone three-quarter pull-back
      const cp = quadSettle(clamp((t - 0.1) / (BUILD_END - 0.3), 0, 1));
      const radius = lerp(20, 35, cp);
      const height = lerp(2.4, 15, cp);
      const ang = lerp(-0.78, -0.12, cp);
      camera.position.set(
        Math.sin(ang) * radius + 1,
        height,
        Math.cos(ang) * radius + 6,
      );
      camera.lookAt(1, lerp(2.4, 3.3, cp), 0.2);

      // phase caption
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
    } catch {
      // swallow one bad frame rather than kill the loop
    }
  });

  return (
    <>
      {/* §7 lighting rig — exact values from the spec */}
      <hemisphereLight args={[0xafc6de, 0x7a6e52, 0.52]} />
      <directionalLight
        position={[-24, 13, 16]}
        intensity={1.52}
        color={0xffe9c9}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-radius={3.5}
        shadow-bias={-0.0007}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-camera-far={90}
      />
      <directionalLight
        position={[17, 9, -15]}
        intensity={0.32}
        color={0x93b4d8}
      />

      {/* §6 grass to the horizon */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
        receiveShadow
      >
        <planeGeometry args={[900, 900]} />
        <meshStandardMaterial map={grassTex} color={COL.grass} roughness={1} />
      </mesh>
      {/* §6 diagonal checkerboard paving */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[1, 0.02, 3]}
        receiveShadow
      >
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial
          ref={groundRef}
          map={paveTex}
          roughness={0.9}
          transparent
          opacity={0}
        />
      </mesh>

      {/* blueprint grid */}
      <gridHelper args={[80, 80, BLUEPRINT, 0xb6c2d2]} position={[1, 0.04, 0]}>
        <lineBasicMaterial
          ref={gridRef}
          attach="material"
          transparent
          opacity={0}
        />
      </gridHelper>

      {/* animated structural parts */}
      {PARTS.map((p, i) => (
        <group
          key={p.id}
          ref={(el) => {
            groupRefs.current[i] = el;
          }}
          rotation={[0, p.rotY ?? 0, 0]}
        >
          <mesh geometry={geoms[i]} castShadow receiveShadow>
            <meshStandardMaterial
              ref={(el) => {
                matRefs.current[i] = el;
              }}
              color={p.tex ? 0xffffff : p.color}
              map={texFor(p.tex)}
              roughness={p.tex === "roof" ? 0.74 : 0.9}
              metalness={p.tex === "roof" ? 0.04 : 0}
              side={p.double ? THREE.DoubleSide : THREE.FrontSide}
              transparent
              opacity={0}
              emissive={BLUEPRINT}
              emissiveIntensity={0}
            />
          </mesh>
          <lineSegments geometry={edges[i]}>
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

      {/* §4/§5/§6 detail + site — fades in over "Finisaje" */}
      <group ref={detailRef}>
        {/* §4 soffits (white inset under each hip — else you see through it) */}
        <mesh position={[WING_X, 3.74, 0.55]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[11.4, 8.0]} />
          <meshStandardMaterial
            color={COL.soffit}
            side={THREE.DoubleSide}
            roughness={0.9}
          />
        </mesh>
        <mesh position={[BLOCK_X, 6.54, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[9.4, 8.0]} />
          <meshStandardMaterial
            color={COL.soffit}
            side={THREE.DoubleSide}
            roughness={0.9}
          />
        </mesh>

        {/* §4 solar array on the rear slope of the block roof */}
        <mesh position={[BLOCK_X, 7.7, -1.7]} rotation={[Math.PI / 3.1, 0, 0]}>
          <planeGeometry args={[5.6, 2.6]} />
          <meshStandardMaterial
            color={0x14243a}
            roughness={0.25}
            metalness={0.6}
          />
        </mesh>

        {/* §4.1 dormers — WING roof only, at x -6.2 and -1.4 */}
        {[-6.2, -1.4].map((dx) => (
          <group key={dx} position={[dx, 4.55, 2.0]}>
            <mesh castShadow>
              <boxGeometry args={[1.7, 0.86, 1.75]} />
              <meshStandardMaterial color={COL.render} roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.68, 0]}>
              <primitive object={gable(1.04, 1.08, 0.5)} attach="geometry" />
              <meshStandardMaterial
                color={COL.roof}
                map={roofTex}
                side={THREE.DoubleSide}
                roughness={0.74}
              />
            </mesh>
            <mesh position={[0, 0, 0.9]}>
              <planeGeometry args={[0.98, 0.6]} />
              <meshStandardMaterial
                color={COL.glass}
                roughness={0.05}
                metalness={0.9}
              />
            </mesh>
          </group>
        ))}

        {/* §5.1 windows — block front elevation */}
        <Window
          cx={4.2}
          cy={2.4}
          cz={3.62}
          w={1.3}
          h={1.7}
          wallFace={3.62}
          mullion
        />
        <Window
          cx={7.5}
          cy={2.2}
          cz={5.24}
          w={1.2}
          h={1.5}
          wallFace={5.24}
          mullion
        />
        <Window
          cx={7.5}
          cy={5.0}
          cz={5.24}
          w={1.2}
          h={1.4}
          wallFace={5.24}
          mullion
        />
        <Window
          cx={4.2}
          cy={5.0}
          cz={3.62}
          w={1.3}
          h={1.4}
          wallFace={3.62}
          mullion
        />
        {/* wing front elevation */}
        <Window cx={-1.8} cy={2.4} cz={2.55} w={1.2} h={1.5} wallFace={2.55} />
        <Window cx={0.2} cy={2.4} cz={2.55} w={1.2} h={1.5} wallFace={2.55} />

        {/* §6 entrance: concrete steps + slatted dark door + wall lights */}
        <mesh position={[7.5, 0.15, 5.6]} receiveShadow>
          <boxGeometry args={[2.4, 0.3, 1.2]} />
          <meshStandardMaterial color={0xb7b4ad} roughness={0.95} />
        </mesh>
        <mesh position={[7.5, 1.35, 5.28]}>
          <boxGeometry args={[1.1, 2.3, 0.1]} />
          <meshStandardMaterial
            color={COL.dark}
            roughness={0.6}
            metalness={0.2}
          />
        </mesh>
        {[6.6, 8.4].map((lx) => (
          <mesh key={lx} position={[lx, 2.4, 5.3]}>
            <boxGeometry args={[0.14, 0.32, 0.1]} />
            <meshStandardMaterial
              color={0x2a2f34}
              emissive={0xffcf94}
              emissiveIntensity={0.6}
            />
          </mesh>
        ))}

        {/* §6 car under the carport (dark) */}
        <group position={[-6.0, 0.6, 2.4]}>
          <mesh castShadow>
            <boxGeometry args={[2.0, 0.7, 4.3]} />
            <meshStandardMaterial
              color={0x20242a}
              roughness={0.35}
              metalness={0.5}
            />
          </mesh>
          <mesh position={[0, 0.55, -0.2]}>
            <boxGeometry args={[1.8, 0.6, 2.2]} />
            <meshStandardMaterial
              color={0x20242a}
              roughness={0.35}
              metalness={0.5}
            />
          </mesh>
        </group>

        {/* §6 garage — flat-roofed block at the right boundary with a shutter */}
        <group position={[13.5, 1.4, 3.2]}>
          <mesh castShadow>
            <boxGeometry args={[4.4, 2.8, 5.2]} />
            <meshStandardMaterial
              color={COL.render}
              map={renderTex}
              roughness={0.9}
            />
          </mesh>
          <mesh position={[0, 1.45, 0]}>
            <boxGeometry args={[4.6, 0.2, 5.4]} />
            <meshStandardMaterial color={COL.fascia} roughness={0.8} />
          </mesh>
          <mesh position={[-2.24, -0.2, 0]}>
            <boxGeometry args={[0.08, 2.2, 3.0]} />
            <meshStandardMaterial
              color={0x6f7377}
              roughness={0.5}
              metalness={0.5}
            />
          </mesh>
        </group>

        {/* §6 fence — grey horizontal slat panels between rendered posts */}
        {Array.from({ length: 10 }).map((_, i) => {
          const fx = -13 + i * 3;
          return (
            <group key={`fp${i}`} position={[fx, 0.9, -6.5]}>
              <mesh castShadow>
                <boxGeometry args={[0.24, 1.8, 0.24]} />
                <meshStandardMaterial color={COL.render} roughness={0.9} />
              </mesh>
              <mesh position={[1.5, -0.1, 0]}>
                <boxGeometry args={[2.7, 1.2, 0.08]} />
                <meshStandardMaterial
                  color={COL.fence}
                  roughness={0.7}
                  metalness={0.2}
                />
              </mesh>
            </group>
          );
        })}

        {/* §6 sliding gate (vertical slats + top rail) */}
        <group position={[-11.5, 1.0, 4.5]}>
          <mesh>
            <boxGeometry args={[4.0, 0.12, 0.1]} />
            <meshStandardMaterial
              color={COL.fence}
              metalness={0.3}
              roughness={0.6}
            />
          </mesh>
          {Array.from({ length: 12 }).map((_, i) => (
            <mesh key={`gs${i}`} position={[-1.8 + i * 0.33, -0.7, 0]}>
              <boxGeometry args={[0.1, 1.5, 0.08]} />
              <meshStandardMaterial
                color={COL.fence}
                metalness={0.3}
                roughness={0.6}
              />
            </mesh>
          ))}
        </group>

        {/* §6 trees — ~40 layered sphere canopies, varied greens (NOT icosahedrons) */}
        {Array.from({ length: 40 }).map((_, i) => {
          const r = 22 + (i % 7) * 4;
          const a = (i / 40) * Math.PI * 2 + i * 0.7;
          const tx = Math.cos(a) * r + 1;
          const tz = Math.sin(a) * r - 4;
          if (Math.abs(tx - 1) < 16 && Math.abs(tz) < 12) return null; // keep the plot clear
          const s = 0.8 + ((i * 13) % 10) / 10;
          const green = [0x5c7a3a, 0x6f8a45, 0x4f6b34, 0x7c9455][i % 4];
          return (
            <group key={`tr${i}`} position={[tx, 0, tz]}>
              <mesh position={[0, 1.1 * s, 0]}>
                <cylinderGeometry args={[0.12 * s, 0.16 * s, 2.2 * s, 6]} />
                <meshStandardMaterial color={0x6b5237} roughness={1} />
              </mesh>
              <mesh position={[0, 2.6 * s, 0]}>
                <sphereGeometry args={[1.3 * s, 10, 8]} />
                <meshStandardMaterial color={green} roughness={1} />
              </mesh>
              <mesh position={[0.5 * s, 3.3 * s, 0.2 * s]}>
                <sphereGeometry args={[0.9 * s, 8, 6]} />
                <meshStandardMaterial color={green} roughness={1} />
              </mesh>
            </group>
          );
        })}

        {/* §6 hazy hills under the fog, radius ~430 */}
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i / 6) * Math.PI * 2;
          return (
            <mesh
              key={`hill${i}`}
              position={[Math.cos(a) * 430, -8, Math.sin(a) * 430]}
            >
              <sphereGeometry args={[120, 16, 8]} />
              <meshStandardMaterial color={0xb4bcc0} roughness={1} />
            </mesh>
          );
        })}
      </group>

      {/* §7 fog + §1/§11 postprocessing (SSAO + depth of field).
          Skipped when reduced-motion is on (static frame) or on small screens
          (heavyFx=false): SSAO's normal pass + DOF are the two most expensive
          passes and least visible on a phone, and the spec flags a mobile
          fallback as an open item (§11). Desktop keeps full quality. */}
      <fogExp2 attach="fog" args={[0xcbcdc9, 0.0066]} />
      {!reduced && heavyFx && (
        <EffectComposer enableNormalPass multisampling={0}>
          <SSAO
            blendFunction={BlendFunction.MULTIPLY}
            samples={16}
            radius={4}
            intensity={22}
            luminanceInfluence={0.6}
            color={new THREE.Color(0x0a0d10) as unknown as never}
          />
          <DepthOfField
            focusDistance={0.012}
            focalLength={0.04}
            bokehScale={2.2}
          />
        </EffectComposer>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ shell -- */

export type HeroBuild3DProps = {
  onRested?: () => void;
  loop?: boolean;
  className?: string;
};

export default function HeroBuild3D({
  onRested,
  loop = true,
  className,
}: HeroBuild3DProps) {
  const [phase, setPhase] = useState(PHASES[0][1]);

  // Read lazily (no synchronous setState in an effect — the project's lint gate
  // errors on that, and lazy init avoids a wrong first frame).
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [failed] = useState(() => {
    if (typeof document === "undefined") return false;
    try {
      const c = document.createElement("canvas");
      return !(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      return true;
    }
  });
  // §11 heavy postprocessing (SSAO + DOF) only on wider screens.
  const [heavyFx, setHeavyFx] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches,
  );

  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width: 1024px)");
    const onRm = () => setReduced(rm.matches);
    const onWide = () => setHeavyFx(wide.matches);
    rm.addEventListener("change", onRm);
    wide.addEventListener("change", onWide);
    return () => {
      rm.removeEventListener("change", onRm);
      wide.removeEventListener("change", onWide);
    };
  }, []);

  if (failed) {
    return (
      <div
        className={className}
        style={{ background: "#eef2f6", width: "100%", height: "100%" }}
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
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ fov: 40, near: 0.1, far: 1200, position: [10, 4, 20] }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0xdce1e3);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 0.97; // §7 — pulled down from 1.16
          // §7 vertical sky gradient as the background
          const gcv = document.createElement("canvas");
          gcv.width = 2;
          gcv.height = 256;
          const gx = gcv.getContext("2d")!;
          const grad = gx.createLinearGradient(0, 0, 0, 256);
          grad.addColorStop(0.0, "#7fa8d2");
          grad.addColorStop(0.4, "#b0c8e0");
          grad.addColorStop(0.75, "#dce1e3");
          grad.addColorStop(1.0, "#e2dbcd");
          gx.fillStyle = grad;
          gx.fillRect(0, 0, 2, 256);
          const sky = new THREE.CanvasTexture(gcv);
          sky.colorSpace = THREE.SRGBColorSpace;
          scene.background = sky;
        }}
      >
        <Scene
          onPhase={setPhase}
          onRested={onRested}
          loop={loop}
          reduced={reduced}
          heavyFx={heavyFx}
        />
      </Canvas>

      {/* phase caption — bottom-left, clear of the hero copy at every breakpoint */}
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
            background: phase === "RapidConstruct" ? BRAND : BLUEPRINT,
            boxShadow: `0 0 0 4px ${
              phase === "RapidConstruct"
                ? "rgba(224,128,57,.18)"
                : "rgba(31,79,214,.18)"
            }`,
            transition: "background .3s, box-shadow .3s",
          }}
        />
        <span>{phase}</span>
      </div>
    </div>
  );
}
