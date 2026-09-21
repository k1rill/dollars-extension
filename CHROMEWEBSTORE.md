# Chrome Web Store Listing — Ў далярах

> Last Updated: 2026-09-21

## Store Listing

**Extension Name** [REQUIRED]
Ў далярах

**Short Description** [REQUIRED]
Цены BYN в USD/EUR (НБ РБ) на Onliner, Kufar, 21vek, av.by и др.

**Detailed Description** [REQUIRED]
Ў далярах shows US dollar and euro equivalents for BYN prices on popular Belarusian sites: av.by (and subdomains), Onliner (catalog, auto, classifieds, real estate), 21vek.by, Kufar, Shop.by, Elektrosila, 5 element, OZ.by, Emall, and edostavka.

Uses official National Bank of Belarus (NBRB) exchange rates. Optional hover tooltip and/or inline text next to each price; show USD, EUR, or both. Per-site toggles: all supported sites or individual enablement. Recognises common BYN formats including split page layouts.

No account required. Display preferences and cached rates stay on your device in the browser. The extension does not send personal data to a developer-operated server.

**Category** [REQUIRED]
Shopping

**Single Purpose** [REQUIRED]
Show USD and EUR equivalents for BYN prices on Belarusian shopping and classifieds sites using official NBRB rates.

**Primary Language** [REQUIRED]
Russian (listing also available in English; UI primarily Russian/Belarusian)

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | chrome-extension/icons/icon128.png |
| Screenshot 1 [REQUIRED] | 1280×800 or 640×400 | 🟡 Needs update | |
| Screenshot 2 [RECOMMENDED] | 1280×800 or 640×400 | 🟡 Needs update | |
| Screenshot 3 [RECOMMENDED] | 1280×800 or 640×400 | ⬜ Not created | |
| Screenshot 4 | 1280×800 or 640×400 | ⬜ Not created | |
| Small Promo Tile [RECOMMENDED] | 440×280 | ⬜ Not created | |
| Marquee Promo Tile | 1400×560 | ⬜ Not created | |

### Screenshot Notes
1. kufar.by or cars.av.by — inline ≈ $… · €…
2. r.onliner.by or ab.onliner.by — ƃ price
3. 5element.by / shop.by / edostavka.by
4. Popup — NBRB rates and site toggles

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| storage | permissions | Save display settings (inline/hover, USD/EUR, per-site enablement) and cache NBRB rates locally so conversions still work briefly if the API is unreachable. Data stays in the browser profile. |
| alarms | permissions | Periodically refresh NBRB exchange rates in the background service worker so the user does not need to open the popup to update rates. |
| https://*.av.by/* | host_permissions | Inject the content script on av.by and subdomains to detect BYN prices and show USD/EUR equivalents. |
| https://catalog.onliner.by/* | host_permissions | Content script on Onliner product catalog (BYN with ƃ, listings and price tables). |
| https://ab.onliner.by/* | host_permissions | Content script on Onliner auto marketplace. |
| https://baraholka.onliner.by/* | host_permissions | Content script on Onliner classifieds. |
| https://r.onliner.by/* | host_permissions | Content script on Onliner real estate when prices are shown in BYN (ƃ). |
| https://www.21vek.by/* | host_permissions | Content script on 21vek.by product pages (including split BYN price markup). |
| https://21vek.by/* | host_permissions | Same as www.21vek.by for non-www host. |
| https://www.kufar.by/* | host_permissions | Content script on Kufar classifieds to convert BYN prices. |
| https://kufar.by/* | host_permissions | Same for non-www Kufar host. |
| https://shop.by/* | host_permissions | Content script on Shop.by price comparison pages. |
| https://www.shop.by/* | host_permissions | Same for www Shop.by host. |
| https://sila.by/* | host_permissions | Content script on Elektrosila (sila.by). |
| https://www.sila.by/* | host_permissions | Same for www sila.by. |
| https://5element.by/* | host_permissions | Content script on 5 element; detects prices marked with NBRB BYN icon. |
| https://www.5element.by/* | host_permissions | Same for www 5element.by. |
| https://oz.by/* | host_permissions | Content script on OZ.by. |
| https://www.oz.by/* | host_permissions | Same for www oz.by. |
| https://emall.by/* | host_permissions | Content script on Emall. |
| https://www.emall.by/* | host_permissions | Same for www emall.by. |
| https://edostavka.by/* | host_permissions | Content script on edostavka.by grocery prices (ƃ). |
| https://www.edostavka.by/* | host_permissions | Same for www edostavka.by. |
| https://e-dostavka.by/* | host_permissions | Alternate edostavka host spelling. |
| https://www.e-dostavka.by/* | host_permissions | www variant of e-dostavka.by. |
| https://api.nbrb.by/* | host_permissions | Background fetch of official daily USD/EUR vs BYN rates from the National Bank API. No browsing history is sent — only a standard HTTP request for public rate data. |

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** No

The extension does not collect, store, or transmit personal data to the developer. Preferences and cached rates stay in `chrome.storage.local` on the user’s device. Network access is limited to api.nbrb.by (rates) and supported pages the user opens (content scripts for on-page conversion).

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

## Privacy Policy

**Privacy Policy URL** [REQUIRED]
Host `docs/PRIVACY_POLICY.md` at a public HTTPS URL (e.g. GitHub raw / Pages) and paste into the CWS form.
Source: docs/PRIVACY_POLICY.md (last updated 2026-09-21)

## Distribution

**Visibility**: Public
**Regions**: All regions (primary audience: Belarus)

## Developer Info

**Publisher Name** [REQUIRED]
<!-- Fill in publisher name from Chrome Web Store account -->

**Contact Email** [REQUIRED]
<!-- Fill in public CWS contact email -->

**Support URL / Email** [RECOMMENDED]
https://github.com/k1rill/dollars-extension/issues

**Homepage URL** [RECOMMENDED]
https://github.com/k1rill/dollars-extension

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.6.1 | 2026-09-21 | r.onliner; shop.by Latin p.; 5element NBRB icon; edostavka.by host; remove oma.by | Draft |
| 1.6.0 | 2026-09-13 | Wave 1–2 sites: Onliner ab/baraholka, Kufar, Shop, Sila, 5element, OZ, Emall, e-dostavka | Draft |

## Review Notes

### Known Issues / Limitations
- realt.by not supported (listings often already in USD / multi-currency).
- On r.onliner.by, conversion applies to BYN (`ƃ`) prices; USD mode is left alone.
- Wildberries / Ozon not in scope.

### Rejection History
<!-- none yet -->
