const $ = (id) => document.getElementById(id);

const DEFAULT_SITES = {
  avBy: true,
  onlinerCatalog: true,
  vek21: true,
  kufar: true,
  shopBy: true,
  sila: true,
  element5: true,
  ozBy: true,
  emall: true,
  edostavka: true,
};

/** id чекбокса → ключ в fxSettings.sites */
const SITE_CHECKBOXES = [
  ["siteAvBy", "avBy"],
  ["siteOnliner", "onlinerCatalog"],
  ["siteVek21", "vek21"],
  ["siteKufar", "kufar"],
  ["siteShopBy", "shopBy"],
  ["siteSila", "sila"],
  ["siteElement5", "element5"],
  ["siteOzBy", "ozBy"],
  ["siteEmall", "emall"],
  ["siteEdostavka", "edostavka"],
];

/** Знак BYN праз іканачны шрыфт НБРБ (\e901), колер як у тэксту (.meta) */
function bynIconImg() {
  return `<span class="popup-nbrb-icon" aria-hidden="true"></span>`;
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("ru-BY", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatFetched(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("ru-BY", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function readSitesFromUi() {
  const sites = {};
  for (const [checkboxId, key] of SITE_CHECKBOXES) {
    sites[key] = $(checkboxId).checked;
  }
  return sites;
}

function anySiteChecked() {
  return SITE_CHECKBOXES.some(([checkboxId]) => $(checkboxId).checked);
}

async function loadState() {
  const data = await chrome.storage.local.get([
    "fxSettings",
    "fxCache",
    "fxRatesError",
  ]);
  const raw = data.fxSettings || {};
  const s = {
    showInline: true,
    showHover: true,
    showUsd: true,
    showEur: true,
    sitesAllEnabled: true,
    ...raw,
    sites: { ...DEFAULT_SITES, ...(raw.sites || {}) },
  };
  $("inline").checked = !!s.showInline;
  $("hover").checked = !!s.showHover;
  $("showUsd").checked = s.showUsd !== false;
  $("showEur").checked = s.showEur !== false;
  $("sitesAll").checked = s.sitesAllEnabled !== false;
  for (const [checkboxId, key] of SITE_CHECKBOXES) {
    $(checkboxId).checked = s.sites[key] !== false;
  }
  syncSitePickersVisibility();

  const status = $("status");
  const errEl = $("err");
  const cache = data.fxCache;
  const err = data.fxRatesError;

  if (cache) {
    status.innerHTML = [
      `Курс НБРБ на ${formatDate(cache.rateDate)}.`,
      `Обновлено: ${formatFetched(cache.fetchedAt)}.`,
      `1 USD = ${cache.bynPerUsd.toFixed(4)} ${bynIconImg()}, 1 EUR = ${cache.bynPerEur.toFixed(4)} ${bynIconImg()}.`,
    ].join(" ");
    errEl.hidden = true;
  } else {
    status.textContent =
      "Курсы ещё не загружены. Нажмите «Обновить курсы НБРБ» или откройте страницу позже.";
  }

  if (err && !cache) {
    errEl.textContent = err;
    errEl.hidden = false;
  }
}

function syncSitePickersVisibility() {
  const all = $("sitesAll").checked;
  $("sitePickers").hidden = all;
}

async function saveSettings() {
  const cur = await chrome.storage.local.get("fxSettings");
  const prev = cur.fxSettings || {};
  await chrome.storage.local.set({
    fxSettings: {
      ...prev,
      showInline: $("inline").checked,
      showHover: $("hover").checked,
      showUsd: $("showUsd").checked,
      showEur: $("showEur").checked,
      sitesAllEnabled: $("sitesAll").checked,
      sites: readSitesFromUi(),
    },
  });
}

$("sitesAll").addEventListener("change", () => {
  syncSitePickersVisibility();
  saveSettings();
});

function ensureAtLeastOneSiteEnabled(changedId) {
  if ($("sitesAll").checked) return;
  if (anySiteChecked()) return;
  $(changedId).checked = true;
}

for (const [checkboxId] of SITE_CHECKBOXES) {
  $(checkboxId).addEventListener("change", () => {
    ensureAtLeastOneSiteEnabled(checkboxId);
    saveSettings();
  });
}

$("inline").addEventListener("change", saveSettings);
$("hover").addEventListener("change", saveSettings);

$("showUsd").addEventListener("change", () => {
  if (!$("showUsd").checked && !$("showEur").checked) $("showEur").checked = true;
  saveSettings();
});
$("showEur").addEventListener("change", () => {
  if (!$("showUsd").checked && !$("showEur").checked) $("showUsd").checked = true;
  saveSettings();
});

$("refresh").addEventListener("click", async () => {
  const btn = $("refresh");
  btn.disabled = true;
  $("err").hidden = true;
  $("status").textContent = "Запрос к НБРБ…";
  try {
    const res = await chrome.runtime.sendMessage({ type: "REFRESH_RATES" });
    if (res?.ok) {
      await loadState();
    } else {
      $("err").textContent = res?.error || "Не удалось обновить";
      $("err").hidden = false;
      await loadState();
    }
  } catch (e) {
    $("err").textContent = e.message || String(e);
    $("err").hidden = false;
    await loadState();
  } finally {
    btn.disabled = false;
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (changes.fxCache || changes.fxRatesError || changes.fxSettings) {
    loadState();
  }
});

loadState();
