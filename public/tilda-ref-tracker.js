(function () {
  var STORAGE_KEY = "fils_ref_code";
  var COOKIE_KEY = "fils_ref_code";
  var COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
  var API_BASE = "https://fillsbonus.vercel.app";

  function readQueryRef() {
    try {
      var params = new URLSearchParams(window.location.search);
      return (params.get("ref") || "").trim().toUpperCase();
    } catch (_error) {
      return "";
    }
  }

  function setCookie(name, value) {
    document.cookie =
      name +
      "=" +
      encodeURIComponent(value) +
      "; path=/; max-age=" +
      COOKIE_MAX_AGE +
      "; SameSite=Lax";
  }

  function getCookie(name) {
    var match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : "";
  }

  function persistRefCode(code) {
    if (!code) return;
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch (_error) {}
    setCookie(COOKIE_KEY, code);
  }

  function getStoredRefCode() {
    try {
      var localValue = localStorage.getItem(STORAGE_KEY);
      if (localValue) return localValue.toUpperCase();
    } catch (_error) {}
    return (getCookie(COOKIE_KEY) || "").toUpperCase();
  }

  function getPromoInputValue(form) {
    var promoInput = form.querySelector('input[name="promo_code"]');
    return promoInput ? promoInput.value.trim().toUpperCase() : "";
  }

  function ensureHiddenField(form, storedCode) {
    // Ручной ввод промокода имеет приоритет над URL-параметром
    var manualCode = getPromoInputValue(form);
    var code = manualCode || storedCode;
    if (!code) return;

    var input = form.querySelector('input[name="ref_code"]');
    if (!input) {
      input = document.createElement("input");
      input.type = "hidden";
      input.name = "ref_code";
      form.appendChild(input);
    }
    input.value = code;

    // Заполнить promo_code из хранилища только если поле пустое
    var promoInput = form.querySelector('input[name="promo_code"]');
    if (promoInput && !promoInput.value.trim() && storedCode) {
      promoInput.value = storedCode;
    }

    // Если пользователь ввёл код вручную — добавить маркер источника
    var sourceInput = form.querySelector('input[name="ref_source"]');
    if (!sourceInput) {
      sourceInput = document.createElement("input");
      sourceInput.type = "hidden";
      sourceInput.name = "ref_source";
      form.appendChild(sourceInput);
    }
    sourceInput.value = manualCode ? "code" : "link";
  }

  function showPromoStatus(input, message, isOk) {
    var statusId = "fils-promo-status";
    var existing = input.parentNode && input.parentNode.querySelector("#" + statusId);
    if (existing) existing.parentNode.removeChild(existing);

    var el = document.createElement("div");
    el.id = statusId;
    el.style.cssText =
      "margin-top:4px; font-size:13px; color:" + (isOk ? "#2d7a2d" : "#c0392b") + ";";
    el.textContent = message;
    if (input.parentNode) input.parentNode.appendChild(el);
  }

  function removePromoStatus(input) {
    var statusId = "fils-promo-status";
    var existing = input.parentNode && input.parentNode.querySelector("#" + statusId);
    if (existing) existing.parentNode.removeChild(existing);
  }

  function validatePromoCode(input) {
    var code = input.value.trim().toUpperCase();
    if (!code) {
      removePromoStatus(input);
      return;
    }

    fetch(API_BASE + "/api/ref/" + encodeURIComponent(code))
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (result) {
        if (result.ok && result.data.ok) {
          showPromoStatus(
            input,
            "\u2713 \u041f\u0440\u043e\u043c\u043e\u043a\u043e\u0434 \u043f\u0440\u0438\u043d\u044f\u0442! \u0421\u043a\u0438\u0434\u043a\u0430 " +
              result.data.clientDiscountPercent +
              "% \u0431\u0443\u0434\u0435\u0442 \u043f\u0440\u0438\u043c\u0435\u043d\u0435\u043d\u0430.",
            true,
          );
          // Сохранить валидный код в хранилище
          persistRefCode(result.data.refCode);
        } else {
          showPromoStatus(
            input,
            "\u2717 \u041f\u0440\u043e\u043c\u043e\u043a\u043e\u0434 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d. \u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u0438 \u043f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0441\u043d\u043e\u0432\u0430.",
            false,
          );
        }
      })
      .catch(function () {
        // Сеть недоступна — не мешаем отправке формы
      });
  }

  function attachToForms(code) {
    var forms = document.querySelectorAll("form");
    forms.forEach(function (form) {
      ensureHiddenField(form, code);

      if (!form.dataset.filsAttached) {
        form.dataset.filsAttached = "1";

        // Blur-валидация промокода
        var promoInput = form.querySelector('input[name="promo_code"]');
        if (promoInput) {
          promoInput.addEventListener("blur", function () {
            validatePromoCode(promoInput);
          });
          promoInput.addEventListener("input", function () {
            removePromoStatus(promoInput);
          });
        }

        form.addEventListener("submit", function () {
          ensureHiddenField(form, getStoredRefCode());
        });
      }
    });
  }

  function init() {
    var queryRef = readQueryRef();
    if (queryRef) {
      persistRefCode(queryRef);
    }

    var refCode = getStoredRefCode();
    attachToForms(refCode);

    var observer = new MutationObserver(function () {
      attachToForms(getStoredRefCode());
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
