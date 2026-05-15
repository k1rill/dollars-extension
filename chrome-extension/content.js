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
    /(\d[\d\s\u00A0]*(?:[.,]\d{1,2})?)\s*(Br|руб\.?|р\.|BYN|бел\.?\s*руб\.?|ƃ)(?!\w)/giu;

  /**
   * av.by / catalog.onliner.by: валюта в отдельном текстовом узле, число — в соседнем
   * Примеры: <span>16 788</span><!-- -->р. · <span>2390,00</span> ƃ
   */
  const CURRENCY_SUFFIX_TEXT_RE = /^\s*(?:р\.|ƃ)\s*$/u;

  /** Onliner карточка: <motion>2390</motion><motion>,00 ƃ</motion> — дробная часть и ƃ во втором блоке */
  const ONLINER_FRACTION_SUFFIX_TEXT_RE = /^\s*,\d{1,2}\s*ƃ\s*$/u;

  /** 21vek и др.: <span>1 167,</span><span>29 р.</span> или <span>,29 р.</span> */
  const RUB_FRACTION_COMMA_SUFFIX_TEXT_RE = /^\s*,\d{1,2}\s*р\.\s*$/u;
  const RUB_FRACTION_CENTS_SUFFIX_TEXT_RE = /^\s*\d{1,2}\s*р\.\s*$/u;

  const DEFAULTS = {
    showInline: true,
    showHover: true,
    showUsd: true,
    showEur: true,
    sitesAllEnabled: true,
    sites: { avBy: true, onlinerCatalog: true, vek21: true },
  };

  function getCurrentSiteId() {
    const h = location.hostname;
    if (h === "catalog.onliner.by") return "onlinerCatalog";
    if (h === "www.21vek.by" || h === "21vek.by") return "vek21";
    if (h === "av.by" || h.endsWith(".av.by")) return "avBy";
    return null;
  }

  function isEnabledForCurrentSite(s) {
    const id = getCurrentSiteId();
    if (!id) return false;
    if (s.sitesAllEnabled !== false) return true;
    const sites = s.sites || {};
    if (id === "avBy") return sites.avBy !== false;
    if (id === "onlinerCatalog") return sites.onlinerCatalog !== false;
    if (id === "vek21") return sites.vek21 !== false;
    return false;
  }

  function normalizeSettings(raw) {
    return {
      ...DEFAULTS,
      ...raw,
      sites: { ...DEFAULTS.sites, ...(raw?.sites || {}) },
    };
  }

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
    const s = raw
      .replace(/[\s\u00A0\u202F\u2009]/g, "")
      .replace(",", ".");
    const n = parseFloat(s);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  function nodeTextContent(node) {
    if (!node) return "";
    if (node.nodeType === Node.ELEMENT_NODE) return node.textContent || "";
    if (node.nodeType === Node.TEXT_NODE) return node.nodeValue || "";
    return "";
  }

  function gatherTextBeforeElement(container, beforeEl) {
    let s = "";
    for (const child of container.childNodes) {
      if (child === beforeEl) break;
      s += nodeTextContent(child);
    }
    return s;
  }

  /** Склеить «1 167,»+«29 р.» або «1 167»+«,29 р.» → «1 167,29» */
  function combineSplitRubParts(numText, fractionPart) {
    const frac = (fractionPart || "").trim();
    const intPart = (numText || "").trim();
    if (!frac) return null;

    if (RUB_FRACTION_COMMA_SUFFIX_TEXT_RE.test(frac)) {
      return `${intPart}${frac}`;
    }

    const cents = frac.match(/^(\d{1,2})\s*р\.\s*$/u);
    if (cents && intPart) {
      const base = intPart.replace(/,\s*$/u, "");
      if (/^\d[\d\s\u00A0\u202F\u2009]*$/u.test(base)) {
        return `${base},${cents[1]}`;
      }
    }

    return null;
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

  /** Узлы текста с отдельным суффиксом валюты (av.by «р.» / Onliner «ƃ» / Onliner «,00 ƃ») */
  function collectCurrencySuffixTextNodes(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const out = [];
    let n;
    while ((n = walker.nextNode())) {
      if (insideAvfx(n)) continue;
      const t = n.nodeValue;
      if (
        t &&
        (CURRENCY_SUFFIX_TEXT_RE.test(t) ||
          ONLINER_FRACTION_SUFFIX_TEXT_RE.test(t) ||
          RUB_FRACTION_COMMA_SUFFIX_TEXT_RE.test(t) ||
          RUB_FRACTION_CENTS_SUFFIX_TEXT_RE.test(t))
      ) {
        out.push(n);
      }
    }
    out.sort((a, b) => depth(b) - depth(a));
    return out;
  }

  function previousMeaningfulSibling(node) {
    let cur = node.previousSibling;
    while (
      cur &&
      (cur.nodeType === Node.COMMENT_NODE ||
        (cur.nodeType === Node.TEXT_NODE && !(cur.nodeValue || "").trim()))
    ) {
      cur = cur.previousSibling;
    }
    return cur;
  }

  /** На /prices у Onliner предок .h_txt_ell рэжае падпіс (…) — даём перенос */
  function relaxOnlinerEllipsisAncestors(fromEl) {
    let p = fromEl.parentElement;
    while (p && p !== document.documentElement) {
      if (p.classList?.contains("h_txt_ell")) {
        p.classList.add("avfx-ellipsis-relaxed");
        return;
      }
      p = p.parentElement;
    }
  }

  function prepareOnlinerPriceLayout(hook, opts) {
    if (getCurrentSiteId() !== "onlinerCatalog") return;
    if (opts.onlinerLayout === "row") return;
    hook.classList.add("avfx-hook-onliner-cell");
    relaxOnlinerEllipsisAncestors(hook);
    if (!opts.inlineClass) opts.inlineClass = "avfx-inline-onliner";
  }

  function decoratePriceHook(hook, amount, opts = {}) {
    const showInline = settings.showInline;
    const showHover = settings.showHover;
    if (!showInline && !showHover) return;

    prepareOnlinerPriceLayout(hook, opts);

    const conv = convert(amount);
    const inlineParent = opts.inlineParent || hook;
    const hoverTarget = opts.hoverTarget || hook;

    if (showInline) {
      const inline = document.createElement("span");
      inline.className = "avfx-inline avfx";
      if (opts.inlineClass) inline.classList.add(opts.inlineClass);
      inline.textContent = conv
        ? `(≈ ${formatConverted(conv.usd, conv.eur)})`
        : "(курсы НБРБ недоступны)";
      inlineParent.appendChild(inline);
    }

    if (showHover) {
      /* Не толькі span з цаной: у card__price-button вялікі padding — злева/справа курсор у кнопцы, але не над .avfx-hook */
      const hoverEl =
        hoverTarget.closest("button, a, [role='button']") || hoverTarget;
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
    document.querySelectorAll(".avfx-ellipsis-relaxed").forEach((el) => {
      el.classList.remove("avfx-ellipsis-relaxed");
    });
    document.querySelectorAll(".avfx-onliner-row").forEach((row) => {
      const priceWrap = row.querySelector(".avfx-onliner-price");
      if (priceWrap) {
        while (priceWrap.firstChild) {
          row.insertBefore(priceWrap.firstChild, priceWrap);
        }
        priceWrap.remove();
      }
      row.classList.remove("avfx-onliner-row", "avfx");
    });
    document.querySelectorAll(".avfx-rub-fraction").forEach((priceWrap) => {
      const container = priceWrap.parentElement;
      if (!container) return;
      while (priceWrap.firstChild) {
        container.insertBefore(priceWrap.firstChild, priceWrap);
      }
      priceWrap.remove();
    });
    document.querySelectorAll(".avfx-hook").forEach((hook) => {
      if (hook.classList.contains("avfx-onliner-price")) return;
      if (hook.classList.contains("avfx-rub-fraction")) return;
      const pt = hook.querySelector(".avfx-price-text");
      const text = pt ? pt.textContent : hook.textContent;
      hook.replaceWith(document.createTextNode(text));
    });
    const tt = document.getElementById("avfx-tooltip-host");
    if (tt) tt.remove();
    tooltipEl = null;
  }

  /**
   * Onliner: <div>2390</motion><div>,00 ƃ</motion> — оборачиваем общий контейнер.
   */
  function processSplitOnlinerFraction(currencyTextNode) {
    if (!currencyTextNode.parentNode || insideAvfx(currencyTextNode)) return;
    const fractionEl = currencyTextNode.parentElement;
    if (!fractionEl) return;
    const container = fractionEl.parentElement;
    if (!container || insideAvfx(container)) return;

    const cur = previousMeaningfulSibling(fractionEl);
    if (!cur) return;

    let numText = "";
    if (cur.nodeType === Node.ELEMENT_NODE) {
      numText = cur.textContent || "";
    } else if (cur.nodeType === Node.TEXT_NODE) {
      numText = cur.nodeValue || "";
    } else {
      return;
    }

    const combined = `${numText}${fractionEl.textContent || currencyTextNode.nodeValue || ""}`
      .replace(/\s*ƃ.*$/u, "")
      .trim();
    const amount = parseAmount(combined);
    if (!amount) return;

    /* Цена ў flex-радку Onliner — не згортваць у inline-span, інакш «,00 ƃ» переносіцца */
    const priceWrap = document.createElement("span");
    priceWrap.className = "avfx-hook avfx-onliner-price avfx";
    while (container.firstChild) {
      priceWrap.appendChild(container.firstChild);
    }
    container.classList.add("avfx-onliner-row", "avfx");
    container.appendChild(priceWrap);

    relaxOnlinerEllipsisAncestors(container);
    decoratePriceHook(priceWrap, amount, {
      onlinerLayout: "row",
      inlineParent: container,
      hoverTarget: priceWrap,
      inlineClass: "avfx-inline-onliner",
    });
  }

  /**
   * 21vek: «1 167,» + «29 р.» або «1 167» + «,29 р.» — адзін блок цэны.
   */
  function processSplitRubFraction(currencyTextNode) {
    if (!currencyTextNode.parentNode || insideAvfx(currencyTextNode)) return;
    const t = (currencyTextNode.nodeValue || "").trim();
    let fractionEl = currencyTextNode.parentElement;
    if (!fractionEl) return;

    let fractionPart = fractionEl.textContent || t;
    const isFrac =
      RUB_FRACTION_COMMA_SUFFIX_TEXT_RE.test(fractionPart) ||
      RUB_FRACTION_CENTS_SUFFIX_TEXT_RE.test(fractionPart) ||
      RUB_FRACTION_COMMA_SUFFIX_TEXT_RE.test(t) ||
      RUB_FRACTION_CENTS_SUFFIX_TEXT_RE.test(t);
    if (!isFrac) return;

    if (
      RUB_FRACTION_CENTS_SUFFIX_TEXT_RE.test(t) &&
      !RUB_FRACTION_CENTS_SUFFIX_TEXT_RE.test(fractionPart)
    ) {
      fractionPart = t;
    }

    let block = fractionEl;
    for (let depth = 0; depth < 6 && block?.parentElement; depth++) {
      const container = block.parentElement;
      if (!container || insideAvfx(container)) break;

      let numText = gatherTextBeforeElement(container, block);
      if (!numText.trim()) {
        numText = nodeTextContent(previousMeaningfulSibling(block));
      }

      const raw = combineSplitRubParts(numText, fractionPart);
      if (!raw) {
        block = container;
        continue;
      }

      const combined = raw.replace(/\s*р\.\s*$/u, "").trim();
      const amount = parseAmount(combined);
      if (!amount || amount < 1) {
        block = container;
        continue;
      }

      /* «29 р.» без целой части — не цена товара */
      if (amount < 100 && /^\d{1,2}\s*р\./u.test(fractionPart) && !numText.trim()) {
        return;
      }

      const priceWrap = document.createElement("span");
      priceWrap.className = "avfx-hook avfx-rub-fraction avfx";
      while (container.firstChild) {
        priceWrap.appendChild(container.firstChild);
      }
      container.appendChild(priceWrap);
      decoratePriceHook(priceWrap, amount);
      return;
    }
  }

  /**
   * Оборачивает блок «<span>число</span> … р.» или «… ƃ» из нескольких узлов.
   */
  function processSplitCurrencySuffix(currencyTextNode) {
    const t = currencyTextNode.nodeValue;
    if (t && ONLINER_FRACTION_SUFFIX_TEXT_RE.test(t)) {
      processSplitOnlinerFraction(currencyTextNode);
      return;
    }
    if (
      t &&
      (RUB_FRACTION_COMMA_SUFFIX_TEXT_RE.test(t) ||
        RUB_FRACTION_CENTS_SUFFIX_TEXT_RE.test(t))
    ) {
      processSplitRubFraction(currencyTextNode);
      return;
    }

    if (!currencyTextNode.parentNode || insideAvfx(currencyTextNode)) return;
    const parent = currencyTextNode.parentElement;
    if (!parent) return;

    const cur = previousMeaningfulSibling(currencyTextNode);
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
    if (!isEnabledForCurrentSite(settings)) {
      teardown();
      return;
    }

    if (!settings.showInline && !settings.showHover) {
      teardown();
      return;
    }

    const suffixNodes = collectCurrencySuffixTextNodes(document.body);
    for (const node of suffixNodes) {
      if (!node.isConnected) continue;
      processSplitCurrencySuffix(node);
    }

    const quick = /Br|руб|BYN|р\.|ƃ/i;
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
      settings = normalizeSettings(changes.fxSettings.newValue);
      teardown();
      run();
    }
  }

  async function init() {
    const data = await chrome.storage.local.get(["fxCache", "fxSettings"]);
    cache = data.fxCache ?? null;
    settings = normalizeSettings(data.fxSettings);
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
