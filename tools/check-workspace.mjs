// Prueba, sin navegador, las operaciones puras del área de trabajo (public/js/workspace.js):
// levantar, soltar, envolver, límites y que nunca se pierda ni se duplique un bloque.
// Uso: node tools/check-workspace.mjs
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const W = require('../public/js/workspace.js');
const Engine = require('../public/js/engine.js');

let checks = 0; const errors = [];
const ok = (cond, msg) => { checks++; if (!cond) errors.push(msg); return cond; };
const same = (a, b, msg) => ok(JSON.stringify(a) === JSON.stringify(b), `${msg}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`);
const P = Engine.parse;                                   // "rd3(ud)" -> items del motor
const show = items => items.map(it => it.t === 'm' ? it.d : (it.u ? 'h' : it.n) + '(' + it.body.join('') + ')').join('');
const ws = (prog, loose) => ({ prog: P(prog), loose: (loose || []).map(([x, y, s]) => ({ x, y, items: P(s) })) });
const dump = w => show(w.prog) + '|' + w.loose.map(l => show(l.items)).join('|');

/* ---- count: solo cuenta la pila del ▶ ---- */
ok(W.count(P('rd')) === 2 && W.count(P('3(rd)')) === 3 && W.count(P('r3(rd)d')) === 5, 'count suma el repetir y su cuerpo');
{
  const w = ws('rd', [[10, 10, 'uuuu']]);
  ok(W.count(w.prog) === 2, 'las pilas sueltas no cuentan para el máximo');
}

/* ---- take: lo que cuelga hacia abajo ---- */
{
  let r = W.take(P('rdlu'), 1);
  same([show(r.rest), show(r.taken)], ['r', 'dlu'], 'take del medio se lleva lo de abajo');
  r = W.take(P('r2(du)l'), 1);
  same([show(r.rest), show(r.taken)], ['r', '2(du)l'], 'take de un repetir se lleva su cuerpo y lo de abajo');
  r = W.take(P('r3(dul)l'), 1, 1);
  same([show(r.rest), show(r.taken)], ['r3(d)l', 'ul'], 'take adentro de la boca se lleva el resto de la boca, no lo de abajo del repetir');
  ok(W.take(P('rd'), 5) === null && W.take(P('rd'), 0, 0) === null, 'take fuera de rango da null');
  const src = P('3(rd)'); src[0].open = true; W.take(src, 0, 0);
  ok(src[0].open === true && src[0].body.length === 2, 'take no muta el original');
  r = W.take((() => { const x = P('r2(du)'); x[1].open = true; return x; })(), 0);
  ok(r.taken.every(it => !it.open), 'lo que se levanta queda cerrado (open=false)');
}

