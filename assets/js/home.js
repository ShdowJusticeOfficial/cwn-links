"use strict";

(() => {
  const openButton =
    document.querySelector(
      "[data-mobile-menu-open]"
    );

  const closeButton =
    document.querySelector(
      "[data-mobile-menu-close]"
    );

  const overlay =
    document.querySelector(
      "[data-mobile-menu]"
    );

  function openMenu() {
    if (!overlay) {
      return;
    }

    overlay.classList.add("is-open");
    overlay.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.style.overflow =
      "hidden";
  }

  function closeMenu() {
    if (!overlay) {
      return;
    }

    overlay.classList.remove(
      "is-open"
    );

    overlay.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.style.overflow =
      "";
  }

  openButton?.addEventListener(
    "click",
    openMenu
  );

  closeButton?.addEventListener(
    "click",
    closeMenu
  );

  overlay?.addEventListener(
    "click",
    (event) => {
      if (event.target === overlay) {
        closeMenu();
      }
    }
  );

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    }
  );
})();
