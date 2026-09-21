# Agent instructions — Ў далярах

This repository is a **Chrome extension** (Manifest V3) that converts BYN prices to USD/EUR on Belarusian shopping sites.

## Skills (Modern Web Guidance)

Project skills from [Google Chrome Modern Web Guidance](https://developer.chrome.com/docs/extensions/ai/build-with-ai):

- `.agents/skills/chrome-extensions` — Manifest V3, Chrome APIs, Web Store publishing
- `.agents/skills/modern-web-guidance` — modern web platform best practices

Also linked under `.cursor/skills/` for Cursor discovery.

Update skills:

```bash
npx modern-web-guidance@latest update
# or
npx skills add GoogleChrome/modern-web-guidance --skill modern-web-guidance --skill chrome-extensions -y --agent cursor
```

## Chrome Web Store metadata

Whenever you are creating or making changes to a Chrome extension, create and manage a `CHROMEWEBSTORE.md` file. You can use the chrome-extensions skill to learn about the format of this file.

Canonical store copy also lives in `docs/store-listing.md`, `docs/store-listing-en.md`, and `docs/PRIVACY_POLICY.md` — keep `CHROMEWEBSTORE.md` in sync when permissions or listing text change.

## Extension layout

- Source: `chrome-extension/`
- Package for CWS: `./scripts/package-chrome-extension.sh` → `dist/udalyarah-<version>.zip`
- Release checklist: `docs/RELEASE-*.md`
