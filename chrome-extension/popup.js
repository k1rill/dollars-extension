const $ = (id) => document.getElementById(id);

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
    sites: { avBy: true, onlinerCatalog: true, vek21: true, ...(raw.sites || {}) },
  };
  $("inline").checked = !!s.showInline;
  $("hover").checked = !!s.showHover;
  $("showUsd").checked = s.showUsd !== false;
  $("showEur").checked = s.showEur !== false;
  $("sitesAll").checked = s.sitesAllEnabled !== false;
  $("siteAvBy").checked = s.sites.avBy !== false;
  $("siteOnliner").checked = s.sites.onlinerCatalog !== false;
  $("siteVek21").checked = s.sites.vek21 !== false;
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
      sites: {
        avBy: $("siteAvBy").checked,
        onlinerCatalog: $("siteOnliner").checked,
        vek21: $("siteVek21").checked,
      },
    },
  });
}

$("sitesAll").addEventListener("change", () => {
  syncSitePickersVisibility();
  saveSettings();
});
function ensureAtLeastOneSiteEnabled(changedId) {
  if ($("sitesAll").checked) return;
  if ($("siteAvBy").checked || $("siteOnliner").checked || $("siteVek21").checked) return;
  $(changedId).checked = true;
}

$("siteAvBy").addEventListener("change", () => {
  ensureAtLeastOneSiteEnabled("siteAvBy");
  saveSettings();
});
$("siteOnliner").addEventListener("change", () => {
  ensureAtLeastOneSiteEnabled("siteOnliner");
  saveSettings();
});
$("siteVek21").addEventListener("change", () => {
  ensureAtLeastOneSiteEnabled("siteVek21");
  saveSettings();
});

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