/* ---- insert / drop sobre la pila del ▶ ---- */
{
  let w = ws('rd');
  let r = W.drop(w, P('u'), { kind: 'after', s: 0, i: 1 }, { max: 5 });
  ok(r.ok && show(r.prog) === 'rud', 'insertar en el medio');
  r = W.drop(w, P('u'), { kind: 'after', s: 0, i: 0 }, { max: 5 });
  ok(r.ok && show(r.prog) === 'urd', 'insertar abajo del ▶');
  r = W.drop(w, P('ul'), { kind: 'after', s: 0, i: 2 }, { max: 5 });
  ok(r.ok && show(r.prog) === 'rdul', 'insertar al final una pila de varios');
  ok(show(w.prog) === 'rd', 'drop no muta el original');
  // máximo del nivel
  r = W.drop(w, P('uld'), { kind: 'after', s: 0, i: 2 }, { max: 4 });
  ok(!r.ok && r.reason === 'max' && r.prog === w.prog, 'sobre el máximo: rechaza y devuelve lo de antes');
  r = W.drop(w, P('ul'), { kind: 'after', s: 0, i: 2 }, { max: 4 });
  ok(r.ok, 'justo en el máximo entra');
  // sin inserción parcial
  r = W.drop(w, P('uld'), { kind: 'after', s: 0, i: 1 }, { max: 4 });
  ok(!r.ok, 'no se mete solo una parte');
  // adentro de una boca
  w = ws('r2(d)l');
  r = W.drop(w, P('u'), { kind: 'body', s: 0, i: 1, j: 0 }, { max: 9 });
  ok(r.ok && show(r.prog) === 'r2(ud)l', 'meter adentro de la boca, arriba');
  r = W.drop(w, P('ul'), { kind: 'body', s: 0, i: 1, j: 1 }, { max: 9 });
  ok(r.ok && show(r.prog) === 'r2(dul)l', 'meter dos adentro de la boca, abajo');
  r = W.drop(w, P('uld'), { kind: 'body', s: 0, i: 1, j: 1 }, { max: 9 });
  ok(!r.ok && r.reason === 'body', 'boca con límite de 3: 1 + 3 no entra');
  w = ws('r3(dul)');
  r = W.drop(w, P('r'), { kind: 'body', s: 0, i: 1, j: 3 }, { max: 9 });
  ok(!r.ok && r.reason === 'body', 'boca llena rechaza');
  // un repetir no entra en la boca de otro repetir
  w = ws('r2(d)');
  r = W.drop(w, P('2()'), { kind: 'body', s: 0, i: 1, j: 0 }, { max: 9 });
  ok(!r.ok && r.reason === 'nest', 'repetir adentro de repetir: no encastra');
  r = W.drop(w, P('ur2(d)'), { kind: 'body', s: 0, i: 1, j: 0 }, { max: 9 });
  ok(!r.ok && r.reason === 'nest', 'una pila que contiene un repetir tampoco entra en una boca');
  ok(!W.spots(w, false).some(t => t.kind === 'body') && W.spots(w).some(t => t.kind === 'body'), 'spots sin bocas cuando se lleva un repetir');
}

/* ---- envolver: un repetir vacío se traga lo que queda abajo ---- */
{
  let w = ws('rdlu');
  let r = W.drop(w, P('2()'), { kind: 'after', s: 0, i: 1 }, { max: 9 });
  ok(r.ok && show(r.prog) === 'r2(dlu)' && r.wrapped === 3, 'envuelve los primeros 3 que entran');
  w = ws('rdluu');
  r = W.drop(w, P('2()'), { kind: 'after', s: 0, i: 0 }, { max: 9 });
  ok(r.ok && show(r.prog) === '2(rdl)uu', 'solo entran 3: el resto queda abajo');
  w = ws('r2(du)ld');
  r = W.drop(w, P('3()'), { kind: 'after', s: 0, i: 0 }, { max: 9 });
  ok(r.ok && show(r.prog) === '3(r)2(du)ld' && r.wrapped === 1, 'envuelve hasta chocar con otro repetir');
  w = ws('2(du)r');
  r = W.drop(w, P('3()'), { kind: 'after', s: 0, i: 0 }, { max: 9 });
  ok(r.ok && show(r.prog) === '3()2(du)r' && !r.wrapped, 'si abajo empieza un repetir no envuelve nada, queda vacío');
  w = ws('rd');
  r = W.drop(w, P('3()'), { kind: 'after', s: 0, i: 2 }, { max: 9 });
  ok(r.ok && show(r.prog) === 'rd3()' && !r.wrapped, 'al final no hay qué envolver');
  w = ws('rdl');
  r = W.drop(w, P('u3()'), { kind: 'after', s: 0, i: 1 }, { max: 9 });
  ok(r.ok && show(r.prog) === 'ru3(dl)', 'una pila que termina en repetir vacío también envuelve');
  r = W.drop(w, P('h()'), { kind: 'after', s: 0, i: 1 }, { max: 9 });
  ok(r.ok && show(r.prog) === 'rh(dl)', 'el hasta-la-casita envuelve igual');
  // envolver respeta el máximo contando el repetir
  w = ws('rdl');
  r = W.drop(w, P('3()'), { kind: 'after', s: 0, i: 0 }, { max: 3 });
  ok(!r.ok && r.reason === 'max', 'envolver suma 1 por el repetir: con max 3 y 3 bloques no entra');
  r = W.drop(w, P('3()'), { kind: 'after', s: 0, i: 0 }, { max: 4 });
  ok(r.ok && W.count(r.prog) === 4, 'envolver con max 4 entra');
  // un repetir con cuerpo no envuelve (se encastra tal cual)
  r = W.drop(ws('rd'), P('2(u)'), { kind: 'after', s: 0, i: 0 }, { max: 9 });
  ok(r.ok && show(r.prog) === '2(u)rd', 'un repetir con cuerpo no envuelve');
}

