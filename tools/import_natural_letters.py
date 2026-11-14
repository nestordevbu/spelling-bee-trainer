"""Split recorded alphabets into the trainer's offline letter names.

Build dependency: python -m pip install numpy soundfile
Run this script, then tools/generate_spelling_audio.py. No packages or network
are required by the trainer itself. See credits-audio.html for attribution.
"""

from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/audio/sources/english-alphabet-acclivity.mp3"
# Seconds in the original recording, with room for quiet consonants and tails.
# Z uses the final "zee". The earlier "zed" (38.38–38.91 s) is excluded.
SPANS = [
    (1.30, 2.06), (2.55, 3.25), (3.87, 4.72), (5.28, 6.05),
    (6.72, 7.51), (8.19, 8.96), (9.54, 10.32), (11.07, 11.92),
    (12.34, 13.15), (13.73, 14.55), (15.16, 15.92), (16.67, 17.46),
    (18.25, 19.01), (19.65, 20.44), (21.36, 22.13), (22.71, 23.51),
    (24.26, 25.13), (25.76, 26.64), (27.14, 28.10), (28.81, 29.79),
    (30.50, 31.31), (32.07, 32.90), (33.62, 34.67), (35.28, 36.27),
    (36.86, 37.73), (40.03, 40.89),
]


def main():
    recording, rate = sf.read(SOURCE, always_2d=True)
    if rate != 44100:
        raise ValueError(f"Unexpected source sample rate: {rate}")
    recording = recording.mean(axis=1)
    target_rate = 22050
    target = ROOT / "assets/audio/lab"
    for letter, (start, end) in zip("abcdefghijklmnopqrstuvwxyz", SPANS, strict=True):
        clip = recording[round(start * rate):round(end * rate)]
        # Low-pass before decimating to avoid aliasing at the project's rate.
        taps = np.arange(-48, 49)
        kernel = np.sinc(taps * 0.45) * np.hamming(len(taps))
        kernel /= kernel.sum()
        clip = np.convolve(clip, kernel, mode="same")[::2]
        rms = np.sqrt(np.mean(clip ** 2))
        peak = np.max(np.abs(clip))
        if rms < 0.005:
            raise ValueError(f"Empty or unexpectedly quiet letter: {letter}")
        clip *= min(0.055 / rms, 0.9 / peak)
        fade = round(target_rate * 0.005)
        clip[:fade] *= np.linspace(0, 1, fade)
        clip[-fade:] *= np.linspace(1, 0, fade)
        sf.write(target / f"name-{letter}.wav", clip, target_rate, subtype="PCM_16")
    print("OK: 26 recorded letter names, mono PCM 16-bit / 22050 Hz.")


if __name__ == "__main__":
    main()
