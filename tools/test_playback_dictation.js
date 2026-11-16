"use strict";

// Exercise real audio/dictation code with controlled playback and dialog events.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const read = (file) => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
const AUDIO_IDS = [
  "labListen", "dictationListen", "dictationRepeat", "voicePlay", "voicePlaySlow",
  "wordButton", "spellingButton", "sentenceButton", "gameButton", "labButton",
];

function environment() {
  const elements = new Map();
  const clips = [];
  const timeouts = new Map();
  const intervals = new Map();
  const storage = new Map();
  let id = 0;
  let clickCapture;
  let surfaceStops = 0;

  function element() {
    return {
      disabled: false, hidden: false, open: false, value: "1", textContent: "",
      children: [], classList: { toggle() {}, contains: () => false },
      append(...children) { this.children.push(...children); },
      replaceChildren(...children) { this.children = children; },
      setAttribute() {}, focus() {},
      showModal() { this.open = true; this.opens = (this.opens || 0) + 1; },
      close() { this.open = false; },
    };
  }

  function get(name) {
    if (!elements.has(name)) elements.set(name, element());
    return elements.get(name);
  }

  const context = vm.createContext({
    $: get,
    window: { addEventListener() {} },
    document: {
      hidden: false,
      querySelectorAll: () => AUDIO_IDS.map(get),
      createElement: element,
      addEventListener(type, callback, capture) {
        if (type === "click" && capture) clickCapture = callback;
      },
    },
    Audio: function (file) {
      this.file = file;
      this.pauses = 0;
      this.play = () => Promise.resolve();
      this.pause = () => { this.pauses++; };
      clips.push(this);
    },
    setTimeout(callback, duration) { timeouts.set(++id, { callback, duration }); return id; },
    clearTimeout(timer) { timeouts.delete(timer); },
    setInterval(callback) { intervals.set(++id, callback); return id; },
    clearInterval(timer) { intervals.delete(timer); },
    practiceId: () => "contest-2026-module-2",
    practiceWords: () => [{ w: "book" }, { w: "box" }],
    shuffle: (items) => [...items].reverse(),
    weekId: "contest-2026", weekLoading: false, WORD_LABELS: {},
    readStorage: (key, fallback) => JSON.parse(storage.get(key) || "null") ?? fallback,
    writeStorage: (key, value) => { storage.set(key, JSON.stringify(value)); return true; },
    setScreen() {}, paintHandwriting() {},
    createWritingSurface: () => ({ redraw() {}, stop() { surfaceStops++; } }),
    Option: function (text, value) { this.text = text; this.value = value; },
  });

  vm.runInContext(read("js/audio.js"), context);
  vm.runInContext(read("js/dictation.js"), context);

  return {
    context, get, clips, timeouts, intervals, storage,
    run: (source) => vm.runInContext(source, context),
    surfaceStops: () => surfaceStops,
    captureClick: (event) => clickCapture(event),
  };
}

async function testPlaybackLock() {
  const env = environment();
  const { run, get, clips, timeouts } = env;
  get("labListen").disabled = true;

  const slow = run("playSpelling('book', 0.72)");
  assert.equal(clips.length, 1);
  assert.equal(clips[0].playbackRate, 0.72);
  assert(AUDIO_IDS.every((name) => get(name).disabled));

  for (let count = 0; count < 10; count++) {
    assert.equal(await run("playWord('box')"), false);
  }
  assert.equal(clips.length, 1, "Repeated requests must not restart or queue audio");
  assert.equal(clips[0].pauses, 0, "Current playback must remain uninterrupted");

  const click = {
    target: { closest: () => ({ disabled: false }) },
    preventDefault() { this.prevented = true; },
    stopImmediatePropagation() { this.stopped = true; },
  };
  env.captureClick(click);
  assert(click.prevented && click.stopped, "Newly rendered playback controls must also be guarded");

  const lateEnd = clips[0].onended;
  clips[0].onended();
  assert.equal(await slow, true);
  assert.equal(get("labListen").disabled, true, "Existing disabled states must be preserved");
  assert.equal(get("wordButton").disabled, false);
  assert.equal(timeouts.size, 0);

  const next = run("playWord('box')");
  lateEnd();
  assert.equal(get("wordButton").disabled, true, "Old completion cannot unlock a newer clip");
  clips[1].onerror();
  assert.equal(await next, false);
  assert.equal(get("wordButton").disabled, false);

  const cancelled = run("playWord('book')");
  run("stopAudio()");
  assert.equal(await cancelled, false);
  assert.equal(get("wordButton").disabled, false);

  const timedOut = run("playWord('book')");
  [...timeouts.values()][0].callback();
  assert.equal(await timedOut, false);
  assert.equal(get("wordButton").disabled, false);
}

