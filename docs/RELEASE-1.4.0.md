# Релиз 1.4.0 — выкладка в Chrome Web Store

## Архив

```bash
./scripts/package-chrome-extension.sh
```

Файл: **`dist/udalyarah-1.4.0.zip`** (в корне ZIP: `manifest.json`, скрипты, `fonts/`, `icons/`).

Загрузка: [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/) → расширение → **Package** → Upload new package.

---

## Что в релизе (1.4.0)

- **catalog.onliner.by** — цены с символом ƃ, разбитая вёрстка карточек и страница `/prices`.
- **21vek.by** — цены вида `1 167,29 р.`, в т.ч. разбитые на `1 167,` + `29 р.`
- Настройки **сайтов**: все сразу или по отдельности (av.by, Onliner, 21vek).
- Выбор **USD** и/или **EUR** в конвертации.
- Подсказка при наведении, якорь у кнопок цены; шрифт НБРБ для знака BYN.

---

## Тексты для карточки магазина

Скопировать из:

- **[store-listing.md](store-listing.md)** (RU)
- **[store-listing-en.md](store-listing-en.md)** (EN)

**Краткое описание (RU):**  
`Цены av.by, Onliner и 21vek.by в USD и EUR (НБ РБ). Подсказка и подпись рядом с ценой.`

**Краткое описание (EN):**  
`av.by, Onliner & 21vek.by prices in USD/EUR (NBRB). Tooltip and inline conversion.`

**Категория:** Покупки (Shopping).

---

## Privacy policy

Опубликовать **[PRIVACY_POLICY.md](PRIVACY_POLICY.md)** по публичному HTTPS URL и вставить ссылку в форму магазина.

---

## Скриншоты (рекомендуется обновить)

1280×800 или 640×400, PNG/JPEG:

1. `cars.av.by` — inline `≈ $… · €…`
2. `catalog.onliner.by` — карточка товара или `/prices`
3. `21vek.by` — цена товара с конвертацией
4. Popup — курсы НБРБ, сайты, USD/EUR

---

## Чеклист перед отправкой на модерацию

- [ ] ZIP собран из актуального `chrome-extension/`, версия в manifest **1.4.0**
- [ ] Протестированы: av.by, catalog.onliner.by, 21vek.by (inline + hover)
- [ ] Privacy policy URL доступен
- [ ] Обоснование permissions скопировано из store-listing-en (раздел Permission justification)
- [ ] Скриншоты соответствуют текущему UI
