"use strict";

const ROUND_MS = 30000;
const MAX_REPEATS = 3;
let dictation = null;
let dictationTimer;
let playbackToken = 0;
let dictationPlaying = false;

function dictationKey() {
  return "spelling_bee_dictation_v45_" + dictation.week;
}

function saveDictation() {
  if (!dictation) return;
  const saved = writeStorage(dictationKey(), dictation);
  $("dictationStorage").textContent = saved
    ? ""
    : "El navegador no pudo guardar los trazos. Se conservan mientras esta página siga abierta.";
}

function newDictation() {
  return {
    week: weekId,
    deck: shuffle(WORDS.map(({ w }) => w)),
    responses: [],
    phase: "listen",
    strokes: [],
    repeats: 0,
    deadline: 0,
  };
}

function showDictation() {
  if (weekLoading || !weekId) return;
  stopAudio();
  if (dictation?.week !== weekId) {
    dictation = readStorage("spelling_bee_dictation_v45_" + weekId, null);
  }
  dictation ??= newDictation();
  const status = {
    listen: "Escucha la palabra para iniciar el tiempo.",
    writing: "Escribe con el dedo o el lápiz.",
    saved: dictation.responses.at(-1)?.timedOut
      ? "Se acabó el tiempo. Respuesta guardada."
      : "Respuesta guardada.",
  };
  $("dictationStatus").textContent = status[dictation.phase] ?? "";
  $("dictationStorage").textContent = "";
  setScreen("dictation");
  renderDictation();
}

function canWrite() {
  return dictation?.phase === "writing" && Date.now() < dictation.deadline;
}

const writingSurface = createWritingSurface(
  $("writingCanvas"),
  () => dictation?.strokes ?? [],
  canWrite,
  saveDictation,
);

function renderDictation() {
  clearInterval(dictationTimer);
  const { deck, phase, responses, repeats } = dictation;
  const review = phase === "review";
  const saved = phase === "saved";
  $("dictationPractice").hidden = review;
  $("dictationReview").hidden = !review;
  if (review) {
    renderDictationReview();
    return;
  }

  const round = saved ? responses.length : responses.length + 1;
  $("dictationCount").textContent = "Palabra " + round + " de " + deck.length;
  $("dictationClock").hidden = saved;
  $("dictationListen").hidden = phase !== "listen";
  $("dictationListen").disabled = dictationPlaying;
  $("dictationRepeat").hidden = phase !== "writing";
  $("dictationRepeat").disabled = dictationPlaying || repeats >= MAX_REPEATS;
  $("dictationRepeat").textContent =
    "🔊 Repetir · " + (MAX_REPEATS - repeats) + " restantes";
  $("dictationClear").disabled = phase !== "writing";
  $("dictationSubmit").hidden = phase !== "writing";
  $("dictationNext").hidden = !saved;
  $("dictationNext").textContent =
    round === deck.length ? "Revisión de un adulto →" : "Siguiente palabra →";
  $("writingCanvas").classList.toggle("writing-active", phase === "writing");
  writingSurface.redraw();

  if (phase === "writing") {
    dictationTimer = setInterval(updateDictationClock, 100);
    updateDictationClock();
  } else if (!saved) {
    $("dictationClock").textContent = "00:30";
  }
}

function updateDictationClock() {
  if (dictation?.phase !== "writing") return;
  const seconds = Math.max(
    0,
    Math.ceil((dictation.deadline - Date.now()) / 1000),
  );
  $("dictationClock").textContent = "00:" + String(seconds).padStart(2, "0");
  if (seconds === 0) submitDictationWord(true);
}

function cancelDictationAudio() {
  playbackToken++;
  dictationPlaying = false;
  stopAudio();
}

async function playDictationWord(repeat) {
  if (dictationPlaying) return;
  if (repeat && (!canWrite() || dictation.repeats >= MAX_REPEATS)) return;
  if (!repeat && dictation.phase !== "listen") return;

  const token = ++playbackToken;
  dictationPlaying = true;
  $("dictationListen").disabled = true;
  $("dictationRepeat").disabled = true;
  $("dictationStatus").textContent = "Escucha la palabra…";

  // Count each requested repetition before playback so reloads cannot reset the limit.
  if (repeat) {
    dictation.repeats++;
    saveDictation();
  }
  const played = await playWord(
    dictation.deck[dictation.responses.length],
    0.92,
  );
  if (token !== playbackToken) return;
  dictationPlaying = false;
  if (!played) {
    $("dictationStatus").textContent = "No se pudo reproducir el audio.";
    renderDictation();
    return;
  }

  if (!repeat) {
    dictation.phase = "writing";
    dictation.deadline = Date.now() + ROUND_MS;
    saveDictation();
  }
  $("dictationStatus").textContent = "Escribe con el dedo o el lápiz.";
  renderDictation();
}

