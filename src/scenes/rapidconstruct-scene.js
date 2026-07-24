/**
 * RapidConstruct — 3D house scene engine (data-driven since 2026-07-24).
 *
 * History: this file began as the byte-identical port of the owner-approved
 * "cu fronton" preview (md5 68a4fb72172b7695a0f067ec261f7c25). On
 * feature/configurator it was refactored so the house is DATA-driven:
 *   - textures + geometry vocabulary  → src/scenes/house-kit.js
 *   - the approved house, per category → src/scenes/houses/cu-fronton.js
 *   - config schema + roof materials   → src/config/configurator.ts
 * Every number of the approved house moved verbatim into those files; with no
 * config, buildScene renders the same scene the owner signed off.
 *
 * Usage (plain three.js):
 *   import { buildScene } from './rapidconstruct-scene';
 *   const api = buildScene(THREE, scene, renderer);          // approved house
 *   const api = buildScene(THREE, scene, renderer, config);  // configurator
 *   // rAF loop: api.update(elapsedSeconds)
 *   // api.BUILD_END / api.HOLD give the loop timing
 *   // api.cameraAt(t) returns {position, lookAt}
 *
 * Live reconfiguration (the configurator):
 *   api.setConfig({ roof: { type: '2ape' } })
 * rebuilds ONLY the categories the patch touches (roof / walls / fence / site
 * — model change rebuilds all four). Swapped pieces replay a compressed
 * fly-in with their blueprint ghosts, so a config change is a mini build
 * animation, never a scene reload. Untouched categories keep their meshes.
 *
 * The render loop guard, phase captions and camera path are unchanged from
 * the approved scene.
 */

import { makeTextures, createKit } from './house-kit';
import { HOUSES } from './houses';
import { DEFAULT_CONFIG, ROOF_MATERIALS_3D } from '@/config/configurator';

export { DEFAULT_CONFIG };

const CATEGORIES = ['site', 'walls', 'roof', 'fence'];

function mergeConfig(base, patch) {
  return {
    model: (patch && patch.model) || base.model,
    roof: { ...base.roof, ...(patch && patch.roof) },
    walls: { ...base.walls, ...(patch && patch.walls) },
    fence: { ...base.fence, ...(patch && patch.fence) },
  };
}

