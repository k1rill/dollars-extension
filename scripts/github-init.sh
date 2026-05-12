#!/usr/bin/env bash
# Пасля аднаразовага `gh auth login` стварае рэпазіторый і пушыць main.
set -euo pipefail
cd "$(dirname "$0")/.."

if ! command -v gh >/dev/null 2>&1; then
  echo "Усталюйце GitHub CLI: brew install gh"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Спачатку ўвайдзіце: gh auth login"
  exit 1
fi

NAME="${GITHUB_REPO_NAME:-u-dalyarah}"
DESC="${GITHUB_REPO_DESC:-Chrome extension «Ў далярах»: цены av.by в USD/EUR (курсы НБ РБ).}"

if git remote get-url origin >/dev/null 2>&1; then
  echo "Remote origin ужо ёсць: $(git remote get-url origin)"
  git push -u origin main
  exit 0
fi

gh repo create "$NAME" \
  --public \
  --description "$DESC" \
  --source=. \
  --remote=origin \
  --push

echo "Гатова: $(git remote get-url origin)"
