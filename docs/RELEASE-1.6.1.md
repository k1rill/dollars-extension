# Релиз 1.6.1 — выкладка в Chrome Web Store

## Архив

```bash
./scripts/package-chrome-extension.sh
```

Файл: **`dist/udalyarah-1.6.1.zip`** (в корне ZIP: `manifest.json`, скрипты, `fonts/`, `icons/`).

Загрузка: [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/) → расширение → **Package** → Upload new package.

---

## Что в релизе (1.6.1)

Исправления и доработки поверх 1.6.0:

- **r.onliner.by** — недвижимость Onliner; цены BYN (`ƃ`), смотреть с `?currency=BYN`
- **shop.by** — латинская валюта **`p.`** (раньше работала только кириллическая `р.`)
- **5element.by** — цены с иконкой НБРБ (`nbrb-icon-byn`) без текста валюты
- **edostavka.by** — хост в manifest (раньше был только `e-dostavka.by`); цены `ƃ`
- **Убран oma.by**

### Поддерживаемые сайты (актуально)

- av.by (+ поддомены)
- Onliner: catalog, ab, baraholka, **r**
- 21vek.by, Kufar, Shop.by, sila.by, 5element.by, oz.by, emall.by, edostavka / e-dostavka

**Не в релизе:** realt.by (часто USD), Wildberries / Ozon.

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

В форме «разрешения» вставить обоснование из **store-listing-en.md** → Permission justification (версия **1.6.1**).

---

## Privacy policy

Опубликовать актуальный **[PRIVACY_POLICY.md](PRIVACY_POLICY.md)** (дата: 21 Sep 2026) по публичному HTTPS URL и вставить ссылку в форму магазина.

---

## Скриншоты (рекомендуется обновить)

1280×800 или 640×400, PNG/JPEG:

1. `kufar.by` или `cars.av.by` — inline `≈ $… · €…`
2. `r.onliner.by` или `ab.onliner.by` — цена с `ƃ`
3. `5element.by` или `shop.by` / `edostavka.by`
4. Popup — курсы НБРБ и список сайтов (без OMA)

---

## Чеклист перед отправкой на модерацию

- [x] ZIP собран: `dist/udalyarah-1.6.1.zip`, в manifest **1.6.1**
- [ ] Протестированы: r.onliner (BYN), shop.by (`p.`), 5element, edostavka; регрессия kufar / ab / sila / emall
- [ ] Privacy policy URL доступен и обновлён
- [ ] Обоснование permissions скопировано из store-listing-en
- [ ] Скриншоты соответствуют текущему UI
- [ ] В описании магазина нет oma.by; есть r.onliner / edostavka при необходимости
