"""Importa el ensayo desde la copia original, sin modificar su texto."""
from pathlib import Path
import base64
import html
import json
import re

ROOT = Path(__file__).resolve().parents[1]
source = (ROOT / "originales/espiritu-emprendedor.html").read_text(encoding="utf-8")

def extract(pattern):
    return re.search(pattern, source, re.S).group(1)

def plain(value):
    return html.unescape(re.sub(r"<[^>]+>", "", value))

slug = "el-espiritu-emprendedor"
body = extract(r"<article>(.*?)</article>")
note = extract(r"<footer>(.*?)</footer>")
(ROOT / f"contenido/{slug}.html").write_text(body, encoding="utf-8")
(ROOT / f"contenido/{slug}-fuentes.html").write_text(note, encoding="utf-8")
(ROOT / f"ensayos/{slug}.jpg").write_bytes(
    base64.b64decode(extract(r'<img src="data:image/jpeg;base64,([^"]+)"'))
)
post = {
    "title": plain(extract(r"<h1>(.*?)</h1>")),
    "summary": plain(extract(r'<p class="bajada">(.*?)</p>')),
    "type": "Ensayos",
    "topic": "Emprendimiento",
    "date": "Octubre de 2026",
    "minutes": 26,
    "url": f"ensayos/{slug}.html",
    "image": f"ensayos/{slug}.jpg",
    "image_alt": extract(r'<img[^>]*alt="([^"]*)"'),
    "content": f"contenido/{slug}.html",
    "sources": f"contenido/{slug}-fuentes.html",
    "author": "Pablo Aristizábal",
    "original": "https://claude.ai/artifact/GvShXe9PfE98NKf7dwsLP7",
}
catalog = ROOT / "contenido/publicaciones.json"
posts = json.loads(catalog.read_text(encoding="utf-8"))
posts = [post] + [p for p in posts if p["url"] != post["url"]]
catalog.write_text(json.dumps(posts, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
