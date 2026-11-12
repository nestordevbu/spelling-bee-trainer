"""Verify the deployable folder with Python 3 and Node.js (no packages needed)."""

import argparse
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import subprocess
from urllib.parse import urlsplit
import wave

ROOT = Path(__file__).resolve().parents[1]
CONTROL = ROOT / "Spelling_Bee_Trainer_v4_5.html"
INDEX = ROOT / "index.html"
DATA = ROOT / "data"
LOCAL = DATA / "local-content.js"
LOCAL_PREFIX = (
    "// Copia de los JSON para abrir el HTML directamente con file://.\n"
    "const LOCAL_CONTENT = "
)
WEEK_3 = "bench catch chat graph kitchen phonics photo switch when whiskers".split()
CONTEST_WORDS = (
    "apple april arm august baby ball bedroom belt black boat book box brown butter cake "
    "canyon car card chair circle clap cloudy cold corn crayon cut desk dog down dress"
).split()


def check(condition, message):
    if not condition:
        raise ValueError(message)


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def relative_file(path):
    url = urlsplit(path)
    check(
        not url.scheme and not url.netloc and not url.query and not url.fragment
        and not path.startswith(("/", "\\")) and "\\" not in path,
        f"Se requiere una ruta relativa: {path}",
    )
    asset = (ROOT / path).resolve()
    check(asset.is_relative_to(ROOT) and asset.is_file(), f"Falta {path}")
    return asset


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.scripts = []
        self.paths = set()

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if element_id := attributes.get("id"):
            check(element_id not in self.ids, f"ID repetido: {element_id}")
            self.ids.add(element_id)
        for key in ("href", "src", "srcset"):
            if path := attributes.get(key):
                self.paths.add(path)
        if tag == "script":
            check("src" in attributes and "defer" in attributes, "Script externo sin defer")
            self.scripts.append(attributes["src"])


def check_audio(path):
    with wave.open(str(relative_file(path)), "rb") as clip:
        check(clip.getnframes() > 0 and clip.getnchannels() == 1, f"WAV no válido: {path}")


def check_weeks(manifest):
    check(manifest["schemaVersion"] == 1, "Versión de manifest inesperada")
    check(manifest["defaultWeek"] == "week-03", "La semana inicial debe ser la 3")
    entries = manifest["weeks"]
    check([entry["id"] for entry in entries] ==
          ["week-01", "week-02", "week-03", "contest-2026"],
          "El paquete requiere tres semanas y la lista del concurso")
    content = {}
    for entry in entries:
        path = entry["file"]
        week = read_json(relative_file(path))
        check(week["id"] == entry["id"] and week["title"] == entry["title"], path)
        words = [item["word"] for item in week["words"]]
        expected_count = 30 if week["id"] == "contest-2026" else 10
        check(len(set(words)) == len(words) == expected_count,
              f"Vocabulario repetido o incompleto: {path}")
        if week["id"] == "week-03":
            check(words == WEEK_3, "Vocabulario de semana 3 inesperado")
        if week["id"] == "contest-2026":
            check(words == CONTEST_WORDS, "La lista debe coincidir con las 30 palabras del cartel")
            event = week["event"]
            check(event["date"] == "2026-11-23" and event["timeZone"] == "America/Hermosillo",
                  "Fecha o zona horaria del concurso inesperada")
        for item in week["words"]:
            word = item["word"]
            check(re.fullmatch(r"[a-z]{2,20}", word), f"Palabra no válida: {word}")
            check(item["spanish"] and item["sentence"], f"Falta un ejemplo para {word}")
            image = relative_file(item["image"])
            check(image.read_bytes()[8:12] == b"WEBP", f"WebP no válido: {image}")
            check_audio(f"assets/audio/words/{word}.wav")
            check_audio(f"assets/audio/sentences/{word}.wav")
        content[path] = week
    return content


def check_lab(catalog):
    check(catalog["locale"] == "en-US", "Se requiere audio en inglés estadounidense")
    check("".join(letter["id"] for letter in catalog["letters"]) == "abcdefghijklmnopqrstuvwxyz",
          "Abecedario incompleto")
    check(len(catalog["patterns"]) == 14, "Faltan combinaciones de sonidos")
    for item in catalog["letters"]:
        check_audio(f"assets/audio/lab/name-{item['id']}.wav")
    for item in catalog["letters"] + catalog["patterns"]:
        check(item["ipa"] and len(item["examples"]) == 2, f"Tarjeta incompleta: {item['id']}")
        check_audio(f"assets/audio/lab/sound-{item['id']}.wav")
        for example in item["examples"]:
            check_audio(f"assets/audio/lab/{example}.wav")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sync-local", action="store_true",
                        help="Regenera la copia local de los JSON y el HTML de control")
    args = parser.parse_args()

    manifest = read_json(DATA / "manifest.json")
    phonics = read_json(DATA / "phonics.json")
    content = {"data/manifest.json": manifest, **check_weeks(manifest), "data/phonics.json": phonics}
    check_lab(phonics)
    if args.sync_local:
        offline = LOCAL_PREFIX + json.dumps(content, ensure_ascii=False, indent=2) + ";\n"
        LOCAL.write_text(offline, encoding="utf-8")
        CONTROL.write_bytes(INDEX.read_bytes())
    local = LOCAL.read_text(encoding="utf-8").strip()
    # Remove the declaration and parse its JSON payload without running JavaScript.
    payload = local.split("const LOCAL_CONTENT = ", 1)[1].removesuffix(";")
    check(json.loads(payload) == content, "Ejecuta verify.py --sync-local para copiar los JSON")
    check(CONTROL.read_bytes() == INDEX.read_bytes(), "El HTML de control difiere de index.html")
    page = Page()
    page.feed(INDEX.read_text(encoding="utf-8"))
    for path in sorted(page.paths):
        relative_file(path)
    for path in page.scripts:
        subprocess.run(["node", "--check", str(relative_file(path))], check=True)
    print(f"OK: {len(page.scripts)} scripts, 3 semanas y concurso de 30 palabras, 26 letras y 14 combinaciones.")
    print("OK: rutas relativas, audio WAV y HTML de control sincronizado.")


if __name__ == "__main__":
    main()

