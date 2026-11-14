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
  for (const [text, expected] of [
    ["A P P L E", "APPLE"], ["a pee pee el ee", "APPLE"],
    ["B.O.O.K.", "BOOK"], ["double you eye en gee", "WING"],
    ["P P", "PP"], ["apple", null], ["B unknown K", null], ["", null],
  ]) {
    context.text = text;
    assert.equal(run("spokenLetters(text)"), expected);
  }
  run("openVoicePractice(); recordVoiceSpelling()");
  assert.equal(captures.length, 0);
  await run("playVoiceWord(0.72)");
  assert.deepEqual(played[0], ["apple", 0.72]);
  run("recordVoiceSpelling()");
  const capture = captures.at(-1);
  assert.equal(capture.lang, "en-US");
  assert.equal(capture.continuous, true);
  assert.equal(capture.interimResults, true);
  assert.equal(capture.phrases, undefined);
  assert.equal(capture.grammars, undefined);
  assert.equal(get("voicePlay").disabled, true);
  const partial = result("A P");
  partial.isFinal = false;
  capture.onresult({results: [partial]});
  assert.match(get("voiceStatus").textContent, /A P/);
  assert.equal(run("voicePending"), null);
  capture.onresult({results: [result("A P")]});
  capture.onresult({results: [result("A P"), result("P L E")]});
  // Repeated cumulative packets must not duplicate the first A and P.
  capture.onresult({results: [result("A P"), result("P L E")]});
  get("voiceStop").onclick();
  assert.equal(run("voicePending"), "APPLE");
  assert.equal(run("voiceSession.results.length"), 0);
  assert.equal(get("voiceCheck").disabled, false);
  run("checkVoiceWord(); checkVoiceWord()");
  assert.equal(run("voiceSession.results.length"), 1);
  assert.equal(run("voiceSession.results[0].correct"), true);
  assert.equal(run("voiceSession.results[0].response"), "APPLE");
  run("nextVoiceWord()");
  await run("playVoiceWord()");
  run("recordVoiceSpelling()");
  deliver(captures.at(-1), "B O K");
  run("checkVoiceWord(); nextVoiceWord()");
  assert.equal(run("voiceSession.results[1].correct"), false);
  assert.equal(run("voiceSession.results[1].response"), "BOK");
  assert.match(get("voiceScore").textContent, /1 de 2/);
  assert.equal(get("voiceSummary").hidden, false);
}

async function testUncertainAndErrors() {
  const {run, captures, get, timers, context} = environment({prefixed: true});
  run("openVoicePractice()");
  await run("playVoiceWord()");
  for (const alternatives of [
    ["B 123"], ["123"],
  ]) {
    run("recordVoiceSpelling()");
    deliver(captures.at(-1), ...alternatives);
    assert.equal(run("voicePending"), null);
    assert.equal(run("voiceSession.letters.length"), 0);
    assert.equal(run("voiceSession.results.length"), 0);
    assert.equal(get("voiceRecord").disabled, false);
  }
  for (const alternatives of [["B", "D"], [{transcript: "A", confidence: 0.4}]]) {
    run("recordVoiceSpelling()");
    deliver(captures.at(-1), ...alternatives);
    assert.notEqual(run("voicePending"), null);
    assert.match(get("voiceStatus").textContent, /dudosa/);
    assert.equal(run("voiceSession.results.length"), 0);
    get("voiceClear").onclick();
  }
  run("recordVoiceSpelling()");
  deliver(captures.at(-1), {transcript: "A", confidence: 0});
  assert.equal(run("voicePending"), "A", "Missing confidence still requires explicit confirmation");
  get("voiceRetry").onclick();
  assert.equal(run("voicePending"), null);
  deliver(captures.at(-1), "E");
  assert.equal(run("voicePending"), "E");
  get("voiceUndo").onclick();
  assert.equal(run("voicePending"), null);
  for (const error of ["not-allowed", "network", "no-speech", "audio-capture", "service-not-allowed"]) {
    run("recordVoiceSpelling()");
    const capture = captures.at(-1);
    const lateEnd = capture.onend;
    capture.onerror({error});
    lateEnd();
    if (error === "network") {
      assert.match(get("voiceStatus").textContent, /aunque tengas Internet/);
      assert.match(get("voiceStatus").textContent, /Google Chrome, fuera de la aplicación/);
    }
    assert.equal(run("voiceCapture"), null);
    assert.equal(run("voicePending"), null);
    assert.equal(run("voiceSession.results.length"), 0);
    assert.equal(get("voiceRecord").disabled, false);
  }
  run("recordVoiceSpelling()");
  for (const callback of [...timers.values()]) callback();
  assert.equal(run("voiceCapture"), null);
  assert.equal(timers.size, 0);
  run("recordVoiceSpelling()");
  get("voiceStop").onclick();
  assert.equal(run("voiceCapture"), null);
  // An interim-only reading is retained for explicit review when capture ends.
  run("recordVoiceSpelling()");
  const interim = result("A");
  interim.isFinal = false;
  captures.at(-1).onresult({results: [interim]});
  captures.at(-1).onend();
  assert.equal(run("voicePending"), "A");
  assert.match(get("voiceStatus").textContent, /provisional/);
  get("voiceClear").onclick();
  // Multiple final segments form one complete spelling.
  context.packets = [result("A"), result("P")];
  assert.equal(run("recognizedLetters(packets)"), "AP");
  const unfinished = result("P L E");
  unfinished.isFinal = false;
  context.packets = [result("A P"), unfinished];
  assert.equal(run("recognizedLetters(packets)"), null, "An unfinished tail must not be silently dropped");
  // stop() is asynchronous in real browsers: the final packet can arrive later.
  run("recordVoiceSpelling()");
  const draining = captures.at(-1);
  draining.stop = () => {};
  get("voiceStop").onclick();
  assert.notEqual(run("voiceCapture"), null);
  deliver(draining, "A P P L E");
  assert.equal(run("voicePending"), "APPLE");
  assert.equal(timers.size, 0);
}