/* ---- pilas sueltas ---- */
{
  let w = ws('rd', [[20, 30, 'ul']]);
  let r = W.drop(w, P('r'), { kind: 'free', x: 50, y: 60 }, { max: 2 });
  ok(r.ok && r.loose.length === 2 && r.loose[1].x === 50 && show(r.prog) === 'rd', 'soltar lejos: queda suelta, aunque la pila del ▶ esté en el máximo');
  r = W.drop(w, P('3()'), { kind: 'above', s: 1, x: 5, y: 8 }, { max: 2 });
  ok(r.ok && show(r.loose[0].items) === '3(ul)' && r.loose[0].x === 5 && r.loose[0].y === 8, 'encima de una suelta: envuelve y toma la posición dada');
  r = W.drop(w, P('d'), { kind: 'after', s: 1, i: 2 }, { max: 2 });
  ok(r.ok && show(r.loose[0].items) === 'uld', 'abajo de una suelta');
  // levantar de la suelta: si se lleva todo desaparece la pila
  let l = W.lift(w, 1, 0);
  ok(l && l.loose.length === 0 && show(l.taken) === 'ul', 'levantar toda una suelta la quita del área');
  l = W.lift(w, 1, 1);
  ok(l && l.loose.length === 1 && show(l.loose[0].items) === 'u' && show(l.taken) === 'l', 'levantar la parte de abajo deja la de arriba');
  // pegar una suelta a la pila del ▶ cuenta contra el máximo
  r = W.move(w, { s: 1, i: 0 }, { kind: 'after', s: 0, i: 2 }, { max: 3 });
  ok(!r.ok && r.reason === 'max' && r.prog === w.prog && r.loose === w.loose, 'pegar una suelta de 2 sobre el máximo: rechaza y no pierde nada');
  r = W.move(w, { s: 1, i: 0 }, { kind: 'after', s: 0, i: 2 }, { max: 4 });
  ok(r.ok && show(r.prog) === 'rdul' && r.loose.length === 0, 'pegar una suelta dentro del máximo');
  // sacar de la pila del ▶ y dejar suelto libera lugar
  r = W.move(w, { s: 0, i: 1 }, { kind: 'free', x: 9, y: 9 }, { max: 2 });
  ok(r.ok && show(r.prog) === 'r' && r.loose.length === 2, 'sacar del ▶ y dejar suelto');
  r = W.move(w, { s: 0, i: 0 }, { kind: 'delete' });
  ok(r.ok && show(r.prog) === '' && show(r.deleted) === 'rd' && r.loose.length === 1, 'borrar se lleva la pila levantada');
  // mover dentro del ▶ al máximo: al levantar se libera lo que sale, así que puede volver a entrar
  r = W.move(ws('rdlu'), { s: 0, i: 1 }, { kind: 'after', s: 0, i: 1 }, { max: 4 });
  ok(r.ok && show(r.prog) === 'rdlu', 'volver a poner lo levantado en el mismo lugar con el programa lleno');
}

