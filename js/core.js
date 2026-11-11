"use strict";

const $ = (id) => document.getElementById(id);
const LAST_WEEK_KEY = "spelling_bee_last_selected_week_v4";
const WEEK_ID = /^week-\d+$/;
const WORD_ASSET = /^assets\/words\/[a-z\d_-]+\.(webp|png|jpe?g)$/i;

let WORDS = [];
let WORD_IMAGES = {};
let WORD_EXAMPLES = {};
let weekId = "";
let weekLoading = true;
let completed = {};
let weekCatalog = [];

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
  return "spelling_bee_ceb_progress_v4_" + weekId;
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
  const screens = ["home", "game", "wordList", "soundLab", "dictation"];
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
  $("modes").inert = loading;
  $("resetAll").disabled = loading || Object.keys(completed).length === 0;
}

async function chooseWeek(id) {
  const item = weekCatalog.find((week) => week.id === id);
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
    weekId = id;
    const savedProgress = readStorage(progressKey(), {});
    completed =
      savedProgress && typeof savedProgress === "object" ? savedProgress : {};
    rememberWeek(id);
    $("weekStatus").textContent = WORDS.length + " palabras · " + item.title;
    updateHome();
  } catch (error) {
    $("weekStatus").textContent =
      "No se pudo cargar esa semana. " + error.message;
    if (weekId) $("weekSelect").value = weekId;
  } finally {
    setWeekLoading(false);
  }
}

async function initWeeks() {
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
