"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } =
  require("node:child_process");

const config =
  require("../build.config");

const root =
  path.resolve(__dirname, "..");

const JavaScriptFiles = [
  ...config.obfuscateJavaScript,
  ...config.readableJavaScript,
  ...config.serverJavaScript
];

let failed = false;

for (
  const relativePath of
  JavaScriptFiles
) {
  const absolutePath =
    path.join(root, relativePath);

  if (!fs.existsSync(absolutePath)) {
    console.error(
      `Missing JavaScript file: ${relativePath}`
    );

    failed = true;
    continue;
  }

  try {
    execFileSync(
      process.execPath,
      [
        "--check",
        absolutePath
      ],
      {
        stdio: "pipe"
      }
    );

    console.log(
      `Syntax OK: ${relativePath}`
    );
  } catch (error) {
    failed = true;

    console.error(
      `Syntax failed: ${relativePath}`
    );

    console.error(
      error.stderr?.toString() ||
      error.message
    );
  }
}

for (
  const relativePath of
  config.htmlFiles
) {
  const absolutePath =
    path.join(root, relativePath);

  if (!fs.existsSync(absolutePath)) {
    console.error(
      `Missing HTML file: ${relativePath}`
    );

    failed = true;
    continue;
  }

  const html =
    fs.readFileSync(
      absolutePath,
      "utf8"
    );

  const doctypes =
    (
      html.match(
        /<!doctype html>/gi
      ) || []
    ).length;

  const bodies =
    (
      html.match(
        /<body(?:\s|>)/gi
      ) || []
    ).length;

  if (
    doctypes !== 1 ||
    bodies !== 1
  ) {
    console.error(
      `Invalid document structure: ${relativePath} ` +
      `(doctype=${doctypes}, body=${bodies})`
    );

    failed = true;
  } else {
    console.log(
      `Structure OK: ${relativePath}`
    );
  }
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log(
    "Source validation completed successfully."
  );
}