/* ---- nunca se pierde ni se duplica nada: pruebas al azar ---- */
{
  let seed = 12345;
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >>> 8) % n; };
  const sym = it => it.t === 'm' ? it.d : (it.u ? 'H' : 'C');
  // multiconjunto de bloques de toda el área (los repetir cuentan como "C" o "H"; su cuerpo, como flechas)
  const bag = (...stacks) => stacks.flat().flatMap(it => it.t === 'm' ? [sym(it)] : [sym(it), ...it.body]).sort().join('');
  const randItems = () => P(['rd', 'u', '2(rd)', 'l2(ud)', 'h(lr)', 'dlu', 'rr3(lu)u', '3()', 'h()'][rnd(9)]);
  let moved = 0, rejected = 0;
  for (let n = 0; n < 3000; n++) {
    const w = { prog: randItems().concat(randItems()), loose: Array.from({ length: rnd(3) }, () => ({ x: rnd(80), y: rnd(80), items: randItems() })) };
    const all0 = bag(w.prog, ...w.loose.map(l => l.items));
    const before = JSON.stringify(w);
    const pal = rnd(4) === 0, max = Math.max(1, W.count(w.prog) + rnd(5) - 2);
    let src, lifted = w;
    if (pal) src = { stack: randItems() };
    else {
      const s = rnd(1 + w.loose.length), items = s === 0 ? w.prog : w.loose[s - 1].items;
      if (!items.length) continue;
      const i = rnd(items.length), it = items[i];
      src = { s, i, j: it.t === 'rep' && it.body.length && rnd(2) ? rnd(it.body.length) : undefined };
      if (src.j !== undefined && it.t !== 'rep') continue;
      lifted = W.lift(w, src.s, src.i, src.j);
    }
    const dragged = pal ? src.stack : lifted.taken;
    const base = pal ? w : lifted;
    const spots = W.spots(base, !W.hasRep(dragged));
    const t = rnd(5) === 0 ? { kind: 'free', x: rnd(100), y: rnd(100) } : rnd(8) === 0 ? { kind: 'delete' } : spots[rnd(spots.length)];
    const r = W.move(w, src, t, { max });
    ok(JSON.stringify(w) === before, 'move no muta el original');
    const add = pal ? bag(dragged) : '';
    if (r.ok) {
      moved++;
      const all1 = bag(r.prog, ...r.loose.map(l => l.items)) + (r.deleted ? bag(r.deleted) : '');
      ok([...all1].sort().join('') === [...all0 + add].sort().join(''), `conservación tras mover (${dump(w)} ${JSON.stringify(src)} ${JSON.stringify(t)})`);
      ok(r.prog.every(it => it.t === 'm' || it.body.length <= W.MAX_BODY) && r.loose.every(l => l.items.every(it => it.t === 'm' || it.body.length <= W.MAX_BODY)), 'ninguna boca pasa de 3');
      ok(W.count(r.prog) <= Math.max(max, W.count(w.prog)), 'la pila del ▶ no pasa del máximo');
      ok(r.loose.every(l => l.items.length > 0), 'no quedan pilas sueltas vacías');
    } else {
      rejected++;
      ok(r.prog === w.prog && r.loose === w.loose, `rechazo devuelve el área tal cual (${dump(w)} ${JSON.stringify(src)} ${JSON.stringify(t)} ${r.reason})`);
    }
  }
  ok(moved > 500 && rejected > 100, `la prueba al azar cubre movimientos y rechazos (${moved} / ${rejected})`);
}

/* ---- nearest: la punta de arriba manda, y 40 px ---- */
{
  const pts = [{ kind: 'after', s: 0, i: 0, x: 10, y: 50 }, { kind: 'after', s: 0, i: 1, x: 10, y: 90 }, { kind: 'above', s: 1, x: 100, y: 200 }];
  ok(W.nearest(pts, 12, 52, 36).pt.i === 0, 'nearest: el punto más cercano');
  ok(W.nearest(pts, 12, 80, 36).pt.i === 1, 'nearest: elige el de abajo cuando está más cerca');
  ok(W.nearest(pts, 300, 300, 36) === null, 'nearest: lejos de todo no encastra');
  ok(W.nearest(pts, 100, 200 - 36, 36).pt.kind === 'above', 'nearest: para "arriba de una suelta" cuenta el pie de lo arrastrado');
  ok(W.nearest(pts, 10 + 39, 50, 36) && !W.nearest(pts, 10 + 41, 50, 36) || W.nearest(pts, 10 + 41, 50, 36).pt.i === 1, 'nearest: el límite son 40 px');
}

if (errors.length) { console.log(errors.slice(0, 25).join('\n')); console.log(`FALLAN ${errors.length} de ${checks}`); process.exit(1); }
console.log(`ok: ${checks} chequeos`);
