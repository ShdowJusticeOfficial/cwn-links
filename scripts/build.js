"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const terser = require("terser");
const JavaScriptObfuscator =
  require("javascript-obfuscator");
const { minify: minifyHtml } =
  require("html-minifier-terser");
const CleanCSS = require("clean-css");

const config = require("../build.config");

const root = path.resolve(__dirname, "..");
const outputRoot = path.join(
  root,
  config.outputDirectory
);

const report = {
  generatedAt: new Date().toISOString(),
  outputDirectory: config.outputDirectory,
  files: [],
  totals: {
    sourceBytes: 0,
    outputBytes: 0
  }
};

function exists(relativePath) {
  return fs.existsSync(
    path.join(root, relativePath)
  );
}

function read(relativePath) {
  return fs.readFileSync(
    path.join(root, relativePath),
    "utf8"
  );
}

function ensureParent(relativePath) {
  fs.mkdirSync(
    path.dirname(
      path.join(outputRoot, relativePath)
    ),
    {
      recursive: true
    }
  );
}

function write(relativePath, content) {
  ensureParent(relativePath);

  fs.writeFileSync(
    path.join(outputRoot, relativePath),
    content
  );
}

function record(
  relativePath,
  type,
  sourceContent,
  outputContent
) {
  const sourceBytes =
    Buffer.byteLength(sourceContent);

  const outputBytes =
    Buffer.byteLength(outputContent);

  report.files.push({
    path: relativePath,
    type,
    sourceBytes,
    outputBytes,
    reductionPercent:
      sourceBytes === 0
        ? 0
        : Number(
            (
              100 -
              (outputBytes / sourceBytes) *
                100
            ).toFixed(2)
          ),
    sha256: crypto
      .createHash("sha256")
      .update(outputContent)
      .digest("hex")
  });

  report.totals.sourceBytes +=
    sourceBytes;

  report.totals.outputBytes +=
    outputBytes;
}

function copyFile(relativePath, type = "copy") {
  if (!exists(relativePath)) {
    console.log(
      `Skipping missing optional file: ${relativePath}`
    );

    return;
  }

  const sourcePath =
    path.join(root, relativePath);

  const outputPath =
    path.join(outputRoot, relativePath);

  ensureParent(relativePath);

  fs.copyFileSync(
    sourcePath,
    outputPath
  );

  const source =
    fs.readFileSync(sourcePath);

  record(
    relativePath,
    type,
    source,
    source
  );

  console.log(
    `Copied ${relativePath}`
  );
}

async function minifyJavaScript(
  relativePath,
  shouldObfuscate
) {
  if (!exists(relativePath)) {
    throw new Error(
      `Required JavaScript file is missing: ${relativePath}`
    );
  }

  const source = read(relativePath);

  const minified = await terser.minify(
    source,
    {
      compress: {
        passes: 2,
        dead_code: true,
        drop_console: false,
        drop_debugger: true
      },

      mangle: {
        keep_classnames: true,
        keep_fnames: false
      },

      format: {
        comments: false,
        ascii_only: true
      },

      /*
       * No production source map is emitted.
       */
      sourceMap: false
    }
  );

  if (!minified.code) {
    throw new Error(
      `Terser returned no output for ${relativePath}`
    );
  }

  let output = minified.code;
  let type = "javascript-minified";

  if (shouldObfuscate) {
    output =
      JavaScriptObfuscator.obfuscate(
        output,
        {
          compact: true,

          /*
           * Moderate protection settings.
           * Avoid high-cost control-flow flattening.
           */
          /*
           * Moderate control-flow protection. Keep the threshold low
           * to avoid excessive bundle growth and performance loss.
           */
          controlFlowFlattening: true,
          controlFlowFlatteningThreshold: 0.16,

          /*
           * Dead-code injection causes large bundles and is deliberately
           * kept disabled.
           */
          deadCodeInjection: false,

          stringArray: true,
          stringArrayThreshold: 0.72,
          stringArrayEncoding: [
            "base64"
          ],
          stringArrayCallsTransform: true,
          stringArrayCallsTransformThreshold: 0.35,
          stringArrayWrappersCount: 2,
          stringArrayWrappersChainedCalls: true,
          stringArrayWrappersParametersMaxCount: 3,
          stringArrayWrappersType: "function",

          rotateStringArray: true,
          shuffleStringArray: true,

          splitStrings: true,
          splitStringsChunkLength: 7,

          numbersToExpressions: true,
          simplify: true,
          unicodeEscapeSequence: false,

          /*
           * These settings frequently interfere with debugging and
           * browser compatibility, so they remain disabled.
           */
          selfDefending: false,
          debugProtection: false,
          debugProtectionInterval: 0,
          disableConsoleOutput: false,

          identifierNamesGenerator:
            "mangled-shuffled",

          renameGlobals: false,
          renameProperties: false,
          transformObjectKeys: false,

          /*
           * Deterministic builds.
           */
          seed: 3366
        }
      )
      .getObfuscatedCode();

    type =
      "javascript-minified-obfuscated";
  }

  write(relativePath, output);

  record(
    relativePath,
    type,
    source,
    output
  );

  console.log(
    `${shouldObfuscate ? "Protected" : "Minified"} ${relativePath}`
  );
}

