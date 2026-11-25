/* =========================================================
   Programitos — motor del juego (puro, sin DOM)
   Funciona en el navegador (window.Engine) y en node (require).
   Interpreta el programa de cada chico con un generador que va
   "soltando" eventos; game.js los anima y tools/check-levels.mjs
   los usa para probar todos los niveles sin abrir el navegador.
   Las condiciones (si-estrella, si-fantasma, hasta-la-casita) se
   miran en el momento, sobre el mundo compartido por los dos.
   ========================================================= */
(function (root) {
  'use strict';
  const DIRS = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] };
  const MAX_ITER = 20;                      // más vueltas que esto en un "hasta la casita" = se marea

  /* ---------- Programas ---------- */
  // "rrd" = tres flechas | "3(rd)" = repetir 3 veces | "h(rd)" = repetir hasta la casita
  function parse(s) {
    const out = []; let i = 0;
    while (s && i < s.length) {
      const c = s[i];
      if (/\d/.test(c) || (c === 'h' && s[i + 1] === '(')) {
        const j = s.indexOf(')', i), body = s.slice(i + 2, j).split('');
        out.push(c === 'h' ? { t: 'rep', u: true, n: 2, body, open: false } : { t: 'rep', n: +c, body, open: false });
        i = j + 1;
      } else { out.push({ t: 'm', d: c }); i++; }
    }
    return out;
  }
  const count = prog => prog.reduce((s, it) => s + (it.t === 'rep' ? 1 + it.body.length : 1), 0);
  // Lista plana (el "until" se cuenta una sola vez): sirve para la pista y para saber hacia dónde mira
  function flatten(prog) {
    const out = [];
    prog.forEach((it, i) => {
      if (it.t === 'm') out.push({ d: it.d, i });
      else for (let k = 0; k < (it.u ? 1 : it.n); k++) it.body.forEach((d, j) => out.push({ d, i, j, k, n: it.n }));
    });
    return out;
  }

  /* ---------- Mapa ---------- */
  function parseMap(rows) {
    const grid = rows.map(r => r.split(''));
    const m = { rows: grid.length, cols: grid[0].length, grid, start: {}, homes: {}, stars: [], pads: [], gates: [], boxes: [] };
    grid.forEach((row, y) => row.forEach((c, x) => {
      if (c === 'A' || c === 'B') m.start[c] = { x, y };
      if (c === 'a' || c === 'b') m.homes[c.toUpperCase()] = { x, y };
      if (c === '*') m.stars.push({ x, y });
      if (c === 'o') m.pads.push({ x, y });
      if (c === 'D') m.gates.push({ x, y });
      if (c === '?') m.boxes.push({ x, y });
    }));
    return m;
  }
  const cellAt = (m, x, y) => (y < 0 || y >= m.rows || x < 0 || x >= m.cols) ? null : m.grid[y][x];
  function blocked(m, x, y, gatesOpen) {
    const c = cellAt(m, x, y);
    return c === null || c === '#' || c === 'R' || c === '~' || (c === 'D' && !gatesOpen);
  }

  /* ---------- Variantes (casita que se mueve, cofres sorpresa) ---------- */
  // boxes: 'star' = estrella o nada | 'ghost' = estrella o fantasma | 'dark' = fantasma o nada
  const BOX_KINDS = { star: ['star', 'none'], ghost: ['star', 'ghost'], dark: ['none', 'ghost'] };
  function homeCands(L, m, p) {
    if (L.houses && L.houses[p]) return L.houses[p].map(([x, y]) => ({ x, y }));
    return m.homes[p] ? [m.homes[p]] : [null];
  }
  // Todas las combinaciones posibles de casitas y cofres
  function variants(L) {
    const m = parseMap(L.map);
    let out = [{ homes: {}, boxes: [] }];
    for (const p of ['A', 'B']) out = out.flatMap(v => homeCands(L, m, p).map(h => ({ homes: { ...v.homes, [p]: h }, boxes: v.boxes })));
    const kinds = BOX_KINDS[L.boxes];
    if (kinds) for (let i = 0; i < m.boxes.length; i++) out = out.flatMap(v => kinds.map(c => ({ homes: v.homes, boxes: [...v.boxes, c] })));
    return out;
  }

  /* ---------- Mundo ---------- */
  function world(L, v) {
    const m = parseMap(L.map); v = v || variants(L)[0];
    const tools = L.tools || [];
    const boxes = m.boxes.map((b, i) => ({ x: b.x, y: b.y, what: (v.boxes && v.boxes[i]) || 'none', open: false }));
    return {
      L, m, tools, homes: { A: v.homes && v.homes.A || m.homes.A, B: v.homes && v.homes.B || m.homes.B },
      pos: { A: { ...m.start.A }, B: { ...m.start.B } },
      stars: m.stars.map(s => ({ x: s.x, y: s.y, got: false })), ghosts: [], boxes,
      gatesOpen: false, got: 0,
      total: m.stars.length + boxes.filter(b => b.what === 'star').length,
      auto: !tools.includes('j') && !tools.includes('c')   // sin canasta: las estrellas se juntan al pasar
    };
  }
  const starAt = (w, x, y) => w.stars.find(s => !s.got && s.x === x && s.y === y);
  const ghostAt = (w, x, y) => w.ghosts.find(g => !g.lit && g.x === x && g.y === y);
  function collect(w, s) { s.got = true; w.got++; }

  /* ---------- Ejecución: un generador por chico ---------- */
  // Eventos: op, move, bump, star, cond, light, box, pad, home, fail. Siempre termina con home o fail.
  function* run(w, p, prog, opt) {
    opt = opt || {};
    const me = w.pos[p];
    const fail = reason => ({ e: 'fail', reason });
    function* act(d, st) {
      yield Object.assign({ e: 'op', d }, st);
      if (d === 'j') {                                  // recoger: la estrella tiene que estar abajo
        const s = starAt(w, me.x, me.y);
        if (!s) { yield fail('empty'); return false; }
        collect(w, s); yield { e: 'star', x: me.x, y: me.y, auto: false }; return true;
      }
      if (d === 'c') {                                  // si hay estrella, recoger
        const s = starAt(w, me.x, me.y);
        yield { e: 'cond', c: 'c', yes: !!s };
        if (s) { collect(w, s); yield { e: 'star', x: me.x, y: me.y, auto: false }; }
        return true;
      }
      if (d === 'g') {                                  // si hay fantasma, alumbrar
        const g = ghostAt(w, me.x, me.y);
        yield { e: 'cond', c: 'g', yes: !!g };
        if (g) { g.lit = true; yield { e: 'light', x: me.x, y: me.y }; }
        return true;
      }
      if (ghostAt(w, me.x, me.y)) { yield fail('ghost'); return false; }   // se fue sin alumbrar
      const [dx, dy] = DIRS[d], nx = me.x + dx, ny = me.y + dy;
      if (blocked(w.m, nx, ny, w.gatesOpen)) {
        const c = cellAt(w.m, nx, ny);
        yield { e: 'bump', dir: d };
        yield fail(c === null ? 'edge' : c === '~' ? 'water' : c === 'D' ? 'gate' : 'bump');
        return false;
      }
      me.x = nx; me.y = ny;
      yield { e: 'move', dir: d, x: nx, y: ny };
      const bx = w.boxes.find(b => !b.open && b.x === nx && b.y === ny);
      if (bx) {
        bx.open = true;
        if (bx.what === 'star') w.stars.push({ x: nx, y: ny, got: false });
        else if (bx.what === 'ghost') w.ghosts.push({ x: nx, y: ny, lit: false });
        yield { e: 'box', x: nx, y: ny, what: bx.what };
      }
      if (w.auto) { const s = starAt(w, nx, ny); if (s) { collect(w, s); yield { e: 'star', x: nx, y: ny, auto: true }; } }
      if (!w.gatesOpen && w.m.pads.some(pd => pd.x === nx && pd.y === ny)) { w.gatesOpen = true; yield { e: 'pad' }; }
      return true;
    }
    const atHome = () => { const h = w.homes[p]; return !!h && me.x === h.x && me.y === h.y; };
    for (let i = 0; i < prog.length; i++) {
      const it = prog[i];
      if (it.t === 'm') { if (!(yield* act(it.d, { i }))) return; continue; }
      if (it.u) {
        for (let k = 0; ; k++) {                        // se mira ANTES de cada vuelta
          const yes = atHome();
          yield { e: 'cond', c: 'h', yes, i, k };
          if (yes) break;
          if (k >= MAX_ITER || !it.body.length) { yield fail('loop'); return; }
          for (let j = 0; j < it.body.length; j++) if (!(yield* act(it.body[j], { i, j, k, u: true }))) return;
        }
      } else {
        for (let k = 0; k < it.n; k++) for (let j = 0; j < it.body.length; j++) if (!(yield* act(it.body[j], { i, j, k, n: it.n }))) return;
      }
    }
    if (ghostAt(w, me.x, me.y)) { yield fail('ghost'); return; }
    const t = opt.target || w.homes[p];
    if (!t || me.x !== t.x || me.y !== t.y) { yield fail(opt.target ? 'guess' : 'nohome'); return; }
    yield { e: 'home' };
  }

  const order = L => (L.first || 'A') === 'A' ? ['A', 'B'] : ['B', 'A'];
  const targetOf = (L, p, pick) => { const o = L.opts && pick && L.opts[p][pick[p]]; return o ? { x: o[0], y: o[1] } : null; };
  // Juega el nivel completo sin animar. opt: { pick, onEvent(p, ev) }. Devuelve { ok, reason, p, w }
  function play(L, v, progs, opt) {
    opt = opt || {};
    const w = world(L, v);
    for (const p of order(L)) {
      let bad = null;
      const target = L.mode === 'predict' ? targetOf(L, p, opt.pick) || { x: -1, y: -1 } : null;
      for (const ev of run(w, p, progs[p], { target })) { if (opt.onEvent) opt.onEvent(p, ev); if (ev.e === 'fail') bad = ev.reason; }
      if (bad) return { ok: false, reason: bad, p, w };
    }
    if (L.need && w.total && w.got < w.total) return { ok: false, reason: 'stars', p: 'A', w };
    return { ok: true, w };
  }
  // Variante "pícara": si los programas fallan en alguna, se juega una de esas; si no, cualquiera.
  // Así un programa bien hecho siempre gana y uno "de memoria" no gana de casualidad.
  function pickVariant(L, progs, opt, rnd) {
    const vs = variants(L); rnd = rnd || Math.random;
    if (vs.length < 2) return vs[0];
    const bad = vs.filter(v => !play(L, v, progs, opt).ok);
    const pool = bad.length ? bad : vs;
    return pool[Math.floor(rnd() * pool.length)];
  }

  root.Engine = { DIRS, MAX_ITER, BOX_KINDS, parse, count, flatten, parseMap, cellAt, blocked, variants, world, run, order, targetOf, play, pickVariant };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.Engine;
})(typeof window !== 'undefined' ? window : globalThis);
