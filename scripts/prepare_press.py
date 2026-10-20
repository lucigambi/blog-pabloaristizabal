"""Prepara imágenes locales y extractos literales de las notas de prensa."""
from pathlib import Path
import json
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
catalog = ROOT / "contenido/prensa.json"
rows = json.loads(catalog.read_text(encoding="utf-8"))
excerpts = {
    "forbes": "Conocido por su pasión por emprender, Aristizábal acaba de lanzar FlexFlix, una plataforma de streaming con enfoque curricular.",
    "los-andes": "Pablo Aristizábal es un destacado especialista en tecnologías y un referente de IA aplicada a la educación.",
    "la-nacion": "El especialista propone un uso virtuoso de la IA y el crecimiento económico como base del desarrollo educativo",
}
for row in rows:
    row["summary"] = excerpts[row["id"]]
    with Image.open(ROOT / f"originales/nota-{row['id']}.jpg") as original:
        image = ImageOps.exif_transpose(original).convert("RGB")
        image.thumbnail((1200, 900), Image.Resampling.LANCZOS)
        image.save(ROOT / row["image"], "WEBP", quality=82, method=6)
catalog.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
