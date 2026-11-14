"use strict";

const MODES = [
  ["🖼️", "Picture Match", "Elige la palabra"],
  ["🔤", "Build the Word", "6 letras para armar"],
  ["🧩", "Letter Puzzle", "Ordena las letras"],
  ["🎧", "Sound Match", "Escucha 3 opciones"],
  ["👀", "Find the Picture", "Elige la imagen"],
  ["🎵", "Listen & Build", "Escucha y usa 10 letras"],
];
let mode = 0,
  deck = [],
  pos = 0,
  selected = null,
  assembled = [],
  letters = [],
  answered = false;
let misses = [],
  correctCount = 0,
  reviewMode = false,
  epoch = 0;
let roundAnswers = [],
  showingGameEnd = false;
function modeSummary(i) {
  const r = completed[i];
  return r ? `${r.score}/${r.total} correctas` : "Pendiente";
}
function updateHome() {
  $("modes").innerHTML = MODES.map((m, i) => {
    const result = completed[i];
    const detail = result ? "✅ Completado · " + modeSummary(i) : m[2];
    return `
      <button class="mode" data-mode="${i}" ${result ? "disabled" : ""}
        aria-label="${m[1]}: ${modeSummary(i)}">
        <span class="emoji">${m[0]}</span>
        <strong>${m[1]}</strong>
        <small>${detail}</small>
      </button>`;
  }).join("");
  const done = Object.keys(completed).length;
  $("overview").innerHTML =
    `<strong>Actividades completadas: ${done} de 6</strong>`;
  if (done) {
    const hint = document.createElement("p");
    hint.textContent =
      "Selecciona «Reiniciar todas las actividades» para revisar las palabras difíciles.";
    $("overview").append(hint);
  }
  $("resetAll").disabled = done === 0;
}
function reportHtml() {
  const entries = Object.entries(completed),
    stats = {};
  practiceWords().forEach((x) => (stats[x.w] = { tries: 0, errors: 0 }));
  entries.forEach(([k, r]) =>
    (r.answers || []).forEach((a) => {
      if (stats[a.word]) {
        stats[a.word].tries++;
        if (!a.correct) stats[a.word].errors++;
      }
    }),
  );
  const hard = Object.entries(stats)
    .filter(([w, v]) => v.errors)
    .sort((a, b) => b[1].errors - a[1].errors || a[0].localeCompare(b[0]));
  const total = entries.reduce((n, [k, r]) => n + r.total, 0),
    score = entries.reduce((n, [k, r]) => n + r.score, 0);
  const results = MODES.map(
    ([icon, name], i) => `<li>${icon} ${name}: <b>${modeSummary(i)}</b></li>`,
  ).join("");
  const practice = hard
    .map(([word, { errors, tries }]) => {
      const translation = escapeHtml(WORDS.find(({ w }) => w === word).es);
      const label = errors === 1 ? "error" : "errores";
      return `
      <li><b>${word.toUpperCase()}</b> (${translation}):
        ${errors} ${label} en ${tries} intentos</li>`;
    })
    .join("");
  return `
    <h3>📊 Resumen de aprendizaje</h3>
    <p><strong>${entries.length} de 6 juegos</strong> · ${score}/${total} respuestas correctas</p>
    <h4>Resultados por juego</h4>
    <ul>${results}</ul>
    <h4>Palabras que necesitan práctica</h4>
    ${practice ? `<ul>${practice}</ul>` : "<p>🌟 ¡Sin errores en los juegos completados!</p>"}
    <p class="muted">El reinicio borra los resultados de los juegos de esta lista.</p>`;
}
function resetAll() {
  if (!Object.keys(completed).length) return;
  const report = reportHtml();
  const dialog = document.createElement("dialog");
  dialog.id = "resetDialog";
  dialog.setAttribute("aria-label", "Resumen antes de reiniciar");
  dialog.innerHTML = `
    ${report}
    <div class="bottom">
      <button id="cancelReset" class="secondary" autofocus>Volver a revisar</button>
      <button id="confirmReset" class="primary">Confirmar reinicio</button>
    </div>`;
  document.body.appendChild(dialog);
  dialog.onclose = () => dialog.remove();
  $("cancelReset").onclick = () => dialog.close();
  $("confirmReset").onclick = () => {
    completed = {};
    saveProgress();
    dialog.close();
    updateHome();
  };
  dialog.showModal();
}
$("resetAll").onclick = resetAll;
const slowButton = (w) =>
  `<button class="secondary sound slow-repeat" data-play="${w}">
    🐢 🔊 Escuchar lento
  </button>`;
