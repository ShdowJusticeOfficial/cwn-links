(() => {
  "use strict";

  const progressFill =
    document.querySelector("#portal-progress-fill");

  const backToTop =
    document.querySelector("#portal-back-to-top");

  const searchOverlay =
    document.querySelector("#portal-search-overlay");

  const searchInput =
    document.querySelector("#portal-search-input");

  const searchResults =
    document.querySelector("#portal-search-results");

  const searchOpenButtons =
    document.querySelectorAll("[data-open-portal-search]");

  const searchCloseButton =
    document.querySelector("#portal-search-close");

  const mobileMenuButton =
    document.querySelector("#portal-nav-menu-button");

  const mobileMenu =
    document.querySelector("#portal-nav-links");

  const reviewedTime =
    document.querySelector("#portal-reviewed-time");

  const counters =
    document.querySelectorAll("[data-portal-count]");

  const searchableSelectors = [
    ".portal-section",
    ".cwn-mission",
    ".malware-scanner",
    ".staff-directory",
    ".goal-box",
    ".contact-card",
    ".link-button"
  ];

  let searchIndex = [];

  const normalise = (value = "") =>
    String(value)
      .replace(/\s+/g, " ")
      .trim();

  const lower = (value = "") =>
    normalise(value).toLowerCase();

  const escapeHtml = (value = "") =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const ensureElementId = (
    element,
    index
  ) => {
    if (element.id) {
      return element.id;
    }

    const id =
      `portal-search-target-${index + 1}`;

    element.id = id;

    return id;
  };

  const titleForElement = (element) => {
    const heading =
      element.querySelector(
        "h1, h2, h3, .link-title, strong"
      );

    return normalise(
      heading?.textContent ||
      element.getAttribute("aria-label") ||
      "CWN section"
    );
  };

  const typeForElement = (element) => {
    if (
      element.classList.contains(
        "staff-directory"
      )
    ) {
      return "STAFF DIRECTORY";
    }

    if (
      element.classList.contains(
        "malware-scanner"
      )
    ) {
      return "SECURITY TOOL";
    }

    if (
      element.classList.contains(
        "cwn-mission"
      )
    ) {
      return "ABOUT CWN";
    }

    if (
      element.classList.contains(
        "goal-box"
      )
    ) {
      return "FUNDRAISING";
    }

    if (
      element.classList.contains(
        "contact-card"
      )
    ) {
      return "CONTACT";
    }

    if (
      element.classList.contains(
        "link-button"
      )
    ) {
      return "OFFICIAL LINK";
    }

    return "PORTAL";
  };

  const buildSearchIndex = () => {
    const elements =
      document.querySelectorAll(
        searchableSelectors.join(",")
      );

    searchIndex = Array.from(elements)
      .map((element, index) => {
        const id =
          ensureElementId(
            element,
            index
          );

        const title =
          titleForElement(element);

        const text =
          normalise(
            element.textContent
          );

        return {
          id,
          title,
          text,
          searchableText:
            lower(`${title} ${text}`),
          type:
            typeForElement(element)
        };
      })
      .filter(
        (item) =>
          item.title &&
          item.text
      );
  };

  const renderSearchResults = (
    query
  ) => {
    const cleanedQuery =
      lower(query);

    const results =
      cleanedQuery
        ? searchIndex.filter(
            (item) =>
              item.searchableText
                .includes(cleanedQuery)
          )
        : searchIndex.slice(0, 10);

    if (results.length === 0) {
      searchResults.innerHTML = `
        <div class="portal-search-empty">
          No matching CWN content was found.
        </div>
      `;

      return;
    }

    searchResults.innerHTML =
      results
        .slice(0, 20)
        .map((item) => {
          const description =
            item.text.length > 155
              ? `${item.text.slice(0, 155)}…`
              : item.text;

          return `
            <a
              class="portal-search-result"
              href="#${escapeHtml(item.id)}"
              data-portal-search-result
            >
              <span class="portal-search-result-type">
                ${escapeHtml(item.type)}
              </span>

              <strong>
                ${escapeHtml(item.title)}
              </strong>

              <span>
                ${escapeHtml(description)}
              </span>
            </a>
          `;
        })
        .join("");
  };

  const openSearch = () => {
    buildSearchIndex();

    searchOverlay.hidden = false;
    document.body.classList.add(
      "portal-search-open"
    );

    searchInput.value = "";
    renderSearchResults("");

    requestAnimationFrame(
      () => searchInput.focus()
    );
  };

  const closeSearch = () => {
    searchOverlay.hidden = true;

    document.body.classList.remove(
      "portal-search-open"
    );
  };

  const updateScrollUi = () => {
    const scrollTop =
      window.scrollY ||
      document.documentElement.scrollTop;

    const scrollableHeight =
      document.documentElement.scrollHeight -
      window.innerHeight;

    const percentage =
      scrollableHeight > 0
        ? Math.min(
            100,
            Math.max(
              0,
              (scrollTop /
                scrollableHeight) *
                100
            )
          )
        : 0;

    if (progressFill) {
      progressFill.style.width =
        `${percentage}%`;
    }

    if (backToTop) {
      backToTop.hidden =
        scrollTop < 500;
    }
  };

  const animateCounter = (
    element
  ) => {
    const target =
      Number(
        element.dataset.portalCount
      );

    if (!Number.isFinite(target)) {
      return;
    }

    const suffix =
      element.dataset.portalSuffix ||
      "";

    const duration = 900;
    const started =
      performance.now();

    const frame = (time) => {
      const elapsed =
        time - started;

      const progress =
        Math.min(
          elapsed / duration,
          1
        );

      const eased =
        1 -
        Math.pow(
          1 - progress,
          3
        );

      const value =
        Math.round(
          target * eased
        );

      element.textContent =
        `${value}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    };

    requestAnimationFrame(frame);
  };

  const initialiseCounters = () => {
    if (
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {
      counters.forEach((counter) => {
        counter.textContent =
          `${counter.dataset.portalCount || "0"}${
            counter.dataset.portalSuffix || ""
          }`;
      });

      return;
    }

    if (
      !("IntersectionObserver" in window)
    ) {
      counters.forEach(
        animateCounter
      );

      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            animateCounter(
              entry.target
            );

            observer.unobserve(
              entry.target
            );
          });
        },
        {
          threshold: 0.35
        }
      );

    counters.forEach(
      (counter) =>
        observer.observe(counter)
    );
  };

  const setReviewedTime = () => {
    if (!reviewedTime) {
      return;
    }

    const date =
      reviewedTime.dataset.reviewDate;

    if (!date) {
      return;
    }

    const parsed =
      new Date(`${date}T00:00:00`);

    if (
      Number.isNaN(parsed.getTime())
    ) {
      reviewedTime.textContent =
        date;

      return;
    }

    reviewedTime.textContent =
      parsed.toLocaleDateString(
        "en-GB",
        {
          day: "numeric",
          month: "long",
          year: "numeric"
        }
      );
  };

  searchOpenButtons.forEach(
    (button) =>
      button.addEventListener(
        "click",
        openSearch
      )
  );

  searchCloseButton?.addEventListener(
    "click",
    closeSearch
  );

  searchOverlay?.addEventListener(
    "click",
    (event) => {
      if (
        event.target === searchOverlay
      ) {
        closeSearch();
      }
    }
  );

  searchInput?.addEventListener(
    "input",
    () =>
      renderSearchResults(
        searchInput.value
      )
  );

  searchResults?.addEventListener(
    "click",
    (event) => {
      const result =
        event.target.closest(
          "[data-portal-search-result]"
        );

      if (result) {
        closeSearch();
      }
    }
  );

  document.addEventListener(
    "keydown",
    (event) => {
      const target =
        event.target;

      const typing =
        target instanceof
          HTMLInputElement ||
        target instanceof
          HTMLTextAreaElement ||
        target?.isContentEditable;

      if (
        event.key === "/" &&
        !typing
      ) {
        event.preventDefault();
        openSearch();
      }

      if (
        event.key.toLowerCase() === "k" &&
        (event.ctrlKey ||
          event.metaKey)
      ) {
        event.preventDefault();
        openSearch();
      }

      if (
        event.key === "Escape" &&
        !searchOverlay.hidden
      ) {
        closeSearch();
      }
    }
  );

  mobileMenuButton?.addEventListener(
    "click",
    () => {
      const open =
        mobileMenu.classList.toggle(
          "is-open"
        );

      mobileMenuButton.setAttribute(
        "aria-expanded",
        String(open)
      );
    }
  );

  mobileMenu?.addEventListener(
    "click",
    (event) => {
      if (
        event.target.closest(
          "a, button"
        )
      ) {
        mobileMenu.classList.remove(
          "is-open"
        );

        mobileMenuButton?.setAttribute(
          "aria-expanded",
          "false"
        );
      }
    }
  );

  backToTop?.addEventListener(
    "click",
    () => {
      window.scrollTo({
        top: 0,
        behavior:
          window.matchMedia(
            "(prefers-reduced-motion: reduce)"
          ).matches
            ? "auto"
            : "smooth"
      });
    }
  );

  window.addEventListener(
    "scroll",
    updateScrollUi,
    {
      passive: true
    }
  );

  window.addEventListener(
    "resize",
    updateScrollUi,
    {
      passive: true
    }
  );

  setReviewedTime();
  initialiseCounters();
  updateScrollUi();
})();
