/**
 * House model "cu fronton" — the owner-approved house, as a data-driven recipe.
 *
 * Every number in the `combinat` roof path, the walls, the site and the
 * `jaluzele` fence is the EXACT value from the approved scene (the byte-
 * identical port of 2026-07-23) — moved here, not changed. The recipe is
 * split by category so the engine can rebuild one category at a time:
 *
 *   site(k)          — paving, gravel, curb, house pad, car
 *   walls(k, cfg)    — wing + block + bay walls, quoins, columns, windows,
 *                      entrance (cfg.finish reserved for future finishes)
 *   roof(k, cfg)     — cfg.type: 2ape | 4ape | mansarda | combinat;
 *                      material comes from k.roofMat() (resolved by engine)
 *   fence(k, cfg)    — cfg.type: jaluzele | sipca | plin | combinat-piatra
 *
 * Adding a new house model = a new file with these four functions + an entry
 * in `src/scenes/houses/index.js`. No engine changes.
 *
 * Massing reference (shared by several sections):
 *   wing  : centre (-3.7, -0.1), 10.6 × 5.2, roof base 3.8
 *   block : centre ( 5.9,  0.2),  8.2 × 6.8, roof base 6.6, ridge 8.65
 *   bay   : centre ( 7.5,  4.4),  3.6 × 1.6 (the "fronton" cross-gable)
 */

/* -------------------------------------------------------------- site ----- */

function site(k) {
  const { B, add, tex } = k;
  add(new B(26, .26, 17), 0xffffff, { x: -1.5, y: .13, z: 1.5, fy: -2.4, s: .42, d: .4, r: .94, map: tex.pvT });
  add(new B(26.4, .16, .22), 0xcecac2, { x: -1.5, y: .08, z: 10.05, fy: -2, s: .5, d: .3, r: .95 });
  add(new B(7, .22, 15), 0xffffff, { x: 14.5, y: .11, z: 0, fy: -2, s: .46, d: .36, r: 1, map: tex.gravT, tint: 0xd6d0c3 });
  add(new B(26, .2, 5), 0xffffff, { x: -1.5, y: .11, z: -8, fy: -2, s: .48, d: .36, r: 1, map: tex.gravT, tint: 0xd6d0c3 });
  add(new B(19, .28, 10), 0xcdcdc7, { x: -1.6, y: .3, z: 0, fy: -2.4, s: .56, d: .36, r: 1 });
  // car in the carport
  add(new B(2.3, .95, 4.5), 0x30373d, { x: -7.6, y: .62, z: 1.4, fy: -2, s: 2.56, d: .3, r: .42, m: .45 });
  add(new B(2.1, .75, 2.3), 0x282e33, { x: -7.6, y: 1.42, z: .75, fy: -2, s: 2.58, d: .3, r: .25, m: .55 });
}

/* -------------------------------------------------------------- walls ---- */

