const NBRB_URL = "https://api.nbrb.by/exrates/rates?periodicity=0";
const ALARM_NAME = "avfx-nbrb-refresh";
/** 6 hours — НБРБ обновляет курсы рабочие дни; реже дергаем API */
const PERIOD_MINUTES = 360;

const DEFAULT_SETTINGS = {
  showInline: true,
  showHover: true,
};

async function fetchAndStoreRates() {
  try {
    const res = await fetch(NBRB_URL);
    if (!res.ok) {
      throw new Error(`НБРБ: HTTP ${res.status}`);
    }
    const rates = await res.json();
    const usd = rates.find((r) => r.Cur_Abbreviation === "USD");
    const eur = rates.find((r) => r.Cur_Abbreviation === "EUR");
    if (!usd || !eur) {
      throw new Error("В ответе НБРБ нет USD/EUR");
    }
    /** BYN за 1 единицу иностранной валюты */
    const bynPerUsd = usd.Cur_OfficialRate / usd.Cur_Scale;
    const bynPerEur = eur.Cur_OfficialRate / eur.Cur_Scale;
    const cache = {
      bynPerUsd,
      bynPerEur,
      rateDate: usd.Date || eur.Date || null,
      fetchedAt: Date.now(),
    };
    await chrome.storage.local.set({ fxCache: cache, fxRatesError: null });
    return cache;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await chrome.storage.local.set({ fxRatesError: msg });
    throw e;
  }
}

async function ensureDefaults() {
  const data = await chrome.storage.local.get(["fxSettings"]);
  if (!data.fxSettings) {
    await chrome.storage.local.set({ fxSettings: { ...DEFAULT_SETTINGS } });
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  await ensureDefaults();
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: PERIOD_MINUTES });
  try {
    await fetchAndStoreRates();
  } catch {
    /* оставляем старый кеш или пусто */
  }
});

chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: PERIOD_MINUTES });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    fetchAndStoreRates().catch(() => {});
  }
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "REFRESH_RATES") {
    fetchAndStoreRates()
      .then((cache) => sendResponse({ ok: true, cache }))
      .catch((e) => sendResponse({ ok: false, error: e.message || String(e) }));
    return true;
  }
});