const img = (w, small = false) =>
  `<div class="picture${small ? " small" : ""}">
    <img src="${WORD_IMAGES[w]}" alt="Ilustración para identificar una palabra" draggable="false">
  </div>`;
function openWordList() {
  stopAudio();
  if (typeof openStudyVideos === "function") openStudyVideos();
  $("wordListTitle").textContent = weekId === "contest-2026"
    ? "🏆 Spelling Bee Contest · 30 palabras"
    : "📚 My Spelling Words";
  $("wordListItems").innerHTML = WORDS.map(
    ({ w, es }) =>
      `<article class="word-entry">
        <img src="${WORD_IMAGES[w]}" alt="Imagen de ${w}" loading="lazy">
        <div>
          <strong lang="en-US">${escapeHtml(WORD_LABELS[w] === w ? w.toUpperCase() : WORD_LABELS[w])}</strong>
          <span class="muted">(${escapeHtml(es)})</span>
          <p lang="en-US">${escapeHtml(WORD_EXAMPLES[w])}</p>
          <button class="primary" data-watch-video="${w}"
            aria-label="Ver video de ${escapeHtml(WORD_LABELS[w])}">🎬 Ver video</button>
          ${[
            ["say-word", "🔊 Palabra"],
            ["spell-word", "🔤 Deletreo"],
            ["say-example", "▶ Oración"],
          ].map(([action, label]) => `
            <div class="word-audio-row" role="group" aria-label="${label} de ${w}">
              <span>${label}</span>
              <button class="secondary" data-${action}="${w}" data-rate="1"
                aria-label="${label} de ${w}, velocidad normal">Normal</button>
              <button class="secondary" data-${action}="${w}" data-rate="0.72"
                aria-label="${label} de ${w}, velocidad lenta">🐢 Lenta</button>
            </div>`).join("")}
        </div>
      </article>`,
  ).join("");
  setScreen("wordList");
}
$("openWordList").onclick = () => {
  unlockAudio();
  openWordList();
};
$("closeWordList").onclick = () => {
  stopAudio();
  setScreen("home");
};
$("wordListItems").onclick = (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  unlockAudio();
  if (b.dataset.watchVideo) {
    watchStudyVideo(b.dataset.watchVideo, b);
    return;
  }
  const rate = Number(b.dataset.rate) || 1;
  if (b.dataset.sayWord) playWord(b.dataset.sayWord, rate);
  else if (b.dataset.spellWord) playSpelling(b.dataset.spellWord, rate);
  else if (b.dataset.sayExample)
    playClip("assets/audio/sentences/" + b.dataset.sayExample + ".wav", rate);
};

$("modes").onclick = (e) => {
  let b = e.target.closest("[data-mode]");
  if (b && !weekLoading) start(+b.dataset.mode);
};
function start(m, only = null) {
  if (!only && completed[m]) {
    setScreen("home");
    updateHome();
    return;
  }
  unlockAudio();
  epoch++;
  stopAudio();
  mode = m;
  deck = shuffle(only || practiceWords().map((x) => x.w));
  pos = 0;
  correctCount = 0;
  misses = [];
  reviewMode = !!only;
  roundAnswers = [];
  setScreen("game");
  render();
}
function current() {
  return deck[pos];
}
function makeLetters(w, n) {
  let arr = w.toUpperCase().split("");
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  while (arr.length < n) {
    let ch = alphabet[Math.floor(Math.random() * alphabet.length)];
    if (!arr.includes(ch) || Math.random() < 0.25) arr.push(ch);
  }
  return shuffle(arr.map((ch, i) => ({ id: i, ch })));
}
function otherWords(w, n) {
  return shuffle(practiceWords().filter((x) => x.w !== w).map((x) => x.w)).slice(0, n);
}

const playButton = (word) => `
  <button class="primary wide sound play-word" data-play="${word}">🔊 Escuchar normal</button>
  ${slowButton(word)}`;

const letterBoard = (hint) => `
  <div id="slots" class="slots"></div>
  <div id="letters" class="letters"></div>
  <p class="hint">${hint}</p>`;

