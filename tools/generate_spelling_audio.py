"""Build offline word-letter-letter-word clips from the existing English audio."""

import argparse
import json
from pathlib import Path
import wave

ROOT = Path(__file__).resolve().parents[1]
FORMAT = (1, 2, 22050)


def read_clip(path):
    with wave.open(str(path), "rb") as clip:
        actual = (clip.getnchannels(), clip.getsampwidth(), clip.getframerate())
        if actual != FORMAT:
            raise ValueError(f"Unexpected audio format: {path}: {actual}")
        return clip.readframes(clip.getnframes())


def spelling_frames(word):
    spoken_word = read_clip(ROOT / f"assets/audio/words/{word}.wav")
    letter_gap = bytes(round(FORMAT[2] * 0.12) * FORMAT[1])
    word_gap = bytes(round(FORMAT[2] * 0.35) * FORMAT[1])
    letters = [read_clip(ROOT / f"assets/audio/lab/name-{letter}.wav") for letter in word]
    return spoken_word + word_gap + letter_gap.join(letters) + word_gap + spoken_word


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Verify clips without rewriting")
    args = parser.parse_args()
    manifest = json.loads((ROOT / "data/manifest.json").read_text(encoding="utf-8"))
    words = set()
    for entry in manifest["weeks"] + [manifest["contest"]]:
        content = json.loads((ROOT / entry["file"]).read_text(encoding="utf-8"))
        words.update(item["word"] for item in content["words"])
    target = ROOT / "assets/audio/spelling"
    if not args.check:
        target.mkdir(parents=True, exist_ok=True)
    for word in sorted(words):
        frames = spelling_frames(word)
        path = target / (word + ".wav")
        if args.check:
            if read_clip(path) != frames:
                raise ValueError(f"Spelling sequence differs: {word}")
        else:
            with wave.open(str(path), "wb") as clip:
                clip.setnchannels(FORMAT[0])
                clip.setsampwidth(FORMAT[1])
                clip.setframerate(FORMAT[2])
                clip.writeframes(frames)
        seconds = len(frames) / FORMAT[1] / FORMAT[2] / 0.9
        if seconds >= 45:
            raise ValueError(f"Spelling exceeds playback time limit: {word}")
    print(f"OK: {len(words)} spelling clips, word + English letter names + word.")


if __name__ == "__main__":
    main()
