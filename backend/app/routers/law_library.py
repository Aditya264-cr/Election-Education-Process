"""Internal Law Library Router."""
from fastapi import APIRouter, HTTPException, Query

from app.agents.law_library import get_document, get_retrieval_plan, list_documents, ingest_document


router = APIRouter()


@router.get("/documents")
async def documents():
    return {"documents": list_documents()}


@router.get("/documents/{document_id}")
async def document(document_id: str):
    result = get_document(document_id)
    if not result:
        raise HTTPException(status_code=404, detail="Document not found in Internal Law Library")
    return result


@router.get("/retrieve")
async def retrieve(query: str = Query(..., min_length=2)):
    plan = get_retrieval_plan(query)
    if not plan["cached"]:
        # Attempt ingestion
        result = ingest_document(query)
        if result:
            return {
                **plan,
                "status": "cached",
                "document": result,
                "message": "Document was retrieved from external sources and cached.",
            }
        return {
            **plan,
            "message": "Document is not cached yet and could not be found in known sources.",
            "status": "needs_ingestion",
        }
    result = get_document(plan["document_id"])
    return {
        **plan,
        "status": "cached",
        "document": result,
    }