function render() {
  showingGameEnd = false;
  epoch++;
  answered = false;
  selected = null;
  assembled = [];
  let w = current();
  $("modeLabel").textContent = MODES[mode][0] + " " + MODES[mode][1];
  $("count").textContent = `${pos + 1} / ${deck.length}`;
  $("bar").style.width = `${(pos / deck.length) * 100}%`;
  $("action").disabled = true;
  $("action").textContent = "Comprobar ✓";
  let q = $("question");
  let html = "";
  if (mode === 0) {
    $("prompt").textContent = "Which word matches the picture?";
    const choices = shuffle([w, ...otherWords(w, 3)])
      .map(
        (word) =>
          `<button class="choice" data-word="${word}">${word.toUpperCase()}</button>`,
      )
      .join("");
    html = img(w) + playButton(w) + `<div class="choices">${choices}</div>`;
  }
  if (mode === 1 || mode === 2) {
    $("prompt").textContent =
      mode === 1 ? "Build the word!" : "Put the letters in order!";
    letters = makeLetters(w, mode === 1 ? 6 : w.length);
    html =
      img(w) +
      playButton(w) +
      letterBoard(
        "Toca las letras para formar la palabra. Toca una letra colocada para quitarla.",
      );
  }
  if (mode === 3) {
    $("prompt").textContent = "Which sound matches the picture?";
    const choices = shuffle([w, ...otherWords(w, 2)])
      .map(
        (word, i) => `
        <div class="audiochoice" data-choice="${word}">
          <button class="secondary sound" data-play="${word}">🔊 Opción ${i + 1} · Normal</button>
          <button class="secondary sound slow-repeat" data-play="${word}">🐢 Opción ${i + 1} · Lenta</button>
          <button class="secondary pick" data-select="${word}">Elegir</button>
        </div>`,
      )
      .join("");
    html =
      img(w) +
      `
      <div class="audiochoices">${choices}</div>
      <p class="hint">Escucha cada opción y elige el sonido correcto.</p>`;
  }
  if (mode === 4) {
    $("prompt").textContent = "Listen and find the picture!";
    const choices = shuffle([w, ...otherWords(w, 3)])
      .map(
        (word) => `
        <button class="choice" data-word="${word}" aria-label="Seleccionar imagen">
          ${img(word, true)}
        </button>`,
      )
      .join("");
    html = playButton(w) + `<div class="choices">${choices}</div>`;
  }
  if (mode === 5) {
    $("prompt").textContent = "Listen and build the word!";
    letters = makeLetters(w, 10);
    html =
      playButton(w) + letterBoard("Escucha y selecciona las letras en orden.");
  }
  q.innerHTML = html;
  if ([1, 2, 5].includes(mode)) drawLetters();
  if (mode !== 3) {
    const token = epoch;
    setTimeout(() => {
      if (
        epoch === token &&
        audioUnlocked &&
        !document.hidden &&
        !answered &&
        current() === w &&
        !$("game").classList.contains("hide")
      ) {
        playWord(w);
      }
    }, 1000);
  }
}
function drawLetters() {
  let w = current(),
    slot = $("slots"),
    bank = $("letters");
  slot.innerHTML = Array.from({ length: w.length }, (_, i) => {
    const placed = assembled[i] !== undefined;
    return `
        <button class="slot ${placed ? "filled" : ""}"
          data-remove="${i}" ${answered ? "disabled" : ""}>
          ${placed ? letters[assembled[i]].ch : "·"}
        </button>`;
  }).join("");
  bank.innerHTML = letters
    .map(
      (x, i) =>
        `<button class="letter" data-letter="${i}"
          ${assembled.includes(i) || answered ? "disabled" : ""}>${x.ch}</button>`,
    )
    .join("");
  $("action").disabled = assembled.length !== w.length || answered;
}
$("question").addEventListener("click", (e) => {
  let b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.play) {
    epoch++;
    unlockAudio();
    playWord(b.dataset.play, b.classList.contains("slow-repeat") ? 0.72 : 1);
    return;
  }
  if (answered) return;
  if (b.dataset.letter !== undefined) {
    if (assembled.length < current().length) assembled.push(+b.dataset.letter);
    drawLetters();
    return;
  }
  if (b.dataset.remove !== undefined) {
    let i = +b.dataset.remove;
    if (i < assembled.length) {
      assembled.splice(i, 1);
      drawLetters();
    }
    return;
  }
  let w = b.dataset.word || b.dataset.select;
  if (w) {
    selected = w;
    document
      .querySelectorAll(".choice,.audiochoice")
      .forEach((x) =>
        x.classList.toggle(
          "selected",
          x.dataset.word === w || x.dataset.choice === w,
        ),
      );
    $("action").disabled = false;
  }
});
function escapeHtml(x) {
  return String(x).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
const MASCOT_SUCCESS = "assets/ui/mascot-success.webp";
const MASCOT_TRY = "assets/ui/mascot-try.webp";
function check() {
  if (answered) return;
  let w = current(),
    guess = [1, 2, 5].includes(mode)
      ? assembled
          .map((i) => letters[i].ch)
          .join("")
          .toLowerCase()
      : selected;
  if (!guess) return;
  answered = true;
  let ok = guess === w;
  roundAnswers.push({ word: w, correct: ok });
  if (ok) correctCount++;
  else misses.push(w);
  $("action").disabled = false;
  $("action").textContent =
    pos === deck.length - 1 ? "Ver resultados →" : "Siguiente →";
  document.querySelectorAll("#question button").forEach((b) => {
    b.disabled = true;
    if (b.dataset.word === w || b.dataset.select === w) b.classList.add("good");
    if (!ok && (b.dataset.word === guess || b.dataset.select === guess))
      b.classList.add("bad");
  });
  let phrase = shuffle([
    "Amazing! 🌟",
    "Excellent work! 🎉",
    "You are a star! ⭐",
    "Super spelling! 🐝",
    "Fantastic! 💜",
    "Great job! 🚀",
  ])[0];
  let badge =
    ok && correctCount === 5
      ? "🥇 Super Speller!"
      : ok && correctCount === 10
        ? "🏆 Spelling Bee Champion!"
        : "";
  const reward = badge
    ? `<div class="reward compact-reward">
        <div class="trophy">${correctCount === 5 ? "🥇" : "🏆"}</div>
        <strong>${badge}</strong>
        <p>¡Ganaste una recompensa!</p>
      </div>`
    : "";
  const translation = escapeHtml(WORDS.find((x) => x.w === w).es);
  const comparison = ok
    ? `<p class="answer-line">✅ <b>${w.toUpperCase()}</b> · ${translation}</p>`
    : `<div class="compare">
        <div>
          <span>Tu respuesta</span>
          <strong class="incorrect">${escapeHtml(guess.toUpperCase())}</strong>
        </div>
        <div>
          <span>Respuesta correcta</span>
          <strong class="correct">${w.toUpperCase()}</strong>
        </div>
      </div>
      <p class="answer-line">${translation}</p>`;
  const mascotAlt = ok
    ? "Mascota felicitando"
    : "Mascota animando a seguir intentando";
  $("question").innerHTML = `
    <div class="feedback ${ok ? "" : "wrong"}" role="status" aria-live="polite">
      <img class="feedback-mascot ${ok ? "success" : "try"}"
        alt="${mascotAlt}" src="${ok ? MASCOT_SUCCESS : MASCOT_TRY}">
      <strong>${ok ? phrase : "Nice try! Keep learning!"}</strong>
      ${comparison}
      ${playButton(w)}
      ${reward}
    </div>`;
  chime(ok, !!badge);
  $("bar").style.width = `${((pos + 1) / deck.length) * 100}%`;
}
$("action").onclick = () => {
  if (showingGameEnd) {
    stopAudio();
    updateHome();
    setScreen("home");
    return;
  }
  if (answered) {
    if (pos < deck.length - 1) {
      pos++;
      render();
    } else finish();
  } else check();
};
$("back").onclick = () => {
  epoch++;
  stopAudio();
  updateHome();
  setScreen("home");
};
function finish() {
  epoch++;
  stopAudio();
  if (!reviewMode) {
    completed[mode] = {
      score: correctCount,
      total: deck.length,
      answers: roundAnswers.slice(),
    };
    saveProgress();
  }
  updateHome();
  showingGameEnd = true;
  answered = true;
  $("prompt").textContent = "¡Juego completado!";
  $("count").textContent = `${deck.length} / ${deck.length}`;
  $("bar").style.width = "100%";
  const perfect = correctCount === deck.length;
  const practice = misses.length === 1 ? "palabra" : "palabras";
  const message = perfect
    ? "¡Excelente! Todas las palabras correctas."
    : `¡Muy bien! Hay ${misses.length} ${practice} para practicar.`;
  const medal = '<div class="reward compact-reward">🥇 Super Speller</div>';
  const trophy =
    '<div class="reward compact-reward">🏆 Spelling Bee Champion</div>';
  const review =
    '<button class="secondary wide" id="reviewInline">🎯 Repasar errores</button>';
  $("question").innerHTML = `
    <div class="feedback" role="status">
      <div class="trophy">${perfect ? "🏆" : "🎉"}</div>
      <strong>Great job!</strong>
      <div class="score">${correctCount} / ${deck.length} correctas</div>
      <p>${message}</p>
      ${correctCount >= 5 ? medal : ""}
      ${correctCount >= 10 ? trophy : ""}
      ${misses.length ? review : ""}
    </div>`;
  const r = $("reviewInline");
  if (r) r.onclick = () => start(mode, [...new Set(misses)]);
  $("action").disabled = false;
  $("action").textContent = "⌂ Ver actividades";
  chime(true, true);
}
