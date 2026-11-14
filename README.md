# Spelling Bee Trainer v5.0

## Abrir el entrenador

Extrae el ZIP en una carpeta. Abre `Spelling_Bee_Trainer_v5_0.html` con Chrome,
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

- **Videos de estudio**: abre la lista de cualquier semana o las 30 palabras del
  concurso para encontrar **Mira, escucha y deletrea**. Hay 60 clips MP4 (uno por
  entrada), con ilustración, palabra, traducción y letras resaltadas en sincronía
  con el audio en inglés. Se carga la primera palabra por defecto. Pulsa **Ver video**
  en una tarjeta para subir al reproductor e iniciar su video al cargar; al terminar,
  la página regresa a esa tarjeta. Si el navegador bloquea el inicio automático,
  pulsa reproducir. El reproductor permite avanzar, volver,
  escuchar a velocidad normal o lenta y descargar el clip. Los videos no avanzan
  automáticamente. Se pausan al salir, ocultar la página o reproducir otro audio.
  Funcionan con los archivos locales, sin servicios externos. Los subtítulos VTT
  requieren servir el sitio por HTTP/HTTPS en algunos navegadores; las letras
  también están incluidas en la imagen del video.
  Conserva `assets/videos/` al copiar o publicar el sitio. Los clips incorporan
  las letras de acclivity y se distribuyen bajo CC BY-NC 4.0; consulta los créditos.

- **Deletreo con voz continuo**: escucha la palabra, pulsa **Deletrear palabra**
  y di todas sus letras en inglés en una sola toma, con pausas breves entre ellas.
  Pulsa **Terminé**, revisa la secuencia y elige **Comprobar deletreo**.
  No necesitas confirmar cada letra. Puedes repetir el intento completo o
  quitar la última letra antes de comprobar. Se conservan las letras repetidas.
  Los resultados parciales se muestran mientras hablas. Al terminar se conserva
  la última lectura visible aunque el navegador no entregue un resultado final,
  retire la lectura al cerrar o interrumpa el servicio. Se identifica como
  **provisional** y debes revisarla antes de comprobar; no se califica sola.
  La transcripción original queda visible, incluso si no puede convertirse en letras.
  Si el navegador agrupa las letras como una palabra
  (por ejemplo, CHAT), se muestra C–H–A–T para revisión, con un aviso de que
  no permite verificar cómo se pronunciaron las letras. Las lecturas dudosas
  también se muestran para revisar o repetir; no se califican sin pulsar
  Comprobar. No se corrige la transcripción usando la palabra esperada.
  Los fallos del servicio no puntúan.
  La práctica utiliza las diez palabras de la semana o del módulo del concurso.
  La sesión no se guarda al salir y volver a abrirla; no se califica el acento.
- La voz requiere HTTPS (o localhost para desarrollo), permiso de micrófono
  y un navegador con `SpeechRecognition` o `webkitSpeechRecognition`.
  La aplicación no guarda audio ni necesita claves de servicios. El navegador
  puede procesar la voz en un servicio remoto y necesitar Internet; la
  disponibilidad depende del navegador y del dispositivo.
  [Compatibilidad y procesamiento de voz](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition).
- **Velocidad normal y lenta en todos los audios**: las listas de estudio
  ofrecen ambas opciones para palabras, deletreos y oraciones. Los seis juegos
  y sus respuestas también permiten escuchar a velocidad normal (1×) o lenta
  (0.72×). En el laboratorio y el dictado, el selector de velocidad se aplica
  a sus botones de reproducción. El dictado conserva las tres repeticiones
  y el plazo de 30 segundos, que empieza al terminar el primer audio.
