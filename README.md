# Spelling Bee Trainer v4.5

## Abrir el entrenador

Extrae el ZIP en una carpeta. Abre `Spelling_Bee_Trainer_v4_5.html` con Chrome,
Edge, Firefox o Safari. El HTML de control y `index.html` usan los recursos de
la misma carpeta, así que conserva `css/`, `js/`, `data/` y `assets/` junto
a ambos. Si tu dispositivo abre el HTML en una vista previa de archivos,
selecciona un navegador o usa la copia servida por HTTP.

Para probarlo por HTTP, ejecuta `python -m http.server 8000` desde la carpeta
extraída y abre `http://localhost:8000/`.

## Publicar en GitHub Pages

1. Copia el contenido del ZIP a la raíz de la rama que usarás para Pages.
   `index.html` debe quedar junto a `css/`, `js/`, `data/` y `assets/`.
2. En el repositorio, abre **Settings → Pages**. En **Build and deployment**,
   selecciona **Deploy from a branch**, la rama y **/ (root)**. Pulsa **Save**.
3. Abre la URL que aparece en **Pages**. Las rutas son relativas y funcionan
   cuando GitHub Pages sirve el sitio desde un subdirectorio.

El archivo `.nojekyll` permite servir el contenido como sitio estático.
[Guía de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## Qué incluye

- **Semana 1** (26–30 de octubre), **semana 2** (2–6 de noviembre) y
  **semana 3** (9–13 de noviembre). La semana 3 se abre por defecto en la
  primera visita. El sitio recuerda la selección cuando hay almacenamiento local.
- Los seis juegos de v4.3, la lista con traducciones y oraciones, la
  retroalimentación con mascotas, los premios, el repaso de errores y el
  resumen de progreso por semana.
- **Laboratorio de sonidos** con las 26 letras, 14 combinaciones de uso
  frecuente, el alfabeto fonético, ejemplos y reproducción normal o lenta.
  Los clips de audio se sintetizaron con Microsoft Zira en inglés estadounidense.
  [Referencia sobre correspondencias entre letras y sonidos](https://ufli.education.ufl.edu/resources/teaching-resources/instructional-activities/phoneme-grapheme-correspondences/)
- **Práctica auditiva** en el laboratorio. Elige **Abecedario** o **Fonemas
  comunes** y pulsa **Practicar con 5 opciones**. En cada ronda escucha
  el nombre de la letra en Abecedario o el sonido en Fonemas comunes.
  Repítelo si lo necesitas y selecciona la letra o la combinación.
  Verás la respuesta al elegir y tu puntuación al terminar las diez rondas.
- **Dictado manuscrito** con diez palabras de la semana en orden aleatorio.
  Pulsa **Escuchar e iniciar**. Los 30 segundos empiezan al terminar el primer
  audio. Puedes repetir la palabra hasta tres veces dentro del mismo plazo.
  Escribe con dedo, lápiz o ratón. Al agotarse el tiempo se guarda el trazo,
  aunque esté incompleto, y puedes pasar a la siguiente palabra.

## Revisar el dictado

Tras guardar la última respuesta, abre **Revisión de un adulto**. Compara cada
palabra dictada con el trazo y elige **Correcta** o **Incorrecta**. La vista
muestra cuántas palabras se han calificado y calcula la nota final al completar
las diez.

El navegador guarda los trazos y las calificaciones del dictado de cada semana
en almacenamiento local. Puedes volver desde **Dictado manuscrito** con el
mismo navegador y origen. El reloj sigue corriendo si sales durante una palabra.
**Empezar otro dictado** reemplaza el intento de esa semana. Los avances del
HTML local y los de una URL publicada pertenecen a orígenes distintos.

## Código y verificación

- `data/manifest.json` apunta a los JSON de cada semana. `data/phonics.json`
  contiene las tarjetas del laboratorio. `data/local-content.js` permite
  abrir el HTML de control directamente desde disco.
- `assets/words/` contiene las ilustraciones originales recortadas. La semana
  3 usa los recortes de la lámina del 9–13 de noviembre. Las palabras impresas
  de la lámina quedan fuera de los recortes.
- `js/games.js`, `js/lab.js`, `js/handwriting.js` y `js/dictation.js`
  contienen el código de las actividades. `js/core.js` carga el contenido
  y conserva el progreso. `js/audio.js` reproduce los clips.
- Ejecuta `python tools/verify.py` con Python 3.10+ y Node.js en el PATH.
  Verifica sintaxis JavaScript, rutas, semanas, audio y los dos HTML.
  Si editas el contenido o `index.html`, usa `python tools/verify.py --sync-local`
  para actualizar los archivos de la prueba local.

Para comprobar la interacción, selecciona cada semana y abre su lista.
Prueba los botones de nombre, sonido y ejemplo del laboratorio. En la práctica
auditiva, comprueba que se activen cinco opciones después de escuchar el nombre
de la letra (Abecedario) o el sonido (Fonemas comunes)
y que aparezca el resultado tras diez rondas en cada categoría. En el dictado,
usa las tres repeticiones, deja vencer una ronda, recarga la página y comprueba
que el trazo se conserve al pasar a la revisión.

