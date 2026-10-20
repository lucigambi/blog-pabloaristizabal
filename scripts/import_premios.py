"""Importa fragmentos literales de las dos gacetillas aportadas."""
from pathlib import Path
import base64
import html
import json
import re
import shutil

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent / "Mail--Gacetilla"
IMG = ROOT / "assets/img"
IMG.mkdir(parents=True, exist_ok=True)
(ROOT / "noticias").mkdir(exist_ok=True)

def match(pattern, source):
    return re.search(pattern, source, re.S).group(1)

def clean(fragment):
    fragment = re.sub(r'\s+(?:style|class|width|align)="[^"]*"', '', fragment)
    fragment = re.sub(r'<br\s*/?>', ' ', fragment)
    return re.sub(r'\s+', ' ', fragment).strip()

def plain(fragment):
    return html.unescape(re.sub(r'<[^>]+>', '', clean(fragment))).strip()

def blocks(fragment):
    return '\n'.join(clean(m.group()) for m in re.finditer(r'<(h2|p)\b[^>]*>.*?</\1>', fragment, re.S))

names = ["AmplificaciónPremiosSadosky2026-correccion-dana.html", "mailing-flexflix-time-v3.html"]
for name in names:
    shutil.copy2(SOURCE / name, ROOT / "originales" / name)
sadosky, time = [(SOURCE / name).read_text(encoding="utf-8") for name in names]
shutil.copy2(SOURCE / "FlexFlix-logo.png", IMG / "FlexFlix-logo.png")
image_data = match(r'<img[^>]+src="data:image/jpeg;base64,([^"]+)"', time)
(IMG / "time-edtech-2026.jpg").write_bytes(base64.b64decode(image_data))

sadosky_body = blocks(sadosky.split('<!-- PRESENTACIÓN -->')[1].split('<!-- ALCANCE -->')[0])
stats = sadosky.split('<!-- ALCANCE -->')[1].split('<!-- DECLARACIÓN CENTRAL -->')[0]
sadosky_body += '\n<ul>' + ''.join(
    '<li>' + clean(m) + '</li>' for m in re.findall(r'(<strong\b[^>]*>.*?</strong>\s*<br\s*/?>\s*<span\b[^>]*>.*?</span>)', stats, re.S)
) + '</ul>\n'
sadosky_body += blocks(sadosky.split('<!-- DECLARACIÓN CENTRAL -->')[1].split('<!-- CITA -->')[0])
quote = sadosky.split('<!-- CITA -->')[1].split('<!-- TRAYECTORIA -->')[0]
sadosky_body += '\n<blockquote>' + blocks(quote).replace('<p>', '<p>“', 1) + '</blockquote>\n'
sadosky_body += blocks(sadosky.split('<!-- TRAYECTORIA -->')[1].split('<!-- CONTACTO -->')[0])
time_body = blocks(time.split('<!-- ============ CUERPO ============ -->')[1].split('<!-- Cita -->')[0])
quote = time.split('<!-- Cita -->')[1].split('<!-- Botón -->')[0]
quote_cell = re.findall(r'<td\b[^>]*>(.*?)</td>', quote, re.S)[1]
quote_text, attribution = clean(quote_cell).split('<p>', 1)
time_body += '\n<blockquote><p>“' + quote_text.strip() + '</p><p>' + attribution + '</blockquote>\n'

new_posts = []
for slug, source, body, image, alt, summary, sources in [
    ("mendoza-aumentada-premio-sadosky-2026", sadosky, sadosky_body,
     "premio-sadosky-mendoza-aumentada.jpg", "Mendoza Aumentada en los Premios Sadosky 2026",
     plain(match(r'<p class="category"[^>]*>(.*?)</p>', sadosky)),
     '<p><a href="https://mendozaaumentada.ai/" target="_blank" rel="noopener">Mendoza Aumentada ↗</a></p>'),
    ("flexflix-ranking-time-2026", time, time_body,
     "time-edtech-2026.jpg", "TIME World's Top EdTech Companies 2026 · in partnership with Statista",
     plain(match(r'<strong style="color:#3D1C9E;">(.*?)</strong>', time)),
     '<p><a href="https://time.com/article/2026/07/22/worlds-top-edtech-companies-2026/" target="_blank" rel="noopener">Ver el ranking completo en TIME.com ↗</a></p>'),
]:
    (ROOT / f"contenido/{slug}.html").write_text(body + '\n', encoding="utf-8")
    (ROOT / f"contenido/{slug}-fuentes.html").write_text(sources + '\n', encoding="utf-8")
    new_posts.append({
        "title": plain(match(r'<h1\b[^>]*>(.*?)</h1>', source)),
        "summary": summary, "type": "Noticias", "topic": "Premios",
        "date": "2026", "minutes": max(1, round(len(plain(body).split()) / 200)),
        "url": f"noticias/{slug}.html", "image": f"assets/img/{image}", "image_alt": alt,
        "content": f"contenido/{slug}.html", "sources": f"contenido/{slug}-fuentes.html",
        "author": "Prensa · FlexFlix",
    })
catalog = ROOT / "contenido/publicaciones.json"
posts = json.loads(catalog.read_text(encoding="utf-8"))
new_urls = {p["url"] for p in new_posts}
posts = [p for p in posts if p["url"] not in new_urls] + new_posts
catalog.write_text(json.dumps(posts, ensure_ascii=False, indent=2) + '\n', encoding="utf-8")
