(() => {
  "use strict";

  const search =
    document.querySelector("#exposes-search");

  const categoryFilter =
    document.querySelector(
      "#exposes-category-filter"
    );

  const statusFilter =
    document.querySelector(
      "#exposes-status-filter"
    );

  const cards =
    [
      ...document.querySelectorAll(
        ".exposes-card"
      )
    ];

  const emptyState =
    document.querySelector("#exposes-empty");

  const progress =
    document.querySelector("#exposes-progress");

  const normalise = (value) =>
    String(value || "")
      .trim()
      .toLowerCase();

  const applyFilters = () => {
    const query =
      normalise(search?.value);

    const category =
      categoryFilter?.value || "all";

    const status =
      statusFilter?.value || "all";

    let visibleCount = 0;

    cards.forEach((card) => {
      const searchableText =
        normalise(
          [
            card.dataset.title,
            card.dataset.category,
            card.dataset.status,
            card.textContent
          ].join(" ")
        );

      const matchesQuery =
        !query ||
        searchableText.includes(query);

      const matchesCategory =
        category === "all" ||
        card.dataset.category === category;

      const matchesStatus =
        status === "all" ||
        card.dataset.status === status;

      const visible =
        matchesQuery &&
        matchesCategory &&
        matchesStatus;

      card.hidden = !visible;

      if (visible) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden =
        visibleCount !== 0;
    }
  };

  search?.addEventListener(
    "input",
    applyFilters
  );

  categoryFilter?.addEventListener(
    "change",
    applyFilters
  );

  statusFilter?.addEventListener(
    "change",
    applyFilters
  );

  window.addEventListener(
    "scroll",
    () => {
      if (!progress) {
        return;
      }

      const maximum =
        document.documentElement.scrollHeight -
        window.innerHeight;

      const percentage =
        maximum > 0
          ? Math.min(
              100,
              (
                window.scrollY /
                maximum
              ) * 100
            )
          : 0;

      progress.style.width =
        `${percentage}%`;
    },
    {
      passive: true
    }
  );

  applyFilters();


  const countdown =
    document.querySelector(
      "#vanadium-countdown"
    );

  const releaseStatus =
    document.querySelector(
      "#vanadium-release-status"
    );

  const countdownParts = {
    days:
      document.querySelector(
        "#vanadium-days"
      ),

    hours:
      document.querySelector(
        "#vanadium-hours"
      ),

    minutes:
      document.querySelector(
        "#vanadium-minutes"
      ),

    seconds:
      document.querySelector(
        "#vanadium-seconds"
      )
  };

  const padCountdownValue = (value) =>
    String(
      Math.max(0, value)
    ).padStart(2, "0");

  const updateVanadiumCountdown = () => {
    if (!countdown) {
      return;
    }

    const releaseTime =
      new Date(
        countdown.dataset.releaseTime
      ).getTime();

    if (
      !Number.isFinite(releaseTime)
    ) {
      countdown.textContent =
        "Release time unavailable.";

      return;
    }

    const remaining =
      releaseTime - Date.now();

    if (remaining <= 0) {
      countdownParts.days.textContent =
        "00";

      countdownParts.hours.textContent =
        "00";

      countdownParts.minutes.textContent =
        "00";

      countdownParts.seconds.textContent =
        "00";

      countdown.classList.add(
        "exposes-countdown-released"
      );

      if (releaseStatus) {
        releaseStatus.textContent =
          "Released";

        releaseStatus.className =
          "exposes-status exposes-status-open";
      }

      return;
    }

    const totalSeconds =
      Math.floor(
        remaining / 1000
      );

    const days =
      Math.floor(
        totalSeconds / 86400
      );

    const hours =
      Math.floor(
        (
          totalSeconds % 86400
        ) / 3600
      );

    const minutes =
      Math.floor(
        (
          totalSeconds % 3600
        ) / 60
      );

    const seconds =
      totalSeconds % 60;

    countdownParts.days.textContent =
      padCountdownValue(days);

    countdownParts.hours.textContent =
      padCountdownValue(hours);

    countdownParts.minutes.textContent =
      padCountdownValue(minutes);

    countdownParts.seconds.textContent =
      padCountdownValue(seconds);
  };

  updateVanadiumCountdown();

  window.setInterval(
    updateVanadiumCountdown,
    1000
  );

})();

