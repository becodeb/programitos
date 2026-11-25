/* =========================================================
   Programitos — 🏁 Carrera: generador de rondas (puro, sin DOM)
   Tablero de 9x5: la columna del medio es agua y los dos carriles
   (Tito a la izquierda, Lula a la derecha) son espejo exacto.
   5 rondas que van subiendo; siempre se pueden resolver dentro
   del máximo con las herramientas que se muestran
   (lo prueba tools/check-race.mjs con un RNG con semilla).
   ========================================================= */
(function (root) {
  'use strict';
  const COLS = 9, ROWS = 5, LANE = 4, ROUNDS = 5, STAR_ROUND = 3;
  const D = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] };
  const rngFrom = seed => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const pickOf = (rnd, list) => list[Math.floor(rnd() * list.length)];
  // dificultad por ronda: largo del camino y cantidad de árboles
  const PATH = { 1: [3, 4], 2: [4, 5], 3: [4, 6], 4: [5, 7], 5: [6, 8] };
  const TREES = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 };
  const hasRep = (grade, round) => grade === 2 || round >= 4;
  const toolsFor = (grade, round) => ['u', 'd', 'l', 'r'].concat(hasRep(grade, round) ? ['rep'] : []);

  const key = (x, y) => x + ',' + y;
  // Todos los caminos más cortos de a a b dentro del carril (hasta cap), como cadenas de u/d/l/r
  function shortest(open, a, b, cap) {
    const dist = new Map([[key(b.x, b.y), 0]]), q = [b];
    while (q.length) {
      const c = q.shift();
      for (const [dx, dy] of Object.values(D)) {
        const nx = c.x + dx, ny = c.y + dy, k = key(nx, ny);
        if (!open(nx, ny) || dist.has(k)) continue;
        dist.set(k, dist.get(key(c.x, c.y)) + 1); q.push({ x: nx, y: ny });
      }
    }
    if (!dist.has(key(a.x, a.y))) return null;
    const out = [];
    (function dfs(x, y, acc) {
      if (out.length >= cap) return;
      if (x === b.x && y === b.y) { out.push(acc); return; }
      const d0 = dist.get(key(x, y));
      for (const [m, [dx, dy]] of Object.entries(D)) {
        const nx = x + dx, ny = y + dy;
        if (dist.get(key(nx, ny)) === d0 - 1) dfs(nx, ny, acc + m);
      }
    })(a.x, a.y, '');
    return out;
  }
  // Programa más corto en bloques para una lista de pasos: repetir de 1 a 3 bloques adentro, de 2 a 9 veces
  function compress(moves, allowRep) {
    const n = moves.length, best = Array(n + 1).fill(null);
    best[n] = { cost: 0, text: '' };
    for (let i = n - 1; i >= 0; i--) {
      let b = { cost: 1 + best[i + 1].cost, text: moves[i] + best[i + 1].text };
      if (allowRep) for (let len = 1; len <= 3; len++) {
        const body = moves.slice(i, i + len);
        if (body.length < len) break;
        for (let k = 2; k <= 9; k++) {
          if (moves.slice(i + (k - 1) * len, i + k * len) !== body || i + k * len > n) break;
          const rest = best[i + k * len], cost = 1 + len + rest.cost;
          if (cost < b.cost) b = { cost, text: k + '(' + body + ')' + rest.text };
        }
      }
      best[i] = b;
    }
    return best[0];
  }
  const swapLR = s => s.replace(/[lr]/g, c => (c === 'l' ? 'r' : 'l'));
  const MIRROR = { A: 'B', B: 'A', a: 'b', b: 'a' };

  // Una ronda: { map (5 filas de 9), tools, max, sol: { A, B }, star, round, L (nivel para el motor) }
  function round(grade, n, rnd) {
    rnd = rnd || Math.random;
    const trees = TREES[n], [lo, hi] = PATH[n], star = n === STAR_ROUND, rep = hasRep(grade, n);
    for (let attempt = 0; attempt < 5000; attempt++) {
      const cell = () => ({ x: Math.floor(rnd() * LANE), y: Math.floor(rnd() * ROWS) });
      const s = cell(), h = cell(), st = star ? cell() : null, blocked = new Set();
      const taken = () => [s, h].concat(st ? [st] : []);
      if (taken().some((c, i, a) => a.findIndex(o => o.x === c.x && o.y === c.y) !== i)) continue;
      let guard = 0;
      while (blocked.size < trees && guard++ < 50) { const c = cell(); if (!taken().some(t => t.x === c.x && t.y === c.y)) blocked.add(key(c.x, c.y)); }
      if (blocked.size < trees) continue;
      const open = (x, y) => x >= 0 && x < LANE && y >= 0 && y < ROWS && !blocked.has(key(x, y));
      const legs = st ? [[s, st], [st, h]] : [[s, h]], parts = [];
      for (const [a, b] of legs) { const p = shortest(open, a, b, 400); if (!p) break; parts.push(p); }
      if (parts.length !== legs.length) continue;
      // El camino con menos bloques (así el repetir sirve); desempata el azar
      let best = null;
      const combos = st ? parts[0].flatMap(a => parts[1].map(b => a + b)) : parts[0];
      for (const c of combos) { const cp = compress(c, rep); if (!best || cp.cost < best.cp.cost || (cp.cost === best.cp.cost && rnd() < .35)) best = { moves: c, cp }; }
      const len = best.moves.length;
      if (len < lo || len > hi + (star ? 2 : 0)) continue;
      const max = rep ? Math.min(12, best.cp.cost + 2) : Math.min(12, len + 2);
      if (!rep && best.moves.length > max) continue;
      // Mapa: izquierda = carril de Tito; derecha = espejo (Lula)
      const rows = [];
      for (let y = 0; y < ROWS; y++) {
        let left = '';
        for (let x = 0; x < LANE; x++) {
          left += blocked.has(key(x, y)) ? '#' : (s.x === x && s.y === y) ? 'A' : (h.x === x && h.y === y) ? 'a' : (st && st.x === x && st.y === y) ? '*' : '.';
        }
        rows.push(left + '~' + left.split('').reverse().map(c => MIRROR[c] || c).join(''));
      }
      const solA = best.cp.text, solB = swapLR(solA), tools = toolsFor(grade, n);
      const L = { race: true, name: 'Carrera ' + n, text: '🏁', say: '¡A correr! El primero en llegar a su casita gana más monedas.', tools, max, first: 'A', need: !!st, map: rows };
      return { map: rows, tools, max, sol: { A: solA, B: solB }, star: !!st, round: n, L };
    }
    throw new Error('no se pudo generar la ronda ' + n);
  }
  root.Race = { COLS, ROWS, LANE, ROUNDS, STAR_ROUND, round, compress, toolsFor, hasRep, rngFrom, swapLR };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.Race;
})(typeof window !== 'undefined' ? window : globalThis);
