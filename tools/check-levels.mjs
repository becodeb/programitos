// Prueba todos los niveles de los dos grados con las soluciones guardadas, sin navegador.
// Uso: node tools/check-levels.mjs [--print-par]
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const Engine = require('../public/js/engine.js');
require('../public/js/levels.js');
require('../public/js/levels2.js');
const { default: SOL1 } = await import('./solutions-g1.mjs');
const { default: SOL2 } = await import('./solutions-g2.mjs');

const REP_BODY_MAX = 3;
const errors = [];
let checks = 0;
const bad = (tag, msg) => errors.push(`${tag}: ${msg}`);
const ok = (cond, tag, msg) => { checks++; if (!cond) bad(tag, msg); return cond; };

const progs = sol => ({ A: Engine.parse(sol.A), B: Engine.parse(sol.B) });
function used(prog) {
  const s = new Set();
  for (const it of prog) {
    if (it.t === 'm') s.add(it.d);
    else { s.add(it.u ? 'h' : 'rep'); it.body.forEach(d => s.add(d)); }
  }
  return s;
}
// Lo que hizo el programa en esta variante, como lista fija de pasos (sin condiciones ni repetir)
function trace(L, v, pr) {
  const flat = { A: [], B: [] };
  Engine.play(L, v, pr, {
    onEvent(p, ev) {
      if (ev.e === 'move') flat[p].push({ t: 'm', d: ev.dir });
      if (ev.e === 'star' && !ev.auto) flat[p].push({ t: 'm', d: 'j' });
    }
  });
  return flat;
}
// ¿Hay un camino de la salida a la casita que no pase por esta casilla?
function avoids(m, from, to, cell) {
  const seen = new Set([from.x + ',' + from.y]), q = [from];
  while (q.length) {
    const c = q.shift();
    if (c.x === to.x && c.y === to.y) return true;
    for (const [dx, dy] of Object.values(Engine.DIRS)) {
      const x = c.x + dx, y = c.y + dy, k = x + ',' + y, ch = Engine.cellAt(m, x, y);
      if (seen.has(k) || ch === null || ch === '#' || ch === 'R' || ch === '~' || (x === cell.x && y === cell.y)) continue;
      seen.add(k); q.push({ x, y });
    }
  }
  return false;
}
// Por qué un programa "de memoria" (sin las condiciones nuevas) no puede ganar todas las variantes.
// Es un argumento, no una búsqueda: los pasos de un programa fijo no dependen de la variante, solo su resultado.
function whyNeedsCondition(L, vs) {
  const m = Engine.parseMap(L.map), why = [];
  for (const p of ['A', 'B']) {
    const pos = new Set(vs.map(v => v.homes[p] && v.homes[p].x + ',' + v.homes[p].y));
    if (pos.size > 1) why.push(`la casita de ${p} cambia de lugar`);   // un recorrido fijo termina siempre en el mismo lugar
  }
  const w = Engine.world(L, vs[0]);
  if (L.boxes === 'star' && L.need && (L.tools.includes('j') || L.tools.includes('c'))) why.push('cofres con estrella o nada (juntar a ciegas falla)');
  if (L.boxes === 'ghost' && L.need) why.push('cofres con estrella o fantasma (sin alumbrar falla)');
  if (L.boxes === 'dark') {
    for (const p of ['A', 'B']) {
      const home = w.homes[p];
      if (home && m.boxes.some(b => !avoids(m, m.start[p], home, b))) { why.push(`cofre oscuro obligatorio para ${p}`); break; }
    }
  }
  return why;
}

