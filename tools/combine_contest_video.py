"""Create Matteo's local compilation from the existing 30 contest MP4 clips.

Intro card + all 26 letters together with selected human letter recordings +
the unchanged contest clips in official order. Does not publish anything.
"""
import json
from pathlib import Path
import shutil
import struct
import subprocess
import sys
import wave

from PIL import Image, ImageDraw, ImageOps
from generate_study_videos import font

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / "output/matteo-compilation"
TARGET = ROOT / "assets/videos/guided-lesson"
RATE = 22050


def ffmpeg():
    sys.path.insert(0, str(ROOT / "output/video-tools"))
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def movie_duration(path):
    data = path.read_bytes()
    def atoms(start, end):
        while start + 8 <= end:
            size, kind = struct.unpack_from(">I4s", data, start)
            header = 8
            if size == 1:
                size = struct.unpack_from(">Q", data, start + 8)[0]
                header = 16
            if size == 0:
                size = end - start
            if size < header:
                raise ValueError(path)
            yield kind, start + header, start + size
            start += size
    for kind, start, end in atoms(0, len(data)):
        if kind != b"moov":
            continue
        for child, payload, _ in atoms(start, end):
            if child == b"mvhd":
                if data[payload] == 1:
                    scale, duration = struct.unpack_from(">IQ", data, payload + 20)
                else:
                    scale, duration = struct.unpack_from(">II", data, payload + 12)
                return duration / scale
    raise ValueError(f"Missing MP4 duration: {path}")


def stamp(seconds):
    value = round(seconds * 1000)
    return f"{value//3600000:02}:{value//60000%60:02}:{value//1000%60:02}.{value%1000:03}"


def alphabet_frame(active):
    image = Image.new("RGB", (960, 540), "#f4efff")
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((18, 16, 942, 524), radius=24, fill="white")
    draw.text((480, 35), "The Alphabet · American English", anchor="mt", font=font(34, True), fill="#603bc4")
    draw.text((480, 81), "Escucha y sigue la letra resaltada", anchor="mt", font=font(22), fill="#706982")
    for index, letter in enumerate("ABCDEFGHIJKLMNOPQRSTUVWXYZ"):
        row, column = divmod(index, 7)
        x = 68 + column * 120 + (120 if row == 3 else 0)
        y = 132 + row * 82
        chosen = index == active
        draw.rounded_rectangle((x, y, x + 104, y + 68), radius=15,
                               fill="#7045cf" if chosen else "#f1eaff")
        if chosen:
            draw.rounded_rectangle((x - 3, y - 3, x + 107, y + 71), radius=18, outline="#ffc43d", width=4)
        draw.text((x + 52, y + 7), letter, anchor="mt", font=font(45, True),
                  fill="white" if chosen else "#553498")
    draw.text((480, 495), "Letter voice: acclivity / Freesound · CC BY-NC 4.0", anchor="mm", font=font(15), fill="#706982")
    return image


def encode_stills(concat, audio, seconds, destination):
    subprocess.run([ffmpeg(), "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(concat),
        "-i", str(audio), "-t", str(seconds), "-vf", "fps=24", "-fps_mode", "cfr", "-c:v", "libx264", "-preset", "fast",
        "-crf", "25", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "80k",
        "-movflags", "+faststart", str(destination)], check=True)


def prepare_alphabet():
    WORK.mkdir(parents=True, exist_ok=True)
    frames, clips, letters, position = [], [], [], 0
    def segment(active, pcm):
        nonlocal position
        name = "alphabet-" + str(active) + ".png"
        alphabet_frame(active).save(WORK / name)
        seconds = len(pcm) / 2 / RATE
        frames.extend([f"file '{name}'", f"duration {seconds:.9f}"])
        clips.append(pcm)
        if active >= 0:
            letters.append({"letter": chr(97 + active), "start": position, "duration": seconds})
        position += seconds
    segment(-1, bytes(round(RATE * 0.6) * 2))
    for index, letter in enumerate("abcdefghijklmnopqrstuvwxyz"):
        with wave.open(str(ROOT / f"assets/audio/lab/name-{letter}.wav"), "rb") as clip:
            assert (clip.getnchannels(), clip.getsampwidth(), clip.getframerate()) == (1, 2, RATE)
            segment(index, clip.readframes(clip.getnframes()) + bytes(round(RATE * 0.25) * 2))
    frames.append("file 'alphabet-25.png'")
    (WORK / "alphabet-frames.txt").write_text("\n".join(frames), encoding="utf-8")
    with wave.open(str(WORK / "alphabet.wav"), "wb") as audio:
        audio.setparams((1, 2, RATE, 0, "NONE", "not compressed"))
        audio.writeframes(b"".join(clips))
    encode_stills(WORK / "alphabet-frames.txt", WORK / "alphabet.wav", position, WORK / "alphabet.mp4")
    (WORK / "alphabet-timing.json").write_text(json.dumps(letters, indent=2), encoding="utf-8")
    print(f"OK: A-Z on one board, 26 selected human recordings, {position:.2f}s.", flush=True)


