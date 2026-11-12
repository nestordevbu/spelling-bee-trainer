"use strict";

let contestEvent;

// Compare calendar dates in the event's time zone, independent of device time zone.
function contestDaysLeft(event, now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: event.timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now);
  const date = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const [year, month, day] = event.date.split("-").map(Number);
  const target = Date.UTC(year, month - 1, day);
  const today = Date.UTC(+date.year, +date.month - 1, +date.day);
  return Math.round((target - today) / 86400000);
}

function updateContestCountdown() {
  if (!contestEvent) return;
  const days = contestDaysLeft(contestEvent);
  const counter = $("contestCountdown");
  counter.replaceChildren();
  const number = document.createElement("strong");
  const caption = document.createElement("span");
  if (days > 0) {
    number.textContent = days;
    caption.textContent = days === 1 ? "día para el concurso" : "días para el concurso";
  } else {
    number.textContent = days === 0 ? "¡Hoy!" : "🐝";
    caption.textContent = days === 0
      ? "¡Confía en lo que aprendiste!"
      : "¡Sigue practicando!";
  }
  counter.append(number, caption);
}

async function initContest() {
  try {
    const { event } = await readContent("data/contest-2026.json");
    contestEvent = event;
    $("contestTitle").textContent = event.name;
    const date = new Intl.DateTimeFormat("es-MX", {
      timeZone: event.timeZone,
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(event.date + "T12:00:00-07:00"));
    $("contestSchedule").textContent =
      date + " · " + event.time + " · " + event.venue;
    $("contestGrades").textContent = "Para estudiantes de " + event.grades + ".";
    $("contestRules").replaceChildren(...event.rules.map((rule) => {
      const item = document.createElement("li");
      item.textContent = rule;
      return item;
    }));
    $("contestNextEvent").textContent = event.nextEvent;
    $("contestRegistration").textContent = event.registration;
    $("contestContact").textContent = event.contact;
    updateContestCountdown();
    setInterval(updateContestCountdown, 60000);
  } catch {
    $("contestStatus").textContent =
      "No se pudo cargar la información del concurso. Vuelve a intentarlo.";
  }
}

$("openContest").onclick = async () => {
  $("contestStatus").textContent = "";
  const loaded = await chooseWeek("contest-2026");
  if (loaded) openWordList();
  else $("contestStatus").textContent = "No se pudo abrir la lista del concurso.";
};

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) updateContestCountdown();
});