- **Spelling Bee Contest**: lista especial con las 30 palabras del cartel,
  ilustraciones nuevas, traducciones, ejemplos y audios incluidos. Abre
  **Estudiar las 30 palabras** para consultar la lista y **Juegos del concurso**
  para practicar con los seis juegos o el dictado. Encima de ese botón, elige
  **Módulo 1** (apple–boat), **Módulo 2** (book–circle) o **Módulo 3**
  (clap–dress). Cada módulo contiene 10 palabras y limita tanto las rondas
  como las opciones de respuesta a ese grupo. La selección se recuerda y
  cada módulo guarda sus resultados y dictados por separado. La lista de
  estudio sigue mostrando las 30 palabras. El concurso tiene botones
  propios y no aparece en el selector semanal. Usa **Volver a la práctica semanal**
  para regresar a la última semana elegida. Su progreso se guarda por
  separado de las semanas. El evento es el 23 de noviembre de 2026, de
  8:00 a. m. a 12:00 p. m., en CEB Conference Hall. La cuenta regresiva usa
  la fecha de Hermosillo, muestra un mensaje especial el día del evento y
  evita números negativos después. Las ilustraciones de April y August
  muestran el número del mes (4 y 8); sus nombres llevan mayúscula inicial.
- **Semana 1** (26–30 de octubre), **semana 2** (2–6 de noviembre) y
  **semana 3** (9–13 de noviembre). La semana 3 se abre por defecto en la
  primera visita. El sitio recuerda la selección cuando hay almacenamiento local.
- Los seis juegos de v4.3, la lista con traducciones y oraciones, la
  retroalimentación con mascotas, los premios, el repaso de errores y el
  resumen de progreso por semana.
