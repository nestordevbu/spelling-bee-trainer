"use strict";

let guidedLesson = null;
let guidedLessonLoading = false;

function pauseGuidedLesson() {
  $("guidedLessonVideo").pause();
}

function guidedChapterIndex() {
  if (!guidedLesson) return 0;
  const time = $("guidedLessonVideo").currentTime;
  return Math.max(0, guidedLesson.chapters.findLastIndex(({ start }) => start <= time + 0.02));
}

function updateGuidedChapter() {
  if (!guidedLesson) return;
  const index = guidedChapterIndex();
  $("guidedLessonChapter").textContent = guidedLesson.chapters[index].title;
  $("guidedLessonPrevious").disabled = index === 0;
  $("guidedLessonNext").disabled = index === guidedLesson.chapters.length - 1;
}

function seekGuidedChapter(index) {
  if (!guidedLesson || !Number.isInteger(index) || index < 0 || index >= guidedLesson.chapters.length) return;
  $("guidedLessonVideo").currentTime = guidedLesson.chapters[index].start;
  updateGuidedChapter();
  // Keep the existing play/pause state when moving between chapters.
}

async function openGuidedLesson() {
  stopAudio();
  setScreen("guidedLesson");
  if (guidedLesson || guidedLessonLoading) return;
  guidedLessonLoading = true;
  $("guidedLessonStatus").textContent = "Preparando la práctica completa…";
  try {
    const data = await readContent("data/guided-lesson.json");
    if (!Array.isArray(data.chapters) || !data.chapters.length ||
        data.video !== "assets/videos/guided-lesson/lesson.mp4") throw new Error("Contenido no válido.");
    guidedLesson = data;
    const video = $("guidedLessonVideo");
    video.src = data.video;
    video.load();
    for (const [id, section] of [["guidedLetterChapters", "alphabet"], ["guidedWordChapters", "words"]]) {
      const buttons = data.chapters.flatMap((chapter, index) => {
        if (chapter.section !== section) return [];
        const button = document.createElement("button");
        button.className = "secondary";
        button.textContent = chapter.title;
        button.onclick = () => {
          seekGuidedChapter(index);
          video.scrollIntoView({ block: "center", behavior: "smooth" });
        };
        return [button];
      });
      $(id).replaceChildren(...buttons);
    }
    $("guidedLessonDuration").textContent = Math.ceil(data.duration / 60) +
      " minutos aprox. · 26 letras + 30 palabras · Inglés americano";
    $("guidedLessonStatus").textContent = "Pulsa reproducir para comenzar. Puedes pausar y repetir cualquier capítulo.";
    $("guidedLessonPrevious").disabled = true;
    $("guidedLessonRepeat").disabled = false;
    $("guidedLessonNext").disabled = false;
    updateGuidedChapter();
  } catch {
    guidedLesson = null;
    $("guidedLessonStatus").textContent = "No se pudo cargar la práctica. Vuelve al inicio e inténtalo de nuevo.";
  } finally {
    guidedLessonLoading = false;
  }
}

$("openGuidedLesson").onclick = openGuidedLesson;
$("guidedLessonBack").onclick = () => setScreen("home");
$("guidedLessonPrevious").onclick = () => seekGuidedChapter(guidedChapterIndex() - 1);
$("guidedLessonRepeat").onclick = () => seekGuidedChapter(guidedChapterIndex());
$("guidedLessonNext").onclick = () => seekGuidedChapter(guidedChapterIndex() + 1);
$("guidedLessonVideo").ontimeupdate = updateGuidedChapter;
$("guidedLessonVideo").onplay = () => {
  stopAudio();
  if (typeof pauseStudyVideo === "function") pauseStudyVideo();
};
$("guidedLessonVideo").onerror = () => {
  $("guidedLessonStatus").textContent = "No se pudo reproducir el video. Comprueba la conexión o descarga el MP4.";
};
$("guidedLessonVideo").onended = () => {
  $("guidedLessonStatus").textContent = "You can do it Matteo! ¡Sigue practicando!";
};
document.addEventListener("visibilitychange", () => {
  if (document.hidden) pauseGuidedLesson();
});
