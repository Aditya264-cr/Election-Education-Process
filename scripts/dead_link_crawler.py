"""Dead-link crawler for the Internal Law Library.

Runs as a scheduled maintenance job. It checks every external source URL in
backend/law_library/manifest.json. If a primary URL is dead, it promotes the
first healthy secondary URL into mirror_url so the app can keep showing a
trusted source chain without sending users to a broken page.
"""
from __future__ import annotations

import json
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "backend" / "law_library" / "manifest.json"
TIMEOUT_SECONDS = 12


def check_url(url: str) -> int:
    if url.startswith("internal://"):
        return 200
    request = urllib.request.Request(url, method="HEAD", headers={"User-Agent": "EEP-Link-Audit/1.0"})
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as response:
            return response.status
    except urllib.error.HTTPError as exc:
        if exc.code == 405:
            request = urllib.request.Request(url, headers={"User-Agent": "EEP-Link-Audit/1.0"})
            with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as response:
                return response.status
        return exc.code
    except Exception:
        return 0


def main() -> int:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    changed = False
    now = datetime.now(timezone.utc).isoformat()

    for document in manifest.get("documents", []):
        chain = document.get("source_chain", [])
        for source in chain:
            url = source.get("url", "")
            if not url or url.startswith("internal://"):
                continue
            status = check_url(url)
            source["last_checked_at"] = now
            source["last_status"] = status
            if status == 404:
                source["status"] = "dead"
                mirrors = [
                    candidate for candidate in chain
                    if candidate is not source
                    and candidate.get("url")
                    and not candidate.get("url", "").startswith("internal://")
                    and check_url(candidate["url"]) in range(200, 400)
                ]
                if mirrors:
                    source["mirror_url"] = mirrors[0]["url"]
                    source["repair_note"] = f"Promoted trusted mirror from {mirrors[0]['provider']}"
                changed = True

    if changed:
        MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
        print("Dead links repaired in law-library manifest.")
    else:
        print("No dead links found in law-library manifest.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