function checkGrade(name, LV, WD, SOL, g2) {
  ok(LV.length === WD.length * 6, name, `${LV.length} niveles para ${WD.length} mundos`);
  ok(SOL.length === LV.length, name, `${SOL.length} soluciones para ${LV.length} niveles`);
  const pars = [];
  LV.forEach((L, i) => {
    const tag = `${name} nivel ${i + 1} (${L.name})`;
    const sol = SOL[i]; if (!ok(sol, tag, 'sin solución guardada')) return;
    ok(L.name && L.text && L.say, tag, 'faltan name/text/say');
    const vs = Engine.variants(L);
    if (L.mode === 'predict') {
      ok(sol.pick, tag, 'predict sin pick');
      ok(!L.par, tag, 'un nivel de adivinar no lleva 💎');
      const pre = progs(L.pre);
      for (const p of ['A', 'B']) {
        const w = Engine.world(L, vs[0]);
        for (const ev of Engine.run(w, p, pre[p], { target: { x: -1, y: -1 } })) if (ev.e === 'bump') bad(tag, `el programa de ${p} se choca`);
        const end = w.pos[p];
        const hits = L.opts[p].map((o, k) => (o[0] === end.x && o[1] === end.y) ? k : -1).filter(k => k >= 0);
        ok(hits.length === 1, tag, `${p}: ${hits.length} frutas correctas (tiene que haber 1)`);
        ok(hits[0] === sol.pick[p], tag, `${p}: el pick guardado (${sol.pick[p]}) no es el correcto (${hits[0]})`);
        const cells = new Set(L.opts[p].map(o => o.join()));
        ok(cells.size === L.opts[p].length, tag, `${p}: dos frutas en la misma casilla`);
      }
      ok(Engine.play(L, vs[0], pre, { pick: sol.pick }).ok, tag, 'con las frutas correctas no gana');
      return;
    }
    const pr = progs(sol);
    pars.push({ A: Engine.count(pr.A), B: Engine.count(pr.B) });
    for (const p of ['A', 'B']) {
      const n = Engine.count(pr[p]);
      ok(n <= L.max, tag, `${p} usa ${n} bloques (máx ${L.max})`);
      const u = used(pr[p]);
      for (const t of u) ok(L.tools.includes(t), tag, `${p} usa "${t}" y el nivel no lo permite`);
      pr[p].forEach(it => { if (it.t === 'rep') { ok(it.body.length >= 1 && it.body.length <= REP_BODY_MAX, tag, `${p}: cuerpo de repetir de ${it.body.length}`); if (!it.u) ok(it.n >= 2 && it.n <= 9, tag, `${p}: repetir ${it.n} veces`); } });
    }
    // 1) la solución gana en TODAS las variantes
    let all = true;
    for (const v of vs) { const r = Engine.play(L, v, pr); if (!r.ok) { all = false; bad(tag, `la solución falla (${r.reason}, ${r.p}) en una variante ${JSON.stringify(v)}`); break; } }
    checks++;
    // 2) estrellas: si hay need se juntaron todas (ya lo mira play); y las dos llegaron a su casita (idem)
    // 3) bichitos: el programa armado tiene que fallar
    if (L.pre) {
      const pre = progs(L.pre);
      // con variantes basta que falle en alguna: la variante pícara se la va a elegir siempre
      ok(vs.some(v => !Engine.play(L, v, pre).ok) && !Engine.play(L, Engine.pickVariant(L, pre, {}, () => 0), pre).ok, tag, 'el programa con el bichito GANA');
      if (g2) for (const p of ['A', 'B']) {
        const mix = { A: pr.A, B: pr.B, [p]: pre[p] };
        ok(vs.some(v => !Engine.play(L, v, mix).ok), tag, `el bichito de ${p} no hace fallar`);
      }
    }
    // 4) casitas que se mueven y cofres: no se puede ganar "de memoria"
    const uses = ['h', 'c', 'g'].filter(t => L.tools.includes(t));
    if (g2 && uses.length) ok(vs.length > 1, tag, `usa ${uses} pero no tiene variantes`);
    if (vs.length > 1) {
      const why = whyNeedsCondition(L, vs);
      ok(why.length > 0, tag, 'no se puede argumentar que haga falta la condición');
      if (all) {
        let escapes = 0;
        for (const v of vs) {
          const fixed = trace(L, v, pr);
          if (vs.every(v2 => Engine.play(L, v2, fixed).ok)) escapes++;
          const pick = Engine.pickVariant(L, fixed, {}, () => 0);
          if (Engine.play(L, pick, fixed).ok) escapes++;
        }
        ok(escapes === 0, tag, `un programa fijo (copia de la solución) gana todas las variantes (${escapes})`);
      }
      L._why = why;
    } else if (g2 && i >= 12) bad(tag, 'los mundos 3 a 6 tienen que tener variantes');
    if (g2) {
      ok(L.par && L.par.A === pars[pars.length - 1].A && L.par.B === pars[pars.length - 1].B, tag, `par ${JSON.stringify(L.par)} != solución ${JSON.stringify(pars[pars.length - 1])}`);
      if (L.par) ok(L.max >= Math.max(L.par.A, L.par.B), tag, 'max menor que par');
      if (L.map.some(r => r.includes('o'))) ok(L.first, tag, 'con botón rojo falta "first"');
    }
  });
  return pars;
}

const L1 = globalThis.LEVELS, W1 = globalThis.WORLDS, L2 = globalThis.LEVELS2, W2 = globalThis.WORLDS2;
checkGrade('1°', L1, W1, SOL1, false);
const pars2 = checkGrade('2°', L2, W2, SOL2, true);

// Datos del 2.º grado que el juego necesita 1 por nivel / mundo
const st = globalThis.STICKERS2;
ok(st.length === L2.length && new Set(st).size === st.length, '2°', 'las figuritas tienen que ser 36 y distintas');
ok(globalThis.THEMES2.length === W2.length && globalThis.THEMES2.every(t => t.trees.length === 5 && t.deco.length === 5), '2°', 'un tema de 5+5 por mundo');
ok(!st.includes('💎'), '2°', '💎 es el premio, no una figurita');

if (process.argv.includes('--verbose')) L2.forEach((L, i) => console.log(i + 1, L.name, Engine.variants(L).length + ' variantes', (L._why || []).join('; ')));
if (process.argv.includes('--print-par')) console.log(JSON.stringify(pars2));
const vcount = L2.filter(L => Engine.variants(L).length > 1).length;
if (errors.length) { console.error(errors.map(e => '✖ ' + e).join('\n')); console.error(`\n${errors.length} problema(s), ${checks} comprobaciones`); process.exit(1); }
console.log(`ok: ${L1.length} niveles de 1° y ${L2.length} de 2° (${vcount} con variantes), ${checks} comprobaciones`);
