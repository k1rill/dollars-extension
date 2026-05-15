# Privacy Policy — «Ў далярах» (Chrome extension)

**Last updated:** May 15, 2026

## Summary

The extension **«Ў далярах»** («U dalyarah») helps you see prices on **av.by**, **catalog.onliner.by**, and **21vek.by** converted to **USD** and **EUR** using official exchange rates from the **National Bank of the Republic of Belarus (NBRB)**.

## Data we collect

We **do not** collect, store, or transmit personal data to the extension developer.

## What stays on your device

The extension uses **Chrome’s local storage** (`chrome.storage.local`) only on your computer to save:

- Your display preferences (e.g. show inline conversion and/or hover tooltip, USD/EUR toggles, enabled sites).
- Cached NBRB exchange rates and the time they were fetched.

This information **never leaves your device** except as described under “Network requests”.

## Network requests

The extension may connect to:

1. **https://api.nbrb.by** — to download official daily exchange rates (USD/EUR vs BYN).
2. **https://av.by**, **https://\*.av.by**, **https://catalog.onliner.by**, **https://www.21vek.by**, and **https://21vek.by** — only as web pages you open in your browser; the extension injects scripts to read visible prices and show conversions. **No price data is sent to us.**

There is **no** backend server operated by the extension author for collecting user data.

## Permissions

- **storage** — save settings and cached rates locally.
- **alarms** — refresh cached rates periodically.
- **Host access** — av.by, catalog.onliner.by, 21vek.by (to run on pages you visit) and api.nbrb.by (to fetch rates).

## Contact

If you have questions about this policy, open an issue in the extension’s source repository or use the contact email listed on the Chrome Web Store listing (when provided).

## Changes

We may update this policy if the extension’s behaviour changes. The «Last updated» date will be revised accordingly.