function submitDictationWord(timedOut = false) {
  if (dictation.phase !== "writing") return;
  timedOut ||= Date.now() >= dictation.deadline;
  cancelDictationAudio();
  writingSurface.stop();
  dictation.responses.push({
    word: dictation.deck[dictation.responses.length],
    strokes: dictation.strokes,
    repeats: dictation.repeats,
    timedOut,
    grade: null,
  });
  dictation.phase = "saved";
  dictation.deadline = 0;
  saveDictation();
  $("dictationStatus").textContent = timedOut
    ? "Se acabó el tiempo. Respuesta guardada."
    : "Respuesta guardada.";
  renderDictation();
  $("dictationNext").focus();
}

function nextDictationWord() {
  if (dictation.phase !== "saved") return;
  dictation.strokes = [];
  dictation.repeats = 0;
  dictation.phase =
    dictation.responses.length === dictation.deck.length ? "review" : "listen";
  $("dictationStatus").textContent =
    "Escucha la palabra para iniciar el tiempo.";
  saveDictation();
  renderDictation();
  if (dictation.phase === "listen") $("dictationListen").focus();
  else $("dictationGrade").focus();
}

function updateDictationGrade() {
  const responses = dictation.responses;
  const reviewed = responses.filter(({ grade }) => grade !== null).length;
  const correct = responses.filter(({ grade }) => grade === "correct").length;
  const total = responses.length;
  $("dictationGrade").textContent =
    reviewed === total
      ? "Calificación: " + correct + "/" + total + " correctas."
      : correct + " correctas · " + reviewed + "/" + total + " calificadas.";
}

function dictationReviewCard(response, index) {
  const card = document.createElement("article");
  card.className = "dictation-response";
  const title = document.createElement("h3");
  const word = document.createElement("span");
  word.lang = "en-US";
  word.textContent = response.word;
  title.append(index + 1 + ". ", word);
  const drawing = document.createElement("canvas");
  drawing.className = "writing-canvas";
  drawing.width = 1000;
  drawing.height = 300;
  drawing.setAttribute("role", "img");
  drawing.setAttribute("aria-label", "Respuesta manuscrita " + (index + 1));
  paintHandwriting(drawing, response.strokes);
  const detail = document.createElement("p");
  detail.className = "muted";
  const marks = response.strokes.length ? "Con trazos" : "En blanco";
  const timing = response.timedOut ? " · Se agotó el tiempo" : "";
  detail.textContent = marks + " · Repeticiones: " + response.repeats + timing;
  const label = document.createElement("label");
  label.textContent = "Calificar «" + response.word + "»";
  const select = document.createElement("select");
  select.className = "activity-select";
  select.append(
    new Option("Pendiente", ""),
    new Option("Correcta", "correct"),
    new Option("Incorrecta", "incorrect"),
  );
  select.value = response.grade ?? "";
  select.onchange = () => {
    response.grade = select.value || null;
    saveDictation();
    updateDictationGrade();
  };
  label.append(select);
  card.append(title, drawing, detail, label);
  return card;
}

function renderDictationReview() {
  $("dictationResponses").replaceChildren(
    ...dictation.responses.map(dictationReviewCard),
  );
  updateDictationGrade();
}

$("openDictation").onclick = showDictation;
$("dictationListen").onclick = () => playDictationWord(false);
$("dictationRepeat").onclick = () => playDictationWord(true);
$("dictationSubmit").onclick = () => submitDictationWord();
$("dictationNext").onclick = nextDictationWord;
$("dictationClear").onclick = () => {
  if (!canWrite()) return;
  writingSurface.stop();
  dictation.strokes = [];
  writingSurface.redraw();
  saveDictation();
};
$("dictationBack").onclick = () => {
  clearInterval(dictationTimer);
  cancelDictationAudio();
  writingSurface.stop();
  if (dictation.responses.length || dictation.phase !== "listen")
    saveDictation();
  setScreen("home");
};
$("dictationRestart").onclick = () => {
  if (
    !window.confirm(
      "¿Empezar otro dictado y borrar los trazos y la calificación de esta semana?",
    )
  ) {
    return;
  }
  dictation = newDictation();
  $("dictationStatus").textContent =
    "Escucha la palabra para iniciar el tiempo.";
  saveDictation();
  renderDictation();
};
window.addEventListener("pagehide", () => {
  if (dictation && (dictation.responses.length || dictation.phase !== "listen"))
    saveDictation();
});
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && !$("dictation").classList.contains("hide"))
    updateDictationClock();
});
