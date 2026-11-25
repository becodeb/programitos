// Prueba el reloj de la clase (public/js/session.js) con un reloj y un almacenamiento falsos.
// Uso: node tools/check-session.mjs
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const Session = require('../public/js/session.js');

let checks = 0; const errors = [];
const ok = (c, msg) => { checks++; if (!c) errors.push(msg); };
const MIN = 60 * 1000, T0 = 1_700_000_000_000;

function fakeStorage() {
  const m = new Map();
  return { m, getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => void m.set(k, String(v)), removeItem: k => void m.delete(k) };
}
function world() {
  const storage = fakeStorage(); const clock = { t: T0 };
  const mk = () => Session.create({ storage, now: () => clock.t });
  return { storage, clock, mk, s: mk() };
}
const progress = { unlocked: 3, stars: { 0: 3, 1: 2 }, gems: {} };
const put = (w, key, v) => w.storage.setItem(key, JSON.stringify(v));
const status = w => w.mk().state().status;

// empezar
{
  const w = world();
  ok(w.s.state().status === 'none', 'sin nada: none');
  const r = w.s.start();
  ok(r.status === 'live' && r.start === T0 && r.left === 45 * MIN, 'start: viva y con 45 min');
  ok(w.storage.m.has(Session.SESSION_KEY), 'start escribe el reloj');
}
// recargar mantiene (otra instancia sobre el mismo almacenamiento)
{
  const w = world(); w.s.start(); put(w, 'programitos-v2', progress);
  w.clock.t += 20 * MIN;
  ok(status(w) === 'live' && w.mk().hasProgress(), 'recargar a los 20 min: viva con progreso');
}
// 44:59 sí, 45:00 no
{
  const w = world(); w.s.start();
  w.clock.t = T0 + 45 * MIN - 1000; ok(status(w) === 'live', '44:59 sigue viva');
  w.clock.t = T0 + 45 * MIN; ok(status(w) === 'expired', '45:00 vence');
  w.clock.t = T0 + 46 * MIN; ok(status(w) === 'expired', '46:00 vencida');
}
// volver a sumarse con la sesión viva no la alarga
{
  const w = world(); w.s.start(); w.clock.t += 30 * MIN;
  const r = w.mk().start();
  ok(r.start === T0 && r.left === 15 * MIN, 'start con sesión viva no alarga: quedan 15 min');
  w.clock.t = T0 + 45 * MIN; ok(status(w) === 'expired', 'vence a los 45 desde el primer start');
}
// guardado sin reloj (de antes de esta versión) = vencido
{
  const w = world(); put(w, 'programitos-v2', progress);
  ok(w.s.state().status === 'expired' && w.s.state().why === 'noclock', 'guardado sin reloj: vencido');
  const r = w.s.start();
  ok(r.status === 'live' && !w.s.hasProgress(), 'start sobre un guardado viejo borra lo viejo y arranca de cero');
  const w2 = world(); put(w2, 'programitos-v2', { unlocked: 0, stars: {}, sound: false });
  ok(w2.s.state().status === 'none', 'un guardado sin progreso (solo sonido) no cuenta');
}
// los dos grados, monedas y ropero se borran juntos; sonido y voz quedan
{
  const w = world(); w.s.start();
  put(w, 'programitos-v2', progress); put(w, 'programitos-v2-g2', { unlocked: 7, stars: { 5: 3 }, gems: { 5: true } });
  put(w, 'programitos-pf', { coins: { A: 4, B: 2 }, owned: { A: ['gorra'], B: [] }, wear: { A: { head: 'gorra' }, B: {} } });
  w.s.setPrefs({ sound: false, voice: false });
  ok(w.s.hasProgress(), 'hay progreso antes de borrar');
  w.s.wipe();
  ok(!w.storage.m.has('programitos-v2') && !w.storage.m.has('programitos-v2-g2') && !w.storage.m.has('programitos-pf'), 'wipe borra 1°, 2° y monedas/ropero juntos');
  ok(!w.storage.m.has(Session.SESSION_KEY) && w.s.state().status === 'none' && !w.s.hasProgress(), 'wipe borra el reloj');
  const p = w.mk().getPrefs(); ok(p && p.sound === false && p.voice === false, 'el sonido y la voz se mantienen');
}
// sonido de guardados viejos se rescata al borrar
{
  const w = world(); put(w, 'programitos-v2', { unlocked: 1, stars: { 0: 3 }, sound: false, voice: true });
  w.s.wipe(); const p = w.s.getPrefs(); ok(p && p.sound === false, 'wipe rescata el sonido del guardado viejo');
}
// el reloj va para atrás o el valor está roto: vencido (no inmortal)
{
  const w = world(); w.s.start(); w.clock.t = T0 + 10 * MIN; w.s.touch();
  w.clock.t = T0 + 10 * MIN - 5 * 1000; ok(status(w) === 'live', 'una corrección de segundos del reloj no vence');
  w.clock.t = T0 - 60 * MIN; ok(status(w) === 'expired', 'reloj una hora atrás: vencida');
  const w2 = world(); w2.s.start(); w2.clock.t = T0 + 40 * MIN; w2.s.touch(); w2.clock.t = T0 + 5 * MIN;
  ok(status(w2) === 'expired', 'reloj atrás tras haber visto el minuto 40: vencida (no se puede volver a ganar tiempo)');
  for (const bad of ['', 'xx', '{}', '{"t0":"a"}', '{"t0":-5,"seen":-5}', 'null', '[]', '{"t0":5,"seen":1}', '{"t0":1e999,"seen":1e999}']) {
    const wc = world(); wc.storage.setItem(Session.SESSION_KEY, bad);
    ok(wc.s.state().status === 'expired', 'valor roto vence: ' + JSON.stringify(bad));
    ok(wc.s.start().status === 'live', 'después de un valor roto se puede empezar de nuevo');
  }
  const wf = world(); wf.storage.setItem(Session.SESSION_KEY, JSON.stringify({ t0: T0 + 90 * MIN, seen: T0 + 90 * MIN }));
  ok(wf.s.state().status === 'expired', 'inicio en el futuro: vencida');
}
// touch no alarga la sesión
{
  const w = world(); w.s.start(); w.clock.t += 44 * MIN; w.s.touch();
  w.clock.t = T0 + 45 * MIN; ok(status(w) === 'expired', 'touch no alarga');
}
// localStorage no disponible o que tira error: sigue andando en memoria
{
  const boom = () => { throw new Error('SecurityError'); };
  const clock = { t: T0 };
  const s = Session.create({ storage: { getItem: boom, setItem: boom, removeItem: boom }, now: () => clock.t });
  ok(s.state().status === 'none', 'sin almacenamiento: none');
  ok(s.start().status === 'live', 'sin almacenamiento: start anda');
  s.set('programitos-v2', JSON.stringify(progress)); ok(s.hasProgress(), 'sin almacenamiento: el progreso se tiene en memoria');
  clock.t += 45 * MIN; ok(s.state().status === 'expired', 'sin almacenamiento: también vence');
  s.wipe(); ok(!s.hasProgress() && s.state().status === 'none', 'sin almacenamiento: wipe anda');
  s.setPrefs({ sound: false }); ok(s.getPrefs().sound === false, 'sin almacenamiento: las preferencias se guardan en memoria');
  const s2 = Session.create({ now: () => clock.t });                 // ni siquiera existe localStorage
  ok(s2.start().status === 'live', 'sin objeto de almacenamiento: start anda');
  const s3 = Session.create({ storage: { getItem: () => undefined, setItem() {}, removeItem() {} }, now: () => clock.t });
  ok(s3.state().status === 'none', 'getItem que devuelve undefined: none');
}
// ya hay una vencida: empezar borra lo viejo y arranca otra
{
  const w = world(); w.s.start(); put(w, 'programitos-v2', progress); w.clock.t += 50 * MIN;
  const r = w.mk().start();
  ok(r.status === 'live' && r.start === w.clock.t && !w.mk().hasProgress(), 'start con sesión vencida: borra el progreso y arranca nueva');
}

if (errors.length) { console.error('FALLAN ' + errors.length + ' de ' + checks + ':\n - ' + errors.join('\n - ')); process.exit(1); }
console.log('ok: ' + checks + ' comprobaciones de la sesión');
