(function () {
  var STORAGE_KEY = "fils_ref_code";
  var COOKIE_KEY = "fils_ref_code";
  var COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

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

  function ensureHiddenField(form, code) {
    if (!code) return;
    var input = form.querySelector('input[name="ref_code"]');
    if (!input) {
      input = document.createElement("input");
      input.type = "hidden";
      input.name = "ref_code";
      form.appendChild(input);
    }
    input.value = code;
  }

  function attachToForms(code) {
    if (!code) return;
    var forms = document.querySelectorAll("form");
    forms.forEach(function (form) {
      ensureHiddenField(form, code);
      form.addEventListener("submit", function () {
        ensureHiddenField(form, code);
      });
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
