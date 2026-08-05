"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const crypto = require("crypto");

const root = path.resolve(__dirname, "..");

const dataPath = path.join(
  root,
  "assets/js/rat-data.js"
);

const outputDirectory = path.join(
  root,
  "reports/github"
);

fs.mkdirSync(outputDirectory, {
  recursive: true
});

const source = fs.readFileSync(
  dataPath,
  "utf8"
);

const context = {
  window: {}
};

vm.createContext(context);

vm.runInContext(
  source,
  context,
  {
    filename: dataPath
  }
);

const entries = context.window.CWN_RAT_DATABASE;

if (!Array.isArray(entries)) {
  throw new Error(
    "CWN_RAT_DATABASE was not loaded."
  );
}

function safe(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Not available";
  }

  return String(value);
}

function hashText(value) {
  return crypto
    .createHash("sha256")
    .update(value)
    .digest("hex");
}

function buildReport(entry) {
  const repositoryUrl =
    entry.github?.repositoryUrl ||
    "[EXACT REPOSITORY URL REQUIRED BEFORE SUBMISSION]";

  const techniques = (entry.mitre || [])
    .map((technique) =>
      `- ${technique.id}: ${technique.name} ` +
      `(${technique.confidence})`
    )
    .join("\n");

  const evidence = (
    entry.github?.publicEvidence ||
    []
  )
    .map((finding) => `- ${finding}`)
    .join("\n");

  const limitations = (
    entry.limitations ||
    []
  )
    .map((limitation) => `- ${limitation}`)
    .join("\n");

  const withheld = (
    entry.disclosure?.withheldItems ||
    []
  )
    .map((item) => `- ${item}`)
    .join("\n");

  return `# GitHub Abuse Review Request

## Report status

Prepared by Community Watch Network.

This document has not automatically been submitted to GitHub.

## Target

- Repository: ${repositoryUrl}
- Repository owner: ${safe(entry.github?.repositoryOwner)}
- Repository name: ${safe(entry.github?.repositoryName)}
- Requested category: ${safe(entry.github?.reportCategory)}

## Reason for report

${safe(entry.github?.concernSummary)}

CWN requests an independent GitHub policy review. CWN is not requesting
enforcement solely because the repository contains offensive-security,
administration or dual-use functionality.

## Analysed sample

- CWN case ID: ${safe(entry.id)}
- Family: ${safe(entry.name)}
- Classification: ${safe(entry.classification)}
- SHA-256: ${safe(entry.sample?.sha256)}
- Format: ${safe(entry.sample?.format)}
- Architecture: ${safe(entry.sample?.architecture)}
- Language: ${safe(entry.sample?.language)}
- Size: ${safe(entry.sample?.sizeBytes)} bytes
- First observed: ${safe(entry.firstObserved)}
- Last analysed: ${safe(entry.lastUpdated)}

## Recovered infrastructure

- Endpoint: ${safe(entry.infrastructure?.endpoint)}
- IPv4 address: ${safe(entry.infrastructure?.ip)}
- TCP port: ${safe(entry.infrastructure?.port)}
- Hosting provider: ${safe(entry.infrastructure?.hosting)}
- ASN: ${safe(entry.infrastructure?.asn)}
- Country: ${safe(entry.infrastructure?.country)}

The hosting provider and ASN identify infrastructure allocation only. They
do not independently identify or implicate the customer or operator.

## Compiled configuration

- Mutex: ${safe(entry.configuration?.mutex)}
- Build ID: ${safe(entry.configuration?.buildId)}
- Internal builder UID: ${safe(entry.configuration?.builderUid)}
- Build-token issuance time: ${safe(entry.configuration?.issuedAt)}
- Token signature independently verified: ${
    entry.configuration?.tokenVerified
      ? "Yes"
      : "No"
  }

The internal builder UID is a server-side account identifier. It does not
identify a real-world person without corroborating account records.

## Relevant findings

${evidence || "- No public evidence recorded"}

## MITRE ATT&CK mapping

${techniques || "- No techniques recorded"}

## Information withheld

${withheld || "- No withheld information recorded"}

## Limitations

${limitations || "- No limitations recorded"}

## Requested action

Please assess:

1. Whether the repository is legitimate dual-use research.
2. Whether it supports an active harmful malware campaign.
3. Whether credentials, victim data or operational malware binaries are
   exposed.
4. Whether preservation, restriction or enforcement is appropriate under
   GitHub policy.

## Public disclosure statement

CWN may publish redacted defensive indicators, capability descriptions,
hashes, evidence IDs and detection material.

CWN does not intentionally publish:

- executable malware downloads;
- complete authentication credentials;
- private signing keys;
- victim data;
- instructions for operating malware;
- unsupported real-world attribution claims.

## Evidential disclaimer

Repository ownership does not independently prove malware operation.
Hosting allocation does not independently identify an operator. Embedded
command support does not prove that every command was executed against a
victim.

Publication in the CWN RAT Database does not automatically submit this
report to GitHub.
`;
}

const manifestLines = [];

for (const entry of entries) {
  if (!entry.github) {
    continue;
  }

  const report = buildReport(entry);

  const reportFilename =
    `${entry.id}-GITHUB-REPORT.md`;

  const outputPath = path.join(
    outputDirectory,
    reportFilename
  );

  fs.writeFileSync(
    outputPath,
    report,
    "utf8"
  );

  manifestLines.push(
    `${hashText(report)}  ${reportFilename}`
  );

  console.log(
    `Generated: ${outputPath}`
  );
}

const manifestPath = path.join(
  outputDirectory,
  "SHA256SUMS.txt"
);

fs.writeFileSync(
  manifestPath,
  `${manifestLines.sort().join("\n")}\n`,
  "utf8"
);

console.log(
  `Manifest: ${manifestPath}`
);

console.log("");
console.log(
  "Important: reports were prepared but were not submitted."
);
