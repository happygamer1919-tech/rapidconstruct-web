/**
 * RapidConstruct — 3D hero scene, EXACT source
 * ---------------------------------------------------------------------------
 * This is the literal code behind the approved "cu fronton" preview.
 * It is NOT a description — porting this reproduces the model exactly.
 *
 * Usage (plain three.js):
 *   import { buildScene } from './rapidconstruct-scene';
 *   const api = buildScene(THREE, scene, renderer);
 *   // in your rAF loop:  api.update(elapsedSeconds); 
 *   // api.BUILD_END / api.HOLD give the loop timing
 *   // api.camera() returns {position:[x,y,z], lookAt:[x,y,z]} for a given t
 *
 * For React Three Fiber: call buildScene once in a useMemo, add api.group to the
 * scene, and drive api.update(t) from useFrame. Do not re-derive any values.
 *
 * Requires three r128+. Lighting/tone-mapping settings are in api.applyRenderer().
 */

export function buildScene(THREE, scene, renderer) {
  const B = THREE.BoxGeometry;
  const BRAND = 0xE08039, BLUE = 0x1f4fd6;
  // GLS 1a2a34 → 3e4f5c (LANE C): glass is now a METALLIC mirror (metalness
  // 1), where the base colour is the reflectance tint, not an albedo — the
  // near-black value read as a hole into an empty shell at drone distance.
  // This blue-grey tints the mirrored sky the way real solar-control glazing
  // does. (history: approved 2f4856 → LANE B 1a2a34 → 3e4f5c → this;
  // 3e4f5c mirrored too bright — goal is DARK reflective glazing)
  const WHT = 0xf1eee6, STN = 0xc6bfb1, FRM = 0x14181c, GLS = 0x2e3d49;
  // Quoin-only stone tint — warmer + slightly darker than STN so the corner
  // blocks read against the white stucco. STN is still used by wall bases and
  // columns, so this is a separate constant rather than a change to STN.
  // was tint STN 0xc6bfb1 (too pale), now 0xbcae98 (owner: quoins too pale, 2026-07)
  const QUOIN = 0xbcae98;

  /* ---------------------------------------------------------- textures ---- */
  const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const T = (c, rx, ry) => {
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return t;
  };

  // roof tile — dark neutral grey, trace of green, deep shadow between rows
  const tc = cv(512, 512), x = tc.getContext('2d');
  x.fillStyle = '#242827'; x.fillRect(0, 0, 512, 512);
  for (let r = 0; r < 12; r++) for (let c = 0; c < 12; c++) {
    const px = c * 42.7, py = r * 42.7, g = x.createLinearGradient(px, py, px, py + 42.7);
    g.addColorStop(0, '#060809'); g.addColorStop(.11, '#3b4241'); g.addColorStop(.36, '#2a3130');
    g.addColorStop(.64, '#1d2322'); g.addColorStop(.9, '#111514'); g.addColorStop(1, '#080a0a');
    x.fillStyle = g; x.beginPath(); x.moveTo(px, py + 42.7); x.lineTo(px, py + 11);
    x.quadraticCurveTo(px + 21.3, py - 7, px + 42.7, py + 11); x.lineTo(px + 42.7, py + 42.7);
    x.closePath(); x.fill(); x.strokeStyle = 'rgba(4,5,5,.8)'; x.lineWidth = 2; x.stroke();
  }
  const tileT = T(tc, 5, 7), tileS = T(tc, 1.4, 1.4), tileM = T(tc, 2.6, 3);

  const bc = cv(256, 256), bx = bc.getContext('2d');
  bx.fillStyle = '#000'; bx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 12; i++) {
    const gg = bx.createLinearGradient(0, i * 21.3, 0, i * 21.3 + 21.3);
    gg.addColorStop(0, '#e0e0e0'); gg.addColorStop(.5, '#4e4e4e'); gg.addColorStop(1, '#000');
    bx.fillStyle = gg; bx.fillRect(0, i * 21.3, 256, 21.3);
  }
  const bumpT = T(bc, 5, 7);

  // brick — running bond, terracotta, pale mortar
  const brc = cv(256, 256), rx2 = brc.getContext('2d');
  rx2.fillStyle = '#aaa598'; rx2.fillRect(0, 0, 256, 256);
  for (let row = 0; row < 10; row++) {
    const off = (row % 2) ? -32 : 0;
    for (let col = -1; col < 5; col++) {
      rx2.fillStyle = `rgb(${(146 + Math.random() * 30) | 0},${(80 + Math.random() * 20) | 0},${(62 + Math.random() * 16) | 0})`;
      rx2.fillRect(col * 64 + off + 3, row * 25.6 + 3, 58, 19.6);
    }
  }
  const brickT = T(brc, 2, 2);

  // timber — vertical boards, warm
  const wdc = cv(256, 256), wq = wdc.getContext('2d');
  wq.fillStyle = '#8a6134'; wq.fillRect(0, 0, 256, 256);
  for (let wi = 0; wi < 10; wi++) {
    const sw = 25.6, sxp = wi * sw, base = 118 + Math.random() * 36;
    wq.fillStyle = `rgb(${(base + 42) | 0},${(base - 4) | 0},${(base - 52) | 0})`;
    wq.fillRect(sxp, 0, sw - 2, 256);
    for (let k = 0; k < 40; k++) {
      wq.fillStyle = `rgba(72,44,20,${.05 + Math.random() * .14})`;
      wq.fillRect(sxp, Math.random() * 256, sw - 2, 4 + Math.random() * 14);
    }
    wq.fillStyle = 'rgba(40,24,10,.5)'; wq.fillRect(sxp + sw - 2, 0, 2, 256);
  }
  const woodT = T(wdc, 1.4, .5);

  // render/stucco — warm off-white noise with base grime
  const s2 = cv(256, 256), sx = s2.getContext('2d');
  sx.fillStyle = '#eeebe3'; sx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 12000; i++) {
    const v = 218 + Math.random() * 24;
    sx.fillStyle = `rgba(${v | 0},${(v - 2) | 0},${(v - 10) | 0},.5)`;
    sx.fillRect(Math.random() * 256, Math.random() * 256, 1.6, 1.6);
  }
  const sgd = sx.createLinearGradient(0, 208, 0, 256);
  sgd.addColorStop(0, 'rgba(150,145,135,0)'); sgd.addColorStop(1, 'rgba(138,132,120,.26)');
  sx.fillStyle = sgd; sx.fillRect(0, 208, 256, 48);
  const stT = T(s2, 2, 2);

  // stone — large staggered courses, veining, per-block gradient
  const stoneC = (() => {
    const n = cv(512, 512), q = n.getContext('2d');
    q.fillStyle = '#8d8479'; q.fillRect(0, 0, 512, 512);
    for (let rw = 0; rw < 9; rw++) {
      const off2 = (rw % 2) ? -58 : 0;
      for (let cl = -1; cl < 5; cl++) {
        const xx = cl * 116 + off2 + 3, yy = rw * 56.8 + 3, t2 = 152 + Math.random() * 30;
        q.fillStyle = `rgb(${t2 | 0},${(t2 - 9) | 0},${(t2 - 24) | 0})`;
        q.fillRect(xx, yy, 110, 50);
        for (let vn = 0; vn < 11; vn++) {
          q.strokeStyle = `rgba(108,97,82,${.05 + Math.random() * .12})`;
          q.lineWidth = .7 + Math.random() * 1.4; q.beginPath();
          q.moveTo(xx + Math.random() * 110, yy);
          q.bezierCurveTo(xx + Math.random() * 110, yy + 16, xx + Math.random() * 110, yy + 34, xx + Math.random() * 110, yy + 50);
          q.stroke();
        }
        const sh = q.createLinearGradient(xx, yy, xx, yy + 50);
        sh.addColorStop(0, 'rgba(255,252,244,.12)'); sh.addColorStop(1, 'rgba(64,56,46,.13)');
        q.fillStyle = sh; q.fillRect(xx, yy, 110, 50);
        q.strokeStyle = 'rgba(100,90,76,.5)'; q.lineWidth = 2.2; q.strokeRect(xx, yy, 110, 50);
      }
    }
    return n;
  })();
  const stoneLowT = T(stoneC, 3.4, .55), stoneQT = T(stoneC, .34, .3), stoneColT = T(stoneC, .4, .7);

  // paving — checkerboard, ROTATED 45°
  const pc = cv(512, 512), px2 = pc.getContext('2d');
  for (let a = 0; a < 16; a++) for (let b = 0; b < 16; b++) {
    const vv = ((a + b) % 2) ? 164 + Math.random() * 13 : 205 + Math.random() * 13;
    px2.fillStyle = `rgb(${vv | 0},${(vv + 2) | 0},${(vv + 4) | 0})`;
    px2.fillRect(a * 32, b * 32, 32, 32);
    px2.strokeStyle = 'rgba(120,126,131,.55)'; px2.strokeRect(a * 32 + .5, b * 32 + .5, 31, 31);
  }
  const pvT = T(pc, 7, 7); pvT.center.set(.5, .5); pvT.rotation = Math.PI / 4;

  const gvc = cv(256, 256), gv = gvc.getContext('2d');
  gv.fillStyle = '#b2aa9c'; gv.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 9000; i++) {
    const t4 = 152 + Math.random() * 68;
    gv.fillStyle = `rgba(${t4 | 0},${(t4 - 7) | 0},${(t4 - 22) | 0},.85)`;
    gv.beginPath(); gv.arc(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 2.4, 0, 7); gv.fill();
  }
  const gravT = T(gvc, 10, 8);

  // grey painted band with white reveal line + shadow line
  const nc = cv(256, 512), nx = nc.getContext('2d');
  const pg = nx.createLinearGradient(0, 0, 256, 0);
  pg.addColorStop(0, '#4e565d'); pg.addColorStop(.5, '#5b636a'); pg.addColorStop(1, '#4a5259');
  nx.fillStyle = pg; nx.fillRect(0, 0, 256, 512);
  for (let y = 32; y < 512; y += 44) {
    nx.strokeStyle = 'rgba(242,241,236,.94)'; nx.lineWidth = 3.4;
    nx.beginPath(); nx.moveTo(0, y); nx.lineTo(256, y); nx.stroke();
    nx.strokeStyle = 'rgba(26,30,34,.42)'; nx.lineWidth = 2;
    nx.beginPath(); nx.moveTo(0, y + 3.8); nx.lineTo(256, y + 3.8); nx.stroke();
  }
  const pnT = new THREE.CanvasTexture(nc);

  const fc = cv(128, 256), fx = fc.getContext('2d');
  fx.fillStyle = '#78808a'; fx.fillRect(0, 0, 128, 256);
  fx.strokeStyle = 'rgba(48,54,60,.85)'; fx.lineWidth = 3.4;
  for (let y = 9; y < 256; y += 19) { fx.beginPath(); fx.moveTo(0, y); fx.lineTo(128, y); fx.stroke(); }
  const fnT = T(fc, 1, 1);

  const gtc = cv(256, 128), gt = gtc.getContext('2d');
  gt.fillStyle = '#6f7780'; gt.fillRect(0, 0, 256, 128);
  for (let vx = 0; vx < 256; vx += 16) {
    gt.fillStyle = 'rgba(96,104,112,.9)'; gt.fillRect(vx, 0, 11, 128);
    gt.fillStyle = 'rgba(38,44,50,.8)'; gt.fillRect(vx + 11, 0, 5, 128);
  }
  const gateT = T(gtc, 1, 1);

  const slc = cv(256, 256), lx = slc.getContext('2d');
  lx.fillStyle = '#131e30'; lx.fillRect(0, 0, 256, 256);
  lx.strokeStyle = 'rgba(150,168,192,.5)'; lx.lineWidth = 2;
  for (let i = 0; i <= 8; i++) {
    lx.beginPath(); lx.moveTo(i * 32, 0); lx.lineTo(i * 32, 256); lx.stroke();
    lx.beginPath(); lx.moveTo(0, i * 32); lx.lineTo(256, i * 32); lx.stroke();
  }
  const solT = T(slc, 4, 2);

  const grc = cv(256, 256), gx = grc.getContext('2d');
  gx.fillStyle = '#71873f'; gx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 12000; i++) {
    gx.fillStyle = `hsl(${64 + Math.random() * 38},34%,${23 + Math.random() * 24}%)`;
    gx.fillRect(Math.random() * 256, Math.random() * 256, 2.6, 2.6);
  }
  const grT = T(grc, 30, 30);

  /* ------------------------------------------------------------- sky/fog -- */
  // LANE A step 3 — depth + sky. Cooler, deeper blue at the zenith falling to
  // a warm golden band at the horizon (late-afternoon read), and denser,
  // warm-tinted fog. Density is tuned to the settled camera: the house
  // (~35 m) stays crisp, mid-ground trees (70–300 m) haze progressively, the
  // horizon hills melt into the sky's warm band — that separation is what
  // makes the flat lawn read as distance instead of a green wall.
  // was: stops 7fa8d2/.38 b0c8e0/.72 dce1e3/1 e2dbcd · FogExp2 cbcdc9 .0066
  //
  // LANE A step 5 — the gradient lives on a sky DOME (BackSide sphere) instead
  // of scene.background, with soft procedural cloud banks painted into the
  // band above the horizon. update() rotates the dome imperceptibly, so the
  // sky is the one element that never freezes. fog:false keeps it crisp;
  // depth-wise the dome only wins beyond the ground's edge, which reads as
  // the horizon melting into the warm band.
  // The gradient stays on scene.background (SCREEN-mapped — that is the only
  // way the blue zenith is visible at all: the settled camera pitches ~19°
  // down with a 40° lens, so the top ray clears the horizon by barely ~1°; a
  // world-mapped dome gradient shows nothing but its horizon band, verified
  // empirically). The dome carries ONLY the clouds, on a transparent canvas,
  // painted into the few degrees around the horizon the camera can actually
  // see (v = .5 + ε/180 ⇒ canvas rows ~232–258 of 512), and rotates slowly.
  const kc = cv(4, 256), kx = kc.getContext('2d');
  const sg = kx.createLinearGradient(0, 0, 0, 256);
  sg.addColorStop(0, '#6d9bc8'); sg.addColorStop(.38, '#a9c4de');
  sg.addColorStop(.72, '#e0e0d6'); sg.addColorStop(1, '#eddcba');
  kx.fillStyle = sg; kx.fillRect(0, 0, 4, 256);
  scene.background = new THREE.CanvasTexture(kc);
  // Back to .0095 (LANE B revert): the .0082 compensation existed only for
  // the composer's linear-space blending, which is gone with the composer.
  scene.fog = new THREE.FogExp2(0xd6cfba, .0095);

  const domeC = cv(1024, 512), dx2 = domeC.getContext('2d');
  for (let i = 0; i < 30; i++) {
    // one cloud bank: overlapping soft ellipses, flat-bottomed, low band
    const bx3 = Math.random() * 1024, by3 = 233 + Math.random() * 18;
    const bw3 = 70 + Math.random() * 140, bh3 = 4 + Math.random() * 6;
    for (let p = 0; p < 7; p++) {
      const g2 = dx2.createRadialGradient(0, 0, 0, 0, 0, 1);
      g2.addColorStop(0, `rgba(255,250,242,${.22 + Math.random() * .16})`);
      g2.addColorStop(1, 'rgba(255,250,242,0)');
      dx2.save();
      dx2.translate((bx3 + (Math.random() - .5) * bw3) % 1024, by3 + (Math.random() - .4) * bh3);
      dx2.scale(bw3 * (.35 + Math.random() * .4), bh3 * (.5 + Math.random() * .5));
      dx2.fillStyle = g2;
      dx2.beginPath(); dx2.arc(0, 0, 1, 0, 7); dx2.fill();
      dx2.restore();
    }
  }
  const domeT = new THREE.CanvasTexture(domeC);
  domeT.wrapS = THREE.RepeatWrapping;
  const dome = new THREE.Mesh(new THREE.SphereGeometry(880, 32, 16),
    new THREE.MeshBasicMaterial({ map: domeT, transparent: true, side: THREE.BackSide, fog: false, depthWrite: false }));
  dome.renderOrder = -1; scene.add(dome);

  /* -------------------------------------------------------------- lights -- */
  // LANE A step 4 — warm key vs cool sky fill. Sky half of the hemisphere
  // cooled, ground bounce warmed (sunlit lawn/paving reflects warm), key
  // pushed golden. Shadow map type is deliberately untouched (applyRenderer).
  // was: hemi afc6de/7a6e52 .52 · key ffe9c9 1.52
  scene.add(new THREE.HemisphereLight(0xa3c1e6, 0x8b7a56, .55));
  const key = new THREE.DirectionalLight(0xffd9a3, 1.6);
  key.position.set(-24, 13, 16); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -34, right: 34, top: 34, bottom: -34, near: 1, far: 100 });
  key.shadow.bias = -0.0007; key.shadow.radius = 3.5;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x93b4d8, .28); // was .32 — cooler frame overall
  fill.position.set(17, 9, -15); scene.add(fill);

  // LANE B step 2 — procedural environment map, assigned per-material to
  // glass and metals ONLY (via material.envMap in add()). First attempt used
  // scene.environment: it feeds EVERY standard material — lawn, trees,
  // plaster — which filled the step-1 contact shadows and washed the whole
  // frame flat. Targeted assignment keeps LANE A's light untouched while
  // giving low-roughness surfaces something to mirror — without it glass
  // reads as dark paint.
  let envPMREM = null;
  if (renderer) {
    const ec = cv(256, 128), ex = ec.getContext('2d');
    const eg = ex.createLinearGradient(0, 0, 0, 128);
    eg.addColorStop(0, '#86b0d8'); eg.addColorStop(.45, '#cfdce4');
    eg.addColorStop(.52, '#eddcba'); eg.addColorStop(.56, '#8f8a74');
    eg.addColorStop(1, '#5f5c4c');
    ex.fillStyle = eg; ex.fillRect(0, 0, 256, 128);
    const sunU = 232, sunV = 34; // roughly the key light's direction
    const sun = ex.createRadialGradient(sunU, sunV, 0, sunU, sunV, 26);
    sun.addColorStop(0, 'rgba(255,236,200,.95)');
    sun.addColorStop(.25, 'rgba(255,226,180,.4)');
    sun.addColorStop(1, 'rgba(255,226,180,0)');
    ex.fillStyle = sun; ex.beginPath(); ex.arc(sunU, sunV, 26, 0, 7); ex.fill();
    const envT = new THREE.CanvasTexture(ec);
    envT.mapping = THREE.EquirectangularReflectionMapping;
    const pm = new THREE.PMREMGenerator(renderer);
    envPMREM = pm.fromEquirectangular(envT).texture;
    pm.dispose(); envT.dispose();
  }
  // Sun drift during the hold (step 4): the key swings ±~3° azimuth and
  // breathes in elevation, so shadows creep imperceptibly instead of being
  // stamped. Base position preserved exactly at h=0.
  const KEY_R = Math.hypot(-24, 16), KEY_AZ = Math.atan2(16, -24);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400),
    new THREE.MeshStandardMaterial({ map: grT, color: 0xdedbd0, roughness: 1, transparent: true, opacity: 0 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -.02; ground.receiveShadow = true; scene.add(ground);

  /* ---------------------------------------- grounding (LANE A, step 1) ---- */
  // The house read as floating: walls and fence met uniformly-bright paving
  // with zero contact occlusion. Cheap procedural AO: radial-gradient planes
  // under each building mass and along the fence line (fake contact shadow),
  // plus an inverse vignette that darkens the lawn away from the site so the
  // frame's brightness centres on the house. All fade in with the ground (e0).
  const radialT = (stops) => {
    const c = cv(256, 256), q = c.getContext('2d');
    const g = q.createRadialGradient(128, 128, 0, 128, 128, 128);
    for (const [p, col] of stops) g.addColorStop(p, col);
    q.fillStyle = g; q.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  };
  const contactT = radialT([[0, 'rgba(7,8,9,.78)'], [.45, 'rgba(7,8,9,.44)'], [1, 'rgba(7,8,9,0)']]);
  const vignetteT = radialT([[0, 'rgba(24,23,18,0)'], [.42, 'rgba(24,23,18,0)'], [1, 'rgba(24,23,18,.6)']]);
  // Slab-rim shadow: dark right at the paving edge, fading OUTWARD onto the
  // lawn (a ring under the slab would be hidden by it). The plane is the slab
  // plus a 4.2 m border, so the inner rect must sit at a different pixel inset
  // per axis. Stacked strokes fake the blur (ctx.filter is not universal).
  const rimT = (() => {
    const c = cv(512, 512), q = c.getContext('2d');
    const ix = 63, iz = 85, N = 22; // slab edge in texture px (x / z axis)
    for (let i = 0; i < N; i++) {
      const f = i / N; // 0 at slab edge → 1 at plane (lawn) edge
      q.strokeStyle = `rgba(7,8,9,${.13 * (1 - f) * (1 - f)})`;
      q.lineWidth = 7;
      const ox = ix * (1 - f), oz = iz * (1 - f);
      q.strokeRect(ox, oz, 512 - ox * 2, 512 - oz * 2);
    }
    return new THREE.CanvasTexture(c);
  })();
  const groundFx = [];
  function groundPlane(map, cx2, cz2, sx2, sz2, y2, op2, order) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map, transparent: true, opacity: 0, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(cx2, y2, cz2); m.scale.set(sx2, sz2, 1);
    m.renderOrder = order; scene.add(m); groundFx.push({ m, op: op2 });
  }
  groundPlane(vignetteT, 0, 2, 190, 150, .012, 1, 1);
  groundPlane(rimT, -1.5, 1.5, 34.4, 25.4, .018, 1, 2);      // paving perimeter
  groundPlane(contactT, -3.7, -.1, 15.4, 9.4, .455, 1, 2);   // wing + carport
  groundPlane(contactT, 5.9, .7, 12.8, 10.2, .455, 1, 2);    // block + bay
  groundPlane(contactT, .2, 9.4, 32, 3.4, .285, .85, 2);     // fence line (front)
  groundPlane(contactT, -13.3, .5, 3.2, 20, .285, .7, 2);    // fence line (left)
  groundPlane(contactT, 15.5, .5, 3.2, 20, .285, .7, 2);     // fence line (right)
  groundPlane(contactT, 1.1, -8, 32, 3.2, .285, .7, 2);      // fence line (back)
  groundPlane(contactT, -7.6, 1.4, 5, 6.8, .46, .7, 2);      // car

  const hillM = new THREE.MeshStandardMaterial({ color: 0x929e88, roughness: 1, transparent: true, opacity: 0 });
  for (let i = 0; i < 7; i++) {
    const hm = new THREE.Mesh(new THREE.SphereGeometry(90 + Math.random() * 70, 12, 8), hillM);
    const ha = (i / 7) * Math.PI * 2 + .4;
    hm.position.set(Math.cos(ha) * 430, -52 - Math.random() * 22, Math.sin(ha) * 430);
    hm.scale.y = .30; scene.add(hm);
  }

  const G = new THREE.Group(), GH = new THREE.Group(), TR = new THREE.Group();
  scene.add(G); scene.add(GH); scene.add(TR);
  const P = [], Z = new THREE.Vector3(0, 0, 0);

  /* ------------------------------------------------------- geometry utils -- */
  function hipR(hx, hz, h, rx) {
    const v = [-hx,0,hz, hx,0,hz, hx,0,-hz, -hx,0,-hz, -rx,h,0, rx,h,0];
    const f = [0,1,5, 0,5,4, 2,3,4, 2,4,5, 1,2,5, 3,0,4];
    const g = new THREE.BufferGeometry(), pos = [];
    for (const i of f) pos.push(v[i*3], v[i*3+1], v[i*3+2]);
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const uv = []; for (let k = 0; k < f.length; k++) uv.push((pos[k*3]+hx)/(2*hx), (pos[k*3+2]+hz)/(2*hz));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.computeVertexNormals(); return g;
  }
  function gable(hx, hz, h) {
    const v = [-hx,0,hz, hx,0,hz, hx,0,-hz, -hx,0,-hz, 0,h,hz, 0,h,-hz];
    const f = [3,0,4, 3,4,5, 1,2,5, 1,5,4, 0,1,4, 2,3,5];
    const g = new THREE.BufferGeometry(), pos = [];
    for (const i of f) pos.push(v[i*3], v[i*3+1], v[i*3+2]);
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const uv = []; for (let k = 0; k < f.length; k++) uv.push((pos[k*3]+hx)/(2*hx), (pos[k*3+2]+hz)/(2*hz));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.computeVertexNormals(); return g;
  }

  /**
   * LANE B step 4 — subtle tone/roughness variation on plaster + stone so big
   * white surfaces don't read as flat plastic. World-space value noise
   * injected via onBeforeCompile (shader-driven, NOT a texture map): ±5%
   * tint at two octaves, ±.06 roughness. One function instance → one shader
   * program cache entry for every patched material.
   */
  const toneNoise = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWp;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWp = (modelMatrix * vec4(transformed, 1.)).xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
varying vec3 vWp;
float vnHash(float n) { return fract(sin(n) * 43758.5453); }
float vNoise(vec3 p) {
  vec3 i = floor(p), f = fract(p);
  f = f * f * (3. - 2. * f);
  float n = dot(i, vec3(1., 57., 113.));
  return mix(
    mix(mix(vnHash(n), vnHash(n + 1.), f.x), mix(vnHash(n + 57.), vnHash(n + 58.), f.x), f.y),
    mix(mix(vnHash(n + 113.), vnHash(n + 114.), f.x), mix(vnHash(n + 170.), vnHash(n + 171.), f.x), f.y),
    f.z);
}`)
      .replace('#include <color_fragment>', `#include <color_fragment>
{
  float tn = (vNoise(vWp * .55) * .7 + vNoise(vWp * 2.3 + 7.) * .3) - .5;
  diffuseColor.rgb *= (1. + tn * .10);
}`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
{
  float rn = vNoise(vWp * 1.7 + 3.) - .5;
  roughnessFactor = clamp(roughnessFactor + rn * .12, .05, 1.);
}`);
  };

  /** NOTE: rotate BEFORE translate. Reversing this spins the piece about the world origin. */
  function add(geo, col, o) {
    if (o.rx) geo.rotateX(o.rx);
    geo.translate(o.x || 0, o.y || 0, o.z || 0);
    const mp = { color: col, roughness: o.r != null ? o.r : .86, metalness: o.m || 0, transparent: true, opacity: 0 };
    if (o.map) { mp.map = o.map; mp.color = o.tint || 0xffffff; }
    if (o.bump) { mp.bumpMap = o.bump; mp.bumpScale = o.bs || .07; }
    if (o.emi) { mp.emissive = new THREE.Color(o.emi); mp.emissiveIntensity = o.ei || 1; }
    if (o.ds) mp.side = THREE.DoubleSide;
    // env reception (LANE B step 2): ONLY metals (m ≥ .3) and glass get the
    // envMap — everything else keeps LANE A's lighting untouched. Intensity
    // scales with metalness: a flat 1.0 turned the m=.3 fence louvres into
    // sky mirrors (washed white); proportional keeps them grey with a sheen
    // while true metal reflects properly.
    if (envPMREM && !o.glass && (o.m || 0) >= .3) {
      mp.envMap = envPMREM; mp.envMapIntensity = .9 * o.m;
    }
    // LANE C glass — a dark tinted MIRROR, not a pane. The LANE B physical
    // dielectric (metalness 0, clearcoat fresnel) only reflected at grazing
    // angles, so camera-facing windows read as see-through holes over the
    // wall backface. Metalness 1 makes the base colour the reflectance tint:
    // the window mirrors the env sky at EVERY angle, exactly how
    // solar-control glazing reads at drone distance. No interiors needed.
    // Per-piece material (not shared) because the build animation fades each
    // piece's opacity individually; opacity ends at 1 — fully opaque.
    const mt = o.glass
      ? new THREE.MeshStandardMaterial({
          color: col, roughness: .07, metalness: 1,
          envMap: envPMREM || undefined, envMapIntensity: 1.8,
          transparent: true, opacity: 0,
        })
      : new THREE.MeshStandardMaterial(mp);
    // Plaster + stone get the tone-noise patch (step 4). Map identity is the
    // selector so no call site changes.
    if (o.map === stT || o.map === stoneLowT || o.map === stoneQT || o.map === stoneColT) {
      mt.onBeforeCompile = toneNoise;
    }
    const me = new THREE.Mesh(geo, mt); me.castShadow = true; me.receiveShadow = true;
    const pv = new THREE.Group(); pv.add(me); G.add(pv);
    const bm = new THREE.LineBasicMaterial({ color: BLUE, transparent: true, opacity: 0 });
    GH.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 32), bm));
    const fr = new THREE.Vector3(o.fx || 0, o.fy || 0, o.fz || 0); pv.position.copy(fr);
    P.push({ pv, m: mt, bm, fr, s: o.s, d: o.d });
  }

  function quoin(cx, cz, baseY, h, st) {
    const n = Math.max(6, Math.round(h / .44)), bh = h / n;
    for (let i = 0; i < n; i++) {
      const wide = (i % 2 === 0), w = wide ? .6 : .38, d = wide ? .38 : .6;
      add(new B(w, bh * .9, d), 0xffffff, { x: cx, y: baseY + bh * (i + .5), z: cz, fy: -4, s: st + i * .014, d: .24, map: stoneQT, r: .86, tint: QUOIN });
    }
  }
  function eave(cx, cy, cz, hx, hz, st, dd) {
    add(new B(2*hx+.1, .3, 2*hz+.1), 0x131719, { x: cx, y: cy, z: cz, fy: 10, s: st, d: dd, r: .62, m: .12 });
    add(new B(2*hx-.12, .2, 2*hz-.12), 0xffffff, { x: cx, y: cy+.07, z: cz, fy: 10, s: st+.02, d: dd, map: stT, r: .95, tint: 0xf7f5ef });
  }
  function cap(ax, ay, az, bx2, by, bz, rad, st, dd) {
    const A = new THREE.Vector3(ax, ay, az), Bv = new THREE.Vector3(bx2, by, bz);
    const dir = new THREE.Vector3().subVectors(Bv, A), len = dir.length();
    if (len < .01) return;
    const g = new THREE.CylinderGeometry(rad, rad, len, 8);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(q)); // NOT applyQuaternion
    const mid = new THREE.Vector3().addVectors(A, Bv).multiplyScalar(.5);
    add(g, 0x151a1c, { x: mid.x, y: mid.y, z: mid.z, fy: 10, s: st, d: dd, r: .6, m: .12 });
  }
  function chimney(cx, cz, topY, w, hgt, st) {
    add(new B(w, hgt, w), 0xffffff, { x: cx, y: topY-hgt/2, z: cz, fy: 7, s: st, d: .3, map: brickT, r: .96, tint: 0xd4cbc0 });
    add(new B(w+.1, .09, w+.1), 0xd4d0c6, { x: cx, y: topY+.045, z: cz, fy: 7, s: st+.05, d: .24, r: .9 });
    const pp = w * .34;
    add(new B(.06,.28,.06), 0x1c2225, { x: cx-pp, y: topY+.23, z: cz-pp, fy: 7, s: st+.09, d: .2, r: .5, m: .4 });
    add(new B(.06,.28,.06), 0x1c2225, { x: cx+pp, y: topY+.23, z: cz+pp, fy: 7, s: st+.1, d: .2, r: .5, m: .4 });
    add(new B(w+.28,.08,w+.28), 0x1c2225, { x: cx, y: topY+.4, z: cz, fy: 7, s: st+.14, d: .22, r: .5, m: .45 });
  }

  /** CRITICAL: the frame is a RING of four bars. A solid box hides the glass. */
  function winZ(wx, wy, wz, w, h, st, mull) {
    // Glass recessed .1 → .16 behind the wall plane, with real reveal jambs
    // lining the opening (LANE B step 1): left/right neutral, head shadowed
    // (fake AO), inner sill light. The opening reads as depth, not a decal.
    const gz = wz - .16, fz2 = wz - .02;
    add(new B(w, h, .05), GLS, { x: wx, y: wy, z: gz, fz: 1.6, s: st, d: .22, glass: 1 });
    add(new B(.07, h, .15), 0xb7b2a6, { x: wx - w/2 + .035, y: wy, z: wz - .095, fz: 1.6, s: st + .01, d: .2, r: .92 });
    add(new B(.07, h, .15), 0xb7b2a6, { x: wx + w/2 - .035, y: wy, z: wz - .095, fz: 1.6, s: st + .01, d: .2, r: .92 });
    add(new B(w, .07, .15), 0x827e74, { x: wx, y: wy + h/2 - .035, z: wz - .095, fz: 1.6, s: st + .01, d: .2, r: .92 });
    add(new B(w, .06, .15), 0xd8d4ca, { x: wx, y: wy - h/2 + .03, z: wz - .095, fz: 1.6, s: st + .01, d: .2, r: .9 });
    // Frame bars thickened: face .09->.13, depth .15->.19, offset .045->.065 (=bar/2),
    // top/bottom span w+.17->w+.26 (=w+2*bar) to keep the corners closed. Bars still
    // sit OUTSIDE the glass rect — inner edge stays on the glass edge, never over it.
    // (owner: frames too thin, 2026-07)
    add(new B(w+.26, .13, .19), FRM, { x: wx, y: wy+h/2+.065, z: fz2, fz: 1.6, s: st+.02, d: .2, r: .32, m: .5 });
    add(new B(w+.26, .13, .19), FRM, { x: wx, y: wy-h/2-.065, z: fz2, fz: 1.6, s: st+.02, d: .2, r: .32, m: .5 });
    add(new B(.13, h, .19), FRM, { x: wx-w/2-.065, y: wy, z: fz2, fz: 1.6, s: st+.02, d: .2, r: .32, m: .5 });
    add(new B(.13, h, .19), FRM, { x: wx+w/2+.065, y: wy, z: fz2, fz: 1.6, s: st+.02, d: .2, r: .32, m: .5 });
    if (mull) add(new B(.085, h, .17), FRM, { x: wx, y: wy, z: fz2-.01, fz: 1.6, s: st+.03, d: .2, r: .32, m: .5 });
    add(new B(w+.38, .1, .28), 0xe6e2da, { x: wx, y: wy-h/2-.14, z: wz-.02, fz: 1.6, s: st+.04, d: .2, r: .9 });
  }
  function winX(wx, wy, wz, d, h, st, mull) {
    // Mirror of winZ's recess + reveal (LANE B step 1) along the ±x normal.
    const s = (wx > 0) ? 1 : -1, gx2 = wx - s*.16, fxb = wx - s*.02;
    add(new B(.05, h, d), GLS, { x: gx2, y: wy, z: wz, fx: 1.6*s, s: st, d: .22, glass: 1 });
    add(new B(.15, h, .07), 0xb7b2a6, { x: wx - s*.095, y: wy, z: wz - d/2 + .035, fx: 1.6*s, s: st + .01, d: .2, r: .92 });
    add(new B(.15, h, .07), 0xb7b2a6, { x: wx - s*.095, y: wy, z: wz + d/2 - .035, fx: 1.6*s, s: st + .01, d: .2, r: .92 });
    add(new B(.15, .07, d), 0x827e74, { x: wx - s*.095, y: wy + h/2 - .035, z: wz, fx: 1.6*s, s: st + .01, d: .2, r: .92 });
    add(new B(.15, .06, d), 0xd8d4ca, { x: wx - s*.095, y: wy - h/2 + .03, z: wz, fx: 1.6*s, s: st + .01, d: .2, r: .9 });
    // Frame bars thickened to match winZ: face .09->.13, depth .15->.19, offset
    // .045->.065 (=bar/2), top/bottom z-span d+.17->d+.26 to keep corners closed.
    // Bars still frame the glass rect, never overlap its face. (owner: frames too thin, 2026-07)
    add(new B(.19, .13, d+.26), FRM, { x: fxb, y: wy+h/2+.065, z: wz, fx: 1.6*s, s: st+.02, d: .2, r: .32, m: .5 });
    add(new B(.19, .13, d+.26), FRM, { x: fxb, y: wy-h/2-.065, z: wz, fx: 1.6*s, s: st+.02, d: .2, r: .32, m: .5 });
    add(new B(.19, h, .13), FRM, { x: fxb, y: wy, z: wz-d/2-.065, fx: 1.6*s, s: st+.02, d: .2, r: .32, m: .5 });
    add(new B(.19, h, .13), FRM, { x: fxb, y: wy, z: wz+d/2+.065, fx: 1.6*s, s: st+.02, d: .2, r: .32, m: .5 });
    if (mull) add(new B(.17, h, .085), FRM, { x: fxb-s*.01, y: wy, z: wz, fx: 1.6*s, s: st+.03, d: .2, r: .32, m: .5 });
    add(new B(.28, .1, d+.38), 0xe6e2da, { x: wx-s*.02, y: wy-h/2-.14, z: wz, fx: 1.6*s, s: st+.04, d: .2, r: .9 });
  }
  function dormer(cx, roofBase, roofCz, hz, h, f, st) {
    const y = roofBase + h*f, z = roofCz + hz*(1-f);
    const w = 1.7, dp = 1.75, bh = .86;
    add(new B(w, bh, dp), 0xffffff, { x: cx, y: y+bh/2-.24, z, fy: 6, s: st, d: .34, map: stT, r: .93, tint: WHT });
    add(gable(w/2+.19, dp/2+.2, .5), 0xffffff, { x: cx, y: y+bh-.24, z, fy: 6, s: st+.05, d: .34, map: tileS, bump: bumpT, bs: .07, r: .74, m: .04, tint: 0x757b78, ds: 1 });
    add(new B(.13, .36, dp+.44), FRM, { x: cx, y: y+bh-.06, z, fy: 6, s: st+.09, d: .28, r: .6, m: .14 });
    add(new B(w+.4, .11, .15), FRM, { x: cx, y: y+bh-.29, z: z+dp/2+.22, fy: 6, s: st+.11, d: .26, r: .6, m: .14 });
    add(new B(w+.28, .09, .46), 0xffffff, { x: cx, y: y+bh-.2, z: z+dp/2+.39, fy: 6, s: st+.13, d: .26, map: woodT, r: .85, tint: 0xd8b98a });
    winZ(cx, y+bh/2-.26, z+dp/2+.03, .98, .6, st+.15, 0);
  }

  const trees = [];
  function tree(tx, tz, sc, dark) {
    const g = new THREE.Group();
    const tm = new THREE.MeshStandardMaterial({ color: 0x5d4c3a, roughness: 1, transparent: true, opacity: 0 });
    const tk = new THREE.Mesh(new THREE.CylinderGeometry(.13*sc, .3*sc, 2.6*sc, 7), tm);
    tk.position.y = 1.3*sc; tk.castShadow = true; g.add(tk);
    const lm = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(.245 + Math.random()*.05, .3, dark ? .17 : .25),
      roughness: 1, transparent: true, opacity: 0 });
    for (let q = 0; q < 6; q++) {
      const fq = new THREE.Mesh(new THREE.SphereGeometry((1.35 - q*.12 + Math.random()*.35)*sc, 7, 6), lm);
      fq.position.set((Math.random()-.5)*1.5*sc, (2.7 + Math.random()*2.1)*sc, (Math.random()-.5)*1.5*sc);
      fq.scale.y = .82 + Math.random()*.3; fq.castShadow = true; g.add(fq);
    }
    g.position.set(tx, 0, tz); TR.add(g); trees.push({ tm, lm });
  }
  tree(-22,-8,1.5,0); tree(-27,5,1.2,1); tree(20,-15,1.6,0); tree(26,-4,1.3,1);
  // (-17,17)→(-24,24): the widened opening camera (fix 4) flew through this
  // tree's canopy — moved outward along the same sightline, still frames left.
  tree(-24,24,1.1,0); tree(29,15,1.4,1); tree(-33,-15,1.35,1); tree(36,-19,1.5,0);
  for (let i = 0; i < 32; i++) {
    const a = Math.random()*Math.PI*2, rr = 70 + Math.random()*230;
    tree(Math.cos(a)*rr, Math.sin(a)*rr, 1.6 + Math.random()*1.4, i % 2);
  }

  /* ----------------------------------------------------------------- site -- */
  // LANE A build-order fix (2026-07-26): a real house goes up bottom-up. The
  // foundation pad leads (s .38); the courtyard paving/gravel moved to a late
  // phase (3.2+) after the finishes — the yard is dressed once the house
  // stands, and the fence closes over it last. Nothing appears before the
  // thing it sits on: every phase starts only after its support has landed.
  add(new B(26,.26,17), 0xffffff, { x:-1.5, y:.13, z:1.5, fy:-2.4, s:3.2, d:.3, r:.94, map:pvT });
  add(new B(26.4,.16,.22), 0xcecac2, { x:-1.5, y:.08, z:10.05, fy:-2, s:3.28, d:.24, r:.95 });
  add(new B(7,.22,15), 0xffffff, { x:14.5, y:.11, z:0, fy:-2, s:3.32, d:.26, r:1, map:gravT, tint:0xd6d0c3 });
  add(new B(26,.2,5), 0xffffff, { x:-1.5, y:.11, z:-8, fy:-2, s:3.36, d:.26, r:1, map:gravT, tint:0xd6d0c3 });
  add(new B(19,.28,10), 0xcdcdc7, { x:-1.6, y:.3, z:0, fy:-2.4, s:.38, d:.3, r:1 });

  /* ----------------------------------------------------- WING (left wing) -- */
  add(new B(10.6,1.05,5.2), 0xffffff, { x:-3.7, y:.825, z:-.1, fy:-7, s:.7, d:.3, map:stoneLowT, r:.86, tint:STN });
  add(new B(10.72,.13,5.32), 0xe8e4dc, { x:-3.7, y:1.415, z:-.1, fy:-7, s:.78, d:.24, r:.9 });
  add(new B(10.6,2.32,5.2), 0xffffff, { x:-3.7, y:2.64, z:-.1, fy:-7, s:1.02, d:.34, map:stT, r:.93, tint:WHT });
  quoin(-9.0, 2.5, .3, 3.5, 2.78); quoin(-9.0, -2.7, .3, 3.5, 2.82);
  add(hipR(5.95,4.15,1.35,2.9), 0xffffff, { x:-3.7, y:3.8, z:.55, fy:10, s:2.25, d:.4, map:tileT, bump:bumpT, bs:.1, r:.74, m:.04, tint:0x757b78 });
  eave(-3.7, 3.64, .55, 5.95, 4.15, 1.95, .3);
  cap(-6.6,5.15,.55, -.8,5.15,.55, .15, 2.6, .26);
  cap(-9.65,3.8,4.7, -6.6,5.15,.55, .14, 2.62, .26);
  cap(2.25,3.8,4.7, -.8,5.15,.55, .14, 2.64, .26);
  cap(-9.65,3.8,-3.6, -6.6,5.15,.55, .14, 2.66, .26);
  cap(2.25,3.8,-3.6, -.8,5.15,.55, .14, 2.68, .26);
  dormer(-6.2, 3.8, .55, 4.15, 1.35, .33, 2.46);
  dormer(-1.4, 3.8, .55, 4.15, 1.35, .33, 2.52);
  for (let ci = 0; ci < 4; ci++) {
    const cx = -8.5 + ci*2.6, st = .92 + ci*.04;
    add(new B(.56,1.15,.56), 0xffffff, { x:cx, y:.875, z:4.3, fy:-3.6, s:st, d:.28, map:stoneColT, r:.86, tint:STN });
    add(new B(.68,.13,.68), 0xe8e4dc, { x:cx, y:1.515, z:4.3, fy:-3.6, s:st+.03, d:.24, r:.9 });
    add(new B(.47,1.95,.47), 0xffffff, { x:cx, y:2.555, z:4.3, fy:-3.6, s:st+.05, d:.26, map:stT, r:.93, tint:WHT });
    add(new B(.62,.12,.62), 0xe8e5dd, { x:cx, y:3.59, z:4.3, fy:-3.6, s:st+.07, d:.22, r:.9 });
  }
  add(new B(11.6,.14,.14), 0x1a2022, { x:-3.7, y:3.46, z:4.72, fy:10, s:2.08, d:.26, r:.55, m:.2 });
  add(new B(.13,3.5,.13), 0x1a2022, { x:-9.5, y:1.9, z:2.35, fy:-3, s:2.14, d:.26, r:.55, m:.2 });
  winX(-9.02, 2.55, 1.2, 1.3, 1.15, 2.9, 0);
  winX(-9.02, 2.55, -1.4, 1, 1.05, 2.92, 0);
  winZ(-6.4, 2.6, -2.72, 1.2, 1.2, 2.94, 0);
  winZ(-1.6, 2.6, -2.72, 1, 1.1, 2.96, 0);

  /* ------------------------------- BLOCK — "cu fronton" (SELECTED DESIGN) -- */
  const cx = 5.9, bw = 8.2, hx = bw/2 + .75, rx0 = 3.3;
  add(new B(bw,.85,6.8), 0xffffff, { x:cx, y:.725, z:.2, fy:-7, s:.72, d:.3, map:stoneLowT, r:.86, tint:STN });
  add(new B(bw+.12,.13,6.92), 0xe8e4dc, { x:cx, y:1.215, z:.2, fy:-7, s:.8, d:.24, r:.9 });
  // LANE A fix 1 (2026-07-26): block raised +1.1 m (wall 5.32→6.42) so the
  // second storey is unmistakable at drone framing — the upper window band
  // used to sit tight under the eave and the house read single-storey (the
  // Higgsfield restyle collapsed it to one floor). String course moved to the
  // true floor line (3.6→4.15); everything above the wall top follows +1.1.
  // The single-storey wing is untouched, which sharpens the contrast.
  // wall split at the floor line (4.15) so the GROUND floor builds first and
  // the UPPER floor arrives as its own lift — bottom-up like a real build.
  add(new B(bw,2.87,6.8), 0xffffff, { x:cx, y:2.715, z:.2, fy:-7, s:1.05, d:.36, map:stT, r:.93, tint:WHT });
  add(new B(bw,3.55,6.8), 0xffffff, { x:cx, y:5.925, z:.2, fy:-9, s:1.5, d:.36, map:stT, r:.93, tint:WHT });
  add(new B(bw+.14,.16,6.94), 0xe8e4dc, { x:cx, y:4.15, z:.2, fy:-7, s:1.7, d:.26, r:.9 });   // string course (floor line)
  quoin(cx-bw/2+.05, 3.55, .3, 7.4, 2.84);
  quoin(cx+bw/2-.05, 3.55, .3, 7.4, 2.86);
  quoin(cx+bw/2-.05, -3.15, .3, 7.4, 2.88);
  add(hipR(hx,4.15,2.05,rx0), 0xffffff, { x:cx, y:7.7, z:.2, fy:10, s:2.32, d:.4, map:tileT, bump:bumpT, bs:.1, r:.74, m:.04, tint:0x757b78 });
  eave(cx, 7.54, .2, hx, 4.15, 1.98, .3);
  cap(cx-rx0,9.75,.2, cx+rx0,9.75,.2, .16, 2.7, .26);
  cap(cx-hx,7.7,4.35, cx-rx0,9.75,.2, .15, 2.72, .26);
  cap(cx+hx,7.7,4.35, cx+rx0,9.75,.2, .15, 2.74, .26);
  cap(cx-hx,7.7,-3.95, cx-rx0,9.75,.2, .15, 2.76, .26);
  cap(cx+hx,7.7,-3.95, cx+rx0,9.75,.2, .15, 2.78, .26);
  add(new B(4.6,.06,3), 0xffffff, { rx:-.46, x:cx, y:8.6, z:-2.1, fy:10, s:2.8, d:.3, map:solT, r:.24, m:.5 });
  chimney(cx+1.8, -1.3, 10.25, .6, 1.3, 2.7);
  chimney(cx-1.8, -1.7, 9.9, .52, 1.05, 2.74);
  add(new B(bw+1.7,.16,.16), 0x1a2022, { x:cx, y:7.38, z:4.42, fy:10, s:2.1, d:.26, r:.55, m:.2 });
  add(new B(.13,6.3,.13), 0x1a2022, { x:cx+bw/2+.16, y:4.5, z:3.5, fy:-3, s:2.16, d:.26, r:.55, m:.2 });
  add(new B(1.9,6.42,.24), 0xffffff, { x:cx-bw/2+1.1, y:4.49, z:3.63, fz:2.4, s:1.6, d:.3, map:pnT, r:.66 });
  add(new B(.24,6.42,2), 0xffffff, { x:cx+bw/2+.02, y:4.49, z:1.5, fx:2.4, s:1.63, d:.3, map:pnT, r:.66 });
  winZ(cx-bw/2+1.1, 5.9, 3.72, 1.15, 1.7, 2.98, 1);
  winZ(cx-bw/2+1.1, 2.5, 3.72, 1.15, 1.5, 3.0, 1);
  winX(cx+bw/2+.14, 5.85, 1.5, 1.45, 1.8, 3.02, 1);
  winX(cx+bw/2+.14, 2.6, -1.4, 1.2, 1.35, 3.04, 0);
  winZ(cx, 2.6, -3.28, 1.3, 1.4, 3.06, 0);
  // cross gable bay (+1.1 with the block)
  add(new B(3.6,3.85,1.6), 0xffffff, { x:cx+1.6, y:2.225, z:4.4, fz:3, s:1.12, d:.34, map:stT, r:.93, tint:WHT });
  add(new B(3.6,3.55,1.6), 0xffffff, { x:cx+1.6, y:5.925, z:4.4, fz:3.4, s:1.55, d:.34, map:stT, r:.93, tint:WHT });
  add(new B(3.72,.16,1.72), 0xe8e4dc, { x:cx+1.6, y:4.15, z:4.4, fz:3, s:1.72, d:.26, r:.9 });
  quoin(cx-.2, 5.15, .3, 7.4, 2.9); quoin(cx+3.4, 5.15, .3, 7.4, 2.92);
  add(gable(2.05,2.6,1.55), 0xffffff, { x:cx+1.6, y:7.7, z:2.8, fy:9, s:2.42, d:.34, map:tileM, bump:bumpT, bs:.09, r:.74, m:.04, tint:0x757b78, ds:1 });
  add(new B(4.4,.28,.24), 0x131719, { x:cx+1.6, y:7.6, z:5.4, fy:9, s:2.02, d:.28, r:.62, m:.12 });
  add(new B(4.1,.18,.5), 0xffffff, { x:cx+1.6, y:7.72, z:5.62, fy:9, s:2.04, d:.26, map:woodT, r:.85, tint:0xd8b98a });
  add(new B(.16,.4,5.4), FRM, { x:cx+1.6, y:9.2, z:2.8, fy:9, s:2.06, d:.26, r:.6, m:.14 });
  winZ(cx+1.6, 5.75, 5.22, 2, 2.2, 3.08, 1);
  winZ(cx+1.6, 2.5, 5.22, 1.7, 1.5, 3.1, 1);

  /* ------------------------------------------------------------- entrance -- */
  // LANE A fix 2 (2026-07-26): the entrance dominated the facade — a 3.8 m
  // grey tower, a 1.34×2.5 door and 3.5 m-wide steps read as a wing. Scaled
  // to door proportions: surround 1.36×2.5 stopping just above the door,
  // door 1.0×2.15, lamps pulled in beside the jamb, steps door-width.
  add(new B(1.36,2.5,.24), 0xffffff, { x:.4, y:1.69, z:2.46, fz:2.4, s:3.1, d:.26, map:pnT, r:.66 });
  add(new B(1.0,2.15,.3), FRM, { x:.4, y:1.515, z:2.56, fy:-2.6, s:3.14, d:.22, r:.34, m:.5 });
  // LANE A fix 3 (2026-07-26): the 7-slat stack that floated in front of the
  // door face (B(1.08,.15,.1) ×7 at z 2.7) read as a striped pile/post by the
  // entrance — removed. A handle is all the door needs at this distance.
  add(new B(.05,.3,.07), 0xc9c4ba, { x:.78, y:1.45, z:2.74, fy:-2.6, s:3.18, d:.18, r:.35, m:.7 });
  add(new B(.16,.36,.14), 0x22282c, { x:-.35, y:2.2, z:2.62, fz:1.6, s:3.16, d:.2, r:.5, m:.4 });
  add(new B(.12,.26,.1), 0xfff0d0, { x:-.35, y:2.2, z:2.7, fz:1.6, s:3.18, d:.2, r:.3, emi:0xffdca8, ei:.55 });
  add(new B(.16,.36,.14), 0x22282c, { x:1.15, y:2.2, z:2.62, fz:1.6, s:3.16, d:.2, r:.5, m:.4 });
  add(new B(.12,.26,.1), 0xfff0d0, { x:1.15, y:2.2, z:2.7, fz:1.6, s:3.18, d:.2, r:.3, emi:0xffdca8, ei:.55 });
  winZ(-2.4, 2.55, 2.5, 1, 1.2, 3.12, 0);
  winZ(-5.4, 2.55, 2.5, .9, 1.1, 3.14, 0);
  add(new B(2.0,.17,1.2), 0xdedad2, { x:.4, y:.36, z:3.35, fy:-1.5, s:3.2, d:.22, r:.95 });
  add(new B(2.4,.17,1.1), 0xd6d2ca, { x:.4, y:.19, z:4.0, fy:-1.5, s:3.22, d:.22, r:.95 });
  add(new B(6.6,.14,.14), BRAND, { x:-3.7, y:3.32, z:4.72, fy:10, s:2.12, d:.24, r:.45 });

  /* ------------------------------------------------- fence, gate, garage --- */
  // LANE A fix 5 (2026-07-26): the fence read crude — chunky .44 piers,
  // panels floating .3 m above ground, blocky single caps. Now every run
  // shares one deliberate recipe: a continuous concrete PLINTH strip seats
  // the panels on the ground (split at the driveway gate), slimmer taller
  // piers (.38 × 2.3) with a two-step tapered cap, louvre panels 1.5 tall
  // sitting ON the plinth. Pitches unchanged (3.6 front/back, 3.4 sides);
  // the plot stays fully enclosed; the only opening is the front gate.
  function fencePier(px, pz, st) {
    add(new B(.38,2.3,.38), 0xd4d1ca, { x:px, y:1.41, z:pz, fy:-2.2, s:st, d:.24, map:stT, r:.95 });
    add(new B(.52,.12,.52), 0xc1beb7, { x:px, y:2.62, z:pz, fy:-2.2, s:st+.02, d:.2 });
    add(new B(.4,.07,.4), 0xb8b5ae, { x:px, y:2.71, z:pz, fy:-2.2, s:st+.03, d:.2 });
  }
  function fencePlinth(cx2, cz2, w2, alongX, st) {
    add(alongX ? new B(w2,.28,.18) : new B(.18,.28,w2), 0xcac6bd,
      { x:cx2, y:.4, z:cz2, fy:-2, s:st, d:.24, map:stT, r:.96, tint:0xd8d4cb });
  }
  // front run (plinth breaks at the gate: x 1.15…4.65)
  fencePlinth(-6.17, 9, 14.64, 1, 3.6);
  fencePlinth(10.17, 9, 11.04, 1, 3.62);
  const fxs = [-11.5,-7.9,-4.3,-0.7,6.5,10.1,13.7];
  fxs.forEach((fxv, i) => add(new B(2.9,1.5,.1), 0xffffff, { x:fxv, y:1.29, z:9, fy:-2.2, s:3.82+i*.02, d:.22, map:fnT, r:.68, m:.3 }));
  for (let i = 0; i < 9; i++) fencePier(-13.3+i*3.6, 9, 3.7+i*.02);
  // LANE A gate fix (2026-07-26): the old gate was one flat textured slab +
  // a rail. Now a real driveway gate, still built LAST: two framed leaves
  // (stiles + rails + louvre infill matching the fence panels) that slide in
  // from opposite sides and meet at the centre as the closing beat of the
  // build. The flanking stucco fence piers (x 1.1 / 4.7) are the gate posts
  // — dedicated steel posts were tried and sat invisibly inside them.
  for (const leaf of [{ c:2.055, fx:-2.5 }, { c:3.795, fx:2.5 }]) {
    const L = leaf.c, F = leaf.fx;
    add(new B(1.59,.12,.09), 0x2f363d, { x:L, y:.55, z:9, fx:F, s:4.08, d:.18, r:.45, m:.5 });
    add(new B(1.59,.12,.09), 0x2f363d, { x:L, y:2.02, z:9, fx:F, s:4.08, d:.18, r:.45, m:.5 });
    add(new B(.1,1.59,.09), 0x2f363d, { x:L-.745, y:1.285, z:9, fx:F, s:4.1, d:.18, r:.45, m:.5 });
    add(new B(.1,1.59,.09), 0x2f363d, { x:L+.745, y:1.285, z:9, fx:F, s:4.1, d:.18, r:.45, m:.5 });
    add(new B(1.39,1.35,.06), 0xffffff, { x:L, y:1.285, z:9, fx:F, s:4.12, d:.18, map:fnT, r:.55, m:.4, tint:0xb9bfc6 });
  }
  // side runs (x ±: front corner piers shared with the front run)
  for (const sx of [-13.3, 15.5]) {
    const sb = sx < 0 ? 3.72 : 3.74;
    fencePlinth(sx, .5, 16.8, 0, 3.64);
    for (let i = 0; i < 4; i++) fencePier(sx, 5.6 - i * 3.4, sb + i * .02);
    for (let i = 0; i < 5; i++)
      add(new B(.1,1.5,2.7), 0xffffff, { x:sx, y:1.29, z:7.3-i*3.4, fy:-2.2, s:sb+.14+i*.02, d:.22, map:fnT, r:.68, m:.3 });
  }
  // back run
  fencePlinth(1.1, -8, 29.2, 1, 3.66);
  for (let i = 0; i < 9; i++) fencePier(-13.3+i*3.6, -8, 3.76+i*.02);
  [-11.5,-7.9,-4.3,-0.7,2.9,6.5,10.1,13.7].forEach((bx3, i) =>
    add(new B(2.9,1.5,.1), 0xffffff, { x:bx3, y:1.29, z:-8, fy:-2.2, s:3.88+i*.02, d:.22, map:fnT, r:.68, m:.3 }));
  add(new B(2.3,.95,4.5), 0x30373d, { x:-7.6, y:.62, z:1.4, fy:-2, s:3.45, d:.26, r:.42, m:.45 });
  add(new B(2.1,.75,2.3), 0x282e33, { x:-7.6, y:1.42, z:.75, fy:-2, s:3.48, d:.26, r:.25, m:.55 });

  /* ------------------------------------------------------------ animation -- */
  const BUILD_END = 4.3, HOLD = 2.1;
  const PHASES = [[0,'Proiect',BLUE],[.35,'Fundație',0x8a94a0],[1.0,'Pereți',0x8a94a0],
                  [1.95,'Acoperiș',0x8a94a0],[2.85,'Finisaje',0x8a94a0],[3.55,'RapidConstruct',BRAND]];
  const eo = t => 1 - Math.pow(1-t, 3);
  const eq = t => t < .5 ? 2*t*t : 1 - Math.pow(-2*t+2, 4)/2;
  const cl = (v,a,b) => Math.max(a, Math.min(b, v));
  const lp = (a,b,t) => a + (b-a)*t;

  function phaseAt(t) {
    let i = 0; for (let q = 0; q < PHASES.length; q++) if (t >= PHASES[q][0]) i = q;
    return { label: PHASES[i][1], color: PHASES[i][2] };
  }
  function cameraAt(t) {
    const c = eq(cl((t-.08)/(BUILD_END-.3), 0, 1));
    // LANE A fix 4 (2026-07-26): opening keyframe widened rd 20→25.5 and
    // raised hy 2.4→5.2 (look-at 2.4→3.0). At the old low/close start the
    // blueprint phase cropped the two-storey block at the frame edge — the
    // wireframe pass ALWAYS outlined the full footprint (every piece gets a
    // ghost), but only half of it was in frame. The pull-back destination is
    // unchanged.
    const rd = lp(25.5,35,c), hy = lp(5.2,15,c), an = -.78 + c*.66;
    return { position: [Math.sin(an)*rd, hy, Math.cos(an)*rd], lookAt: [-.5, lp(3.0,3.3,c), .5] };
  }
  function update(t) {
    const e0 = eo(cl(t/.6, 0, 1));
    ground.material.opacity = e0; hillM.opacity = e0 * .95;
    for (const f of groundFx) f.m.material.opacity = e0 * f.op;
    dome.rotation.y = t * .0045; // clouds drift ~1°/4s — never a frozen sky
    if (t > BUILD_END) {
      const h = t - BUILD_END;
      // LANE A fix 6: same eased ramp as the camera drift — the elevation
      // sine is non-zero at h=0 and used to step the sun (and every shadow)
      // the moment the build settled.
      const r0 = Math.min(1, h / 2.5), r = r0 * r0 * (3 - 2 * r0);
      const az = KEY_AZ + r * .05 * Math.sin(h * .07);
      key.position.set(Math.cos(az) * KEY_R, 13 + r * .8 * Math.sin(h * .05 + 1), Math.sin(az) * KEY_R);
    }
    for (const tr of trees) { tr.tm.opacity = e0; tr.lm.opacity = e0; }
    const bp = cl(t/.5, 0, 1);
    for (const p of P) {
      const q = cl((t - p.s)/p.d, 0, 1), e = eo(q);
      p.pv.position.lerpVectors(p.fr, Z, e);
      p.m.opacity = e;
      p.bm.opacity = (1 - q) * .85 * bp;
    }
  }
  function applyRenderer(r) {
    r.outputEncoding = THREE.sRGBEncoding;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 0.97;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
  }
  if (renderer) applyRenderer(renderer);

  return { group: G, ghosts: GH, trees: TR, update, cameraAt, phaseAt, applyRenderer, BUILD_END, HOLD, PHASES };
}
