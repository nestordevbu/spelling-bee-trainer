"use strict";

let labCatalog;
let labGroup = "letters";
let labPlayback = 0;
let labQuiz = null;
const LAB_ROUNDS = 10;

function labButton(label, clip) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "secondary";
  button.textContent = label;
  button.dataset.clip = clip;
  return button;
}

function labCard({ id, label, ipa, examples, note }) {
  const card = document.createElement("article");
  card.className = "lab-card";
  const title = document.createElement("h3");
  title.textContent = label;
  title.lang = "en-US";
  const sound = document.createElement("p");
  sound.className = "muted lab-ipa";
  sound.textContent = "/" + ipa + "/";
  const buttons = document.createElement("div");
  buttons.className = "activity-actions";
  if (labGroup === "letters")
    buttons.append(labButton("🔊 Nombre", "name-" + id));
  buttons.append(labButton("🔊 Sonido", "sound-" + id));
  card.append(title, sound, buttons);
  if (note) {
    const detail = document.createElement("p");
    detail.className = "muted";
    detail.textContent = note;
    card.append(detail);
  }
  const words = document.createElement("div");
  words.className = "activity-actions lab-examples";
  for (const example of examples) {
    const button = labButton("▶ " + example, example);
    button.lang = "en-US";
    words.append(button);
  }
  card.append(words);
  return card;
}

function renderLab() {
  $("labLetters").setAttribute("aria-pressed", labGroup === "letters");
  $("labPatterns").setAttribute("aria-pressed", labGroup === "patterns");
  $("labCards").hidden = Boolean(labQuiz);
  $("labPractice").hidden = !labQuiz;
  $("labPracticeToggle").disabled = false;
  $("labPracticeToggle").textContent = labQuiz
    ? "Volver a las tarjetas"
    : "Practicar con 5 opciones";
  if (!labQuiz)
    $("labCards").replaceChildren(...labCatalog[labGroup].map(labCard));
}

function stopLabAudio() {
  labPlayback++;
  stopAudio();
  $("labStatus").textContent = "";
}

async function playLabClip(clip) {
  const request = ++labPlayback;
  $("labStatus").textContent = "";
  const rate = $("labSlow").checked ? 0.75 : 1;
  const played = await playClip("assets/audio/lab/" + clip + ".wav", rate);
  if (request !== labPlayback) return false;
  if (!played && !document.hidden) {
    $("labStatus").textContent =
      "No se pudo reproducir el audio. Vuelve a intentarlo.";
  }
  return played;
}

function startLabQuiz() {
  const pool = labCatalog[labGroup];
  labQuiz = {
    deck: labGroup === "letters"
      ? shuffle(pool)
      : shuffle(pool).slice(0, LAB_ROUNDS),
    index: 0,
    score: 0,
    round: null,
  };
  renderLab();
  renderLabRound();
  $("labPracticeTitle").focus();
}

function renderLabRound() {
  $("labMascot").hidden = true;
  $("labMascot").alt = "";
  const { deck, index } = labQuiz;
  const target = deck[index];
  const distractors = new Map();
  // Letter names are distinct; phoneme choices must also have distinct sounds.
  for (const card of shuffle(labCatalog[labGroup])) {
    if (
      card.label !== target.label &&
      (labGroup === "letters" || card.ipa !== target.ipa)
    ) {
      distractors.set(card.label, card);
    }
  }
  const choices = shuffle([target, ...[...distractors.values()].slice(0, 4)]);
  labQuiz.round = { target, heard: false, answered: false };

  $("labRound").textContent = "Ronda " + (index + 1) + " de " + deck.length;
  $("labFeedback").textContent = labGroup === "letters"
    ? "Escucha el nombre de la letra para activar las opciones."
    : "Escucha el sonido para activar las opciones.";
  $("labListen").hidden = false;
  $("labListen").disabled = false;
  $("labListen").textContent = labGroup === "letters"
    ? "🔊 Escuchar nombre"
    : "🔊 Escuchar sonido";
  $("labNext").hidden = true;
  $("labOptions").replaceChildren(
    ...choices.map((card) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice";
      button.textContent = card.label;
      button.lang = "en-US";
      button.disabled = true;
      button.onclick = () => answerLabRound(card);
      return button;
    }),
  );
}

