/**
 * House kit — the shared vocabulary every house recipe builds with.
 *
 * Split out of the approved `rapidconstruct-scene.js` (2026-07-24,
 * feature/configurator) so the house can be data-driven. Two exports:
 *
 *   makeTextures(THREE)      — every procedural canvas texture. The drawing
 *                              code is the approved code, moved, not changed;
 *                              the roof-tile painter is parameterised
 *                              (colour stops + profile) so each roof material
 *                              gets its own texture from the same generator.
 *   createKit(THREE, ctx)    — geometry helpers (hip/gable/mansard roofs,
 *                              quoins, eaves, ridge caps, chimneys, windows,
 *                              dormers) bound to the scene's `add` plumbing.
 *
 * Hard-won rules that MUST survive here (see docs/3D-HERO-SPEC.md):
 *   - rotate geometry BEFORE translating it;
 *   - a window frame is a RING of four bars, never a solid box;
 *   - ridge caps use makeRotationFromQuaternion on the GEOMETRY (not
 *     applyQuaternion on the mesh).
 */

/* ------------------------------------------------------------- textures -- */

export function makeTextures(THREE) {
  const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const T = (c, rx, ry) => {
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return t;
  };

  /**
   * Roof tile painter — the approved generator, parameterised.
   * `pantile` draws the approved S-profile rows (quadratic curve crests);
   * `shingle` draws offset rectangular tabs. `granular` sprinkles mineral
   * speckle on top (stone-coated + bituminous looks).
   */
  function tileCanvas({ base, stops, stroke, profile, granular }) {
    const c = cv(512, 512), x = c.getContext('2d');
    x.fillStyle = base; x.fillRect(0, 0, 512, 512);
    if (profile === 'shingle') {
      for (let r = 0; r < 12; r++) {
        const off = (r % 2) ? 32 : 0;
        for (let cc = -1; cc < 9; cc++) {
          const px = cc * 64 + off, py = r * 42.7;
          const g = x.createLinearGradient(px, py, px, py + 42.7);
          for (const [p, col] of stops) g.addColorStop(p, col);
          x.fillStyle = g; x.fillRect(px + 1.5, py + 2, 61, 38.7);
          x.strokeStyle = stroke; x.lineWidth = 2;
          x.strokeRect(px + 1.5, py + 2, 61, 38.7);
        }
      }
    } else {
      // pantile — EXACT approved drawing loop.
      for (let r = 0; r < 12; r++) for (let cc = 0; cc < 12; cc++) {
        const px = cc * 42.7, py = r * 42.7, g = x.createLinearGradient(px, py, px, py + 42.7);
        for (const [p, col] of stops) g.addColorStop(p, col);
        x.fillStyle = g; x.beginPath(); x.moveTo(px, py + 42.7); x.lineTo(px, py + 11);
        x.quadraticCurveTo(px + 21.3, py - 7, px + 42.7, py + 11); x.lineTo(px + 42.7, py + 42.7);
        x.closePath(); x.fill(); x.strokeStyle = stroke; x.lineWidth = 2; x.stroke();
      }
    }
    if (granular) {
      for (let i = 0; i < 6000; i++) {
        const v = 110 + Math.random() * 90;
        x.fillStyle = `rgba(${v | 0},${v | 0},${(v - 6) | 0},.10)`;
        x.fillRect(Math.random() * 512, Math.random() * 512, 1.4, 1.4);
      }
    }
    return c;
  }

  /** The three repeat variants every roof surface uses (main / small / mid). */
  function roofTiles(spec) {
    const c = tileCanvas(spec);
    return { tileT: T(c, 5, 7), tileS: T(c, 1.4, 1.4), tileM: T(c, 2.6, 3) };
  }

  // roof bump — shared by every material (row relief, not colour)
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

  // fence panel — horizontal louvres ("jaluzele", the approved fence)
  const fc = cv(128, 256), fx = fc.getContext('2d');
  fx.fillStyle = '#78808a'; fx.fillRect(0, 0, 128, 256);
  fx.strokeStyle = 'rgba(48,54,60,.85)'; fx.lineWidth = 3.4;
  for (let y = 9; y < 256; y += 19) { fx.beginPath(); fx.moveTo(0, y); fx.lineTo(128, y); fx.stroke(); }
  const fnT = T(fc, 1, 1);

  // fence panel — vertical timber pickets ("șipcă")
  const spc = cv(256, 256), sp = spc.getContext('2d');
  sp.fillStyle = '#241c12'; sp.fillRect(0, 0, 256, 256); // gap shadow between pickets
  for (let pi = 0; pi < 9; pi++) {
    const pw = 28.4, pxp = pi * pw, base = 128 + Math.random() * 34;
    sp.fillStyle = `rgb(${(base + 46) | 0},${(base + 2) | 0},${(base - 48) | 0})`;
    sp.fillRect(pxp + 2, 4, pw - 8, 248);
    for (let k = 0; k < 26; k++) {
      sp.fillStyle = `rgba(74,46,22,${.06 + Math.random() * .13})`;
      sp.fillRect(pxp + 2, Math.random() * 256, pw - 8, 3 + Math.random() * 12);
    }
    sp.fillStyle = 'rgba(255,238,210,.16)'; sp.fillRect(pxp + 2, 4, 2.4, 248);
  }
  const sipcaT = T(spc, 1.6, 1);

  // gate — vertical metal bars
  const gtc = cv(256, 128), gt = gtc.getContext('2d');
  gt.fillStyle = '#6f7780'; gt.fillRect(0, 0, 256, 128);
  for (let vx = 0; vx < 256; vx += 16) {
    gt.fillStyle = 'rgba(96,104,112,.9)'; gt.fillRect(vx, 0, 11, 128);
    gt.fillStyle = 'rgba(38,44,50,.8)'; gt.fillRect(vx + 11, 0, 5, 128);
  }
  const gateT = T(gtc, 1, 1);

  // solar panel — cell grid
  const slc = cv(256, 256), lx = slc.getContext('2d');
  lx.fillStyle = '#131e30'; lx.fillRect(0, 0, 256, 256);
  lx.strokeStyle = 'rgba(150,168,192,.5)'; lx.lineWidth = 2;
  for (let i = 0; i <= 8; i++) {
    lx.beginPath(); lx.moveTo(i * 32, 0); lx.lineTo(i * 32, 256); lx.stroke();
    lx.beginPath(); lx.moveTo(0, i * 32); lx.lineTo(256, i * 32); lx.stroke();
  }
  const solT = T(slc, 4, 2);

  // lawn
  const grc = cv(256, 256), gx = grc.getContext('2d');
  gx.fillStyle = '#71873f'; gx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 12000; i++) {
    gx.fillStyle = `hsl(${64 + Math.random() * 38},34%,${23 + Math.random() * 24}%)`;
    gx.fillRect(Math.random() * 256, Math.random() * 256, 2.6, 2.6);
  }
  const grT = T(grc, 30, 30);

  // sky gradient
  const kc = cv(4, 256), kx = kc.getContext('2d');
  const sg = kx.createLinearGradient(0, 0, 0, 256);
  sg.addColorStop(0, '#7fa8d2'); sg.addColorStop(.38, '#b0c8e0');
  sg.addColorStop(.72, '#dce1e3'); sg.addColorStop(1, '#e2dbcd');
  kx.fillStyle = sg; kx.fillRect(0, 0, 4, 256);
  const skyT = new THREE.CanvasTexture(kc);

  return {
    roofTiles, bumpT, brickT, woodT, stT,
    stoneLowT, stoneQT, stoneColT,
    pvT, gravT, pnT, fnT, sipcaT, gateT, solT, grT, skyT,
  };
}

