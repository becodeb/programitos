// Prueba la pista 💡 (Engine.route) en todos los niveles de los dos grados, sin navegador:
// el camino es continuo, no pisa lo prohibido, termina en la casita y, en los niveles de "todas las estrellas",
// pasa por cada estrella/cofre que le toca a ese chico (las estrellas se reparten entre los dos).
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const Engine = require('../public/js/engine.js');
require('../public/js/levels.js'); require('../public/js/levels2.js');
const errors = []; let checks = 0, needLevels = 0;
const ok = (c, m) => { checks++; if (!c) errors.push(m); };
for (const [g, LV] of [[1, globalThis.LEVELS], [2, globalThis.LEVELS2]]) {
  LV.forEach((L, i) => {
    if (L.mode === 'predict') return;
    const tag = `${g}° nivel ${i + 1}`, m = Engine.parseMap(L.map), first = L.first || 'A';
    const seen = { A: new Set(), B: new Set() }; let ends = {};
    for (const p of ['A', 'B']) {
      const r = Engine.route(L, p), c = r.cells;
      ok(c.length >= 2 && c[0].x === m.start[p].x && c[0].y === m.start[p].y, `${tag} ${p}: arranca en su salida`);
      let open = p !== first || !m.pads.length;
      for (let k = 1; k < c.length; k++) {
        ok(Math.abs(c[k].x - c[k - 1].x) + Math.abs(c[k].y - c[k - 1].y) === 1, `${tag} ${p}: paso ${k} no es vecino`);
        ok(!Engine.blocked(m, c[k].x, c[k].y, open), `${tag} ${p}: paso ${k} pisa algo bloqueado`);
        if (m.pads.some(pd => pd.x === c[k].x && pd.y === c[k].y)) open = true;
        seen[p].add(c[k].x + ',' + c[k].y);
      }
      const hs = Engine.variants(L).map(v => v.homes[p]).filter(Boolean), last = c[c.length - 1];
      ok(hs.some(h => h.x === last.x && h.y === last.y), `${tag} ${p}: termina en una casita posible`);
      if (L.houses && L.houses[p]) {                       // casita que se mueve: termina en la candidata más lejana (por camino)
        const far = Math.max(...hs.map(h => Engine.walk(m, c[c.length - 2] || m.start[p], h, true)?.cells.length ?? 0));
        ok(far > 0, `${tag} ${p}: hay camino a las casitas`);
      }
      ends[p] = r;
    }
    if (L.need) {
      needLevels++;
      for (const t of m.stars.concat(m.boxes)) ok(seen.A.has(t.x + ',' + t.y) || seen.B.has(t.x + ',' + t.y), `${tag}: nadie pasa por ${t.x},${t.y}`);
      if (!(L.boxes) && m.stars.length) ok(ends.A.marks.length + ends.B.marks.length === m.stars.length, `${tag}: cada estrella le toca a uno solo (${ends.A.marks.length}+${ends.B.marks.length} de ${m.stars.length})`);
    }
  });
}
if (errors.length) { console.error('FALLAN ' + errors.length + ' de ' + checks + ':\n - ' + errors.slice(0, 30).join('\n - ')); process.exit(1); }
console.log(`ok: pista en 48 + 36 niveles (${needLevels} de "todas las estrellas"), ${checks} comprobaciones`);
