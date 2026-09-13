# Релиз 1.6.0 — выкладка в Chrome Web Store

## Архив

```bash
./scripts/package-chrome-extension.sh
```

Файл: **`dist/udalyarah-1.6.0.zip`** (в корне ZIP: `manifest.json`, скрипты, `fonts/`, `icons/`).

Загрузка: [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/) → расширение → **Package** → Upload new package.

---

## Что в релизе (1.6.0)

### Новые сайты (волна 1)

- **ab.onliner.by** — автобарахолка Onliner (`ƃ`)
- **baraholka.onliner.by** — барахолка Onliner
- **kufar.by** — объявления (`р.`)
- **shop.by** — сравнение цен
- **sila.by** — Электросила

### Новые сайты (волна 2)

- **5element.by**, **oz.by**, **oma.by**, **emall.by**, **e-dostavka.by**

### Прочее

- Переключатели сайтов в popup для всех площадок
- Распознавание «р» без точки (как на sila.by)
- Исправление av.by: `<small>руб.</small>` рядом с числом (из 1.5.0)

**Не в релизе:** realt.by / r.onliner.by (часто USD), Wildberries / Ozon.

---

## Тексты для карточки магазина

Скопировать из:

- **[store-listing.md](store-listing.md)** (RU)
- **[store-listing-en.md](store-listing-en.md)** (EN)

**Краткое описание (RU):**  
`Цены BYN в USD/EUR (НБ РБ) на Onliner, Kufar, 21vek, av.by и др.`

**Краткое описание (EN):**  
`BYN prices in USD/EUR (NBRB) on Onliner, Kufar, 21vek, av.by and more.`

**Категория:** Покупки (Shopping).

---

## Privacy policy

Опубликовать **[PRIVACY_POLICY.md](PRIVACY_POLICY.md)** по публичному HTTPS URL и вставить ссылку в форму магазина.

---

## Скриншоты (рекомендуется обновить)

1280×800 или 640×400, PNG/JPEG:

1. `cars.av.by` или `kufar.by` — inline `≈ $… · €…`
2. `ab.onliner.by` или `catalog.onliner.by` — ƃ
3. `21vek.by` / `sila.by` / `shop.by`
4. Popup — курсы НБРБ и список сайтов

---

## Чеклист перед отправкой на модерацию

- [ ] ZIP собран из актуального `chrome-extension/`, версия в manifest **1.6.0**
- [ ] Протестированы: av.by, Onliner (catalog/ab), kufar, 21vek, shop.by, sila (+ выборочно волна 2)
- [ ] Privacy policy URL доступен и обновлён
- [ ] Обоснование permissions скопировано из store-listing-en
- [ ] Скриншоты соответствуют текущему UI
