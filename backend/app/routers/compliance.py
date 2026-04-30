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


class EvaluateRuleRequest(BaseModel):
    facts: dict


@router.post("/verify-claim")
async def verify_claim(payload: VerifyClaimRequest):
    return auditor.verify_claim(payload.claim_id)


@router.post("/verify-text")
async def verify_text(payload: VerifyTextRequest):
    gazette_status = auditor.latest_gazette_status(payload.gazette_last_checked_iso)
    if gazette_status.get("blocked"):
        return gazette_status
    hard_match = auditor.hard_match_text(payload.text)
    if hard_match:
        return hard_match
    return auditor.verify_text(payload.text)


@router.post("/evaluate-rule")
async def evaluate_rule(payload: EvaluateRuleRequest):
    return auditor.evaluate_rule(payload.facts)


@router.get("/accuracy-report")
async def accuracy_report():
    return auditor.get_accuracy_report()
