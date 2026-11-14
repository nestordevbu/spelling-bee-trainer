"use strict";

// Deterministic browser-event tests; no microphone, audio upload or API account.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const read = (file) => fs.readFileSync(path.join(__dirname, "..", file), "utf8");

function environment(options = {}) {
  const elements = new Map();
  const events = {};
  const timers = new Map();
  const captures = [];
  const played = [];
  let timerId = 0;
  class Recognition {
    constructor() { captures.push(this); }
    start() { this.started = true; this.onstart?.(); }
    stop() { this.stopped = true; this.onend?.(); }
    abort() { this.aborted = true; this.onend?.(); }
  }
  const get = (id) => {
    if (!elements.has(id)) elements.set(id, {
      hidden: false, disabled: false, textContent: "", attributes: {},
      classList: { toggle() {} },
      setAttribute(name, value) { this.attributes[name] = value; }, focus() {},
    });
    return elements.get(id);
  };
  const context = vm.createContext({
    $: get, window: { isSecureContext: true, SpeechRecognition: Recognition, scrollTo() {},
      addEventListener: (type, callback) => { events[type] = callback; } },
    document: { hidden: false, getElementById: get, body: {classList: {toggle() {}}},
      addEventListener: (type, callback) => { events[type] = callback; } },
    weekId: "contest-2026", weekLoading: false,
    practiceId: () => "contest-2026-module-2",
    practiceWords: () => [{w: "apple"}, {w: "book"}], shuffle: (items) => [...items],
    setScreen: (screen) => { if (screen !== "voicePractice") vm.runInContext("stopVoicePractice()", context); },
    stopAudio() {}, unlockAudio() {},
    playWord: async (word, rate) => { played.push([word, rate]); return true; },
    setTimeout: (callback) => { timers.set(++timerId, callback); return timerId; },
    clearTimeout: (id) => timers.delete(id),
  });
  if (options.unsupported) delete context.window.SpeechRecognition;
  if (options.prefixed) {
    context.window.webkitSpeechRecognition = context.window.SpeechRecognition;
    delete context.window.SpeechRecognition;
  }
  vm.runInContext(read("js/voice.js"), context);
  const run = (source) => vm.runInContext(source, context);
  return { context, run, get, captures, timers, events, played };
}

function result(...alternatives) {
  const packet = alternatives.map((item) => typeof item === "string"
    ? { transcript: item, confidence: 0.9 } : item);
  packet.isFinal = true;
  return packet;
}

function deliver(capture, ...alternatives) {
  capture.onresult({ results: [result(...alternatives)] });
  capture.onend();
}

async function testLettersAndGrading() {
  const {run, context, get, captures, played} = environment();
  for (const [name, letter] of [
    ["A.", "A"], ["bee", "B"], ["sea", "C"], ["eye", "I"],
    ["queue", "Q"], ["double you", "W"], ["zed", "Z"],
    ["apple", null], ["P P", null], ["B or D", null], ["", null],
  ]) {
    context.text = name;
    assert.equal(run("spokenLetter(text)"), letter);
  }
  run("openVoicePractice(); recordVoiceLetter()");
  assert.equal(captures.length, 0, "Must hear the word before recording");
  await run("playVoiceWord(0.72)");
  assert.deepEqual(played[0], ["apple", 0.72]);
  for (const [index, letter] of ["A", "P", "P", "L", "E"].entries()) {
    run("recordVoiceLetter()");
    const capture = captures.at(-1);
    assert.equal(capture.lang, "en-US");
    assert.equal(capture.continuous, false);
    assert.equal(capture.interimResults, false);
    assert.equal(capture.phrases, undefined, "No answer hint is supplied");
    assert.equal(capture.grammars, undefined);
    assert.equal(get("voicePlay").disabled, true);
    deliver(capture, letter);
    assert.equal(run("voiceSession.letters.length"), index, "Recognition alone must not append letters");
    assert.equal(get("voiceCheck").disabled, true);
    run("acceptVoiceLetter()");
    assert.equal(run("voiceSession.letters.length"), index + 1);
    run("acceptVoiceLetter()");
    assert.equal(run("voiceSession.letters.length"), index + 1, "Double clicks must not duplicate letters");
  }
  run("checkVoiceWord(); checkVoiceWord()");
  assert.equal(run("voiceSession.results.length"), 1);
  assert.equal(run("voiceSession.results[0].correct"), true);
  assert.equal(run("voiceSession.results[0].response"), "APPLE");
  run("nextVoiceWord()");
  await run("playVoiceWord()");
  // A real substitution must survive recognition and be graded as a difference.
  for (const letter of ["B", "O", "X"]) {
    run("recordVoiceLetter()");
    deliver(captures.at(-1), letter);
    run("acceptVoiceLetter()");
  }
  run("checkVoiceWord(); nextVoiceWord()");
  assert.equal(run("voiceSession.results[1].correct"), false);
  assert.match(get("voiceScore").textContent, /1 de 2/);
  assert.equal(get("voiceSummary").hidden, false);
}