export function buildScene(THREE, scene, renderer, config) {
  const BRAND = 0xE08039, BLUE = 0x1f4fd6;
  // Colour constants — approved values. QUOIN is the warmer stone tint for
  // corner blocks only (owner: quoins too pale, 2026-07); STN stays on wall
  // bases and columns.
  const colors = {
    BRAND, BLUE,
    WHT: 0xf1eee6, STN: 0xc6bfb1, FRM: 0x14181c, GLS: 0x2f4856,
    QUOIN: 0xbcae98,
  };

  let cfg = mergeConfig(DEFAULT_CONFIG, config);

  const tex = makeTextures(THREE);

  /* ------------------------------------------------------------ sky/fog -- */
  scene.background = tex.skyT;
  scene.fog = new THREE.FogExp2(0xcbcdc9, .0066);

  /* ------------------------------------------------------------- lights -- */
  scene.add(new THREE.HemisphereLight(0xafc6de, 0x7a6e52, .52));
  const key = new THREE.DirectionalLight(0xffe9c9, 1.52);
  key.position.set(-24, 13, 16); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -34, right: 34, top: 34, bottom: -34, near: 1, far: 100 });
  key.shadow.bias = -0.0007; key.shadow.radius = 3.5;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x93b4d8, .32);
  fill.position.set(17, 9, -15); scene.add(fill);

  /* -------------------------------------------------- landscape (fixed) -- */
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400),
    new THREE.MeshStandardMaterial({ map: tex.grT, color: 0xdedbd0, roughness: 1, transparent: true, opacity: 0 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -.02; ground.receiveShadow = true; scene.add(ground);

  const hillM = new THREE.MeshStandardMaterial({ color: 0x929e88, roughness: 1, transparent: true, opacity: 0 });
  for (let i = 0; i < 7; i++) {
    const hm = new THREE.Mesh(new THREE.SphereGeometry(90 + Math.random() * 70, 12, 8), hillM);
    const ha = (i / 7) * Math.PI * 2 + .4;
    hm.position.set(Math.cos(ha) * 430, -52 - Math.random() * 22, Math.sin(ha) * 430);
    hm.scale.y = .30; scene.add(hm);
  }

  const G = new THREE.Group(), GH = new THREE.Group(), TR = new THREE.Group();
  scene.add(G); scene.add(GH); scene.add(TR);
  const Z = new THREE.Vector3(0, 0, 0);

  const trees = [];
  function tree(tx, tz, sc, dark) {
    const g = new THREE.Group();
    const tm = new THREE.MeshStandardMaterial({ color: 0x5d4c3a, roughness: 1, transparent: true, opacity: 0 });
    const tk = new THREE.Mesh(new THREE.CylinderGeometry(.13 * sc, .3 * sc, 2.6 * sc, 7), tm);
    tk.position.y = 1.3 * sc; tk.castShadow = true; g.add(tk);
    const lm = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(.245 + Math.random() * .05, .3, dark ? .17 : .25),
      roughness: 1, transparent: true, opacity: 0 });
    for (let q = 0; q < 6; q++) {
      const fq = new THREE.Mesh(new THREE.SphereGeometry((1.35 - q * .12 + Math.random() * .35) * sc, 7, 6), lm);
      fq.position.set((Math.random() - .5) * 1.5 * sc, (2.7 + Math.random() * 2.1) * sc, (Math.random() - .5) * 1.5 * sc);
      fq.scale.y = .82 + Math.random() * .3; fq.castShadow = true; g.add(fq);
    }
    g.position.set(tx, 0, tz); TR.add(g); trees.push({ tm, lm });
  }
  tree(-22, -8, 1.5, 0); tree(-27, 5, 1.2, 1); tree(20, -15, 1.6, 0); tree(26, -4, 1.3, 1);
  tree(-17, 17, 1.1, 0); tree(29, 15, 1.4, 1); tree(-33, -15, 1.35, 1); tree(36, -19, 1.5, 0);
  for (let i = 0; i < 32; i++) {
    const a = Math.random() * Math.PI * 2, rr = 70 + Math.random() * 230;
    tree(Math.cos(a) * rr, Math.sin(a) * rr, 1.6 + Math.random() * 1.4, i % 2);
  }

  /* ------------------------------------------- part registry + plumbing -- */
  // One record per animated piece: { pv, mesh, m, ln, bm, fr, s, d }.
  // Grouped by category so setConfig can dispose + rebuild one category.
  const parts = { site: [], walls: [], roof: [], fence: [] };
  let currentCat = 'site';
  let lastT = 0;

  /** Resolved roof material (textures built lazily, cached per material). */
  const roofMatCache = new Map();
  function roofMat() {
    const id = cfg.roof.material;
    if (!roofMatCache.has(id)) {
      const spec = ROOF_MATERIALS_3D[id].tex;
      const tiles = tex.roofTiles(spec);
      roofMatCache.set(id, { ...tiles, tint: spec.tint, rough: spec.rough, metal: spec.metal });
    }
    return roofMatCache.get(id);
  }

  /** NOTE: rotate BEFORE translate. Reversing this spins the piece about the world origin. */
  function add(geo, col, o) {
    if (o.rx) geo.rotateX(o.rx);
    geo.translate(o.x || 0, o.y || 0, o.z || 0);
    const mp = { color: col, roughness: o.r != null ? o.r : .86, metalness: o.m || 0, transparent: true, opacity: 0 };
    if (o.map) { mp.map = o.map; mp.color = o.tint || 0xffffff; }
    if (o.bump) { mp.bumpMap = o.bump; mp.bumpScale = o.bs || .07; }
    if (o.emi) { mp.emissive = new THREE.Color(o.emi); mp.emissiveIntensity = o.ei || 1; }
    if (o.ds) mp.side = THREE.DoubleSide;
    const mt = new THREE.MeshStandardMaterial(mp);
    const me = new THREE.Mesh(geo, mt); me.castShadow = true; me.receiveShadow = true;
    const pv = new THREE.Group(); pv.add(me); G.add(pv);
    const bm = new THREE.LineBasicMaterial({ color: BLUE, transparent: true, opacity: 0 });
    const ln = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 32), bm);
    GH.add(ln);
    const fr = new THREE.Vector3(o.fx || 0, o.fy || 0, o.fz || 0); pv.position.copy(fr);
    parts[currentCat].push({ pv, mesh: me, m: mt, ln, bm, fr, s: o.s, d: o.d });
  }

  const kit = createKit(THREE, { add, tex, colors, roofMat });

  function buildCat(cat) {
    currentCat = cat;
    const D = HOUSES[cfg.model];
    if (cat === 'site') D.site(kit);
    else if (cat === 'walls') D.walls(kit, cfg.walls);
    else if (cat === 'roof') D.roof(kit, cfg.roof);
    else if (cat === 'fence') D.fence(kit, cfg.fence);
  }

  function clearCat(cat) {
    for (const p of parts[cat]) {
      G.remove(p.pv);
      p.mesh.geometry.dispose();
      p.m.dispose(); // textures are shared/cached — never disposed here
      GH.remove(p.ln);
      p.ln.geometry.dispose();
      p.bm.dispose();
    }
    parts[cat] = [];
  }

  for (const cat of CATEGORIES) buildCat(cat);

  /**
   * Apply a config patch, rebuilding only the affected categories. The new
   * pieces replay a compressed fly-in from `lastT` (blueprint ghost included):
   * authored staggers are preserved but scaled, so a swap reads as a quick
   * build, not a 4.3 s replay. Returns the list of rebuilt categories.
   */
  const REBUILD_DELAY = .12, REBUILD_SCALE = .35;
  function setConfig(patch) {
    const next = mergeConfig(cfg, patch);
    const dirty = new Set();
    if (next.model !== cfg.model) for (const c of CATEGORIES) dirty.add(c);
    if (next.roof.type !== cfg.roof.type || next.roof.material !== cfg.roof.material) dirty.add('roof');
    if (next.walls.finish !== cfg.walls.finish) dirty.add('walls');
    if (next.fence.type !== cfg.fence.type) dirty.add('fence');
    cfg = next;
    for (const cat of dirty) {
      clearCat(cat);
      buildCat(cat);
      let minS = Infinity;
      for (const p of parts[cat]) if (p.s < minS) minS = p.s;
      for (const p of parts[cat]) p.s = lastT + REBUILD_DELAY + (p.s - minS) * REBUILD_SCALE;
    }
    return [...dirty];
  }

  /* ---------------------------------------------------------- animation -- */
  const BUILD_END = 4.3, HOLD = 2.1;
  const PHASES = [[0, 'Proiect', BLUE], [.5, 'Fundație', 0x8a94a0], [.85, 'Pereți', 0x8a94a0],
                  [1.7, 'Acoperiș', 0x8a94a0], [2.3, 'Finisaje', 0x8a94a0], [3.5, 'RapidConstruct', BRAND]];
  const eo = t => 1 - Math.pow(1 - t, 3);
  const eq = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const lp = (a, b, t) => a + (b - a) * t;

  function phaseAt(t) {
    let i = 0; for (let q = 0; q < PHASES.length; q++) if (t >= PHASES[q][0]) i = q;
    return { label: PHASES[i][1], color: PHASES[i][2] };
  }
  function cameraAt(t) {
    const c = eq(cl((t - .08) / (BUILD_END - .3), 0, 1));
    const rd = lp(20, 35, c), hy = lp(2.4, 15, c), an = -.78 + c * .66;
    return { position: [Math.sin(an) * rd, hy, Math.cos(an) * rd], lookAt: [-.5, lp(2.4, 3.3, c), .5] };
  }
  function update(t) {
    lastT = t;
    const e0 = eo(cl(t / .6, 0, 1));
    ground.material.opacity = e0; hillM.opacity = e0 * .95;
    for (const tr of trees) { tr.tm.opacity = e0; tr.lm.opacity = e0; }
    const bp = cl(t / .5, 0, 1);
    for (const cat of CATEGORIES) for (const p of parts[cat]) {
      const q = cl((t - p.s) / p.d, 0, 1), e = eo(q);
      p.pv.position.lerpVectors(p.fr, Z, e);
      p.m.opacity = e;
      p.bm.opacity = (1 - q) * .85 * bp;
    }
  }
  /** True once every piece (including rebuilt ones) has landed. */
  function isSettled() {
    for (const cat of CATEGORIES) for (const p of parts[cat]) {
      if (lastT < p.s + p.d) return false;
    }
    return true;
  }
  function applyRenderer(r) {
    r.outputEncoding = THREE.sRGBEncoding;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 0.97;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
  }
  if (renderer) applyRenderer(renderer);

  return {
    group: G, ghosts: GH, trees: TR,
    update, cameraAt, phaseAt, applyRenderer,
    BUILD_END, HOLD, PHASES,
    setConfig, isSettled, getConfig: () => cfg,
  };
}
