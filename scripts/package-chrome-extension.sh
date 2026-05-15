#!/usr/bin/env bash
# Zip extension tree for Chrome Web Store upload (only runtime files; no dev assets).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EXT="$ROOT/chrome-extension"
OUT="$ROOT/dist"

if [[ ! -f "$EXT/manifest.json" ]]; then
  echo "Expected $EXT/manifest.json" >&2
  exit 1
fi

VERSION="$(grep -m1 '"version"' "$EXT/manifest.json" | sed -E 's/.*"([0-9][^"]*)".*/\1/')"
mkdir -p "$OUT"
ZIP="$OUT/udalyarah-${VERSION}.zip"
rm -f "$ZIP"

(
  cd "$EXT"
  zip -r "$ZIP" \
    manifest.json \
    background.js \
    content.js \
    content.css \
    popup.html \
    popup.js \
    fonts \
    icons
)

echo "Packaged: $ZIP ($(wc -c < "$ZIP" | tr -d ' ') bytes)"
echo "Upload this ZIP in Chrome Web Store Developer Dashboard → Package."
