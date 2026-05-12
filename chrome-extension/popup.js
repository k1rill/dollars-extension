const $ = (id) => document.getElementById(id);

/** Inline SVG — колер як у тэксту (.meta) праз currentColor, без розніцы з #111827 у файле */
function bynIconImg() {
  return `<svg class="popup-byn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360.67 446.4" aria-hidden="true"><path fill="currentColor" d="M475.61,528.84c0-72.5-62.75-131.27-140.16-131.27H227.58V263.37H426v-49.6H178v290h-63.1v49.7H178V660.17h49.54l107.92-.07c77.36,0,140.11-58.77,140.11-131.26Zm-248-25.1V447.1c35.89,0,72.35.07,107.87.07,50,0,90.56,36.57,90.56,81.67s-40.54,81.67-90.56,81.7l-107.87,0V553.44h112.7v-49.7Z" transform="translate(-114.94 -213.77)"/></svg>`;
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
  const s = data.fxSettings || {
    showInline: true,
    showHover: true,
  };
  $("inline").checked = !!s.showInline;
  $("hover").checked = !!s.showHover;

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

async function saveSettings() {
  await chrome.storage.local.set({
    fxSettings: {
      showInline: $("inline").checked,
      showHover: $("hover").checked,
    },
  });
}

$("inline").addEventListener("change", saveSettings);
$("hover").addEventListener("change", saveSettings);

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
