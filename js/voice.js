"use strict";

// Deliberately independent of the target word: never repair or guess the answer.
const LETTER_NAMES = {
  a: ["a", "ay", "aye"], b: ["b", "bee", "be"], c: ["c", "cee", "see", "sea"],
  d: ["d", "dee"], e: ["e", "ee"], f: ["f", "ef", "eff"],
  g: ["g", "gee"], h: ["h", "aitch", "haitch"], i: ["i", "eye"],
  j: ["j", "jay"], k: ["k", "kay"], l: ["l", "el", "ell"],
  m: ["m", "em"], n: ["n", "en"], o: ["o", "oh", "owe"],
  p: ["p", "pee"], q: ["q", "cue", "queue"], r: ["r", "ar", "are"],
  s: ["s", "ess"], t: ["t", "tee", "tea"], u: ["u", "you", "ewe"],
  v: ["v", "vee"], w: ["w", "double you", "double u", "double u."],
  x: ["x", "ex"], y: ["y", "why", "wye"], z: ["z", "zee", "zed"],
};

function spokenLetter(text) {
  const normalized = String(text).toLowerCase().trim()
    .replace(/[.!?,;:]+$/g, "").replace(/-/g, " ").replace(/\s+/g, " ");
  for (const [letter, names] of Object.entries(LETTER_NAMES)) {
    if (names.includes(normalized)) return letter.toUpperCase();
  }
  return null;
}

function recognizedLetter(results) {
  const finals = Array.from(results).filter((result) => result.isFinal);
  if (finals.length !== 1 || !finals[0].length) return null;
  const alternatives = Array.from(finals[0]);
  const best = alternatives[0];
  const letter = spokenLetter(best.transcript);
  // Confidence is an engine estimate, not a calibrated grade. 0 can mean unavailable.
  if (!letter || (best.confidence > 0 && best.confidence < 0.65)) return null;
  const conflicts = alternatives.slice(1).some((alternative) => {
    const other = spokenLetter(alternative.transcript);
    return other && other !== letter;
  });
  return conflicts ? null : letter;
}

function voiceAvailability() {
  if (!window.isSecureContext) return "Abre el sitio publicado con HTTPS para usar el micrófono.";
  if (!(window.SpeechRecognition || window.webkitSpeechRecognition)) {
    return "Este navegador no ofrece reconocimiento de voz. Prueba un navegador compatible; los demás juegos siguen disponibles.";
  }
  return "";
}

const VOICE_ERRORS = {
  "not-allowed": "No se permitió el micrófono. Revisa el permiso del sitio y vuelve a intentarlo.",
  "service-not-allowed": "El navegador no permite su servicio de voz. Prueba otro navegador compatible.",
  "audio-capture": "No se encontró un micrófono disponible. Revisa la conexión y vuelve a intentarlo.",
  network: "El navegador no pudo conectar con su servicio de voz. Esto también puede ocurrir dentro de una aplicación aunque tengas Internet. Copia la dirección del sitio y ábrela en Google Chrome, fuera de la aplicación. Si allí persiste, revisa la conexión y vuelve a intentarlo.",
  "language-not-supported": "El servicio de este navegador no admite reconocimiento en inglés estadounidense.",
  "no-speech": "No escuché una letra. Acércate al micrófono y repite, sin penalización.",
  aborted: "Escucha cancelada. Puedes volver a intentarlo.",
};

class BrowserLetterCapture {
  constructor(onReady, onFinish) {
    this.onReady = onReady;
    this.onFinish = onFinish;
    this.done = false;
    this.results = [];
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new Recognition();
    this.recognition.lang = "en-US";
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 5;
    this.recognition.onstart = () => { if (!this.done) this.onReady(); };
    this.recognition.onresult = (event) => {
      if (!this.done) this.results = event.results;
    };
    this.recognition.onnomatch = () => this.finish(null, "No entendí una sola letra. Vuelve a intentarlo, sin penalización.");
    this.recognition.onerror = (event) => this.finish(null,
      VOICE_ERRORS[event.error] || "No se pudo reconocer la letra. Puedes volver a intentarlo.");
    this.recognition.onend = () => {
      const letter = recognizedLetter(this.results);
      this.finish(letter, letter ? "Confirma si esa fue la letra que dijiste."
        : "No se entendió una sola letra con claridad. Repítela, sin penalización.");
    };
  }

