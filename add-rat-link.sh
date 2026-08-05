#!/data/data/com.termux/files/usr/bin/bash
set -e

INDEX="index.html"

if grep -q 'href="rat-database.html"' "$INDEX"; then
    echo "✔ RAT Database link already exists."
    exit 0
fi

python3 <<'PY'
from pathlib import Path

path = Path("index.html")
text = path.read_text(encoding="utf-8")

card = """
<a
  class="link-card"
  href="rat-database.html"
>
  <span class="link-icon">🛡️</span>

  <span class="link-content">
    <strong>CWN RAT Database</strong>

    <small>
      Defensive malware intelligence, IOCs, evidence records,
      MITRE ATT&CK mappings and disclosure status.
    </small>
  </span>
</a>
"""

markers = [
    "</main>",
    "</section>",
    "</div>"
]

for marker in markers:
    if marker in text:
        text = text.replace(marker, card + "\n\n" + marker, 1)
        path.write_text(text, encoding="utf-8")
        print("✔ Added RAT Database link.")
        raise SystemExit

print("❌ Couldn't find a suitable place to insert the card.")
PY
