/* =========================================================
   Programitos — 🪙 monedas y 👕 ropero (catálogo y reglas, sin DOM)
   Cada prenda se dibuja adentro del SVG del personaje (así se ve en el
   tablero, en el panel, en la tarjeta de ganar, en la carrera y en el
   inicio). Casi todo son formas dibujadas a mano (no dependen de la
   fuente de emojis); solo las huellas que quedan al caminar son emojis.
   Reglas puras: tools/check-wardrobe.mjs las prueba en node.
   ========================================================= */
(function (root) {
  'use strict';
  const SLOTS = ['head', 'face', 'hand', 'trail'];
  const SLOT_ICO = { head: '🎩', face: '🕶️', hand: '🎈', trail: '👣' };
  // Puntos de anclaje de cada personaje en su dibujo de 100x100: ojos, nariz/boca y mano
  const AN = { A: { ex: 10, ey: 44, ny: 52, hx: 89, hy: 46 }, B: { ex: 12, ey: 46, ny: 57, hx: 89, hy: 62 } };
  const st = (f, s, w) => `fill="${f}" stroke="${s}" stroke-width="${w || 2.5}" stroke-linejoin="round"`;
  const star = (cx, cy, r, f) => { const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; p.push((cx + rr * Math.cos(a)).toFixed(1) + ',' + (cy + rr * Math.sin(a)).toFixed(1)); } return `<polygon points="${p.join(' ')}" fill="${f}" stroke="#c99a00" stroke-width="1.5" stroke-linejoin="round"/>`; };
  // id, slot, precio (3 a 15), cómo se dibuja (a = anclaje), recorte para la celda del ropero (vb)
  const ITEMS = [
    { id: 'gorra', slot: 'head', price: 3, vb: '24 0 62 30', draw: () => `<path d="M30 22 Q50 -4 70 22 Z" ${st('#e63946', '#a3202c')}/><rect x="56" y="18" width="26" height="6" rx="3" ${st('#e63946', '#a3202c', 2)}/><circle cx="50" cy="8" r="3" fill="#fff"/>` },
    { id: 'mono', slot: 'head', price: 4, vb: '48 0 40 34', draw: () => `<path d="M68 17 L55 8 L55 26 Z M68 17 L81 8 L81 26 Z" ${st('#ff5fa8', '#c93a82')}/><circle cx="68" cy="17" r="4.5" ${st('#ffd23f', '#c99a00', 2)}/>` },
    { id: 'copa', slot: 'head', price: 5, vb: '22 0 56 30', draw: () => `<rect x="34" y="2" width="32" height="18" rx="3" ${st('#2d2a4a', '#1a1830')}/><rect x="34" y="12" width="32" height="5" fill="#e63946"/><rect x="25" y="18" width="50" height="5" rx="2.5" ${st('#2d2a4a', '#1a1830')}/>` },
    { id: 'fiesta', slot: 'head', price: 6, vb: '28 0 44 28', draw: () => `<path d="M34 22 L50 3 L66 22 Z" ${st('#9b5de5', '#6a2fc0')}/><path d="M40 15 L60 15 M37 19 L63 19" stroke="#ffd23f" stroke-width="3"/><circle cx="50" cy="3" r="4" ${st('#ffd23f', '#c99a00', 1.5)}/>` },
    { id: 'corona', slot: 'head', price: 9, vb: '26 0 48 28', draw: () => `<path d="M31 22 L33 6 L42 14 L50 3 L58 14 L67 6 L69 22 Z" ${st('#ffd23f', '#c99a00')}/><circle cx="50" cy="16" r="2.6" fill="#e63946"/><circle cx="40" cy="18" r="2" fill="#3b8cff"/><circle cx="60" cy="18" r="2" fill="#3b8cff"/>` },
    { id: 'mago', slot: 'head', price: 12, vb: '22 0 56 30', draw: () => `<path d="M31 22 L53 1 L70 22 Z" ${st('#3b3a9a', '#25246b')}/><ellipse cx="50" cy="22" rx="26" ry="4.5" ${st('#3b3a9a', '#25246b')}/>${star(50, 13, 5, '#ffd23f')}` },
    { id: 'anteojos', slot: 'face', price: 3, vb: '26 34 48 22', draw: a => `<circle cx="${50 - a.ex}" cy="${a.ey}" r="9.5" fill="rgba(255,255,255,.35)" stroke="#2d2a4a" stroke-width="3"/><circle cx="${50 + a.ex}" cy="${a.ey}" r="9.5" fill="rgba(255,255,255,.35)" stroke="#2d2a4a" stroke-width="3"/><path d="M${50 - a.ex + 9.5} ${a.ey} L${50 + a.ex - 9.5} ${a.ey}" stroke="#2d2a4a" stroke-width="3"/>` },
    { id: 'nariz', slot: 'face', price: 4, vb: '40 40 20 20', draw: a => `<circle cx="50" cy="${a.ny}" r="6" ${st('#e63946', '#a3202c', 2)}/><circle cx="48" cy="${a.ny - 2}" r="1.8" fill="#fff"/>` },
    { id: 'sol', slot: 'face', price: 5, vb: '24 34 52 22', draw: a => `<rect x="${50 - a.ex - 11}" y="${a.ey - 7}" width="22" height="14" rx="6" fill="#1d1d2b"/><rect x="${50 + a.ex - 11}" y="${a.ey - 7}" width="22" height="14" rx="6" fill="#1d1d2b"/><path d="M${50 - a.ex + 11} ${a.ey - 3} L${50 + a.ex - 11} ${a.ey - 3}" stroke="#1d1d2b" stroke-width="3"/><path d="M${50 - a.ex - 7} ${a.ey - 4} l5 0 M${50 + a.ex - 7} ${a.ey - 4} l5 0" stroke="#fff" stroke-width="2" opacity=".6"/>` },
    { id: 'bigote', slot: 'face', price: 6, vb: '28 44 44 20', draw: a => `<path d="M50 ${a.ny} Q42 ${a.ny - 7} 31 ${a.ny + 2} Q41 ${a.ny + 3} 50 ${a.ny + 1} Q59 ${a.ny + 3} 69 ${a.ny + 2} Q58 ${a.ny - 7} 50 ${a.ny} Z" fill="#5b3a1e" stroke="#3b2412" stroke-width="1.5" stroke-linejoin="round"/>` },
    { id: 'globo', slot: 'hand', price: 3, vb: '70 0 30 60', draw: a => `<path d="M${a.hx} ${a.hy} L${a.hx - 2} ${a.hy - 20}" stroke="#555" stroke-width="1.8" fill="none"/><ellipse cx="${a.hx - 2}" cy="${a.hy - 30}" rx="9" ry="11" ${st('#ff5fa8', '#c93a82', 2)}/><path d="M${a.hx - 2} ${a.hy - 19} l-3 4 l6 0 z" fill="#c93a82"/>` },
    { id: 'bandera', slot: 'hand', price: 5, vb: '74 8 26 60', draw: a => `<path d="M${a.hx} ${a.hy + 14} L${a.hx} ${a.hy - 24}" stroke="#7a4518" stroke-width="3" stroke-linecap="round"/><path d="M${a.hx} ${a.hy - 24} L${a.hx + 10} ${a.hy - 19} L${a.hx} ${a.hy - 13} Z" ${st('#e63946', '#a3202c', 1.5)}/>` },
    { id: 'helado', slot: 'hand', price: 7, vb: '76 28 26 44', draw: a => `<path d="M${a.hx - 6} ${a.hy - 1} L${a.hx + 6} ${a.hy - 1} L${a.hx} ${a.hy + 15} Z" ${st('#e8a200', '#a36f00', 1.8)}/><circle cx="${a.hx}" cy="${a.hy - 7}" r="8" ${st('#ff8cc6', '#d94f93', 1.8)}/><circle cx="${a.hx + 2}" cy="${a.hy - 15}" r="2.4" fill="#e63946"/>` },
    { id: 'varita', slot: 'hand', price: 8, vb: '72 8 28 56', draw: a => `<path d="M${a.hx - 5} ${a.hy + 14} L${a.hx + 3} ${a.hy - 12}" stroke="#8b5a2b" stroke-width="4" stroke-linecap="round"/>${star(a.hx + 4, a.hy - 18, 8, '#ffd23f')}` },
    { id: 'copa2', slot: 'hand', price: 15, vb: '74 24 26 42', draw: a => `<path d="M${a.hx - 8} ${a.hy - 12} L${a.hx + 8} ${a.hy - 12} Q${a.hx + 7} ${a.hy + 4} ${a.hx} ${a.hy + 4} Q${a.hx - 7} ${a.hy + 4} ${a.hx - 8} ${a.hy - 12} Z" ${st('#ffd23f', '#c99a00', 2)}/><rect x="${a.hx - 1.5}" y="${a.hy + 4}" width="3" height="6" fill="#c99a00"/><rect x="${a.hx - 6}" y="${a.hy + 10}" width="12" height="4" rx="1.5" ${st('#ffd23f', '#c99a00', 1.5)}/>` },
    { id: 'margarita', slot: 'trail', price: 3, emoji: '🌼' },
    { id: 'trebol', slot: 'trail', price: 5, emoji: '🍀' },
    { id: 'corazon', slot: 'trail', price: 6, emoji: '❤️' },
    { id: 'estrella', slot: 'trail', price: 8, emoji: '⭐' },
    { id: 'mariposa', slot: 'trail', price: 10, emoji: '🦋' },
    { id: 'brillo', slot: 'trail', price: 11, emoji: '✨' },
    { id: 'arcoiris', slot: 'trail', price: 12, emoji: '🌈' },
    { id: 'fuego', slot: 'trail', price: 15, emoji: '🔥' }
  ];
  const BY_ID = Object.fromEntries(ITEMS.map(i => [i.id, i]));

  // Capas para meter adentro del SVG del personaje (who = 'A' | 'B'; wear = { head, face, hand, trail })
  function layers(who, wear) {
    if (!wear) return '';
    const a = AN[who];
    return ['face', 'head', 'hand'].map(s => { const it = BY_ID[wear[s]]; return it && it.draw ? `<g class="wd-${s}">${it.draw(a)}</g>` : ''; }).join('');
  }
  // Dibujo suelto de una prenda para la celda del ropero
  function icon(id) {
    const it = BY_ID[id]; if (!it) return '';
    if (it.emoji) return `<span class="wd-emoji">${it.emoji}</span>`;
    return `<svg viewBox="${it.vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${it.draw(AN.A)}</svg>`;
  }
  const status = (pf, p, id) => {
    const it = BY_ID[id], owned = pf.owned[p].includes(id), worn = pf.wear[p][it.slot] === id;
    return { owned, worn, affordable: owned || pf.coins[p] >= it.price };
  };
  // Tocar una prenda: puesta → se saca; mía → se pone; sin comprar y alcanza → se compra y se pone; si no alcanza: 'poor'
  function tap(pf, p, id) {
    const it = BY_ID[id]; if (!it) return { action: 'none' };
    const s = status(pf, p, id);
    if (s.owned) {
      if (s.worn) { delete pf.wear[p][it.slot]; return { action: 'off' }; }
      pf.wear[p][it.slot] = id; return { action: 'wear' };
    }
    if (pf.coins[p] < it.price) return { action: 'poor' };
    pf.coins[p] -= it.price; pf.owned[p].push(id); pf.wear[p][it.slot] = id;
    return { action: 'buy' };
  }
  // Monedas de un nivel ganado: las estrellas la primera vez, 1 si se repite; +1 por el 💎
  const levelCoins = (firstTime, stars, gem) => (firstTime ? Math.max(1, stars) : 1) + (gem ? 1 : 0);

  root.Wardrobe = { SLOTS, SLOT_ICO, ITEMS, BY_ID, AN, layers, icon, status, tap, levelCoins };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.Wardrobe;
})(typeof window !== 'undefined' ? window : globalThis);