async function testUncertainAndErrors() {
  const {run, captures, get, timers, context} = environment({prefixed: true});
  run("openVoicePractice()");
  await run("playVoiceWord()");
  for (const alternatives of [
    ["apple"], ["P P"], ["B", "D"], [{transcript: "A", confidence: 0.4}],
  ]) {
    run("recordVoiceLetter()");
    deliver(captures.at(-1), ...alternatives);
    assert.equal(run("voicePending"), null);
    assert.equal(run("voiceSession.letters.length"), 0);
    assert.equal(run("voiceSession.results.length"), 0);
    assert.equal(get("voiceRecord").disabled, false);
  }
  run("recordVoiceLetter()");
  deliver(captures.at(-1), {transcript: "A", confidence: 0});
  assert.equal(run("voicePending"), "A", "Missing confidence still requires explicit confirmation");
  get("voiceRetry").onclick();
  assert.equal(run("voicePending"), null);
  deliver(captures.at(-1), "E");
  run("acceptVoiceLetter()");
  assert.equal(run("voiceSession.letters.join('')"), "E");
  get("voiceUndo").onclick();
  assert.equal(run("voiceSession.letters.length"), 0);
  for (const error of ["not-allowed", "network", "no-speech", "audio-capture", "service-not-allowed"]) {
    run("recordVoiceLetter()");
    const capture = captures.at(-1);
    const lateEnd = capture.onend;
    capture.onerror({error});
    lateEnd();
    assert.equal(run("voiceCapture"), null);
    assert.equal(run("voicePending"), null);
    assert.equal(run("voiceSession.results.length"), 0);
    assert.equal(get("voiceRecord").disabled, false);
  }
  run("recordVoiceLetter()");
  for (const callback of [...timers.values()]) callback();
  assert.equal(run("voiceCapture"), null);
  assert.equal(timers.size, 0);
  run("recordVoiceLetter()");
  get("voiceStop").onclick();
  assert.equal(run("voiceCapture"), null);
  // Only final results count.
  run("recordVoiceLetter()");
  const interim = result("A");
  interim.isFinal = false;
  captures.at(-1).onresult({results: [interim]});
  captures.at(-1).onend();
  assert.equal(run("voicePending"), null);
  // Multiple final segments cannot be treated as a single letter.
  context.packets = [result("A"), result("P")];
  assert.equal(run("recognizedLetter(packets)"), null);
}

async function testLifecycleAndSupport() {
  for (const options of [{unsupported: true}, {}]) {
    const env = environment(options);
    if (!options.unsupported) env.context.window.isSecureContext = false;
    env.run("openVoicePractice()");
    await env.run("playVoiceWord()");
    env.run("recordVoiceLetter()");
    assert(env.get("voiceSupport").textContent);
    assert.equal(env.captures.length, 0);
    assert.equal(env.get("voiceRecord").disabled, true);
  }
  const {run, context, captures, events, get} = environment();
  run("openVoicePractice()");
  await run("playVoiceWord()");
  run("recordVoiceLetter()");
  const capture = captures.at(-1);
  const lateResult = capture.onresult;
  const lateEnd = capture.onend;
  get("voiceBack").onclick();
  assert.equal(capture.aborted, true);
  lateResult({results: [result("A")]});
  lateEnd();
  assert.equal(run("voicePending"), null);
  assert.equal(run("voiceSession.letters.length"), 0);
  run("recordVoiceLetter()");
  context.document.hidden = true;
  events.visibilitychange();
  assert.equal(captures.at(-1).aborted, true);
  assert.equal(run("voiceCapture"), null);
  context.document.hidden = false;
  // Playback and microphone must never overlap, including interrupted playback.
  let endPlayback;
  context.playWord = () => new Promise((resolve) => { endPlayback = resolve; });
  const playback = run("playVoiceWord()");
  const count = captures.length;
  run("recordVoiceLetter()");
  assert.equal(captures.length, count);
  run("stopVoicePractice(); openVoicePractice()");
  endPlayback(true);
  await playback;
  assert.equal(run("voiceSession.heard"), false, "Old audio cannot unlock a new session");
}

function testRealModules() {
  const {context, run, captures, get} = environment();
  context.contest = JSON.parse(read("data/contest-2026.json"));
  vm.runInContext(read("js/core.js"), context);
  run("weekId = 'contest-2026'; weekLoading = false; WORDS = contest.words.map(({word}) => ({w: word}));");
  for (let module = 0; module < 3; module++) {
    run(`contestModule = ${module}; openVoicePractice()`);
    const words = Array.from(run("voiceSession.deck")).sort();
    const expected = context.contest.words.slice(module * 10, module * 10 + 10)
      .map(({word}) => word).sort();
    assert.deepEqual(words, expected);
    assert.equal(run("voiceSession.context"), `contest-2026-module-${module + 1}`);
  }
  run("voiceSession.heard = true; recordVoiceLetter()");
  get("voiceBack").onclick();
  assert.equal(captures.at(-1).aborted, true, "Real screen navigation must stop capture");
}

(async () => {
  await testLettersAndGrading();
  await testUncertainAndErrors();
  await testLifecycleAndSupport();
  testRealModules();
  console.log("OK: voz guiada, letras repetidas, confirmación, ambigüedad, errores, cancelación y compatibilidad.");
})().catch((error) => { console.error(error); process.exitCode = 1; });
