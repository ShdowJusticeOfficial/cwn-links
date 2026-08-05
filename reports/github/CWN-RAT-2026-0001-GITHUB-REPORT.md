# GitHub Abuse Review Request

## Report status

Prepared by Community Watch Network.

This document has not automatically been submitted to GitHub.

## Target

- Repository: [EXACT REPOSITORY URL REQUIRED BEFORE SUBMISSION]
- Repository owner: Not available
- Repository name: Not available
- Requested category: Active malware or exploit concern

## Reason for report

The repository appears associated with a remote-access framework possessing surveillance, persistence and remote-control capabilities. Static analysis recovered an individually configured Windows agent build and an operational fallback endpoint. GitHub should independently determine whether the repository is protected dual-use research or supports active harmful deployment.

CWN requests an independent GitHub policy review. CWN is not requesting
enforcement solely because the repository contains offensive-security,
administration or dual-use functionality.

## Analysed sample

- CWN case ID: CWN-RAT-2026-0001
- Family: Overlord
- Classification: Remote Access Trojan
- SHA-256: 7de2665b2a9448aa7ca54251b3b985784305796963f19a299337203a532fffbc
- Format: PE32+ Windows executable
- Architecture: x86-64
- Language: Go
- Size: 16377344 bytes
- First observed: 2026-07-14
- Last analysed: 2026-08-05

## Recovered infrastructure

- Endpoint: 85.17.116.161:5173
- IPv4 address: 85.17.116.161
- TCP port: 5173
- Hosting provider: LeaseWeb Netherlands B.V.
- ASN: AS60781
- Country: Netherlands

The hosting provider and ASN identify infrastructure allocation only. They
do not independently identify or implicate the customer or operator.

## Compiled configuration

- Mutex: mptUc1YfsqC.U48angOzGZXX
- Build ID: 2fc41d73-b0f4-41d2-ab0a-c2ed660f4f01
- Internal builder UID: 1
- Build-token issuance time: 2026-07-14T16:08:05+00:00
- Token signature independently verified: No

The internal builder UID is a server-side account identifier. It does not
identify a real-world person without corroborating account records.

## Relevant findings

- The compiled endpoint is loaded as the default server value.
- The endpoint is used by fallback server-list logic.
- A specific build UUID is embedded in the analysed sample.
- An internal builder UID and issuance time are embedded.
- Remote desktop, file, keylogging, webcam and audio capabilities exist.
- Seventy-seven exact repository-derived commands were recovered.

## MITRE ATT&CK mapping

- T1056.001: Input Capture: Keylogging (High)
- T1113: Screen Capture (High)
- T1125: Video Capture (High)
- T1123: Audio Capture (High)
- T1105: Ingress Tool Transfer (High)
- T1083: File and Directory Discovery (High)
- T1106: Native API (Medium)
- T1057: Process Discovery (High)
- T1489: Service Stop (Low)
- T1547.001: Registry Run Keys / Startup Folder (High)
- T1071.001: Web Protocols (High)

## Information withheld

- Complete embedded agent authentication token
- Complete signed build token
- Any private signing secret or signing key
- Executable malware sample
- Decrypted payload download
- Instructions for operating command-and-control infrastructure
- Any unrelated personal information

## Limitations

- The suspicious payload was not executed.
- No connection was made to the suspected endpoint.
- No remote service was authenticated against.
- The complete token signature has not been independently verified.
- No originating server database was recovered.
- No hosting subscriber records were obtained.
- Internal builder UID 1 is not a real-world identity.
- The command inventory proves capability presence, not command usage.
- Repository authorship does not independently prove malware operation.
- Hosting allocation does not independently identify the operator.

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
