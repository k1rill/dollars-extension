# Ў далярах · av.by у USD / EUR

Расширение для Chromium: показывает цены **av.by** в **долларах и евро** по курсам **НБ РБ**.

## Структура репозитория

| Каталог / файл | Назначение |
|----------------|------------|
| **[chrome-extension/](chrome-extension/)** | Исходники расширения (`manifest.json`, скрипты, стили, иконки). **Эту папку** нужно выбирать в Chrome → «Загрузить распакованное расширение». |
| **[docs/](docs/)** | Тексты для публикации в Chrome Web Store (RU/EN), политика конфиденциальности. |
| **[scripts/](scripts/)** | Упаковка расширения для Chrome Web Store, вспомогательные скрипты. |

## Быстрый старт (разработка)

1. Откройте `chrome://extensions`, включите «Режим разработчика».
2. «Загрузить распакованное» → укажите каталог **`chrome-extension/`**.
3. Откройте любой раздел **av.by** (например `cars.av.by`) и проверьте подсказку / подпись к цене.

Пересборка иконок из эталона (если меняли `icon-source.png`): из каталога `chrome-extension/` выполните `python3 generate_icons.py`.

## Архив для Chrome Web Store

Из корня репозитория:

```bash
./scripts/package-chrome-extension.sh
```

В каталоге **`dist/`** появится **`udalyarah-<версия>.zip`** (в корне архива лежат `manifest.json`, `fonts/`, `icons/` и скрипты — без `test-page.html`, `generate_icons.py`, `icon-source.png`). Имя версии берётся из **`chrome-extension/manifest.json`**.

Загрузите ZIP в [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/) → ваш → **Package**.

Подробные тексты для карточки магазина — в **[docs/store-listing.md](docs/store-listing.md)** (RU) и **[docs/store-listing-en.md](docs/store-listing-en.md)** (EN).

## Политика конфиденциальности

Исходный текст: **[docs/PRIVACY_POLICY.md](docs/PRIVACY_POLICY.md)** — опубликуйте по публичному URL для формы Chrome Web Store.
