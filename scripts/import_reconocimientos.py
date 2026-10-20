"""Copia los reconocimientos del sitio local aportado por la usuaria."""
from pathlib import Path
import json
import re
import shutil

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent / "mendoza_aumentada_ai_NEW_NEW"
script = (SOURCE / "script.js").read_text(encoding="utf-8")
collection = re.search(r"const RECONOCIMIENTOS_ITEMS = (\[.*?\]);", script, re.S).group(1)
# Convertir el literal de datos, sin ejecutar JavaScript del sitio de origen.
data = re.sub(r"(\b\w+):", r'"\1":', collection)
data = re.sub(r",(\s*[}\]])", r"\1", data)
items = json.loads(data)
(ROOT / "assets/img/premios").mkdir(parents=True, exist_ok=True)
for item in items:
    relative = Path(item["src"])
    assert relative.parts[:3] == ("assets", "img", "premios")
    shutil.copy2(SOURCE / relative, ROOT / relative)
(ROOT / "contenido/reconocimientos.json").write_text(
    json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
)
(ROOT / "originales/reconocimientos-mendoza.json").write_text(
    json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
)
print(f"Copiados {len(items)} reconocimientos con sus imágenes.")
