"use strict";

(() => {
  document.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-cwn-tab]");

    if (tab) {
      const group = tab.closest("[role='tablist']");

      if (group) {
        group.querySelectorAll("[role='tab']").forEach((item) => {
          item.setAttribute("aria-selected", "false");
        });

        tab.setAttribute("aria-selected", "true");
      }
    }

    const dropdownButton =
      event.target.closest("[data-cwn-dropdown-toggle]");

    if (dropdownButton) {
      const target =
        document.getElementById(
          dropdownButton.getAttribute(
            "aria-controls"
          )
        );

      if (target) {
        target.hidden = !target.hidden;
      }
    }

    const modalOpen =
      event.target.closest("[data-cwn-modal-open]");

    if (modalOpen) {
      const modal =
        document.getElementById(
          modalOpen.dataset.cwnModalOpen
        );

      if (modal) {
        modal.hidden = false;
      }
    }

    const modalClose =
      event.target.closest("[data-cwn-modal-close]");

    if (modalClose) {
      const modal =
        modalClose.closest(
          ".cwn-modal-backdrop"
        );

      if (modal) {
        modal.hidden = true;
      }
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    document
      .querySelectorAll(
        ".cwn-modal-backdrop:not([hidden])"
      )
      .forEach((modal) => {
        modal.hidden = true;
      });

    document
      .querySelectorAll(
        ".cwn-dropdown-menu:not([hidden])"
      )
      .forEach((menu) => {
        menu.hidden = true;
      });
  });
})();
