# Community Watch Network Responsible Disclosure

## Repository

https://github.com/vxaboveground/Overlord

## Summary

Community Watch Network (CWN) performed a static analysis of an analysed Windows executable believed to originate from the Overlord codebase.

The analysis identified:

- Compiled fallback server: 85.17.116.161:5173
- Compiled mutex: mptUc1YfsqC.U48angOzGZXX
- Embedded build ID:
  2fc41d73-b0f4-41d2-ab0a-c2ed660f4f01
- Internal builder account ID:
  1
- Embedded token issuance:
  2026-07-14T16:08:05Z

## Evidence

Payload SHA-256

7de2665b2a9448aa7ca54251b3b985784305796963f19a299337203a532fffbc

Repository

https://github.com/vxaboveground/Overlord

Public Telegram reference

https://t.me/Onimai

## Important limitations

This report is based on static analysis.

The embedded panel account identifier does not identify a real-world individual.

The hosting provider allocation does not identify the operator.

The Telegram reference is publicly listed in the repository and is not, by itself, proof of ownership or operation.

This report does not allege that every contributor to the repository participated in malicious activity.

The purpose of this report is to assist GitHub with an independent review.
