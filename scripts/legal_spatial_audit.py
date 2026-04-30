"""Legal and spatial audit gate for CI.

The script is intentionally conservative:
- Every map polygon must carry LGD and AC identifiers.
- Polygon LGD/AC identity must match the backend database before booth data is allowed.
- Every symbolic legal rule must carry source metadata and source IDs.
- West Bengal stress testing requires an official feed snapshot; no snapshot means no auto-patch.
"""
from __future__ import annotations

import importlib.util
import ast
import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
GEOJSON = ROOT / "frontend" / "src" / "data" / "india_pc_2019.json"
COMPLIANCE = ROOT / "backend" / "app" / "agents" / "constitutional_compliance.py"
MAP_MAKER = ROOT / "backend" / "app" / "agents" / "map_maker.py"
WB_SNAPSHOT = ROOT / "backend" / "data" / "official_wb_phase2_feed.json"


def load_module(path: Path, name: str):
    spec = importlib.util.spec_from_file_location(name, path)
    if not spec or not spec.loader:
        raise RuntimeError(f"Cannot load {path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


def fail(message: str, errors: list[str]) -> None:
    errors.append(message)


def audit_spatial(errors: list[str]) -> None:
    geojson = json.loads(GEOJSON.read_text(encoding="utf-8"))
    database = load_map_database()

    for idx, feature in enumerate(geojson.get("features", []), start=1):
        props = feature.get("properties", {})
        label = props.get("pc_name", f"feature #{idx}")
        for field in ("lgd_code", "ac_no", "pc_no", "pc_name", "state"):
            if props.get(field) in (None, ""):
                fail(f"{label}: missing required spatial field {field}", errors)

        record = database.get((props.get("pc_name"), props.get("pc_no")))
        if not record:
            fail(f"{label}: no backend database row for PC identity", errors)
            continue
        if props.get("lgd_code") != record.get("lgd_code"):
            fail(f"{label}: polygon LGD does not match backend database LGD", errors)
        if props.get("ac_no") != record.get("ac_no"):
            fail(f"{label}: polygon AC number does not match backend database AC number", errors)


def load_map_database() -> dict[tuple[str, int], dict]:
    tree = ast.parse(MAP_MAKER.read_text(encoding="utf-8"))
    rows: dict[tuple[str, int], dict] = {}
    for node in ast.walk(tree):
        if not isinstance(node, ast.Call):
            continue
        func_name = getattr(node.func, "id", "")
        if func_name != "ConstituencyResult":
            continue
        row = {
            kw.arg: ast.literal_eval(kw.value)
            for kw in node.keywords
            if kw.arg is not None
        }
        rows[(row["pc_name"], row["pc_no"])] = row
    return rows


def audit_legal(errors: list[str]) -> None:
    compliance = load_module(COMPLIANCE, "audit_compliance")
    sources = compliance.VERIFIED_SOURCES

    for rule_id, rule in compliance.LEGAL_RULES.items():
        if not rule.get("if") or not rule.get("then"):
            fail(f"{rule_id}: rule must contain if/then blocks", errors)
        metadata = rule.get("source_metadata") or {}
        for field in ("authority", "paragraph", "excerpt"):
            if not metadata.get(field):
                fail(f"{rule_id}: source metadata missing {field}", errors)
        for source_id in rule.get("source_ids", []):
            if source_id not in sources:
                fail(f"{rule_id}: unknown source id {source_id}", errors)

    agent = compliance.ConstitutionalComplianceAgent()
    red_team = {
        "claims_no_id_needed": True,
    }
    result = agent.evaluate_rule(red_team)
    if result.get("action") != "CORRECTION":
        fail("red-team no-ID prompt was not intercepted by the legal rule engine", errors)


def audit_west_bengal_feed(errors: list[str]) -> None:
    if not WB_SNAPSHOT.exists():
        return
    snapshot = json.loads(WB_SNAPSHOT.read_text(encoding="utf-8"))
    if snapshot.get("source_type") != "official":
        fail("West Bengal feed snapshot must be marked source_type=official", errors)
    if not snapshot.get("source_url", "").startswith(("https://www.eci.gov.in", "https://voters.eci.gov.in")):
        fail("West Bengal feed snapshot must come from an official ECI URL", errors)
    for booth in snapshot.get("booths", []):
        for field in ("ac_no", "lgd_code", "polling_station_id", "timing", "sensitive_status"):
            if booth.get(field) in (None, ""):
                fail(f"WB booth {booth.get('polling_station_id', '<unknown>')}: missing {field}", errors)


def main() -> int:
    errors: list[str] = []
    audit_spatial(errors)
    audit_legal(errors)
    audit_west_bengal_feed(errors)
    if errors:
        print("Legal & Spatial audit failed:")
        for error in errors:
            print(f"- {error}")
        return 1
    print("Legal & Spatial audit passed.")
    if not WB_SNAPSHOT.exists():
        print("West Bengal live stress test skipped: no official ECI/Voter Helpline snapshot was provided.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
