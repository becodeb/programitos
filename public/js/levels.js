// Mapa: . piso | f decoración (se puede pisar) | # obstáculo | ~ agua/agujero
// A/B = inicio de Tito/Lula | a/b = casita de Tito/Lula | * estrella
// o = botón mágico | D = puerta (se abre cuando alguien pisa el botón)
// mode 'predict': el programa viene armado (pre) y hay que adivinar en qué fruta termina (opts)
// j = recoger (junta la estrella de la casilla donde está parado) | need: hay que juntar todas las estrellas
// pre: programa ya cargado ("rrd", "3(rd)l" = repetir 3 veces → ↓)
(typeof window !== 'undefined' ? window : globalThis).WORLDS = [
  { name: 'La pradera', emoji: '🌳', theme: 'Secuencias' },
  { name: 'La playa', emoji: '🏖️', theme: 'Giros' },
  { name: 'La nieve', emoji: '⛄', theme: 'Trabajo en equipo' },
  { name: 'El espacio', emoji: '🚀', theme: 'Repetir' },
  { name: 'El arroyo', emoji: '🐸', theme: 'Recoger' },
  { name: 'La laguna', emoji: '🦆', theme: 'Recoger y repetir' },
  { name: 'El bosque', emoji: '🍄', theme: 'Recoger y caminos' },
  { name: 'La montaña', emoji: '🏔️', theme: 'Recoger y repetir' }
];
(typeof window !== 'undefined' ? window : globalThis).LEVELS = [
  /* ---------------- Mundo 1: Pradera ---------------- */
  {
    name: '¡Hola, amigos!', tools: ['r'], max: 5,
    text: '🏠 ➡️', say: '¡Llevá a tu amigo a su casita! Tocá la flecha. Después, los dos aprietan el botón verde.',
    map: ['.f...f.',
          '.A..a..',
          '.......',
          '.B..b..',
          'f....f.']
  },
  {
    name: 'Cada uno para un lado', tools: ['l', 'r'], max: 6,
    text: '⬅️ ➡️', say: '¡Cada uno para su lado!',
    map: ['f.....f',
          '.A...a.',
          '...f...',
          '.b...B.',
          'f.....f']
  },
  {
    name: 'Más lejos', tools: ['l', 'r'], max: 7,
    text: '⭐ ⭐', say: '¡Juntá las estrellas!',
    map: ['f.....f',
          '.A.*.*a',
          'f.f.f.f',
          'b*.*.B.',
          'f.....f']
  },
  {
    name: 'Arriba y abajo', tools: ['u', 'd', 'l', 'r'], max: 6,
    text: '⬆️ ⬇️', say: '¡Arriba y abajo!',
    map: ['.a.f.B.',
          '...#...',
          '.*.#.*.',
          '...#...',
          '.A.f.b.']
  },
  {
    name: '¡Adivinen!', mode: 'predict', tools: [], max: 9,
    text: '🤔 🍎🍌🍇', say: '¿En qué fruta termina? Elegí la fruta y apretá el botón verde.',
    pre: { A: 'rrr', B: 'llll' },
    opts: { A: [[2, 1], [3, 1], [5, 1]], B: [[4, 3], [2, 3], [0, 3]] },
    map: ['f.....f',
          'A......',
          '..f.f..',
          '......B',
          'f.....f']
  },
  {
    name: '¡Un bichito!', tools: ['u', 'd', 'l', 'r'], max: 5,
    text: '🐛 → 👆', say: '¡Un bichito! Una flecha está mal. Tocala para girarla.',
    pre: { A: 'rrlr', B: 'lllu' },
    map: ['.......',
          '.A...a.',
          '..f.f..',
          '.b...B.',
          '.......']
  },
  /* ---------------- Mundo 2: Playa ---------------- */
  {
    name: '¡A doblar!', tools: ['u', 'd', 'l', 'r'], max: 8,
    text: '↪️', say: '¡A doblar!',
    map: ['A.*#B..',
          '##.#.#*',
          '.a.#.#b',
          'f..#..f']
  },
  {
    name: 'Por la orilla', tools: ['u', 'd', 'l', 'r'], max: 7,
    text: '🌊 ❌', say: '¡No se mojen!',
    map: ['A##~##B',
          '.##~##.',
          '*##~##*',
          '..a~b..',
          'f.f~f.f']
  },
  {
    name: '¿Dónde quedan?', mode: 'predict', tools: [], max: 9,
    text: '🤔 🍎🍌🍇', say: '¿En qué fruta termina?',
    pre: { A: 'rrdd', B: 'uull' },
    opts: { A: [[2, 0], [0, 2], [2, 2]], B: [[4, 2], [6, 2], [4, 4]] },
    map: ['A......',
          '...f...',
          '.......',
          '.f.....',
          '......B']
  },
  {
    name: 'Zigzag', tools: ['u', 'd', 'l', 'r'], max: 9,
    text: '〰️ ⭐', say: '¡Zigzag!',
    map: ['A*#~#*B',
          '#.#~#.#',
          '#.*~*.#',
          '##.~.##',
          '#a.~.b#']
  },
  {
    name: 'Cangrejos traviesos', tools: ['u', 'd', 'l', 'r'], max: 5,
    text: '🐛', say: '¡Otro bichito! Arreglen las flechas.',
    pre: { A: 'rrdl', B: 'llld' },
    map: ['A..~..B',
          '##*~*##',
          'f.a~b.f']
  },
  {
    name: 'Caminos cruzados', tools: ['u', 'd', 'l', 'r'], max: 12,
    text: '⭐ ❓', say: '¿Qué camino tiene más estrellas?',
    map: ['b..*..a',
          '.##.##.',
          '...*...',
          '.##.##.',
          'A.....B']
  },
  /* ---------------- Mundo 3: Nieve ---------------- */
  {
    name: 'La puerta mágica', tools: ['u', 'd', 'l', 'r'], max: 7, first: 'A',
    text: '🔴 → 🚪', say: 'Tito pisa el botón rojo y se abre la puerta de Lula.',
    map: ['A..~B..',
          '.#.~##D',
          '.oa~ffb',
          'f..~..f']
  },
  {
    name: '¡Ahora ayuda Lula!', tools: ['u', 'd', 'l', 'r'], max: 8, first: 'B',
    text: '🔴 → 🚪', say: 'Ahora Lula pisa el botón rojo para abrirle a Tito.',
    map: ['A..~b.o',
          '##D~.#.',
          'a..~..B',
          'f.f~f.f']
  },
  {
    name: 'Huellas en la nieve', mode: 'predict', tools: [], max: 9,
    text: '🤔 🍎🍌🍇', say: '¿En qué fruta termina?',
    pre: { A: 'rrddr', B: 'uull' },
    opts: { A: [[2, 2], [3, 1], [3, 2]], B: [[5, 2], [4, 2], [4, 1]] },
    map: ['A.....f',
          'f......',
          '.......',
          'f......',
          'f.....B']
  },
  {
    name: 'El laberinto', tools: ['u', 'd', 'l', 'r'], max: 12, first: 'A',
    text: '🌀 🔴 🚪', say: '¡Un laberinto! Tito abre la puerta.',
    map: ['A.#~..B',
          '#.#~.##',
          '..*~D.*',
          '.##~.#.',
          '.oa~b..']
  },
  {
    name: '¡Se olvidó del botón!', tools: ['u', 'd', 'l', 'r'], max: 7, first: 'A',
    text: '🐛 🔴', say: '¡Tito se olvidó del botón rojo!',
    pre: { A: 'rr', B: 'rrdd' },
    map: ['A.a~B..',
          '.#.~##D',
          '.o.~ffb',
          'f..~..f']
  },
  {
    name: 'Equipo nevado', tools: ['u', 'd', 'l', 'r'], max: 10, first: 'B',
    text: '🔴 🚪 ⭐', say: 'Lula abre la puerta. ¡Busquen las estrellas!',
    map: ['a..~.*B',
          '##D~.#.',
          '.*.~.#o',
          '.##~.#.',
          'A..~b..']
  },
  /* ---------------- Mundo 4: Espacio ---------------- */
  {
    name: '¡Bloque REPETIR!', tools: ['u', 'd', 'l', 'r', 'rep'], max: 2,
    text: '🔁 ✨', say: '¡Bloque nuevo: repetir! Poné repetir, una flecha adentro, y tocá el número.',
    map: ['A.*.*.a',
          'f#f#f#f',
          'b.*.*.B']
  },
  {
    name: 'Ascensor espacial', tools: ['u', 'd', 'l', 'r', 'rep'], max: 2,
    text: '🔁 ⬆️ ⬇️', say: '¡Repetí!',
    map: ['A.f.f.b',
          '.#...#.',
          '*.f.f.*',
          '.#...#.',
          'a.f.f.B']
  },
  {
    name: 'La escalera', tools: ['u', 'd', 'l', 'r', 'rep'], max: 3,
    text: '🔁 🪜', say: '¡Una escalera! Dos flechas adentro del repetir.',
    map: ['A.#b.##',
          '#.*#*.#',
          '##..#..',
          'f##a#fB']
  },
  {
    name: 'Adivinanza espacial', mode: 'predict', tools: [], max: 9,
    text: '🤔 🔁', say: '¿En qué fruta termina?',
    pre: { A: '2(rd)r', B: '3(u)2(l)' },
    opts: { A: [[2, 2], [3, 2], [4, 2]], B: [[4, 0], [5, 1], [4, 1]] },
    map: ['A.....f',
          '.......',
          '.......',
          'f......',
          '......B']
  },
  {
    name: 'Repetir y algo más', tools: ['u', 'd', 'l', 'r', 'rep'], max: 4,
    text: '➡️ 🔁 ⬆️', say: 'Un paso, repetir, y un paso.',
    map: ['A####a#',
          '.*..*..',
          '~~~~~~~',
          '.*...*.',
          '#b####B']
  },
  {
    name: '¡Gran final!', tools: ['u', 'd', 'l', 'r', 'rep'], max: 4, first: 'A',
    text: '🏆', say: '¡El gran final!',
    map: ['A.f#f#B',
          '#.*#f#.',
          '#f.o#~D',
          'f##.a#.',
          'f##b.*.']
  },
  /* ---------------- Mundo 5: Arroyo (recoger) ---------------- */
  {
    name: '¡A juntar!', tools: ['r', 'l', 'j'], max: 4, need: true,
    text: '⭐ 🧺', say: '¡Bloque nuevo: la canasta! Parate en la estrella y tocá la canasta para juntarla.',
    map: ['f.....f',
          'A*a....',
          '.......',
          '....b*B',
          'f.....f']
  },
  {
    name: 'Dos estrellas', tools: ['r', 'l', 'j'], max: 7, need: true,
    text: '⭐ 🧺 ⭐ 🧺', say: 'Dos estrellas: hay que juntar las dos.',
    map: ['f.....f',
          'A*.*a..',
          '.......',
          '..b*.*B',
          'f.....f']
  },
  {
    name: 'Estrella escondida', tools: ['u', 'd', 'l', 'r', 'j'], max: 6, need: true,
    text: '⬆️ 🧺 ⬇️', say: 'La estrella está arriba. Subí, juntala y volvé.',
    map: ['.*....f',
          'A.a....',
          '.......',
          '....b.B',
          'f....*.']
  },
  {
    name: 'Muchas estrellas', tools: ['r', 'l', 'j'], max: 8, need: true,
    text: '⭐⭐⭐ 🧺', say: '¡Tres estrellas seguidas! Un paso y juntar, un paso y juntar.',
    map: ['f.....f',
          'A***a..',
          '.......',
          '..b***B',
          'f.....f']
  },
  {
    name: 'La vuelta del charco', tools: ['u', 'd', 'l', 'r', 'j'], max: 8, need: true,
    text: '💦 ⭐ 🧺', say: 'Juntá la estrella y después dale la vuelta al charco.',
    map: ['f......',
          'A*~.a..',
          '.......',
          '..b.~*B',
          '.......']
  },
  {
    name: 'Estrellas en equipo', tools: ['u', 'd', 'l', 'r', 'j'], max: 6, need: true, first: 'A',
    text: '⭐ 🔴 🚪', say: 'Tito junta su estrella y pisa el botón rojo. Lula junta la suya.',
    map: ['A*.oa.B',
          '######D',
          'f....*b']
  },
  /* ---------------- Mundo 6: Laguna (recoger y repetir) ---------------- */
  {
    name: 'Repetir juntar', tools: ['r', 'l', 'j', 'rep'], max: 4, need: true,
    text: '🔁 ⭐ 🧺', say: '¡Ahora con repetir! Adentro: un paso y juntar.',
    map: ['f.....f',
          'A***a..',
          '.......',
          '..b***B',
          'f.....f']
  },
  {
    name: 'Estrellas salteadas', tools: ['r', 'l', 'j', 'rep'], max: 5, need: true,
    text: '🔁 ➡️➡️🧺', say: 'Dos pasos y juntar. ¿Cuántas veces?',
    map: ['f.....f',
          'A.*.*a.',
          '.......',
          '.b*.*.B',
          'f.....f']
  },
  {
    name: 'Columna de estrellas', tools: ['u', 'd', 'l', 'r', 'j', 'rep'], max: 5, need: true,
    text: '🔁 ⬇️ 🧺', say: 'Bajá juntando todas las estrellas.',
    map: ['A.....B',
          '*.....*',
          '*.....*',
          '*.....*',
          'a.....b']
  },
  {
    name: 'La puerta de las estrellas', tools: ['u', 'd', 'l', 'r', 'j', 'rep'], max: 6, need: true, first: 'A',
    text: '🔁 🧺 🔴 🚪', say: 'Tito junta todo y abre la puerta. Lula baja a su casa.',
    map: ['A***oaB',
          '######D',
          '......b']
  },
  {
    name: 'Escalera de estrellas', tools: ['u', 'd', 'l', 'r', 'j', 'rep'], max: 6, need: true,
    text: '🔁 ↘️ 🧺', say: '¡Escalera! Adentro del repetir: derecha, abajo y juntar.',
    map: ['A.....B',
          '.*...*.',
          '..*.*..',
          '...ab..',
          'f.....f']
  },
  {
    name: '¡Gran cosecha!', tools: ['r', 'l', 'j', 'rep'], max: 4, need: true,
    text: '🏆 🔁 🧺', say: '¡El gran final! Juntá todas las estrellas.',
    map: ['f.....f',
          'A****a.',
          '.......',
          '.b****B',
          'f.....f']
  },
  /* ---------------- Mundo 7: Bosque ---------------- */
  {
    name: 'Zigzag', tools: ['u', 'd', 'l', 'r', 'j'], max: 8, need: true,
    text: '↗️ 🧺 ↘️', say: 'Subí, juntá, bajá y seguí.',
    map: ['.*.....',
          'A.*a...',
          '.......',
          '...b*.B',
          '.....*.']
  },
  {
    name: 'El árbol en el medio', tools: ['u', 'd', 'l', 'r', 'j'], max: 9, need: true,
    text: '🌳 ⭐ 🧺', say: 'Hay un árbol: dale la vuelta por arriba.',
    map: ['.......',
          'A*#*a..',
          '.......',
          '..b*#*B',
          '.......']
  },
  {
    name: 'La estrella del fondo', tools: ['r', 'l', 'j'], max: 8, need: true,
    text: '➡️ 🧺 ⬅️', say: 'La estrella está después de la casita. Andá, juntala y volvé.',
    map: ['f.....f',
          'A.a.*..',
          '.......',
          '..*.b.B',
          'f.....f']
  },
  {
    name: 'Charco largo', tools: ['u', 'd', 'l', 'r', 'j'], max: 9, need: true,
    text: '💦💦 ⭐', say: 'Juntá una, subí, juntá la otra y bajá a tu casita.',
    map: ['..*....',
          'A*~~a..',
          '.......',
          '..b~~*B',
          '....*..']
  },
  {
    name: 'Las esquinas', tools: ['u', 'd', 'l', 'r', 'j'], max: 9, need: true,
    text: '⬆️ ⭐ ➡️ ⭐', say: 'Una estrella arriba y otra lejos.',
    map: ['*...*..',
          'A...a..',
          '.......',
          '..b...B',
          '..*...*']
  },
  {
    name: 'Estrellas y puerta', tools: ['u', 'd', 'l', 'r', 'j'], max: 8, need: true, first: 'A',
    text: '⭐ 🔴 🚪 ⭐', say: 'Tito junta, pisa el botón y junta otra. Lula baja y junta dos.',
    map: ['A*.o*aB',
          '######D',
          'f..b*.*']
  },
  /* ---------------- Mundo 8: Montaña ---------------- */
  {
    name: 'Subir juntando', tools: ['u', 'd', 'l', 'r', 'j', 'rep'], max: 4, need: true,
    text: '🔁 ⬆️ 🧺', say: '¡A subir la montaña! Repetí: subir y juntar.',
    map: ['a.....b',
          '*.....*',
          '*.....*',
          '*.....*',
          'A.....B']
  },
  {
    name: 'Fila larga', tools: ['r', 'l', 'j', 'rep'], max: 4, need: true,
    text: '🔁 ⭐⭐⭐⭐⭐', say: '¡Cinco estrellas! ¿Cuántas veces repetís?',
    map: ['f.....f',
          'A*****a',
          '.......',
          'b*****B',
          'f.....f']
  },
  {
    name: 'Primero una, después repetir', tools: ['r', 'l', 'j', 'rep'], max: 7, need: true,
    text: '⭐ 🔁 ➡️➡️🧺', say: 'Juntá la primera y después repetí: dos pasos y juntar.',
    map: ['f.....f',
          'A*.*.*a',
          '.......',
          'b*.*.*B',
          'f.....f']
  },
  {
    name: 'Dos repetir', tools: ['r', 'l', 'j', 'rep'], max: 8, need: true,
    text: '🔁 ⭐⭐ 🔁 ⭐⭐', say: 'Dos grupos de estrellas: ¡dos repetir!',
    map: ['f.....f',
          'A**.**a',
          '.......',
          'b**.**B',
          'f.....f']
  },
  {
    name: 'Repetir y puerta', tools: ['u', 'd', 'l', 'r', 'j', 'rep'], max: 7, need: true, first: 'A',
    text: '🔁 🔴 🚪 🔁', say: 'Tito junta y abre la puerta. Lula baja y junta todo.',
    map: ['A***oaB',
          '######D',
          'b****..']
  },
  {
    name: '¡Cumbre!', tools: ['u', 'd', 'l', 'r', 'j', 'rep'], max: 8, need: true,
    text: '🏆 ⬆️ 🔁 ⭐', say: '¡El gran final de la montaña!',
    map: ['*****..',
          'A....a.',
          '.......',
          '.b....B',
          '..*****']
  }
];
