/* =========================================================
   Programitos — el progreso dura una clase
   Las compus pasan de una clase a otra (~50 min), así que el progreso
   vence a los 45 minutos de que una pareja empieza: el reloj arranca
   cuando los dos se suman y se comparte entre 1.º y 2.º.
   Puro (sin DOM): el reloj y el almacenamiento se inyectan, así se
   prueba en node con tools/check-session.mjs. Si localStorage no anda
   (o tira error), todo sigue funcionando en memoria.
   ========================================================= */
(function (root) {
  'use strict';
  const TTL = 45 * 60 * 1000;                 // el progreso dura 45 minutos
  const TOL = 2 * 60 * 1000;                  // tolerancia a relojes que se corrigen solos
  const SESSION_KEY = 'programitos-session';
  const PREFS_KEY = 'programitos-prefs';      // sonido y voz: sobreviven al borrado
  const PROGRESS_KEYS = ['programitos-v2', 'programitos-v2-g2', 'programitos-pf'];   // 1.º, 2.º, ropero y monedas

  // ¿Esto guardado es progreso de verdad? (un guardado con solo el sonido no cuenta)
  function isProgress(raw) {
    if (!raw) return false;
    let d; try { d = JSON.parse(raw); } catch (e) { return true; }     // roto: ocupa lugar, que se limpie
    if (!d || typeof d !== 'object') return false;
    const has = o => !!o && typeof o === 'object' && Object.keys(o).length > 0;
    if (has(d.stars) || has(d.gems) || has(d.skipped) || d.custom || d.unlocked > 0) return true;
    if (d.coins && (d.coins.A > 0 || d.coins.B > 0)) return true;
    if (d.owned && ((d.owned.A || []).length || (d.owned.B || []).length)) return true;
    if (d.wear && ['A', 'B'].some(p => has(d.wear[p]))) return true;
    return false;
  }

  function create(opt) {
    opt = opt || {};
    const now = opt.now || (() => Date.now());
    const ttl = opt.ttl || TTL;
    const mem = new Map();                    // plan B si localStorage no está o tira error
    let broken = !opt.storage;
    const st = opt.storage;
    const get = k => { if (!broken) { try { const v = st.getItem(k); return v === undefined ? null : v; } catch (e) { broken = true; } } return mem.has(k) ? mem.get(k) : null; };
    const set = (k, v) => { if (!broken) { try { st.setItem(k, v); return; } catch (e) { broken = true; } } mem.set(k, v); };
    const del = k => { if (!broken) { try { st.removeItem(k); } catch (e) { broken = true; } } mem.delete(k); };

    const stale = () => PROGRESS_KEYS.some(k => isProgress(get(k)));
    function read() {
      const raw = get(SESSION_KEY);
      if (raw === null) return null;
      try {
        const d = JSON.parse(raw);
        if (d && Number.isFinite(d.t0) && Number.isFinite(d.seen) && d.t0 > 0 && d.seen >= d.t0) return d;
      } catch (e) {}
      return { bad: true };
    }
    // 'none' (no hay sesión ni progreso) | 'live' | 'expired'. Un guardado sin reloj (de antes) cuenta como vencido.
    function state() {
      const d = read(), t = now();
      if (!d) return stale() ? { status: 'expired', why: 'noclock' } : { status: 'none' };
      if (d.bad) return { status: 'expired', why: 'corrupt' };
      if (t < d.t0 - TOL || t < d.seen - TOL) return { status: 'expired', why: 'backwards', start: d.t0 };   // el reloj fue para atrás: no es inmortal
      if (t - d.t0 >= ttl || d.seen - d.t0 >= ttl) return { status: 'expired', why: 'ttl', start: d.t0 };
      return { status: 'live', start: d.t0, left: ttl - (t - d.t0) };
    }
    // Guarda el último momento visto (detecta relojes que vuelven atrás). No alarga la sesión.
    function touch() {
      const d = read(), t = now();
      if (!d || d.bad || state().status !== 'live' || t <= d.seen) return;
      set(SESSION_KEY, JSON.stringify({ t0: d.t0, seen: t }));
    }
    // Arranca la sesión si no hay una viva; si hay una viva no la alarga. Si había una vencida, borra lo viejo primero.
    function start() {
      const s = state();
      if (s.status === 'live') return s;
      if (s.status === 'expired') wipe();
      const t = now(); set(SESSION_KEY, JSON.stringify({ t0: t, seen: t }));
      return state();
    }
    function getPrefs() {
      try { const p = JSON.parse(get(PREFS_KEY)); if (p && typeof p === 'object') return p; } catch (e) {}
      return null;
    }
    function setPrefs(p) { set(PREFS_KEY, JSON.stringify(p)); }
    // Borra el progreso de los dos grados juntos (y monedas/ropero) y el reloj. Sonido y voz se quedan.
    function wipe() {
      if (!getPrefs()) {                       // guardados viejos llevaban el sonido adentro: se rescata antes de borrar
        for (const k of PROGRESS_KEYS) {
          try { const d = JSON.parse(get(k)); if (d && typeof d.sound === 'boolean') { setPrefs({ sound: d.sound, voice: d.voice !== false }); break; } } catch (e) {}
        }
      }
      PROGRESS_KEYS.forEach(del); del(SESSION_KEY);
    }
    const hasProgress = () => PROGRESS_KEYS.some(k => isProgress(get(k)));
    return { state, start, touch, wipe, hasProgress, getPrefs, setPrefs, get, set, del, ttl };
  }

  root.Session = { create, isProgress, TTL, TOL, SESSION_KEY, PREFS_KEY, PROGRESS_KEYS };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.Session;
})(typeof window !== 'undefined' ? window : globalThis);
