"use strict";

// Run with node tools/test_practice.js; no installed packages required.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const json = (file) => JSON.parse(read(file));

function environment(extra = {}) {
  const elements = new Map();
  const element = () => ({
    children: [], hidden: false, checked: false, disabled: false, textContent: "",
    classList: { toggle() {} }, focus() {}, setAttribute() {}, addEventListener() {},
    append(...children) { this.children.push(...children); },
    replaceChildren(...children) { this.children = children; },
  });
  const get = (id) => {
    if (!elements.has(id)) elements.set(id, element());
    return elements.get(id);
  };
  const context = vm.createContext({
    $: get,
    document: { getElementById: get, createElement: element, addEventListener() {} },
    window: { addEventListener() {} },
    setInterval() {}, Intl, Date, ...extra,
  });
  return { elements, context };
}

async function testAlphabet() {
  let clip;
  const { context, elements } = environment({
    catalog: json("data/phonics.json"),
    shuffle: (items) => [...items].reverse(), stopAudio() {},
    playClip: async (file) => { clip = file; return true; },
    MASCOT_SUCCESS: "success.webp", MASCOT_TRY: "try.webp",
  });
  vm.runInContext(read("js/lab.js"), context);
  vm.runInContext("labCatalog = catalog; startLabQuiz();", context);
  const seen = new Set();
  for (let round = 0; round < 26; round++) {
    const id = vm.runInContext("labQuiz.round.target.id", context);
    assert(!seen.has(id));
    seen.add(id);
    const buttons = elements.get("labOptions").children;
    assert.equal(buttons.length, 5);
    assert.equal(new Set(buttons.map((button) => button.textContent)).size, 5);
    assert(buttons.every((button) => button.disabled));
    await vm.runInContext("listenLabRound()", context);
    assert.equal(clip, `assets/audio/lab/name-${id}.wav`);
    assert(buttons.every((button) => !button.disabled));
    vm.runInContext("answerLabRound(labQuiz.round.target); advanceLabQuiz();", context);
  }
  assert.equal([...seen].sort().join(""), "abcdefghijklmnopqrstuvwxyz");
  assert.match(elements.get("labFeedback").textContent, /26 de 26/);
  vm.runInContext("advanceLabQuiz()", context);
  assert.equal(vm.runInContext("labQuiz.deck.length", context), 26);
  vm.runInContext("chooseLabGroup('patterns')", context);
  assert.equal(vm.runInContext("labQuiz.deck.length", context), 10);
  await vm.runInContext("listenLabRound()", context);
  assert.match(clip, /\/sound-/);
}

function testCountdown() {
  const { context } = environment();
  context.event = json("data/contest-2026.json").event;
  vm.runInContext(read("js/contest.js"), context);
  for (const [now, expected] of [
    ["2026-11-11T12:00:00-07:00", 12],
    ["2026-11-23T06:59:59Z", 1],
    ["2026-11-23T07:00:00Z", 0],
    ["2026-11-24T07:00:00Z", -1],
  ]) {
    context.now = new Date(now);
    assert.equal(vm.runInContext("contestDaysLeft(event, now)", context), expected);
  }
}

async function testStudyLists() {
  const storage = new Map();
  const manifest = json("data/manifest.json");
  const local = { "data/manifest.json": manifest };
  for (const entry of [...manifest.weeks, manifest.contest]) local[entry.file] = json(entry.file);
  const { context, elements } = environment({
    LOCAL_CONTENT: local, location: { protocol: "file:" },
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    },
    Option: function (text, value) { this.text = text; this.value = value; },
    stopAudio() {}, updateHome() {},
  });
  vm.runInContext(read("js/core.js"), context);
  await vm.runInContext("initWeeks()", context);
  assert.equal(vm.runInContext("weekId", context), "week-03");
  assert.equal(elements.get("weekSelect").children.length, 3);
  assert(!elements.get("weekSelect").children.some((item) => item.value === "contest-2026"));
  storage.set("spelling_bee_ceb_progress_v4_week-03", JSON.stringify({ 0: { score: 9 } }));
  assert.equal(await vm.runInContext("chooseWeek('contest-2026')", context), true);
  assert.equal(elements.get("weekSelect").value, "week-03");
  assert.equal(storage.get("spelling_bee_last_selected_week_v4"), "week-03");
  assert.equal(elements.get("weeklyControls").hidden, true);
  assert.equal(elements.get("backToWeeks").hidden, false);
  assert.equal(vm.runInContext("WORDS.length", context), 30);
  assert.equal(vm.runInContext("progressKey()", context), "spelling_bee_ceb_progress_v4_contest-2026");
  context.unlockAudio = () => {};
  vm.runInContext(read("js/games.js"), context);
  vm.runInContext("setScreen = () => {}; render = () => {};", context);
  for (let mode = 0; mode < 6; mode++) {
    vm.runInContext(`start(${mode})`, context);
    assert.equal(vm.runInContext("deck.length", context), 30);
  }
  context.createWritingSurface = () => ({ stop() {}, redraw() {} });
  vm.runInContext(read("js/dictation.js"), context);
  assert.equal(vm.runInContext("newDictation().deck.length", context), 30);
  await vm.runInContext("chooseWeek('week-03')", context);
  assert.equal(vm.runInContext("WORDS.length", context), 10);
  assert.equal(vm.runInContext("completed[0].score", context), 9);
  assert.equal(elements.get("weeklyControls").hidden, false);
  context.LOCAL_CONTENT["data/contest-2026.json"] = { id: "wrong", words: [] };
  assert.equal(await vm.runInContext("chooseWeek('contest-2026')", context), false);
  assert.equal(elements.get("weekSelect").value, "week-03");
}

async function testSpellingPlayback() {
  const clips = [];
  let timeout;
  const { context } = environment({
    Audio: function (path) {
      this.path = path;
      this.play = () => Promise.resolve();
      this.pause = () => {};
      clips.push(this);
    },
    setTimeout: (callback, duration) => { timeout = duration; return 1; },
    clearTimeout() {},
  });
  vm.runInContext(read("js/audio.js"), context);
  const played = vm.runInContext("playSpelling('apple')", context);
  assert.equal(clips[0].path, "assets/audio/spelling/apple.wav");
  assert.equal(clips[0].playbackRate, 0.9);
  assert.equal(timeout, 45000);
  clips[0].onended();
  assert.equal(await played, true);
  const interrupted = vm.runInContext("playSpelling('bedroom')", context);
  vm.runInContext("stopAudio()", context);
  assert.equal(await interrupted, false);
}

(async () => {
  await testAlphabet();
  testCountdown();
  await testStudyLists();
  await testSpellingPlayback();
  console.log("OK: abecedario, fechas, selector semanal, 6 juegos y dictado de 30 palabras, deletreo.");
})().catch((error) => { console.error(error); process.exitCode = 1; });
