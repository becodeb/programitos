# Programitos 🤖💞🐱

Juego web de **programación secuencial para 1.º y 2.º grado**, pensado para jugar **de a dos en la misma compu**.

- Cada chico maneja un personaje: **Tito** (izquierda) y **Lula** (derecha). Arman su programa arrastrando bloques (estilo Scratch) y el programa corre cuando **los dos** aprietan ▶.
- **1.º**: 8 mundos de 6 niveles (secuencias, giros, trabajo en equipo, **repetir**, **recoger**).
- **2.º**: 6 mundos de 6 niveles: repetir con pocos bloques, **repetir hasta la casita**, **si hay estrella**, **si hay fantasma**, cofres sorpresa y casitas que se mueven. El 💎 premia los programas cortos.
- Al sumarse, los dos grados van **directo al mapa de niveles**. Voz que lee las consignas, sonidos, pistas 💡 con huellitas (en los niveles de juntar estrellas pasan por ellas), álbum de figuritas y festejo con "chocá los cinco".
- **El progreso dura una clase**: las compus pasan de un curso a otro, así que el progreso (de los dos grados) vence a los **45 minutos** de que los dos se suman. Recargar la página lo mantiene. Una vez vencido se borra al volver al inicio o cuando nadie toca nada durante 3 minutos (nunca en medio de un nivel). El botón 🔄 (mapa e inicio) lo borra a mano con una tarjeta de confirmación. Sonido, voz y grado elegido se mantienen.
- Modo docente (🍎 en el mapa, pide una cuenta): cambiar de 1.º/2.º, desbloquear niveles, borrar el progreso, ir a un nivel.

Teclado: Tito `W A S D`, `R` repetir, `T` hasta la casita, `F` recoger, `G`/`V` condiciones, `Q` borrar, `E` listo · Lula flechas, `Shift der.` repetir, `P` hasta la casita, `O` recoger, `L`/`K` condiciones, `Backspace` borrar, `Enter` listo.

## Pruebas (node, sin dependencias)

```
node tools/check-levels.mjs     # todos los niveles con su solución
node tools/check-workspace.mjs  # el área de arrastrar
node tools/check-session.mjs    # el reloj de la clase (45 min)
node tools/check-hint.mjs       # la pista 💡
```

Sitio estático (HTML/CSS/JS sin dependencias) servido con nginx (`Dockerfile`). Subí el `?v=` de los scripts y estilos de `public/index.html` en cada cambio, así las compus no usan una copia vieja.