function minifyCss(relativePath) {
  if (!exists(relativePath)) {
    throw new Error(
      `Required CSS file is missing: ${relativePath}`
    );
  }

  const source = read(relativePath);

  const result =
    new CleanCSS({
      level: {
        1: {
          all: true
        },

        2: {
          restructureRules: true
        }
      },

      sourceMap: false
    }).minify(source);

  if (result.errors.length > 0) {
    throw new Error(
      `${relativePath}: ${result.errors.join("; ")}`
    );
  }

  const output = result.styles;

  write(relativePath, output);

  record(
    relativePath,
    "css-minified",
    source,
    output
  );

  console.log(
    `Minified ${relativePath}`
  );
}

async function minifyHtmlFile(relativePath) {
  if (!exists(relativePath)) {
    throw new Error(
      `Required HTML file is missing: ${relativePath}`
    );
  }

  const source = read(relativePath);

  const output = await minifyHtml(
    source,
    {
      collapseWhitespace: true,
      conservativeCollapse: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      removeEmptyAttributes: false,
      removeOptionalTags: false,
      sortAttributes: false,
      sortClassName: false,
      minifyCSS: true,

      /*
       * External JS has already been processed separately.
       * Inline scripts are minified but not obfuscated.
       */
      minifyJS: {
        compress: {
          passes: 2
        },
        mangle: true,
        format: {
          comments: false
        }
      },

      processConditionalComments: true,
      keepClosingSlash: true,
      caseSensitive: true
    }
  );

  write(relativePath, output);

  record(
    relativePath,
    "html-minified",
    source,
    output
  );

  console.log(
    `Minified ${relativePath}`
  );
}

function writeBuildMetadata() {
  const sourceBytes =
    report.totals.sourceBytes;

  const outputBytes =
    report.totals.outputBytes;

  report.totals.reductionPercent =
    sourceBytes === 0
      ? 0
      : Number(
          (
            100 -
            (outputBytes / sourceBytes) *
              100
          ).toFixed(2)
        );

  const metadata = {
    version:
      require("../package.json").version,
    builtAt: report.generatedAt,
    build:
      "production-minified-obfuscated",
    sourceMaps: false
  };

  write(
    "build-info.json",
    JSON.stringify(
      metadata,
      null,
      2
    )
  );

  fs.writeFileSync(
    path.join(root, "build-report.json"),
    JSON.stringify(
      report,
      null,
      2
    )
  );
}

async function main() {
  console.log(
    "Building CWN production portal..."
  );

  fs.rmSync(
    outputRoot,
    {
      recursive: true,
      force: true
    }
  );

  fs.mkdirSync(
    outputRoot,
    {
      recursive: true
    }
  );

  for (
    const file of
    config.obfuscateJavaScript
  ) {
    await minifyJavaScript(
      file,
      true
    );
  }

  for (
    const file of
    config.readableJavaScript
  ) {
    await minifyJavaScript(
      file,
      false
    );
  }

  for (
    const file of
    config.serverJavaScript
  ) {
    copyFile(
      file,
      "server-javascript"
    );
  }

  for (
    const file of
    config.cssFiles
  ) {
    minifyCss(file);
  }

  for (
    const file of
    config.htmlFiles
  ) {
    await minifyHtmlFile(file);
  }

  for (
    const file of
    config.staticFiles
  ) {
    copyFile(
      file,
      "static"
    );
  }

  writeBuildMetadata();

  console.log("");
  console.log(
    `Build complete: ${config.outputDirectory}/`
  );

  console.log(
    `Overall reduction: ${report.totals.reductionPercent}%`
  );

  console.log(
    "Production source maps: disabled"
  );
}

main().catch((error) => {
  console.error("");
  console.error(
    "Production build failed:"
  );

  console.error(
    error.stack ||
    error.message ||
    error
  );

  process.exitCode = 1;
});
