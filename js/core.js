"use strict";

const $ = (id) => document.getElementById(id);
const LAST_WEEK_KEY = "spelling_bee_last_selected_week_v4";
const WEEK_ID = /^week-\d+$/;
const WORD_ASSET = /^assets\/words\/[a-z\d_-]+\.(webp|png|jpe?g)$/i;

let WORDS = [];
let WORD_IMAGES = {};
let WORD_EXAMPLES = {};
let WORD_LABELS = {};
let weekId = "";
let weekLoading = true;
let completed = {};
let weekCatalog = [];
let contestStudy;
let contestModule = 0;
const CONTEST_MODULE_SIZE = 10;
const CONTEST_MODULE_KEY = "spelling_bee_contest_module_v1";

function practiceWords() {
  return weekId === "contest-2026"
    ? WORDS.slice(contestModule * CONTEST_MODULE_SIZE, (contestModule + 1) * CONTEST_MODULE_SIZE)
    : WORDS;
}

function practiceId() {
  return weekId === "contest-2026" ? weekId + "-module-" + (contestModule + 1) : weekId;
}

function loadPracticeProgress() {
  const saved = readStorage(progressKey(), {});
  completed = saved && typeof saved === "object" ? saved : {};
  $("activityTitle").textContent = weekId === "contest-2026"
    ? "🏆 Juegos del concurso · Módulo " + (contestModule + 1) + " · 10 palabras"
    : "🎮 Elige tu juego";
  updateHome();
}

function chooseContestModule(value) {
  const index = Number(value);
  if (!Number.isInteger(index) || index < 0 || index > 2) return;
  stopAudio();
  contestModule = index;
  $("contestModule").value = String(index);
  writeStorage(CONTEST_MODULE_KEY, index);
  if (weekId === "contest-2026") loadPracticeProgress();
}

function readStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// Keep the v4 keys so previous game results remain available on the same origin.
function progressKey() {
  return "spelling_bee_ceb_progress_v4_" + practiceId();
}

function saveProgress() {
  writeStorage(progressKey(), completed);
}

function lastWeek() {
  try {
    return localStorage.getItem(LAST_WEEK_KEY);
  } catch {
    return null;
  }
}

function rememberWeek(id) {
  try {
    localStorage.setItem(LAST_WEEK_KEY, id);
  } catch {
    // The selector still works when the browser blocks local storage.
  }
}

async function readContent(path) {
  if (location.protocol === "file:") {
    const local = LOCAL_CONTENT[path];
    if (!local) throw new Error("Archivo de datos desconocido.");
    return local;
  }
  const response = await fetch(path, { cache: "no-cache" });
  if (!response.ok) throw new Error("HTTP " + response.status);
  return response.json();
}

function setScreen(id) {
  if (id !== "voicePractice" && typeof stopVoicePractice === "function") stopVoicePractice();
  const screens = ["home", "game", "wordList", "soundLab", "dictation", "voicePractice"];
  for (const screen of screens) {
    $(screen).classList.toggle("hide", screen !== id);
  }
  document.body.classList.toggle("activity-view", id !== "home");
  window.scrollTo(0, 0);
}

const shuffle = (items) => {
  const deck = [...items];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

function validWeek(data, id) {
  if (data?.id !== id || !Array.isArray(data.words) || data.words.length < 4) {
    return false;
  }
  const seen = new Set();
  return data.words.every(({ word, spanish, sentence, image } = {}) => {
    const valid =
      /^[a-z]{2,20}$/.test(word) &&
      !seen.has(word) &&
      typeof spanish === "string" &&
      spanish.trim() &&
      !/[<>]/.test(spanish) &&
      typeof sentence === "string" &&
      sentence.trim() &&
      !/[<>]/.test(sentence) &&
      WORD_ASSET.test(image);
    seen.add(word);
    return valid;
  });
}

function setWeekLoading(loading) {
  weekLoading = loading;
  $("weekSelect").disabled = loading;
  $("openWordList").disabled = loading || !weekId;
  $("openDictation").disabled = loading || !weekId;
  $("openVoice").disabled = loading || !weekId;
  $("openContest").disabled = loading;
  $("openContestGames").disabled = loading;
  $("contestModule").disabled = loading;
  $("backToWeeks").disabled = loading;
  $("modes").inert = loading;
  $("resetAll").disabled = loading || Object.keys(completed).length === 0;
}

async function chooseWeek(id) {
  const item = weekCatalog.find((week) => week.id === id)
    ?? (contestStudy?.id === id ? contestStudy : null);
  if (!item) return;
  setWeekLoading(true);
  stopAudio();
  $("weekStatus").textContent = "Cargando palabras…";
  try {
    const data = await readContent(item.file);
    if (!validWeek(data, id)) throw new Error("Lista no válida.");
    WORDS = data.words.map(({ word, spanish }) => ({ w: word, es: spanish }));
    WORD_IMAGES = Object.fromEntries(
      data.words.map((entry) => [entry.word, entry.image]),
    );
    WORD_EXAMPLES = Object.fromEntries(
      data.words.map((entry) => [entry.word, entry.sentence]),
    );
    WORD_LABELS = Object.fromEntries(
      data.words.map((entry) => [entry.word, entry.display ?? entry.word]),
    );
    weekId = id;
    const isContest = id === "contest-2026";
    if (!isContest) {
      $("weekSelect").value = id;
      rememberWeek(id);
    }
    $("weeklyControls").hidden = isContest;
    $("backToWeeks").hidden = !isContest;
    loadPracticeProgress();
    $("weekStatus").textContent = WORDS.length + " palabras · " + item.title;
    return true;
  } catch (error) {
    $("weekStatus").textContent =
      "No se pudo cargar esa semana. " + error.message;
    if (WEEK_ID.test(weekId)) $("weekSelect").value = weekId;
    return false;
  } finally {
    setWeekLoading(false);
  }
}

async function initWeeks() {
  const savedModule = readStorage(CONTEST_MODULE_KEY, 0);
  contestModule = Number.isInteger(savedModule) && savedModule >= 0 && savedModule < 3
    ? savedModule : 0;
  $("contestModule").value = String(contestModule);
  $("contestModule").onchange = () => chooseContestModule($("contestModule").value);
  try {
    const manifest = await readContent("data/manifest.json");
    if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.weeks)) {
      throw new Error("El catálogo no es válido.");
    }
    weekCatalog = manifest.weeks.filter(
      (week) =>
        WEEK_ID.test(week?.id) &&
        typeof week.title === "string" &&
        week.file === "data/" + week.id + ".json",
    );
    if (!weekCatalog.length) throw new Error("No hay semanas disponibles.");
    const contest = manifest.contest;
    if (
      contest?.id === "contest-2026" &&
      contest.file === "data/contest-2026.json" &&
      typeof contest.title === "string"
    ) contestStudy = contest;
    const select = $("weekSelect");
    select.replaceChildren(
      ...weekCatalog.map(({ id, title }) => new Option(title, id)),
    );
    const requested = [lastWeek(), manifest.defaultWeek].find((id) =>
      weekCatalog.some((week) => week.id === id),
    );
    select.value = requested ?? weekCatalog.at(-1).id;
    select.onchange = () => chooseWeek(select.value);
    await chooseWeek(select.value);
  } catch (error) {
    $("weekStatus").textContent =
      "No se pudo cargar el catálogo. " + error.message;
  }
}
