# Ў далярах · av.by у USD / EUR

Расширение для Chromium: показывает цены **av.by** в **долларах и евро** по курсам **НБ РБ**.

## Структура репозитория

| Каталог / файл | Назначение |
|----------------|------------|
| **[chrome-extension/](chrome-extension/)** | Исходники расширения (`manifest.json`, скрипты, стили, иконки). **Эту папку** нужно выбирать в Chrome → «Загрузить распакованное расширение». |
| **[docs/](docs/)** | Тексты для публикации в Chrome Web Store (RU/EN), политика конфиденциальности. |
| **[scripts/](scripts/)** | Вспомогательные скрипты (например, создание репозитория на GitHub). |

## Быстрый старт (разработка)

1. Откройте `chrome://extensions`, включите «Режим разработчика».
2. «Загрузить распакованное» → укажите каталог **`chrome-extension/`**.
3. Откройте любой раздел **av.by** (например `cars.av.by`) и проверьте подсказку / подпись к цене.

Пересборка иконок из эталона (если меняли `icon-source.png`): из каталога `chrome-extension/` выполните `python3 generate_icons.py`.

## Архив для Chrome Web Store

Соберите ZIP с **содержимым** `chrome-extension/` (в корне архива должны лежать `manifest.json`, папка `icons/` и т.д.):

```bash
cd chrome-extension && zip -r ../u-dalyarah-1.1.0.zip manifest.json *.js *.css *.html icons/
```

Или вручную: выделите файлы внутри `chrome-extension/` → «Сжать».

Подробные тексты для карточки магазина — в **[docs/store-listing.md](docs/store-listing.md)** (RU) и **[docs/store-listing-en.md](docs/store-listing-en.md)** (EN).

## Политика конфиденциальности

Исходный текст: **[docs/PRIVACY_POLICY.md](docs/PRIVACY_POLICY.md)** — опубликуйте по публичному URL для формы Chrome Web Store.
