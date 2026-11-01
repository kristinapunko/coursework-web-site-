"""Create web-friendly WebP copies of raster assets without deleting originals."""

from pathlib import Path

from PIL import Image, ImageOps


ASSETS_DIR = Path(__file__).resolve().parents[1] / "src" / "assets"
SOURCE_EXTENSIONS = {".jpg", ".jpeg", ".png"}
MAX_SIZE = (1600, 1200)
WEBP_QUALITY = 78


def optimize(source_path: Path) -> tuple[int, int]:
    target_path = source_path.with_suffix(".webp")
    original_size = source_path.stat().st_size

    with Image.open(source_path) as source:
        image = ImageOps.exif_transpose(source)
        image.thumbnail(MAX_SIZE, Image.Resampling.LANCZOS)

        if image.mode not in {"RGB", "RGBA"}:
            image = image.convert("RGBA" if "transparency" in image.info else "RGB")

        image.save(
            target_path,
            "WEBP",
            quality=WEBP_QUALITY,
            method=6,
        )

    return original_size, target_path.stat().st_size


def main() -> None:
    total_before = 0
    total_after = 0

    for source_path in sorted(ASSETS_DIR.iterdir()):
        if source_path.suffix.lower() not in SOURCE_EXTENSIONS:
            continue

        before, after = optimize(source_path)
        total_before += before
        total_after += after
        print(
            f"{source_path.name}: "
            f"{before / 1024 / 1024:.2f} MB -> {after / 1024 / 1024:.2f} MB"
        )

    saved = total_before - total_after
    print(
        f"\nTotal: {total_before / 1024 / 1024:.2f} MB -> "
        f"{total_after / 1024 / 1024:.2f} MB "
        f"(saved {saved / 1024 / 1024:.2f} MB)"
    )


if __name__ == "__main__":
    main()
