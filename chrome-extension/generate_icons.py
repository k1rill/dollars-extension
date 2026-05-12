#!/usr/bin/env python3
"""
Перазапіс icon16/48/128.png з icon-source.png.
Чорныя вуглы (за скругленнем) аўтаматычна робяцца празрыстымі.
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
SOURCE = HERE / "icon-source.png"
OUT = HERE / "icons"

BLACK_THRESHOLD = 30


def make_dark_corners_transparent(im: Image.Image) -> Image.Image:
    """Flood-fill чорных/цёмных пікселяў ад чатырох вуглоў → alpha=0."""
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    visited = set()
    stack = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]

    while stack:
        x, y = stack.pop()
        if (x, y) in visited or x < 0 or y < 0 or x >= w or y >= h:
            continue
        r, g, b, a = px[x, y]
        if r <= BLACK_THRESHOLD and g <= BLACK_THRESHOLD and b <= BLACK_THRESHOLD:
            px[x, y] = (0, 0, 0, 0)
            visited.add((x, y))
            stack.extend([(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)])
        else:
            visited.add((x, y))

    return im


def main() -> None:
    if not SOURCE.is_file():
        raise SystemExit(f"Няма файла {SOURCE}")
    im = Image.open(SOURCE).convert("RGBA")
    w, h = im.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    im = im.crop((left, top, left + side, top + side))

    im = make_dark_corners_transparent(im)

    OUT.mkdir(parents=True, exist_ok=True)
    for s in (16, 48, 128):
        r = im.resize((s, s), Image.Resampling.LANCZOS)
        path = OUT / f"icon{s}.png"
        r.save(path, "PNG")
        print("OK", path)


if __name__ == "__main__":
    main()
