(() => {
  "use strict";

  const storageKey = "cwnPortalTheme";
  const validThemes = new Set([
    "cwn",
    "amoled",
    "blue",
    "matrix",
    "light"
  ]);

  const applyTheme = (theme) => {
    const selected = validThemes.has(theme)
      ? theme
      : "cwn";

    if (selected === "cwn") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.dataset.theme = selected;
    }

    document
      .querySelectorAll("[data-theme-select]")
      .forEach((select) => {
        select.value = selected;
      });
  };

  const saved = localStorage.getItem(storageKey) || "cwn";
  applyTheme(saved);

  document.addEventListener("change", (event) => {
    const select = event.target.closest("[data-theme-select]");

    if (!select) {
      return;
    }

    localStorage.setItem(storageKey, select.value);
    applyTheme(select.value);
  });
})();
