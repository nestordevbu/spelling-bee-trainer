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

function spokenLetters(text) {
  const tokens = String(text).toLowerCase().trim().replace(/[.,!?;:\-]+/g, " ")
    .split(/\s+/).filter(Boolean);
  const letters = [];
  for (let index = 0; index < tokens.length; index++) {
    const pair = tokens.slice(index, index + 2).join(" ");
    if (pair === "double you" || pair === "double u") {
      letters.push("W");
      index++;
      continue;
    }
    const letter = spokenLetter(tokens[index]);
    if (!letter) return null;
    letters.push(letter);
  }
  return letters.length && letters.length <= 30 ? letters.join("") : null;
}

function recognizedLetters(results) {
  if (Array.from(results).some((result) => !result.isFinal)) return null;
  const finals = Array.from(results).filter((result) => result.isFinal);
  if (!finals.length || finals.some((result) => !result.length)) return null;
  for (const result of finals) {
    const best = result[0];
    if (best.confidence > 0 && best.confidence < 0.65) return null;
    const bestLetters = spokenLetters(best.transcript);
    if (Array.from(result).slice(1).some((alternative) => {
      const other = spokenLetters(alternative.transcript);
      return other && bestLetters && other !== bestLetters;
    })) return null;
  }
  // The browser's list is cumulative; parse its latest snapshot, never append it.
  return spokenLetters(finals.map((result) => result[0].transcript).join(" "));
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
  "no-speech": "No escuché el deletreo. Acércate al micrófono y repite, sin penalización.",
  aborted: "Escucha cancelada. Puedes volver a intentarlo.",
};

class BrowserSpellingCapture {
  constructor(onReady, onFinish, onPartial = () => {}) {
    this.onReady = onReady;
    this.onFinish = onFinish;
    this.onPartial = onPartial;
    this.done = false;
    this.results = [];
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new Recognition();
    this.recognition.lang = "en-US";
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 5;
    this.recognition.onstart = () => { if (!this.done) this.onReady(); };
    this.recognition.onresult = (event) => {
      if (this.done) return;
      this.results = Array.from(event.results, (result) => {
        const copy = Array.from(result, ({transcript, confidence}) => ({transcript, confidence}));
        copy.isFinal = result.isFinal;
        return copy;
      });
      this.onPartial(this.results.map((result) => result[0]?.transcript || "").join(" ").slice(0, 300));
    };
    this.recognition.onnomatch = () => this.finish(null, "No entendí el deletreo. Vuelve a intentarlo, sin penalización.");
    this.recognition.onerror = (event) => this.finish(null,
      VOICE_ERRORS[event.error] || "No se pudo reconocer el deletreo. Puedes volver a intentarlo.");
    this.recognition.onend = () => {
      const letter = recognizedLetters(this.results);
      this.finish(letter, letter ? "Revisa todas las letras y pulsa «Comprobar deletreo»."
        : "No se entendió el deletreo con claridad. Repite los nombres de las letras en inglés, con una pausa breve entre ellas, sin decir la palabra completa.");
    };
  }

  start() {
    this.timer = setTimeout(() => this.stop(), 45000);
    try { this.recognition.start(); }
    catch { this.finish(null, "No se pudo iniciar el micrófono. Vuelve a intentarlo."); }
  }

  stop() {
    if (this.done || this.stopping) return;
    this.stopping = true;
    clearTimeout(this.timer);
    // Give stop() time to deliver the last final result before recovering.
    this.timer = setTimeout(() => this.finish(null,
      "El servicio no terminó de procesar el deletreo. Puedes repetir, sin penalización."), 5000);
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
  $("voiceStatus").textContent = "La escucha está detenida. Pulsa «Deletrear palabra» para continuar.";
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
  $("voiceLetters").textContent = voicePending ? voicePending.split("").join(" – ")
    : letters.length ? letters.join(" – ") : "Aquí aparecerá el deletreo completo.";
  $("voiceRecord").disabled = Boolean(unavailable) || busy || answered || Boolean(voicePending) || !heard || letters.length >= 30;
  $("voiceRecord").setAttribute("aria-pressed", Boolean(voiceCapture));
  $("voiceStop").hidden = !voiceCapture;
  $("voicePlay").disabled = busy || finished;
  $("voicePlaySlow").disabled = busy || finished;
  $("voiceCandidate").hidden = !voicePending;
  $("voiceRetry").disabled = !voicePending || busy || answered;
  if (voicePending) $("voiceHeard").textContent = "Revisa el deletreo reconocido. Si corresponde a lo que dijiste, pulsa «Comprobar deletreo».";
  $("voiceUndo").disabled = busy || answered || (!letters.length && !voicePending);
  $("voiceClear").disabled = busy || answered || (!letters.length && !voicePending);
  $("voiceCheck").disabled = busy || answered || (!letters.length && !voicePending);
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
    ? "Pulsa «Deletrear palabra», di todas las letras en inglés y después pulsa «Terminé»."
    : "No se pudo reproducir la palabra. Vuelve a intentarlo.";
  renderVoice();
}

function recordVoiceSpelling() {
  if (!voiceSession || voiceSession.answered || !voiceSession.heard || voicePending
    || voiceCapture || voicePlaying || document.hidden
    || voiceSession.letters.length >= 30 || voiceAvailability()) return;
  stopAudio();
  const session = voiceSession;
  $("voiceStatus").textContent = "Preparando micrófono… Si el navegador lo pide, permite el acceso para esta práctica.";
  try {
    const capture = new BrowserSpellingCapture(() => {
      $("voiceStatus").textContent = "🎤 Escuchando. Di todas las letras en inglés y pulsa «Terminé».";
    }, (letter, message) => {
      if (voiceCapture !== capture || voiceSession !== session) return;
      voiceCapture = null;
      voicePending = letter;
      $("voiceStatus").textContent = message;
      renderVoice();
      if (letter) $("voiceCheck").focus();
    }, (transcript) => {
      if (voiceCapture === capture && voiceSession === session) {
        $("voiceStatus").textContent = "🎤 Escuché: " + transcript + ". Continúa o pulsa «Terminé».";
      }
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

function checkVoiceWord() {
  if (!voiceSession || voiceSession.answered || voiceCapture || voicePlaying) return;
  if (voicePending) {
    voiceSession.letters = voicePending.split("");
    voicePending = null;
  }
  if (!voiceSession.letters.length) return;
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
$("voiceRecord").onclick = recordVoiceSpelling;
$("voiceStop").onclick = () => voiceCapture?.stop();
$("voiceRetry").onclick = () => {
  voicePending = null;
  recordVoiceSpelling();
};
$("voiceUndo").onclick = () => {
  if (!voiceSession || voiceSession.answered || voiceCapture || voicePlaying) return;
  if (voicePending) voicePending = voicePending.slice(0, -1) || null;
  else voiceSession.letters.pop();
  renderVoice();
};
$("voiceClear").onclick = () => {
  if (!voiceSession || voiceSession.answered || voiceCapture || voicePlaying) return;
  voicePending = null;
  voiceSession.letters = [];
  $("voiceStatus").textContent = "Deletrea la palabra completa cuando estés listo.";
  renderVoice();
};
$("voiceCheck").onclick = checkVoiceWord;
$("voiceNext").onclick = nextVoiceWord;
$("voiceRestart").onclick = openVoicePractice;
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopVoicePractice();
});
window.addEventListener("pagehide", stopVoicePractice);