/* ------------------------------------------------------------- geometry -- */

/**
 * createKit — binds the geometry vocabulary to the engine's `add` plumbing.
 *
 * `ctx` supplies:
 *   add(geo, color, opts)  — register a mesh + blueprint ghost + fly-in piece
 *   tex                    — the makeTextures() bag
 *   colors                 — { BRAND, BLUE, WHT, STN, FRM, GLS, QUOIN }
 *   roofMat()              — resolved roof material { tileT, tileS, tileM,
 *                            bump, tint, rough, metal } for the active config
 */
export function createKit(THREE, ctx) {
  const { add, tex, colors } = ctx;
  const B = THREE.BoxGeometry;
  const { WHT, FRM, GLS, QUOIN } = colors;

  function hipR(hx, hz, h, rx) {
    const v = [-hx, 0, hz, hx, 0, hz, hx, 0, -hz, -hx, 0, -hz, -rx, h, 0, rx, h, 0];
    const f = [0, 1, 5, 0, 5, 4, 2, 3, 4, 2, 4, 5, 1, 2, 5, 3, 0, 4];
    const g = new THREE.BufferGeometry(), pos = [];
    for (const i of f) pos.push(v[i * 3], v[i * 3 + 1], v[i * 3 + 2]);
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const uv = []; for (let k = 0; k < f.length; k++) uv.push((pos[k * 3] + hx) / (2 * hx), (pos[k * 3 + 2] + hz) / (2 * hz));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.computeVertexNormals(); return g;
  }

  function gable(hx, hz, h) {
    const v = [-hx, 0, hz, hx, 0, hz, hx, 0, -hz, -hx, 0, -hz, 0, h, hz, 0, h, -hz];
    const f = [3, 0, 4, 3, 4, 5, 1, 2, 5, 1, 5, 4, 0, 1, 4, 2, 3, 5];
    const g = new THREE.BufferGeometry(), pos = [];
    for (const i of f) pos.push(v[i * 3], v[i * 3 + 1], v[i * 3 + 2]);
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const uv = []; for (let k = 0; k < f.length; k++) uv.push((pos[k * 3] + hx) / (2 * hx), (pos[k * 3 + 2] + hz) / (2 * hz));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.computeVertexNormals(); return g;
  }

  /** Gable with the ridge along X (rotate BEFORE translate — kit law). */
  function gableX(hx, hz, h) {
    const g = gable(hz, hx, h);
    g.rotateY(Math.PI / 2);
    return g;
  }

  /**
   * Mansard band — truncated-pyramid slope belt from the eave rectangle
   * (hx, hz) up `h` to the inner rectangle (hx2, hz2). The upper cap is a
   * separate hipR from the recipe. Outer and inner rects share corner rays,
   * so four trapezoids close the belt with no corner patches.
   */
  function mansardBand(hx, hz, hx2, hz2, h) {
    const o = [-hx, 0, hz, hx, 0, hz, hx, 0, -hz, -hx, 0, -hz];
    const n = [-hx2, h, hz2, hx2, h, hz2, hx2, h, -hz2, -hx2, h, -hz2];
    const v = o.concat(n);
    const f = [0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5, 2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7];
    const g = new THREE.BufferGeometry(), pos = [];
    for (const i of f) pos.push(v[i * 3], v[i * 3 + 1], v[i * 3 + 2]);
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const uv = []; for (let k = 0; k < f.length; k++) uv.push((pos[k * 3] + hx) / (2 * hx), (pos[k * 3 + 2] + hz) / (2 * hz));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.computeVertexNormals(); return g;
  }

  function quoin(cx, cz, baseY, h, st) {
    const n = Math.max(6, Math.round(h / .44)), bh = h / n;
    for (let i = 0; i < n; i++) {
      const wide = (i % 2 === 0), w = wide ? .6 : .38, d = wide ? .38 : .6;
      add(new B(w, bh * .9, d), 0xffffff, { x: cx, y: baseY + bh * (i + .5), z: cz, fy: -4, s: st + i * .014, d: .24, map: tex.stoneQT, r: .86, tint: QUOIN });
    }
  }

  function eave(cx, cy, cz, hx, hz, st, dd) {
    add(new B(2 * hx + .1, .3, 2 * hz + .1), 0x131719, { x: cx, y: cy, z: cz, fy: 10, s: st, d: dd, r: .62, m: .12 });
    add(new B(2 * hx - .12, .2, 2 * hz - .12), 0xffffff, { x: cx, y: cy + .07, z: cz, fy: 10, s: st + .02, d: dd, map: tex.stT, r: .95, tint: 0xf7f5ef });
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
    add(new B(w, hgt, w), 0xffffff, { x: cx, y: topY - hgt / 2, z: cz, fy: 7, s: st, d: .3, map: tex.brickT, r: .96, tint: 0xd4cbc0 });
    add(new B(w + .1, .09, w + .1), 0xd4d0c6, { x: cx, y: topY + .045, z: cz, fy: 7, s: st + .05, d: .24, r: .9 });
    const pp = w * .34;
    add(new B(.06, .28, .06), 0x1c2225, { x: cx - pp, y: topY + .23, z: cz - pp, fy: 7, s: st + .09, d: .2, r: .5, m: .4 });
    add(new B(.06, .28, .06), 0x1c2225, { x: cx + pp, y: topY + .23, z: cz + pp, fy: 7, s: st + .1, d: .2, r: .5, m: .4 });
    add(new B(w + .28, .08, w + .28), 0x1c2225, { x: cx, y: topY + .4, z: cz, fy: 7, s: st + .14, d: .22, r: .5, m: .45 });
  }

  /** CRITICAL: the frame is a RING of four bars. A solid box hides the glass. */
  function winZ(wx, wy, wz, w, h, st, mull) {
    const gz = wz - .1, fz2 = wz - .02;
    add(new B(w, h, .05), GLS, { x: wx, y: wy, z: gz, fz: 1.6, s: st, d: .22, r: .04, m: .95 });
    add(new B(w + .26, .13, .19), FRM, { x: wx, y: wy + h / 2 + .065, z: fz2, fz: 1.6, s: st + .02, d: .2, r: .32, m: .5 });
    add(new B(w + .26, .13, .19), FRM, { x: wx, y: wy - h / 2 - .065, z: fz2, fz: 1.6, s: st + .02, d: .2, r: .32, m: .5 });
    add(new B(.13, h, .19), FRM, { x: wx - w / 2 - .065, y: wy, z: fz2, fz: 1.6, s: st + .02, d: .2, r: .32, m: .5 });
    add(new B(.13, h, .19), FRM, { x: wx + w / 2 + .065, y: wy, z: fz2, fz: 1.6, s: st + .02, d: .2, r: .32, m: .5 });
    if (mull) add(new B(.085, h, .17), FRM, { x: wx, y: wy, z: fz2 - .01, fz: 1.6, s: st + .03, d: .2, r: .32, m: .5 });
    add(new B(w + .38, .1, .28), 0xe6e2da, { x: wx, y: wy - h / 2 - .14, z: wz - .02, fz: 1.6, s: st + .04, d: .2, r: .9 });
  }

  function winX(wx, wy, wz, d, h, st, mull) {
    const s = (wx > 0) ? 1 : -1, gx2 = wx - s * .1, fxb = wx - s * .02;
    add(new B(.05, h, d), GLS, { x: gx2, y: wy, z: wz, fx: 1.6 * s, s: st, d: .22, r: .04, m: .95 });
    add(new B(.19, .13, d + .26), FRM, { x: fxb, y: wy + h / 2 + .065, z: wz, fx: 1.6 * s, s: st + .02, d: .2, r: .32, m: .5 });
    add(new B(.19, .13, d + .26), FRM, { x: fxb, y: wy - h / 2 - .065, z: wz, fx: 1.6 * s, s: st + .02, d: .2, r: .32, m: .5 });
    add(new B(.19, h, .13), FRM, { x: fxb, y: wy, z: wz - d / 2 - .065, fx: 1.6 * s, s: st + .02, d: .2, r: .32, m: .5 });
    add(new B(.19, h, .13), FRM, { x: fxb, y: wy, z: wz + d / 2 + .065, fx: 1.6 * s, s: st + .02, d: .2, r: .32, m: .5 });
    if (mull) add(new B(.17, h, .085), FRM, { x: fxb - s * .01, y: wy, z: wz, fx: 1.6 * s, s: st + .03, d: .2, r: .32, m: .5 });
    add(new B(.28, .1, d + .38), 0xe6e2da, { x: wx - s * .02, y: wy - h / 2 - .14, z: wz, fx: 1.6 * s, s: st + .04, d: .2, r: .9 });
  }

  /** Dormer at an absolute (y, z) on a slope — mansard slopes taper faster
   *  than hips, so the hip fraction mapping in dormer() can't be reused. */
  function dormerAt(cx, y, z, st) {
    const rm = ctx.roofMat();
    const w = 1.7, dp = 1.75, bh = .86;
    add(new B(w, bh, dp), 0xffffff, { x: cx, y: y + bh / 2 - .24, z, fy: 6, s: st, d: .34, map: tex.stT, r: .93, tint: WHT });
    add(gable(w / 2 + .19, dp / 2 + .2, .5), 0xffffff, { x: cx, y: y + bh - .24, z, fy: 6, s: st + .05, d: .34, map: rm.tileS, bump: tex.bumpT, bs: .07, r: rm.rough, m: rm.metal, tint: rm.tint, ds: 1 });
    add(new B(.13, .36, dp + .44), FRM, { x: cx, y: y + bh - .06, z, fy: 6, s: st + .09, d: .28, r: .6, m: .14 });
    add(new B(w + .4, .11, .15), FRM, { x: cx, y: y + bh - .29, z: z + dp / 2 + .22, fy: 6, s: st + .11, d: .26, r: .6, m: .14 });
    add(new B(w + .28, .09, .46), 0xffffff, { x: cx, y: y + bh - .2, z: z + dp / 2 + .39, fy: 6, s: st + .13, d: .26, map: tex.woodT, r: .85, tint: 0xd8b98a });
    winZ(cx, y + bh / 2 - .26, z + dp / 2 + .03, .98, .6, st + .15, 0);
  }

  /** Approved hip-slope placement: fraction f along the slope, taper-aware. */
  function dormer(cx, roofBase, roofCz, hz, h, f, st) {
    dormerAt(cx, roofBase + h * f, roofCz + hz * (1 - f), st);
  }

  return {
    B, add, tex, colors,
    hipR, gable, gableX, mansardBand,
    quoin, eave, cap, chimney, winZ, winX, dormer, dormerAt,
    roofMat: ctx.roofMat,
  };
}
