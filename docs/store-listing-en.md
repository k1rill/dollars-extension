# Chrome Web Store — English listing (U dalyarah)

## Short description (~132 characters)

`av.by prices in USD & EUR (National Bank of Belarus). Tooltip and inline conversion. No sign-in.`

*(Adjust length to fit the store form if the limit is enforced.)*

---

## Full description

**U dalyarah** (Belarusian: *Ў далярах*) shows **US dollar and euro** equivalents for prices on **av.by** and its subdomains (e.g. **cars.av.by**, **moto.av.by**).

**Features**

- Official **National Bank of the Republic of Belarus (NBRB)** exchange rates via the public NBRB API.
- Optional **hover tooltip** and/or **inline text** next to each price.
- Recognises typical BYN price formats on the site, including split DOM patterns like **“51 211 р.”**

**Privacy:** no account. Your display preferences and cached rates are stored **only on your device** in the browser. The extension does not send personal data to a developer-operated server.

---

## Screenshot ideas

- `cars.av.by` listing with inline `≈ $… · €…` next to a price.
- Dark tooltip with conversion and NBRB symbol.
- Extension popup with NBRB rates and checkboxes.

Use **1280×800** or **640×400**, PNG or JPEG.

---

## Permission justification (for the “single purpose / permissions” section)

Below is how each declared permission and host access is used in **version 1.3.0**.

### `storage` (`chrome.storage.local`)

**Used for:** saving (1) user settings — inline and/or hover display, and separately USD and/or EUR in conversions; (2) cached NBRB rates and timestamp so conversions still work briefly if the API is unreachable.

**Not used for:** tracking, advertising, or syncing data to external servers. Data stays in the user’s browser profile.

---

### `alarms` (`chrome.alarms`)

**Used for:** scheduling periodic refresh of exchange rates in the background service worker (e.g. every few hours), so the user does not need to open the popup to update rates.

**Not used for:** waking the device for unrelated tasks or third-party analytics.

---

### Host permission: `https://av.by/*`

**Used for:** injecting the **content script** on the main av.by site so prices can be detected and USD/EUR equivalents shown; applying bundled styles including the **NBRB icon font** for the BYN symbol where shown.

---

### Host permission: `https://*.av.by/*`

**Used for:** the same content script and styles on **all av.by subdomains** (e.g. **cars.av.by**, **moto.av.by**). Listing pages often live on subdomains, not only on `av.by`.

---

### Host permission: `https://api.nbrb.by/*`

**Used for:** the **background service worker** to **fetch** official daily USD/EUR vs BYN rates from the National Bank’s API. No user browsing history is sent to NBRB — only a standard HTTP request for public exchange-rate data.

---

### Related (not separate permissions, but reviewers sometimes ask)

**BYR/BYN glyph:** the official **NBRB icon font** files under `fonts/` are bundled and listed in **`web_accessible_resources`** so pages on av.by can load them for `@font-face` (private-use glyph `\e901`), drawn as text rather than a remote image.

**Content scripts** are matched to `https://av.by/*` and `https://*.av.by/*` in `manifest.json`; host permissions above align with those patterns.

---

## Privacy policy URL

Host the English text from **[docs/PRIVACY_POLICY.md](PRIVACY_POLICY.md)** on a public URL (e.g. GitHub raw link or GitHub Pages) and paste it into the Chrome Web Store privacy field.

---

## ZIP package

Run **`./scripts/package-chrome-extension.sh`** from the repository root; upload **`dist/udalyarah-<version>.zip`**. The archive root must contain `manifest.json` (not a nested folder). See **[README.md](../README.md)**.
