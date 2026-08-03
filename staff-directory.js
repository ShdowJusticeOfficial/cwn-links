(() => {
  "use strict";

  const staff = Array.isArray(window.CWN_STAFF)
    ? window.CWN_STAFF
    : [];

  const executiveGrid =
    document.querySelector("#staff-executive");

  const featuredGrid =
    document.querySelector("#staff-featured");

  const grid =
    document.querySelector("#staff-grid");

  const executiveSection =
    document.querySelector("#executive-leadership-section");

  const directoratesSection =
    document.querySelector("#directorates-section");

  const searchInput =
    document.querySelector("#staff-search-input");

  const divisionFilter =
    document.querySelector("#staff-division-filter");

  const statusFilter =
    document.querySelector("#staff-status-filter");

  const clearButton =
    document.querySelector("#staff-clear-filters");

  const visibleCount =
    document.querySelector("#staff-visible-count");

  const emptyState =
    document.querySelector("#staff-empty");

  if (
    !executiveGrid ||
    !featuredGrid ||
    !grid ||
    !executiveSection ||
    !directoratesSection ||
    !searchInput ||
    !divisionFilter ||
    !statusFilter ||
    !clearButton ||
    !visibleCount ||
    !emptyState
  ) {
    console.warn(
      "CWN staff directory elements were not found."
    );

    return;
  }

  const escapeHtml = (value = "") =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const normalise = (value = "") =>
    String(value)
      .trim()
      .toLowerCase();

  const initials = (name = "") => {
    const parts = String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);

    return (
      parts
        .map((part) => part[0])
        .join("")
        .toUpperCase() ||
      "CWN"
    );
  };

  const statusLabel = (status) => {
    const labels = {
      active: "Active",
      break: "On break",
      inactive: "Inactive",
      vacant: "Vacant"
    };

    return labels[status] || "Unknown";
  };

  const safeLink = (url) => {
    const value =
      String(url || "").trim();

    if (!value) {
      return "";
    }

    if (
      value.startsWith("https://") ||
      value.startsWith("http://") ||
      value.startsWith("mailto:")
    ) {
      return value;
    }

    return "";
  };

  const buildProfileLinks = (links = {}) => {
    const supportedLinks = [
      ["discord", "Discord"],
      ["vrchat", "VRChat"],
      ["website", "Website"],
      ["email", "Email"]
    ];

    const rendered =
      supportedLinks
        .map(([key, label]) => {
          const url = safeLink(links[key]);

          if (!url) {
            return "";
          }

          const externalAttributes =
            url.startsWith("mailto:")
              ? ""
              : ' target="_blank" rel="noopener noreferrer"';

          return `
            <a
              class="staff-profile-link"
              href="${escapeHtml(url)}"
              ${externalAttributes}
            >
              ${escapeHtml(label)} ↗
            </a>
          `;
        })
        .filter(Boolean)
        .join("");

    if (!rendered) {
      return "";
    }

    return `
      <div class="staff-links">
        ${rendered}
      </div>
    `;
  };

  const buildResponsibilities = (items = []) => {
    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return "";
    }

    return `
      <ul class="staff-responsibilities">
        ${items
          .map(
            (item) =>
              `<li>${escapeHtml(item)}</li>`
          )
          .join("")}
      </ul>
    `;
  };

  const buildTags = (items = []) => {
    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return "";
    }

    return `
      <div class="staff-tags">
        ${items
          .map(
            (item) =>
              `<span class="staff-tag">${escapeHtml(item)}</span>`
          )
          .join("")}
      </div>
    `;
  };

  const buildMeta = (member) => {
    const rows = [];

    if (member.abbreviation) {
      rows.push([
        member.executive
          ? "Leadership position"
          : "Directorate",
        member.abbreviation
      ]);
    }

    if (member.deputy) {
      rows.push([
        member.executive
          ? "Executive Deputy"
          : "Deputy Director",
        member.deputy
      ]);
    }

    if (member.discordId) {
      rows.push([
        "Discord ID",
        member.discordId
      ]);
    }

    if (member.joined) {
      rows.push([
        "Joined",
        member.joined
      ]);
    }

    if (member.timezone) {
      rows.push([
        "Timezone",
        member.timezone
      ]);
    }

    if (rows.length === 0) {
      return "";
    }

    return `
      <div class="staff-meta">
        ${rows
          .map(
            ([label, value]) => `
              <div class="staff-meta-row">
                <span>${escapeHtml(label)}</span>
                <strong>${escapeHtml(value)}</strong>
              </div>
            `
          )
          .join("")}
      </div>
    `;
  };

  const createCard = (member) => {
    const article =
      document.createElement("article");

    const isExecutive =
      Boolean(member.executive);

    const featured =
      Boolean(member.featured);

    const status = [
      "active",
      "break",
      "inactive",
      "vacant"
    ].includes(member.status)
      ? member.status
      : "inactive";

    const classes = ["staff-card"];

    if (featured) {
      classes.push("staff-card-featured");
    }

    if (isExecutive) {
      classes.push("staff-card-executive");
    } else {
      classes.push("staff-card-directorate");
    }

    if (status === "vacant") {
      classes.push("staff-card-vacant");
    }

    article.className =
      classes.join(" ");

    const avatar = member.avatar
      ? `
        <div class="staff-avatar">
          <img
            src="${escapeHtml(member.avatar)}"
            alt=""
            loading="lazy"
          >
        </div>
      `
      : `
        <div
          class="staff-avatar"
          aria-hidden="true"
        >
          ${escapeHtml(initials(member.name))}
        </div>
      `;

    const leadershipBadge =
      isExecutive
        ? `
          <span class="staff-leadership-badge staff-executive-badge">
            ${escapeHtml(
              member.abbreviation || "EXECUTIVE"
            )}
          </span>
        `
        : featured
          ? `
            <span class="staff-leadership-badge">
              DIRECTOR
            </span>
          `
          : "";

    article.innerHTML = `
      <div class="staff-card-top">
        ${avatar}

        <div class="staff-identity">
          <div class="staff-name-line">
            <h3 class="staff-name">
              ${escapeHtml(
                member.name ||
                "Unnamed staff member"
              )}
            </h3>

            ${leadershipBadge}
          </div>

          ${
            member.username
              ? `
                <span class="staff-username">
                  ${escapeHtml(member.username)}
                </span>
              `
              : ""
          }
        </div>

        <span
          class="staff-status staff-status-${status}"
        >
          ${escapeHtml(statusLabel(status))}
        </span>
      </div>

      <div class="staff-role">
        ${escapeHtml(
          member.fullRole ||
          member.role ||
          "CWN Staff"
        )}
      </div>

      <div class="staff-division">
        ${escapeHtml(
          member.division ||
          "General"
        )}
      </div>

      ${
        member.bio
          ? `
            <p class="staff-bio">
              ${escapeHtml(member.bio)}
            </p>
          `
          : ""
      }

      ${buildTags(member.specialties)}

      <details class="staff-details">
        <summary>
          View role details
        </summary>

        ${buildResponsibilities(
          member.responsibilities
        )}

        ${buildMeta(member)}

        ${buildProfileLinks(member.links)}
      </details>

      <span class="staff-id">
        ${escapeHtml(
          member.id ||
          "CWN-STAFF-UNASSIGNED"
        )}
      </span>
    `;

    return article;
  };

  const searchableText = (member) =>
    normalise(
      [
        member.id,
        member.name,
        member.username,
        member.role,
        member.fullRole,
        member.division,
        member.abbreviation,
        member.status,
        member.deputy,
        member.discordId,
        member.bio,
        member.executive
          ? "executive leadership founder 2ic 3ic"
          : "director directorate",
        ...(Array.isArray(member.specialties)
          ? member.specialties
          : []),
        ...(Array.isArray(member.responsibilities)
          ? member.responsibilities
          : [])
      ].join(" ")
    );

  const populateDivisions = () => {
    const divisions = [
      ...new Set(
        staff
          .map(
            (member) =>
              String(
                member.division || ""
              ).trim()
          )
          .filter(Boolean)
      )
    ].sort(
      (a, b) =>
        a.localeCompare(b)
    );

    divisions.forEach((division) => {
      const option =
        document.createElement("option");

      option.value = division;
      option.textContent = division;

      divisionFilter.append(option);
    });
  };

  const render = () => {
    const query =
      normalise(searchInput.value);

    const selectedDivision =
      divisionFilter.value;

    const selectedStatus =
      statusFilter.value;

    const filtered =
      staff
        .filter((member) => {
          const matchesSearch =
            !query ||
            searchableText(member)
              .includes(query);

          const matchesDivision =
            selectedDivision === "all" ||
            member.division ===
              selectedDivision;

          const matchesStatus =
            selectedStatus === "all" ||
            member.status ===
              selectedStatus;

          return (
            matchesSearch &&
            matchesDivision &&
            matchesStatus
          );
        })
        .sort(
          (a, b) =>
            Number(
              a.hierarchyLevel || 999
            ) -
              Number(
                b.hierarchyLevel || 999
              ) ||
            String(a.role || "")
              .localeCompare(
                String(b.role || "")
              )
        );

    const executives =
      filtered.filter(
        (member) =>
          Boolean(member.executive)
      );

    const appointedDirectors =
      filtered.filter(
        (member) =>
          !member.executive &&
          member.status !== "vacant"
      );

    const vacantDirectors =
      filtered.filter(
        (member) =>
          !member.executive &&
          member.status === "vacant"
      );

    executiveGrid.replaceChildren(
      ...executives.map(createCard)
    );

    featuredGrid.replaceChildren(
      ...appointedDirectors.map(createCard)
    );

    grid.replaceChildren(
      ...vacantDirectors.map(createCard)
    );

    visibleCount.textContent =
      String(filtered.length);

    emptyState.hidden =
      filtered.length !== 0;

    executiveSection.hidden =
      executives.length === 0;

    directoratesSection.hidden =
      appointedDirectors.length === 0 &&
      vacantDirectors.length === 0;

    featuredGrid.hidden =
      appointedDirectors.length === 0;

    grid.hidden =
      vacantDirectors.length === 0;
  };

  searchInput.addEventListener(
    "input",
    render
  );

  divisionFilter.addEventListener(
    "change",
    render
  );

  statusFilter.addEventListener(
    "change",
    render
  );

  clearButton.addEventListener(
    "click",
    () => {
      searchInput.value = "";
      divisionFilter.value = "all";
      statusFilter.value = "all";

      render();
      searchInput.focus();
    }
  );

  populateDivisions();
  render();
})();
