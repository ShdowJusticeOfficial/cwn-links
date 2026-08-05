"use strict";

const DATA_URL = "data/rat-database.json";

const elements = {
  entryList: document.querySelector("#rat-entries"),
  loadingPanel: document.querySelector("#database-status"),
  searchInput: document.querySelector("#search-input"),
  severityFilter: document.querySelector("#severity-filter"),
  totalEntries: document.querySelector("#entry-count"),
  criticalEntries: document.querySelector("#critical-count"),
  lastUpdated: document.querySelector("#last-updated"),
};

let databaseEntries = [];

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalise(value) {
  return String(value ?? "").trim().toLowerCase();
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return escapeHTML(value);
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
    timeStyle: value.includes("T") ? "medium" : undefined,
    timeZone: value.endsWith("Z") ? "UTC" : undefined,
  }).format(date);
}

function renderBadges(badges = []) {
  if (!Array.isArray(badges) || badges.length === 0) {
    return "";
  }

  return `
    <div class="badge-list" aria-label="Entry badges">
      ${badges
        .map((badge) => {
          const type = normalise(badge.type) || "neutral";

          return `
            <span class="badge badge-${escapeHTML(type)}">
              ${escapeHTML(badge.label)}
            </span>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderDetails(entry) {
  const sample = entry.sample ?? {};
  const config = entry.compiledConfiguration ?? {};
  const network = entry.networkAttribution ?? {};

  const details = [
    ["Family", entry.family],
    ["Confidence", entry.confidence],
    ["Status", entry.status],
    ["SHA-256", sample.sha256],
    ["Sample size", sample.sizeBytes
      ? `${Number(sample.sizeBytes).toLocaleString()} bytes`
      : "Not available"],
    ["Format", sample.format],
    ["Architecture", sample.architecture],
    ["Language", sample.language],
    ["Compilation timestamp", sample.compilationTimestamp
      ? formatDate(sample.compilationTimestamp)
      : "Not available"],
    ["Fallback server", config.fallbackServer],
    ["Mutex", config.mutex],
    ["Build ID", config.buildId],
    ["Builder account ID", config.builderAccountId],
    ["Token issued", config.tokenIssuedAt
      ? formatDate(config.tokenIssuedAt)
      : "Not available"],
    ["Hosting provider", network.provider],
    ["ASN", network.asn],
    ["Country", network.country],
  ];

  return `
    <div class="detail-grid">
      ${details
        .map(([label, value]) => `
          <div class="detail-item">
            <span>${escapeHTML(label)}</span>
            <code>${escapeHTML(value ?? "Not available")}</code>
          </div>
        `)
        .join("")}
    </div>
  `;
}

function renderIOCSection(iocs = []) {
  if (!Array.isArray(iocs) || iocs.length === 0) {
    return "<p>No indicators are currently published.</p>";
  }

  return `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Value</th>
            <th>Confidence</th>
            <th>Context</th>
          </tr>
        </thead>

        <tbody>
          ${iocs
            .map((ioc) => `
              <tr>
                <td>${escapeHTML(ioc.type)}</td>
                <td><code>${escapeHTML(ioc.value)}</code></td>
                <td>${escapeHTML(ioc.confidence)}</td>
                <td>${escapeHTML(ioc.context)}</td>
              </tr>
            `)
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderMITRESection(techniques = []) {
  if (!Array.isArray(techniques) || techniques.length === 0) {
    return "<p>No MITRE ATT&CK techniques are currently mapped.</p>";
  }

  return `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Technique</th>
            <th>Name</th>
            <th>Evidence basis</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          ${techniques
            .map((technique) => `
              <tr>
                <td><code>${escapeHTML(technique.id)}</code></td>
                <td>${escapeHTML(technique.name)}</td>
                <td>${escapeHTML(technique.basis)}</td>
                <td>${escapeHTML(technique.status)}</td>
              </tr>
            `)
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderTimeline(timeline = []) {
  if (!Array.isArray(timeline) || timeline.length === 0) {
    return "<p>No timeline events are currently published.</p>";
  }

  return `
    <div class="timeline">
      ${timeline
        .map((event) => `
          <article class="timeline-item">
            <time datetime="${escapeHTML(event.time)}">
              ${escapeHTML(formatDate(event.time))}
            </time>

            <strong>${escapeHTML(event.title)}</strong>
            <p>${escapeHTML(event.description)}</p>
          </article>
        `)
        .join("")}
    </div>
  `;
}

function renderEvidence(evidence = []) {
  if (!Array.isArray(evidence) || evidence.length === 0) {
    return "<p>No evidence records are currently published.</p>";
  }

  return `
    <ul class="evidence-list">
      ${evidence
        .map((item) => `
          <li>
            <strong>${escapeHTML(item.id)} — ${escapeHTML(item.title)}</strong>
            <span>${escapeHTML(item.description)}</span>
          </li>
        `)
        .join("")}
    </ul>
  `;
}

function renderLimitations(limitations = []) {
  if (!Array.isArray(limitations) || limitations.length === 0) {
    return "<p>No limitations were supplied.</p>";
  }

  return `
    <ul class="limitations-list">
      ${limitations
        .map((limitation) => `
          <li>${escapeHTML(limitation)}</li>
        `)
        .join("")}
    </ul>
  `;
}

function renderDisclosure(disclosure = {}) {
  const status = disclosure.status ?? "unknown";
  const submitted = disclosure.submitted === true;

  const label = submitted
    ? "GitHub report confirmed"
    : "GitHub report not confirmed";

  return `
    <div class="disclosure-card">
      <strong>${escapeHTML(label)}</strong>

      <p>
        Status:
        <code>${escapeHTML(status)}</code>
      </p>

      <p>${escapeHTML(disclosure.statement ?? "")}</p>

      ${
        disclosure.reference
          ? `
            <p>
              Reference:
              <code>${escapeHTML(disclosure.reference)}</code>
            </p>
          `
          : ""
      }

      ${
        disclosure.submittedAt
          ? `
            <p>
              Submitted:
              ${escapeHTML(formatDate(disclosure.submittedAt))}
            </p>
          `
          : ""
      }

      ${
        disclosure.reportUrl
          ? `
            <a
              class="disclosure-link"
              href="${escapeHTML(disclosure.reportUrl)}"
              target="_blank"
              rel="noopener noreferrer"
            >
              View repository security page
            </a>
          `
          : ""
      }
    </div>
  `;
}

function renderRepository(repository = {}) {
  if (!repository.url) {
    return "<p>No repository relationship is currently published.</p>";
  }

  return `
    <div class="disclosure-card">
      <strong>
        ${escapeHTML(repository.owner)}/${escapeHTML(repository.repository)}
      </strong>

      <p>${escapeHTML(repository.relationship)}</p>
      <p>${escapeHTML(repository.projectDisclaimer)}</p>

      <a
        class="disclosure-link"
        href="${escapeHTML(repository.url)}"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open source repository
      </a>
    </div>
  `;
}

function renderEntry(entry) {
  const severity = normalise(entry.severity) || "unknown";

  return `
    <article class="rat-entry" data-entry-id="${escapeHTML(entry.id)}">
      <header class="entry-header">
        <div class="entry-title-row">
          <div>
            <p class="entry-id">${escapeHTML(entry.id)}</p>
            <h2>${escapeHTML(entry.name)}</h2>

            <p class="entry-classification">
              ${escapeHTML(entry.classification)}
            </p>
          </div>

          <span class="severity-badge severity-${escapeHTML(severity)}">
            ${escapeHTML(severity)}
          </span>
        </div>

        ${renderBadges(entry.badges)}
      </header>

      <div class="entry-body">
        <section class="entry-section">
          <h3>Technical summary</h3>
          ${renderDetails(entry)}
        </section>

        <section class="entry-section">
          <h3>Indicators of compromise</h3>
          ${renderIOCSection(entry.iocs)}
        </section>

        <section class="entry-section">
          <h3>MITRE ATT&amp;CK mapping</h3>
          ${renderMITRESection(entry.mitreAttack)}
        </section>

        <section class="entry-section">
          <h3>Evidence timeline</h3>
          ${renderTimeline(entry.timeline)}
        </section>

        <section class="entry-section">
          <h3>Evidence records</h3>
          ${renderEvidence(entry.evidence)}
        </section>

        <section class="entry-section">
          <h3>Source repository relationship</h3>
          ${renderRepository(entry.sourceRepository)}
        </section>

        <section class="entry-section">
          <h3>GitHub disclosure status</h3>
          ${renderDisclosure(entry.githubDisclosure)}
        </section>

        <section class="entry-section">
          <h3>Attribution and reporting limitations</h3>
          ${renderLimitations(entry.limitations)}
        </section>

        ${
          entry.networkAttribution?.limitation
            ? `
              <section class="entry-section">
                <h3>Infrastructure attribution limitation</h3>

                <div class="notice">
                  <p>
                    ${escapeHTML(entry.networkAttribution.limitation)}
                  </p>
                </div>
              </section>
            `
            : ""
        }
      </div>
    </article>
  `;
}

function entrySearchText(entry) {
  return normalise(JSON.stringify(entry));
}

function applyFilters() {
  const searchTerm = normalise(elements.searchInput?.value);
  const severity = normalise(elements.severityFilter?.value);

  const filtered = databaseEntries.filter((entry) => {
    const matchesSearch =
      !searchTerm || entrySearchText(entry).includes(searchTerm);

    const matchesSeverity =
      !severity ||
      severity === "all" ||
      normalise(entry.severity) === severity;

    return matchesSearch && matchesSeverity;
  });

  renderEntries(filtered);
}

function renderEntries(entries) {
  if (!elements.entryList) {
    return;
  }

  if (entries.length === 0) {
    elements.entryList.innerHTML = `
      <div class="empty-state">
        No database entries match the current filters.
      </div>
    `;

    return;
  }

  elements.entryList.innerHTML = entries.map(renderEntry).join("");
}

function updateSummary(database) {
  const entries = database.entries ?? [];

  if (elements.totalEntries) {
    elements.totalEntries.textContent = String(entries.length);
  }

  if (elements.criticalEntries) {
    const criticalCount = entries.filter(
      (entry) => normalise(entry.severity) === "critical",
    ).length;

    elements.criticalEntries.textContent = String(criticalCount);
  }

  if (elements.lastUpdated) {
    elements.lastUpdated.textContent =
      database.database?.lastUpdated
        ? formatDate(database.database.lastUpdated)
        : "Unknown";
  }
}

function showError(error) {
  console.error("Failed to load RAT database:", error);

  if (elements.loadingPanel) {
    elements.loadingPanel.hidden = true;
  }

  if (elements.entryList) {
    elements.entryList.innerHTML = `
      <div class="error-state">
        <strong>Unable to load the RAT database.</strong>
        <p>
          Confirm that <code>${escapeHTML(DATA_URL)}</code> exists and that
          the page is being served through a local or hosted web server.
        </p>
      </div>
    `;
  }
}

async function loadDatabase() {
  try {
    const response = await fetch(DATA_URL, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `Database request failed with HTTP ${response.status}`,
      );
    }

    const database = await response.json();

    if (!database || !Array.isArray(database.entries)) {
      throw new TypeError(
        "Database JSON does not contain a valid entries array.",
      );
    }

    databaseEntries = database.entries;

    updateSummary(database);
    renderEntries(databaseEntries);

    if (elements.loadingPanel) {
      elements.loadingPanel.hidden = true;
    }
  } catch (error) {
    showError(error);
  }
}

elements.searchInput?.addEventListener("input", applyFilters);
elements.severityFilter?.addEventListener("change", applyFilters);

loadDatabase();
