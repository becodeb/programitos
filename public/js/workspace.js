/* =========================================================
   Programitos — área de trabajo estilo Scratch
   Parte pura (sin DOM, se prueba en node con tools/check-workspace.mjs):
   el modelo { prog, loose } y las operaciones de levantar / soltar.
   Parte de pantalla (attach): arrastrar con mouse o dedo, vista previa
   del hueco, autoscroll y rebote. game.js la usa con un "host".

   Modelo por chico:
     prog  = pila que cuelga del ▶ (la única que corre el motor), items del motor:
             { t:'m', d } | { t:'rep', n, u?, body:[d,…], open }
     loose = pilas sueltas [{ x, y, items }]; no corren ni cuentan para el máximo.
   ========================================================= */
(function (root) {
  'use strict';
  const MAX_BODY = 3;          // bloques por boca de repetir
  const SNAP = 40;             // distancia (px) para que un bloque se encastre
  const PAD = 6;               // margen mínimo de las pilas sueltas dentro del área
  const HAT = { x: 10, y: 10 };

  /* ---------- Parte pura ---------- */
  const isRep = it => it.t === 'rep';
  const count = items => items.reduce((s, it) => s + (isRep(it) ? 1 + it.body.length : 1), 0);
  const cloneItem = it => isRep(it) ? Object.assign({}, it, { body: it.body.slice() }) : Object.assign({}, it);
  const clone = items => items.map(cloneItem);
  const cloneLoose = loose => loose.map(st => ({ x: st.x, y: st.y, items: clone(st.items) }));
  const cloneWs = ws => ({ prog: clone(ws.prog), loose: cloneLoose(ws.loose) });
  const hasRep = items => items.some(isRep);
  const atoms = ds => ds.map(d => ({ t: 'm', d }));
  const closeAll = items => { items.forEach(it => { if (isRep(it)) it.open = false; }); return items; };

  // Saca el bloque (i, j) y todo lo que cuelga de él: lo de abajo en la pila, o el resto de esa boca si j
  function take(items, i, j) {
    const rest = clone(items);
    if (!(i >= 0 && i < rest.length)) return null;
    if (j === undefined) { const taken = rest.splice(i); return { rest: closeAll(rest), taken: closeAll(taken) }; }
    const rep = rest[i];
    if (!isRep(rep) || !(j >= 0 && j < rep.body.length)) return null;
    const taken = atoms(rep.body.splice(j));
    return { rest: closeAll(rest), taken };
  }
  // Mete `dragged` en la posición at = { i } (arriba-abajo) o { i, j } (adentro de la boca del repetir i).
  // Si lo último que se mete es un repetir vacío, se "pone" sobre los bloques que quedan abajo y se los traga
  // (los primeros que entren, hasta 3, sin pasar por otro repetir).
  function insert(items, dragged, at, max) {
    const res = clone(items), add = clone(dragged);
    let wrapped = 0;
    if (at.j !== undefined) {
      const rep = res[at.i];
      if (!rep || !isRep(rep) || hasRep(add)) return { ok: false, reason: 'nest' };
      if (rep.body.length + add.length > MAX_BODY) return { ok: false, reason: 'body' };
      rep.body.splice(at.j, 0, ...add.map(it => it.d));
    } else {
      const last = add[add.length - 1];
      if (last && isRep(last) && !last.body.length) {
        while (wrapped < MAX_BODY && at.i + wrapped < res.length && !isRep(res[at.i + wrapped])) wrapped++;
        if (wrapped) last.body = res.splice(at.i, wrapped).map(it => it.d);
      }
      res.splice(at.i, 0, ...add);
    }
    if (max !== undefined && count(res) > max) return { ok: false, reason: 'max' };
    return { ok: true, items: closeAll(res), wrapped };
  }
  const stackAt = (ws, s) => s === 0 ? ws.prog : ws.loose[s - 1] && ws.loose[s - 1].items;

  // Levanta del área (s: 0 = pila del ▶, k = suelta k) lo que cuelga de (i, j). → { prog, loose, taken } | null
  function lift(ws, s, i, j) {
    const w = cloneWs(ws), items = stackAt(w, s); if (!items) return null;
    const r = take(items, i, j); if (!r) return null;
    if (s === 0) w.prog = r.rest; else if (r.rest.length) w.loose[s - 1].items = r.rest; else w.loose.splice(s - 1, 1);
    return { prog: w.prog, loose: w.loose, taken: r.taken };
  }
  // Suelta `dragged` en t = { kind:'after', s, i } | { kind:'body', s, i, j } | { kind:'above', s, x?, y? } | { kind:'free', x, y }.
  // opt.max = máximo de bloques de la pila del ▶. No muta ws. Si no entra: { ok:false, reason } y ws queda como estaba.
  function drop(ws, dragged, t, opt) {
    const max = opt && opt.max, w = cloneWs(ws);
    const bad = reason => ({ ok: false, reason, prog: ws.prog, loose: ws.loose });
    if (!dragged.length) return bad('empty');
    let wrapped = 0;
    if (t.kind === 'free') w.loose.push({ x: t.x, y: t.y, items: closeAll(clone(dragged)) });
    else {
      const items = stackAt(w, t.s); if (!items) return bad('target');
      const r = insert(items, dragged, t.kind === 'body' ? { i: t.i, j: t.j } : { i: t.kind === 'above' ? 0 : t.i });
      if (!r.ok) return bad(r.reason);
      wrapped = r.wrapped;
      if (t.s === 0) w.prog = r.items;
      else { const st = w.loose[t.s - 1]; st.items = r.items; if (t.kind === 'above' && t.x !== undefined) { st.x = t.x; st.y = t.y; } }
    }
    if (max !== undefined && t.kind !== 'free' && t.s === 0 && count(w.prog) > max) return bad('max');   // solo cuenta si se tocó la pila del ▶
    return { ok: true, prog: w.prog, loose: w.loose, wrapped };
  }
  // Levantar y soltar de una: si no entra, devuelve todo como estaba. src = { s, i, j? } | { stack }.
  // El destino se refiere al área ya sin lo levantado (así lo mide la pantalla).
  function move(ws, src, t, opt) {
    let base = ws, taken;
    if (src.stack) taken = src.stack;
    else { const l = lift(ws, src.s, src.i, src.j); if (!l) return { ok: false, reason: 'source', prog: ws.prog, loose: ws.loose }; base = l; taken = l.taken; }
    if (t.kind === 'delete') return { ok: true, prog: base.prog, loose: base.loose, deleted: taken };
    const r = drop(base, taken, t, opt);
    return r.ok ? r : { ok: false, reason: r.reason, prog: ws.prog, loose: ws.loose };
  }
  // Todos los lugares donde se puede encastrar algo en el área. nest=false: sin las bocas (lo que se lleva tiene un repetir)
  function spots(ws, nest) {
    const out = [];
    const walk = (s, items) => {
      if (s === 0) out.push({ kind: 'after', s, i: 0 }); else out.push({ kind: 'above', s });
      items.forEach((it, i) => {
        out.push({ kind: 'after', s, i: i + 1 });
        if (isRep(it) && nest !== false) for (let j = 0; j <= it.body.length; j++) out.push({ kind: 'body', s, i, j });
      });
    };
    walk(0, ws.prog); ws.loose.forEach((st, k) => walk(k + 1, st.items));
    return out;
  }
  const spotKey = t => t.kind + ':' + t.s + ':' + t.i + ':' + t.j;
  // El lugar más cercano: la punta de arriba de lo que se arrastra (gx, gy) contra cada punto; para "above", su pie (gy + gh)
  function nearest(pts, gx, gy, gh, snap) {
    let best = null;
    for (const pt of pts) {
      const dist = Math.hypot((gx - pt.x) * .55, (pt.kind === 'above' ? gy + gh : gy) - pt.y);
      if (dist <= (snap || SNAP) && (!best || dist < best.dist)) best = { pt, dist };
    }
    return best;
  }
  const makeStack = act => act === 'rep' ? [{ t: 'rep', n: 2, body: [], open: false }]
    : act === 'h' ? [{ t: 'rep', u: true, n: 2, body: [], open: false }] : [{ t: 'm', d: act }];

  const WS = { MAX_BODY, SNAP, PAD, HAT, count, clone, cloneWs, hasRep, take, insert, lift, drop, move, spots, spotKey, nearest, makeStack };

  /* ---------- Parte de pantalla ---------- */
  // host: { S, busy(p), active(), predict(), hasTool(a), max(), html(items, s), render(p), touched(p),
  //         sound(n, a), full(p), done(p, what), say(t), flash(f) }
  WS.attach = function (host) {
    const $ = s => document.querySelector(s);
    const DRAG = new Map();                       // pointerId -> arrastre (cada chico, el suyo)
    const PAN = new Map();                        // pointerId -> deslizar el área con el dedo
    let tokens = 0;
    const PAL = ['u', 'd', 'l', 'r', 'j', 'c', 'g', 'rep', 'h'];
    const swallow = { A: 0, B: 0 };               // por chico: el arrastre de uno no se come los toques del otro
    const wsEl = p => document.getElementById('prog-' + p);
    const inRect = (x, y, r) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    const model = p => ({ prog: host.S.prog[p], loose: host.S.loose[p] });
    const setModel = (p, w) => { host.S.prog[p] = w.prog; host.S.loose[p] = w.loose; };

    function sourceAt(t, p) {
      const pal = t.closest('.pal');
      if (pal) return PAL.includes(pal.dataset.act) && host.hasTool(pal.dataset.act) ? { kind: 'pal', act: pal.dataset.act, el: pal } : null;
      const blk = t.closest('.blk');
      if (blk && blk.closest('#prog-' + p) && !blk.classList.contains('ro'))
        return { kind: 'blk', s: +blk.dataset.s, i: +blk.dataset.i, j: blk.dataset.j !== undefined ? +blk.dataset.j : undefined, el: blk };
      // El repetir se agarra de cualquier parte (cabeza con sus botones, brazo, boca vacía o pie): tocar sin mover sigue siendo un click
      const rep = t.closest('.rep');
      if (rep && rep.closest('#prog-' + p)) return { kind: 'blk', s: +rep.dataset.s, i: +rep.dataset.ri, el: rep, far: !!t.closest('button') };   // en − n + ✔ hay que moverse más: un click apurado no arranca un arrastre
      return null;
    }

    document.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (!host.active() || host.predict()) return;
      const panel = e.target.closest && e.target.closest('.panel'); if (!panel) return;
      const p = panel.dataset.p;
      // Arrastres que quedaron colgados (se perdió el "soltar"): se cierran para que no traben los que siguen
      [...DRAG.values()].forEach(d => { if (d.id === e.pointerId || (d.p === p && !d.on)) end(d, null, true); });
      PAN.delete(e.pointerId);
      if (host.busy(p) || [...DRAG.values()].some(d => d.p === p)) return;
      const src = sourceAt(e.target, p);
      if (!src) {                                       // fondo del área: con el dedo, desliza
        const ws = wsEl(p);
        if (e.pointerType !== 'mouse' && ws.contains(e.target)) PAN.set(e.pointerId, { ws, x: e.clientX, y: e.clientY });
        return;
      }
      const r = src.el.getBoundingClientRect();
      const off = src.kind === 'pal' ? { x: 30, y: 18 } : { x: e.clientX - r.left, y: e.clientY - r.top };
      DRAG.set(e.pointerId, { id: e.pointerId, p, src, sx: e.clientX, sy: e.clientY, cx: e.clientX, cy: e.clientY, off, on: false, raf: 0 });
    });
    document.addEventListener('pointermove', e => {
      const pan = PAN.get(e.pointerId);
      if (pan) { pan.ws.scrollLeft -= e.clientX - pan.x; pan.ws.scrollTop -= e.clientY - pan.y; pan.x = e.clientX; pan.y = e.clientY; return; }
      const d = DRAG.get(e.pointerId); if (!d) return;
      if (e.pointerType === 'mouse' && !(e.buttons & 1)) return end(d, null, true);      // se soltó donde no nos enteramos
      d.cx = e.clientX; d.cy = e.clientY;
      if (!d.on) { if (Math.hypot(d.cx - d.sx, d.cy - d.sy) < (d.src.far ? 18 : 6)) return; if (!start(d)) { DRAG.delete(d.id); return; } }
      schedule(d);
    });
    document.addEventListener('pointerup', e => { PAN.delete(e.pointerId); const d = DRAG.get(e.pointerId); if (d) end(d, e, false); });
    document.addEventListener('pointercancel', e => { PAN.delete(e.pointerId); const d = DRAG.get(e.pointerId); if (d) end(d, e, true); });
    window.addEventListener('blur', cancelAll);
    // El navegador no tiene que empezar un arrastre propio, seleccionar ni abrir el menú: eso corta el nuestro
    const typing = t => t && t.closest && t.closest('input');
    document.addEventListener('dragstart', e => e.preventDefault());
    document.addEventListener('selectstart', e => { if (!typing(e.target)) e.preventDefault(); });
    document.addEventListener('contextmenu', e => { if (e.target.closest && e.target.closest('#scr-game')) e.preventDefault(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) cancelAll(); });
    // Después de arrastrar, el "click" que sigue al soltar no tiene que apretar nada
    document.addEventListener('click', e => {
      const pan = e.target.closest && e.target.closest('.panel'), who = pan ? pan.dataset.p : swallow.A ? 'A' : 'B';
      if (!pan && e.target !== document.body && e.target !== document.documentElement) return;
      if (swallow[who]) { swallow[who] = 0; e.stopPropagation(); e.preventDefault(); }
    }, true);

    function cancelAll() { [...DRAG.values()].forEach(d => end(d, null, true)); }
    function schedule(d) { if (!d.raf) d.raf = requestAnimationFrame(() => frame(d)); }

    function start(d) {
      const p = d.p, ws = wsEl(p);
      d.orig = cloneWs(model(p));
      if (d.src.kind === 'pal') d.taken = makeStack(d.src.act);
      else {
        const l = lift(model(p), d.src.s, d.src.i, d.src.j);
        if (!l) return false;
        d.taken = l.taken; setModel(p, l);
      }
      d.hasRep = hasRep(d.taken);
      const g = document.createElement('div'); g.className = 'ghost';
      g.innerHTML = '<div class="stack">' + host.html(d.taken, -1) + '</div>';
      document.body.appendChild(g); d.ghost = g;
      d.gw = g.offsetWidth; d.gh = g.offsetHeight;
      const ph = document.createElement('div'); ph.className = 'ph'; ph.style.width = d.gw + 'px'; ph.style.height = d.gh + 'px'; d.ph = ph;
      try { document.body.setPointerCapture(d.id); } catch (err) {}
      d.on = true; d.token = ++tokens; swallow[p] = d.token;
      host.touched(p);
      if (d.src.kind === 'blk') host.render(p);        // la pila sale del área; el ghost la lleva
      d.wsr = ws.getBoundingClientRect();
      d.base = { x: d.wsr.left + ws.clientLeft, y: d.wsr.top + ws.clientTop };
      d.pts = measure(d); d.key = null; d.best = null;
      const panel = $('#panel-' + p);
      panel.classList.add('dragging'); if (d.src.kind === 'blk') panel.classList.add('drag-del');
      ws.classList.add('drag-on');
      host.sound('lift');
      return true;
    }

    // Dónde queda cada lugar de encastre, en coordenadas del lienzo (no cambian al hacer scroll ni al abrir el hueco)
    function measure(d) {
      const ws = wsEl(d.p), pts = [], b = d.base;
      const rel = el => { const r = el.getBoundingClientRect(); return { x: r.left - b.x + ws.scrollLeft, y: r.top - b.y + ws.scrollTop, b: r.bottom - b.y + ws.scrollTop }; };
      const keep = (kind, s, i, j, x, y) => pts.push({ kind, s, i, j, x, y, key: spotKey({ kind, s, i, j }) });
      ws.querySelectorAll('.ws-canvas > .stack').forEach(stEl => {
        const s = +stEl.dataset.s, st = rel(stEl);
        if (s === 0) { const h = rel(stEl.querySelector(':scope > .hat')); keep('after', 0, 0, undefined, h.x, h.b); } else keep('above', s, undefined, undefined, st.x, st.y);
        [...stEl.children].filter(c => c.classList.contains('blk') || c.classList.contains('rep')).forEach((el, i) => {
          const r = rel(el); keep('after', s, i + 1, undefined, r.x, r.b);
          if (!el.classList.contains('rep') || d.hasRep) return;
          const body = el.querySelector(':scope > .rep-body'), bl = [...body.children].filter(c => c.classList.contains('blk')), br = rel(body);
          for (let j = 0; j <= bl.length; j++) keep('body', s, i, j, br.x, j < bl.length ? rel(bl[j]).y : bl.length ? rel(bl[bl.length - 1]).b : br.y);
        });
      });
      return pts;
    }

    function frame(d) {
      d.raf = 0; if (!d.on) return;
      const ws = wsEl(d.p), r = d.wsr; let again = false;
      if (inRect(d.cx, d.cy, r)) {                      // autoscroll cerca de los bordes del área
        const E = 38, V = 14, sy = ws.scrollTop, sx = ws.scrollLeft;
        if (d.cy < r.top + E) ws.scrollTop -= V; else if (d.cy > r.bottom - E) ws.scrollTop += V;
        if (d.cx < r.left + E) ws.scrollLeft -= V; else if (d.cx > r.right - E) ws.scrollLeft += V;
        again = ws.scrollTop !== sy || ws.scrollLeft !== sx;
      }
      d.ghost.style.transform = `translate(${d.cx - d.off.x}px,${d.cy - d.off.y}px)`;
      update(d);
      if (again) schedule(d);
    }

    // Lugar al que se encastraría ahora (o null) según la punta de arriba de lo arrastrado
    function aim(d) {
      const ws = wsEl(d.p), inWs = inRect(d.cx, d.cy, d.wsr);
      d.gx = d.cx - d.off.x - d.base.x + ws.scrollLeft; d.gy = d.cy - d.off.y - d.base.y + ws.scrollTop;
      d.inWs = inWs;
      return inWs ? nearest(d.pts, d.gx, d.gy, d.gh) : null;
    }
    function spec(d, pt) {
      const t = { kind: pt.kind, s: pt.s, i: pt.i, j: pt.j };
      if (pt.kind === 'above') { t.x = pt.x; t.y = Math.max(PAD, pt.y - d.gh); }
      return t;
    }
    function update(d) {
      const best = aim(d), key = best ? best.pt.key : '';
      if (key !== d.key) { d.key = key; d.best = best; preview(d, best); }
      d.ghost.classList.toggle('del', !d.inWs);
      wsEl(d.p).classList.toggle('drop-on', d.inWs);
    }
    // Hueco del tamaño de lo que se lleva, en el lugar donde se encastraría
    function preview(d, best) {
      if (d.shift) { d.shift.el.style.top = d.shift.top; d.shift = null; }
      d.ph.remove(); d.bad = false;
      if (!best) return;
      const pt = best.pt, ws = wsEl(d.p), st = ws.querySelector(`.ws-canvas > .stack[data-s="${pt.s}"]`); if (!st) return;
      d.bad = !drop(model(d.p), d.taken, spec(d, pt), { max: host.max() }).ok;
      d.ph.classList.toggle('bad', d.bad);
      const items = [...st.children].filter(c => c.classList.contains('blk') || c.classList.contains('rep'));
      if (pt.kind === 'body') {
        const body = items[pt.i].querySelector(':scope > .rep-body');
        body.insertBefore(d.ph, [...body.children].filter(c => c.classList.contains('blk'))[pt.j] || null);
      } else if (pt.kind === 'above') {
        d.shift = { el: st, top: st.style.top }; st.style.top = Math.max(PAD, pt.y - d.gh) + 'px';
        st.insertBefore(d.ph, st.firstChild);
      } else st.insertBefore(d.ph, items[pt.i] || st.querySelector(':scope > .slot'));
    }

    function end(d, e, cancel) {
      DRAG.delete(d.id);
      if (!d.on) return;
      cancelAnimationFrame(d.raf); d.raf = 0; d.on = false;
      const p = d.p, ws = wsEl(p), panel = $('#panel-' + p);
      if (e && !cancel) { d.cx = e.clientX; d.cy = e.clientY; }
      const best = cancel ? null : aim(d);
      if (d.shift) { d.shift.el.style.top = d.shift.top; d.shift = null; }
      d.ph.remove(); d.ghost.remove();
      try { document.body.releasePointerCapture(d.id); } catch (err) {}
      panel.classList.remove('dragging', 'drag-del'); ws.classList.remove('drag-on', 'drop-on');
      setTimeout(() => { if (swallow[p] === d.token) swallow[p] = 0; }, 60);
      const restore = () => { setModel(p, d.orig); host.render(p); };
      if (cancel || host.busy(p) || !host.active()) return restore();
      if (!d.inWs) {                                    // afuera del área: lo que venía del programa se borra
        if (d.src.kind === 'blk') { host.sound('del'); host.render(p); }
        return;
      }
      const t = best ? spec(d, best.pt) : { kind: 'free', x: Math.max(PAD, d.gx), y: Math.max(PAD, d.gy) };
      const r = drop(model(p), d.taken, t, { max: host.max() });
      if (!r.ok) { restore(); return host.full(p); }  // no entra: vuelve a donde estaba
      setModel(p, r);
      const where = t.kind === 'free' ? { s: r.loose.length, i: 0 } : t.kind === 'body' ? { s: t.s, i: t.i, j: t.j } : { s: t.s, i: t.kind === 'above' ? 0 : t.i };
      host.flash(Object.assign({ p }, where));
      const last = d.taken[d.taken.length - 1];
      if (last && isRep(last) && !last.body.length && !r.wrapped) host.say('Poné adentro lo que se repite.');
      if (d.src.kind === 'pal') host.done(p, d.src.act);
      host.sound('drop'); host.render(p);
    }

    // Acomoda el lienzo: pilas sueltas dentro del área (también si cambió de tamaño) y scroll si sobra
    function fit(p, scroll) {
      const ws = wsEl(p), cv = ws && ws.firstElementChild; if (!cv) return;
      const loose = host.S.loose[p]; let R = 0, B = 0;
      [...cv.children].forEach(el => {
        const s = +el.dataset.s, w = el.offsetWidth;
        if (s > 0 && loose[s - 1]) {
          const m = loose[s - 1], x = Math.max(PAD, Math.min(m.x, ws.clientWidth - w - PAD)), y = Math.max(PAD, m.y);
          if (x !== m.x || y !== m.y) { m.x = x; m.y = y; el.style.left = x + 'px'; el.style.top = y + 'px'; }
        }
        R = Math.max(R, el.offsetLeft + w); B = Math.max(B, el.offsetTop + el.offsetHeight);
      });
      cv.style.width = Math.max(ws.clientWidth, R + PAD) + 'px'; cv.style.height = Math.max(ws.clientHeight, B + PAD) + 'px';
      if (scroll) { ws.scrollLeft = scroll.x; ws.scrollTop = scroll.y; }
    }
    function paint(p, html) {
      const ws = wsEl(p), sc = { x: ws.scrollLeft, y: ws.scrollTop };
      ws.innerHTML = html; fit(p, sc);
    }
    ['A', 'B'].forEach(p => new ResizeObserver(() => fit(p)).observe(wsEl(p)));
    return { cancelAll, cancel: p => [...DRAG.values()].filter(d => d.p === p).forEach(d => end(d, null, true)), paint, fit, dragging: p => [...DRAG.values()].some(d => d.p === p && d.on) };
  };

  root.Workspace = WS;
  if (typeof module !== 'undefined' && module.exports) module.exports = WS;
})(typeof window !== 'undefined' ? window : globalThis);