function walls(k) {
  const { B, add, tex, colors, quoin, winZ, winX } = k;
  const { WHT, STN, FRM } = colors;

  /* wing (left wing with colonnade) */
  add(new B(10.6, 1.05, 5.2), 0xffffff, { x: -3.7, y: .825, z: -.1, fy: -7, s: .86, d: .44, map: tex.stoneLowT, r: .86, tint: STN });
  add(new B(10.72, .13, 5.32), 0xe8e4dc, { x: -3.7, y: 1.415, z: -.1, fy: -7, s: .9, d: .34, r: .9 });
  add(new B(10.6, 2.32, 5.2), 0xffffff, { x: -3.7, y: 2.64, z: -.1, fy: -7, s: .92, d: .44, map: tex.stT, r: .93, tint: WHT });
  quoin(-9.0, 2.5, .3, 3.5, 1.06); quoin(-9.0, -2.7, .3, 3.5, 1.1);
  for (let ci = 0; ci < 4; ci++) {
    const cx = -8.5 + ci * 2.6, st = 1.26 + ci * .05;
    add(new B(.56, 1.15, .56), 0xffffff, { x: cx, y: .875, z: 4.3, fy: -3.6, s: st, d: .28, map: tex.stoneColT, r: .86, tint: STN });
    add(new B(.68, .13, .68), 0xe8e4dc, { x: cx, y: 1.515, z: 4.3, fy: -3.6, s: st + .03, d: .24, r: .9 });
    add(new B(.47, 1.95, .47), 0xffffff, { x: cx, y: 2.555, z: 4.3, fy: -3.6, s: st + .05, d: .26, map: tex.stT, r: .93, tint: WHT });
    add(new B(.62, .12, .62), 0xe8e5dd, { x: cx, y: 3.59, z: 4.3, fy: -3.6, s: st + .07, d: .22, r: .9 });
  }
  add(new B(.13, 3.5, .13), 0x1a2022, { x: -9.5, y: 1.9, z: 2.35, fy: -3, s: 2.02, d: .28, r: .55, m: .2 });
  winX(-9.02, 2.55, 1.2, 1.3, 1.15, 2.6, 0);
  winX(-9.02, 2.55, -1.4, 1, 1.05, 2.62, 0);
  winZ(-6.4, 2.6, -2.72, 1.2, 1.2, 2.64, 0);
  winZ(-1.6, 2.6, -2.72, 1, 1.1, 2.66, 0);

  /* main block */
  const cx = 5.9, bw = 8.2;
  add(new B(bw, .85, 6.8), 0xffffff, { x: cx, y: .725, z: .2, fy: -7, s: .94, d: .46, map: tex.stoneLowT, r: .86, tint: STN });
  add(new B(bw + .12, .13, 6.92), 0xe8e4dc, { x: cx, y: 1.215, z: .2, fy: -7, s: .98, d: .34, r: .9 });
  add(new B(bw, 5.32, 6.8), 0xffffff, { x: cx, y: 3.94, z: .2, fy: -7, s: 1, d: .46, map: tex.stT, r: .93, tint: WHT });
  add(new B(bw + .14, .16, 6.94), 0xe8e4dc, { x: cx, y: 3.6, z: .2, fy: -7, s: 1.44, d: .32, r: .9 }); // string course
  quoin(cx - bw / 2 + .05, 3.55, .3, 6.3, 1.14);
  quoin(cx + bw / 2 - .05, 3.55, .3, 6.3, 1.18);
  quoin(cx + bw / 2 - .05, -3.15, .3, 6.3, 1.22);
  add(new B(.13, 5.2, .13), 0x1a2022, { x: cx + bw / 2 + .16, y: 3.95, z: 3.5, fy: -3, s: 2.06, d: .28, r: .55, m: .2 });
  add(new B(1.9, 5.32, .24), 0xffffff, { x: cx - bw / 2 + 1.1, y: 3.94, z: 3.63, fz: 2.4, s: 1.3, d: .3, map: tex.pnT, r: .66 });
  add(new B(.24, 5.32, 2), 0xffffff, { x: cx + bw / 2 + .02, y: 3.94, z: 1.5, fx: 2.4, s: 1.34, d: .3, map: tex.pnT, r: .66 });
  winZ(cx - bw / 2 + 1.1, 5.05, 3.72, 1.15, 1.7, 2.2, 1);
  winZ(cx - bw / 2 + 1.1, 2.5, 3.72, 1.15, 1.5, 2.26, 1);
  winX(cx + bw / 2 + .14, 5.0, 1.5, 1.45, 1.8, 2.34, 1);
  winX(cx + bw / 2 + .14, 2.6, -1.4, 1.2, 1.35, 2.38, 0);
  winZ(cx, 2.6, -3.28, 1.3, 1.4, 2.42, 0);

  /* cross-gable bay walls (the "fronton") */
  add(new B(3.6, 6.3, 1.6), 0xffffff, { x: cx + 1.6, y: 3.45, z: 4.4, fz: 3, s: 1.06, d: .44, map: tex.stT, r: .93, tint: WHT });
  add(new B(3.72, .16, 1.72), 0xe8e4dc, { x: cx + 1.6, y: 3.6, z: 4.4, fz: 3, s: 1.46, d: .32, r: .9 });
  quoin(cx - .2, 5.15, .3, 6.3, 1.26); quoin(cx + 3.4, 5.15, .3, 6.3, 1.3);
  winZ(cx + 1.6, 4.9, 5.22, 2, 2.2, 2.3, 1);
  winZ(cx + 1.6, 2.5, 5.22, 1.7, 1.5, 2.36, 1);

  /* entrance */
  add(new B(1.5, 2.32, .24), 0xffffff, { x: .4, y: 2.64, z: 2.46, fz: 2.4, s: 1.38, d: .3, map: tex.pnT, r: .66 });
  add(new B(1.34, 2.5, .3), FRM, { x: .4, y: 1.5, z: 2.56, fy: -2.6, s: 2.36, d: .24, r: .34, m: .5 });
  for (let i = 0; i < 7; i++) add(new B(1.08, .15, .1), 0x3f4c54, { x: .4, y: .58 + i * .3, z: 2.7, fy: -2.6, s: 2.38 + i * .01, d: .2, r: .4, m: .6 });
  add(new B(.16, .36, .14), 0x22282c, { x: -.6, y: 2.35, z: 2.62, fz: 1.6, s: 2.62, d: .22, r: .5, m: .4 });
  add(new B(.12, .26, .1), 0xfff0d0, { x: -.6, y: 2.35, z: 2.7, fz: 1.6, s: 2.64, d: .22, r: .3, emi: 0xffdca8, ei: .55 });
  add(new B(.16, .36, .14), 0x22282c, { x: 1.4, y: 2.35, z: 2.62, fz: 1.6, s: 2.62, d: .22, r: .5, m: .4 });
  add(new B(.12, .26, .1), 0xfff0d0, { x: 1.4, y: 2.35, z: 2.7, fz: 1.6, s: 2.64, d: .22, r: .3, emi: 0xffdca8, ei: .55 });
  winZ(-2.4, 2.55, 2.5, 1, 1.2, 2.28, 0);
  winZ(-5.4, 2.55, 2.5, .9, 1.1, 2.32, 0);
  add(new B(3.1, .17, 1.5), 0xdedad2, { x: .4, y: .36, z: 3.5, fy: -1.5, s: 1.4, d: .26, r: .95 });
  add(new B(3.5, .17, 1.4), 0xd6d2ca, { x: .4, y: .19, z: 4.3, fy: -1.5, s: 1.42, d: .26, r: .95 });
}

