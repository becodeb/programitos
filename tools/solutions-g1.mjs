// Soluciones guardadas de los 48 niveles de 1.er grado (mismo orden que public/js/levels.js).
// "3(rd)" = repetir 3 veces; en los niveles 🤔 va la fruta elegida: { pick: { A: n, B: n } }.
// Viven acá y no en levels.js para que el juego no las mande a las compus de los chicos.
export default [
  /* Pradera */
  { A: 'rrr', B: 'rrr' },
  { A: 'rrrr', B: 'llll' },
  { A: 'rrrrr', B: 'lllll' },
  { A: 'uuuu', B: 'dddd' },
  { pick: { A: 1, B: 1 } },
  { A: 'rrrr', B: 'llll' },
  /* Playa */
  { A: 'rrddl', B: 'rrdd' },
  { A: 'dddrr', B: 'dddll' },
  { pick: { A: 2, B: 0 } },
  { A: 'rddrddl', B: 'lddlddr' },
  { A: 'rrdd', B: 'lldd' },
  { A: 'rrruuuurrr', B: 'llluuuulll' },
  /* Nieve */
  { A: 'ddrr', B: 'rrdd' },
  { A: 'rrddll', B: 'uull' },
  { pick: { A: 2, B: 1 } },
  { A: 'rddrllddrr', B: 'lldddd' },
  { A: 'ddrruu', B: 'rrdd' },
  { A: 'uurruull', B: 'lrddddll' },
  /* Espacio */
  { A: '6(r)', B: '6(l)' },
  { A: '4(d)', B: '4(u)' },
  { A: '3(rd)', B: '3(ul)' },
  { pick: { A: 1, B: 2 } },
  { A: 'd5(r)u', B: 'u5(l)d' },
  { A: '3(rd)r', B: '4(d)3(l)' },
  /* Arroyo */
  { A: 'rjr', B: 'ljl' },
  { A: 'rjrrjr', B: 'ljlljl' },
  { A: 'rujdr', B: 'ldjul' },
  { A: 'rjrjrjr', B: 'ljljljl' },
  { A: 'rjdrrur', B: 'ljdllul' },
  { A: 'rjrrr', B: 'ddljr' },
  /* Laguna */
  { A: '3(rj)r', B: '3(lj)l' },
  { A: '2(rrj)r', B: '2(llj)l' },
  { A: '3(dj)d', B: '3(dj)d' },
  { A: '3(rj)2(r)', B: 'dd' },
  { A: '2(rdj)rd', B: '2(ldj)d' },
  { A: '4(rj)r', B: '4(lj)l' },
  /* Bosque */
  { A: 'urjdrjr', B: 'ldjuljl' },
  { A: 'rjurrdjr', B: 'ljdllujl' },
  { A: 'rrrrjll', B: 'lllljrr' },
  { A: 'rjurjrrd', B: 'ljdljllu' },
  { A: 'ujrrrrjd', B: 'djllllju' },
  { A: 'rjrrrjr', B: 'ddjlljl' },
  /* Montaña */
  { A: '3(uj)u', B: '3(uj)u' },
  { A: '5(rj)r', B: '5(lj)l' },
  { A: 'rj2(rrj)r', B: 'lj2(llj)l' },
  { A: '2(rj)r2(rj)r', B: '2(lj)l2(lj)l' },
  { A: '3(rj)2(r)', B: '2(d)2(l)4(jl)' },
  { A: 'uj4(rj)dr', B: 'dj4(lj)ul' }
];
