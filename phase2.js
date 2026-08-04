(() => {
  "use strict";

  const data = window.CWN_PHASE2_DATA;

  if (!data) {
    return;
  }

  const escapeHtml = (value = "") =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const formatDate = (value) => {
    const parsed = new Date(`${value}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const renderStatus = () => {
    const container = document.querySelector("#phase2-status-list");

    if (!container) {
      return;
    }

    container.innerHTML = data.status.map((service) => `
      <article class="p2-status-row">
        <div class="p2-status-name">
          <strong>${escapeHtml(service.name)}</strong>
          <span>${escapeHtml(service.description)}</span>
        </div>

        <span class="p2-status-badge p2-status-${escapeHtml(service.status)}">
          ${escapeHtml(service.status)}
        </span>

        <div class="p2-status-meta">
          <strong>Uptime</strong>
          <span>${escapeHtml(service.uptime)}</span>
        </div>

        <div class="p2-status-meta">
          <strong>Maintenance</strong>
          <span>${escapeHtml(service.maintenance)}</span>
        </div>
      </article>
    `).join("");
  };

  const renderStatistics = () => {
    document.querySelectorAll("[data-phase2-statistics]")
      .forEach((container) => {
        container.innerHTML = data.statistics.map((stat) => `
          <article class="p2-stat">
            <strong>${escapeHtml(stat.value)}${escapeHtml(stat.suffix)}</strong>
            <span>${escapeHtml(stat.label)}</span>
            <small>${escapeHtml(stat.detail)}</small>
          </article>
        `).join("");
      });
  };

  const listGroup = (title, items) => {
    if (!Array.isArray(items) || items.length === 0) {
      return "";
    }

    return `
      <section class="p2-release-group">
        <strong>${escapeHtml(title)}</strong>
        <ul>
          ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </section>
    `;
  };

  const renderChangelog = (query = "") => {
    const container = document.querySelector("#phase2-changelog");

    if (!container) {
      return;
    }

    const cleaned = query.trim().toLowerCase();

    const releases = data.changelog.filter((release) =>
      JSON.stringify(release).toLowerCase().includes(cleaned)
    );

    if (releases.length === 0) {
      container.innerHTML = `
        <div class="p2-empty">
          No matching releases were found.
        </div>
      `;
      return;
    }

    container.innerHTML = releases.map((release) => `
      <article class="p2-release">
        <div class="p2-release-header">
          <div>
            <div class="p2-card-meta">
              <span class="p2-chip p2-chip-green">v${escapeHtml(release.version)}</span>
              <span class="p2-chip">${escapeHtml(formatDate(release.date))}</span>
            </div>

            <h3>${escapeHtml(release.title)}</h3>
            <p class="p2-release-summary">${escapeHtml(release.summary)}</p>
          </div>
        </div>

        <div class="p2-release-columns">
          ${listGroup("Added", release.added)}
          ${listGroup("Changed", release.changed)}
          ${listGroup("Fixed", release.fixed)}
          ${listGroup("Security", release.security)}
        </div>
      </article>
    `).join("");
  };

  const renderNews = (query = "") => {
    const container = document.querySelector("#phase2-news");

    if (!container) {
      return;
    }

    const cleaned = query.trim().toLowerCase();

    const entries = data.news.filter((entry) =>
      JSON.stringify(entry).toLowerCase().includes(cleaned)
    );

    container.innerHTML = entries.length
      ? entries.map((entry) => `
          <article class="p2-card">
            <div class="p2-card-meta">
              <span class="p2-chip p2-chip-green">${escapeHtml(entry.category)}</span>
              <span class="p2-chip">${escapeHtml(formatDate(entry.date))}</span>
            </div>

            <h3>${escapeHtml(entry.title)}</h3>
            <p>${escapeHtml(entry.summary)}</p>

            <a class="p2-button p2-button-secondary" href="${escapeHtml(entry.url)}">
              Read more →
            </a>
          </article>
        `).join("")
      : `<div class="p2-empty">No matching news was found.</div>`;
  };

  const renderFaq = (query = "") => {
    const container = document.querySelector("#phase2-faq");

    if (!container) {
      return;
    }

    const cleaned = query.trim().toLowerCase();

    const entries = data.faq.filter((entry) =>
      JSON.stringify(entry).toLowerCase().includes(cleaned)
    );

    container.innerHTML = entries.length
      ? entries.map((entry) => `
          <details class="p2-faq">
            <summary>
              <span class="p2-chip">${escapeHtml(entry.category)}</span>
              ${escapeHtml(entry.question)}
            </summary>

            <p>${escapeHtml(entry.answer)}</p>
          </details>
        `).join("")
      : `<div class="p2-empty">No matching questions were found.</div>`;
  };

  const renderDownloads = (query = "") => {
    const container = document.querySelector("#phase2-downloads");

    if (!container) {
      return;
    }

    const cleaned = query.trim().toLowerCase();

    const entries = data.downloads.filter((entry) =>
      JSON.stringify(entry).toLowerCase().includes(cleaned)
    );

    container.innerHTML = entries.length
      ? entries.map((entry) => {
          const available = entry.status === "Available";

          return `
            <article class="p2-card">
              <div class="p2-card-meta">
                <span class="p2-chip">${escapeHtml(entry.category)}</span>
                <span class="p2-chip">${escapeHtml(entry.type)}</span>
                <span class="p2-chip ${available ? "p2-chip-green" : "p2-chip-yellow"}">
                  ${escapeHtml(entry.status)}
                </span>
              </div>

              <h3>${escapeHtml(entry.name)}</h3>
              <p>${escapeHtml(entry.description)}</p>

              ${
                available
                  ? `<a class="p2-button p2-button-secondary" href="${escapeHtml(entry.url)}">Open →</a>`
                  : `<span class="p2-chip p2-chip-yellow">Coming soon</span>`
              }
            </article>
          `;
        }).join("")
      : `<div class="p2-empty">No matching downloads were found.</div>`;
  };

  const renderShowcase = () => {
    document.querySelectorAll("[data-phase2-showcase]")
      .forEach((container) => {
        container.innerHTML = data.showcase.map((entry) => `
          <article class="p2-card">
            <div class="p2-card-meta">
              <span class="p2-chip p2-chip-green">${escapeHtml(entry.type)}</span>
            </div>

            <h3>${escapeHtml(entry.title)}</h3>
            <p>${escapeHtml(entry.description)}</p>

            <a class="p2-button p2-button-secondary" href="${escapeHtml(entry.url)}">
              Open →
            </a>
          </article>
        `).join("");
      });
  };

  const buildSearchIndex = () => {
    const entries = [];

    data.status.forEach((item) => entries.push({
      type: "Service",
      title: item.name,
      description: item.description,
      url: "status.html"
    }));

    data.news.forEach((item) => entries.push({
      type: "News",
      title: item.title,
      description: item.summary,
      url: item.url
    }));

    data.faq.forEach((item) => entries.push({
      type: "FAQ",
      title: item.question,
      description: item.answer,
      url: "faq.html"
    }));

    data.downloads.forEach((item) => entries.push({
      type: "Download",
      title: item.name,
      description: item.description,
      url: item.url
    }));

    data.changelog.forEach((item) => entries.push({
      type: "Release",
      title: `v${item.version} — ${item.title}`,
      description: item.summary,
      url: "changelog.html"
    }));

    data.showcase.forEach((item) => entries.push({
      type: item.type,
      title: item.title,
      description: item.description,
      url: item.url
    }));

    entries.push(
      {
        type: "Portal",
        title: "CWN Staff Directory",
        description: "Verify Executive Leadership, Directors and vacant positions.",
        url: "index.html#staff-directory"
      },
      {
        type: "Security Tool",
        title: "File Risk Scanner",
        description: "Perform a local basic file-risk assessment.",
        url: "index.html#malware-scanner"
      },
      {
        type: "Form",
        title: "Report a Bug",
        description: "Submit a technical issue affecting a CWN service.",
        url: "bug-report.html"
      },
      {
        type: "Policy",
        title: "Data and Privacy Notice",
        description: "Read what CWN collects, processes and does not collect.",
        url: "privacy.html"
      },
      {
        type: "Tool",
        title: "Patch Note Generator",
        description: "Generate formatted CWN release notes.",
        url: "patch-notes.html"
      }
    );

    return entries;
  };

  const renderUniversalSearch = (query = "") => {
    const container = document.querySelector("#phase2-search-results");

    if (!container) {
      return;
    }

    const cleaned = query.trim().toLowerCase();
    const entries = buildSearchIndex()
      .filter((entry) =>
        JSON.stringify(entry).toLowerCase().includes(cleaned)
      )
      .slice(0, 50);

    container.innerHTML = entries.length
      ? entries.map((entry) => `
          <a class="p2-card" href="${escapeHtml(entry.url)}">
            <div class="p2-card-meta">
              <span class="p2-chip p2-chip-green">${escapeHtml(entry.type)}</span>
            </div>

            <h3>${escapeHtml(entry.title)}</h3>
            <p>${escapeHtml(entry.description)}</p>
          </a>
        `).join("")
      : `<div class="p2-empty">No matching portal content was found.</div>`;
  };

  const bindSearch = (inputId, renderer) => {
    const input = document.getElementById(inputId);

    if (!input) {
      return;
    }

    input.addEventListener("input", () => renderer(input.value));
    renderer("");
  };

  renderStatus();
  renderStatistics();
  renderShowcase();

  bindSearch("changelog-search", renderChangelog);
  bindSearch("news-search", renderNews);
  bindSearch("faq-search", renderFaq);
  bindSearch("downloads-search", renderDownloads);
  bindSearch("universal-search", renderUniversalSearch);
})();
