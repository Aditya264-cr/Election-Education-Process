"""Internal Law Library retrieval and cache layer."""
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional


LAW_LIBRARY_ROOT = Path(__file__).resolve().parents[2] / "law_library"
MANIFEST_PATH = LAW_LIBRARY_ROOT / "manifest.json"


def _load_manifest() -> dict:
    with MANIFEST_PATH.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def _save_manifest(manifest: dict) -> None:
    with MANIFEST_PATH.open("w", encoding="utf-8") as handle:
        json.dump(manifest, handle, indent=2)
        handle.write("\n")


def _normalize(value: str) -> str:
    return " ".join(value.lower().replace("-", " ").split())


def list_documents() -> list[dict]:
    manifest = _load_manifest()
    return [
        {
            "id": doc["id"],
            "title": doc["title"],
            "kind": doc["kind"],
            "section": doc.get("section"),
            "cached": True,
            "highlight": doc.get("highlight"),
            "neighborly_summary": doc.get("neighborly_summary"),
        }
        for doc in manifest.get("documents", [])
    ]


def resolve_document(query: str) -> Optional[dict]:
    manifest = _load_manifest()
    normalized = _normalize(query)
    for doc in manifest.get("documents", []):
        candidates = [doc.get("id", ""), doc.get("canonical_query", ""), doc.get("title", "")]
        candidates.extend(doc.get("aliases", []))
        if normalized in {_normalize(candidate) for candidate in candidates}:
            return doc
    for doc in manifest.get("documents", []):
        if normalized and normalized in _normalize(" ".join([doc.get("title", ""), *doc.get("aliases", [])])):
            return doc
    return None


def get_document(document_id_or_query: str) -> Optional[dict]:
    doc = resolve_document(document_id_or_query)
    if not doc:
        return None

    local_path = LAW_LIBRARY_ROOT / doc["local_path"]
    if not local_path.is_file():
        return None

    return {
        "id": doc["id"],
        "title": doc["title"],
        "kind": doc["kind"],
        "section": doc.get("section"),
        "highlight": doc.get("highlight"),
        "content": local_path.read_text(encoding="utf-8"),
        "neighborly_summary": doc.get("neighborly_summary"),
        "source_chain": doc.get("source_chain", []),
        "provider_order": _load_manifest().get("provider_order", []),
        "cache": {
            "status": "hit",
            "storage_backend": _load_manifest().get("storage_backend"),
            "local_path": str(local_path.relative_to(LAW_LIBRARY_ROOT)),
        },
    }


def ingest_document(query: str) -> Optional[dict]:
    """
    Simulates multi-source document retrieval and ingestion.
    In a production system, this would use crawlers for India Code, Indian Kanoon, and PRS.
    """
    normalized = _normalize(query)
    
    # Check if we already have it
    existing = resolve_document(query)
    if existing:
        return get_document(existing["id"])

    # Simulation for 'ECI Instructions' or similar
    if "eci" in normalized and ("instruction" in normalized or "manual" in normalized):
        doc_id = "eci-instructions-2024"
        title = "ECI Instructions on Conduct of Elections (2024)"
        content = """# ECI Instructions on Conduct of Elections (2024)

## Chapter 1: Polling Station Arrangements

<mark id="eci-sec-1-2">Every polling station shall have a ramp for persons with disabilities (PwDs) and senior citizens. The slope of the ramp should not exceed 1:12.</mark>

## Neighborly Summary
This ensures that everyone, especially our elders and neighbors with special needs, can reach the voting booth comfortably. No one should be left behind!
"""
        neighborly_summary = "Rules ensuring polling stations are accessible and welcoming for everyone, especially those who need a bit of extra help."
        local_path = "eci/instructions_2024.md"
        
        # Save file
        full_path = LAW_LIBRARY_ROOT / local_path
        full_path.parent.mkdir(parents=True, exist_ok=True)
        full_path.write_text(content, encoding="utf-8")
        
        # Update Manifest
        manifest = _load_manifest()
        new_doc = {
            "id": doc_id,
            "canonical_query": "eci instructions",
            "aliases": ["eci manual", "election commission instructions"],
            "title": title,
            "kind": "eci_instruction",
            "section": "1.2",
            "highlight": "eci-sec-1-2",
            "local_path": local_path,
            "neighborly_summary": neighborly_summary,
            "source_chain": [
                {
                    "provider": "india_code",
                    "status": "not_found",
                    "url": "https://www.legislative.gov.in/"
                },
                {
                    "provider": "indian_kanoon",
                    "status": "not_found",
                    "url": "https://indiankanoon.org/"
                },
                {
                    "provider": "eci_official",
                    "status": "cached",
                    "url": "https://eci.gov.in/files/file/15655-manual-on-conduct-of-elections/",
                    "retrieved_at": datetime.now(timezone.utc).isoformat()
                }
            ]
        }
        manifest["documents"].append(new_doc)
        _save_manifest(manifest)
        
        return get_document(doc_id)

    return None


def get_retrieval_plan(query: str) -> dict:
    manifest = _load_manifest()
    doc = resolve_document(query)
    return {
        "query": query,
        "provider_order": manifest.get("provider_order", []),
        "cached": bool(doc),
        "document_id": doc.get("id") if doc else None,
        "source_chain": doc.get("source_chain", []) if doc else [],
    }
