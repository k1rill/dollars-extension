(() => {
  /**
   * У контэнт-скрыптаў Chrome адносныя url() ў CSS часта рэзолвяцца адносна старонкі (av.by),
   * а не пакета — шрыфт не падцягваецца. Пупап бярэ chrome-extension://, там усё ОК.
   */
  (function injectNbrbFontFace() {
    if (document.getElementById("avfx-nbrb-font-face")) return;
    const style = document.createElement("style");
    style.id = "avfx-nbrb-font-face";
    const w2 = chrome.runtime.getURL("fonts/nbrb.woff2");
    const woff = chrome.runtime.getURL("fonts/nbrb.woff");
    const ttf = chrome.runtime.getURL("fonts/nbrb.ttf");
    /* Пробел перад format() абавязковы — інакш src можа разабрацца як несапраўдны */
    style.textContent = `@font-face {
      font-family: "nbrb";
      src:
        url("${w2}") format("woff2"),
        url("${woff}") format("woff"),
        url("${ttf}") format("truetype");
      font-weight: normal;
      font-style: normal;
      font-display: block;
    }`;
    (document.head || document.documentElement).appendChild(style);
  })();

  /**
   * Полная строка в одном текстовом узле: «51 211 р.», Br, BYN…
   */
  const PRICE_RE =
    /(\d[\d\s\u00A0]*(?:[.,]\d{1,2})?)\s*(Br|руб\.?|р\.|BYN|бел\.?\s*руб\.?)(?!\w)/giu;

  /**
   * av.by (Next.js): отдельный узел только с «р.» — число в соседнем <span>
   * Пример: <span>16 788</span><!-- -->р.
   */
  const RUB_SUFFIX_TEXT_RE = /^\s*р\.\s*$/u;

  const DEFAULTS = {
    showInline: true,
    showHover: true,
    showUsd: true,
    showEur: true,
  };

  let settings = { ...DEFAULTS };
  let cache = null;
  let tooltipEl = null;
  let debounceTimer = null;
  let hideTooltipTimer = null;
  /** Пасля сыходу з кнопкі/хука — хаваць не адразу (без глабальнага pointermove: менш збояў) */
  const TOOLTIP_HIDE_MS = 550;

  function cancelScheduledHideTooltip() {
    if (hideTooltipTimer !== null) {
      clearTimeout(hideTooltipTimer);
      hideTooltipTimer = null;
    }
  }

  function scheduleHideTooltip() {
    cancelScheduledHideTooltip();
    hideTooltipTimer = window.setTimeout(() => {
      hideTooltipTimer = null;
      hideTooltipImmediate();
    }, TOOLTIP_HIDE_MS);
  }

  function onDocumentElementMouseLeave(ev) {
    if (ev.target !== document.documentElement) return;
    if (tooltipEl?.classList.contains("avfx-visible")) hideTooltipImmediate();
  }

  function hideTooltipImmediate() {
    cancelScheduledHideTooltip();
    if (tooltipEl) tooltipEl.classList.remove("avfx-visible");
  }

  function getTooltip() {
    if (!tooltipEl) {
      tooltipEl = document.createElement("div");
      tooltipEl.id = "avfx-tooltip-host";
      tooltipEl.className = "avfx";
      tooltipEl.setAttribute("role", "tooltip");
      document.documentElement.appendChild(tooltipEl);
    }
    return tooltipEl;
  }

  function hideTooltip() {
    hideTooltipImmediate();
  }

  /** Падказка прывязана да блоку цэны, не да курсора — менш мігатання на кнопках і ў картачках */
  function positionTooltipAnchored(hook) {
    const tt = getTooltip();
    const margin = 8;
    const gap = 8;
    tt.style.visibility = "hidden";
    tt.classList.add("avfx-visible");
    const w = tt.offsetWidth;
    const h = tt.offsetHeight;
    const rect = hook.getBoundingClientRect();
    let left = rect.left + rect.width / 2 - w / 2;
    let top = rect.bottom + gap;
    left = Math.max(margin, Math.min(left, window.innerWidth - w - margin));
    if (top + h > window.innerHeight - margin) {
      top = rect.top - h - gap;
    }
    if (top < margin) top = margin;
    tt.style.left = `${Math.round(left)}px`;
    tt.style.top = `${Math.round(top)}px`;
    tt.style.visibility = "";
  }

  function formatConverted(usd, eur) {
    let showUsd = settings.showUsd !== false;
    let showEur = settings.showEur !== false;
    if (!showUsd && !showEur) showUsd = showEur = true;
    const parts = [];
    if (showUsd) {
      parts.push(
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(usd),
      );
    }
    if (showEur) {
      parts.push(
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "EUR",
          maximumFractionDigits: 0,
        }).format(eur),
      );
    }
    return parts.join(" · ");
  }

  function convert(byn) {
    if (!cache || !cache.bynPerUsd || !cache.bynPerEur) return null;
    return {
      usd: byn / cache.bynPerUsd,
      eur: byn / cache.bynPerEur,
    };
  }

  function insideAvfx(node) {
    let el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    while (el) {
      if (el.classList?.contains("avfx")) return true;
      const tag = el.tagName;
      if (
        tag === "SCRIPT" ||
        tag === "STYLE" ||
        tag === "TEXTAREA" ||
        tag === "NOSCRIPT"
      ) {
        return true;
      }
      el = el.parentElement;
    }
    return false;
  }

  function parseAmount(raw) {
    const s = raw.replace(/[\s\u00A0]/g, "").replace(",", ".");
    const n = parseFloat(s);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  function depth(node) {
    let d = 0;
    let el = node.parentElement;
    while (el) {
      d += 1;
      el = el.parentElement;
    }
    return d;
  }

  function collectTextNodes(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const out = [];
    let n;
    while ((n = walker.nextNode())) {
      if (!insideAvfx(n)) out.push(n);
    }
    out.sort((a, b) => depth(b) - depth(a));
    return out;
  }

  /** Узлы текста, которые совпадают только с кириллическим «р.» (суффикс av.by) */
  function collectRubSuffixTextNodes(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const out = [];
    let n;
    while ((n = walker.nextNode())) {
      if (insideAvfx(n)) continue;
      const t = n.nodeValue;
      if (t && RUB_SUFFIX_TEXT_RE.test(t)) out.push(n);
    }
    out.sort((a, b) => depth(b) - depth(a));
    return out;
  }

  function decoratePriceHook(hook, amount) {
    const showInline = settings.showInline;
    const showHover = settings.showHover;
    if (!showInline && !showHover) return;

    const conv = convert(amount);

    if (showInline) {
      const inline = document.createElement("span");
      inline.className = "avfx-inline avfx";
      inline.textContent = conv
        ? `(≈ ${formatConverted(conv.usd, conv.eur)})`
        : "(курсы НБРБ недоступны)";
      hook.appendChild(inline);
    }

    if (showHover) {
      /* Не толькі span з цаной: у card__price-button вялікі padding — злева/справа курсор у кнопцы, але не над .avfx-hook */
      const hoverEl =
        hook.closest("button, a, [role='button']") || hook;
      hoverEl.addEventListener("mouseenter", () => {
        cancelScheduledHideTooltip();
        const c = convert(amount);
        const tt = getTooltip();
        if (c) {
          tt.innerHTML = `≈ <strong>${formatConverted(c.usd, c.eur)}</strong>`;
        } else {
          tt.textContent = cache
            ? "Не удалось вычислить конвертацию"
            : "Курсы НБРБ ещё не загружены";
        }
        tt.classList.add("avfx-visible");
        positionTooltipAnchored(hook);
      });
      hoverEl.addEventListener("mouseleave", scheduleHideTooltip);
    }
  }

  function teardown() {
    hideTooltipImmediate();
    document.querySelectorAll(".avfx-inline").forEach((el) => el.remove());
    document.querySelectorAll(".avfx-hook").forEach((hook) => {
      const pt = hook.querySelector(".avfx-price-text");
      const text = pt ? pt.textContent : hook.textContent;
      hook.replaceWith(document.createTextNode(text));
    });
    const tt = document.getElementById("avfx-tooltip-host");
    if (tt) tt.remove();
    tooltipEl = null;
  }

  /**
   * Оборачивает блок «<span>число</span> … р.» из нескольких узлов.
   */
  function processSplitRubSuffix(currencyTextNode) {
    if (!currencyTextNode.parentNode || insideAvfx(currencyTextNode)) return;
    const parent = currencyTextNode.parentElement;
    if (!parent) return;

    let cur = currencyTextNode.previousSibling;
    while (
      cur &&
      (cur.nodeType === Node.COMMENT_NODE ||
        (cur.nodeType === Node.TEXT_NODE && !(cur.nodeValue || "").trim()))
    ) {
      cur = cur.previousSibling;
    }
    if (!cur) return;

    let numText = "";
    if (cur.nodeType === Node.ELEMENT_NODE) {
      numText = cur.textContent || "";
    } else if (cur.nodeType === Node.TEXT_NODE) {
      numText = cur.nodeValue || "";
    } else {
      return;
    }

    const amount = parseAmount(numText.trim());
    if (!amount) return;

    const priceText = document.createElement("span");
    priceText.className = "avfx-price-text";
    while (parent.firstChild) {
      priceText.appendChild(parent.firstChild);
    }

    const hook = document.createElement("span");
    hook.className = "avfx-hook avfx";
    hook.appendChild(priceText);
    parent.appendChild(hook);

    decoratePriceHook(hook, amount);
  }

  function processTextNode(textNode) {
    if (!textNode.parentNode || insideAvfx(textNode)) return;

    const text = textNode.nodeValue;
    if (!text) return;

    const matches = [...text.matchAll(PRICE_RE)];
    if (matches.length === 0) return;

    if (!settings.showInline && !settings.showHover) return;

    const frag = document.createDocumentFragment();
    let lastIndex = 0;

    for (const m of matches) {
      frag.appendChild(document.createTextNode(text.slice(lastIndex, m.index)));
      const amount = parseAmount(m[1]);
      lastIndex = m.index + m[0].length;

      if (!amount) {
        frag.appendChild(document.createTextNode(m[0]));
        continue;
      }

      const hook = document.createElement("span");
      hook.className = "avfx-hook avfx";

      const priceText = document.createElement("span");
      priceText.className = "avfx-price-text";
      priceText.textContent = m[0];
      hook.appendChild(priceText);

      decoratePriceHook(hook, amount);

      frag.appendChild(hook);
    }

    frag.appendChild(document.createTextNode(text.slice(lastIndex)));
    textNode.parentNode.replaceChild(frag, textNode);
  }

  function run() {
    if (!settings.showInline && !settings.showHover) {
      teardown();
      return;
    }

    const suffixNodes = collectRubSuffixTextNodes(document.body);
    for (const node of suffixNodes) {
      if (!node.isConnected) continue;
      processSplitRubSuffix(node);
    }

    const quick = /Br|руб|BYN|р\./i;
    const nodes = collectTextNodes(document.body);
    for (const node of nodes) {
      if (!node.isConnected) continue;
      if (insideAvfx(node)) continue;
      const t = node.nodeValue;
      if (!t || !quick.test(t)) continue;
      processTextNode(node);
    }
  }

  function onStorageChange(changes, area) {
    if (area !== "local") return;
    if (changes.fxCache) {
      cache = changes.fxCache.newValue ?? null;
      teardown();
      run();
      return;
    }
    if (changes.fxSettings) {
      settings = {
        ...DEFAULTS,
        ...(changes.fxSettings.newValue || {}),
      };
      teardown();
      run();
    }
  }

  async function init() {
    const data = await chrome.storage.local.get(["fxCache", "fxSettings"]);
    cache = data.fxCache ?? null;
    settings = { ...DEFAULTS, ...data.fxSettings };
  }

  function onMutation() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => run(), 200);
  }

  window.addEventListener(
    "scroll",
    () => hideTooltipImmediate(),
    { capture: true, passive: true },
  );

  document.documentElement.addEventListener(
    "mouseleave",
    onDocumentElementMouseLeave,
  );

  init().then(() => {
    run();
    const mo = new MutationObserver(onMutation);
    mo.observe(document.documentElement, { childList: true, subtree: true });
  });

  chrome.storage.onChanged.addListener(onStorageChange);
})();
