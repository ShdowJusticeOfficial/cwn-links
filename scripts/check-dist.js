"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } =
  require("node:child_process");

const config =
  require("../build.config");

const root =
  path.resolve(
    __dirname,
    "..",
    config.outputDirectory
  );

if (!fs.existsSync(root)) {
  throw new Error(
    "dist/ does not exist. Run npm run build first."
  );
}

const requiredFiles = [
  ...config.htmlFiles,
  ...config.cssFiles,
  ...config.obfuscateJavaScript,
  ...config.readableJavaScript,
  ...config.serverJavaScript
];

let failed = false;

for (
  const relativePath of
  requiredFiles
) {
  const absolutePath =
    path.join(root, relativePath);

  if (!fs.existsSync(absolutePath)) {
    console.error(
      `Missing production file: ${relativePath}`
    );

    failed = true;
    continue;
  }

  if (
    relativePath.endsWith(".js")
  ) {
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
        `Production syntax OK: ${relativePath}`
      );
    } catch (error) {
      failed = true;

      console.error(
        `Production syntax failed: ${relativePath}`
      );

      console.error(
        error.stderr?.toString() ||
        error.message
      );
    }
  }
}

const sourceMapFiles = [];

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
      entry.name.endsWith(".map")
    ) {
      sourceMapFiles.push(absolute);
    }
  }
}

scan(root);

if (sourceMapFiles.length > 0) {
  failed = true;

  console.error(
    "Production source maps were found:"
  );

  sourceMapFiles.forEach(
    (file) =>
      console.error(file)
  );
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log(
    "Production validation completed successfully."
  );
}