/* -------------------------------------------------------------- roof ----- */

function roof(k, cfg) {
  const { B, add, tex, colors, hipR, gable, gableX, mansardBand, eave, cap, chimney, dormer, dormerAt } = k;
  const { BRAND, FRM } = colors;
  const rm = k.roofMat();
  /** Roof-surface material opts — the only thing cfg.material changes. */
  const RM = (map, bs) => ({ map, bump: tex.bumpT, bs, r: rm.rough, m: rm.metal, tint: rm.tint });

  const type = cfg.type;
  const cx = 5.9, bw = 8.2, hx = bw / 2 + .75, rx0 = 3.3;

  /* ---- wing roof --------------------------------------------------------- */
  if (type === '2ape') {
    add(gableX(5.95, 4.15, 1.35), 0xffffff, { x: -3.7, y: 3.8, z: .55, fy: 10, s: 1.62, d: .5, ...RM(rm.tileT, .1), ds: 1 });
    eave(-3.7, 3.64, .55, 5.95, 4.15, 1.68, .36);
    cap(-9.65, 5.15, .55, 2.25, 5.15, .55, .15, 1.86, .3);
    cap(-9.65, 5.15, .55, -9.65, 3.8, 4.7, .14, 1.88, .3);
    cap(-9.65, 5.15, .55, -9.65, 3.8, -3.6, .14, 1.9, .3);
    cap(2.25, 5.15, .55, 2.25, 3.8, 4.7, .14, 1.92, .3);
    cap(2.25, 5.15, .55, 2.25, 3.8, -3.6, .14, 1.94, .3);
  } else {
    // hip wing — approved geometry (combinat / 4ape / mansarda)
    add(hipR(5.95, 4.15, 1.35, 2.9), 0xffffff, { x: -3.7, y: 3.8, z: .55, fy: 10, s: 1.62, d: .5, ...RM(rm.tileT, .1) });
    eave(-3.7, 3.64, .55, 5.95, 4.15, 1.68, .36);
    cap(-6.6, 5.15, .55, -.8, 5.15, .55, .15, 1.86, .3);
    cap(-9.65, 3.8, 4.7, -6.6, 5.15, .55, .14, 1.88, .3);
    cap(2.25, 3.8, 4.7, -.8, 5.15, .55, .14, 1.9, .3);
    cap(-9.65, 3.8, -3.6, -6.6, 5.15, .55, .14, 1.92, .3);
    cap(2.25, 3.8, -3.6, -.8, 5.15, .55, .14, 1.94, .3);
    if (type === 'combinat' || type === 'mansarda') {
      dormer(-6.2, 3.8, .55, 4.15, 1.35, .33, 2.4);
      dormer(-1.4, 3.8, .55, 4.15, 1.35, .33, 2.5);
    }
  }
  // wing gutter + brand accent rail — eave line is identical for every type
  add(new B(11.6, .14, .14), 0x1a2022, { x: -3.7, y: 3.46, z: 4.72, fy: 10, s: 1.8, d: .3, r: .55, m: .2 });
  add(new B(6.6, .14, .14), BRAND, { x: -3.7, y: 3.32, z: 4.72, fy: 10, s: 1.96, d: .26, r: .45 });

  /* ---- main block roof --------------------------------------------------- */
  if (type === 'mansarda') {
    // steep lower belt + shallow hip cap; one front dormer clear of the bay
    add(mansardBand(hx, 4.15, 2.95, 2.25, 1.5), 0xffffff, { x: cx, y: 6.6, z: .2, fy: 10, s: 1.7, d: .5, ...RM(rm.tileT, .1) });
    add(hipR(2.95, 2.25, .7, 2.0), 0xffffff, { x: cx, y: 8.1, z: .2, fy: 10, s: 1.78, d: .44, ...RM(rm.tileM, .09) });
    eave(cx, 6.44, .2, hx, 4.15, 1.76, .36);
    cap(cx - 2.0, 8.8, .2, cx + 2.0, 8.8, .2, .16, 1.96, .3);
    cap(cx - hx, 6.6, 4.35, cx - 2.95, 8.1, 2.45, .14, 1.98, .3);
    cap(cx + hx, 6.6, 4.35, cx + 2.95, 8.1, 2.45, .14, 2.0, .3);
    cap(cx - hx, 6.6, -3.95, cx - 2.95, 8.1, -2.05, .14, 2.02, .3);
    cap(cx + hx, 6.6, -3.95, cx + 2.95, 8.1, -2.05, .14, 2.04, .3);
    dormerAt(3.3, 7.23, 3.55, 2.44);
    chimney(cx + 1.8, -1.3, 9.6, .6, 1.9, 2.1);
    chimney(cx - 1.8, -1.7, 9.25, .52, 1.6, 2.18);
  } else if (type === '2ape') {
    add(gableX(hx, 4.15, 2.05), 0xffffff, { x: cx, y: 6.6, z: .2, fy: 10, s: 1.7, d: .5, ...RM(rm.tileT, .1), ds: 1 });
    eave(cx, 6.44, .2, hx, 4.15, 1.76, .36);
    cap(cx - hx, 8.65, .2, cx + hx, 8.65, .2, .16, 1.96, .3);
    cap(cx - hx, 8.65, .2, cx - hx, 6.6, 4.35, .15, 1.98, .3);
    cap(cx - hx, 8.65, .2, cx - hx, 6.6, -3.95, .15, 2.0, .3);
    cap(cx + hx, 8.65, .2, cx + hx, 6.6, 4.35, .15, 2.02, .3);
    cap(cx + hx, 8.65, .2, cx + hx, 6.6, -3.95, .15, 2.04, .3);
    add(new B(4.6, .06, 3), 0xffffff, { rx: -.46, x: cx, y: 7.5, z: -2.1, fy: 10, s: 2.7, d: .34, map: tex.solT, r: .24, m: .5 });
    chimney(cx + 1.8, -1.3, 9.15, .6, 1.3, 2.1);
    chimney(cx - 1.8, -1.7, 8.8, .52, 1.05, 2.18);
  } else {
    // hip — approved geometry (combinat / 4ape)
    add(hipR(hx, 4.15, 2.05, rx0), 0xffffff, { x: cx, y: 6.6, z: .2, fy: 10, s: 1.7, d: .5, ...RM(rm.tileT, .1) });
    eave(cx, 6.44, .2, hx, 4.15, 1.76, .36);
    cap(cx - rx0, 8.65, .2, cx + rx0, 8.65, .2, .16, 1.96, .3);
    cap(cx - hx, 6.6, 4.35, cx - rx0, 8.65, .2, .15, 1.98, .3);
    cap(cx + hx, 6.6, 4.35, cx + rx0, 8.65, .2, .15, 2.0, .3);
    cap(cx - hx, 6.6, -3.95, cx - rx0, 8.65, .2, .15, 2.02, .3);
    cap(cx + hx, 6.6, -3.95, cx + rx0, 8.65, .2, .15, 2.04, .3);
    add(new B(4.6, .06, 3), 0xffffff, { rx: -.46, x: cx, y: 7.5, z: -2.1, fy: 10, s: 2.7, d: .34, map: tex.solT, r: .24, m: .5 });
    chimney(cx + 1.8, -1.3, 9.15, .6, 1.3, 2.1);
    chimney(cx - 1.8, -1.7, 8.8, .52, 1.05, 2.18);
  }
  // block gutter — shared eave line
  add(new B(bw + 1.7, .16, .16), 0x1a2022, { x: cx, y: 6.28, z: 4.42, fy: 10, s: 1.82, d: .3, r: .55, m: .2 });

  /* ---- bay cap ("fronton" keeps its gable; hip families cap it hip) ------ */
  if (type === 'combinat' || type === '2ape') {
    add(gable(2.05, 2.6, 1.55), 0xffffff, { x: cx + 1.6, y: 6.6, z: 2.8, fy: 9, s: 1.8, d: .46, ...RM(rm.tileM, .09), ds: 1 });
    add(new B(4.4, .28, .24), 0x131719, { x: cx + 1.6, y: 6.5, z: 5.4, fy: 9, s: 1.86, d: .34, r: .62, m: .12 });
    add(new B(4.1, .18, .5), 0xffffff, { x: cx + 1.6, y: 6.62, z: 5.62, fy: 9, s: 1.9, d: .3, map: tex.woodT, r: .85, tint: 0xd8b98a });
    add(new B(.16, .4, 5.4), FRM, { x: cx + 1.6, y: 8.1, z: 2.8, fy: 9, s: 1.94, d: .3, r: .6, m: .14 });
  } else {
    const bayHip = hipR(2.6, 2.05, 1.2, 1.55);
    bayHip.rotateY(Math.PI / 2); // ridge along Z — rotate BEFORE translate
    add(bayHip, 0xffffff, { x: cx + 1.6, y: 6.6, z: 2.8, fy: 9, s: 1.8, d: .46, ...RM(rm.tileM, .09) });
    eave(cx + 1.6, 6.5, 2.8, 2.15, 2.7, 1.86, .3);
  }
}

