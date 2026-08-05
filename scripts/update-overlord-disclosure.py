#!/usr/bin/env python3

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent.parent
DATABASE_PATH = ROOT / "data" / "rat-database.json"
ENTRY_ID = "CWN-RAT-2026-0001"

TELEGRAM_URL = "https://t.me/Onimai"
TELEGRAM_HANDLE = "@Onimai"
REPOSITORY_URL = "https://github.com/vxaboveground/Overlord"
SECURITY_URL = "https://github.com/vxaboveground/Overlord/security"


def load_database() -> dict[str, Any]:
    if not DATABASE_PATH.is_file():
        raise FileNotFoundError(
            f"Database file does not exist: {DATABASE_PATH}"
        )

    with DATABASE_PATH.open("r", encoding="utf-8") as file:
        data = json.load(file)

    if not isinstance(data, dict):
        raise ValueError("Database root must be a JSON object.")

    if not isinstance(data.get("entries"), list):
        raise ValueError("Database must contain an entries array.")

    return data


def find_entry(data: dict[str, Any]) -> dict[str, Any]:
    for entry in data["entries"]:
        if isinstance(entry, dict) and entry.get("id") == ENTRY_ID:
            return entry

    raise ValueError(f"Entry not found: {ENTRY_ID}")


def upsert_by_key(
    collection: list[dict[str, Any]],
    key: str,
    value: str,
    replacement: dict[str, Any],
) -> None:
    for index, item in enumerate(collection):
        if isinstance(item, dict) and item.get(key) == value:
            collection[index] = replacement
            return

    collection.append(replacement)


def remove_badges_by_label(
    badges: list[dict[str, Any]],
    labels: set[str],
) -> None:
    badges[:] = [
        badge
        for badge in badges
        if not (
            isinstance(badge, dict)
            and str(badge.get("label", "")) in labels
        )
    ]


def update_database(data: dict[str, Any]) -> None:
    entry = find_entry(data)

    database_metadata = data.setdefault("database", {})
    database_metadata["lastUpdated"] = datetime.now(
        timezone.utc
    ).date().isoformat()

    source_repository = entry.setdefault("sourceRepository", {})
    source_repository.update(
        {
            "url": REPOSITORY_URL,
            "owner": "vxaboveground",
            "repository": "Overlord",
            "relationship": (
                "Static source comparison and build-system analysis linked "
                "the analysed sample to the Overlord codebase."
            ),
            "projectDisclaimer": (
                "This entry concerns the analysed sample, its compiled "
                "configuration and associated deployment evidence. It is not "
                "an allegation against every contributor, fork, researcher "
                "or legitimate user of the public repository."
            ),
        }
    )

    entry["githubDisclosure"] = {
        "status": "ready-to-report",
        "submitted": False,
        "reference": None,
        "submittedAt": None,
        "repositoryUrl": REPOSITORY_URL,
        "reportUrl": SECURITY_URL,
        "statement": (
            "Community Watch Network has prepared a disclosure package. "
            "At the time of this database snapshot, no GitHub report has "
            "been confirmed as submitted. Publishing this database entry "
            "does not automatically submit a report to GitHub."
        ),
        "disclaimer": (
            "GitHub determines whether repository content violates its "
            "policies. CWN is supplying technical evidence for review and "
            "does not claim that every repository contributor participated "
            "in malicious activity."
        ),
    }

    communications = entry.setdefault("communications", [])
    if not isinstance(communications, list):
        communications = []
        entry["communications"] = communications

    upsert_by_key(
        communications,
        "evidenceId",
        "CWN-EVD-OVD-0006",
        {
            "platform": "Telegram",
            "handle": TELEGRAM_HANDLE,
            "url": TELEGRAM_URL,
            "relationship": (
                "Public contact reference associated with the project "
                "repository."
            ),
            "status": "publicly-observed",
            "confidence": "high",
            "evidenceId": "CWN-EVD-OVD-0006",
            "limitation": (
                "The existence of a public contact reference does not, by "
                "itself, establish who built, distributed or operated the "
                "analysed sample."
            ),
        },
    )

    badges = entry.setdefault("badges", [])
    if not isinstance(badges, list):
        badges = []
        entry["badges"] = badges

    remove_badges_by_label(
        badges,
        {
            "GitHub Report Pending",
            "GitHub Report Submitted",
            "Public Contact Located",
        },
    )

    badges.extend(
        [
            {
                "label": "Public Contact Located",
                "type": "info",
            },
            {
                "label": "GitHub Report Ready",
                "type": "pending",
            },
        ]
    )

    evidence = entry.setdefault("evidence", [])
    if not isinstance(evidence, list):
        evidence = []
        entry["evidence"] = evidence

    upsert_by_key(
        evidence,
        "id",
        "CWN-EVD-OVD-0006",
        {
            "id": "CWN-EVD-OVD-0006",
            "title": "Public Telegram reference",
            "description": (
                "The public project repository references the Telegram "
                f"account {TELEGRAM_HANDLE}."
            ),
            "source": REPOSITORY_URL,
            "status": "public-source-observation",
            "limitation": (
                "This evidence records a public association only and does "
                "not independently identify the sample operator."
            ),
        },
    )

    timeline = entry.setdefault("timeline", [])
    if not isinstance(timeline, list):
        timeline = []
        entry["timeline"] = timeline

    upsert_by_key(
        timeline,
        "title",
        "Disclosure package prepared",
        {
            "time": datetime.now(timezone.utc).date().isoformat(),
            "title": "Disclosure package prepared",
            "description": (
                "Community Watch Network completed a responsible-disclosure "
                "draft containing sample identifiers, configuration evidence, "
                "source-code correlation and attribution limitations."
            ),
        },
    )

    limitations = entry.setdefault("limitations", [])
    if not isinstance(limitations, list):
        limitations = []
        entry["limitations"] = limitations

    required_limitations = [
        (
            "The public Telegram reference does not independently establish "
            "the identity of the sample builder, distributor or operator."
        ),
        (
            "Publishing this database entry does not automatically submit a "
            "report to GitHub."
        ),
        (
            "GitHub must independently assess whether the repository or its "
            "content violates platform policy."
        ),
        (
            "The findings concern the analysed sample and do not allege that "
            "every contributor or user of the repository acted maliciously."
        ),
    ]

    for limitation in required_limitations:
        if limitation not in limitations:
            limitations.append(limitation)


def main() -> None:
    data = load_database()
    update_database(data)

    DATABASE_PATH.write_text(
        json.dumps(data, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )

    print(f"Updated: {DATABASE_PATH}")
    print(f"Entry:   {ENTRY_ID}")
    print("Status:  ready-to-report")


if __name__ == "__main__":
    main()
