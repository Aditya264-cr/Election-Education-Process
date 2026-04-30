"""Internal Law Library retrieval and cache layer."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Optional


LAW_LIBRARY_ROOT = Path(__file__).resolve().parents[2] / "law_library"
MANIFEST_PATH = LAW_LIBRARY_ROOT / "manifest.json"


def _load_manifest() -> dict:
    with MANIFEST_PATH.open("r", encoding="utf-8") as handle:
        return json.load(handle)


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
