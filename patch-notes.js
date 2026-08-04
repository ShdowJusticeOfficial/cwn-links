(() => {
  "use strict";

  const form = document.querySelector("#patch-note-form");
  const output = document.querySelector("#patch-output");
  const copyButton = document.querySelector("#copy-patch-notes");
  const downloadButton = document.querySelector("#download-patch-notes");
  const clearButton = document.querySelector("#clear-patch-notes");

  if (!form || !output) {
    return;
  }

  const value = (id) =>
    document.getElementById(id)?.value.trim() || "";

  const lines = (id) =>
    value(id)
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

  const formatDate = (date) => {
    const parsed = new Date(`${date}T00:00:00`);

    return Number.isNaN(parsed.getTime())
      ? date
      : parsed.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric"
        });
  };

  const markdownList = (title, items) => {
    if (items.length === 0) {
      return "";
    }

    return `## ${title}\n${items.map((item) => `- ${item}`).join("\n")}\n`;
  };

  const discordList = (emoji, title, items) => {
    if (items.length === 0) {
      return "";
    }

    return `**${emoji} ${title}**\n${items.map((item) => `• ${item}`).join("\n")}\n`;
  };

  const collect = () => ({
    version: value("patch-version"),
    title: value("patch-title"),
    date: value("patch-date"),
    summary: value("patch-summary"),
    added: lines("patch-added"),
    changed: lines("patch-changed"),
    fixed: lines("patch-fixed"),
    security: lines("patch-security")
  });

  const generate = () => {
    const release = collect();
    const format = value("patch-format");

    if (format === "json") {
      output.value = JSON.stringify(release, null, 2);
      return;
    }

    if (format === "discord") {
      output.value = [
        `# 🚀 CWN Portal v${release.version}`,
        `**${release.title}**`,
        `📅 ${formatDate(release.date)}`,
        "",
        release.summary,
        "",
        discordList("✨", "Added", release.added),
        discordList("🔄", "Changed", release.changed),
        discordList("🛠️", "Fixed", release.fixed),
        discordList("🔒", "Security", release.security),
        `\n**Community Watch Network Portal · v${release.version}**`
      ].filter(Boolean).join("\n");
      return;
    }

    if (format === "plain") {
      const plainGroup = (title, items) =>
        items.length
          ? `${title}\n${items.map((item) => `- ${item}`).join("\n")}\n`
          : "";

      output.value = [
        `CWN Portal v${release.version}`,
        release.title,
        formatDate(release.date),
        "",
        release.summary,
        "",
        plainGroup("ADDED", release.added),
        plainGroup("CHANGED", release.changed),
        plainGroup("FIXED", release.fixed),
        plainGroup("SECURITY", release.security)
      ].filter(Boolean).join("\n");
      return;
    }

    output.value = [
      `# CWN Portal v${release.version}`,
      "",
      `**${release.title}**`,
      "",
      `Released: ${formatDate(release.date)}`,
      "",
      release.summary,
      "",
      markdownList("Added", release.added),
      markdownList("Changed", release.changed),
      markdownList("Fixed", release.fixed),
      markdownList("Security", release.security)
    ].filter(Boolean).join("\n");
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    generate();
  });

  copyButton.addEventListener("click", async () => {
    await navigator.clipboard.writeText(output.value);
    copyButton.textContent = "Copied";

    setTimeout(() => {
      copyButton.textContent = "Copy Output";
    }, 1400);
  });

  downloadButton.addEventListener("click", () => {
    const format = value("patch-format");
    const extension = format === "json"
      ? "json"
      : format === "markdown"
        ? "md"
        : "txt";

    const blob = new Blob([output.value], {
      type: "text/plain;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `cwn-portal-v${value("patch-version")}-patch-notes.${extension}`;
    anchor.click();

    URL.revokeObjectURL(url);
  });

  clearButton.addEventListener("click", () => {
    form.reset();
    output.value = "";
  });

  generate();
})();
