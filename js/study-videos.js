"use strict";

let studyVideoIndex = 0;
let studyVideoReturnButton = null;
let studyVideoRequest = 0;

function pauseStudyVideo() {
  studyVideoRequest++;
  studyVideoReturnButton = null;
  $("studyVideo").pause();
}

function selectStudyVideo(index) {
  if (!Number.isInteger(index) || index < 0 || index >= WORDS.length) return;
  stopAudio();
  pauseStudyVideo();
  studyVideoIndex = index;
  const { w } = WORDS[index];
  const base = "assets/videos/" + weekId + "/" + w;
  const player = $("studyVideo");
  $("studyVideoStatus").textContent = "";
  player.poster = base + ".jpg";
  player.src = base + ".mp4";
  player.setAttribute("aria-label", "Video de deletreo de " + WORD_LABELS[w]);
  const captions = document.createElement("track");
  captions.kind = "captions";
  captions.label = "English";
  captions.srclang = "en";
  captions.src = base + ".vtt";
  player.replaceChildren(captions);
  player.load();
  $("studyVideoWord").textContent = WORD_LABELS[w];
  $("studyVideoPrevious").disabled = index === 0;
  $("studyVideoNext").disabled = index === WORDS.length - 1;
  $("studyVideoDownload").href = base + ".mp4";
  $("studyVideoDownload").download = w + ".mp4";
  $("studyVideoCount").textContent = (index + 1) + " de " + WORDS.length;
}

function openStudyVideos() {
  selectStudyVideo(0);
}

function watchStudyVideo(word, button) {
  const index = WORDS.findIndex(({ w }) => w === word);
  if (index < 0) return;
  selectStudyVideo(index);
  studyVideoReturnButton = button;
  const request = studyVideoRequest;
  $("studyVideoTitle").focus({ preventScroll: true });
  $("studyVideos").scrollIntoView({ behavior: "smooth", block: "start" });
  // Request play during the button gesture. The browser starts once media is ready.
  $("studyVideo").play().catch(() => {
    if (request !== studyVideoRequest) return;
    $("studyVideoStatus").textContent = "Pulsa reproducir en el video para comenzar.";
  });
}

$("studyVideoPrevious").onclick = () => selectStudyVideo(studyVideoIndex - 1);
$("studyVideoNext").onclick = () => selectStudyVideo(studyVideoIndex + 1);
$("studyVideoSpeed").onchange = () => {
  $("studyVideo").playbackRate = Number($("studyVideoSpeed").value);
};
$("studyVideo").onplay = () => {
  stopAudio();
  $("studyVideo").playbackRate = Number($("studyVideoSpeed").value);
};
$("studyVideo").onerror = () => {
  $("studyVideoStatus").textContent = "No se pudo cargar el video. Puedes usar los audios de la lista y volver a intentarlo.";
};
$("studyVideo").onended = () => {
  const button = studyVideoReturnButton;
  studyVideoReturnButton = null;
  if (button?.isConnected) {
    $("studyVideoStatus").textContent = "¡Muy bien! Puedes seguir estudiando tu palabra.";
    button.focus({ preventScroll: true });
    button.closest(".word-entry").scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  if (studyVideoIndex === WORDS.length - 1) {
    $("studyVideoStatus").textContent = "¡Terminaste los videos de esta lista!";
  } else {
    $("studyVideoStatus").textContent = "¡Muy bien! Pulsa Siguiente para continuar.";
  }
};
document.addEventListener("visibilitychange", () => {
  if (document.hidden) pauseStudyVideo();
});
