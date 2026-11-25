// Prueba el generador de la 🏁 Carrera: 1000 rondas por grado con RNG con semilla.
// Uso: node tools/check-race.mjs
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const Engine = require('../public/js/engine.js');
const Race = require('../public/js/race.js');
const errors = []; let checks = 0;
const ok = (c, m) => { checks++; if (!c && errors.length < 40) errors.push(m); };
const MIRROR = { A: 'B', B: 'A', a: 'b', b: 'a' };
for (const grade of [1, 2]) {
  const rnd = Race.rngFrom(1234 + grade);
  let starRounds = 0, games = 0;
  for (let i = 0; i < 1000; i++) {
    const n = (i % Race.ROUNDS) + 1, r = Race.round(grade, n, rnd), tag = `${grade}° ronda ${n} #${i}`;
    if (n === 1) games++;
    ok(r.map.length === 5 && r.map.every(row => row.length === 9), `${tag}: tablero 9x5`);
    ok(r.map.every(row => row[4] === '~') && r.map.every(row => !row.slice(0, 4).includes('~') && !row.slice(5).includes('~')), `${tag}: agua solo en el medio`);
    ok(r.map.every(row => [...row.slice(0, 4)].every((c, x) => row[8 - x] === (MIRROR[c] || c))), `${tag}: carriles espejo`);
    ok(r.sol.B === Race.swapLR(r.sol.A), `${tag}: soluciones espejo`);
    const stars = r.map.join('').split('*').length - 1;
    ok(r.star === (n === Race.STAR_ROUND) && stars === (r.star ? 2 : 0), `${tag}: estrella solo en la ronda ${Race.STAR_ROUND} (una por carril)`);
    if (r.star) starRounds++;
    ok(!r.tools.includes('j') && !r.tools.includes('c'), `${tag}: sin herramienta de recoger (se junta al pasar)`);
    ok(r.tools.includes('rep') === (grade === 2 || n >= 4), `${tag}: repetir ${grade === 2 ? 'desde la ronda 1' : 'desde la ronda 4'}`);
    if (grade === 1 && n < 4) ok(!/[\d(]/.test(r.sol.A), `${tag}: 1.º usa solo flechas al principio`);
    ok(r.max <= 12 && r.max >= 2, `${tag}: máximo razonable (${r.max})`);
    const pr = { A: Engine.parse(r.sol.A), B: Engine.parse(r.sol.B) };
    ok(Engine.count(pr.A) <= r.max && Engine.count(pr.B) <= r.max, `${tag}: la solución entra en el máximo (${Engine.count(pr.A)} <= ${r.max})`);
    const used = new Set(); for (const it of pr.A) { if (it.t === 'm') used.add(it.d); else { used.add('rep'); it.body.forEach(d => used.add(d)); } }
    ok([...used].every(t => r.tools.includes(t)), `${tag}: la solución usa solo las herramientas mostradas`);
    const res = Engine.play(r.L, null, pr);
    ok(res.ok, `${tag}: la solución gana (${res.reason})`);
    // Ninguno de los dos carriles cruza el agua: el programa de uno nunca lo lleva al carril del otro
    ok(Engine.parseMap(r.map).start.A.x < 4 && Engine.parseMap(r.map).start.B.x > 4, `${tag}: cada uno en su carril`);
  }
  ok(starRounds === games, `${grade}°: una ronda con estrella por carrera (${starRounds}/${games})`);
}
if (errors.length) { console.error('FALLAN (primeras): \n - ' + errors.join('\n - ')); process.exit(1); }
console.log('ok: 2000 rondas, ' + checks + ' comprobaciones de la carrera');
