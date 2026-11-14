"use strict";

let audioUnlocked = false;
let audioContext;
let activeClip;
let chimeNodes = [];

function unlockAudio() {
  audioUnlocked = true;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  try {
    audioContext ??= new AudioContextClass();
    if (audioContext.state === "suspended")
      audioContext.resume().catch(() => {});
  } catch {
    // The voice clips use a separate HTML audio element.
  }
}

function stopAudio() {
  activeClip?.finish(false);
  for (const oscillator of chimeNodes) {
    oscillator.stop();
  }
  chimeNodes = [];
}

// Resolve after playback so dictation can start timing when the word ends.
function playClip(path, rate = 1, timeoutMs = 12000) {
  if (typeof pauseStudyVideo === "function") pauseStudyVideo();
  stopAudio();
  const audio = new Audio(path);
  audio.playbackRate = rate;
  audio.defaultPlaybackRate = rate;
  audio.preservesPitch = true;
  return new Promise((resolve) => {
    function finish(played) {
      clearTimeout(watchdog);
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      if (activeClip?.finish === finish) activeClip = null;
      resolve(played);
    }
    const watchdog = setTimeout(() => finish(false), timeoutMs);
    activeClip = { finish };
    audio.onended = () => finish(true);
    audio.onerror = () => finish(false);
    audio.play().catch(() => finish(false));
  });
}

function playWord(word, rate = 1) {
  return playClip("assets/audio/words/" + word + ".wav", rate);
}

function playSpelling(word, rate = 1) {
  return playClip("assets/audio/spelling/" + word + ".wav", rate, 45000 / rate);
}

function chime(ok, win = false) {
  if (audioContext?.state !== "running") return;
  const notes = win ? [523, 659, 784, 1046] : ok ? [523, 659, 784] : [330, 260];
  for (const [index, hz] of notes.entries()) {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const start = audioContext.currentTime + index * 0.12;
    oscillator.type = ok ? "sine" : "triangle";
    oscillator.frequency.value = hz;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.12, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.23);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.24);
    chimeNodes.push(oscillator);
    oscillator.onended = () => {
      chimeNodes = chimeNodes.filter((node) => node !== oscillator);
    };
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopAudio();
});