/* -------------------------------------------------------------- fence ---- */

function fence(k, cfg) {
  const { B, add, tex, colors } = k;
  const { STN } = colors;
  const type = cfg.type;
  const fxs = [-11.5, -7.9, -4.3, -0.7, 6.5, 10.1, 13.7];

  /* panels */
  fxs.forEach((fxv, i) => {
    const st = 1.48 + i * .04;
    if (type === 'sipca') {
      add(new B(2.9, 1.7, .09), 0xffffff, { x: fxv, y: 1.15, z: 9, fy: -2.2, s: st, d: .24, map: tex.sipcaT, r: .85 });
      add(new B(2.9, .08, .14), 0xffffff, { x: fxv, y: 2.06, z: 9, fy: -2.2, s: st + .02, d: .2, map: tex.woodT, r: .85, tint: 0xc9a97c });
    } else if (type === 'plin') {
      add(new B(2.9, 1.85, .16), 0xffffff, { x: fxv, y: 1.225, z: 9, fy: -2.2, s: st, d: .24, map: tex.stT, r: .95, tint: 0xe9e6de });
      add(new B(3.02, .09, .26), 0xcfccc4, { x: fxv, y: 2.2, z: 9, fy: -2.2, s: st + .02, d: .2, r: .9 });
    } else if (type === 'combinat-piatra') {
      add(new B(2.9, .55, .2), 0xffffff, { x: fxv, y: .575, z: 9, fy: -2.2, s: st, d: .24, map: tex.stoneLowT, r: .88, tint: STN });
      add(new B(2.9, 1.25, .11), 0xffffff, { x: fxv, y: 1.53, z: 9, fy: -2.2, s: st + .02, d: .22, map: tex.fnT, r: .5, m: .45, tint: 0x9aa1a8 });
    } else {
      // jaluzele — approved
      add(new B(2.9, 1.7, .13), 0xffffff, { x: fxv, y: 1.15, z: 9, fy: -2.2, s: st, d: .24, map: tex.fnT, r: .68, m: .3 });
    }
  });

  /* piers */
  for (let i = 0; i < 9; i++) {
    const px = -13.3 + i * 3.6, st = 1.46 + i * .04;
    if (type === 'combinat-piatra') {
      add(new B(.56, 2.3, .56), 0xffffff, { x: px, y: 1.42, z: 9, fy: -2.2, s: st, d: .24, map: tex.stoneColT, r: .88, tint: STN });
      add(new B(.72, .14, .72), 0xc1beb7, { x: px, y: 2.64, z: 9, fy: -2.2, s: st + .02, d: .2 });
    } else {
      // stucco piers — approved
      add(new B(.44, 2.15, .44), 0xd4d1ca, { x: px, y: 1.35, z: 9, fy: -2.2, s: st, d: .24, map: tex.stT, r: .95 });
      add(new B(.58, .14, .58), 0xc1beb7, { x: px, y: 2.5, z: 9, fy: -2.2, s: st + .02, d: .2 });
    }
  }

  /* gate — shared by every fence type (approved) */
  add(new B(3.5, 1.86, .14), 0xffffff, { x: 2.9, y: 1.06, z: 9, fx: -3, s: 2.66, d: .36, map: tex.gateT, r: .55, m: .42 });
  add(new B(3.6, .12, .2), 0x323940, { x: 2.9, y: 2.05, z: 9, fx: -3, s: 2.7, d: .3, r: .5, m: .45 });
}

export const CU_FRONTON = { id: 'cu-fronton', site, walls, roof, fence };
