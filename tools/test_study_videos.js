"use strict";

// Verify playlist isolation, navigation, playback speed, and competing audio.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const elements = new Map();
function element() {
  return {
    value: "1", disabled: false, paused: false, children: [],
    pause() { this.paused = true; }, load() {},
    play() { this.paused = false; this.plays = (this.plays ?? 0) + 1; return Promise.resolve(); },
    focus() { this.focused = true; },
    scrollIntoView(options) { this.scrolled = options; },
    setAttribute(name, value) { this[name] = value; },
    replaceChildren(...children) { this.children = children; },
  };
}
const get = (id) => {
  if (!elements.has(id)) elements.set(id, element());
  return elements.get(id);
};
let visibility;
let audioStops = 0;
const context = vm.createContext({
  $: get, WORDS: [], WORD_LABELS: {}, weekId: "", Number,
  stopAudio() { audioStops++; },
  Option: function (text, value) { this.text = text; this.value = value; },
  document: { hidden: false, createElement: element,
    addEventListener(name, handler) { if (name === "visibilitychange") visibility = handler; } },
});
vm.runInContext(fs.readFileSync(path.join(root, "js/study-videos.js"), "utf8"), context);
for (const id of ["week-01", "week-02", "week-03", "contest-2026"]) {
  const list = JSON.parse(fs.readFileSync(path.join(root, "data", id + ".json"), "utf8"));
  context.weekId = id;
  context.WORDS = list.words.map(({ word }) => ({ w: word }));
  context.WORD_LABELS = Object.fromEntries(list.words.map(({ word, display }) => [word, display ?? word]));
  vm.runInContext("openStudyVideos()", context);
  assert.equal(get("studyVideoWord").textContent, context.WORD_LABELS[list.words[0].word]);
  assert.equal(get("studyVideoPrevious").disabled, true);
  for (let index = 0; index < list.words.length; index++) {
    const { word } = list.words[index];
    assert.equal(get("studyVideo").src, `assets/videos/${id}/${word}.mp4`);
    assert.equal(get("studyVideoDownload").download, word + ".mp4");
    assert.equal(get("studyVideo").children[0].src, `assets/videos/${id}/${word}.vtt`);
    for (const extension of ["mp4", "jpg", "vtt"]) {
      assert(fs.statSync(path.join(root, "assets/videos", id, word + "." + extension)).size > 0);
    }
    get("studyVideo").onended();
    assert(get("studyVideoStatus").textContent);
    if (index < list.words.length - 1) get("studyVideoNext").onclick();
  }
  assert.equal(get("studyVideoNext").disabled, true);
  const lastSource = get("studyVideo").src;
  vm.runInContext("selectStudyVideo(-1); selectStudyVideo(999)", context);
  assert.equal(get("studyVideo").src, lastSource);
}
get("studyVideoSpeed").value = "0.72";
get("studyVideo").onplay();
assert.equal(get("studyVideo").playbackRate, 0.72);
get("studyVideoSpeed").value = "1";
get("studyVideoSpeed").onchange();
assert.equal(get("studyVideo").playbackRate, 1);
get("studyVideo").paused = false;
context.document.hidden = true;
visibility();
assert.equal(get("studyVideo").paused, true);
get("studyVideo").onerror();
assert.match(get("studyVideoStatus").textContent, /No se pudo cargar/);
assert(audioStops > 60);
const card = element();
context.originButton = { ...element(), isConnected: true, closest: () => card };
vm.runInContext("watchStudyVideo(WORDS[4].w, originButton)", context);
assert.match(get("studyVideo").src, /baby\.mp4$/);
assert.equal(get("studyVideo").paused, false);
assert.equal(get("studyVideos").scrolled.block, "start");
assert.equal(get("studyVideoTitle").focused, true);
get("studyVideo").onended();
assert.equal(context.originButton.focused, true);
assert.equal(card.scrolled.block, "center");
card.scrolled = null;
vm.runInContext("watchStudyVideo(WORDS[6].w, originButton); pauseStudyVideo()", context);
get("studyVideo").onended();
assert.equal(card.scrolled, null, "Leaving the video cancels the return destination");
vm.runInContext("watchStudyVideo(WORDS[8].w, originButton); selectStudyVideo(2)", context);
get("studyVideo").onended();
assert.equal(card.scrolled, null, "Changing videos cancels the previous return destination");
get("studyVideo").play = () => Promise.reject(new Error("Autoplay blocked"));
vm.runInContext("watchStudyVideo(WORDS[0].w, originButton)", context);
setImmediate(() => {
  assert.match(get("studyVideoStatus").textContent, /Pulsa reproducir/);
  assert(!elements.has("studyVideoSelect"), "No word selector should be needed");
  console.log("OK: 60 videos, default word, card playback, scroll and return, autoplay fallback, navigation, speed and pause.");
});
