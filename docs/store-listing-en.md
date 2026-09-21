# Chrome Web Store — English listing (U dalyarah)

## Short description (~132 characters)

`BYN prices in USD/EUR (NBRB) on Onliner, Kufar, 21vek, av.by and more.`

*(Adjust length to fit the store form if the limit is enforced.)*

---

## Full description

**U dalyarah** (Belarusian: *Ў далярах*) shows **US dollar and euro** equivalents for BYN prices on popular Belarusian sites:

- **av.by** and subdomains (e.g. **cars.av.by**)
- **Onliner:** product catalog, auto (**ab.onliner.by**), classifieds (baraholka), real estate (**r.onliner.by**)
- **21vek.by**, **Kufar**, **Shop.by**, **Elektrosila**, **5 element**, **OZ.by**, **Emall**, **e-dostavka / edostavka.by**

**Features**

- Official **National Bank of the Republic of Belarus (NBRB)** exchange rates via the public NBRB API.
- Optional **hover tooltip** and/or **inline text** next to each price; show **USD**, **EUR**, or both.
- Per-site toggles: all supported sites or individual enablement.
- Recognises BYN formats such as **“51 211 р.”**, **“2390,00 ƃ”**, **“1 167,29 р.”**, including split DOM layouts on product pages.

**Privacy:** no account. Your display preferences and cached rates are stored **only on your device** in the browser. The extension does not send personal data to a developer-operated server.

---

## Screenshot ideas

- `cars.av.by` or `kufar.by` listing with inline `≈ $… · €…`.
- `catalog.onliner.by` or `ab.onliner.by` with ƃ prices.
- Product page on `21vek.by` / `sila.by` / `shop.by`.
- Extension popup: NBRB rates, site toggles, USD/EUR options.

Use **1280×800** or **640×400**, PNG or JPEG.

---

## Permission justification (for the “single purpose / permissions” section)

Below is how each declared permission and host access is used in **version 1.6.1**.

### `storage` (`chrome.storage.local`)

**Used for:** saving (1) user settings — inline and/or hover display, USD and/or EUR, per-site enablement; (2) cached NBRB rates and timestamp so conversions still work briefly if the API is unreachable.

**Not used for:** tracking, advertising, or syncing data to external servers. Data stays in the user’s browser profile.

---

### `alarms` (`chrome.alarms`)

**Used for:** scheduling periodic refresh of exchange rates in the background service worker (e.g. every few hours), so the user does not need to open the popup to update rates.

**Not used for:** waking the device for unrelated tasks or third-party analytics.

---

### Host permission: `https://*.av.by/*`

**Used for:** injecting the **content script** on av.by and subdomains so prices can be detected and USD/EUR equivalents shown.

---

### Host permissions: Onliner (`catalog.onliner.by`, `ab.onliner.by`, `baraholka.onliner.by`, `r.onliner.by`)

**Used for:** the same **content script** on Onliner catalog, auto marketplace, classifieds, and real estate (BYN prices with **ƃ** or **р.**; on `r.onliner.by` typically when currency is set to BYN).

---

### Host permission: `https://www.21vek.by/*` and `https://21vek.by/*`

**Used for:** the same **content script** on **21vek.by** so BYN prices (e.g. **“1 167,29 р.”**, including split markup on product pages) can be converted.

---

### Host permissions: `kufar.by`, `shop.by`, `sila.by`, `5element.by`, `oz.by`, `emall.by`, `edostavka.by` / `e-dostavka.by` (incl. `www.` where used)

**Used for:** injecting the **content script** on these Belarusian retail / classifieds / grocery sites to detect BYN prices and show USD/EUR equivalents. No browsing history or price data is sent to the developer.

---

### Host permission: `https://api.nbrb.by/*`

**Used for:** the **background service worker** to **fetch** official daily USD/EUR vs BYN rates from the National Bank’s API. No user browsing history is sent to NBRB — only a standard HTTP request for public exchange-rate data.

---

### Related (not separate permissions, but reviewers sometimes ask)

**BYR/BYN glyph:** the official **NBRB icon font** files under `fonts/` are bundled and listed in **`web_accessible_resources`** so supported pages can load them for `@font-face` when needed (private-use glyph `\e901`).

**Content scripts** are matched to the host patterns above in `manifest.json`; host permissions align with those patterns.

---

## Privacy policy URL

Host the English text from **[docs/PRIVACY_POLICY.md](PRIVACY_POLICY.md)** on a public URL (e.g. GitHub raw link or GitHub Pages) and paste it into the Chrome Web Store privacy field.

---

## ZIP package

```bash
./scripts/package-chrome-extension.sh
```

Upload **`dist/udalyarah-1.6.1.zip`**. See **[RELEASE-1.6.1.md](RELEASE-1.6.1.md)** for a release checklist.
