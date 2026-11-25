// Niveles de 2.º grado: 6 mundos de 6 niveles. Mismo lenguaje de mapa que levels.js, más:
// ? = cofre sorpresa (se abre al pisarlo) | boxes: 'star' estrella o nada · 'ghost' estrella o fantasma · 'dark' fantasma o nada
// houses: { A: [[x,y],…] } casitas que se mueven (en el mapa no va la a/b de ese chico; se dibujan punteadas)
// Herramientas nuevas: h = repetir hasta la casita · c = si hay estrella, recoger · g = si hay fantasma, alumbrar
// par: bloques de la solución de cada chico. Ganar con los dos ≤ par da el 💎 (las soluciones viven en tools/solutions-g2.mjs)
// first: quién corre primero (niveles con botón rojo) | need: hay que juntar todas las estrellas
(function (G) {
  const BASE = ['u', 'd', 'l', 'r', 'rep'];
  G.WORLDS2 = [
    { name: 'El parque', emoji: '🎡', theme: 'Repetir' },
    { name: 'La ciudad', emoji: '🏙️', theme: 'Repetir con 3 bloques' },
    { name: 'La noche', emoji: '🌙', theme: 'Repetir hasta la casita' },
    { name: 'El castillo', emoji: '🏰', theme: 'Si hay estrella' },
    { name: 'La mansión', emoji: '👻', theme: 'Si hay fantasma' },
    { name: 'El volcán', emoji: '🌋', theme: 'Todo junto' }
  ];
  G.STICKERS2 = ['🎠', '🎡', '🎢', '🎈', '🎪', '🍦',
    '🚌', '🚕', '🚒', '🚓', '🚲', '🚦',
    '🌙', '🦇', '🌠', '🔭', '🌌', '🕯️',
    '🏰', '🛡️', '⚔️', '🐉', '🤴', '🗝️',
    '👻', '🎃', '🕸️', '🦴', '🧙', '🪄',
    '🌋', '🔥', '🔮', '🧯', '🦎', '🪨'];
  G.THEMES2 = [
    { trees: ['🌳', '🎪', '🌳', '🌲', '🌳'], deco: ['🎈', '🌼', '🎠', '🌷', '🎈'] },
    { trees: ['🏢', '🏬', '🏣', '🏢', '🏫'], deco: ['🚏', '🌳', '🚧', '🚏', '🌷'] },
    { trees: ['🌲', '🌑', '🌲', '🪨', '🌲'], deco: ['✨', '🦉', '🌙', '✨', '🦇'] },
    { trees: ['🧱', '🏰', '🧱', '🧱', '🗼'], deco: ['🚩', '🛡️', '🕯️', '🚩', '⚔️'] },
    { trees: ['🪦', '🌲', '🪦', '🕸️', '🌲'], deco: ['🦇', '🎃', '🕸️', '🕯️', '🦇'] },
    { trees: ['🌋', '🪨', '🔥', '🪨', '🌋'], deco: ['🔥', '🪨', '🦎', '🔥', '♨️'] }
  ];
  // Manito guía: el primer nivel de cada bloque nuevo
  G.TUTO2 = { 12: ['h', 'r', 'ready'], 18: ['c', 'ready'], 24: ['g', 'ready'] };
  G.LEVELS2 = [
    /* ---------------- Mundo 1: El parque (repetir, programas cortos) ---------------- */
    {
      name: '¡A repetir!', tools: BASE, max: 4, par: { A: 2, B: 2 },
      text: '🔁 ➡️', say: '¡Repetí una flecha para llegar lejos! Y fijate si podés con pocos bloques.',
      map: ['f.....f',
            'A.....a',
            '.......',
            'b.....B',
            'f.....f']
    },
    {
      name: 'Para abajo y para arriba', tools: BASE, max: 4, par: { A: 2, B: 2 },
      text: '🔁 ⬇️ ⬆️', say: 'Uno baja y la otra sube. ¡Repetí!',
      map: ['A.f.b',
            '.....',
            '.f.f.',
            '.....',
            '.f.f.',
            '.....',
            'a.f.B']
    },
    {
      name: 'La escalera del parque', tools: BASE, max: 5, par: { A: 3, B: 3 },
      text: '🔁 ➡️⬇️', say: 'Una escalera: adentro del repetir van dos flechas.',
      map: ['A.....B',
            '.f...f.',
            '.......',
            '.f...f.',
            '..b.a..']
    },
    {
      name: '¿Dónde termina?', mode: 'predict', tools: [], max: 9,
      text: '🤔 🍎🍌🍇', say: '¿En qué fruta termina? Seguí las flechas con el dedo.',
      pre: { A: '3(rd)r', B: '2(ld)2(d)' },
      opts: { A: [[3, 3], [4, 3], [3, 4]], B: [[2, 4], [4, 3], [4, 4]] },
      map: ['A.....B',
            '.f...f.',
            '.......',
            '.f...f.',
            '.......']
    },
    {
      name: 'Un paso y juntar', tools: [...BASE, 'j'], max: 6, need: true, par: { A: 4, B: 4 },
      text: '🔁 ⬇️ 🧺', say: 'Bajá juntando las estrellas: un paso y juntar, repetido.',
      map: ['fA...Bf',
            '.*...*.',
            '.*...*.',
            '.*...*.',
            '.a...b.']
    },
    {
      name: 'Alrededor del lago', tools: [...BASE, 'j'], max: 8, need: true, par: { A: 6, B: 6 },
      text: '🔁 ⭐ 🌊', say: 'Dos pasos y juntar, repetido. Después, doblá.',
      map: ['A.*.*.*',
            'b~~~~~.',
            '.~~~~~.',
            '.~~~~~a',
            '*.*.*.B']
    },
    /* ---------------- Mundo 2: La ciudad (3 bloques adentro, puertas, bichitos) ---------------- */
    {
      name: 'La cuadra', tools: BASE, max: 6, par: { A: 4, B: 4 },
      text: '🔁 ➡️➡️⬇️', say: '¡Tres flechas adentro del repetir!',
      map: ['A.....B',
            '.#...#.',
            '...#...',
            'b.....a']
    },
    {
      name: 'La puerta de la ciudad', tools: BASE, max: 6, first: 'A', par: { A: 4, B: 3 },
      text: '🔴 → 🚪', say: 'Tito pisa el botón rojo y le abre la puerta a Lula.',
      map: ['A.....f',
            '.#####.',
            '.o...a.',
            '######B',
            'b..D...']
    },
    {
      name: 'Bichitos en la ciudad', tools: BASE, max: 7, par: { A: 5, B: 5 },
      text: '🐛 🐛', say: '¡Dos bichitos! Cada uno tiene una flecha mal. Arréglenlas.',
      pre: { A: '4(ru)2(r)', B: '4(ld)2(r)' },
      map: ['A.....B',
            '.f.~.f.',
            '#.....#',
            '.f...f.',
            'b.....a']
    },
    {
      name: '¿Dónde termina la ciudad?', mode: 'predict', tools: [], max: 9,
      text: '🤔 🔁', say: '¿En qué fruta termina? Hay tres flechas adentro del repetir.',
      pre: { A: '2(rrd)l', B: '2(lld)u' },
      opts: { A: [[4, 2], [2, 2], [3, 2]], B: [[2, 2], [2, 1], [3, 1]] },
      map: ['A.....B',
            '.f...f.',
            '.......',
            '.f.#.f.',
            '.......']
    },
    {
      name: 'El semáforo', tools: BASE, max: 7, first: 'A', par: { A: 5, B: 5 },
      text: '🔴 → 🚪 🔁', say: 'Tito baja la escalera hasta el botón rojo. Después Lula pasa por la puerta.',
      map: ['A.....B',
            '.f...f.',
            '..o.D..',
            '.f...f.',
            '..a.b..']
    },
    {
      name: '¡Gran final de la ciudad!', tools: [...BASE, 'j'], max: 7, need: true, first: 'A', par: { A: 5, B: 5 },
      text: '🏆 🔁 🧺 🚪', say: 'Escaleras con estrellas. Tito abre la puerta de Lula en el camino.',
      map: ['A.fb.f.',
            '.*.*...',
            '..*o*..',
            '...*D*.',
            '...a..B']
    },
    /* ---------------- Mundo 3: La noche (repetir hasta la casita) ---------------- */
    {
      name: '¡La casita se mueve!', tools: ['r', 'l', 'h'], max: 3, par: { A: 2, B: 2 },
      houses: { A: [[3, 1], [6, 1]], B: [[3, 3], [0, 3]] },
      text: '🌙 🏠❓ 🔁🏠', say: '¡De noche la casita cambia de lugar! No se puede contar los pasos. Usá el bloque nuevo: repetir hasta la casita.',
      map: ['f.....f',
            'A......',
            '.......',
            '......B',
            'f.....f']
    },
    {
      name: 'Hacia abajo', tools: ['u', 'd', 'h'], max: 3, par: { A: 2, B: 2 },
      houses: { A: [[0, 3], [0, 6]], B: [[4, 3], [4, 0]] },
      text: '🔁🏠 ⬇️ ⬆️', say: 'La casita puede estar cerca o lejos. ¡Repetí hasta llegar!',
      map: ['A...f',
            '.....',
            '.f.f.',
            '.....',
            '.f.f.',
            '.....',
            'f...B']
    },
    {
      name: 'La escalera de la noche', tools: ['u', 'd', 'l', 'r', 'h'], max: 4, par: { A: 3, B: 3 },
      houses: { A: [[2, 2], [4, 4]], B: [[4, 2], [2, 4]] },
      text: '🔁🏠 ➡️⬇️', say: 'Una escalera hasta la casita. Dos flechas adentro.',
      map: ['A.....B',
            '.f...f.',
            '.......',
            '.f...f.',
            '.......']
    },
    {
      name: 'La flecha equivocada', tools: ['u', 'd', 'l', 'r', 'h'], max: 3, par: { A: 2, B: 2 },
      houses: { A: [[2, 1], [5, 1]], B: [[4, 3], [1, 3]] },
      text: '🐛 🔁🏠', say: '¡Bichito! Hay una flecha mal adentro del repetir hasta la casita.',
      pre: { A: 'h(l)', B: 'h(r)' },
      map: ['.f...f.',
            'A......',
            '.~...~.',
            '......B',
            'f.....f']
    },
    {
      name: 'La puerta de la noche', tools: [...BASE, 'h'], max: 6, first: 'A', par: { A: 4, B: 3 },
      houses: { A: [[4, 0], [6, 0]], B: [[2, 3], [0, 3]] },
      text: '🔴 🚪 🔁🏠', say: 'Tito pisa el botón rojo y busca su casita. Lula baja, cruza la puerta y busca la suya.',
      map: ['A.o....',
            '#######',
            '######B',
            '.f.D...']
    },
    {
      name: '¡La gran noche!', tools: ['u', 'd', 'l', 'r', 'h'], max: 5, par: { A: 4, B: 4 },
      houses: { A: [[4, 2], [6, 3]], B: [[2, 2], [0, 3]] },
      text: '🏆 🔁🏠', say: '¡El gran final de la noche! Tres flechas adentro del repetir hasta la casita.',
      map: ['A.....B',
            '.......',
            '...~...',
            '.f...f.']
    },
    /* ---------------- Mundo 4: El castillo (si hay estrella, recoger) ---------------- */
    {
      name: 'El primer cofre', tools: ['r', 'l', 'c'], max: 4, need: true, boxes: 'star', par: { A: 3, B: 3 },
      text: '🎁 👀⭐🧺', say: '¡Hay un cofre sorpresa! A veces tiene una estrella y a veces nada. Usá el bloque nuevo: si hay estrella, recoger.',
      map: ['f.....f',
            'A?a....',
            '.......',
            '..b?B..',
            'f.....f']
    },
    {
      name: 'Tres cofres', tools: [...BASE, 'c'], max: 6, need: true, boxes: 'star', par: { A: 4, B: 4 },
      text: '🔁 🎁🎁🎁', say: 'Tres cofres seguidos. ¡Un paso y recoger, repetido!',
      map: ['f.....B',
            'A???a.?',
            '.f...f?',
            '.....f?',
            'f....fb']
    },
    {
      name: 'La escalera de cofres', tools: [...BASE, 'c'], max: 6, need: true, boxes: 'star', par: { A: 5, B: 5 },
      text: '🔁 ↘️ 🎁', say: 'Escalera con un cofre en cada escalón: dos flechas y recoger.',
      map: ['A..b...',
            '.?.?...',
            '..?.?..',
            '...?.?.',
            '...a..B']
    },
    {
      name: 'Cofres con bichitos', tools: [...BASE, 'c'], max: 7, need: true, boxes: 'star', par: { A: 5, B: 5 },
      text: '🐛 🎁', say: 'Hay un bichito en cada escalera. ¡Encuentren la flecha que está mal!',
      pre: { A: '3(ldc)u', B: '3(rdc)u' },
      map: ['...b..A',
            '...?.?.',
            '..?.?..',
            '.?.?...',
            'B..a...']
    },
    {
      name: 'Cofres y botón', tools: [...BASE, 'c'], max: 6, need: true, first: 'A', boxes: 'star', par: { A: 5, B: 5 },
      text: '🎁 🔴 🚪', say: 'Tito recoge, pisa el botón rojo y llega. Lula sube, recoge y cruza la puerta.',
      map: ['A###b',
            '?###.',
            '?###.',
            'o###D',
            '.###?',
            'a###?',
            '####B']
    },
    {
      name: 'El gran castillo', tools: [...BASE, 'c'], max: 7, need: true, first: 'A', boxes: 'star', par: { A: 6, B: 5 },
      text: '🏆 🎁 🔴 🚪', say: '¡El gran final del castillo! Escaleras, cofres y una puerta.',
      map: ['...oa.B',
            '...?D?.',
            '..?.?..',
            '.?.?...',
            'A..b...']
    },
    /* ---------------- Mundo 5: La mansión (si hay fantasma, alumbrar) ---------------- */
    {
      name: 'El primer fantasma', tools: ['r', 'l', 'rep', 'g'], max: 6, boxes: 'dark', par: { A: 5, B: 5 },
      text: '🎁 👻 👀👻🔦', say: '¡Cuidado! En los cofres a veces hay un fantasma. Si lo dejás, se asusta. Usá el bloque nuevo: si hay fantasma, alumbrar.',
      map: ['#######',
            'A.?...a',
            '#######',
            'b...?.B',
            '#######']
    },
    {
      name: 'Fantasmas en fila', tools: ['u', 'd', 'rep', 'g'], max: 7, boxes: 'dark', par: { A: 5, B: 6 },
      text: '🔁 👻 🔦', say: 'Cofres seguidos y cofres salteados. ¡Alumbrá cada vez!',
      map: ['A###B',
            '?###.',
            '?###?',
            '?###.',
            '.###?',
            '.###.',
            'a###b']
    },
    {
      name: 'Estrella o fantasma', tools: [...BASE, 'c', 'g'], max: 6, need: true, boxes: 'ghost', par: { A: 5, B: 5 },
      text: '🎁 ⭐ 👻', say: 'Ahora en el cofre puede haber una estrella o un fantasma. ¡Usá los dos bloques!',
      map: ['f.....B',
            '.f...f?',
            'A???a.?',
            '.f...f?',
            'f.....b']
    },
    {
      name: 'Un fantasma sin luz', tools: [...BASE, 'c', 'g'], max: 7, need: true, boxes: 'ghost', par: { A: 5, B: 5 },
      text: '🐛 👻', say: '¡Bichitos! A Tito se le olvidó un bloque y a Lula le sobra uno repetido.',
      pre: { A: '3(dc)d', B: '3(dgg)d' },
      map: ['fA...Bf',
            '.?...?.',
            '.?...?.',
            '.?...?.',
            '.a...b.']
    },
    {
      name: 'La puerta de la mansión', tools: [...BASE, 'c', 'g'], max: 8, need: true, first: 'A', boxes: 'ghost', par: { A: 6, B: 6 },
      text: '🔴 🚪 🎁', say: 'Tito pasa por dos cofres y pisa el botón rojo. Lula atraviesa dos cofres y la puerta.',
      map: ['A??o.a.',
            '#######',
            'b..D??B']
    },
    {
      name: '¡La gran mansión!', tools: [...BASE, 'c', 'g'], max: 8, need: true, boxes: 'ghost', par: { A: 6, B: 6 },
      text: '🏆 👻 ⭐', say: '¡El gran final de la mansión! Dos caminos con cofres.',
      map: ['A???...',
            '.#...#.',
            '.f...f.',
            '.b..??B',
            '...a...']
    },
    /* ---------------- Mundo 6: El volcán (todo junto) ---------------- */
    {
      name: 'Camino al volcán', tools: ['u', 'd', 'l', 'r', 'h', 'c'], max: 4, need: true, boxes: 'star', par: { A: 3, B: 3 },
      houses: { A: [[4, 1], [6, 1]], B: [[2, 3], [0, 3]] },
      text: '🏠❓ 🎁 ⭐', say: 'La casita se mueve y hay cofres en el camino. ¡Repetí hasta la casita y recogé!',
      map: ['f.....f',
            'A???...',
            '.......',
            '...???B',
            'f.....f']
    },
    {
      name: 'La cueva', tools: ['u', 'd', 'l', 'r', 'h', 'g'], max: 4, boxes: 'dark', par: { A: 3, B: 3 },
      houses: { A: [[4, 2], [5, 2]], B: [[6, 4], [6, 5]] },
      text: '🏠❓ 👻 🔦', say: 'En la cueva hay fantasmas y la casita se mueve. ¡Alumbrá en cada paso!',
      map: ['f.....B',
            '.f....?',
            'A???..?',
            '.f....?',
            '.......',
            '.f.....']
    },
    {
      name: 'Vuelta al volcán', tools: ['u', 'd', 'l', 'r', 'h', 'c'], max: 5, need: true, first: 'A', boxes: 'star', par: { A: 3, B: 4 },
      houses: { A: [[4, 0], [6, 0]], B: [[2, 3], [0, 3]] },
      text: '🔴 🚪 🎁 🏠❓', say: 'Tito pisa el botón rojo y busca su casita. Lula baja y cruza la puerta.',
      map: ['A?o....',
            '#######',
            '######B',
            '....D?.']
    },
    {
      name: 'El volcán enojado', tools: ['u', 'd', 'l', 'r', 'h', 'c'], max: 4, need: true, boxes: 'star', par: { A: 3, B: 3 },
      houses: { A: [[1, 4], [1, 6]], B: [[5, 2], [5, 0]] },
      text: '🐛 🔁🏠 🎁', say: '¡Bichitos en el volcán! Cada uno tiene una flecha mal.',
      pre: { A: 'h(rc)', B: 'h(dc)' },
      map: ['fA.....',
            '.?.....',
            '.?.....',
            '.?...?.',
            '.....?.',
            '.....?.',
            'f....B.']
    },
    {
      name: 'El pasillo del volcán', tools: ['u', 'd', 'l', 'r', 'h', 'c', 'g'], max: 5, need: true, boxes: 'ghost', par: { A: 4, B: 4 },
      houses: { A: [[0, 4], [0, 6]], B: [[4, 2], [4, 0]] },
      text: '🏠❓ ⭐ 👻', say: 'Estrellas, fantasmas y una casita que se mueve. ¡Todos los bloques juntos!',
      map: ['A###.',
            '?###.',
            '?###.',
            '?###?',
            '.###?',
            '.###?',
            '.###B']
    },
    {
      name: '¡El gran final!', tools: [...BASE, 'h', 'c', 'g'], max: 7, need: true, first: 'A', boxes: 'ghost', par: { A: 5, B: 5 },
      houses: { A: [[5, 1], [6, 1]], B: [[2, 4], [0, 4]] },
      text: '🏆 🌋', say: '¡El gran final! Todos los bloques: repetir hasta la casita, estrellas, fantasmas y la puerta.',
      map: ['A######',
            '.???o..',
            '#######',
            '######B',
            '...D??.']
    }
  ];
})(typeof window !== 'undefined' ? window : globalThis);
