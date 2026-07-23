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
  const WHT = 0xf1eee6, STN = 0xc6bfb1, FRM = 0x14181c, GLS = 0x2f4856;

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
  const kc = cv(4, 256), kx = kc.getContext('2d');
  const sg = kx.createLinearGradient(0, 0, 0, 256);
  sg.addColorStop(0, '#7fa8d2'); sg.addColorStop(.38, '#b0c8e0');
  sg.addColorStop(.72, '#dce1e3'); sg.addColorStop(1, '#e2dbcd');
  kx.fillStyle = sg; kx.fillRect(0, 0, 4, 256);
  scene.background = new THREE.CanvasTexture(kc);
  scene.fog = new THREE.FogExp2(0xcbcdc9, .0066);

  /* -------------------------------------------------------------- lights -- */
  scene.add(new THREE.HemisphereLight(0xafc6de, 0x7a6e52, .52));
  const key = new THREE.DirectionalLight(0xffe9c9, 1.52);
  key.position.set(-24, 13, 16); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -34, right: 34, top: 34, bottom: -34, near: 1, far: 100 });
  key.shadow.bias = -0.0007; key.shadow.radius = 3.5;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x93b4d8, .32);
  fill.position.set(17, 9, -15); scene.add(fill);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400),
    new THREE.MeshStandardMaterial({ map: grT, color: 0xdedbd0, roughness: 1, transparent: true, opacity: 0 }));
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
    GH.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 32), bm));
    const fr = new THREE.Vector3(o.fx || 0, o.fy || 0, o.fz || 0); pv.position.copy(fr);
    P.push({ pv, m: mt, bm, fr, s: o.s, d: o.d });
  }

  function quoin(cx, cz, baseY, h, st) {
    const n = Math.max(6, Math.round(h / .44)), bh = h / n;
    for (let i = 0; i < n; i++) {
      const wide = (i % 2 === 0), w = wide ? .6 : .38, d = wide ? .38 : .6;
      add(new B(w, bh * .9, d), 0xffffff, { x: cx, y: baseY + bh * (i + .5), z: cz, fy: -4, s: st + i * .014, d: .24, map: stoneQT, r: .86, tint: STN });
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
    const gz = wz - .1, fz2 = wz - .02;
    add(new B(w, h, .05), GLS, { x: wx, y: wy, z: gz, fz: 1.6, s: st, d: .22, r: .04, m: .95 });
    add(new B(w+.17, .09, .15), FRM, { x: wx, y: wy+h/2+.045, z: fz2, fz: 1.6, s: st+.02, d: .2, r: .32, m: .5 });
    add(new B(w+.17, .09, .15), FRM, { x: wx, y: wy-h/2-.045, z: fz2, fz: 1.6, s: st+.02, d: .2, r: .32, m: .5 });
    add(new B(.09, h, .15), FRM, { x: wx-w/2-.045, y: wy, z: fz2, fz: 1.6, s: st+.02, d: .2, r: .32, m: .5 });
    add(new B(.09, h, .15), FRM, { x: wx+w/2+.045, y: wy, z: fz2, fz: 1.6, s: st+.02, d: .2, r: .32, m: .5 });
    if (mull) add(new B(.06, h, .13), FRM, { x: wx, y: wy, z: fz2-.01, fz: 1.6, s: st+.03, d: .2, r: .32, m: .5 });
    add(new B(w+.38, .1, .28), 0xe6e2da, { x: wx, y: wy-h/2-.14, z: wz-.02, fz: 1.6, s: st+.04, d: .2, r: .9 });
  }
  function winX(wx, wy, wz, d, h, st, mull) {
    const s = (wx > 0) ? 1 : -1, gx2 = wx - s*.1, fxb = wx - s*.02;
    add(new B(.05, h, d), GLS, { x: gx2, y: wy, z: wz, fx: 1.6*s, s: st, d: .22, r: .04, m: .95 });
    add(new B(.15, .09, d+.17), FRM, { x: fxb, y: wy+h/2+.045, z: wz, fx: 1.6*s, s: st+.02, d: .2, r: .32, m: .5 });
    add(new B(.15, .09, d+.17), FRM, { x: fxb, y: wy-h/2-.045, z: wz, fx: 1.6*s, s: st+.02, d: .2, r: .32, m: .5 });
    add(new B(.15, h, .09), FRM, { x: fxb, y: wy, z: wz-d/2-.045, fx: 1.6*s, s: st+.02, d: .2, r: .32, m: .5 });
    add(new B(.15, h, .09), FRM, { x: fxb, y: wy, z: wz+d/2+.045, fx: 1.6*s, s: st+.02, d: .2, r: .32, m: .5 });
    if (mull) add(new B(.13, h, .06), FRM, { x: fxb-s*.01, y: wy, z: wz, fx: 1.6*s, s: st+.03, d: .2, r: .32, m: .5 });
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
  tree(-17,17,1.1,0); tree(29,15,1.4,1); tree(-33,-15,1.35,1); tree(36,-19,1.5,0);
  for (let i = 0; i < 32; i++) {
    const a = Math.random()*Math.PI*2, rr = 70 + Math.random()*230;
    tree(Math.cos(a)*rr, Math.sin(a)*rr, 1.6 + Math.random()*1.4, i % 2);
  }

  /* ----------------------------------------------------------------- site -- */
  add(new B(26,.26,17), 0xffffff, { x:-1.5, y:.13, z:1.5, fy:-2.4, s:.42, d:.4, r:.94, map:pvT });
  add(new B(26.4,.16,.22), 0xcecac2, { x:-1.5, y:.08, z:10.05, fy:-2, s:.5, d:.3, r:.95 });
  add(new B(7,.22,15), 0xffffff, { x:14.5, y:.11, z:0, fy:-2, s:.46, d:.36, r:1, map:gravT, tint:0xd6d0c3 });
  add(new B(26,.2,5), 0xffffff, { x:-1.5, y:.11, z:-8, fy:-2, s:.48, d:.36, r:1, map:gravT, tint:0xd6d0c3 });
  add(new B(19,.28,10), 0xcdcdc7, { x:-1.6, y:.3, z:0, fy:-2.4, s:.56, d:.36, r:1 });

  /* ----------------------------------------------------- WING (left wing) -- */
  add(new B(10.6,1.05,5.2), 0xffffff, { x:-3.7, y:.825, z:-.1, fy:-7, s:.86, d:.44, map:stoneLowT, r:.86, tint:STN });
  add(new B(10.72,.13,5.32), 0xe8e4dc, { x:-3.7, y:1.415, z:-.1, fy:-7, s:.9, d:.34, r:.9 });
  add(new B(10.6,2.32,5.2), 0xffffff, { x:-3.7, y:2.64, z:-.1, fy:-7, s:.92, d:.44, map:stT, r:.93, tint:WHT });
  quoin(-9.0, 2.5, .3, 3.5, 1.06); quoin(-9.0, -2.7, .3, 3.5, 1.1);
  add(hipR(5.95,4.15,1.35,2.9), 0xffffff, { x:-3.7, y:3.8, z:.55, fy:10, s:1.62, d:.5, map:tileT, bump:bumpT, bs:.1, r:.74, m:.04, tint:0x757b78 });
  eave(-3.7, 3.64, .55, 5.95, 4.15, 1.68, .36);
  cap(-6.6,5.15,.55, -.8,5.15,.55, .15, 1.86, .3);
  cap(-9.65,3.8,4.7, -6.6,5.15,.55, .14, 1.88, .3);
  cap(2.25,3.8,4.7, -.8,5.15,.55, .14, 1.9, .3);
  cap(-9.65,3.8,-3.6, -6.6,5.15,.55, .14, 1.92, .3);
  cap(2.25,3.8,-3.6, -.8,5.15,.55, .14, 1.94, .3);
  dormer(-6.2, 3.8, .55, 4.15, 1.35, .33, 2.4);
  dormer(-1.4, 3.8, .55, 4.15, 1.35, .33, 2.5);
  for (let ci = 0; ci < 4; ci++) {
    const cx = -8.5 + ci*2.6, st = 1.26 + ci*.05;
    add(new B(.56,1.15,.56), 0xffffff, { x:cx, y:.875, z:4.3, fy:-3.6, s:st, d:.28, map:stoneColT, r:.86, tint:STN });
    add(new B(.68,.13,.68), 0xe8e4dc, { x:cx, y:1.515, z:4.3, fy:-3.6, s:st+.03, d:.24, r:.9 });
    add(new B(.47,1.95,.47), 0xffffff, { x:cx, y:2.555, z:4.3, fy:-3.6, s:st+.05, d:.26, map:stT, r:.93, tint:WHT });
    add(new B(.62,.12,.62), 0xe8e5dd, { x:cx, y:3.59, z:4.3, fy:-3.6, s:st+.07, d:.22, r:.9 });
  }
  add(new B(11.6,.14,.14), 0x1a2022, { x:-3.7, y:3.46, z:4.72, fy:10, s:1.8, d:.3, r:.55, m:.2 });
  add(new B(.13,3.5,.13), 0x1a2022, { x:-9.5, y:1.9, z:2.35, fy:-3, s:2.02, d:.28, r:.55, m:.2 });
  winX(-9.02, 2.55, 1.2, 1.3, 1.15, 2.6, 0);
  winX(-9.02, 2.55, -1.4, 1, 1.05, 2.62, 0);
  winZ(-6.4, 2.6, -2.72, 1.2, 1.2, 2.64, 0);
  winZ(-1.6, 2.6, -2.72, 1, 1.1, 2.66, 0);

  /* ------------------------------- BLOCK — "cu fronton" (SELECTED DESIGN) -- */
  const cx = 5.9, bw = 8.2, hx = bw/2 + .75, rx0 = 3.3;
  add(new B(bw,.85,6.8), 0xffffff, { x:cx, y:.725, z:.2, fy:-7, s:.94, d:.46, map:stoneLowT, r:.86, tint:STN });
  add(new B(bw+.12,.13,6.92), 0xe8e4dc, { x:cx, y:1.215, z:.2, fy:-7, s:.98, d:.34, r:.9 });
  add(new B(bw,5.32,6.8), 0xffffff, { x:cx, y:3.94, z:.2, fy:-7, s:1, d:.46, map:stT, r:.93, tint:WHT });
  add(new B(bw+.14,.16,6.94), 0xe8e4dc, { x:cx, y:3.6, z:.2, fy:-7, s:1.44, d:.32, r:.9 });   // string course
  quoin(cx-bw/2+.05, 3.55, .3, 6.3, 1.14);
  quoin(cx+bw/2-.05, 3.55, .3, 6.3, 1.18);
  quoin(cx+bw/2-.05, -3.15, .3, 6.3, 1.22);
  add(hipR(hx,4.15,2.05,rx0), 0xffffff, { x:cx, y:6.6, z:.2, fy:10, s:1.7, d:.5, map:tileT, bump:bumpT, bs:.1, r:.74, m:.04, tint:0x757b78 });
  eave(cx, 6.44, .2, hx, 4.15, 1.76, .36);
  cap(cx-rx0,8.65,.2, cx+rx0,8.65,.2, .16, 1.96, .3);
  cap(cx-hx,6.6,4.35, cx-rx0,8.65,.2, .15, 1.98, .3);
  cap(cx+hx,6.6,4.35, cx+rx0,8.65,.2, .15, 2.0, .3);
  cap(cx-hx,6.6,-3.95, cx-rx0,8.65,.2, .15, 2.02, .3);
  cap(cx+hx,6.6,-3.95, cx+rx0,8.65,.2, .15, 2.04, .3);
  add(new B(4.6,.06,3), 0xffffff, { rx:-.46, x:cx, y:7.5, z:-2.1, fy:10, s:2.7, d:.34, map:solT, r:.24, m:.5 });
  chimney(cx+1.8, -1.3, 9.15, .6, 1.3, 2.1);
  chimney(cx-1.8, -1.7, 8.8, .52, 1.05, 2.18);
  add(new B(bw+1.7,.16,.16), 0x1a2022, { x:cx, y:6.28, z:4.42, fy:10, s:1.82, d:.3, r:.55, m:.2 });
  add(new B(.13,5.2,.13), 0x1a2022, { x:cx+bw/2+.16, y:3.95, z:3.5, fy:-3, s:2.06, d:.28, r:.55, m:.2 });
  add(new B(1.9,5.32,.24), 0xffffff, { x:cx-bw/2+1.1, y:3.94, z:3.63, fz:2.4, s:1.3, d:.3, map:pnT, r:.66 });
  add(new B(.24,5.32,2), 0xffffff, { x:cx+bw/2+.02, y:3.94, z:1.5, fx:2.4, s:1.34, d:.3, map:pnT, r:.66 });
  winZ(cx-bw/2+1.1, 5.05, 3.72, 1.15, 1.7, 2.2, 1);
  winZ(cx-bw/2+1.1, 2.5, 3.72, 1.15, 1.5, 2.26, 1);
  winX(cx+bw/2+.14, 5.0, 1.5, 1.45, 1.8, 2.34, 1);
  winX(cx+bw/2+.14, 2.6, -1.4, 1.2, 1.35, 2.38, 0);
  winZ(cx, 2.6, -3.28, 1.3, 1.4, 2.42, 0);
  // cross gable bay
  add(new B(3.6,6.3,1.6), 0xffffff, { x:cx+1.6, y:3.45, z:4.4, fz:3, s:1.06, d:.44, map:stT, r:.93, tint:WHT });
  add(new B(3.72,.16,1.72), 0xe8e4dc, { x:cx+1.6, y:3.6, z:4.4, fz:3, s:1.46, d:.32, r:.9 });
  quoin(cx-.2, 5.15, .3, 6.3, 1.26); quoin(cx+3.4, 5.15, .3, 6.3, 1.3);
  add(gable(2.05,2.6,1.55), 0xffffff, { x:cx+1.6, y:6.6, z:2.8, fy:9, s:1.8, d:.46, map:tileM, bump:bumpT, bs:.09, r:.74, m:.04, tint:0x757b78, ds:1 });
  add(new B(4.4,.28,.24), 0x131719, { x:cx+1.6, y:6.5, z:5.4, fy:9, s:1.86, d:.34, r:.62, m:.12 });
  add(new B(4.1,.18,.5), 0xffffff, { x:cx+1.6, y:6.62, z:5.62, fy:9, s:1.9, d:.3, map:woodT, r:.85, tint:0xd8b98a });
  add(new B(.16,.4,5.4), FRM, { x:cx+1.6, y:8.1, z:2.8, fy:9, s:1.94, d:.3, r:.6, m:.14 });
  winZ(cx+1.6, 4.9, 5.22, 2, 2.2, 2.3, 1);
  winZ(cx+1.6, 2.5, 5.22, 1.7, 1.5, 2.36, 1);

  /* ------------------------------------------------------------- entrance -- */
  add(new B(1.5,2.32,.24), 0xffffff, { x:.4, y:2.64, z:2.46, fz:2.4, s:1.38, d:.3, map:pnT, r:.66 });
  add(new B(1.34,2.5,.3), FRM, { x:.4, y:1.5, z:2.56, fy:-2.6, s:2.36, d:.24, r:.34, m:.5 });
  for (let i = 0; i < 7; i++) add(new B(1.08,.15,.1), 0x3f4c54, { x:.4, y:.58+i*.3, z:2.7, fy:-2.6, s:2.38+i*.01, d:.2, r:.4, m:.6 });
  add(new B(.16,.36,.14), 0x22282c, { x:-.6, y:2.35, z:2.62, fz:1.6, s:2.62, d:.22, r:.5, m:.4 });
  add(new B(.12,.26,.1), 0xfff0d0, { x:-.6, y:2.35, z:2.7, fz:1.6, s:2.64, d:.22, r:.3, emi:0xffdca8, ei:.55 });
  add(new B(.16,.36,.14), 0x22282c, { x:1.4, y:2.35, z:2.62, fz:1.6, s:2.62, d:.22, r:.5, m:.4 });
  add(new B(.12,.26,.1), 0xfff0d0, { x:1.4, y:2.35, z:2.7, fz:1.6, s:2.64, d:.22, r:.3, emi:0xffdca8, ei:.55 });
  winZ(-2.4, 2.55, 2.5, 1, 1.2, 2.28, 0);
  winZ(-5.4, 2.55, 2.5, .9, 1.1, 2.32, 0);
  add(new B(3.1,.17,1.5), 0xdedad2, { x:.4, y:.36, z:3.5, fy:-1.5, s:1.4, d:.26, r:.95 });
  add(new B(3.5,.17,1.4), 0xd6d2ca, { x:.4, y:.19, z:4.3, fy:-1.5, s:1.42, d:.26, r:.95 });
  add(new B(6.6,.14,.14), BRAND, { x:-3.7, y:3.32, z:4.72, fy:10, s:1.96, d:.26, r:.45 });

  /* ------------------------------------------------- fence, gate, garage --- */
  const fxs = [-11.5,-7.9,-4.3,-0.7,6.5,10.1,13.7];
  fxs.forEach((fxv, i) => add(new B(2.9,1.7,.13), 0xffffff, { x:fxv, y:1.15, z:9, fy:-2.2, s:1.48+i*.04, d:.24, map:fnT, r:.68, m:.3 }));
  for (let i = 0; i < 9; i++) {
    add(new B(.44,2.15,.44), 0xd4d1ca, { x:-13.3+i*3.6, y:1.35, z:9, fy:-2.2, s:1.46+i*.04, d:.24, map:stT, r:.95 });
    add(new B(.58,.14,.58), 0xc1beb7, { x:-13.3+i*3.6, y:2.5, z:9, fy:-2.2, s:1.48+i*.04, d:.2 });
  }
  add(new B(3.5,1.86,.14), 0xffffff, { x:2.9, y:1.06, z:9, fx:-3, s:2.66, d:.36, map:gateT, r:.55, m:.42 });
  add(new B(3.6,.12,.2), 0x323940, { x:2.9, y:2.05, z:9, fx:-3, s:2.7, d:.3, r:.5, m:.45 });
  add(new B(2.3,.95,4.5), 0x30373d, { x:-7.6, y:.62, z:1.4, fy:-2, s:2.56, d:.3, r:.42, m:.45 });
  add(new B(2.1,.75,2.3), 0x282e33, { x:-7.6, y:1.42, z:.75, fy:-2, s:2.58, d:.3, r:.25, m:.55 });

  /* ------------------------------------------------------------ animation -- */
  const BUILD_END = 4.3, HOLD = 2.1;
  const PHASES = [[0,'Proiect',BLUE],[.5,'Fundație',0x8a94a0],[.85,'Pereți',0x8a94a0],
                  [1.7,'Acoperiș',0x8a94a0],[2.3,'Finisaje',0x8a94a0],[3.5,'RapidConstruct',BRAND]];
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
    const rd = lp(20,35,c), hy = lp(2.4,15,c), an = -.78 + c*.66;
    return { position: [Math.sin(an)*rd, hy, Math.cos(an)*rd], lookAt: [-.5, lp(2.4,3.3,c), .5] };
  }
  function update(t) {
    const e0 = eo(cl(t/.6, 0, 1));
    ground.material.opacity = e0; hillM.opacity = e0 * .95;
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