async function testJoinedSpelling() {
  const {run, captures, get, context} = environment();
  run("openVoicePractice()");
  await run("playVoiceWord()");
  for (const [transcript, expected] of [["CHAT.", "CHAT"], ["chat", "CHAT"], ["APLE", "APLE"], ["APPLE", "APPLE"]]) {
    run("recordVoiceSpelling()");
    deliver(captures.at(-1), {transcript, confidence: 0.4});
    assert.equal(run("voicePending"), expected);
    assert.match(get("voiceStatus").textContent, /agrupó/);
    assert.equal(get("voiceCheck").disabled, false);
    assert.equal(run("voiceSession.results.length"), 0);
    get("voiceClear").onclick();
  }
  // CHAT must not become the target APPLE, and APLE must not regain a missing P.
  run("recordVoiceSpelling()");
  deliver(captures.at(-1), "APLE");
  run("checkVoiceWord()");
  assert.equal(run("voiceSession.results[0].response"), "APLE");
  assert.equal(run("voiceSession.results[0].correct"), false);
  context.packets = [result("CHAT")];
  assert.equal(run("recognizedLetters(packets)"), "CHAT");
}

async function testProvisionalEndings() {
  const {run, captures, get, timers} = environment();
  run("openVoicePractice()");
  await run("playVoiceWord()");
  const partial = (text) => {
    const packet = result(text);
    packet.isFinal = false;
    return packet;
  };
  for (const ending of ["normal", "empty", "network", "timeout"]) {
    run("recordVoiceSpelling()");
    const capture = captures.at(-1);
    capture.stop = () => {};
    capture.onresult({results: [partial("CHAT.")]});
    assert.match(get("voiceStatus").textContent, /CHAT/);
    get("voiceStop").onclick();
    if (ending === "empty") capture.onresult({results: []});
    if (ending === "network") capture.onerror({error: "network"});
    else if (ending === "timeout") {
      for (const callback of [...timers.values()]) callback();
    } else capture.onend();
    assert.equal(run("voicePending"), "CHAT", ending);
    assert.match(get("voiceTranscript").textContent, /CHAT/);
    assert.match(get("voiceStatus").textContent, /provisional/);
    assert.equal(get("voiceCheck").disabled, false);
    assert.equal(run("voiceSession.results.length"), 0);
    assert.equal(timers.size, 0);
    get("voiceClear").onclick();
  }
  // Do not lose the provisional tail if the engine drops it at shutdown.
  run("recordVoiceSpelling()");
  let capture = captures.at(-1);
  capture.onresult({results: [result("A P"), partial("P L E")]});
  capture.onresult({results: [result("A P")]});
  capture.onend();
  assert.equal(run("voicePending"), "APPLE");
  assert.match(get("voiceStatus").textContent, /provisional/);
  get("voiceClear").onclick();
  // A genuine final correction supersedes a provisional word.
  run("recordVoiceSpelling()");
  capture = captures.at(-1);
  capture.onresult({results: [partial("CHAT")]});
  capture.onresult({results: [result("CHET")]});
  capture.onend();
  assert.equal(run("voicePending"), "CHET");
  assert.doesNotMatch(get("voiceStatus").textContent, /provisional/);
  get("voiceClear").onclick();
  // Mixed joined and separated chunks are parsed without using the answer.
  run("recordVoiceSpelling()");
  deliver(captures.at(-1), "C H AT");
  assert.equal(run("voicePending"), "CHAT");
  get("voiceClear").onclick();
  // Even unconvertible input remains visible for diagnosis instead of vanishing.
  run("recordVoiceSpelling()");
  deliver(captures.at(-1), "C 123 T");
  assert.equal(run("voicePending"), null);
  assert.match(get("voiceTranscript").textContent, /C 123 T/);
}

async function testLifecycleAndSupport() {
  for (const options of [{unsupported: true}, {}]) {
    const env = environment(options);
    if (!options.unsupported) env.context.window.isSecureContext = false;
    env.run("openVoicePractice()");
    await env.run("playVoiceWord()");
    env.run("recordVoiceSpelling()");
    assert(env.get("voiceSupport").textContent);
    assert.equal(env.captures.length, 0);
    assert.equal(env.get("voiceRecord").disabled, true);
  }
  const {run, context, captures, events, get} = environment();
  run("openVoicePractice()");
  await run("playVoiceWord()");
  run("recordVoiceSpelling()");
  const capture = captures.at(-1);
  const lateResult = capture.onresult;
  const lateEnd = capture.onend;
  get("voiceBack").onclick();
  assert.equal(capture.aborted, true);
  lateResult({results: [result("A")]});
  lateEnd();
  assert.equal(run("voicePending"), null);
  assert.equal(run("voiceSession.letters.length"), 0);
  run("recordVoiceSpelling()");
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
  run("recordVoiceSpelling()");
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
  run("voiceSession.heard = true; recordVoiceSpelling()");
  get("voiceBack").onclick();
  assert.equal(captures.at(-1).aborted, true, "Real screen navigation must stop capture");
}

(async () => {
  await testLettersAndGrading();
  await testUncertainAndErrors();
  await testLifecycleAndSupport();
  await testJoinedSpelling();
  await testProvisionalEndings();
  testRealModules();
  console.log("OK: deletreo continuo, recuperación provisional al terminar, resultados acumulativos, letras repetidas, ambigüedad, errores, cancelación y compatibilidad.");
})().catch((error) => { console.error(error); process.exitCode = 1; });