- **Laboratorio de sonidos** con las 26 letras, 14 combinaciones de uso
  frecuente, el alfabeto fonético, ejemplos y reproducción normal o lenta.
  Los nombres de las 26 letras usan la misma voz humana de acclivity
  (opción 4). La Z dice únicamente **zee**, sin incluir **zed**.
  Los fonemas y ejemplos conservan la voz Microsoft Zira.
  Consulta `credits-audio.html` para la fuente, los cambios realizados y la
  licencia CC BY-NC 4.0 (atribución y uso no comercial) de las letras
  y de los deletreos que las incorporan.
  [Referencia sobre correspondencias entre letras y sonidos](https://ufli.education.ufl.edu/resources/teaching-resources/instructional-activities/phoneme-grapheme-correspondences/)
- **Práctica auditiva** en el laboratorio. Elige **Abecedario** o **Fonemas
  comunes** y pulsa **Practicar con 5 opciones**. En cada ronda escucha
  el nombre de la letra en Abecedario o el sonido en Fonemas comunes.
  Repítelo si lo necesitas y selecciona la letra o la combinación.
  Verás la respuesta al elegir y tu puntuación al terminar: **26 rondas en
  Abecedario**, una por letra en orden aleatorio, y diez en Fonemas comunes.
  Ambas categorías incluyen los personajes de acierto y error.
- **Deletreo** en cada tarjeta de estudio de las semanas y el concurso:
  escucha la palabra, los nombres de sus letras en inglés y la palabra otra vez.
  Los 59 clips únicos se incluyen en `assets/audio/spelling/`.
- **Dictado manuscrito** con diez palabras de la semana o del módulo del concurso,
  en orden aleatorio.
  Pulsa **Escuchar e iniciar**. Los 30 segundos empiezan al terminar el primer
  audio. Puedes repetir la palabra hasta tres veces dentro del mismo plazo.
  Escribe con dedo, lápiz o ratón. Al agotarse el tiempo se guarda el trazo,
  aunque esté incompleto, y puedes pasar a la siguiente palabra.

## Revisar el dictado

Tras guardar la última respuesta, abre **Revisión de un adulto**. Compara cada
palabra dictada con el trazo y elige **Correcta** o **Incorrecta**. La vista
muestra cuántas palabras se han calificado y calcula la nota final al completar
todas las respuestas.

El navegador guarda los trazos y las calificaciones del dictado de cada semana
en almacenamiento local. Puedes volver desde **Dictado manuscrito** con el
mismo navegador y origen. El reloj sigue corriendo si sales durante una palabra.
**Empezar otro dictado** reemplaza el intento de esa semana. Los avances del
HTML local y los de una URL publicada pertenecen a orígenes distintos.

## Código y verificación

- `python tools/generate_study_videos.py` reconstruye los videos desde las listas,
  ilustraciones y audios existentes. Requiere Pillow y FFmpeg en el PATH (o
  `--ffmpeg RUTA`); también reconoce `imageio-ffmpeg` en `output/video-tools`.
  `--list week-03` permite reconstruir solo una lista. Estos programas se usan
  únicamente para generar archivos; el sitio publicado no necesita instalarlos.
- `node tools/test_study_videos.js` verifica las listas de los 60 clips, archivos,
  navegación, subtítulos, descarga, velocidades y pausa al ocultar la página.

- `data/manifest.json` apunta a los JSON de cada semana. `data/phonics.json`
  contiene las tarjetas del laboratorio. `data/local-content.js` permite
  abrir el HTML de control directamente desde disco.
- El campo `contest` del manifest mantiene la lista especial fuera de `weeks`.
- `python tools/generate_spelling_audio.py` combina los clips de palabras y
  nombres de letras para producir el deletreo. Con `--check` verifica la secuencia
  exacta sin modificar los archivos.
- `tools/import_natural_letters.py` permite reconstruir las 26 letras desde
  `assets/audio/sources/english-alphabet-acclivity.mp3`. Los recortes están
  definidos en segundos; la Z usa 40.03–40.89, correspondiente solo a “zee”.
  Requiere `numpy` y
  `soundfile` únicamente para esta reconstrucción. Después ejecuta
  `python tools/generate_spelling_audio.py` para actualizar los 59 deletreos.
  La aplicación funciona sin instalar paquetes y sin conexión a internet.
- `assets/words/` contiene las ilustraciones originales recortadas. La semana
  3 usa los recortes de la lámina del 9–13 de noviembre. Las palabras impresas
  de la lámina quedan fuera de los recortes.
- `js/games.js`, `js/lab.js`, `js/handwriting.js` y `js/dictation.js`
  contienen el código de las actividades. `js/core.js` carga el contenido
  y conserva el progreso. `js/audio.js` reproduce los clips.
- Ejecuta `python tools/verify.py` con Python 3.10+ y Node.js en el PATH.
  Verifica sintaxis JavaScript, rutas, semanas, concurso, audio y los dos HTML.
  Si editas el contenido o `index.html`, usa `python tools/verify.py --sync-local`
  para actualizar los archivos de la prueba local.
- Ejecuta `node tools/test_practice.js` para comprobar la sesión completa de
  26 letras, la cuenta regresiva, los tres módulos de 10 palabras, su progreso
  y dictados independientes, las opciones de respuesta y ambas velocidades.
- Ejecuta `node tools/test_voice.js` para comprobar la confirmación de letras,
  repeticiones, ambigüedad, permisos denegados, fallos de red y cancelación
  al salir u ocultar la página. Simula eventos del navegador: la precisión
  acústica requiere pruebas reales con la voz del alumno en su dispositivo.
- `tools/contest_image_prompts.json` documenta los prompts de las 30
  ilustraciones creadas con la herramienta integrada de generación de imágenes.
  `tools/generate_contest_audio.ps1` permite generar los WAV del concurso
  en Windows con una voz estadounidense instalada; conserva los clips existentes.

Para comprobar la interacción, selecciona cada semana y abre su lista.
Prueba los botones de nombre, sonido y ejemplo del laboratorio. En la práctica
auditiva, comprueba que se activen cinco opciones después de escuchar el nombre
de la letra (Abecedario) o el sonido (Fonemas comunes)
y que aparezca el resultado tras 26 rondas en Abecedario y diez en Fonemas comunes. En el dictado,
usa las tres repeticiones, deja vencer una ronda, recarga la página y comprueba
que el trazo se conserve al pasar a la revisión.
