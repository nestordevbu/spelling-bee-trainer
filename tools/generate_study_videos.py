"""Generate illustrated MP4 spelling lessons using the project's existing audio.

Requires Pillow and FFmpeg (on PATH, --ffmpeg, or output/video-tools).
"""

import argparse
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import wave

from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
WIDTH, HEIGHT = 960, 540


def duration(path):
    with wave.open(str(path), "rb") as clip:
        return clip.getnframes() / clip.getframerate()


def font(size, bold=False):
    directory = Path(os.environ.get("WINDIR", "C:/Windows")) / "Fonts"
    candidates = [directory / ("arialbd.ttf" if bold else "arial.ttf"),
                  Path("DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf")]
    for candidate in candidates:
        try:
            return ImageFont.truetype(str(candidate), size)
        except OSError:
            pass
    return ImageFont.load_default(size=size)


def timeline(word):
    word_duration = duration(ROOT / f"assets/audio/words/{word}.wav")
    phases = [("Listen", -1, 0.5 + word_duration + 0.35)]
    for index, letter in enumerate(word):
        gap = 0.35 if index == len(word) - 1 else 0.12
        phases.append(("Spell", index,
                       duration(ROOT / f"assets/audio/lab/name-{letter}.wav") + gap))
    phases.append(("Say it again", len(word), word_duration + 0.8))
    return phases


def frame(item, phase, active):
    image = Image.new("RGB", (WIDTH, HEIGHT), "#f4efff")
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((24, 22, 936, 518), radius=28, fill="white")
    draw.text((52, 40), "SPELLING BEE", font=font(23, True), fill="#7045cf")
    draw.text((908, 42), phase, anchor="ra", font=font(22), fill="#706982")
    with Image.open(ROOT / item["image"]) as source:
        illustration = ImageOps.contain(source.convert("RGBA"), (290, 290))
        image.paste(illustration, (58 + (290 - illustration.width) // 2,
                                   112 + (290 - illustration.height) // 2), illustration)
    label = item.get("display", item["word"])
    draw.text((620, 133), label, anchor="mt", font=font(64, True), fill="#32214d")
    draw.text((620, 218), item["spanish"], anchor="mt", font=font(28), fill="#706982")
    count = len(item["word"])
    box = min(64, 510 // count)
    start = 620 - count * box / 2
    for index, letter in enumerate(item["word"]):
        x = start + index * box
        selected = index == active
        done = index < active
        fill = "#7045cf" if selected else "#e7ddfb" if done else "#f4efff"
        draw.rounded_rectangle((x + 2, 302, x + box - 3, 370), radius=10, fill=fill)
        draw.text((x + box / 2, 313), letter.upper(), anchor="mt",
                  font=font(34, True), fill="white" if selected else "#553498")
    draw.text((480, 441), item["sentence"], anchor="mt", font=font(26), fill="#32214d")
    draw.text((480, 492), "Letter voice: acclivity / Freesound · CC BY-NC 4.0",
              anchor="mm", font=font(15), fill="#706982")
    return image


def timestamp(seconds):
    milliseconds = round(seconds * 1000)
    return f"{milliseconds // 3600000:02}:{milliseconds // 60000 % 60:02}:{milliseconds // 1000 % 60:02}.{milliseconds % 1000:03}"


def generate(ffmpeg, list_id, item):
    target = ROOT / "assets/videos" / list_id
    target.mkdir(parents=True, exist_ok=True)
    word = item["word"]
    phases = timeline(word)
    subtitles = ["WEBVTT\n"]
    position = 0
    workspace_temp = ROOT / "output/video-frames"
    workspace_temp.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="spelling-", dir=workspace_temp) as temporary:
        directory = Path(temporary)
        lines = []
        for index, (phase, active, seconds) in enumerate(phases):
            still = frame(item, phase, active)
            still.save(directory / f"{index}.png")
            if index == 0:
                still.save(target / f"{word}.jpg", quality=85)
            lines.extend([f"file '{index}.png'", f"duration {seconds:.6f}"])
            text = word if active < 0 or active == len(word) else " - ".join(word[:active + 1].upper())
            subtitles.append(f"{timestamp(position)} --> {timestamp(position + seconds)}\n{text}\n")
            position += seconds
        lines.append(f"file '{len(phases) - 1}.png'")
        concat = directory / "frames.txt"
        concat.write_text("\n".join(lines), encoding="utf-8")
        subprocess.run([
            ffmpeg, "-hide_banner", "-loglevel", "error", "-y",
            "-f", "concat", "-safe", "0", "-i", str(concat),
            "-i", str(ROOT / f"assets/audio/spelling/{word}.wav"),
            "-af", "adelay=500:all=1,apad", "-t", f"{position:.6f}",
            "-r", "24", "-c:v", "libx264", "-preset", "fast", "-crf", "25",
            "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "80k",
            "-movflags", "+faststart", str(target / f"{word}.mp4"),
        ], check=True)
    (target / f"{word}.vtt").write_text("\n".join(subtitles), encoding="utf-8")
    return round(position, 3)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ffmpeg")
    parser.add_argument("--list", help="Only regenerate this list")
    args = parser.parse_args()
    ffmpeg = args.ffmpeg or shutil.which("ffmpeg")
    if not ffmpeg:
        sys.path.insert(0, str(ROOT / "output/video-tools"))
        import imageio_ffmpeg
        ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    manifest = json.loads((ROOT / "data/manifest.json").read_text(encoding="utf-8"))
    for entry in manifest["weeks"] + [manifest["contest"]]:
        if args.list and args.list != entry["id"]:
            continue
        content = json.loads((ROOT / entry["file"]).read_text(encoding="utf-8"))
        for item in content["words"]:
            seconds = generate(ffmpeg, entry["id"], item)
            print(f"{entry['id']}/{item['word']}: {seconds}s", flush=True)


if __name__ == "__main__":
    main()
