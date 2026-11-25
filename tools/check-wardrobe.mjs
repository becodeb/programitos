// Prueba el catálogo y las reglas del ropero (public/js/wardrobe.js) y que no haya emojis nuevos que las compus viejas no dibujan.
// Uso: node tools/check-wardrobe.mjs
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const W = require('../public/js/wardrobe.js');
const errors = []; let checks = 0;
const ok = (c, m) => { checks++; if (!c) errors.push(m); };
const fresh = coins => ({ coins: { A: coins, B: coins }, owned: { A: [], B: [] }, wear: { A: {}, B: {} } });
ok(W.ITEMS.length >= 20 && W.ITEMS.length <= 26, 'unas 20 prendas: ' + W.ITEMS.length);
ok(new Set(W.ITEMS.map(i => i.id)).size === W.ITEMS.length, 'ids únicos');
for (const s of W.SLOTS) ok(W.ITEMS.filter(i => i.slot === s).length >= 4, 'cada lugar tiene 4 o más prendas: ' + s);
ok(W.ITEMS.every(i => i.price >= 3 && i.price <= 15), 'precios de 3 a 15');
ok(W.ITEMS.some(i => i.price <= 3), 'hay una prenda que se compra con las monedas del primer nivel');
for (const s of ['head', 'face', 'hand', 'trail']) ok(W.ITEMS.some(i => i.slot === s && i.price <= 3), 'hay una barata en ' + s);
for (const i of W.ITEMS) {
  if (i.slot === 'trail') { ok(!!i.emoji, i.id + ': huella con emoji'); continue; }
  for (const who of ['A', 'B']) {
    const svg = W.layers(who, { [i.slot]: i.id });
    ok(svg.includes('<g class="wd-' + i.slot + '">') && !svg.includes('NaN') && !svg.includes('undefined'), `${i.id}/${who}: se dibuja sin NaN`);
    for (const m of svg.matchAll(/(?:cx|cy|x|y)="(-?[\d.]+)"/g)) ok(+m[1] >= -2 && +m[1] <= 102, `${i.id}/${who}: dentro del dibujo (${m[0]})`);
  }
  ok(W.icon(i.id).includes('<svg'), i.id + ': tiene dibujo de celda');
}
// reglas
{
  const pf = fresh(3);
  ok(W.tap(pf, 'A', 'gorra').action === 'buy' && pf.coins.A === 0 && pf.wear.A.head === 'gorra' && pf.owned.A.includes('gorra') && pf.coins.B === 3, 'comprar descuenta y se pone, solo a ese personaje');
  ok(W.tap(pf, 'A', 'gorra').action === 'off' && !pf.wear.A.head && pf.coins.A === 0, 'tocar la puesta la saca sin devolver monedas');
  ok(W.tap(pf, 'A', 'gorra').action === 'wear' && pf.wear.A.head === 'gorra' && pf.coins.A === 0, 'una ya comprada se vuelve a poner gratis');
  ok(W.tap(pf, 'A', 'corona').action === 'poor' && !pf.owned.A.includes('corona') && pf.coins.A === 0, 'sin monedas no compra');
  const p2 = fresh(20); W.tap(p2, 'B', 'gorra'); W.tap(p2, 'B', 'copa');
  ok(p2.wear.B.head === 'copa' && p2.owned.B.length === 2 && p2.coins.B === 12, 'una sola prenda por lugar');
  ok(W.layers('A', {}) === '' && W.layers('A', null) === '', 'sin prendas no agrega nada');
  ok(W.levelCoins(true, 3, false) === 3 && W.levelCoins(true, 2, true) === 3 && W.levelCoins(false, 3, false) === 1 && W.levelCoins(false, 3, true) === 2, 'monedas del nivel: estrellas la primera vez, 1 si se repite, +1 por 💎');
}
// Emoji nuevos (> Emoji 13) en lo que agrega la rama
const NEW = [[0x1FAE0, 0x1FAEF], [0x1F979, 0x1F979], [0x1FAA9, 0x1FAAD], [0x1FAB7, 0x1FABF], [0x1F6DD, 0x1F6DF], [0x1F7F0, 0x1F7F0], [0x1FAC3, 0x1FAC5], [0x1FAF0, 0x1FAFF]];
for (const f of ['public/js/wardrobe.js', 'public/js/race.js', 'public/js/session.js', 'public/js/levels2.js', 'public/index.html']) {
  for (const ch of fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8')) { const cp = ch.codePointAt(0); ok(!NEW.some(([a, b]) => cp >= a && cp <= b), f + ': emoji nuevo ' + ch); }
}
if (errors.length) { console.error('FALLAN ' + errors.length + ' de ' + checks + ':\n - ' + errors.slice(0, 30).join('\n - ')); process.exit(1); }
console.log('ok: ' + checks + ' comprobaciones del ropero');