async function listenLabRound() {
  const round = labQuiz?.round;
  if (!round) return;
  $("labListen").disabled = true;
  const prefix = labGroup === "letters" ? "name-" : "sound-";
  const played = await playLabClip(prefix + round.target.id);
  if (round !== labQuiz?.round) return;
  $("labListen").disabled = false;
  if (!played || round.heard) return;

  round.heard = true;
  $("labListen").textContent = "🔊 Volver a escuchar";
  $("labFeedback").textContent =
    labGroup === "letters"
      ? "Elige la letra cuyo nombre escuchaste."
      : "Elige la combinación que corresponde al sonido.";
  for (const button of $("labOptions").children) button.disabled = false;
}

function answerLabRound(card) {
  const { round, deck, index } = labQuiz;
  if (!round.heard || round.answered) return;
  round.answered = true;
  const correct = card === round.target;
  if (correct) labQuiz.score++;
  $("labMascot").src = correct ? MASCOT_SUCCESS : MASCOT_TRY;
  $("labMascot").alt = correct
    ? "Mascota felicitando por la respuesta correcta"
    : "Mascota animando a seguir intentando";
  $("labMascot").hidden = false;
  const label = round.target.label;
  $("labFeedback").textContent = correct
    ? "¡Correcto! " + label + " · " + round.target.examples[0]
    : "La respuesta es " + label + " · " + round.target.examples[0];
  for (const button of $("labOptions").children) {
    button.disabled = true;
    button.classList.toggle("good", button.textContent === label);
    button.classList.toggle(
      "bad",
      !correct && button.textContent === card.label,
    );
  }
  $("labNext").textContent =
    index + 1 === deck.length ? "Ver resultado →" : "Siguiente →";
  $("labNext").hidden = false;
  $("labNext").focus();
}

function advanceLabQuiz() {
  stopLabAudio();
  const { deck, score } = labQuiz;
  if (!labQuiz.round) {
    startLabQuiz();
  } else if (++labQuiz.index < deck.length) {
    renderLabRound();
    $("labListen").focus();
  } else {
    labQuiz.round = null;
    $("labMascot").hidden = true;
    $("labMascot").alt = "";
    $("labRound").textContent = "";
    $("labListen").hidden = true;
    $("labOptions").replaceChildren();
    $("labFeedback").textContent =
      "Resultado: " + score + " de " + deck.length + " aciertos.";
    $("labNext").textContent = "Practicar otra vez";
    $("labPracticeTitle").focus();
  }
}

async function openLab() {
  stopAudio();
  setScreen("soundLab");
  if (labCatalog) return;
  $("labStatus").textContent = "Cargando sonidos…";
  try {
    labCatalog = await readContent("data/phonics.json");
    renderLab();
    $("labStatus").textContent = "";
  } catch {
    $("labStatus").textContent =
      "No se pudo cargar el laboratorio. Vuelve a intentarlo.";
  }
}

function chooseLabGroup(group) {
  if (!labCatalog || group === labGroup) return;
  stopLabAudio();
  labGroup = group;
  if (labQuiz) startLabQuiz();
  else renderLab();
}

$("openLab").onclick = openLab;
$("labBack").onclick = () => {
  stopLabAudio();
  if (labQuiz) {
    labQuiz = null;
    renderLab();
  }
  setScreen("home");
};
$("labLetters").onclick = () => chooseLabGroup("letters");
$("labPatterns").onclick = () => chooseLabGroup("patterns");
$("labPracticeToggle").onclick = () => {
  stopLabAudio();
  if (labQuiz) {
    labQuiz = null;
    renderLab();
  } else startLabQuiz();
};
$("labListen").onclick = listenLabRound;
$("labNext").onclick = advanceLabQuiz;
$("labCards").onclick = (event) => {
  const button = event.target.closest("[data-clip]");
  if (button) playLabClip(button.dataset.clip);
};
