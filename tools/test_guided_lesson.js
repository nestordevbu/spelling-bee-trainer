"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const lesson = JSON.parse(fs.readFileSync(path.join(root, "data/guided-lesson.json"), "utf8"));
const contest = JSON.parse(fs.readFileSync(path.join(root, "data/contest-2026.json"), "utf8"));
assert.equal(lesson.locale, "en-US");
assert.deepEqual(lesson.chapters.filter((c) => c.section === "alphabet").map((c) => c.key), [..."abcdefghijklmnopqrstuvwxyz"]);
assert.deepEqual(lesson.chapters.filter((c) => c.section === "words").map((c) => c.key), contest.words.map((w) => w.word));
assert.equal(lesson.format, "contest-compilation");
assert.equal(lesson.wordCount, 30);
assert.deepEqual(lesson.sources, contest.words.map(({word}) => `assets/videos/contest-2026/${word}.mp4`));
assert.equal(lesson.chapters.length, 57);
assert(lesson.introDuration >= 8 && lesson.introDuration < 8.2);
assert(lesson.alphabetDuration > 20 && lesson.alphabetDuration < 40);
assert(lesson.duration > 280 && lesson.duration < 360);
for (let i = 1; i < lesson.chapters.length; i++) assert(lesson.chapters[i].start > lesson.chapters[i - 1].start);
assert(lesson.chapters.at(-1).start < lesson.duration);
assert.equal(fs.readFileSync(path.join(root, lesson.video)).subarray(4, 8).toString(), "ftyp");
const elements = new Map();
function element() {
  return {currentTime: 0, paused: true, disabled: true, textContent: "", children: [],
    pause() { this.paused = true; }, load() {}, scrollIntoView() {},
    replaceChildren(...children) { this.children = children; }};
}
const get = (id) => { if (!elements.has(id)) elements.set(id, element()); return elements.get(id); };
let hiddenHandler;
const context = vm.createContext({
  $: get, readContent: async () => lesson, stopAudio() {}, setScreen() {},
  document: {hidden: false, createElement: element, addEventListener(name, handler) { hiddenHandler = handler; }},
});
vm.runInContext(fs.readFileSync(path.join(root, "js/guided-lesson.js"), "utf8"), context);
(async () => {
  await vm.runInContext("openGuidedLesson()", context);
  assert.equal(get("guidedLetterChapters").children.length, 26);
  assert.equal(get("guidedWordChapters").children.length, 30);
  const firstWord = lesson.chapters.findIndex((c) => c.section === "words");
  vm.runInContext(`seekGuidedChapter(${firstWord})`, context);
  assert.equal(get("guidedLessonChapter").textContent, "apple");
  const player = get("guidedLessonVideo");
  player.currentTime += 1.2;
  get("guidedLessonRepeat").onclick();
  assert.equal(player.currentTime, lesson.chapters[firstWord].start);
  player.paused = false;
  get("guidedLessonNext").onclick();
  assert.equal(get("guidedLessonChapter").textContent, "April");
  assert.equal(player.paused, false);
  const before = player.currentTime;
  vm.runInContext("seekGuidedChapter(-1); seekGuidedChapter(999)", context);
  assert.equal(player.currentTime, before);
  context.document.hidden = true;
  hiddenHandler();
  assert.equal(player.paused, true);
  player.onended();
  assert.match(get("guidedLessonStatus").textContent, /You can do it Matteo/);
  console.log("OK: Matteo intro, A-Z board, 30 existing clips in official order, chapter timing, replay and pause.");
})().catch((error) => { console.error(error); process.exitCode = 1; });
