"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root =
  path.resolve(
    __dirname,
    "..",
    "dist"
  );

const prohibitedPatterns = [
  {
    name: "Discord webhook",
    pattern:
      /https:\/\/(?:canary\.|ptb\.)?discord(?:app)?\.com\/api\/webhooks\/\d+\/[A-Za-z0-9._-]+/i
  },
  {
    name: "Turnstile secret variable value",
    pattern:
      /TURNSTILE_SECRET_KEY\s*[:=]\s*["'][^"']+["']/i
  },
  {
    name: "Discord webhook variable value",
    pattern:
      /DISCORD_BUG_WEBHOOK_URL\s*[:=]\s*["']https?:\/\/[^"']+["']/i
  },
  {
    name: "Private key material",
    pattern:
      /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/
  }
];

const textExtensions =
  new Set([
    ".html",
    ".js",
    ".css",
    ".json",
    ".txt",
    ".md"
  ]);

let failed = false;

function scan(directory) {
  for (
    const entry of
    fs.readdirSync(
      directory,
      {
        withFileTypes: true
      }
    )
  ) {
    const absolute =
      path.join(
        directory,
        entry.name
      );

    if (entry.isDirectory()) {
      scan(absolute);
      continue;
    }

    if (
      !textExtensions.has(
        path.extname(
          entry.name
        ).toLowerCase()
      )
    ) {
      continue;
    }

    const content =
      fs.readFileSync(
        absolute,
        "utf8"
      );

    for (
      const check of
      prohibitedPatterns
    ) {
      if (
        check.pattern.test(
          content
        )
      ) {
        failed = true;

        console.error(
          `Possible ${check.name} found in ${
            path.relative(root, absolute)
          }`
        );
      }
    }
  }
}

if (!fs.existsSync(root)) {
  throw new Error(
    "dist/ does not exist."
  );
}

scan(root);

if (failed) {
  process.exitCode = 1;
} else {
  console.log(
    "No prohibited secrets found in production output."
  );
}