async function testPlaybackFailureRecovery() {
  for (const failure of ["reject", "throw"]) {
    const { run, context, get } = environment();
    context.Audio = function () {
      this.pause = () => {};
      this.play = () => {
        if (failure === "throw") throw new Error("Playback unavailable");
        return Promise.reject(new Error("Playback blocked"));
      };
    };
    assert.equal(await run("playWord('book')"), false);
    assert.equal(run("activeClip"), null);
    assert.equal(get("wordButton").disabled, false);
  }
}

function openRestart(env) {
  env.get("dictationRestart").onclick();
  assert.equal(env.get("dictationRestartDialog").open, true);
}

function testRestartInEveryPhase() {
  const env = environment();
  const { run, get, context, storage } = env;
  const otherModuleKey = "spelling_bee_dictation_v45_contest-2026-module-1";
  storage.set(otherModuleKey, JSON.stringify({ kept: true }));

  for (const [phase, grades] of [
    ["listen", []], ["writing", []], ["saved", [null]],
    ["review", [null, null]], ["review", ["correct", null]],
    ["review", ["correct", "incorrect"]],
  ]) {
    context.phase = phase;
    context.grades = grades;
    run(`
      dictation = newDictation();
      dictation.phase = phase;
      dictation.strokes = [[[0.1, 0.2]]];
      dictation.repeats = 2;
      dictation.deadline = Date.now() + 30000;
      dictation.responses = grades.map((grade) => ({
        word: 'book', strokes: [], repeats: 1, timedOut: false, grade,
      }));
      saveDictation();
      renderDictation();
    `);

    const before = run("JSON.stringify(dictation)");
    openRestart(env);
    const opens = get("dictationRestartDialog").opens;
    get("dictationRestart").onclick();
    assert.equal(get("dictationRestartDialog").opens, opens);
    get("dictationRestartCancel").onclick();
    assert.equal(run("JSON.stringify(dictation)"), before, "Cancelling must preserve the attempt");

    openRestart(env);
    get("dictationRestartConfirm").onclick();
    assert.equal(run("dictation.phase"), "listen");
    assert.equal(run("dictation.responses.length"), 0);
    assert.equal(run("dictation.strokes.length"), 0);
    assert.equal(run("dictation.repeats"), 0);
    assert.equal(run("dictation.deadline"), 0);
    assert.equal(run("dictationPlaying"), false);
    assert.equal(get("dictationClock").textContent, "00:30");
    assert.equal(get("dictationListen").disabled, false);
    assert.equal(get("dictationRestartDialog").open, false);
    assert.equal(env.intervals.size, 0);
    assert.equal(storage.get(otherModuleKey), '{"kept":true}');
  }

  assert(env.surfaceStops() >= 6);
  const html = read("index.html");
  assert(html.indexOf('id="dictationRestart"') < html.indexOf('id="dictationPractice"'),
    "Restart must be outside both the practice and review containers");
}

async function testRestartDuringPlayback() {
  for (const repeat of [false, true]) {
    const env = environment();
    const { run, get, clips } = env;
    run("showDictation()");
    if (repeat) {
      run("dictation.phase = 'writing'; dictation.deadline = Date.now() + 30000; renderDictation();");
    }

    const oldPlayback = run(`playDictationWord(${repeat})`);
    for (let click = 0; click < 5; click++) {
      await run(`playDictationWord(${repeat})`);
    }
    assert.equal(clips.length, 1);
    assert.equal(run("dictation.repeats"), repeat ? 1 : 0);
    assert.equal(get("dictationRestart").disabled, false);
    openRestart(env);
    get("dictationRestartConfirm").onclick();
    await oldPlayback;

    assert.equal(clips[0].pauses, 1);
    assert.equal(run("dictation.phase"), "listen");
    assert.equal(run("dictation.deadline"), 0);
    assert.equal(run("dictation.repeats"), 0);
    assert.equal(run("dictationPlaying"), false);

    const newPlayback = run("playDictationWord(false)");
    assert.equal(clips.length, 2, "New dictation must be able to play immediately");
    clips[1].onended();
    await newPlayback;
    assert.equal(run("dictation.phase"), "writing");
    assert(run("dictation.deadline > Date.now()"));
  }
}

async function testCancelRestartDuringPlayback() {
  const env = environment();
  const { run, get, clips } = env;
  run("showDictation()");
  const playback = run("playDictationWord(false)");

  openRestart(env);
  get("dictationRestartCancel").onclick();
  assert.equal(clips[0].pauses, 0);
  assert.equal(run("dictationPlaying"), true);

  clips[0].onended();
  await playback;
  assert.equal(run("dictation.phase"), "writing");
  assert(run("dictation.deadline > Date.now()"));
}

(async () => {
  await testPlaybackLock();
  await testPlaybackFailureRecovery();
  testRestartInEveryPhase();
  await testRestartDuringPlayback();
  await testCancelRestartDuringPlayback();
  console.log("OK: audio sin interrupciones por clics repetidos y reinicio confirmado en todas las fases del dictado.");
})().catch((error) => { console.error(error); process.exitCode = 1; });
