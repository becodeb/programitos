// Soluciones guardadas de los 36 niveles de 2.º grado (mismo orden que public/js/levels2.js).
// "3(rd)" = repetir 3 veces | "h(rd)" = repetir hasta la casita | c = si hay estrella, recoger | g = si hay fantasma, alumbrar
// Los niveles 🤔 llevan la fruta correcta: { pick: { A: n, B: n } }. `par` de levels2.js sale de contar estos bloques.
export default [
  /* Parque */
  { A: '6(r)', B: '6(l)' },
  { A: '6(d)', B: '6(u)' },
  { A: '4(rd)', B: '4(ld)' },
  { pick: { A: 1, B: 2 } },
  { A: '3(dj)d', B: '3(dj)d' },
  { A: '3(rrj)3(d)', B: '3(llj)3(u)' },
  /* Ciudad */
  { A: '3(rrd)', B: '3(lld)' },
  { A: '2(d)5(r)', B: 'd6(l)' },
  { A: '4(rd)2(r)', B: '4(ld)2(l)' },
  { pick: { A: 2, B: 1 } },
  { A: '2(rd)2(d)', B: '2(ld)2(d)' },
  { A: '3(rdj)d', B: '3(luj)u' },
  /* Noche */
  { A: 'h(r)', B: 'h(l)' },
  { A: 'h(d)', B: 'h(u)' },
  { A: 'h(rd)', B: 'h(ld)' },
  { A: 'h(r)', B: 'h(l)' },
  { A: '2(r)h(r)', B: 'dh(l)' },
  { A: 'h(rrd)', B: 'h(lld)' },
  /* Castillo */
  { A: 'rcr', B: 'lcl' },
  { A: '3(rc)r', B: '3(dc)d' },
  { A: '3(rdc)d', B: '3(luc)u' },
  { A: '3(ldc)d', B: '3(ruc)u' },
  { A: '2(dc)3(d)', B: '2(uc)4(u)' },
  { A: '3(ruc)ur', B: '3(ldc)d' },
  /* Mansión */
  { A: '2(r)g4(r)', B: '2(l)g4(l)' },
  { A: '3(dg)3(d)', B: '2(ddg)2(d)' },
  { A: '3(rcg)r', B: '3(dcg)d' },
  { A: '3(dcg)d', B: '3(dcg)d' },
  { A: '2(rcg)3(r)', B: '2(lcg)4(l)' },
  { A: '3(rcg)4(d)', B: '2(lcg)3(l)' },
  /* Volcán */
  { A: 'h(rc)', B: 'h(lc)' },
  { A: 'h(rg)', B: 'h(dg)' },
  { A: 'h(rc)', B: 'dh(lc)' },
  { A: 'h(dc)', B: 'h(uc)' },
  { A: 'h(dcg)', B: 'h(ucg)' },
  { A: 'dh(rcg)', B: 'dh(lcg)' }
];
