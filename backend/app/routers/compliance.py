"""Constitutional Compliance Router."""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from app.agents.constitutional_compliance import ConstitutionalComplianceAgent

router = APIRouter()
auditor = ConstitutionalComplianceAgent()


class VerifyClaimRequest(BaseModel):
    claim_id: str


class VerifyTextRequest(BaseModel):
    text: str
    gazette_last_checked_iso: Optional[str] = None


@router.post("/verify-claim")
async def verify_claim(payload: VerifyClaimRequest):
    return auditor.verify_claim(payload.claim_id)


@router.post("/verify-text")
async def verify_text(payload: VerifyTextRequest):
    gazette_status = auditor.latest_gazette_status(payload.gazette_last_checked_iso)
    if gazette_status.get("blocked"):
        return gazette_status
    return auditor.verify_text(payload.text)


@router.get("/accuracy-report")
async def accuracy_report():
    return auditor.get_accuracy_report()
