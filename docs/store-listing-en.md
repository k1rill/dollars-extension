# Chrome Web Store — English listing (U dalyarah)

## Short description (~132 characters)

`av.by, Onliner & 21vek.by prices in USD/EUR (NBRB). Tooltip and inline conversion.`

*(Adjust length to fit the store form if the limit is enforced.)*

---

## Full description

**U dalyarah** (Belarusian: *Ў далярах*) shows **US dollar and euro** equivalents for BYN prices on **av.by** and subdomains (e.g. **cars.av.by**), **catalog.onliner.by**, and **21vek.by**.

**Features**

- Official **National Bank of the Republic of Belarus (NBRB)** exchange rates via the public NBRB API.
- Optional **hover tooltip** and/or **inline text** next to each price; show **USD**, **EUR**, or both.
- Per-site toggles: all supported sites or individual enablement (av.by, Onliner catalog, 21vek).
- Recognises BYN formats such as **“51 211 р.”**, **“2390,00 ƃ”**, **“1 167,29 р.”**, including split DOM layouts on product pages.

**Privacy:** no account. Your display preferences and cached rates are stored **only on your device** in the browser. The extension does not send personal data to a developer-operated server.

---

## Screenshot ideas

- `cars.av.by` listing with inline `≈ $… · €…` next to a price.
- `catalog.onliner.by` product or prices table.
- `21vek.by` product page with conversion.
- Extension popup: NBRB rates, site toggles, USD/EUR options.

Use **1280×800** or **640×400**, PNG or JPEG.

---

## Permission justification (for the “single purpose / permissions” section)

Below is how each declared permission and host access is used in **version 1.4.0**.

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

### Host permission: `https://catalog.onliner.by/*`

**Used for:** the same **content script** on the **Onliner product catalog** (BYN prices with **ƃ**, listing and product pages including price tables).

---

### Host permission: `https://www.21vek.by/*` and `https://21vek.by/*`

**Used for:** the same **content script** on **21vek.by** so BYN prices (e.g. **“1 167,29 р.”**, including split markup on product pages) can be converted.

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

Upload **`dist/udalyarah-1.4.0.zip`**. See **[RELEASE-1.4.0.md](RELEASE-1.4.0.md)** for a release checklist.