  start() {
    this.timer = setTimeout(() => this.finish(null,
      "La escucha terminó. Puedes volver a decir la letra, sin penalización."), 15000);
    try { this.recognition.start(); }
    catch { this.finish(null, "No se pudo iniciar el micrófono. Vuelve a intentarlo."); }
  }

  stop() {
    if (this.done) return;
    try { this.recognition.stop(); }
    catch { this.finish(null, "No se pudo terminar la escucha. Vuelve a intentarlo."); }
  }

  cancel() {
    if (this.done) return;
    this.done = true;
    clearTimeout(this.timer);
    for (const name of ["onstart", "onresult", "onnomatch", "onerror", "onend"]) {
      this.recognition[name] = null;
    }
    try { this.recognition.abort(); } catch { /* Already stopped by the browser. */ }
  }

  finish(letter, message) {
    if (this.done) return;
    this.cancel();
    this.onFinish(letter, message);
  }
}

let voiceSession = null;
let voiceCapture = null;
let voicePending = null;
let voicePlaying = false;
let voicePlayback = 0;

function stopVoicePractice() {
  voiceCapture?.cancel();
  voiceCapture = null;
  voicePending = null;
  voicePlayback++;
  voicePlaying = false;
  stopAudio();
  $("voiceStatus").textContent = "La escucha está detenida. Pulsa «Decir una letra» para continuar.";
  if (voiceSession) renderVoice();
}

function openVoicePractice() {
  if (weekLoading || !weekId) return;
  stopVoicePractice();
  voiceSession = {
    context: practiceId(), deck: shuffle(practiceWords().map(({ w }) => w)),
    index: 0, letters: [], answered: false, results: [], heard: false,
  };
  $("voiceStatus").textContent = "Escucha la palabra antes de comenzar.";
  $("voiceFeedback").textContent = "";
  setScreen("voicePractice");
  renderVoice();
}

function renderVoice() {
  if (!voiceSession) return;
  const { deck, index, letters, answered, heard } = voiceSession;
  const finished = index >= deck.length;
  const unavailable = voiceAvailability();
  const busy = Boolean(voiceCapture) || voicePlaying;
  $("voiceSupport").textContent = unavailable;
  $("voiceRound").hidden = finished;
  $("voiceSummary").hidden = !finished;
  $("voiceProgress").textContent = "Palabra " + (index + 1) + " de " + deck.length;
  $("voiceLetters").textContent = letters.length ? letters.join(" – ") : "Todavía no hay letras confirmadas.";
  $("voiceRecord").disabled = Boolean(unavailable) || busy || answered || Boolean(voicePending) || !heard || letters.length >= 30;
  $("voiceRecord").setAttribute("aria-pressed", Boolean(voiceCapture));
  $("voiceStop").hidden = !voiceCapture;
  $("voicePlay").disabled = busy || finished;
  $("voicePlaySlow").disabled = busy || finished;
  $("voiceCandidate").hidden = !voicePending;
  $("voiceAccept").disabled = !voicePending || busy || answered;
  $("voiceRetry").disabled = !voicePending || busy || answered;
  if (voicePending) $("voiceHeard").textContent = "El navegador entendió: " + voicePending + ". ¿Dijiste esa letra?";
  $("voiceUndo").disabled = busy || answered || !letters.length;
  $("voiceClear").disabled = busy || answered || (!letters.length && !voicePending);
  $("voiceCheck").disabled = busy || answered || Boolean(voicePending) || !letters.length;
  $("voiceNext").hidden = !answered;
  $("voiceNext").textContent = index + 1 === deck.length ? "Ver resultado →" : "Siguiente palabra →";
  if (finished) {
    const correct = voiceSession.results.filter((result) => result.correct).length;
    $("voiceScore").textContent = "Práctica terminada: " + correct + " de " + deck.length
      + " deletreos correctos con las letras que confirmaste. La pronunciación no se califica.";
  }
}

async function playVoiceWord(rate = 1) {
  if (!voiceSession || voiceCapture || voicePlaying || voiceSession.index >= voiceSession.deck.length) return;
  const session = voiceSession;
  const token = ++voicePlayback;
  voicePlaying = true;
  renderVoice();
  unlockAudio();
  const played = await playWord(session.deck[session.index], rate);
  if (token !== voicePlayback || session !== voiceSession) return;
  voicePlaying = false;
  if (played) session.heard = true;
  $("voiceStatus").textContent = played
    ? "Pulsa «Decir una letra», di su nombre en inglés y espera la confirmación."
    : "No se pudo reproducir la palabra. Vuelve a intentarlo.";
  renderVoice();
}

