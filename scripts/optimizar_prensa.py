"""Crea copias web de las fotos de prensa sin escribir en los originales."""
from pathlib import Path
import hashlib
import json
import re
import unicodedata

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/FotosOriginales (No modificar)"
DEST = ROOT / "assets/img"

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def slug(name):
    name = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")

def main():
    files = sorted(p for p in SOURCE.iterdir() if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"})
    before = {p: digest(p) for p in files}
    DEST.mkdir(parents=True, exist_ok=True)
    images, records = {}, []
    for path in files:
        with Image.open(path) as original:
            image = ImageOps.exif_transpose(original).convert("RGB")
            original_size = image.size
            image.thumbnail((1920, 1920), Image.Resampling.LANCZOS)
            key = hashlib.sha256(str(image.size).encode() + image.tobytes()).hexdigest()
            if key not in images:
                output = DEST / f"prensa-{slug(path.stem)}.webp"
                image.save(output, "WEBP", quality=82, method=6)
                with Image.open(output) as saved:
                    saved.verify()
                images[key] = output
            output = images[key]
            records.append({
                "original": path.name,
                "sha256_original": before[path],
                "image": output.relative_to(ROOT).as_posix(),
                "original_dimensions": original_size,
                "dimensions": image.size,
                "original_bytes": path.stat().st_size,
                "optimized_bytes": output.stat().st_size,
            })
    assert before == {p: digest(p) for p in files}, "Se modificaron originales"
    (ROOT / "contenido/imagenes-prensa.json").write_text(
        json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    original_bytes = sum(p.stat().st_size for p in files)
    optimized_bytes = sum(p.stat().st_size for p in images.values())
    print(json.dumps({
        "originals": len(files), "optimized_files": len(images),
        "original_mb": round(original_bytes / 1_000_000, 2),
        "optimized_mb": round(optimized_bytes / 1_000_000, 2),
        "reduction_percent": round(100 * (1 - optimized_bytes / original_bytes), 1),
        "originals_unchanged": True,
    }))

if __name__ == "__main__":
    main()