def prepare_intro():
    # The existing project mascot is used only on the intro card.
    image = Image.new("RGB", (960, 540), "#e7f6ff")
    draw = ImageDraw.Draw(image)
    for x, y, color in [(50, 60, "#ffc83d"), (880, 70, "#ff7d7d"), (65, 450, "#b69aff"), (870, 455, "#67d9c5")]:
        draw.ellipse((x - 50, y - 50, x + 50, y + 50), fill=color)
    draw.rounded_rectangle((30, 24, 930, 516), radius=30, fill="white", outline="#7045cf", width=4)
    draw.text((480, 65), "Spelling By Contest", anchor="mt", font=font(54, True), fill="#603bc4")
    draw.text((480, 145), "Let's Practice", anchor="mt", font=font(40, True), fill="#126e70")
    with Image.open(ROOT / "assets/ui/contest-bee-dragon.webp") as source:
        mascot = ImageOps.contain(source.convert("RGBA"), (180, 250))
        image.paste(mascot, ((960 - mascot.width) // 2, 207), mascot)
    draw.text((480, 461), "You can do it Matteo", anchor="mt", font=font(35, True), fill="#603bc4")
    image.save(WORK / "intro.png")
    with wave.open(str(WORK / "intro.wav"), "wb") as audio:
        audio.setparams((1, 2, RATE, 0, "NONE", "not compressed"))
        audio.writeframes(bytes(RATE * 8 * 2))
    (WORK / "intro-frames.txt").write_text("file 'intro.png'\nduration 8\nfile 'intro.png'\n", encoding="utf-8")
    encode_stills(WORK / "intro-frames.txt", WORK / "intro.wav", 8, WORK / "intro.mp4")


def combine():
    TARGET.mkdir(parents=True, exist_ok=True)
    content = json.loads((ROOT / "data/contest-2026.json").read_text(encoding="utf-8"))
    files = [WORK / "intro.mp4", WORK / "alphabet.mp4"] + [ROOT / f"assets/videos/contest-2026/{item['word']}.mp4" for item in content["words"]]
    concat = WORK / "compilation.txt"
    concat.write_text("\n".join(f"file '{file.as_posix()}'" for file in files), encoding="utf-8")
    destination = WORK / "Spelling-By-Contest-Matteo.mp4"
    subprocess.run([ffmpeg(), "-hide_banner", "-loglevel", "warning", "-y", "-f", "concat", "-safe", "0", "-i", str(concat),
        "-map", "0:v:0", "-map", "0:a:0", "-vf", "fps=24", "-fps_mode", "cfr",
        "-c:v", "libx264", "-preset", "fast", "-crf", "23", "-pix_fmt", "yuv420p", "-af", "aresample=async=1:first_pts=0",
        "-c:a", "aac", "-b:a", "80k", "-movflags", "+faststart", str(destination)], check=True)
    chapters = [{"title": "You can do it Matteo", "key": "intro", "section": "intro", "start": 0}]
    intro_duration = movie_duration(files[0])
    alphabet_duration = movie_duration(files[1])
    captions = ["WEBVTT\n", f"{stamp(0)} --> {stamp(intro_duration)}\nSpelling By Contest · Let's Practice · You can do it Matteo\n"]
    letters = json.loads((WORK / "alphabet-timing.json").read_text(encoding="utf-8"))
    for entry in letters:
        start = intro_duration + entry["start"]
        chapters.append({"title": "Letra " + entry["letter"].upper(), "key": entry["letter"], "section": "alphabet", "start": start})
        captions.append(f"{stamp(start)} --> {stamp(start + entry['duration'])}\n{entry['letter'].upper()}\n")
    position = intro_duration + alphabet_duration
    for item, path in zip(content["words"], files[2:]):
        chapters.append({"title": item.get("display", item["word"]), "key": item["word"], "section": "words", "start": position})
        # Existing captions describe the synchronized spelling in every clip.
        source = path.with_suffix(".vtt").read_text(encoding="utf-8")
        import re
        def shift(match):
            hours, minutes, seconds = map(float, match.group(0).split(":"))
            return stamp(position + hours * 3600 + minutes * 60 + seconds)
        captions.append(re.sub(r"\d{2}:\d{2}:\d{2}\.\d{3}", shift, source.removeprefix("WEBVTT").strip()) + "\n")
        position += movie_duration(path)
    metadata = {"title": "Spelling By Contest · Matteo", "video": "assets/videos/guided-lesson/lesson.mp4",
                "duration": movie_duration(destination), "chapters": chapters, "locale": "en-US", "format": "contest-compilation",
                "alphabetDuration": alphabet_duration, "introDuration": intro_duration, "wordCount": 30,
                "sources": [str(path.relative_to(ROOT)).replace("\\", "/") for path in files[2:]]}
    # Verify the complete new video before replacing the active local version.
    subprocess.run([ffmpeg(), "-v", "error", "-i", str(destination), "-f", "null", "-"], check=True)
    shutil.copy2(destination, TARGET / "lesson.mp4")
    with Image.open(WORK / "intro.png") as image:
        image.convert("RGB").save(TARGET / "poster.jpg", quality=90)
    (TARGET / "captions.vtt").write_text("\n".join(captions), encoding="utf-8")
    (ROOT / "data/guided-lesson.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"OK: intro + A-Z + 30 original clips; {metadata['duration']:.2f}s; {destination.stat().st_size} bytes.", flush=True)


if __name__ == "__main__":
    if "--alphabet-only" in sys.argv:
        prepare_alphabet()
    else:
        if not (WORK / "alphabet.mp4").exists():
            prepare_alphabet()
        prepare_intro()
        combine()
