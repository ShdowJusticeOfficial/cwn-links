"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

const files = [
  ["rat-database.html", "rat-database.html"],
  [
    "assets/css/rat-database.css",
    "assets/css/rat-database.css",
  ],
  [
    "assets/js/rat-database.js",
    "assets/js/rat-database.js",
  ],
  [
    "data/rat-database.json",
    "data/rat-database.json",
  ],
];

function copyFile(sourceRelative, destinationRelative) {
  const source = path.join(root, sourceRelative);
  const destination = path.join(dist, destinationRelative);

  if (!fs.existsSync(source)) {
    throw new Error(`Required source file is missing: ${sourceRelative}`);
  }

  fs.mkdirSync(path.dirname(destination), {
    recursive: true,
  });

  fs.copyFileSync(source, destination);

  console.log(
    `[RAT Database] Copied ${sourceRelative} -> dist/${destinationRelative}`,
  );
}

if (!fs.existsSync(dist)) {
  fs.mkdirSync(dist, {
    recursive: true,
  });
}

for (const [source, destination] of files) {
  copyFile(source, destination);
}

console.log("[RAT Database] Deployment files copied successfully.");