function recordVoiceLetter() {
  if (!voiceSession || voiceSession.answered || !voiceSession.heard || voicePending
    || voiceCapture || voicePlaying || document.hidden
    || voiceSession.letters.length >= 30 || voiceAvailability()) return;
  stopAudio();
  const session = voiceSession;
  $("voiceStatus").textContent = "Preparando micrófono… Si el navegador lo pide, permite el acceso para esta práctica.";
  try {
    const capture = new BrowserLetterCapture(() => {
      $("voiceStatus").textContent = "🎤 Escuchando. Di una sola letra en inglés.";
    }, (letter, message) => {
      if (voiceCapture !== capture || voiceSession !== session) return;
      voiceCapture = null;
      voicePending = letter;
      $("voiceStatus").textContent = message;
      renderVoice();
      if (letter) $("voiceAccept").focus();
    });
    voiceCapture = capture;
    renderVoice();
    capture.start();
  } catch {
    voiceCapture = null;
    $("voiceStatus").textContent = "No se pudo preparar el reconocimiento de voz en este navegador.";
    renderVoice();
  }
}

function acceptVoiceLetter() {
  if (!voiceSession || voiceSession.answered || !voicePending || voiceCapture || voicePlaying) return;
  voiceSession.letters.push(voicePending);
  voicePending = null;
  $("voiceStatus").textContent = "Letra añadida. Di la siguiente o comprueba el deletreo si terminaste.";
  renderVoice();
  $("voiceRecord").focus();
}

function checkVoiceWord() {
  if (!voiceSession || voiceSession.answered || voiceCapture || voicePlaying || voicePending || !voiceSession.letters.length) return;
  const word = voiceSession.deck[voiceSession.index];
  const response = voiceSession.letters.join("");
  const correct = response === word.toUpperCase();
  voiceSession.answered = true;
  voiceSession.results.push({ word, response, correct });
  $("voiceFeedback").textContent = correct
    ? "✅ ¡Correcto! Las letras confirmadas forman " + word.toUpperCase() + "."
    : "Hay una diferencia. Confirmaste " + response.split("").join(" – ")
      + ". El deletreo es " + word.toUpperCase().split("").join(" – ") + ".";
  renderVoice();
  $("voiceNext").focus();
}

function nextVoiceWord() {
  if (!voiceSession?.answered) return;
  stopVoicePractice();
  voiceSession.index++;
  voiceSession.letters = [];
  voiceSession.answered = false;
  voiceSession.heard = false;
  $("voiceFeedback").textContent = "";
  $("voiceStatus").textContent = "Escucha la siguiente palabra para comenzar.";
  renderVoice();
  if (voiceSession.index >= voiceSession.deck.length) $("voiceScore").focus();
  else $("voicePlay").focus();
}

$("openVoice").onclick = openVoicePractice;
$("voiceBack").onclick = () => setScreen("home");
$("voicePlay").onclick = () => playVoiceWord();
$("voicePlaySlow").onclick = () => playVoiceWord(0.72);
$("voiceRecord").onclick = recordVoiceLetter;
$("voiceStop").onclick = () => voiceCapture?.stop();
$("voiceAccept").onclick = acceptVoiceLetter;
$("voiceRetry").onclick = () => {
  voicePending = null;
  recordVoiceLetter();
};
$("voiceUndo").onclick = () => {
  if (!voiceSession || voiceSession.answered || voiceCapture || voicePlaying) return;
  voicePending = null;
  voiceSession.letters.pop();
  renderVoice();
};
$("voiceClear").onclick = () => {
  if (!voiceSession || voiceSession.answered || voiceCapture || voicePlaying) return;
  voicePending = null;
  voiceSession.letters = [];
  $("voiceStatus").textContent = "Di la primera letra cuando estés listo.";
  renderVoice();
};
$("voiceCheck").onclick = checkVoiceWord;
$("voiceNext").onclick = nextVoiceWord;
$("voiceRestart").onclick = openVoicePractice;
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopVoicePractice();
});
window.addEventListener("pagehide", stopVoicePractice);
